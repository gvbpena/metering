import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";

const ClientAddressPage = () => {
    const { formData, dispatch } = useFormData();
    const [showError, setShowError] = useState(false);
    const allFields: (keyof typeof formData)[] = [
        "CustomerAddress",
        "CityMunicipality",
        "Barangay",
        "StreetHouseUnitNo",
        "SitioPurokBuildingSubdivision",
        "LandMark",
    ];
    const requiredFields: (keyof typeof formData)[] = ["CustomerAddress", "CityMunicipality", "Barangay", "StreetHouseUnitNo"];
    const isFormComplete = requiredFields.every((field) => (formData[field] || "").trim() !== "");

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        dispatch({ type: "SET_INPUT_FIELD", field, payload: value });
    };

    return (
        <>
            <StackScreen
                title="Customer Address"
                nextRoute="/(electricianv2)_setup/page6"
                nextLabel="Next"
                onNext={() => {
                    if (!isFormComplete) {
                        setShowError(true);
                        return false;
                    }
                    return true;
                }}
            />

            <View className="flex-1 bg-gray-50">
                <ScrollView className="p-8 space-y-8" contentContainerStyle={{ paddingBottom: 30 }}>
                    {allFields.map((field) => (
                        <View key={field} className="my-3">
                            <Text className="text-gray-700 text-lg font-semibold capitalize mb-2">
                                {field.replace(/([A-Z])/g, " $1").trim()} {requiredFields.includes(field) && <Text className="text-red-500">*</Text>}
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

export default ClientAddressPage;
