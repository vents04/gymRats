import 'react-native-gesture-handler';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './app/screens/Splash/Splash';
import { NavigationRoutes, Auth } from './app/navigation/navigation';
import { useFonts } from 'expo-font';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import translations from './translations';


const Stack = createStackNavigator();

const App = () => {

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
    <NavigationContainer>
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
