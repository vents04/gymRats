import 'react-native-gesture-handler';
import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';
import { AUTHENTICATION_TOKEN_KEY } from './global';
import { AppState, Platform, Text } from 'react-native';
import ApiRequests from "./app/classes/ApiRequests";
import { ABTesting, campaigns } from './app/classes/ABTesting';

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './app/screens/Splash/Splash';
import { NavigationRoutes, Auth } from './app/navigation/navigation';
import { useFonts } from 'expo-font';
import * as Localization from 'expo-localization';
import socketClass from './app/classes/Socket';
import User from './app/classes/User';
import i18n from 'i18n-js';
import translations from './translations';
import * as Linking from 'expo-linking';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import NoNetwork from './app/screens/NoNetwork/NoNetwork';

const Stack = createStackNavigator();

const App = (props) => {
  let linkingListener, appStateListener, netInfoListener;

  const [hasNetworkConnection, setHasNetworkConnection] = useState(true);

  const linking = {
    prefix: ["gymrats://", "exp://"],
    config: {
      screens: {
        CoachPage: "coach-profile",
        Progress: "friends-link"
      }
    }
  }

  useEffect(async () => {
    initLinkingListener();
    initAppStateListener();
    initNetInfoListener();
    initABTestingCampaigns();
    registerForPushNotificationsAsync();

    return () => {
      if (linkingListener) linkingListener.remove();
      if (appStateListener) appStateListener.remove();
      if (netInfoListener) netInfoListener();
    };
  }, []);

  const initLinkingListener = () => {
    linkingListener = Linking.addEventListener('url', async (event) => {
      let data = event.url;
      if (hasNetworkConnection) {
        if (data.includes('coach-profile/')) {
          let coachId = data.split('/coach-profile/')[1];
          ApiRequests.get("coaching/coach/" + coachId).then((response) => {
            if (navigationRef.current && navigationRef.current.isReady()) {
              navigationRef.current.navigate("NavigationRoutes", { screen: "coachingScreenStack", params: { screen: "CoachPage", params: { coach: response.data.coach } } })
            }
          }).catch((error) => {
            console.log(error)
          })
        } else if (data.includes('friends-link/')) {
          let linkId = data.split('/friends-link/')[1];
          console.log(linkId)
          ApiRequests.get("user/friends-link/" + linkId).then((response) => {
            console.log(response.data)
            if (navigationRef.current && navigationRef.current.isReady() && response.data.user) {
              navigationRef.current.navigate("NavigationRoutes", { screen: "progressScreenStack", params: { screen: "Progress", params: { userFromFriendsLink: response.data.user } } })
            }
          }).catch((error) => {
            console.log(error);
          })
        }
      }
    });
  }

  const initAppStateListener = () => {
    appStateListener = AppState.addEventListener("change", async nextAppState => {
      if (hasNetworkConnection) {
        if (nextAppState == 'background') {
          let chatsRoomSocket = socketClass.getChatsRoomSocket();
          if (chatsRoomSocket) {
            socketClass.getChatsRoomSocket().emit("disconnectUser")
            socketClass.setChatsRoomSocket(null);
          }

          const navAnalytics = await AsyncStorage.getItem('@gymRats:navAnalytics');
          if (navAnalytics) {
            const navigationAnalytics = JSON.parse(navAnalytics);
            ApiRequests.post("analytics/navigation", {}, { navigationAnalytics }, false).then(() => {
              AsyncStorage.setItem('@gymRats:navAnalytics', "[]");
            }).catch((error) => { })
          }
        } else if (nextAppState == 'active') {
          const token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
          const validation = await User.validateToken()

          if (token && validation.valid) {
            let chatsRoomSocket = socketClass.getChatsRoomSocket();
            if (!chatsRoomSocket) {
              chatsRoomSocket = socketClass.initConnection();
              socketClass.setChatsRoomSocket(chatsRoomSocket);
            }
            socketClass.joinChatsRoom();
          }
        }
      }
    });
  }

  const initNetInfoListener = () => {
    netInfoListener = NetInfo.addEventListener(state => {
      setHasNetworkConnection(state.isConnected);
      console.log("is connected:", state.isConnected)
    });
  }

  const initABTestingCampaigns = () => {
    Object.keys(campaigns).forEach(async campaign => {
      if (!(await ABTesting.getBucketByCampaign(campaign))) {
        await ABTesting.assignBucketByCampaign(campaign);
      }
    });
  }

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Device.isDevice) {
      let settings = await Notifications.getPermissionsAsync();
      let isAllowedToSendNotifications = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      if (!isAllowedToSendNotifications) {
        settings = await Notifications.requestPermissionsAsync();
        isAllowedToSendNotifications = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
        if (!isAllowedToSendNotifications) {
          console.log("Failed to register for push notifications");
          return;
        }
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      if (token) await AsyncStorage.setItem("@gymRats:expoPushToken", token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();
  const [screenOpenDt, setScreenOpenDt] = useState(new Date().getTime());

  i18n.defaultLocale = "bg-BG";
  i18n.translations = translations;
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;

  const [loaded] = useFonts({
    Logo: require("./assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
    MainLight: require('./assets/fonts/Montserrat/static/Montserrat-Light.ttf'),
    MainMedium: require('./assets/fonts/Montserrat/static/Montserrat-Medium.ttf'),
    MainSemiBold: require('./assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf'),
    MainBlack: require('./assets/fonts/Montserrat/static/Montserrat-Black.ttf'),
    MainBold: require('./assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    MainRegular: require('./assets/fonts/Montserrat/static/Montserrat-Regular.ttf')
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        linking={linking}
        fallback={<Text>Loading...</Text>}
        ref={navigationRef}
        onReady={async () => {
          routeNameRef.current = navigationRef.getCurrentRoute().name;
          const initialUrl = await Linking.getInitialURL()
          if (hasNetworkConnection) {
            if (initialUrl) {
              if (initialUrl.includes("coach-profile/")) {
                let coachId = initialUrl.split('/coach-profile/')[1];
                ApiRequests.get("coaching/coach/" + coachId).then((response) => {
                  navigationRef.current.addListener("state", (state) => {
                    if (state.data && state.data.state) {
                      navigationRef.current.navigate("NavigationRoutes", { screen: "coachingScreenStack", params: { screen: "CoachPage", params: { coach: response.data.coach } } })
                      navigationRef.removeListener("state");
                    }
                  })
                }).catch((error) => {
                  console.log(error)
                })
              } else if (initialUrl.includes("friends-link/")) {
                let linkId = initialUrl.split('/friends-link/')[1];
                ApiRequests.get("user/friends-link/" + linkId).then((response) => {
                  console.log(response.data.user);
                  navigationRef.current.addListener("state", (state) => {
                    if (state.data && state.data.state && response.data.user) {
                      console.log("dkjaskjdla", navigationRef.current.isReady())
                      navigationRef.current.navigate("NavigationRoutes", { screen: "progressScreenStack", params: { screen: "Progress", params: { userFromFriendsLink: response.data.user } } })
                      navigationRef.removeListener("state");
                    }
                  })
                }).catch((error) => {
                  console.log(error)
                })
              }
            }
          }
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            if (previousRouteName != "Splash") {
              const previousScreenData = {
                name: previousRouteName,
                time: new Date().getTime() - screenOpenDt,
                toDt: new Date().getTime(),
                token: null
              }
              let currentNavAnalytics = await AsyncStorage.getItem('@gymRats:navAnalytics');
              if (currentNavAnalytics) {
                currentNavAnalytics = JSON.parse(currentNavAnalytics);
                currentNavAnalytics.push(previousScreenData);
              } else {
                currentNavAnalytics = [previousScreenData];
              }
              let token = await AsyncStorage.getItem(AUTHENTICATION_TOKEN_KEY);
              if (token) previousScreenData.token = token;
              await AsyncStorage.setItem('@gymRats:navAnalytics', JSON.stringify(currentNavAnalytics));
            }
            setScreenOpenDt(new Date().getTime());
          }
          routeNameRef.current = currentRouteName;
        }}>
        {
          hasNetworkConnection
            ? <Stack.Navigator initialRouteName="Splash">
              <Stack.Screen
                name="Splash"
                component={Splash}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Auth"
                component={Auth}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="NavigationRoutes"
                component={NavigationRoutes}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
            : <Stack.Navigator initialRouteName="NoNetwork">
              <Stack.Screen
                name="NoNetwork"
                component={NoNetwork}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
        }
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
