import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useProfile from "@/services/profile";
import { useRouter } from "expo-router";
import Modal from "react-native-modal";

const ChangePasswordScreen: React.FC = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(true);
    const { data } = useProfile();
    const router = useRouter();

    useEffect(() => {
        setIsModalVisible(true);
    }, []);

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleChangePassword = async () => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            setErrorMessage("User data is not available.");
            return;
        }

        if (!newPassword || !confirmNewPassword) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorMessage("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

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

            Alert.alert(
                "Success",
                "Password updated successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace("(electrician)/" as any);
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error: any) {
            setErrorMessage(error.message);
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
                    <Text className="text-4xl font-bold text-[#0066A0] mb-8">Change Password</Text>

                    <View className="mb-6 space-y-2">
                        <Text className="text-lg font-medium text-gray-700">New Password</Text>
                        <View className="relative">
                            <TextInput
                                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-lg text-gray-900"
                                placeholder="Enter your new password"
                                placeholderTextColor="#9CA3AF"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                textContentType="newPassword"
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                onPress={() => setShowNewPassword(!showNewPassword)}
                            >
                                <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                        {errorMessage && <Text className="text-xs text-red-500 mt-1">{errorMessage}</Text>}
                    </View>

                    <View className="mb-8 space-y-2">
                        <Text className="text-lg font-medium text-gray-700">Confirm New Password</Text>
                        <View className="relative">
                            <TextInput
                                className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-lg text-gray-900"
                                placeholder="Confirm your new password"
                                placeholderTextColor="#9CA3AF"
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={!showConfirmNewPassword}
                                autoCapitalize="none"
                                textContentType="newPassword"
                                onSubmitEditing={handleChangePassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            >
                                <Ionicons name={showConfirmNewPassword ? "eye-off" : "eye"} size={28} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`w-full py-4 px-4 rounded-xl items-center justify-center ${isLoading ? "bg-gray-400" : "bg-[#0066A0] active:bg-[#005580]"}`}
                        onPress={handleChangePassword}
                        disabled={isLoading}
                    >
                        <Text className="text-lg font-semibold text-white">{isLoading ? "Updating..." : "Update Password"}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={closeModal}
                animationIn="zoomIn"
                animationOut="zoomOut"
                backdropOpacity={0.5}
                style={{ justifyContent: "center", alignItems: "center", margin: 0 }}
            >
                <View className="bg-white p-8 rounded-xl shadow-lg w-3/4">
                    <Text className="text-3xl font-semibold text-[#0066A0] mb-6">Welcome to Electrician Tool</Text>
                    <Text className="text-lg text-gray-600 mb-8">
                        You need to change your password to ensure security. Please enter your new password and confirm it. Once updated, you'll have full
                        access to the application and all its features.
                    </Text>
                    <TouchableOpacity className="bg-[#0066A0] py-3 px-8 rounded-xl" onPress={closeModal}>
                        <Text className="text-white text-lg font-semibold">OK, Let's Begin</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
