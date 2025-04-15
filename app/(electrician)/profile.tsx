import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, Image, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import useProfile from "@/services/profile";

const PRIMARY_COLOR = "#0066A0";

const ProfilePage = () => {
    const { data, handleLogout } = useProfile();
    const router = useRouter();
    const [logoutVisible, setLogoutVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (logoutVisible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5,
                tension: 100,
            }).start();
        } else {
            scaleAnim.setValue(0.8);
        }
    }, [logoutVisible]);

    const fields = [
        { icon: "person-outline" as const, title: "Name", value: data[0]?.name || "N/A" },
        { icon: "mail-outline" as const, title: "Email", value: data[0]?.email || "N/A" },
        { icon: "shield-checkmark-outline" as const, title: "Role", value: data[0]?.role || "N/A" },
        { icon: "id-card-outline" as const, title: "ID Number", value: data[0]?.id || "N/A" },
    ];

    return (
        <>
            <View className="flex-1 bg-gray-50 px-6 py-10">
                <Text className="text-3xl font-bold text-center">My Profile</Text>

                {fields.map((field, index) => (
                    <View key={index} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex-row items-start mt-4">
                        <Ionicons name={field.icon} size={28} color="#6B7280" />
                        <View className="ml-4">
                            <Text className="text-base font-medium text-gray-600">{field.title}</Text>
                            <Text className="text-lg font-semibold text-gray-900">{field.value}</Text>
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    onPress={() => router.push("/profile/change_password")}
                    className="mt-8 flex-row items-center justify-between py-5 px-6 rounded-2xl border border-[#0066A0] shadow-md"
                    style={{ backgroundColor: "#ffffff" }}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="key-outline" size={24} color={PRIMARY_COLOR} />
                        <Text className="text-lg font-semibold text-[#0066A0] ml-3">Change Password</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={PRIMARY_COLOR} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setLogoutVisible(true)}
                    className="mt-4 flex-row items-center justify-between py-5 px-6 rounded-2xl border bg-[#0066A0] border-[#0066A0] shadow-md"
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center">
                        <Ionicons name="log-out-outline" size={24} color="#ffffff" />
                        <Text className="text-lg font-semibold text-white ml-3">Logout</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <Modal animationType="fade" transparent={true} visible={logoutVisible} onRequestClose={() => setLogoutVisible(false)}>
                <BlurView intensity={90} tint="light" className="flex-1 justify-center items-center">
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }],
                            width: "85%",
                            backgroundColor: "white",
                            padding: 24,
                            borderRadius: 24,
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                        }}
                        className="border border-gray-300"
                    >
                        <Image
                            source={require("../../assets/images/logout.png")}
                            style={{
                                width: 120,
                                height: 120,
                                resizeMode: "contain",
                                marginBottom: 20,
                            }}
                        />
                        <Text className="text-2xl font-bold text-gray-800 mb-2">Are you sure?</Text>
                        <Text className="text-base text-gray-600 text-center mb-6">You will be logged out of your account.</Text>

                        <View className="flex-row space-x-4 mt-2 w-full">
                            <Pressable
                                onPress={() => setLogoutVisible(false)}
                                className="flex-1 py-3 border border-gray-300 bg-white"
                                style={{ paddingHorizontal: 20 }}
                            >
                                <Text className="text-center text-base font-semibold text-gray-700">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    setLogoutVisible(false);
                                    handleLogout();
                                }}
                                className="flex-1 py-3 bg-[#0066A0]"
                                style={{ paddingHorizontal: 20 }}
                            >
                                <Text className="text-center text-base font-semibold text-white">Logout</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </BlurView>
            </Modal>
        </>
    );
};

export default ProfilePage;
