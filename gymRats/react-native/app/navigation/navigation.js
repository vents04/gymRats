import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from '../screens/Login/Login';
import Signup from '../screens/Signup/Signup';
import Calendar from '../screens/Calendar/Calendar';
import Profile from '../screens/Profile/Profile';
import ProfileDetailsEdit from '../screens/ProfileDetailsEdit/ProfileDetailsEdit';

import { BsCalendarWeek } from 'react-icons/bs';
import { BiCalendar, BiUserCircle } from 'react-icons/bi';
import { GiRat } from 'react-icons/gi';
import { StyleSheet, Text, View } from 'react-native';
import WeightTracker from '../screens/cards/WeightTracker/WeightTracker';
import Logbook from '../screens/cards/Logbook/Logbook';
import ExerciseSearch from '../screens/cards/ExerciseSearch/ExerciseSearch';
import Coaching from '../screens/Coaching/Coaching';
import CoachingApplicationSubmission from '../screens/CoachingApplicationSubmission/CoachingApplicationSubmission';

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
        <Stack.Navigator initialRouteName="CoachingApplicationSubmission">
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
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: "#fafafa",
                    borderRadius: 10,
                    borderColor: "#ccc",
                    height: 75,
                    ...styles.shadow
                },
            }}>
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
                            }]}>Coaching</Text>
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
                            }]}>Calendar</Text>
                        </View>
                    )

                }}
                component={calendarScreenStack}
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
                            }]}>Profile</Text>
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
        fontSize: 13,
        marginTop: 10
    }
})

export { NavigationRoutes, Auth };