import { NetworkProvider } from "@/context/_internetStatusContext";
import { SyncProvider } from "@/context/_syncContextv2";
import useProfile from "@/services/profile";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Constants from "expo-constants";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NetworkProvider>
                <SyncProvider>
                    <Tabs
                        // tabBar={(props) => <AnimatedTabBar {...props} />}
                        screenOptions={{
                            headerTitle: () => <NetworkStatusTitle />,
                        }}
                    >
                        <Tabs.Screen
                            name="index"
                            options={{
                                title: "Home",
                                tabBarIcon: ({ color, size, focused }) => <Ionicons name="home" size={focused ? 18 : 16} color={color} />,
                            }}
                        />
                        <Tabs.Screen
                            name="profile"
                            options={{
                                title: "Profile",
                                tabBarIcon: ({ color, size, focused }) => <Ionicons name="person" size={focused ? 18 : 16} color={color} />,
                            }}
                        />
                    </Tabs>
                </SyncProvider>
            </NetworkProvider>
        </GestureHandlerRootView>
    );
}

const NetworkStatusTitle = () => {
    const { data } = useProfile();
    const version = Constants.expoConfig?.version || "?.?.?";
    const [updateStatus, setUpdateStatus] = useState<string | null>("Checking...");
    const [updateUrl, setUpdateUrl] = useState<string | null>(null);
    const [alertShown, setAlertShown] = useState(false);

    useEffect(() => {
        if (!data || !data[0]?.id) return;

        const checkAccountStatus = async () => {
            try {
                const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_update/metering_check_status.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: data[0].id }),
                });

                const result = await response.json();
                if (!result.success && result.status !== "authorized") {
                    setAlertShown(true);
                    Alert.alert(
                        "Account Status",
                        "Your account is not authorized. Please contact support.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    BackHandler.exitApp();
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                }
            } catch (error) {
                console.error("Error checking account status:", error);
                Alert.alert("Error", "Failed to check account status.");
            }
        };

        const checkForUpdate = async () => {
            if (!version || version === "?.?.?") return;

            try {
                const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_update/metering_checkupdate.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ version: `v${version}` }),
                });

                const data = await response.json();
                const hasUpdate = data.status === "has_update" && data.url;

                if (hasUpdate) {
                    setUpdateUrl(data.url);
                    setUpdateStatus("Update Available");
                    if (!alertShown) {
                        Alert.alert("Update Available", `New version (${data.version}) is available. Update now?`, [
                            { text: "Later", style: "cancel" },
                            { text: "Update Now", onPress: () => Linking.openURL(data.url) },
                        ]);
                        setAlertShown(true);
                    }
                } else {
                    setUpdateStatus("Up to date");
                }
            } catch (error) {
                setUpdateStatus("Failed to check");
            }
        };

        checkAccountStatus();
        checkForUpdate();
    }, [data, version]);

    return (
        <View className="flex-row items-center">
            <Image source={require("@/assets/images/newlogo.png")} className="w-16 h-16" resizeMode="contain" />
            <Text className="text-2xl font-extrabold text-black">Electrician Tool</Text>
            <Text className="text-sm text-gray-500 ml-2">v{version}</Text>
            {updateStatus === "Checking..." ? (
                <ActivityIndicator size="small" color="#666" style={{ marginLeft: 8 }} />
            ) : updateStatus && updateStatus !== "Up to date" ? (
                <Text className="text-sm text-orange-500 ml-2">{updateStatus}</Text>
            ) : null}
        </View>
    );
};
