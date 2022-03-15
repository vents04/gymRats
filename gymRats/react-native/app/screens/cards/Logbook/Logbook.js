import React, { Component } from 'react'
import { BackHandler, Dimensions, Modal, ScrollView, Text, TextInput, View } from 'react-native'
import { BiArrowBack, BiCheck } from 'react-icons/bi';
import { IoIosAdd } from 'react-icons/io';
import { MdRemoveCircleOutline } from 'react-icons/md';
import { cardColors } from '../../../../assets/styles/cardColors';
import ApiRequests from '../../../classes/ApiRequests';
import { HTTP_STATUS_CODES } from '../../../../global';
import { Picker } from '@react-native-picker/picker';
import { CgArrowsExchangeAltV } from 'react-icons/cg';

const globalStyles = require('../../../../assets/styles/global.styles');
const styles = require('./Logbook.styles');

export default class Logbook extends Component {

    state = {
        exercises: [],
        weightUnit: "KILOGRAMS",
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

    focusListener;

    onFocusFunction = () => {
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
                    this.getSession(this.state.date);
                } else {
                    if (this.state.exercises.length == 0) {
                        this.getTemplates();
                    }
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

    getSession = (date) => {
        ApiRequests.get(`logbook/workout-session?date=${this.state.date.getDate()}&month=${this.state.date.getMonth() + 1}&year=${this.state.date.getFullYear()}`, {}, true).then((response) => {
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
        ApiRequests.post(`logbook/workout-session?date=${this.state.date.getDate()}&month=${this.state.date.getMonth() + 1}&year=${this.state.date.getFullYear()}`, {}, payload, true).then((response) => {
            this.getSession(this.state.date);
            this.setState({ hasChanges: false });
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
                                    <Text style={globalStyles.modalText}>It looks like this is a new kind of workout to you. You may add it as a workout template by giving it a name.</Text>
                                    <TextInput
                                        value={this.state.templateTitle}
                                        style={globalStyles.authPageInput}
                                        placeholder="Title:"
                                        onChangeText={(val) => { this.setState({ templateTitle: val, showModalError: false }) }} />
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Text style={[globalStyles.modalActionTitle, {
                                            color: "#1f6cb0"
                                        }]} onClick={() => {
                                            this.setState({ hasDeniedWorkoutTemplateCreation: true, showWorkoutTemplateModal: false })
                                            this.saveChanges();
                                        }}>Skip</Text>
                                        <Text style={globalStyles.modalActionTitle} onClick={() => {
                                            this.addWorkoutTemplate();
                                        }}>Add</Text>
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
                                            this.setState({ selectedTemplateId: itemValue, showModalError: false })
                                        }>
                                        {
                                            this.state.templates.map((template, index) =>
                                                <Picker.Item label={template.name} value={template._id} />
                                            )
                                        }
                                    </Picker>
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Text style={[globalStyles.modalActionTitle, {
                                            color: "#1f6cb0"
                                        }]} onClick={() => {
                                            this.setState({ showTemplatePickerModal: false, hasDeniedWorkoutTemplateReplication: true })
                                        }}>Skip</Text>
                                        <Text style={globalStyles.modalActionTitle} onClick={() => {
                                            this.loadWorkoutTemplate();
                                        }}>Add</Text>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        : null
                }
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <BiArrowBack size={25} onClick={() => {
                            this.props.navigation.navigate("Calendar", { reloadDate: true, date: this.props.route.params.date })
                        }} />
                        <Text style={globalStyles.followUpScreenTitle}>Logbook</Text>
                    </View>
                    {
                        this.state.exercises.length > 0 && this.state.hasChanges
                            ? <View style={globalStyles.topbarIconContainer} onClick={() => { (!this.state.hasDeniedWorkoutTemplateCreation) ? this.checkWorkoutTemplate() : this.saveChanges() }}>
                                <Text style={[globalStyles.topbarIconTitle, {
                                    color: cardColors.logbook
                                }]}>Save</Text>
                                <BiCheck size={20} color={cardColors.logbook} />
                            </View>
                            : null
                    }
                    {
                        this.state.showError && <Text style={globalStyles.errorBox}>{this.state.error}</Text>
                    }
                    <View style={styles.exercisesListContainer}>
                        <View style={styles.exercisesListContainerTopbar}>
                            <Text style={styles.sectionTitle}>Exercises</Text>
                            <IoIosAdd size={35} color={cardColors.logbook} onClick={() => {
                                this.props.navigation.navigate("ExerciseSearch", { date: this.state.date, timezoneOffset: this.state.timezoneOffset })
                            }} />
                        </View>
                        <ScrollView contentContainerStyle={{
                            flexGrow: 1,
                            flexShrink: 1
                        }}>
                            {
                                this.state.exercises.length == 0
                                    ? <Text style={globalStyles.notation}>No exercises added</Text>
                                    : <>
                                        {
                                            this.state.exercises.map((exercise, exerciseIndex) =>
                                                <>
                                                    <View style={styles.exerciseContainerTopbar}>
                                                        <View style={styles.exerciseContainerLeft}>
                                                            {
                                                                this.state.exercises.length > 1
                                                                    ? <CgArrowsExchangeAltV color="#777" style={{ marginRight: 10, minWidth: 25, height: 25 }} onClick={() => {
                                                                        this.swapExercises(exerciseIndex);
                                                                    }} />
                                                                    : null
                                                            }
                                                            <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
                                                        </View>
                                                        <View style={styles.exerciseContainerAddContainer} onClick={() => {
                                                            this.addSet(exercise.exerciseId)
                                                        }}>
                                                            <Text style={styles.exerciseContainerAddContainerTitle}>Add set</Text>
                                                            <IoIosAdd size={25} color={cardColors.logbook} />
                                                        </View>
                                                    </View>
                                                    <View style={styles.setsContainer}>
                                                        {
                                                            exercise.sets.map((set, index) =>
                                                                <>
                                                                    <Text style={styles.setContainerTitle}>Set No. {index + 1}</Text>
                                                                    <ScrollView
                                                                        showsHorizontalScrollIndicator={false}
                                                                        style={styles.setContainer}
                                                                        horizontal={true}
                                                                        contentContainerStyle={{ alignItems: "center", paddingVertical: 5 }}>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput} value={set.weight.amount}
                                                                                defaultValue={0}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "weight", val)
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>
                                                                                {
                                                                                    set.weight.unit == "KILOGRAMS" ? "kgs" : "lbs"
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput} value={set.reps}
                                                                                defaultValue={0}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "reps", val)
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>reps</Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput} value={set.duration}
                                                                                defaultValue={0}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "duration", val)
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>duration</Text>
                                                                        </View>
                                                                        <MdRemoveCircleOutline color={cardColors.logbook} size={20} onClick={() => {
                                                                            this.deleteSet(exercise.exerciseId, index);
                                                                        }} />
                                                                    </ScrollView>
                                                                </>
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
