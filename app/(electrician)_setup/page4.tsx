import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";
import { Ionicons } from "@expo/vector-icons";

const ParentsDetailsPage: React.FC = () => {
    const { formData, dispatch } = useFormData();
    const [showError, setShowError] = useState(false);
    const hasRepresentative = formData.has_representative === "Yes";

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
    ];

    const isFormComplete = requiredFields.every((field) => {
        const value = formData[field];
        return typeof value === "string" && value.trim() !== "";
    });

    const isRepresentativeComplete =
        !hasRepresentative ||
        representativeFields.every((field) => {
            const value = formData[field];
            return typeof value === "string" && value.trim() !== "";
        });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        dispatch({ type: "SET_INPUT_FIELD", field, payload: value });
    };

    const toggleHasRepresentative = () => {
        const newValue = formData.has_representative === "Yes" ? "No" : "Yes";
        dispatch({ type: "SET_INPUT_FIELD", field: "has_representative", payload: newValue });
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
                    setShowError(false);
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
                                className={`border ${
                                    showError && typeof formData[field] === "string" && formData[field]?.trim() === "" ? "border-red-500" : "border-gray-300"
                                } rounded-xl px-5 py-5 bg-white text-lg text-gray-900`}
                                value={(formData[field] as string) || ""}
                                onChangeText={(text) => handleInputChange(field, text)}
                                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                                placeholderTextColor="#9CA3AF"
                            />
                            {showError && typeof formData[field] === "string" && formData[field]?.trim() === "" && (
                                <Text className="text-red-500 text-sm mt-1">This field is required.</Text>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={toggleHasRepresentative}
                        className="mt-5 flex-row items-center justify-center border border-gray-300 bg-white py-4 rounded-xl"
                    >
                        <Ionicons name={hasRepresentative ? "person-remove" : "person-add"} size={22} color="black" />
                        <Text className="text-black text-lg font-bold ml-3">{hasRepresentative ? "Remove Representative" : "Add Representative"}</Text>
                    </TouchableOpacity>

                    {hasRepresentative && (
                        <View className="mt-8">
                            <Text className="text-xl font-bold text-gray-800 mb-4">Representative Information</Text>
                            {representativeFields.map((field) => (
                                <View key={field} className="my-3">
                                    <Text className="text-gray-700 text-lg font-semibold capitalize mb-2">
                                        {field.replace(/([A-Z])/g, " $1").trim()} <Text className="text-red-500">*</Text>
                                    </Text>
                                    <TextInput
                                        className={`border ${
                                            showError && typeof formData[field] === "string" && formData[field]?.trim() === ""
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        } rounded-xl px-5 py-5 bg-white text-lg text-gray-900`}
                                        value={(formData[field] as string) || ""}
                                        onChangeText={(text) => handleInputChange(field, text)}
                                        placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType={
                                            field === "RepresentativeEmail" ? "email-address" : field === "RepresentativeMobile" ? "number-pad" : "default"
                                        }
                                    />
                                    {showError && typeof formData[field] === "string" && formData[field]?.trim() === "" && (
                                        <Text className="text-red-500 text-sm mt-1">This field is required.</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {showError && (!isFormComplete || !isRepresentativeComplete) && (
                        <Text className="text-red-500 text-base text-center font-semibold mt-4">Please fill in all required fields marked with *.</Text>
                    )}
                </ScrollView>
            </View>
        </>
    );
};

export default ParentsDetailsPage;
