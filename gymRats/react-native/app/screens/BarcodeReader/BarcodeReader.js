import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import { useRef } from 'react';

export default function App() {
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    if (hasPermission === null) {
        return <View />;
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.front}>

        </Camera>
    );
}

const styles = StyleSheet.create({
    camera: {
        paddingBottom: "60px",
        height: Dimensions.get('window').height - "75px",
        width: "100%",
        justifyContent: 'space-between',
    }
})
