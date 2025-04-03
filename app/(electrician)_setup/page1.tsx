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
                nextRoute="/(electrician)_setup/page2"
                nextLabel="Next"
                onNext={() => true} // Pass a function returning true
            />

            <ScrollView className="flex-1 p-2  pb-14 bg-gray-50">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Client Information</Text>

                {/* Client Type Selection */}
                <Text className="text-gray-700 mb-2 text-lg font-medium">Client Type</Text>
                <View className="flex flex-wrap flex-row justify-between">
                    {clientTypes.map((type) => (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => setSelectedClientType(type.name)}
                            className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                selectedClientType === type.name ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                            } flex items-center justify-center `} // Added shadow
                        >
                            <MaterialCommunityIcons name={type.icon as any} size={24} color={selectedClientType === type.name ? "#0066A0" : "gray"} />
                            <Text className={`mt-1 text-center font-medium text-base ${selectedClientType === type.name ? "text-[#0066A0]" : "text-gray-800"}`}>
                                {type.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedClientType && (
                    <>
                        <Text className="text-gray-700 mb-2 text-lg mt-4 font-medium">Application Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {clientOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setSelectedApplicationType(option)}
                                    className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                        selectedApplicationType === option ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                                    } flex items-center justify-center `} // Added shadow
                                >
                                    <MaterialCommunityIcons
                                        name="file-document-outline"
                                        size={24}
                                        color={selectedApplicationType === option ? "#0066A0" : "gray"}
                                    />
                                    <Text
                                        className={`mt-1 text-center font-medium text-base ${
                                            selectedApplicationType === option ? "text-[#0066A0]" : "text-gray-800"
                                        }`}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* Class Type Selection */}
                <Text className="text-gray-700 mb-2 mt-4 text-lg font-medium">Class Type</Text>
                <View className="flex flex-wrap flex-row justify-between">
                    {ClassType.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setSelectedClassType(type)}
                            className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                selectedClassType === type ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                            } flex items-center justify-center `} // Added shadow
                        >
                            {/* Changed icon for variety */}
                            <MaterialCommunityIcons
                                name={type === "RESIDENTIAL" ? "home-city-outline" : type === "NON-RESIDENTIAL" ? "storefront-outline" : "bank-outline"}
                                size={24}
                                color={selectedClassType === type ? "#0066A0" : "gray"}
                            />
                            <Text className={`mt-1 text-center font-medium text-base ${selectedClassType === type ? "text-[#0066A0]" : "text-gray-800"}`}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Customer Type Selection */}
                <Text className="text-gray-700 mb-2 mt-4 text-lg font-medium">Customer Type</Text>
                <View className="flex flex-row justify-between">
                    {CustomerType.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setSelectedCustomerType(type)}
                            className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                selectedCustomerType === type ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                            } flex items-center justify-center `} // Added shadow
                        >
                            <MaterialCommunityIcons
                                name={type === "Business" ? "briefcase-outline" : "account-outline"}
                                size={24}
                                color={selectedCustomerType === type ? "#0066A0" : "gray"}
                            />
                            <Text className={`mt-1 text-center font-medium text-base ${selectedCustomerType === type ? "text-[#0066A0]" : "text-gray-800"}`}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Business Type Selection */}
                {selectedCustomerType === "Business" && (
                    <View className="pb-4">
                        <Text className="text-gray-700 mb-2 mt-4 text-lg font-medium">Business Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {BusinessType.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    // Ensure this updates selectedPropertyType, which then updates BusinessType via useEffect
                                    onPress={() => setSelectedPropertyType(type)}
                                    className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                        selectedPropertyType === type ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                                    } flex items-center justify-center `} // Added shadow
                                >
                                    <MaterialCommunityIcons
                                        name={businessIcons[type] as any} // Assuming businessIcons map is correct
                                        size={24}
                                        color={selectedPropertyType === type ? "#0066A0" : "gray"}
                                    />
                                    <Text
                                        className={`mt-1 text-center font-medium text-base ${
                                            selectedPropertyType === type ? "text-[#0066A0]" : "text-gray-800"
                                        }`}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Property Type Selection (for Person) */}
                {selectedCustomerType === "Person" && (
                    <View className="pb-4">
                        <Text className="text-gray-700 mb-2 mt-4 text-lg font-medium">Property Type</Text>
                        <View className="flex flex-wrap flex-row justify-between">
                            {PersonPropertyType.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    // Ensure this updates selectedPropertyType, which then updates BusinessType via useEffect
                                    onPress={() => setSelectedPropertyType(type)}
                                    className={`w-[48%] mb-2 p-2 rounded-lg border ${
                                        selectedPropertyType === type ? "border-[#0066A0] bg-blue-50" : "border-gray-300 bg-white"
                                    } flex items-center justify-center `} // Added shadow
                                >
                                    <MaterialCommunityIcons
                                        name={propertyIcons[type] as any} // Assuming propertyIcons map is correct
                                        size={24}
                                        color={selectedPropertyType === type ? "#0066A0" : "gray"}
                                    />
                                    <Text
                                        className={`mt-1 text-center font-medium text-base ${
                                            selectedPropertyType === type ? "text-[#0066A0]" : "text-gray-800"
                                        }`}
                                    >
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
