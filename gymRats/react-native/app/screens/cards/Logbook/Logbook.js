import React, { Component } from 'react'
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Picker } from '@react-native-picker/picker';

import ApiRequests from '../../../classes/ApiRequests';

import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import { HTTP_STATUS_CODES, WEIGHT_UNITS, WEIGHT_UNITS_LABELS } from '../../../../global';
import { cardColors } from '../../../../assets/styles/cardColors';

import globalStyles from '../../../../assets/styles/global.styles';
import styles from './Logbook.styles';

export default class Logbook extends Component {

    constructor(props) {
        super(props);

        this.state = {
            exercises: [],
            weightUnit: WEIGHT_UNITS.KILOGRAMS,
            showError: false,
            error: "",
            timezoneOffset: 0,
            date: undefined,
            hasChanges: false,
            hasMatchingTemplate: true,
            showWorkoutTemplateModal: false,
            showModalError: false,
            modalError: "",
            templateTitle: "",
            hasDeniedWorkoutTemplateCreation: false,
            showTemplatePickerModal: false,
            selectedTemplateId: null,
            templates: [],
            hasDeniedWorkoutTemplateReplication: false
        }

        this.focusListener;
    }

    onFocusFunction = () => {
        if (!this.props.route.params.date) {
            return this.props.navigation.navigate("Calendar");
        }
        this.setState({ timezoneOffset: this.props.route.params.timezoneOffset || new Date().getTimezoneOffset(), date: this.props.route.params.date }, () => {
            if (this.props.route.params) {
                if (this.props.route.params.exercise) {
                    let exercises = this.state.exercises;
                    if (exercises.length > 0) {
                        for (let exercise of exercises) {
                            if (exercise.exerciseId == this.props.route.params.exercise._id) {
                                this.addSet(exercise.exerciseId);
                                return;
                            }
                        }
                    }
                    exercises.push({
                        exerciseId: this.props.route.params.exercise._id,
                        exerciseName: this.props.route.params.exercise.title,
                        sets: [{
                            reps: 0,
                            weight: {
                                amount: 0,
                                unit: this.state.weightUnit,
                            },
                            duration: undefined
                        }]
                    });
                    this.setState({ exercises: exercises, hasChanges: true });
                } else if (this.props.route.params.data) {
                    this.getSession(this.props.route.params.date);
                }
            } else {
                if (this.state.exercises.length == 0) {
                    this.getTemplates();
                }
            }
        })
    }

