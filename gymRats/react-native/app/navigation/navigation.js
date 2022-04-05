import React, { useEffect, useState } from 'react';
import {useRoute, getFocusedRouteNameFromRoute} from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from '../screens/Login/Login';
import Signup from '../screens/Signup/Signup';
import Calendar from '../screens/Calendar/Calendar';
import Profile from '../screens/Profile/Profile';
import ProfileDetailsEdit from '../screens/ProfileDetailsEdit/ProfileDetailsEdit';

import { BsCalendarWeek } from 'react-icons/bs';
import { BiCalendar, BiUserCircle, BiMessageSquareDetail } from 'react-icons/bi';
import { GiRat } from 'react-icons/gi';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import WeightTracker from '../screens/cards/WeightTracker/WeightTracker';
import Logbook from '../screens/cards/Logbook/Logbook';
import ExerciseSearch from '../screens/cards/ExerciseSearch/ExerciseSearch';
import Coaching from '../screens/Coaching/Coaching';
import CoachingApplicationSubmission from '../screens/CoachingApplicationSubmission/CoachingApplicationSubmission';
import CoachSearch from '../screens/CoachSearch/CoachSearch';
import CoachPage from '../screens/CoachPage/CoachPage';
import Chats from '../screens/Chats/Chats';
import Chat from '../screens/Chat/Chat';
import i18n from 'i18n-js';
import CoachRequests from '../screens/CoachRequests/CoachRequests';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const calendarScreenStack = ({ navigation }) => {
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
        </Stack.Navigator>
    );
};

const coachingScreenStack = ({ navigation }) => {
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
        </Stack.Navigator>
    )
}


const chatsScreenStack = ({ navigation }) => {
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
}

const profileScreenStack = ({ navigation }) => {
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
}

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

const NavigationRoutes = (props) => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
                tabBarStyle: {
                    display: 'flex',
                    position: 'absolute',
                    bottom: 25,
                    paddingTop: 25,
                    elevation: 0,
                    borderColor: "#ddd",
                    height: 60,
                    ...styles.shadow
                },
            })}
        >
            <Tab.Screen
                name="coachingScreenStack"
                options={{
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
                                fontFamily: (tabInfo.focused ? "SpartanBold" : "SpartanRegular")
                            }]}>{i18n.t('navigation')['coaching']}</Text>
                        </View>
                    )

                }}
                component={coachingScreenStack}
            />
            <Tab.Screen
                name="calendarScreenStack"
                options={{
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
                                fontFamily: (tabInfo.focused ? "SpartanBold" : "SpartanRegular")
                            }]}>{i18n.t('navigation')['calendar']}</Text>
                        </View>
                    )

                }}
                component={calendarScreenStack}
            />
            <Tab.Screen
                name="chatsScreenStack"
                options={({route}) => ({
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
                                fontFamily: (tabInfo.focused ? "SpartanBold" : "SpartanRegular")
                            }]}>{i18n.t('navigation')['chats']}</Text>
                        </View>
                    )
                })}
                component={chatsScreenStack}
            />
            <Tab.Screen
                name="profileScreenStack"
                options={{
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
                                fontFamily: (tabInfo.focused ? "SpartanBold" : "SpartanRegular")
                            }]}>{i18n.t('navigation')['profile']}</Text>
                        </View>
                    )
                }}
                component={profileScreenStack}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#ddd",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 10
    },
    tabBarIconContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    tabBarIconText: {
        fontFamily: "SpartanRegular",
        fontSize: 10,
        marginTop: 10
    }
})

export { NavigationRoutes, Auth };