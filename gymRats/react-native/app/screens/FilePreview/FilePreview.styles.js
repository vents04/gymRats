import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
    },
    video: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        height: "100%",
        zIndex: -999,
    },
    videoButtons: {
        position: 'absolute',
        zIndex: 999999,
        bottom: 0,
    },
})