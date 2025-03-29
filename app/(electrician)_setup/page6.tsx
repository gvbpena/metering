import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";
import { useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

// Define API constants
const API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_nodes.php";
const API_KEY = "QosSAiS4kjArpMCr";

// Define types
type FormDataType = {
    reference_pole?: string;
    NearMeterNo?: string;
    pole_longitude?: string;
    TraversingWire?: "Yes" | "No";
    DeceasedLotOwner?: "Yes" | "No";
};

type NodeType = {
    PoleNumber: string;
    Latitude: string;
    Longitude: string;
};

const MeteringLocationPage: React.FC = () => {
    const router = useRouter();
    const { formData, dispatch } = useFormData();
    const [showError, setShowError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState<NodeType[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);

    const requiredFields: (keyof FormDataType)[] = ["NearMeterNo", "TraversingWire", "DeceasedLotOwner"];
    const isFormComplete = requiredFields.every((field) => (formData[field] || "").trim() !== "");

    const handleInputChange = (field: keyof FormDataType, value: string) => {
        dispatch({ type: "SET_INPUT_FIELD", field, payload: value });
    };

    const handleNext = () => {
        if (!isFormComplete) {
            setShowError(true);
            return false;
        }
        return true;
    };

    return (
        <>
            <StackScreen title="Additional Information" nextRoute="/(electrician)_setup/preview" nextLabel="Next" onNext={handleNext} />
            <View className="flex-1 bg-gray-50">
                <ScrollView className="p-8 space-y-8" contentContainerStyle={{ paddingBottom: 30 }}>
                    {["TraversingWire", "DeceasedLotOwner"].map((field) => (
                        <View key={field} className="my-3">
                            <Text className="text-gray-700 text-lg font-semibold capitalize mb-2">
                                {field.replace(/([A-Z])/g, " $1").trim()} <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex-row rounded-xl border border-gray-300 overflow-hidden">
                                {["Yes", "No"].map((option, index) => (
                                    <TouchableOpacity
                                        key={option}
                                        className={`flex-1 p-5 items-center justify-center 
                                    ${formData[field as keyof FormDataType] === option ? "bg-red-200" : "bg-white"} 
                                    ${index === 0 ? "border-r border-gray-300" : ""}`}
                                        onPress={() => handleInputChange(field as keyof FormDataType, option)}
                                    >
                                        <Text
                                            className={`text-lg font-semibold ${
                                                formData[field as keyof FormDataType] === option ? "text-red-600" : "text-gray-900"
                                            }`}
                                        >
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {requiredFields
                        .filter((field) => field !== "reference_pole" && field !== "DeceasedLotOwner" && field !== "TraversingWire")
                        .map((field) => (
                            <View key={field} className="my-3">
                                <Text className="text-gray-700 text-lg font-semibold capitalize mb-2">
                                    {field.replace(/([A-Z])/g, " $1").trim()} <Text className="text-red-500">*</Text>
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-xl px-5 py-5 bg-white text-lg text-gray-900"
                                    value={formData[field] || ""}
                                    onChangeText={(text) => handleInputChange(field, text)}
                                    placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        ))}

                    {showError && !isFormComplete && <Text className="text-red-500 text-base">Please fill in all required fields before proceeding.</Text>}
                </ScrollView>
            </View>
        </>
    );
};

export default MeteringLocationPage;
