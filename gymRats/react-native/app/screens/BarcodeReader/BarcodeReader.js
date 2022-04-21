import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import { useRef } from 'react';

import { IoMdClose } from 'react-icons/io';

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
        <>
            <IoMdClose size={24} style={styles.closeIcon} />
            <Text style={styles.title}>Scan a barcode</Text>
            <Camera ref={cameraRef} style={styles.camera} type={Camera.Constants.Type.front} />
        </>
    );
}

const styles = StyleSheet.create({
    closeIcon: {
        color: "#fff",
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 99999,
    },
    title: {
        fontFamily: "SpartanBold",
        fontSize: 18,
        color: "#fff",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
    },
    camera: {
        position: "absolute",
        zIndex: 1,
        height: "100%",
        width: "100%",
    }
})
