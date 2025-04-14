import useProfile from "@/services/profile";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, StatusBar, ScrollView } from "react-native";

const ChangePasswordScreen: React.FC = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { data } = useProfile();

    useEffect(() => {
        Alert.alert("Welcome to Genius Metering", "Your secure password update starts here.", [{ text: "OK, Let's begin", style: "default" }]);
    }, []);

    const handleChangePassword = async () => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            Alert.alert("Error", "User data is not available.");
            return;
        }

        if (!newPassword || !confirmNewPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "New password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_user/change_password.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: data[0].id,
                    new_password: newPassword,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Something went wrong.");
            }

            Alert.alert("Success", result.message || "Password changed successfully!");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Text className="text-3xl font-bold text-[#0066A0] mb-8">Change Password</Text>
                    <Text>{data[0].id}</Text>
                    <View className="mb-6 space-y-2">
                        <Text className="text-sm font-medium text-gray-700">New Password</Text>
                        <TextInput
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-base text-gray-900"
                            placeholder="Enter your new password"
                            placeholderTextColor="#9CA3AF"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            textContentType="newPassword"
                            editable={!isLoading}
                        />
                        <Text className="text-xs text-gray-500 ml-1">Must be at least 8 characters long.</Text>
                    </View>

                    <View className="mb-8 space-y-2">
                        <Text className="text-sm font-medium text-gray-700">Confirm New Password</Text>
                        <TextInput
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-base text-gray-900"
                            placeholder="Confirm your new password"
                            placeholderTextColor="#9CA3AF"
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            textContentType="newPassword"
                            onSubmitEditing={handleChangePassword}
                            editable={!isLoading}
                        />
                    </View>

                    <TouchableOpacity
                        className={`w-full py-4 px-4 rounded-xl items-center justify-center ${isLoading ? "bg-gray-400" : "bg-[#0066A0] active:bg-[#005580]"}`}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        <Text className="text-base font-semibold text-white">{isLoading ? "Updating..." : "Update Password"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
