import React from "react";
import { View, Button, Alert } from "react-native";
import * as FileSystem from "expo-file-system";

const DeleteFilesButton = () => {
    // Function to delete a file
    const deleteFile = async (filePath: string) => {
        try {
            await FileSystem.deleteAsync(filePath, { idempotent: true }); // idempotent ensures no error if file does not exist
        } catch (error) {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    };

    // List of files and directories to delete
    const deleteSafeFiles = async () => {
        const directoryPath = FileSystem.documentDirectory;

        // Safe files and directories to delete
        const safeFiles = [
            directoryPath + ".expo-internal",
            directoryPath + "generatefid.lock",
            directoryPath + "profileInstaller_profileWrittenFor_lastUpdateTime.dat",
            directoryPath + ".crashlytics.v3",
            directoryPath + "datastore",
            directoryPath + "dev.expo.modules.core.logging.dev.expo.updates",
            directoryPath + "saved_code",
            // directoryPath + "test.db",
            // directoryPath + "signature.jpeg",
            // directoryPath + "signature.png",
            directoryPath + "SQLite",
            // Add any additional safe files here
        ];

        // Delete each safe file
        for (const filePath of safeFiles) {
            await deleteFile(filePath);
        }

        // Show an alert when deletion is complete
        Alert.alert("Files Deleted", "All safe files have been deleted.");
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Button title="Delete Safe Files" onPress={deleteSafeFiles} />
        </View>
    );
};

export default DeleteFilesButton;