    componentDidMount = () => {
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        })
    }

    getTemplates = () => {
        ApiRequests.get("logbook/workout", {}, true).then((response) => {
            this.setState({ templates: response.data.templates });
            if (response.data.templates.length > 0) {
                this.setState({ showTemplatePickerModal: !this.state.hasDeniedWorkoutTemplateReplication, selectedTemplateId: response.data.templates[0]._id });
            }
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

    getSession = () => {
        ApiRequests.get(`logbook/workout-session?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, {}, true).then((response) => {
            this.setState({ exercises: response.data.session.exercises })
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

    addSet = (exerciseId) => {
        this.setState({ hasChanges: true });
        const exercises = this.state.exercises;
        for (let exercise of exercises) {
            if (exercise.exerciseId == exerciseId) {
                exercise.sets.push({
                    reps: 0,
                    weight: {
                        amount: 0,
                        unit: this.state.weightUnit,
                    },
                    duration: undefined,
                })
                this.setState({ exercises: exercises });
                return;
            }
        }
    }

    deleteSet = (exerciseId, setIndex) => {
        this.setState({ hasChanges: true });
        const exercises = this.state.exercises;
        for (let index = 0; index < exercises.length; index++) {
            if (exercises[index].exerciseId == exerciseId) {
                exercises[index].sets.splice(setIndex, 1);
                if (exercises[index].sets.length == 0) {
                    exercises.splice(index, 1);
                }
                this.setState({ exercises: exercises });
                return;
            }
        }
    }

    changeSetVariable = (exerciseId, setIndex, variable, value) => {
        this.setState({ hasChanges: true });
        const exercises = this.state.exercises;
        for (let exercise of exercises) {
            if (exercise.exerciseId == exerciseId) {
                const set = exercise.sets[setIndex];
                variable != 'weight' ? set[variable] = value : set[variable]["amount"] = value;
                exercise.sets[setIndex] = set;
                this.setState({ exercises: exercises });
                return;
            }
        }
    }

    checkWorkoutTemplate = () => {
        let payload = { exercises: [] };
        for (let exercise of this.state.exercises) {
            payload.exercises.push({ exerciseId: exercise.exerciseId });
        }
        ApiRequests.post("logbook/check-template", {}, payload, true).then((response) => {
            this.setState({ hasMatchingTemplate: response.data.hasMatchingTemplate, showWorkoutTemplateModal: !response.data.hasMatchingTemplate });
            if (response.data.hasMatchingTemplate) {
                this.saveChanges();
            }
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

    addWorkoutTemplate = () => {
        let payload = { exercises: [], name: this.state.templateTitle };
        for (let exercise of this.state.exercises) {
            payload.exercises.push(exercise.exerciseId);
        }
        ApiRequests.post("logbook/workout", {}, payload, true).then((response) => {
            this.setState({ showWorkoutTemplateModal: false })
            this.saveChanges();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
                    this.setState({ showModalError: true, modalError: error.response.data });
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

    loadWorkoutTemplate = () => {
        for (let template of this.state.templates) {
            if (template._id.toString() == this.state.selectedTemplateId) {
                this.setState({ exercises: template.nearestSession.session.exercises, showTemplatePickerModal: false, hasChanges: true });
            }
        }
    }

    saveChanges = () => {
        const payload = { exercises: this.state.exercises };
        for (let exercise of payload.exercises) {
            if (exercise.hasOwnProperty("exerciseName")) delete exercise.exerciseName;
        }
        ApiRequests.post(`logbook/workout-session?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, {}, payload, true).then((response) => {
            this.setState({ hasChanges: false }, () => {
                this.getSession(this.props.route.params.date);
            });
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

    swapExercises = (exerciseIndex) => {
        const exercises = this.state.exercises;
        const firstExercise = exercises[exerciseIndex];
        if (exercises.length - 1 > exerciseIndex) {
            const secondExercise = exercises[exerciseIndex + 1];
            exercises[exerciseIndex + 1] = firstExercise;
            exercises[exerciseIndex] = secondExercise;
        } else if (exercises.length > 1) {
            const secondExercise = exercises[0];
            exercises[0] = firstExercise;
            exercises[exerciseIndex] = secondExercise;
        }
        this.setState({ exercises: exercises, hasChanges: true });
    }

    render() {
        return (
            <View style={globalStyles.safeAreaView}>
                {
                    this.state.showWorkoutTemplateModal
                        ? <Modal
                            animationType="slide"
                            transparent={true}
                            visible={true}>
                            <View style={globalStyles.centeredView}>
                                <View style={globalStyles.modalView}>
                                    <Text style={globalStyles.modalText}>You may add this workout template for future use by giving it a name.</Text>
                                    <TextInput
                                        value={this.state.templateTitle}
                                        style={globalStyles.authPageInput}
                                        placeholder="Title:"
                                        onChangeText={(val) => { this.setState({ templateTitle: val, showModalError: false, showError: false }) }} />
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <TouchableOpacity style={styles.option} onPress={() => {
                                            this.setState({ hasDeniedWorkoutTemplateCreation: true, showWorkoutTemplateModal: false })
                                            this.saveChanges();
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>Skip</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.option} onPress={() => {
                                            this.addWorkoutTemplate();
                                        }}>
                                            <Text style={globalStyles.modalActionTitle}>Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        : null
                }
                {
                    this.state.showTemplatePickerModal && this.state.templates.length > 0
                        ? <Modal
                            animationType="slide"
                            transparent={true}
                            visible={true}>
                            <View style={globalStyles.centeredView}>
                                <View style={globalStyles.modalView}>
                                    <Text style={globalStyles.modalText}>You may choose a workout template for this workout session</Text>
                                    <Picker
                                        style={globalStyles.authPageInput}
                                        selectedValue={this.state.selectedTemplateId}
                                        onValueChange={(itemValue, itemIndex) =>
                                            this.setState({ selectedTemplateId: itemValue, showModalError: false, showError: false })
                                        }>
                                        {
                                            this.state.templates.map((template, index) =>
                                                <Picker.Item key={index} label={template.name} value={template._id} />
                                            )
                                        }
                                    </Picker>
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <TouchableOpacity onPress={() => {
                                            this.setState({ showTemplatePickerModal: false, hasDeniedWorkoutTemplateReplication: true })
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>Skip</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            this.loadWorkoutTemplate();
                                        }}>
                                            <Text style={globalStyles.modalActionTitle}>Add</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        : null
                }
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <TouchableOpacity onPress={() => {
                            this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date })
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </TouchableOpacity>
                        <Text style={globalStyles.followUpScreenTitle}>Logbook</Text>
                    </View>
                    {
                        this.state.exercises.length > 0 && this.state.hasChanges
                            ? <TouchableOpacity style={globalStyles.topbarIconContainer} onPress={() => {
                                (!this.state.hasDeniedWorkoutTemplateCreation) ? this.checkWorkoutTemplate() : this.saveChanges()
                            }}>
                                <Text style={[globalStyles.topbarIconTitle, {
                                    color: cardColors.logbook
                                }]}>Save</Text>
                                <FontAwesome name="check" size={20} color={cardColors.logbook} />
                            </TouchableOpacity>
                            : null
                    }
                    {
                        this.state.showError
                            ? <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                            : null
                    }
                    <View style={styles.exercisesListContainer}>
                        <View style={styles.exercisesListContainerTopbar}>
                            <Text style={styles.sectionTitle}>Exercises</Text>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.navigate("ExerciseSearch", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                            }}>
                                <Ionicons name="add-sharp" size={35} color={cardColors.logbook} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={globalStyles.fillEmptySpace}>
                            {
                                this.state.exercises.length == 0
                                    ? <Text style={globalStyles.notation}>No exercises added</Text>
                                    : <>
                                        {
                                            this.state.exercises.map((exercise, index) =>
                                                <>
                                                    <View key={index} style={styles.exerciseContainerTopbar}>
                                                        <View style={styles.exerciseContainerLeft}>
                                                            {
                                                                this.state.exercises.length > 1
                                                                    ? <TouchableOpacity onPress={() => {
                                                                        this.swapExercises(index);
                                                                        this.setState({ showError: false })
                                                                    }}>
                                                                        <Ionicons name="swap-vertical" size={20} color="#777" style={{ marginRight: 10, minWidth: 25, height: 25 }} />
                                                                    </TouchableOpacity>
                                                                    : null
                                                            }
                                                            <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
                                                        </View>
                                                        <TouchableOpacity onPress={() => {
                                                            this.addSet(exercise.exerciseId)
                                                            this.setState({ showError: false })
                                                        }}>
                                                            <View style={styles.exerciseContainerAddContainer}>
                                                                <Text style={styles.exerciseContainerAddContainerTitle}>Add set</Text>
                                                                <Ionicons name="add-sharp" size={25} color={cardColors.logbook} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={styles.setsContainer} key={`_${index}`}>
                                                        {
                                                            exercise.sets.map((set, index) =>
                                                                <View key={set._id}>
                                                                    <Text style={styles.setContainerTitle}>Set No. {index + 1}</Text>
                                                                    <ScrollView
                                                                        showsHorizontalScrollIndicator={false}
                                                                        style={styles.setContainer}
                                                                        horizontal={true}
                                                                        contentContainerStyle={{ alignItems: "center", paddingVertical: 5 }}>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput}
                                                                                value={set.weight.amount && set.weight.amount != undefined ? set.weight.amount.toString() : null}
                                                                                defaultValue={set.weight.amount && set.weight.amount != undefined ? set.weight.amount.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "weight", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>{WEIGHT_UNITS_LABELS[set.weight.unit]}</Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput}
                                                                                value={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                                defaultValue={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "reps", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>reps</Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput}
                                                                                value={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                                defaultValue={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "duration", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>duration</Text>
                                                                        </View>
                                                                        <TouchableOpacity onPress={() => {
                                                                            this.deleteSet(exercise.exerciseId, index);
                                                                            this.setState({ showError: false })
                                                                        }}>
                                                                            <Ionicons name="remove" size={20} color={cardColors.logbook} style={{ padding: 12 }} />
                                                                        </TouchableOpacity>
                                                                    </ScrollView>
                                                                </View>
                                                            )
                                                        }
                                                    </View>
                                                </>
                                            )
                                        }
                                    </>
                            }
                        </ScrollView>
                    </View>
                </View>
            </View >
        )
    }
}
