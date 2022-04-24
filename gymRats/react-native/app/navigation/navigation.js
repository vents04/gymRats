import React from 'react';
import { Text, View } from 'react-native';

import i18n from 'i18n-js';

import { SHOW_MAIN_TAB_NAVIGATION_ON_SCREENS } from '../../global';

import styles from './navigation.styles.js';

// Navigation //
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Icons //
import { BiCalendar, BiUserCircle, BiMessageSquareDetail } from 'react-icons/bi';
import { GiRat } from 'react-icons/gi';

// Screens //
import Login from '../screens/Login/Login';
import Signup from '../screens/Signup/Signup';
import Calendar from '../screens/Calendar/Calendar';
import Profile from '../screens/Profile/Profile';
import ProfileDetailsEdit from '../screens/ProfileDetailsEdit/ProfileDetailsEdit';
import WeightTracker from '../screens/cards/WeightTracker/WeightTracker';
import Logbook from '../screens/cards/Logbook/Logbook';
import ExerciseSearch from '../screens/cards/ExerciseSearch/ExerciseSearch';
import Coaching from '../screens/Coaching/Coaching';
import CoachingApplicationSubmission from '../screens/CoachingApplicationSubmission/CoachingApplicationSubmission';
import CoachSearch from '../screens/CoachSearch/CoachSearch';
import CoachPage from '../screens/CoachPage/CoachPage';
import Chats from '../screens/Chats/Chats';
import Chat from '../screens/Chat/Chat';
import CoachRequests from '../screens/CoachRequests/CoachRequests';
import CoachProfileEdit from '../screens/CoachProfileEdit/CoachProfileEdit';
import CaloriesIntake from '../screens/cards/CaloriesIntake/CaloriesIntake';
import SearchCaloriesIntake from '../screens/cards/SearchCaloriesIntake/SearchCaloriesIntake';
import AddCaloriesIntakeItem from '../screens/cards/AddCaloriesIntakeItem/AddCaloriesIntakeItem';
import BarcodeReader from '../screens/BarcodeReader/BarcodeReader';
import AddFood from '../screens/cards/AddFood/AddFood';
import Client from '../screens/Client/Client';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const getTabBarVisibility = route => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Calendar";

    const match = Object.values(SHOW_MAIN_TAB_NAVIGATION_ON_SCREENS).find(element => {
        if (element == routeName) return true;
    });

    return match ? 'flex' : 'none';
};

const calendarScreenStack = () => {
    return (
        <Stack.Navigator initialRouteName="Calendar">
            <Stack.Screen
                name="Calendar"
                options={{
                    headerShown: false
                }}
                component={Calendar}
            />
            <Stack.Screen
                name="WeightTracker"
                options={{
                    headerShown: false
                }}
                component={WeightTracker}
            />
            <Stack.Screen
                name="Logbook"
                options={{
                    headerShown: false
                }}
                component={Logbook}
            />
            <Stack.Screen
                name="ExerciseSearch"
                options={{
                    headerShown: false
                }}
                component={ExerciseSearch}
            />
            <Stack.Screen
                name="CaloriesIntake"
                options={{
                    headerShown: false
                }}
                component={CaloriesIntake}
            />
            <Stack.Screen
                name="SearchCaloriesIntake"
                options={{
                    headerShown: false
                }}
                component={SearchCaloriesIntake}
            />
            <Stack.Screen
                name="AddCaloriesIntakeItem"
                options={{
                    headerShown: false
                }}
                component={AddCaloriesIntakeItem}
            />
            <Stack.Screen
                name="BarcodeReader"
                options={{
                    headerShown: false
                }}
                component={BarcodeReader}
            />
            <Stack.Screen
                name="AddFood"
                options={{
                    headerShown: false
                }}
                component={AddFood}
            />
        </Stack.Navigator>
    );
};

const coachingScreenStack = () => {
    return (
        <Stack.Navigator initialRouteName="Coaching">
            <Stack.Screen
                name="Coaching"
                options={{
                    headerShown: false
                }}
                component={Coaching}
            />
            <Stack.Screen
                name="CoachingApplicationSubmission"
                options={{
                    headerShown: false
                }}
                component={CoachingApplicationSubmission}
            />
            <Stack.Screen
                name="CoachSearch"
                options={{
                    headerShown: false
                }}
                component={CoachSearch}
            />
            <Stack.Screen
                name="CoachPage"
                options={{
                    headerShown: false
                }}
                component={CoachPage}
            />
            <Stack.Screen
                name="CoachRequests"
                options={{
                    headerShown: false
                }}
                component={CoachRequests}
            />
            <Stack.Screen
                name="CoachProfileEdit"
                options={{
                    headerShown: false
                }}
                component={CoachProfileEdit}
            />
            <Stack.Screen
                name="Client"
                options={{
                    headerShown: false
                }}
                component={Client}
            />
        </Stack.Navigator>
    )
};

