import React, { useState, useEffect } from "react";
import { View, TextInput, Image, Pressable, ActivityIndicator, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import useProfile from "@/services/profile";

interface QueryResult {
    count: number;
}

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [deviceIdentifier, setDeviceIdentifier] = useState<string | null>(null);
    const [isLoadingIdentifier, setIsLoadingIdentifier] = useState<boolean>(true);

    const router = useRouter();
    const database = useSQLiteContext();
    const { getModelName } = useProfile();

    useEffect(() => {
        const fetchDeviceIdentifier = async () => {
            setIsLoadingIdentifier(true);
            try {
                const identifier = await getModelName();
                setDeviceIdentifier(identifier);
            } catch (e) {
                console.error("Error fetching device identifier via hook:", e);
                setDeviceIdentifier("ErrorFetchingID");
            } finally {
                setIsLoadingIdentifier(false);
            }
        };
        fetchDeviceIdentifier();
    }, [getModelName]);

    const authLogin = async (id: any, name: any, username: any, email: any, crewname: any, orgname: any, role: any) => {
        try {
            const checkQuery = `SELECT COUNT(*) as count FROM metering_user WHERE id = ?`;
            const result: QueryResult[] = await database.getAllAsync(checkQuery, [id]);

            if (result[0].count === 0) {
                const insertQuery = `INSERT INTO metering_user (id, name, username, email, crewname, orgname, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                await database.runAsync(insertQuery, [id, name, username, email, crewname, orgname, role]);
            } else {
                const updateQuery = `UPDATE metering_user SET name = ?, username = ?, email = ?, crewname = ?, orgname = ?, role = ? WHERE id = ?`;
                await database.runAsync(updateQuery, [name, username, email, crewname, orgname, role, id]);
            }
        } catch (error) {
            console.error("Error inserting/updating user:", error);
            setError("Database error during login. Please try again.");
        }
    };

    const handleLogin = async () => {
        if (isLoadingIdentifier) {
            setError("Device information is still loading. Please wait a moment.");
            return;
        }

        setLoading(true);
        setError("");

        const url = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_user/user_login.php";
        const deviceInfo = deviceIdentifier || "unknown_device";

        const data = {
            username,
            password,
            device_model: deviceInfo,
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            const result = JSON.parse(text);

            if (result.status === "success" && result.user) {
                const { user_id, first_name, last_name, username: apiUsername, email, role, crew_name = "", org_name = "", new: isNew } = result.user;

                await authLogin(user_id, `${first_name} ${last_name}`, apiUsername, email, crew_name, org_name, role);

                if (isNew === true || isNew === "true") {
                    router.replace("/profile/change_password_new");
                } else {
                    switch (role) {
                        case "Electrician":
                            router.replace("/(electrician)" as any);
                            break;
                        default:
                            setError(`Unauthorized Role (${role}). Contact Support.`);
                    }
                }
            } else if (result.message) {
                setError(result.message || "Login failed. Please check your credentials.");
            } else {
                setError("Unknown login error occurred.");
            }
        } catch (err) {
            console.error("Network error:", err);
            setError("Failed to connect to the server. Check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-gray-50 justify-center px-6">
            <View className="items-center mb-8">
                <Image source={require("../assets/images/newlogo.png")} style={{ width: 160, height: 160, resizeMode: "contain" }} />
                <Text className="text-2xl font-semibold text-gray-900 mt-3">Electrician Tool</Text>
            </View>

            <View className="mb-4 bg-white border border-gray-200 rounded-xl flex-row items-center px-4 py-3 shadow-sm">
                <MaterialCommunityIcons name="account" size={22} color="gray" />
                <TextInput
                    placeholder="Username"
                    placeholderTextColor="#A0A0A0"
                    className="ml-3 flex-1 text-base text-gray-900"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            <View className="mb-4 bg-white border border-gray-200 rounded-xl flex-row items-center px-4 py-3 shadow-sm">
                <MaterialCommunityIcons name="lock" size={22} color="gray" />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    className="ml-3 flex-1 text-base text-gray-900"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={22} color="gray" />
                </Pressable>
            </View>

            {error ? <Text className="text-red-500 text-center mb-3">{error}</Text> : null}

            <Pressable
                onPress={handleLogin}
                disabled={loading || isLoadingIdentifier}
                className={`rounded-xl py-4 mb-6 flex items-center justify-center ${loading || isLoadingIdentifier ? "bg-gray-300" : "bg-[#0066A0]"}`}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold text-base">Login</Text>}
            </Pressable>

            <Text className="mt-1 text-center text-gray-500 text-sm">
                ©{new Date().getFullYear()} • All rights reserved •{"\n"} Powered by Genius
            </Text>
        </KeyboardAvoidingView>
    );
}
