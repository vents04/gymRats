import React, { Component } from 'react'
import { Alert, BackHandler, Modal, ScrollView, Text, TextInput, Pressable, View, Keyboard, Image } from 'react-native'
import i18n from 'i18n-js';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ApiRequests from '../../../classes/ApiRequests';
import { BackButtonHandler } from '../../../classes/BackButtonHandler';

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
            hasDeniedWorkoutTemplateReplication: false,
            hasWorkoutTemplates: false,
            templatePickerModalTemplateIds: [],
            isTemplatePickerModalOpened: false,
        }

        this.focusListener;

        this.backHandler;

        this.scrollView = React.createRef();
    }

    backAction = () => {
        if (this.state.hasChanges) {
            Alert.alert(i18n.t('screens')['logbook']['backActionAlertTitle'], i18n.t('screens')['logbook']['backActionAlertMessage'], [
                {
                    text: i18n.t('screens')['logbook']['cancel'],
                    onPress: () => { return; },
                    style: "cancel"
                },
                { text: i18n.t('screens')['logbook']['yes'], onPress: () => { BackButtonHandler.goToPageWithDataManagerCardUpdate(this.props.navigation, "Calendar", this.props.route.params.date) } }
            ]);
        } else {
            BackButtonHandler.goToPageWithDataManagerCardUpdate(this.props.navigation, "Calendar", this.props.route.params.date)
        }
        return true;
    }

    onFocusFunction = () => {
        setTimeout(() => {
            console.log(this.state.exercises);
        }, 2000)
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
                    this.setState({ exercises: exercises, hasChanges: true }, () => {
                        this.scrollView.current.scrollToEnd({ animated: true });
                    });
                } else if (this.props.route.params.data) {
                    this.getSession(this.props.route.params.date);
                } else if (this.state.exercises.length == 0) {
                    this.getTemplates();
                }
            } else {
                if (this.state.exercises.length == 0) {
                    this.getTemplates();
                }
            }
            this.checkIfHasWorkoutTemplates();
        })
    }

    componentDidMount = () => {
        BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
        this.focusListener = this.props.navigation.addListener('focus', () => {
            this.onFocusFunction();
        });
    }

    componentWillUnmount = () => {
        BackHandler.removeEventListener("hardwareBackPress", this.backAction);
    }

    checkIfHasWorkoutTemplates = () => {
        ApiRequests.get("logbook/has-workout-templates", {}, true).then((response) => {
            this.setState({ hasWorkoutTemplates: response.data.hasWorkoutTemplates });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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

    getTemplates = () => {
        ApiRequests.get("logbook/workout", {}, true).then((response) => {
            this.setState({ templates: response.data.templates });
            if (response.data.templates.length > 0) {
                this.setState({ showTemplatePickerModal: !this.state.hasDeniedWorkoutTemplateReplication, selectedTemplateId: response.data.templates[0]._id });
                let templatePickerModalTemplateIds = [];
                for (let template of response.data.templates) {
                    templatePickerModalTemplateIds.push({ value: template._id, label: template.name });
                }
                this.setState({ templatePickerModalTemplateIds });
            }
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
        Keyboard.dismiss();
        this.setState({ hasChanges: true });
        const exercises = this.state.exercises;
        let index = 0;
        for (let exercise of exercises) {
            index++;
            if (exercise.exerciseId == exerciseId) {
                exercise.sets.push({
                    reps: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : 0,
                    weight: {
                        amount: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight.amount : 0,
                        unit: this.state.weightUnit,
                    },
                    duration: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].duration : undefined,
                })
                this.setState({ exercises: exercises }, () => {
                    if (index == exercises.length) {
                        this.scrollView.current.scrollToEnd({ animated: true });
                    }
                });
                return;
            }
        }
    }

    deleteSet = (exerciseId, setIndex) => {
        Keyboard.dismiss();
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
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
        let payload = { exercises: [], name: this.state.templateTitle.trim() };
        for (let exercise of this.state.exercises) {
            payload.exercises.push(exercise.exerciseId);
        }
        ApiRequests.post("logbook/workout", {}, payload, true).then((response) => {
            this.setState({ showWorkoutTemplateModal: false })
            this.saveChanges();
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
        Keyboard.dismiss();
        let finalExercises = [];
        const exercises = this.state.exercises;
        for (let exercise of exercises) {
            finalExercises.push({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
            })
        }
        ApiRequests.post(`logbook/workout-session?date=${this.props.route.params.date.getDate()}&month=${this.props.route.params.date.getMonth() + 1}&year=${this.props.route.params.date.getFullYear()}`, {}, { exercises: finalExercises }, true).then((response) => {
            this.setState({ hasChanges: false }, () => {
                this.getSession(this.props.route.params.date);
            });
        }).catch((error) => {
            if (error.response) {
                if (error.response.status != HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR && !error.response.data.includes("<html>")) {
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
        Keyboard.dismiss();
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
                                    <Text style={globalStyles.modalTitle}>{i18n.t('screens')['logbook']['templatePostModalTitle']}</Text>
                                    <Text style={globalStyles.modalText}>{i18n.t('screens')['logbook']['workoutTemplateModalMessage']}</Text>
                                    <TextInput
                                        value={this.state.templateTitle}
                                        style={globalStyles.authPageInput}
                                        placeholder={i18n.t('screens')['logbook']['workoutTemplateModalInput']}
                                        onChangeText={(val) => { this.setState({ templateTitle: val, showModalError: false, showError: false }) }} />
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.setState({ showWorkoutTemplateModal: false })
                                            this.saveChanges();
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>{i18n.t('screens')['logbook']['workoutTemplateSkip']}</Text>
                                        </Pressable>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.addWorkoutTemplate();
                                        }}>
                                            <Text style={globalStyles.modalActionTitle}>{i18n.t('screens')['logbook']['workoutTemplateAdd']}</Text>
                                        </Pressable>
                                    </View>
                                    {
                                        /*
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                                flex: 2
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.setState({ hasDeniedWorkoutTemplateCreation: true, showWorkoutTemplateModal: false })
                                            this.saveChanges();
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>{i18n.t('screens')['logbook']['workoutTemplateDeny']}</Text>
                                        </Pressable>
                                    </View>
                                        */
                                    }
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
                            visible={true}
                            onRequestClose={() => {
                                this.setState({ showTemplatePickerModal: false });
                                this.backAction();
                            }}>
                            <View style={globalStyles.centeredView}>
                                <View style={globalStyles.modalView}>
                                    <Text style={globalStyles.modalTitle}>{i18n.t('screens')['logbook']['templatePickerModalTitle']}</Text>
                                    <Text style={globalStyles.modalText}>{i18n.t('screens')['logbook']['templatePickerModalMessage']}</Text>
                                    <DropDownPicker
                                        placeholder={i18n.t('screens')['logbook']['templatePickerModalDropdownPlaceholder']}
                                        maxHeight={150}
                                        open={this.state.isTemplatePickerModalOpened}
                                        setOpen={(value) => {
                                            this.setState({ isTemplatePickerModalOpened: value })
                                        }}
                                        value={this.state.selectedTemplateId}
                                        setValue={(callback) => {
                                            this.setState(state => ({
                                                selectedTemplateId: callback(state.value),
                                            }));
                                        }}
                                        items={this.state.templatePickerModalTemplateIds}
                                        setItems={(callback) => {
                                            this.setState(state => ({
                                                templatePickerModalTemplateIds: callback(state.items)
                                            }));
                                        }}
                                        onChangeItem={item => { }}
                                        zIndex={10000}
                                        textStyle={{
                                            fontFamily: 'MainMedium',
                                            fontSize: 14,
                                        }}
                                        dropDownContainerStyle={{
                                            borderColor: "#ccc",
                                        }}
                                        style={{
                                            borderColor: "#ccc",
                                            marginBottom: 16
                                        }}
                                    />
                                    {
                                        this.state.showModalError
                                            ? <Text style={globalStyles.errorBox}>{this.state.modalError}</Text>
                                            : null
                                    }
                                    <View style={globalStyles.modalActionsContainer}>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.setState({ showTemplatePickerModal: false, hasDeniedWorkoutTemplateReplication: true })
                                        }}>
                                            <Text style={[globalStyles.modalActionTitle, {
                                                color: "#1f6cb0"
                                            }]}>{i18n.t('screens')['logbook']['templatePickerModalSkip']}</Text>
                                        </Pressable>
                                        <Pressable style={({ pressed }) => [
                                            styles.option,
                                            {
                                                opacity: pressed ? 0.1 : 1,
                                            }
                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                            this.loadWorkoutTemplate();
                                        }}>
                                            <Text style={globalStyles.modalActionTitle}>{i18n.t('screens')['logbook']['templatePickerModalAdd']}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        : null
                }
                <View style={globalStyles.pageContainer}>
                    <View style={globalStyles.followUpScreenTopbar}>
                        <Pressable style={({ pressed }) => [
                            {
                                opacity: pressed ? 0.1 : 1,
                            }
                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                            this.backAction();
                        }}>
                            <Ionicons name="md-arrow-back-sharp" size={25} />
                        </Pressable>
                        <Text style={globalStyles.followUpScreenTitle}>{i18n.t('screens')['logbook']['title']}</Text>
                    </View>
                    {
                        this.state.exercises.length > 0 && this.state.hasChanges
                            ? <Pressable style={({ pressed }) => [
                                globalStyles.topbarIconContainer,
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                (!this.state.hasDeniedWorkoutTemplateCreation) ? this.checkWorkoutTemplate() : this.saveChanges()
                            }}>
                                <Text style={[globalStyles.topbarIconTitle, {
                                    color: cardColors.logbook
                                }]}>{i18n.t('screens')['logbook']['save']}</Text>
                                <FontAwesome name="check" size={20} color={cardColors.logbook} />
                            </Pressable>
                            : null
                    }
                    {
                        this.state.showError
                            ? <Text style={{ ...globalStyles.errorBox, marginBottom: 16 }}>{this.state.error}</Text>
                            : null
                    }
                    {
                        this.state.hasWorkoutTemplates
                            ? <View style={styles.unknownSourceCaloriesIncentiveContainer}>
                                <Text style={styles.unknownSourceCaloriesIncentiveText}>{i18n.t('screens')['logbook']['manageWorkoutTemplatesMessage']}</Text>
                                <Pressable style={({ pressed }) => [
                                    globalStyles.authPageActionButton,
                                    {
                                        opacity: pressed ? 0.1 : 1,
                                    }
                                ]} onPress={() => {
                                    this.props.navigation.navigate("ManageWorkoutTemplates", {
                                        date: this.props.route.params.date,
                                        timezoneOffset: this.props.route.params.timezoneOffset
                                    });
                                }}>
                                    <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['logbook']['manageWorkoutTemplatesButton']}</Text>
                                </Pressable>
                            </View>
                            : null
                    }
                    <View style={{ ...styles.exercisesListContainer, marginTop: this.state.hasWorkoutTemplates ? 0 : 16 }}>
                        <View style={styles.exercisesListContainerTopbar}>
                            <Text style={styles.sectionTitle}>{i18n.t('screens')['logbook']['exercises']}</Text>
                            <Pressable style={({ pressed }) => [
                                {
                                    opacity: pressed ? 0.1 : 1,
                                }
                            ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                this.props.navigation.navigate("ExerciseSearch", { date: this.props.route.params.date, timezoneOffset: this.props.route.params.timezoneOffset })
                            }}>
                                <Ionicons name="add-sharp" size={35} color={cardColors.logbook} />
                            </Pressable>
                        </View>
                        <KeyboardAwareScrollView style={{ ...globalStyles.fillEmptySpace, marginBottom: 0 }} ref={this.scrollView}>
                            {
                                this.state.exercises.length == 0
                                    ? <Text style={globalStyles.notation}>{i18n.t('screens')['logbook']['noExercisesAdded']}</Text>
                                    : <>
                                        {
                                            this.state.exercises.map((exercise, index) =>
                                                <View style={styles.exerciseContainer}>
                                                    <View key={index} style={styles.exerciseContainerTopbar}>
                                                        <View style={styles.exerciseContainerLeft}>
                                                            {
                                                                exercise.exerciseInstance && exercise.exerciseInstance.video
                                                                    ? <Image source={{ uri: exercise.exerciseInstance.video }} style={styles.exerciseGif} />
                                                                    : null
                                                            }
                                                            <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
                                                        </View>
                                                        {
                                                            this.state.exercises.length > 1
                                                                ? <Pressable style={({ pressed }) => [
                                                                    {
                                                                        opacity: pressed ? 0.1 : 1,
                                                                    }
                                                                ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                                    this.swapExercises(index);
                                                                    this.setState({ showError: false })
                                                                }}>
                                                                    <Ionicons name="swap-vertical" size={20} color="#777" style={{ marginRight: 10, minWidth: 25, height: 25 }} />
                                                                </Pressable>
                                                                : null
                                                        }
                                                        {/* <Pressable style={({ pressed }) => [
                                                            {
                                                                opacity: pressed ? 0.1 : 1,
                                                            }
                                                        ]} hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }} onPress={() => {
                                                            this.addSet(exercise.exerciseId)
                                                            this.setState({ showError: false })
                                                        }}>
                                                            <View style={styles.exerciseContainerAddContainer}>
                                                                <Text style={styles.exerciseContainerAddContainerTitle}>{i18n.t('screens')['logbook']['addSet']}</Text>
                                                                <Ionicons name="add-sharp" size={25} color={cardColors.logbook} />
                                                            </View>
                                                        </Pressable> */}
                                                    </View>
                                                    <View style={styles.exerciseTableContainer}>
                                                        <View style={{ ...styles.exerciseTableRow, ...styles.exerciseTableHeaderRow }}>
                                                            <Text style={{ ...styles.exerciseTableColumnHeader, width: '10%' }}>Set</Text>
                                                            <Text style={styles.exerciseTableColumnHeader}>Reps</Text>
                                                            <Text style={styles.exerciseTableColumnHeader}>Weight</Text>
                                                            <Text style={styles.exerciseTableColumnHeader}>Duration</Text>
                                                        </View>
                                                        {
                                                            exercise.sets.map((set, index) =>
                                                                <View style={{ ...styles.exerciseTableRow, ...styles.exerciseTableInputRow, borderBottomWidth: exercise.sets.length == index + 1 ? 1 : 0 }}>
                                                                    <Text style={styles.setText}>{index + 1}</Text>
                                                                    <TextInput style={styles.exerciseCellInput}
                                                                        keyboardType='numeric'
                                                                        value={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                        defaultValue={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                        onChangeText={(val) => {
                                                                            this.changeSetVariable(exercise.exerciseId, index, "reps", val)
                                                                            this.setState({ showError: false })
                                                                        }} />
                                                                    <TextInput
                                                                        style={styles.exerciseCellInput}
                                                                        keyboardType='numeric'
                                                                        value={set.weight.amount && set.weight.amount != undefined ? set.weight.amount.toString() : null}
                                                                        onChangeText={(val) => {
                                                                            this.changeSetVariable(exercise.exerciseId, index, "weight", val)
                                                                            this.setState({ showError: false })
                                                                        }} />
                                                                    <TextInput style={styles.exerciseCellInput}
                                                                        keyboardType='numeric'
                                                                        value={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                        defaultValue={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                        onChangeText={(val) => {
                                                                            this.changeSetVariable(exercise.exerciseId, index, "duration", val)
                                                                            this.setState({ showError: false })
                                                                        }} />
                                                                    <Pressable style={({ pressed }) => [
                                                                        {
                                                                            opacity: pressed ? 0.1 : 1,
                                                                            width: '15%',
                                                                            display: 'flex',
                                                                            flexDirection: 'row',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }
                                                                    ]} onPress={() => {
                                                                        this.deleteSet(exercise.exerciseId, index);
                                                                        this.setState({ showError: false })
                                                                    }}>
                                                                        <Ionicons name="remove" size={20} color={cardColors.logbook} />
                                                                    </Pressable>
                                                                </View>
                                                            )
                                                        }
                                                    </View>
                                                    <Pressable style={({ pressed }) => [
                                                        globalStyles.authPageActionButton,
                                                        {
                                                            opacity: pressed ? 0.1 : 1,
                                                            marginTop: 8
                                                        }
                                                    ]} onPress={() => {
                                                        this.addSet(exercise.exerciseId)
                                                        this.setState({ showError: false })
                                                    }}>
                                                        <Text style={globalStyles.authPageActionButtonText}>{i18n.t('screens')['logbook']['addSet']}</Text>
                                                    </Pressable>
                                                    {/* <View style={styles.setsContainer} key={`_${index}`}>
                                                        {
                                                            exercise.sets.map((set, index) =>
                                                                <View key={set._id}>
                                                                    <Text style={styles.setContainerTitle}>{i18n.t('screens')['logbook']['setNo']}{index + 1}</Text>
                                                                    <View
                                                                        style={styles.setContainer}
                                                                        contentContainerStyle={{ alignItems: "center", paddingVertical: 5 }}>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput}
                                                                                keyboardType='numeric'
                                                                                value={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                                defaultValue={set.reps && set.reps != undefined ? set.reps.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "reps", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>{i18n.t('common')['reps']}</Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput
                                                                                style={styles.setContainerItemInput}
                                                                                keyboardType='numeric'
                                                                                value={set.weight.amount && set.weight.amount != undefined ? set.weight.amount.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "weight", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>{i18n.t('common')['weightUnits'][set.weight.unit]}</Text>
                                                                        </View>
                                                                        <View style={styles.setContainerItem}>
                                                                            <TextInput style={styles.setContainerItemInput}
                                                                                keyboardType='numeric'
                                                                                value={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                                defaultValue={set.duration && set.duration != undefined ? set.duration.toString() : null}
                                                                                onChangeText={(val) => {
                                                                                    this.changeSetVariable(exercise.exerciseId, index, "duration", val)
                                                                                    this.setState({ showError: false })
                                                                                }} />
                                                                            <Text style={styles.setContainerItemDescriptor}>{i18n.t('common')['duration']}</Text>
                                                                        </View>
                                                                        <Pressable style={({ pressed }) => [
                                                                            {
                                                                                opacity: pressed ? 0.1 : 1,
                                                                            }
                                                                        ]} onPress={() => {
                                                                            this.deleteSet(exercise.exerciseId, index);
                                                                            this.setState({ showError: false })
                                                                        }}>
                                                                            <Ionicons name="remove" size={20} color={cardColors.logbook} style={{ padding: 12 }} />
                                                                        </Pressable>
                                                                    </View>
                                                                </View>
                                                            )
                                                        }
                                                    </View> */}
                                                </View>
                                            )
                                        }
                                    </>
                            }
                        </KeyboardAwareScrollView>
                    </View>
                </View>
            </View >
        )
    }
}
