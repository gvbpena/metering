import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useProfile from "@/services/profile";

const ProfilePage = () => {
    const { data, confirmLogout } = useProfile();
    const fields = [
        { icon: "person-outline" as const, title: "Name", value: data[0]?.name || "N/A" },
        { icon: "mail-outline" as const, title: "Email", value: data[0]?.email || "N/A" },
        { icon: "shield-checkmark-outline" as const, title: "Role", value: data[0]?.role || "N/A" },
        { icon: "id-card-outline" as const, title: "ID Number", value: data[0]?.id || "N/A" },
    ];

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: () => <Text className="text-3xl font-bold text-gray-900 ml-2">My Profile</Text>,
                }}
            />
            <View className="flex-1 bg-white px-8 py-12">
                <View className="mt-10 space-y-6">
                    {fields.map((field, index) => (
                        <View key={index} className="bg-gray-50 border border-gray-300 p-6 rounded-3xl shadow-md flex-row items-center my-5">
                            <Ionicons name={field.icon} size={32} color="#6B7280" />
                            <View className="ml-6">
                                <Text className="text-lg font-semibold text-gray-700">{field.title}</Text>
                                <Text className="text-base text-gray-500">{field.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={confirmLogout}
                    className="mt-8 flex-row items-center py-5 px-8 rounded-3xl shadow-lg border bg-red-600 border-red-600"
                >
                    <Ionicons name="log-out-outline" size={24} color="#ffffff" />
                    <Text className="flex-1 text-xl font-medium ml-4 text-white">Logout</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>
        </>
    );
};

export default ProfilePage;
