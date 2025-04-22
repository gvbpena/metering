import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Platform, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";
import { useFormData } from "./_context";
import StackScreen from "./_stackscreen";

interface FormData {
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Suffix?: string;
    Birthdate?: string;
    MaritalStatus?: string;
    MobileNo?: string;
    LandlineNo?: string;
    Email?: string;
}

export const MaritalStatusOptions = ["Single", "Married", "Widowed", "Divorced"];

const requiredFields: (keyof FormData)[] = ["FirstName", "LastName", "Birthdate", "MaritalStatus", "MobileNo"];

const calculateAge = (birthdateString?: string): number => {
    if (!birthdateString || !/^\d{4}-\d{2}-\d{2}$/.test(birthdateString)) {
        return 0;
    }
    // Use the provided current date: April 22, 2025
    const today = new Date(2025, 3, 22); // Month is 0-indexed (3 = April)
    const birthDate = new Date(birthdateString);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    return age;
};

const FormLabel = React.memo(({ field, label }: { field: keyof FormData; label: string }) => (
    <Text className="text-gray-700 text-base font-bold capitalize mb-1">
        {label} {requiredFields.includes(field) && <Text className="text-red-500">*</Text>}
    </Text>
));

const Page2 = () => {
    const { formData, dispatch } = useFormData();
    const [showError, setShowError] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [openMaritalStatus, setOpenMaritalStatus] = useState(false);

    const areRequiredFieldsFilled = useMemo(() => {
        return requiredFields.every((field) => {
            const value = formData[field];
            return typeof value === "string" && value.trim() !== "";
        });
    }, [formData]);

    const isMobileNoValid = useMemo(() => {
        if (!requiredFields.includes("MobileNo")) return true;
        const mobileNo = formData.MobileNo;
        return !mobileNo || (typeof mobileNo === "string" && mobileNo.length === 11);
    }, [formData.MobileNo]);

    const isAgeValid = useMemo(() => {
        if (!formData.Birthdate) return true; // Handled by required check
        const age = calculateAge(formData.Birthdate);
        return age >= 18;
    }, [formData.Birthdate]);

    const isFormValid = areRequiredFieldsFilled && isMobileNoValid && isAgeValid;

    const handleInputChange = (field: keyof FormData, value: string) => {
        let processedValue = value;
        if (field === "FirstName" || field === "MiddleName" || field === "LastName" || field === "Suffix") {
            processedValue = value.replace(/[^a-zA-Z\s-]/g, "");
        } else if (field === "MobileNo" || field === "LandlineNo") {
            processedValue = value.replace(/[^0-9]/g, "");
            if (field === "MobileNo" && processedValue.length > 11) {
                processedValue = processedValue.substring(0, 11);
            }
        } else if (field === "Email") {
            processedValue = value.trim();
        }
        dispatch({ type: "SET_INPUT_FIELD", field, payload: processedValue });
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            // Ensure selected date is not in the future relative to "today" (Apr 22, 2025)
            const today = new Date(2025, 3, 22);
            if (selectedDate > today) {
                selectedDate = today; // Or show an error, here we cap it at today
            }
            const dateString = selectedDate.toISOString().split("T")[0];
            dispatch({ type: "SET_INPUT_FIELD", field: "Birthdate", payload: dateString });
        }
        if (Platform.OS !== "ios") {
            setShowDatePicker(false);
        }
    };

    const handleMaritalStatusChange = (callback: (value: string | null) => string | null) => {
        const newValue = callback(formData.MaritalStatus || null);
        if (newValue !== null) {
            dispatch({ type: "SET_INPUT_FIELD", field: "MaritalStatus", payload: newValue });
        }
    };

    const shouldShowFieldError = (field: keyof FormData): boolean => {
        if (!showError) return false;

        if (field === "Birthdate") {
            const isRequired = requiredFields.includes(field);
            const value = formData.Birthdate;
            const isEmpty = !(typeof value === "string" && value.trim() !== "");
            // Show error if required and empty, OR if filled but age is invalid
            return (isRequired && isEmpty) || (!!value && !isAgeValid);
        }

        const isRequiredCheck = requiredFields.includes(field);
        if (!isRequiredCheck) return false; // Only show errors for fields in requiredFields array

        const valueCheck = formData[field];
        const isEmptyCheck = !(typeof valueCheck === "string" && valueCheck.trim() !== "");

        if (field === "MobileNo") {
            return isEmptyCheck || !isMobileNoValid;
        }
        return isEmptyCheck;
    };

    const getErrorMessage = (field: keyof FormData): string | null => {
        if (!shouldShowFieldError(field)) return null;

        const value = formData[field];
        const isEmpty = !(typeof value === "string" && value.trim() !== "");

        if (isEmpty) {
            return "This field is required.";
        }

        if (field === "Birthdate" && !isAgeValid) {
            return "Must be 18 years or older.";
        }

        if (field === "MobileNo" && !isMobileNoValid) {
            return "Mobile number must be 11 digits.";
        }

        return "This field is required."; // Fallback for required fields
    };

    const checkValidityAndProceed = () => {
        if (isFormValid) {
            setShowError(false);
            return true;
        } else {
            setShowError(true);
            return false;
        }
    };

    // Define max date for date picker based on "today"
    const maxDate = new Date(2025, 3, 22);

    return (
        <>
            <StackScreen title="Customer Details" nextRoute="/(electrician)_setup/page4" nextLabel="Next" onNext={checkValidityAndProceed} />
            <View className="flex-1 bg-gray-50">
                <ScrollView className="p-8 space-y-4" contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
                    {(["FirstName", "MiddleName", "LastName", "Suffix"] as (keyof FormData)[]).map((field) => (
                        <View key={field} className="my-2">
                            <FormLabel field={field} label={field.replace(/([A-Z])/g, " $1").trim()} />
                            <TextInput
                                className="border border-gray-300 rounded-xl px-5 py-5 bg-white text-lg text-gray-900"
                                value={(formData[field] as string) || ""}
                                onChangeText={(text) => handleInputChange(field, text)}
                                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                                placeholderTextColor="#9CA3AF"
                            />
                            {getErrorMessage(field) && <Text className="text-red-500 text-sm mt-1">{getErrorMessage(field)}</Text>}
                        </View>
                    ))}

                    <View className="my-2" style={{ zIndex: 10 }}>
                        <FormLabel field="Birthdate" label="Birthdate" />
                        <TouchableOpacity
                            className="border border-gray-300 rounded-xl px-5 py-5 bg-white flex-row justify-between items-center"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className={`text-lg ${formData.Birthdate ? "text-gray-900" : "text-gray-400"}`}>{formData.Birthdate || "Select Date"}</Text>
                        </TouchableOpacity>
                        {getErrorMessage("Birthdate") && <Text className="text-red-500 text-sm mt-1">{getErrorMessage("Birthdate")}</Text>}
                        {showDatePicker && Platform.OS === "ios" && (
                            <Modal transparent={true} animationType="slide" visible={showDatePicker}>
                                <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
                                    <View style={{ backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                        <DateTimePicker
                                            value={new Date(formData.Birthdate || maxDate)}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleDateChange}
                                            maximumDate={maxDate}
                                        />
                                        <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ padding: 15, alignItems: "center" }}>
                                            <Text style={{ color: "#007AFF", fontSize: 18 }}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}
                        {showDatePicker && Platform.OS !== "ios" && (
                            <DateTimePicker
                                value={new Date(formData.Birthdate || maxDate)}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={maxDate}
                            />
                        )}
                    </View>

                    <View className="my-2" style={{ zIndex: 5000 }}>
                        <FormLabel field="MaritalStatus" label="Marital Status" />
                        <DropDownPicker
                            open={openMaritalStatus}
                            value={formData.MaritalStatus || null}
                            items={MaritalStatusOptions.map((status) => ({ label: status, value: status }))}
                            setOpen={setOpenMaritalStatus}
                            setValue={handleMaritalStatusChange}
                            placeholder="Select Marital Status"
                            style={{
                                backgroundColor: "white",
                                borderColor: "#d1d5db",
                                borderWidth: 1,
                                minHeight: 66, // Increased height
                                borderRadius: 12,
                            }}
                            textStyle={{ fontSize: 18, color: "#374151", marginLeft: 8 }} // Increased font size
                            placeholderStyle={{ fontSize: 18, color: "#9CA3AF", marginLeft: 8 }} // Increased font size
                            dropDownContainerStyle={{ backgroundColor: "#f9fafb", borderColor: "#d1d5db" }}
                            zIndex={5000}
                            listMode="SCROLLVIEW"
                        />
                        {getErrorMessage("MaritalStatus") && <Text className="text-red-500 text-sm mt-1">{getErrorMessage("MaritalStatus")}</Text>}
                    </View>

                    {(["MobileNo", "LandlineNo", "Email"] as (keyof FormData)[]).map((field) => (
                        <View key={field} className="my-2" style={{ zIndex: 10 }}>
                            <FormLabel field={field} label={field.replace(/([A-Z])/g, " $1").trim()} />
                            <TextInput
                                className="border border-gray-300 rounded-xl px-5 py-5 bg-white text-lg text-gray-900"
                                value={(formData[field] as string) || ""}
                                onChangeText={(text) => handleInputChange(field, text)}
                                placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                                placeholderTextColor="#9CA3AF"
                                keyboardType={field === "Email" ? "email-address" : field === "MobileNo" || field === "LandlineNo" ? "number-pad" : "default"}
                                autoCapitalize={field === "Email" ? "none" : "words"}
                                maxLength={field === "MobileNo" ? 11 : undefined}
                            />
                            {getErrorMessage(field) && <Text className="text-red-500 text-sm mt-1">{getErrorMessage(field)}</Text>}
                        </View>
                    ))}

                    {showError && !isFormValid && (
                        <Text className="text-red-500 text-base text-center font-semibold mt-4">
                            Please fill in all required fields marked with *.
                            {!isMobileNoValid && formData.MobileNo ? " Mobile number must be 11 digits." : ""}
                            {!isAgeValid && formData.Birthdate ? " Must be 18 years or older." : ""}
                        </Text>
                    )}
                </ScrollView>
            </View>
        </>
    );
};

export default Page2;
