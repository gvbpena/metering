import "../global.css";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Alert } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { NetworkProvider } from "@/context/_internetStatusContext";

export default function Layout() {
    const [isDatabaseReady, setIsDatabaseReady] = useState(false);
    const destinationUri = FileSystem.documentDirectory + "SQLite/database.db";
    const transferDatabase = async () => {
        console.log("transferDatabase");
        try {
            const databaseAsset = Asset.fromModule(require("@/database/database.db"));
            await databaseAsset.downloadAsync();
            const sourceUri = databaseAsset.localUri || databaseAsset.uri;
            if (!sourceUri) {
                Alert.alert("Error", "Database file not found.");
                return false;
            }
            const destinationUri = FileSystem.documentDirectory + "SQLite/database.db";
            const fileInfo = await FileSystem.getInfoAsync(destinationUri);
            if (fileInfo.exists) {
                Alert.alert("Info", "Database already exists. No transfer needed.");
                return true;
            }
            const folderInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "SQLite");
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "SQLite", { intermediates: true });
            }
            await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

            Alert.alert("Welcome to Metering", "Precise Resources for Installation and System Metering\nPowered by Genius Power+");
            return true;
        } catch (error) {
            console.error("Error transferring database in layout:", error);
            Alert.alert("Error", "Failed to transfer the database.");
            return false;
        }
    };

    useEffect(() => {
        const initializeDatabase = async () => {
            const fileInfo = await FileSystem.getInfoAsync(destinationUri);
            if (fileInfo.exists) {
                setIsDatabaseReady(true);
            } else {
                const transferSuccess = await transferDatabase();
                setIsDatabaseReady(transferSuccess);
            }
        };

        initializeDatabase();
    }, []);

    if (!isDatabaseReady) {
        return (
            <View>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    return (
        <SQLiteProvider databaseName="database.db">
            <NetworkProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="(electrician)_setup" options={{ headerShown: false }} />
                    <Stack.Screen name="(electrician)_fa" options={{ headerShown: false }} />
                    <Stack.Screen name="(electrician)" options={{ headerShown: false }} />
                </Stack>
            </NetworkProvider>
        </SQLiteProvider>
    );
}
