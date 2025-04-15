import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router"; // ✅ Added useRouter
import { Ionicons } from "@expo/vector-icons";
import useProfile from "@/services/profile";

const PRIMARY_COLOR = "#0066A0";

const ProfilePage = () => {
    const { data, confirmLogout } = useProfile();
    const router = useRouter(); // ✅

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

            <View className="flex-1 bg-gray-50 px-6 py-10">
                {fields.map((field, index) => (
                    <View key={index} className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex-row items-start my-2">
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
                    onPress={confirmLogout}
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
        </>
    );
};

export default ProfilePage;
