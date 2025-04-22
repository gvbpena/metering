import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface NavbarProps {
    title: string;
    nextRoute?: string;
    nextLabel?: string;
    onNext: boolean;
    handleFunction?: () => Promise<void>;
}

export default function Navbar({ title, nextRoute, nextLabel, onNext, handleFunction }: NavbarProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const iconName = nextLabel === "Next" ? "arrow-forward" : "checkmark";

    const handleNextPress = async () => {
        if (loading || !onNext) return;
        setLoading(true);

        try {
            if (nextLabel === "Save" && handleFunction) {
                await handleFunction();
                router.replace(nextRoute as any);
            } else if (nextLabel === "Endorse" && handleFunction) {
                await handleFunction();
            } else if (nextLabel === "Next") {
                router.replace(nextRoute as any);
            }
        } catch (error) {
            console.error("Error during handleNextPress:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getNextLabelClasses = () => {
        let baseClasses = "mr-3 text-lg";
        if (nextLabel === "Endorse") {
            return `${baseClasses} font-black text-blue-700`;
        } else {
            return `${baseClasses} font-semibold`;
        }
    };

    return (
        <View className="flex-row items-center justify-between p-4 border-b border-gray-300 bg-white relative">
            <TouchableOpacity onPress={() => router.back()} className="p-3 flex-row items-center">
                <Ionicons name="arrow-back" size={28} color="black" />
                <Text className="ml-3 text-lg font-semibold">Prev</Text>
            </TouchableOpacity>
            <View className="absolute left-1/2 -translate-x-1/2">
                <Text className="text-xl font-bold">{title}</Text>
            </View>
            {onNext ? (
                <TouchableOpacity onPress={handleNextPress} className="p-3 flex-row items-center" disabled={loading}>
                    {loading ? (
                        <ActivityIndicator size="large" color="black" />
                    ) : (
                        <Text className={getNextLabelClasses()}>{nextLabel === "Endorse" ? nextLabel.toUpperCase() : nextLabel}</Text>
                    )}
                    {!loading && <Ionicons name={iconName} size={28} color={nextLabel === "Endorse" ? "blue" : "black"} />}
                </TouchableOpacity>
            ) : (
                <View className="w-12 h-10" />
            )}
        </View>
    );
}
