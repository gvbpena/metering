import React, { useState, useEffect } from "react";
import { View, TextInput, Image, Pressable, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
                    router.replace("/profile/change_password");
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
        <View className="flex-1 justify-center px-5 bg-gray-100">
            <View className="flex justify-center items-center mb-6">
                <Image source={require("../assets/images/genius-image(smallerversion).png")} style={{ width: 80, aspectRatio: 1 }} />
                <Text className="text-xl font-bold text-center text-gray-700 mt-2">Metering</Text>
            </View>

            <View className="mb-3 flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-300">
                <Icon name="account" size={24} color="gray" className="mr-4" />
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    className="flex-1 text-gray-800 text-base"
                    placeholderTextColor="gray"
                    autoCapitalize="none"
                />
            </View>

            <View className="mb-3 flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-300">
                <Icon name="lock" size={24} color="gray" className="mr-4" />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-gray-800 text-base"
                    placeholderTextColor="gray"
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} className="ml-4">
                    <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                </Pressable>
            </View>

            {error ? <Text className="text-red-600 mb-4 text-center">{error}</Text> : null}

            {loading ? (
                <Pressable className="bg-[#0066A0] rounded-xl py-4 mb-4 flex justify-center items-center opacity-70" disabled>
                    <ActivityIndicator size="small" color="#fff" />
                </Pressable>
            ) : (
                <Pressable className="bg-[#0066A0] rounded-xl py-4 mb-4 flex justify-center items-center" onPress={handleLogin} disabled={isLoadingIdentifier}>
                    <Text className="text-white text-lg font-semibold">Login</Text>
                </Pressable>
            )}

            <Text className="mt-1 text-center text-gray-500 text-sm">
                ©{new Date().getFullYear()} • All rights reserved •{"\n"} Powered by Genius
            </Text>
        </View>
    );
}
