import { Tabs } from "expo-router";
import { SyncProvider } from "@/context/_syncContextv2";
import { NetworkProvider } from "@/context/_internetStatusContext";
import { View, Text, ActivityIndicator, Linking, Alert, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants from "expo-constants";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_update/metering_checkupdate.php";
const API_HEADERS = { "Content-Type": "application/json" };

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NetworkProvider>
                <SyncProvider>
                    <Tabs>
                        <Tabs.Screen
                            name="index"
                            options={{
                                headerTitle: () => <NetworkStatusTitle />,
                                tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                            }}
                        />
                        <Tabs.Screen
                            name="profile"
                            options={{
                                headerTitle: () => <NetworkStatusTitle />,
                                tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                            }}
                        />
                    </Tabs>
                </SyncProvider>
            </NetworkProvider>
        </GestureHandlerRootView>
    );
}

const NetworkStatusTitle = () => {
    const version = Constants.expoConfig?.version || "?.?.?";
    const [updateStatus, setUpdateStatus] = useState<string | null>("Checking...");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updateUrl, setUpdateUrl] = useState<string | null>(null);
    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [alertShownForCurrentCheck, setAlertShownForCurrentCheck] = useState<boolean>(false);

    const _openUpdateUrl = async (urlToOpen: string | null) => {
        if (!urlToOpen) {
            console.warn("Attempted to open update URL, but it was null.");
            Alert.alert("Error", "Update URL is not available.");
            return;
        }
        try {
            const supported = await Linking.canOpenURL(urlToOpen);
            if (supported) {
                await Linking.openURL(urlToOpen);
            } else {
                Alert.alert("Error", `Cannot open URL: ${urlToOpen}`);
            }
        } catch (err: any) {
            Alert.alert("Error", "Could not open the update link. Please try again later.");
        }
    };

    const showUpdateConfirmationAlert = (url: string | null, versionNum: string | null) => {
        if (!url) return;
        Alert.alert(
            "Update Available",
            `A new version ${versionNum ? `(${versionNum}) ` : ""}is available. Would you like to update now?`,
            [
                { text: "Later", style: "cancel" },
                { text: "Update Now", onPress: () => _openUpdateUrl(url) },
            ],
            { cancelable: true }
        );
    };

    useEffect(() => {
        const fetchUpdateStatus = async () => {
            setIsLoading(true);
            setError(null);
            setUpdateStatus("Checking...");
            setUpdateUrl(null);
            setNewVersion(null);
            setAlertShownForCurrentCheck(false);

            if (!version || version === "?.?.?") {
                setError("App version not found.");
                setUpdateStatus(null);
                setIsLoading(false);
                return;
            }
            const payload = { version: `v${version}` };
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: API_HEADERS,
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const statusValue = data.status || "unknown";
                const messageValue = data.message || data.status || "Unknown status";
                const fetchedUrl = data.url || null;
                const fetchedVersion = data.version || null;

                setUpdateStatus(messageValue);
                if (statusValue === "has_update" && fetchedUrl) {
                    setUpdateUrl(fetchedUrl);
                    setNewVersion(fetchedVersion);
                    setTimeout(() => {
                        if (!alertShownForCurrentCheck) {
                            showUpdateConfirmationAlert(fetchedUrl, fetchedVersion);
                            setAlertShownForCurrentCheck(true);
                        }
                    }, 100);
                }
            } catch (err: any) {
                console.error("Update check failed:", err); // Keep console error for debugging
                setError("Failed to check updates.");
                setUpdateStatus(null);
                setUpdateUrl(null);
                setNewVersion(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUpdateStatus();
    }, [version]);

    const renderStatusAndAction = () => {
        if (isLoading && updateStatus === "Checking...") {
            return <ActivityIndicator size="small" color="#666" style={{ marginLeft: 8 }} />;
        }
        if (error) {
            return <Text className="text-sm text-red-500 ml-2">({error})</Text>;
        }
        if (updateUrl) {
            return (
                <View className="flex-row items-center ml-2">
                    <Text className="text-sm text-orange-500">Update Available</Text>
                </View>
            );
        }
        if (updateStatus && updateStatus !== "Checking...") {
            const lowerCaseStatus = updateStatus.toLowerCase();
            if (lowerCaseStatus.includes("up to date") || lowerCaseStatus === "up_to_date" || lowerCaseStatus === "no_update") {
                return null;
            }
            let statusColor = "text-gray-500";
            if (lowerCaseStatus.includes("error") || lowerCaseStatus.includes("failed")) {
                statusColor = "text-red-500";
            }
            return <Text className={`text-sm ${statusColor} ml-2`}>({updateStatus})</Text>;
        }
        return null;
    };

    return (
        <View className="flex-row items-center">
            <Image source={require("@/assets/images/genius-image.png")} className="w-12 h-12" resizeMode="contain" />
            <Text className="text-2xl font-extrabold text-black">Metering</Text>
            <Text className="text-sm text-gray-500 ml-2">v{version}</Text>
            {renderStatusAndAction()}
        </View>
    );
};
