import React, { useState } from "react";
import {
    View,
    TextInput,
    Image,
    Pressable,
    ActivityIndicator,
    Text,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Electrician");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError("");

        const url = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/register.php";
        const data = { first_name: firstName, last_name: lastName, username, email, password, role };
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.status === "success") {
                router.replace("/login");
            } else {
                setError(result.error || "An unexpected error occurred.");
            }
        } catch (error) {
            setError("Failed to connect to the server. Check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
            <View className="flex items-center mt-16 mb-8">
                <Image source={require("../assets/images/logo_genius.png")} className="w-36 h-36" resizeMode="contain" />
                <Text className="text-3xl font-bold text-gray-700 mt-3">Register</Text>
            </View>

            {[
                { icon: "account-outline", value: firstName, setValue: setFirstName, placeholder: "First Name" },
                { icon: "account-outline", value: lastName, setValue: setLastName, placeholder: "Last Name" },
                { icon: "account", value: username, setValue: setUsername, placeholder: "Username" },
                { icon: "email-outline", value: email, setValue: setEmail, placeholder: "Email" },
                { icon: "lock-outline", value: password, setValue: setPassword, placeholder: "Password", secure: true },
                { icon: "lock-check-outline", value: confirmPassword, setValue: setConfirmPassword, placeholder: "Confirm Password", secure: true },
            ].map(({ icon, value, setValue, placeholder, secure }, index) => (
                <View key={index} className="mb-3 flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-300">
                    <Icon name={icon} size={22} color="#6b7280" className="mr-3" />
                    <TextInput
                        placeholder={placeholder}
                        value={value}
                        onChangeText={setValue}
                        secureTextEntry={secure}
                        className="flex-1 text-gray-800 text-base"
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            ))}

            <View className="mb-3 bg-white rounded-lg border border-gray-300 px-3">
                <Picker selectedValue={role} onValueChange={setRole} className="text-gray-800 text-base">
                    {["Electrician", "Inspector", "Contractor", "Power Metering Engineer"].map((r) => (
                        <Picker.Item key={r} label={r} value={r} />
                    ))}
                </Picker>
            </View>

            {error ? <Text className="text-red-500 mb-3 text-center text-sm">{error}</Text> : null}

            <Pressable className="bg-red-500 rounded-lg py-3 mb-3 flex justify-center items-center" onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white text-base font-semibold">Register</Text>}
            </Pressable>

            <Pressable onPress={() => router.replace("/login")} className="mt-3 mb-6">
                <Text className="text-center text-gray-500 text-sm">
                    Already have an account? <Text className="text-red-500 font-semibold">Login</Text>
                </Text>
            </Pressable>
        </ScrollView>
    );
}
