import React, { useState, useCallback } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";

export const MaritalStatus = ["Single", "Married", "Widowed", "Divorced"];

interface FormData {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    Birthdate: string;
    MaritalStatus: string;
    MobileNo: string;
    LandlineNo: string;
    Email: string;
}

const requiredFields: (keyof FormData)[] = ["FirstName", "LastName", "Birthdate", "MaritalStatus", "MobileNo", "Email"];

const FormLabel = React.memo(({ field, label }: { field: keyof FormData; label: string }) => (
    <Text className="text-gray-700 text-sm font-bold capitalize mb-1">
        {label} {requiredFields.includes(field) && <Text className="text-red-500">*</Text>}
    </Text>
));

const Page2 = () => {
    const { formData, dispatch } = useFormData();

    const defaultData: FormData = {
        FirstName: formData.FirstName || "",
        MiddleName: formData.MiddleName || "",
        LastName: formData.LastName || "",
        Suffix: formData.Suffix || "",
        Birthdate: formData.Birthdate || "",
        MaritalStatus: formData.MaritalStatus || "",
        MobileNo: formData.MobileNo || "",
        LandlineNo: formData.LandlineNo || "",
        Email: formData.Email || "",
    };

    const [localData, setLocalData] = useState<FormData>(defaultData);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [openMaritalStatus, setOpenMaritalStatus] = useState(false);
    const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});

    const validateForm = () => {
        let valid = true;
        let newErrors: { [key in keyof FormData]?: string } = {};

        requiredFields.forEach((field) => {
            if (!localData[field].trim()) {
                newErrors[field] = "This field is required";
                valid = false;
            }
        });

        setErrors(newErrors);
        return valid;
    };

    const saveData = useCallback(() => {
        if (!validateForm()) return false;
        dispatch({ type: "SET_FORM_DATA", payload: localData });
        return true;
    }, [localData, dispatch]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setLocalData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
        dispatch({ type: "SET_FORM_DATA", payload: localData });
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setLocalData((prev) => ({ ...prev, Birthdate: selectedDate.toISOString().split("T")[0] }));
            setErrors((prev) => ({ ...prev, Birthdate: "" }));
        }
        setShowDatePicker(false);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StackScreen title="Customer Details" nextRoute="/(electrician)_setup/page4" nextLabel="Next" onNext={() => true} />
            <ScrollView className="p-8 space-y-8" contentContainerStyle={{ paddingBottom: 60 }}>
                {["FirstName", "MiddleName", "LastName", "Suffix"].map((field) => (
                    <View key={field} className="my-3">
                        <FormLabel field={field as keyof FormData} label={field.replace(/([A-Z])/g, " $1").trim()} />
                        <TextInput
                            className="border border-gray-300 rounded-xl px-5 py-5 bg-white text-lg text-gray-900"
                            value={localData[field as keyof FormData]}
                            onChangeText={(text) => handleInputChange(field as keyof FormData, text)}
                            placeholder={`Enter ${field}`}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="default"
                            autoCapitalize="words"
                        />
                        {errors[field as keyof FormData] && <Text className="text-red-500 text-sm">{errors[field as keyof FormData]}</Text>}
                    </View>
                ))}

                <View className="my-3">
                    <FormLabel field="Birthdate" label="Birthdate" />
                    <TouchableOpacity className="border border-gray-300 rounded-xl px-5 py-5 bg-white" onPress={() => setShowDatePicker(true)}>
                        <Text className="text-lg text-gray-900">{localData.Birthdate || "Select Date"}</Text>
                    </TouchableOpacity>
                    {errors.Birthdate && <Text className="text-red-500 text-sm">{errors.Birthdate}</Text>}
                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date(localData.Birthdate || Date.now())}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleDateChange}
                        />
                    )}
                </View>
                <View className="my-3">
                    <FormLabel field="MaritalStatus" label="Marital Status" />
                    <DropDownPicker
                        open={openMaritalStatus}
                        value={localData.MaritalStatus}
                        items={MaritalStatus.map((status) => ({ label: status, value: status }))}
                        setOpen={setOpenMaritalStatus}
                        setValue={(callback) => handleInputChange("MaritalStatus", callback(localData.MaritalStatus))}
                        placeholder="Select Marital Status"
                        style={{
                            backgroundColor: "white",
                            borderColor: "#d1d5db",
                            borderWidth: 1,
                            paddingVertical: 14,
                        }}
                        textStyle={{
                            fontSize: 18,
                            color: "#374151",
                        }}
                        placeholderStyle={{
                            fontSize: 16,
                            color: "#9ca3af",
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: "#f9fafb",
                            borderColor: "#d1d5db",
                        }}
                    />
                    {errors.MaritalStatus && <Text className="text-red-500 text-sm">{errors.MaritalStatus}</Text>}
                </View>

                {["MobileNo", "LandlineNo", "Email"].map((field) => (
                    <View key={field} className="my-3">
                        <FormLabel field={field as keyof FormData} label={field.replace(/([A-Z])/g, " $1").trim()} />
                        <TextInput
                            className="border border-gray-300 rounded-xl px-5 py-5 bg-white text-lg text-gray-900"
                            value={localData[field as keyof FormData]}
                            onChangeText={(text) => handleInputChange(field as keyof FormData, text)}
                            placeholder={`Enter ${field}`}
                            placeholderTextColor="#9CA3AF"
                            keyboardType={field === "Email" ? "email-address" : field === "MobileNo" || field === "LandlineNo" ? "number-pad" : "default"}
                        />
                        {errors[field as keyof FormData] && <Text className="text-red-500 text-sm">{errors[field as keyof FormData]}</Text>}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default Page2;
