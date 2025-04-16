import { Tabs } from "expo-router";
import { SyncProvider } from "@/context/_syncContextv2";
import { NetworkProvider } from "@/context/_internetStatusContext";
import { View, Text, ActivityIndicator, Linking, Alert, Image, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants from "expo-constants";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NetworkProvider>
                <SyncProvider>
                    <Tabs
                        tabBar={(props) => <AnimatedTabBar {...props} />}
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
    const version = Constants.expoConfig?.version || "?.?.?";
    const [updateStatus, setUpdateStatus] = useState<string | null>("Checking...");
    const [updateUrl, setUpdateUrl] = useState<string | null>(null);
    const [alertShown, setAlertShown] = useState(false);

    useEffect(() => {
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

        checkForUpdate();
    }, [version]);

    return (
        <View className="flex-row items-center">
            <Image source={require("@/assets/images/genius-image.png")} className="w-12 h-12" resizeMode="contain" />
            <Text className="text-2xl font-extrabold text-black">Genius Electrician Tool</Text>
            <Text className="text-sm text-gray-500 ml-2">v{version}</Text>
            {updateStatus === "Checking..." ? (
                <ActivityIndicator size="small" color="#666" style={{ marginLeft: 8 }} />
            ) : updateStatus && updateStatus !== "Up to date" ? (
                <Text className="text-sm text-orange-500 ml-2">{updateStatus}</Text>
            ) : null}
        </View>
    );
};

const AnimatedTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const scales = state.routes.map((_, index) => useSharedValue(state.index === index ? 1.2 : 1));

    useEffect(() => {
        scales.forEach((scale, i) => {
            scale.value = withTiming(state.index === i ? 1.2 : 1, { duration: 200 });
        });
    }, [state.index]);

    return (
        <View className="flex-row h-[60px] border-t border-gray-200 bg-white">
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.title ?? route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    if (!isFocused) {
                        navigation.navigate(route.name);
                    }
                };

                const icon = options.tabBarIcon?.({
                    color: isFocused ? "#0066A0" : "gray",
                    size: 18,
                    focused: isFocused,
                });

                const animatedStyle = useAnimatedStyle(() => ({
                    transform: [{ scale: scales[index].value }],
                }));

                return (
                    <TouchableOpacity key={index} onPress={onPress} className="flex-1 items-center justify-center" activeOpacity={0.7}>
                        <Animated.View style={animatedStyle}>{icon}</Animated.View>
                        <Text className={`text-sm mt-1 ${isFocused ? "text-[#0066A0] font-semibold" : "text-gray-400"}`}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
