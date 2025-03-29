import React, { useState } from "react";
import { View, TextInput, Image, Pressable, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSQLiteContext } from "expo-sqlite";

interface QueryResult {
    count: number;
}

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const database = useSQLiteContext();

    const authLogin = async (id: any, name: any, username: any, email: any, crewname: any, orgname: any, role: any) => {
        try {
            const checkQuery = `SELECT COUNT(*) as count FROM metering_user WHERE id = ?`;
            const result: QueryResult[] = await database.getAllSync(checkQuery, [id]);

            if (result[0].count === 0) {
                const insertQuery = `INSERT INTO metering_user (id, name, username, email, crewname, orgname, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                await database.runAsync(insertQuery, [id, name, username, email, crewname, orgname, role]);
            } else {
                const updateQuery = `UPDATE metering_user SET role = ? WHERE id = ?`;
                await database.runAsync(updateQuery, [role, id]);
            }
            switch (role) {
                case "Electrician":
                    router.replace("/(electricianv2)" as any);
                    break;
                // case "Inspector":
                //     router.replace("/(inspector)");
                //     break;
                // case "Contractor":
                //     router.replace("/(contractor)" as any);
                //     break;
                // case "Power Metering Engineer":
                //     router.replace("/(home)");
                //     break;
                default:
                    setError("Unauthorized Role. Contact Support.");
            }
        } catch (error) {
            console.error("Error inserting/updating user:", error);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        setError("");

        const url = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_user/user_login.php";
        const data = { username, password };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            console.log("Raw response:", text);

            try {
                // const result = JSON.parse(text);
                // console.log("Parsed JSON response:", result);

                // if (result.status === "success" && result.data) {
                //     const { id, name, username, email, crewname, orgname, role } = result.data;
                //     await authLogin(id, name, username, email, crewname, orgname, role);
                // } else if (result.error) {
                //     setError(result.error);
                // }
                const result = JSON.parse(text);
                console.log("Parsed JSON response:", result);

                if (result.status === "success" && result.user) {
                    const { user_id, first_name, last_name, username, email, role } = result.user;
                    await authLogin(user_id, `${first_name} ${last_name}`, username, email, "", "", role);
                } else if (result.message) {
                    setError(result.message);
                }
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError);
                setError("Invalid server response. Please contact support.");
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
            <View className="flex justify-center items-center mb-8">
                <Image source={require("../assets/images/logo_genius.png")} style={{ width: 200, height: undefined, aspectRatio: 1 }} resizeMode="contain" />
                <Text className="text-3xl font-extrabold text-center text-gray-700"> Metering</Text>
            </View>
            <View className="mb-3 flex-row items-center bg-white rounded-lg px-4 py-3 border border-gray-300">
                <Icon name="account" size={24} color="gray" className="mr-4" />
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    className="flex-1 text-gray-800 text-base"
                    placeholderTextColor="gray"
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
            {error ? <Text className="text-[#EA4335] mb-4 text-center">{error}</Text> : null}
            {loading ? (
                <Pressable className="bg-[#EA4335] rounded-xl py-4 mb-4 flex justify-center items-center" disabled>
                    <ActivityIndicator size="small" color="#fff" />
                </Pressable>
            ) : (
                <Pressable className="bg-[#EA4335] rounded-xl py-4 mb-4 flex justify-center items-center" onPress={handleLogin}>
                    <Text className="text-white text-lg font-semibold">Login</Text>
                </Pressable>
            )}
            <Pressable onPress={() => router.replace("/register" as any)} className="mt-4">
                <Text className="text-center text-gray-500 text-sm">
                    Don't have an account? <Text className="text-[#EA4335] font-semibold">Register</Text>
                </Text>
            </Pressable>
            <Text className="mt-5 text-center text-gray-500 text-sm">@2025 • All rights reserved •{"\n"} Powered by Genius</Text>
        </View>
    );
}
