import React from 'react';
import { Dimensions, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import i18n from 'i18n-js';

import { SHOW_MAIN_TAB_NAVIGATION_ON_SCREENS } from '../../global';

import styles from './navigation.styles.js';

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

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
import Suggestions from '../screens/Suggestions/Suggestions';
import PostReview from '../screens/PostReview/PostReview';
import Progress from '../screens/Progress/Progress';
import AddUnknownCaloriesIntake from '../screens/cards/AddUnknownCaloriesIntake/AddUnknownCaloriesIntake';
import ManageWorkoutTemplates from '../screens/cards/ManageWorkoutTemplates/ManageWorkoutTemplates';
import { Badge } from 'react-native-elements';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import FilePreview from '../screens/FilePreview/FilePreview';
import PasswordRecovery from '../screens/PasswordRecovery/PasswordRecovery';
import EmailVerification from '../screens/EmailVerification/EmailVerification';

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
                name="ManageWorkoutTemplates"
                options={{
                    headerShown: false
                }}
                component={ManageWorkoutTemplates}
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
            <Stack.Screen
                name="AddUnknownCaloriesIntake"
                options={{
                    headerShown: false
                }}
                component={AddUnknownCaloriesIntake}
            />
        </Stack.Navigator>
    );
};

const progressScreenStack = () => {
    return (
        <Stack.Navigator initialRouteName="Progress">
            <Stack.Screen
                name="Progress"
                options={{
                    headerShown: false
                }}
                component={Progress}
            />
        </Stack.Navigator>
    )
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
                path="coach-profile"
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
            <Stack.Screen
                name="PostReview"
                options={{
                    headerShown: false
                }}
                component={PostReview}
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
            <Stack.Screen
                name="FilePreview"
                options={{
                    headerShown: false
                }}
                component={FilePreview}
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
            <Stack.Screen
                name="Suggestions"
                options={{
                    headerShown: false,
                }}
                component={Suggestions}
            />
        </Stack.Navigator>
    )
};

const Auth = (props) => {
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
                name="Login"
                component={Login}
                initialParams={{
                    email: props.route && props.route.params && props.route.params.hasUnverifiedEmail ? props.route.params.email : null,
                }}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PasswordRecovery"
                component={PasswordRecovery}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EmailVerification"
                component={EmailVerification}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

const NavigationRoutes = (props) => {
    const responseListener = useRef();

    useEffect(() => {
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            if (response.notification && response.notification.request
                && response.notification.request.content && response.notification.request.content.data
                && response.notification.request.content.data.chatId) {
                props.navigation.navigate("Chats", { chatId: response.notification.request.content.data.chatId })
            }
        });
    }, []);

    return (
        <SafeAreaView style={{ flexGrow: 1, backgroundColor: "white" }}>
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
                        ...styles.shadow,
                    },
                })}>
                <Tab.Screen
                    name="calendarScreenStack"
                    options={({ route }) => ({
                        tabBarStyle: {
                            display: getTabBarVisibility(route),
                            height: getTabBarVisibility(route) == "flex" ? 75 : 0,
                            paddingTop: Platform.OS == "ios" ? 25 : 0,
                        },
                        tabBarLabel: 'Calendar',
                        headerShown: false,
                        tabBarActiveTintColor: "#ccc",
                        tabBarIcon: (tabInfo) =>
                        (
                            <View style={styles.tabBarIconContainer}>
                                <Ionicons name="md-calendar-sharp" size={24} color={tabInfo.focused ? "#1f6cb0" : "#ccc"} />
                                <Text style={[styles.tabBarIconText, {
                                    fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                                }]}>{i18n.t('navigation')['calendar']}</Text>
                            </View>
                        )

                    })}
                    component={calendarScreenStack}
                />
                <Tab.Screen
                    name="progressScreenStack"
                    options={({ route }) => ({
                        tabBarStyle: {
                            display: getTabBarVisibility(route),
                            height: getTabBarVisibility(route) == "flex" ? 75 : 0,
                            paddingTop: Platform.OS == "ios" ? 25 : 0,
                        },
                        tabBarLabel: 'Progress',
                        headerShown: false,
                        tabBarActiveTintColor: "#ccc",
                        tabBarIcon: (tabInfo) =>
                        (
                            <View style={styles.tabBarIconContainer}>
                                <Entypo name="line-graph" size={24} color={tabInfo.focused ? "#1f6cb0" : "#ccc"} />
                                <Text style={[styles.tabBarIconText, {
                                    width: "100%",
                                    textAlign: "center",
                                    fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                                }]}>{i18n.t('navigation')['progress']}</Text>
                            </View>
                        )

                    })}
                    component={progressScreenStack}
                />
                <Tab.Screen
                    name="coachingScreenStack"
                    options={({ route }) => ({
                        tabBarStyle: {
                            display: getTabBarVisibility(route),
                            height: getTabBarVisibility(route) == "flex" ? 75 : 0,
                            paddingTop: Platform.OS == "ios" ? 25 : 0,
                        },
                        tabBarLabel: 'Coaching',
                        headerShown: false,
                        tabBarActiveTintColor: "#ccc",
                        tabBarIcon: (tabInfo) =>
                        (
                            <View style={styles.tabBarIconContainer}>
                                <FontAwesome5 name="dumbbell" size={24} color={tabInfo.focused ? "#1f6cb0" : "#ccc"} />
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
                            height: getTabBarVisibility(route) == "flex" ? 75 : 0,
                            paddingTop: Platform.OS == "ios" ? 25 : 0,
                        },
                        tabBarLabel: 'Chats',
                        headerShown: false,
                        tabBarActiveTintColor: "#ccc",
                        tabBarIcon: (tabInfo) =>
                        (
                            <View style={styles.tabBarIconContainer}>
                                {
                                    false
                                        ? <View style={{
                                            position: 'absolute',
                                            zIndex: 999,
                                            top: 0, right: 0, height: 12, width: 12,
                                            backgroundColor: "red",
                                            borderRadius: 1000
                                        }}></View>
                                        : null
                                }
                                <Ionicons name="chatbubbles" size={24} color={tabInfo.focused ? "#1f6cb0" : "#ccc"} />
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
                            height: getTabBarVisibility(route) == "flex" ? 75 : 0,
                            paddingTop: Platform.OS == "ios" ? 25 : 0,
                        },
                        tabBarLabel: 'Profile',
                        headerShown: false,
                        tabBarActiveTintColor: "#ccc",
                        tabBarIcon: (tabInfo) =>
                        (
                            <View style={styles.tabBarIconContainer}>
                                <FontAwesome5 name="user-circle" size={24} color={tabInfo.focused ? "#1f6cb0" : "#ccc"} />
                                <Text style={[styles.tabBarIconText, {
                                    fontFamily: (tabInfo.focused ? "MainBold" : "MainRegular")
                                }]}>{i18n.t('navigation')['profile']}</Text>
                            </View>
                        )
                    })}
                    component={profileScreenStack}
                />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

export { NavigationRoutes, Auth };
