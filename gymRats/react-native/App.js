import 'react-native-gesture-handler';
import React, { useRef, useState, useEffect } from 'react';
import { default as AsyncStorage } from '@react-native-async-storage/async-storage';
import { AUTHENTICATION_TOKEN_KEY } from './global';
import { AppState } from 'react-native';
import ApiRequests from "./app/classes/ApiRequests";

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './app/screens/Splash/Splash';
import { NavigationRoutes, Auth } from './app/navigation/navigation';
import { useFonts } from 'expo-font';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import translations from './translations';
import socket from './app/classes/Socket';


const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
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

    return () => {
      subscription.remove();
    };
  }, []);

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
        routeNameRef.current = currentRouteName;
      }}>
      <Stack.Navigator initialRouteName="Splash">
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