const chatsScreenStack = () => {
    return (
        <Stack.Navigator initialRouteName="Chats">
            <Stack.Screen
                name="Chats"
                options={{
                    headerShown: false,
                }}
                component={Chats}
            />
            <Stack.Screen
                name="Chat"
                options={{
                    headerShown: false
                }}
                component={Chat}
            />
        </Stack.Navigator>
    )
};

const profileScreenStack = () => {
    return (
        <Stack.Navigator initialRouteName="Profile">
            <Stack.Screen
                name="Profile"
                options={{
                    headerShown: false
                }}
                component={Profile}
            />
            <Stack.Screen
                name="ProfileDetailsEdit"
                options={{
                    headerShown: false
                }}
                component={ProfileDetailsEdit}
            />
        </Stack.Navigator>
    )
};

const Auth = () => {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

const NavigationRoutes = () => {
    return (
        <Tab.Navigator
            screenOptions={() => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    display: 'flex',
                    position: 'absolute',
                    bottom: 0,
                    elevation: 0,
                    borderColor: "#ddd",
                    height: 75,
                    ...styles.shadow
                },
            })}
        >
            <Tab.Screen
                name="calendarScreenStack"
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        height: 75,
                    },
                    tabBarLabel: 'Calendar',
                    headerShown: false,
                    tabBarActiveTintColor: "#ccc",
                    tabBarIcon: (tabInfo) =>
                    (
                        <View style={styles.tabBarIconContainer}>
                            <BiCalendar
                                size={30}
                                color={tabInfo.focused ? "#1f6cb0" : "#ccc"}
                            />
                            <Text style={[styles.tabBarIconText, {
                                fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                            }]}>{i18n.t('navigation')['calendar']}</Text>
                        </View>
                    )

                })}
                component={calendarScreenStack}
            />
            <Tab.Screen
                name="coachingScreenStack"
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        height: 75,
                    },
                    tabBarLabel: 'Coaching',
                    headerShown: false,
                    tabBarActiveTintColor: "#ccc",
                    tabBarIcon: (tabInfo) =>
                    (
                        <View style={styles.tabBarIconContainer}>
                            <GiRat
                                size={30}
                                color={tabInfo.focused ? "#1f6cb0" : "#ccc"}
                            />
                            <Text style={[styles.tabBarIconText, {
                                fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                            }]}>{i18n.t('navigation')['coaching']}</Text>
                        </View>
                    )

                })}
                component={coachingScreenStack}
            />
            <Tab.Screen
                name="chatsScreenStack"
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        height: 75,
                    },
                    tabBarLabel: 'Chats',
                    headerShown: false,
                    tabBarActiveTintColor: "#ccc",
                    tabBarIcon: (tabInfo) =>
                    (
                        <View style={styles.tabBarIconContainer}>
                            <BiMessageSquareDetail
                                size={30}
                                color={tabInfo.focused ? "#1f6cb0" : "#ccc"}
                            />
                            <Text style={[styles.tabBarIconText, {
                                fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                            }]}>{i18n.t('navigation')['chats']}</Text>
                        </View>
                    )
                })}
                component={chatsScreenStack}
            />
            <Tab.Screen
                name="profileScreenStack"
                options={({ route }) => ({
                    tabBarStyle: {
                        display: getTabBarVisibility(route),
                        height: 75,
                    },
                    tabBarLabel: 'Profile',
                    headerShown: false,
                    tabBarActiveTintColor: "#ccc",
                    tabBarIcon: (tabInfo) =>
                    (
                        <View style={styles.tabBarIconContainer}>
                            <BiUserCircle
                                size={30}
                                color={tabInfo.focused ? "#1f6cb0" : "#ccc"}
                            />
                            <Text style={[styles.tabBarIconText, {
                                fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                            }]}>{i18n.t('navigation')['profile']}</Text>
                        </View>
                    )
                })}
                component={profileScreenStack}
            />
        </Tab.Navigator>
    );
};

export { NavigationRoutes, Auth };