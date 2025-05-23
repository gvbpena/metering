import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useSubmitData } from "./submit";

interface NavbarProps {
    title: string;
    nextRoute: string;
    nextLabel: string;
    onNext: () => boolean;
}

export default function Navbar({ title, nextRoute, nextLabel, onNext }: NavbarProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const iconName = nextLabel === "Next" ? "arrow-forward" : "checkmark";
    const { submitApplication } = useSubmitData();

    const handleNextPress = () => {
        if (nextLabel === "Done") {
            handleSubmit();
        } else if (!onNext()) {
            Alert.alert("Incomplete Form", "Please fill in all fields before proceeding.", [{ text: "OK" }]);
        } else if (nextRoute) {
            router.push(nextRoute as any);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitApplication();
            Alert.alert("Application submitted successfully.");
            router.replace("/(electrician)");
        } catch (error: unknown) {
            let errorMessage = "Failed to submit application.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            Alert.alert("Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const showNextButton = nextLabel === "Done" || onNext();

    return (
        <View className="flex-row items-center justify-between p-4 border-b border-gray-300 bg-white">
            <View className="w-1/4">
                <TouchableOpacity onPress={() => router.back()} className="p-3 flex-row items-center">
                    <Ionicons name="arrow-back" size={26} color="black" />
                    <Text className="ml-3 text-lg font-semibold">Prev</Text>
                </TouchableOpacity>
            </View>
            <View className="w-1/2 items-center">
                <Text className="text-xl font-bold">{title}</Text>
            </View>
            <View className="w-1/4 items-end">
                {showNextButton && (
                    <TouchableOpacity onPress={handleNextPress} className="p-3 flex-row items-center" disabled={loading}>
                        {loading ? <ActivityIndicator size="large" color="black" /> : <Text className="mr-3 text-lg font-semibold">{nextLabel}</Text>}
                        <Ionicons name={iconName} size={26} color="black" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
