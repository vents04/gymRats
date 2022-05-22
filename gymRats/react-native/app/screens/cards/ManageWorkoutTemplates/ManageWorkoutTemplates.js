import React, { Component } from 'react'
import { Text, View, ScrollView, Pressable, BackHandler, TextInput, Alert } from 'react-native'

import ApiRequests from '../../../classes/ApiRequests';
import { BackButtonHandler } from '../../../classes/BackButtonHandler';

import { Ionicons } from '@expo/vector-icons';

import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './ManageWorkoutTemplates.styles';
import { HTTP_STATUS_CODES } from '../../../../global';

export default class ManageWorkoutTemplates extends Component {

    constructor(props) {
        super(props)

        this.state = {
            showError: false,
            error: '',
            workoutTemplates: []
        }

        this.backHandler;
    }

    backAction = () => {
        this.props.navigation.navigate("Logbook", {
            date: this.props.route.params.date,
            timezoneOffset: this.props.route.params.timezoneOffset
        });
        return true;
    }

    componentDidMount() {
        BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
        this.getWorkoutTemplates();
    }

    componentWillUnmount = () => {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    getWorkoutTemplates = () => {
        ApiRequests.get("logbook/workout-templates", {}, true).then((response) => {
            this.setState({ workoutTemplates: response.data.templates });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    removeExercise = (exerciseId, templateId) => {
        let templates = this.state.workoutTemplates;
        let index = 0;
        for (let template of templates) {
            if (template._id == templateId) {
                let exerciseIndex = 0;
                for (let exercise of template.exercises) {
                    if (exercise.exerciseId == exerciseId) {
                        if (templates[index].exercises.length == 1) {
                            Alert.alert("Hold on!", "Are you sure you want to delete this workout template?", [
                                {
                                    text: "Cancel",
                                    onPress: () => null,
                                    style: "cancel"
                                },
                                { text: "Yes", onPress: () => { this.deleteTemplate(templateId); } }
                            ]);
                        } else {
                            templates[index].exercises.splice(exerciseIndex, 1);
                            if (templates[index].exercises.length <= 0) {
                                this.deleteTemplate(templateId);
                            } else {
                                this.setState({ workoutTemplates: templates }, () => {
                                    this.updateTemplate(templateId);
                                })
                            }
                            return;
                        }
                    }
                    exerciseIndex++;
                }
            }
            index++;
        }
    }

    deleteTemplate = (templateId) => {
        ApiRequests.delete("logbook/workout/" + templateId, {}, true).then((response) => {
            this.getWorkoutTemplates();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showError: true, error: error.response.data });
                } else {
                    ApiRequests.showInternalServerError();
                }
            } else if (error.request) {
                ApiRequests.showNoResponseError();
            } else {
                ApiRequests.showRequestSettingError();
            }
        })
    }

    updateTemplate = (templateId) => {
        let template = null;
        for (let workoutTemplate of this.state.workoutTemplates) {
            if (workoutTemplate._id == templateId) {
                template = workoutTemplate;
                break;
            }
        }
        if (template) {
            let exercises = [];
            for (let exercise of template.exercises) {
                exercises.push(exercise.exerciseId);
            }
            ApiRequests.put("logbook/workout/" + templateId, {}, {
                name: template.name,
                exercises
            }, true).then((response) => {
                this.getWorkoutTemplates();
            }).catch((error) => {
                if (error.response) {
                    if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                        this.setState({ showError: true, error: error.response.data });
                    } else {
                        ApiRequests.showInternalServerError();
                    }
                } else if (error.request) {
                    ApiRequests.showNoResponseError();
                } else {
                    ApiRequests.showRequestSettingError();
                }
            })
        }
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView} >
                <View style={globalStyles.pageContainer}>
                    <View style={[globalStyles.followUpScreenTopbar, {
                        marginBottom: 32
                    }]}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction()
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>Manage workout templates</Text>
                    </View>
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                        {
                            this.state.workoutTemplates.length > 0
                                ? this.state.workoutTemplates.map((workoutTemplate, index) =>
                                    <View style={styles.workoutTemplate}>
                                        <View style={styles.workoutTemplateHeader}>
                                            <Text style={styles.workoutTemplateTitle}>{workoutTemplate.name}</Text>
                                            <Pressable style={({ pressed }) => [
                                                {
                                                    opacity: pressed ? 0.1 : 1,
                                                }
                                            ]} onPress={() => {
                                                Alert.alert("Hold on!", "Are you sure you want to delete this workout template?", [
                                                    {
                                                        text: "Cancel",
                                                        onPress: () => null,
                                                        style: "cancel"
                                                    },
                                                    { text: "Yes", onPress: () => { this.deleteTemplate(workoutTemplate._id) } }
                                                ]);
                                            }}>
                                                <Ionicons name="close" size={25} color={cardColors.negative} />
                                            </Pressable>
                                        </View>
                                        {
                                            workoutTemplate.exercises.map((exercise, index) =>
                                                <View style={styles.workoutTemplateExercise}>
                                                    <Text style={styles.workoutTemplateExerciseTitle}>{exercise.exerciseInstance.title}</Text>
                                                    <Pressable style={({ pressed }) => [
                                                        {
                                                            opacity: pressed ? 0.1 : 1,
                                                        }
                                                    ]} onPress={() => {
                                                        this.removeExercise(exercise.exerciseId, workoutTemplate._id)
                                                    }}>
                                                        <Ionicons name="remove" size={20} />
                                                    </Pressable>
                                                </View>

                                            )
                                        }
                                    </View>
                                )
                                : <Text style={globalStyles.notation}>You do not have any workout templates, yet.</Text>
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
}
