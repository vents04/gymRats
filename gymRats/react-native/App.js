import React, { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './app/screens/Splash/Splash';
import { NavigationRoutes, Auth } from './app/navigation/navigation';
import { useFonts } from 'expo-font';
import { BackHandler } from 'react-native';

const Stack = createStackNavigator();

const App = () => {

  const [loaded] = useFonts({
    Logo: require("./assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf"),
    SpartanLight: require('./assets/fonts/Spartan/Spartan-Light.ttf'),
    SpartanMedium: require('./assets/fonts/Spartan/Spartan-Medium.ttf'),
    SpartanBlack: require('./assets/fonts/Spartan/Spartan-Black.ttf'),
    SpartanBold: require('./assets/fonts/Spartan/Spartan-Bold.ttf'),
    SpartanRegular: require('./assets/fonts/Spartan/Spartan-Regular.ttf')
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
