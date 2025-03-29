import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useFormData } from "./_context";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import StackScreen from "./_stackscreen";
import { FormData } from "./_context"; // Ensure FormData is imported from context

export const ClientType = ["New", "Existing"];
export const NewClientOptions = ["PERMANENT", "SEPARATION OF METER", "TEMPORARY", "TFC"];
export const ExistingClientOptions = ["CHANGE NAME", "DOWNGRADE LOAD", "RE-CON & CHANGE NAME", "RE-CONNECTION", "TLM", "UPGRADE LOAD"];
export const ClassType = ["GOVERNMENT", "NON-RESIDENTIAL", "RESIDENTIAL"];
export const CustomerType = ["Business", "Person"];
export const BusinessType = ["COOPERATIVE", "CORPORATION", "MARKET STALL", "PARTNERSHIP", "SOLE PROPRIETORSHIP"];
export const PersonPropertyType = ["AUTHORIZED OCCUPANT", "OWNED", "PURCHASED", "RENTED", "URBAN POOR"];

const clientTypes = [
    { id: "new", name: "New", icon: "account-plus" },
    { id: "existing", name: "Existing", icon: "account-check" },
];

const businessIcons: Record<string, string> = {
    COOPERATIVE: "account-group",
    CORPORATION: "domain",
    "MARKET STALL": "store",
    PARTNERSHIP: "handshake",
    "SOLE PROPRIETORSHIP": "briefcase",
};

const propertyIcons: Record<string, string> = {
    "AUTHORIZED OCCUPANT": "home-account",
    OWNED: "home",
    PURCHASED: "home-outline",
    RENTED: "key",
    "URBAN POOR": "city",
};

const ClientInformation = () => {
    const { formData, dispatch } = useFormData();
    const [selectedClientType, setSelectedClientType] = useState<string | null>(formData.ClientType ?? null);
    const [selectedApplicationType, setSelectedApplicationType] = useState<string | null>(formData.ApplicationType ?? null);
    const [selectedClassType, setSelectedClassType] = useState<string | null>(formData.ClassType ?? "");
    const [selectedCustomerType, setSelectedCustomerType] = useState<string | null>(formData.CustomerType ?? "");
    const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(formData.BusinessType ?? "");
    const [clientOptions, setClientOptions] = useState<string[]>([]);

    /** Handles the selection and updates the context */
    const handleSelection = <T extends keyof FormData>(field: T, value: FormData[T]) => {
        dispatch({ type: "SET_INPUT_FIELD", field, payload: value ?? "" });
    };

    useEffect(() => {
        setClientOptions(selectedClientType === "New" ? NewClientOptions : ExistingClientOptions);
        setSelectedApplicationType(null);
        handleSelection("ClientType", selectedClientType as FormData["ClientType"]);
    }, [selectedClientType]);

    useEffect(() => {
        handleSelection("ApplicationType", selectedApplicationType as FormData["ApplicationType"]);
    }, [selectedApplicationType]);

    useEffect(() => {
        handleSelection("ClassType", selectedClassType as FormData["ClassType"]);
    }, [selectedClassType]);

    useEffect(() => {
        handleSelection("CustomerType", selectedCustomerType as FormData["CustomerType"]);
        setSelectedPropertyType(null);
    }, [selectedCustomerType]);

    useEffect(() => {
        handleSelection("BusinessType", selectedPropertyType as FormData["BusinessType"]);
    }, [selectedPropertyType]);

    return (
        <>
            <StackScreen
                title="Client Information"
                nextRoute="/(electricianv2)_setup/page2"
                nextLabel="Next"
                onNext={() => true} // Pass a function returning true
            />

            <ScrollView className="flex-1 p-4  pb-14 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Client Information</Text>

                {/* Client Type Selection */}
                <Text className="text-gray-600 mb-2 text-lg">Client Type</Text>
                <View className="flex flex-wrap flex-row justify-between">
                    {clientTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => setSelectedClientType(type.name)}
                            className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                selectedClientType === type.name ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                            } flex items-center justify-center`}
                        >
                            <MaterialCommunityIcons name={type.icon as any} size={24} color={selectedClientType === type.name ? "#EA4335" : "gray"} />
                            <Text className={`text-center font-medium text-base ${selectedClientType === type.name ? "text-red-500" : "text-gray-800"}`}>
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedClientType && (
                    <>
                        <Text className="text-gray-600 mb-2 text-lg">Application Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {clientOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setSelectedApplicationType(option)}
                                    className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                        selectedApplicationType === option ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                                    } flex items-center justify-center`}
                                >
                                    <MaterialCommunityIcons name="file-document" size={24} color={selectedApplicationType === option ? "#EA4335" : "gray"} />
                                    <Text
                                        className={`text-center font-medium text-base ${selectedApplicationType === option ? "text-red-500" : "text-gray-800"}`}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Class Type Selection */}
                <Text className="text-gray-600 mb-2 mt-4 text-lg">Class Type</Text>
                <View className="flex flex-wrap flex-row justify-between">
                    {ClassType.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setSelectedClassType(type)}
                            className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                selectedClassType === type ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                            } flex items-center justify-center`}
                        >
                            <MaterialCommunityIcons name="domain" size={24} color={selectedClassType === type ? "#EA4335" : "gray"} />
                            <Text className={`text-center font-medium text-base ${selectedClassType === type ? "text-red-500" : "text-gray-800"}`}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Customer Type Selection */}
                <Text className="text-gray-600 mb-2 mt-4 text-lg">Customer Type</Text>
                <View className="flex flex-row justify-between">
                    {CustomerType.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setSelectedCustomerType(type)}
                            className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                selectedCustomerType === type ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                            } flex items-center justify-center`}
                        >
                            <MaterialCommunityIcons
                                name={type === "Business" ? "briefcase" : "account"}
                                size={24}
                                color={selectedCustomerType === type ? "#EA4335" : "gray"}
                            />
                            <Text className={`text-center font-medium text-base ${selectedCustomerType === type ? "text-red-500" : "text-gray-800"}`}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Business Type Selection */}
                {selectedCustomerType === "Business" && (
                    <View className="pb-4">
                        <Text className="text-gray-600 mb-2 mt-4 text-lg">Business Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {BusinessType.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSelectedPropertyType(type)}
                                    className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                        selectedPropertyType === type ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                                    } flex items-center justify-center`}
                                >
                                    <MaterialCommunityIcons
                                        name={businessIcons[type] as any}
                                        size={24}
                                        color={selectedPropertyType === type ? "#EA4335" : "gray"}
                                    />
                                    <Text className={`text-center font-medium text-base ${selectedPropertyType === type ? "text-red-500" : "text-gray-800"}`}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {selectedCustomerType === "Person" && (
                    <View className="pb-4">
                        <Text className="text-gray-600 mb-2 mt-4 text-lg">Property Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {PersonPropertyType.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSelectedPropertyType(type)}
                                    className={`w-[48%] mb-2 p-4 rounded-lg border ${
                                        selectedPropertyType === type ? "border-red-500 bg-red-100" : "border-gray-300 bg-white"
                                    } flex items-center justify-center`}
                                >
                                    <MaterialCommunityIcons
                                        name={propertyIcons[type] as any}
                                        size={24}
                                        color={selectedPropertyType === type ? "#EA4335" : "gray"}
                                    />
                                    <Text className={`text-center font-medium text-base ${selectedPropertyType === type ? "text-red-500" : "text-gray-800"}`}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    );
};

export default ClientInformation;
