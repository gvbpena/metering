import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";
import { Ionicons } from "@expo/vector-icons";

const ParentsDetailsPage: React.FC = () => {
    const { formData, dispatch } = useFormData();
    const [showError, setShowError] = useState(false);
    const [hasRepresentative, setHasRepresentative] = useState(false);

    const requiredFields: (keyof typeof formData)[] = [
        "FatherFirstName",
        "FatherMiddleName",
        "FatherLastName",
        "MotherFirstName",
        "MotherMiddleName",
        "MotherLastName",
    ];

    const representativeFields: (keyof typeof formData)[] = [
        "RepresentativeFirstName",
        "RepresentativeMiddleName",
        "RepresentativeLastName",
        "RepresentativeRelationship",
        "RepresentativeMobile",
        "RepresentativeEmail",
        // "RepresentativeAttachedID",
        // "RepresentativeSpecialPowerOfAttorney",
    ];

    const isFormComplete = requiredFields.every((field) => (formData[field] || "").trim() !== "");
    const isRepresentativeComplete = !hasRepresentative || representativeFields.every((field) => (formData[field] || "").trim() !== "");

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        dispatch({ type: "SET_INPUT_FIELD", field, payload: value });
    };

    return (
        <>
            <StackScreen
                title="Parents Details"
                nextRoute="/(electrician)_setup/page5"
                nextLabel="Next"
                onNext={() => {
                    if (!isFormComplete || !isRepresentativeComplete) {
                        setShowError(true);
                        return false;
                    }
                    return true;
                }}
            />

            <View className="flex-1 bg-gray-50">
                <ScrollView className="p-8 space-y-8" contentContainerStyle={{ paddingBottom: 30 }}>
                    {requiredFields.map((field) => (
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
                    <TouchableOpacity
                        onPress={() => setHasRepresentative(!hasRepresentative)}
                        className="mt-5 flex-row items-center justify-center border border-gray-300 bg-white py-4 rounded-xl"
                    >
                        <Ionicons name={hasRepresentative ? "person-remove" : "person-add"} size={22} color="black" />
                        <Text className="text-black text-lg font-bold ml-3">{hasRepresentative ? "Remove Representative" : "Has Representative?"}</Text>
                    </TouchableOpacity>

                    {hasRepresentative && (
                        <View className="mt-8">
                            <Text className="text-xl font-bold text-gray-800">Representative Information</Text>
                            {representativeFields.map((field) => (
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
                        </View>
                    )}
                    {showError && (!isFormComplete || !isRepresentativeComplete) && (
                        <Text className="text-red-500 text-base">Please fill in all required fields before proceeding.</Text>
                    )}
                </ScrollView>
            </View>
        </>
    );
};

export default ParentsDetailsPage;
