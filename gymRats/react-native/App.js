import 'react-native-gesture-handler';
import React, { useRef, useState, useEffect } from 'react';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';
import { AUTHENTICATION_TOKEN_KEY } from './global';
import { Alert, AppState, Button, Platform, Text } from 'react-native';
import ApiRequests from "./app/classes/ApiRequests";
import { ABTesting, campaigns } from './app/classes/ABTesting';

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './app/screens/Splash/Splash';
import { NavigationRoutes, Auth } from './app/navigation/navigation';
import { useFonts } from 'expo-font';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import translations from './translations';
import socket from './app/classes/Socket';
import * as Linking from 'expo-linking';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

const prefix = Linking.createURL('/');

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const linking = {
    prefixes: ["gymrats://"],
  };
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [chatNotification, setChatNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Linking.addEventListener('url', (event) => {
      let data = event.url;
      Alert.alert("URLA", data.toString());
    });
    Linking.getInitialURL().then((url) => {
      Alert.alert("URLA", url);
    })
    socket.initConnection();
    const subscription = AppState.addEventListener("change", async nextAppState => {
      if (nextAppState == 'background') {
        const navAnalytics = await AsyncStorage.getItem('@gymRats:navAnalytics');
        if (navAnalytics) {
          const navigationAnalytics = JSON.parse(navAnalytics);
          ApiRequests.post("analytics/navigation", {}, { navigationAnalytics }, false).then(() => {
            AsyncStorage.setItem('@gymRats:navAnalytics', "[]");
          }).catch((error) => {
            throw new Error(error);
          })
        }
      }
    });

    initABTestingCampaigns();

    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      AsyncStorage.setItem("@gymRats:expoPushToken", token);
    })
    /*
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log(notification.request.content.data.chatId)
          if (notification && notification.request.content.data.chatId) {
            console.log("smenih go na true vuv app.js");
            setChatNotification(true)
          }
          setNotification(notification);
        });
    */
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("notification response", response);
      if (response.notification && response.notification.request
        && response.notification.request.content && response.notification.request.content.data
        && response.notification.request.content.data.chatId) {
        console.log("tukaaa sum za redirect kum chats")
      }
    });

    return () => {
      if (subscription) subscription.remove();
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const initABTestingCampaigns = () => {
    Object.keys(campaigns).forEach(async campaign => {
      if (!(await ABTesting.getBucketByCampaign(campaign))) {
        await ABTesting.assignBucketByCampaign(campaign);
      }
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log("lkasdklasjdlkasjdlkjasdlkjalkdhaksd", existingStatus)
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }


  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef();
  const [screenOpenDt, setScreenOpenDt] = useState(new Date().getTime());

  i18n.defaultLocale = "en";
  i18n.translations = translations;
  i18n.locale = Localization.locale;
  i18n.fallbacks = true;

  const [loaded] = useFonts({
    Logo: require("./assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
    MainLight: require('./assets/fonts/Montserrat/static/Montserrat-Light.ttf'),
    MainMedium: require('./assets/fonts/Montserrat/static/Montserrat-Medium.ttf'),
    MainBlack: require('./assets/fonts/Montserrat/static/Montserrat-Black.ttf'),
    MainBold: require('./assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
    MainRegular: require('./assets/fonts/Montserrat/static/Montserrat-Regular.ttf')
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer
      linking={linking} fallback={<Text>Loading...</Text>}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.getCurrentRoute().name;
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

        if (currentRouteName == "Chats") {
          console.log("resetting chat notification to false");
          setChatNotification(false);
        }
        routeNameRef.current = currentRouteName;
      }}>
      <Stack.Navigator initialRouteName="Splash" chatNotification={chatNotification}>
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
    </NavigationContainer>
  );
};

export default App;
