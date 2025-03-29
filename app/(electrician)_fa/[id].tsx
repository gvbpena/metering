import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Image, TextInput, Modal, Pressable, AlertButton } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import StackScreen from "./_stackscreen";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSubmitSetupData } from "./submit";
import { useSQLiteContext } from "expo-sqlite";
import { useActivityId } from "./_context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface MeteringApplication {
    id: number;
    application_id: string;
    clienttype: string;
    applicationtype: string;
    classtype: string;
    customertype: string;
    businesstype: string;
    firstname: string;
    middlename?: string;
    lastname: string;
    suffix?: string;
    birthdate: string;
    maritalstatus: string;
    mobileno: string;
    landlineno?: string;
    email: string;
    tin?: string;
    typeofid: string;
    idno: string;
    customeraddress: string;
    citymunicipality: string;
    barangay: string;
    landmark?: string;
    status: string;
}

interface ImageData {
    [key: string]: string[];
}
const captureButtons = [
    { label: "Meter", icon: "speedometer" },
    { label: "Pole_Images", icon: "transmission-tower" },
    { label: "Permit", icon: "document-text" },
    { label: "Proof of Ownership", icon: "file-tray-full" },
    { label: "Identity Card", icon: "id-card" },
    { label: "Premises", icon: "home" },
    { label: "Signature", icon: "pencil" },
];

interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface LoadingState {
    Meter: boolean;
    Premises: boolean;
    Pole_Images: boolean;
}

const groupedPages = [
    {
        title: "Remarks",
        fields: ["remarks"],
    },
    {
        title: "Client Information",
        fields: ["application_id", "clienttype", "applicationtype", "classtype", "customertype", "businesstype", "status"],
    },
    {
        title: "Client Details",
        fields: ["firstname", "middlename", "lastname", "suffix", "birthdate", "maritalstatus", "mobileno", "landlineno", "email", "tin", "typeofid", "idno"],
    },
    { title: "Parent Information", fields: ["fatherfirstname", "fathermiddlename", "fatherlastname", "motherfirstname", "mothermiddlename", "motherlastname"] },
    {
        title: "Representative Information",
        fields: [
            "representativefirstname",
            "representativemiddlename",
            "representativelastname",
            "representativerelationship",
            "representativemobile",
            "representativeemail",
            "representativeattachedid",
            "representativespecialpowerofattorney",
        ],
    },
    { title: "Client Address", fields: ["customeraddress", "citymunicipality", "barangay", "streethouseunitno", "sitiopurokbuildingsubdivision"] },
    {
        title: "Metering Location",
        fields: [
            "reference_pole",
            "nearmeterno",
            "pole_latitude",
            "pole_longitude",
            "meter_latitude",
            "meter_longitude",
            "premise_latitude",
            "premise_longitude",
        ],
    },
    { title: "Client Additional Info", fields: ["traversingwire", "deceasedlotowner", "electricalpermitnumber", "permiteffectivedate", "landmark"] },
];

export const fieldLabels: Record<string, string> = {
    application_id: "Application ID",
    clienttype: "Client Type",
    applicationtype: "Application Type",
    classtype: "Class Type",
    customertype: "Customer Type",
    businesstype: "Business Type",
    status: "Status",
    remarks: "Remarks",

    firstname: "First Name",
    middlename: "Middle Name",
    lastname: "Last Name",
    suffix: "Suffix",
    birthdate: "Birth Date",
    maritalstatus: "Marital Status",
    mobileno: "Mobile No.",
    landlineno: "Landline No.",
    email: "Email",
    tin: "TIN",
    typeofid: "Type of ID",
    idno: "ID No.",

    fatherfirstname: "Father First Name",
    fathermiddlename: "Father Middle Name",
    fatherlastname: "Father Last Name",
    motherfirstname: "Mother First Name",
    mothermiddlename: "Mother Middle Name",
    motherlastname: "Mother Last Name",

    representativefirstname: "Representative First Name",
    representativemiddlename: "Representative Middle Name",
    representativelastname: "Representative Last Name",
    representativerelationship: "Representative Relationship",
    representativemobile: "Representative Mobile",
    representativeemail: "Representative Email",
    representativeattachedid: "Representative Attached ID",
    representativespecialpowerofattorney: "Representative Special Power of Attorney",

    customeraddress: "Customer Address",
    citymunicipality: "City/Municipality",
    barangay: "Barangay",
    streethouseunitno: "Street/House/Unit No.",
    sitiopurokbuildingsubdivision: "Sitio/Purok/Building/Subdivision",

    reference_pole: "Tapping Pole",
    nearmeterno: "Near Meter No.",
    pole_latitude: "Pole Latitude",
    pole_longitude: "Pole Longitude",
    meter_latitude: "Meter Latitude",
    meter_longitude: "Meter Longitude",
    premise_latitude: "Premise Latitude",
    premise_longitude: "Premise Longitude",

    traversingwire: "Traversing Wires",
    deceasedlotowner: "Deceased Lot Owner",
    electricalpermitnumber: "Electrical Permit Number",
    permiteffectivedate: "Permit Effective Date",
    landmark: "Landmark",
};

const DetailsScreen = () => {
    const database = useSQLiteContext();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedImages, setSelectedImages] = useState<{ [key: string]: string[] }>({});
    const [selectedRow, setSelectedRow] = useState<MeteringApplication | null>(null);
    const [imagesByType, setImagesByType] = useState<ImageData>({});
    const { moveAndSaveImages, deleteImageFromDatabase, updateApplicationData, endorsedApplication } = useSubmitSetupData();
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [permitNumber, setPermitNumber] = useState<string>("");
    const [selectedIdType, setSelectedIdType] = useState<string>("");
    const [idNumber, setIdNumber] = useState<string>("");
    const { state, dispatch } = useActivityId();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImageUri, setModalImageUri] = useState<string | null>(null);
    const [hasSelectedImages, setHasSelectedImages] = useState(false);

    const [meterLocation, setMeterLocation] = useState<LocationCoords | null>(null);
    const [premiseLocation, setPremiseLocation] = useState<LocationCoords | null>(null);
    const [poleLocation, setPoleLocation] = useState<LocationCoords | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState<LoadingState>({ Meter: false, Premises: false, Pole_Images: false });

    const getLocation = async (type: "Meter" | "Premises" | "Pole_Images") => {
        setLocationLoading((prev) => ({ ...prev, [type]: true }));
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setErrorMsg("Permission to access location was denied");
            setLocationLoading((prev) => ({ ...prev, [type]: false }));
            return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const newLocation: LocationCoords = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
        };

        if (type === "Meter") {
            setMeterLocation(newLocation);
        } else if (type === "Premises") {
            setPremiseLocation(newLocation);
        } else if (type === "Pole_Images") {
            setPoleLocation(newLocation);
        }
        setLocationLoading((prev) => ({ ...prev, [type]: false }));
    };

    const fetchData = useCallback(async () => {
        if (!id) return;

        const query = `
                SELECT 
                    ma.*, 
                    i.image_type, 
                    GROUP_CONCAT(i.image_url) AS image_urls
                FROM 
                    metering_application ma
                LEFT JOIN 
                    images i 
                ON 
                    ma.application_id = i.reference_id
                WHERE 
                    ma.application_id = ?
                GROUP BY 
                    i.image_type;
            `;

        try {
            const result = await database.getAllAsync(query, [id]);
            if (result.length > 0) {
                const meteringApplication = { ...(result[0] as MeteringApplication) };
                const groupedImages: ImageData = {};
                result.forEach((row: any) => {
                    if (row.image_type) {
                        groupedImages[row.image_type] = row.image_urls.split(",");
                    }
                });
                setSelectedRow(meteringApplication);
                setImagesByType(groupedImages);
            } else {
                setSelectedRow(null);
                setImagesByType({});
            }
        } catch (error) {
            console.error("Error fetching data from SQLite:", error);
            Alert.alert("Error", "Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    useFocusEffect(
        useCallback(() => {
            const checkConditions = async () => {
                const savedSignature = await AsyncStorage.getItem("userSignature");
                const hasImages = captureButtons.some((item) => selectedImages[item.label]?.length > 0);
                if (!selectedImages["Signature"]?.length && savedSignature) {
                    await AsyncStorage.removeItem("userSignature");
                }
                setHasSelectedImages(hasImages || !!savedSignature);
            };

            checkConditions();
        }, [selectedImages])
    );

    const canEndorsed = useMemo(() => {
        return captureButtons.every((item) => imagesByType[item.label]?.length > 0);
    }, [imagesByType]);

    useEffect(() => {
        // const checkConditions = async () => {
        //     // const savedSignature = await AsyncStorage.getItem("userSignature");
        // };
        // checkConditions();
        fetchData();
        if (id) {
            dispatch({ type: "SET_ACTIVITY_ID", payload: id });
        }
    }, [fetchData, id, dispatch, canEndorsed]);

    const router = useRouter();
    const pickImageOrTakePhoto = async (category: string) => {
        if (category === "Signature") {
            router.push("/consent" as any);
            return;
        }

        const options: AlertButton[] = [
            { text: "Cancel", style: "cancel" },
            { text: "Take Photo", onPress: () => launchCamera(category) },
        ];
        if (!["Meter", "Premises", "Pole_Images"].includes(category)) {
            options.push({ text: "Choose from Gallery", onPress: () => launchImageLibrary(category) });
        }

        Alert.alert("Choose an action", "Select an action:", options);
    };

    const launchCamera = async (category: string) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission required", "Permission to access camera is required!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
        if (!result.canceled) {
            if (category === "Premises") {
                getLocation("Premises");
            }
            if (category === "Meter") {
                getLocation("Meter");
            }
            if (category === "Pole_Images") {
                getLocation("Pole_Images");
            }
            setSelectedImages((prev) => ({ ...prev, [category]: [...(prev[category] || []), result.assets[0].uri] }));
        }
    };

    const launchImageLibrary = async (category: string) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission required", "Permission to access media library is required!");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedImages((prev) => ({ ...prev, [category]: [...(prev[category] || []), ...result.assets.map((asset) => asset.uri)] }));
        }
    };

    const handleDeleteImage = async (category: string, uri: string) => {
        try {
            await deleteImageFromDatabase(uri);
            setSelectedImages((prev) => {
                const updatedImages = prev[category] ? prev[category].filter((imageUri) => imageUri !== uri) : [];
                return {
                    ...prev,
                    [category]: updatedImages,
                };
            });
            if (category === "Signature") {
                const updatedImages = selectedImages[category]?.filter((imageUri) => imageUri !== uri) || [];
                if (updatedImages.length === 0) {
                    await AsyncStorage.removeItem("userSignature");
                }
            }

            fetchData();
            Alert.alert("Deleted", "Image deleted successfully.");
        } catch (error) {
            console.error("Error deleting image:", error);
            Alert.alert("Error", "Failed to delete image.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="text-xl text-gray-500">Loading details...</Text>
            </View>
        );
    }

    if (!selectedRow) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-xl text-gray-500">No data available</Text>
            </View>
        );
    }
    const handleSubmit = async () => {
        if (!id) {
            Alert.alert("Error", "Application ID is missing.");
            return;
        }
        try {
            console.log("Updating Application Data with:", {
                id,
                selectedDate: selectedDate ? selectedDate.toISOString().split("T")[0] : undefined,
                permitNumber,
                selectedIdType,
                idNumber,
                meter_latitude: meterLocation?.latitude,
                meter_longitude: meterLocation?.longitude,
                premise_latitude: premiseLocation?.latitude,
                premise_longitude: premiseLocation?.longitude,
                pole_latitude: poleLocation?.latitude,
                pole_longitude: poleLocation?.longitude,
            });

            await updateApplicationData(
                id,
                selectedDate ? selectedDate.toISOString().split("T")[0] : undefined,
                permitNumber,
                selectedIdType,
                idNumber,
                meterLocation?.latitude?.toString(),
                meterLocation?.longitude?.toString(),
                premiseLocation?.latitude?.toString(),
                premiseLocation?.longitude?.toString(),
                poleLocation?.latitude?.toString(),
                poleLocation?.longitude?.toString()
            );

            for (const category of Object.keys(selectedImages)) {
                await moveAndSaveImages(selectedImages[category], id, category);
            }
            setSelectedImages({});
            await fetchData();

            Alert.alert("Success", "All images moved, saved, and data refreshed successfully!");
        } catch (error) {
            console.error("Move and save error:", error);
            Alert.alert("Error", "Failed to move and save images.");
        }
    };

    const handleEndorsed = async () => {
        try {
            await endorsedApplication(id);
            await fetchData();
            Alert.alert("Success", "Endorsed Successfully", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
            console.error("Error endorsing application:", error);
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleNextPage = (selectedGroup: { title: string; fields: string[] }) => {
        if (!selectedRow) {
            console.error("No selectedRow data available.");
            return;
        }
        const applicationId = selectedRow.application_id;
        const groupedFields = {
            title: selectedGroup.title,
            application_id: applicationId,
            fields: selectedGroup.fields.reduce((acc, field) => {
                acc[field] = String(selectedRow[field as keyof MeteringApplication] ?? "N/A"); // Map field names to their values
                return acc;
            }, {} as Record<string, string>),
        };
        console.log("Data to pass:", groupedFields);
        router.push({
            pathname: "/(electrician)_fa/edit_page",
            params: {
                application_id: applicationId,
                groupedFields: JSON.stringify(groupedFields),
            },
        });
    };
    const IdTypes = [
        "Social Security (SS) card",
        "Unified Multi-Purpose ID (UMID) card",
        "Passport",
        "Professional Regulation Commission (PRC) card",
        "Seaman's Book (Seafarer's Identification & Record Book)",
        "Alien Certificate of Registration",
        "ATM card (with cardholder's name)",
        "Bank Account Passbook",
        "Company ID card",
        "Certificate of Confirmation issued by National Commission on Indigenous People",
        "Certificate of Licensure/Qualification Documents from MARINA",
        "Certificate of Naturalization",
        "Driver's License",
        "Firearm License card issued by Philippine National Police (PNP)",
        "Fishworker's License issued by BFAR",
        "GSIS card/Member's Record/Certificate of Membership",
        "Health or Medical card",
        "Life Insurance Policy of member",
        "Marriage Contract/Marriage Certificate",
        "NBI Clearance",
        "Pag-IBIG Transaction Card/Member's Data Form",
        "Phil Health ID card/Member's Data Record",
        "Police Clearance",
        "Postal ID card",
        "School ID card",
        "Seafarer's Registration Certificate issued by POEA",
        "Senior Citizen card",
        "Student Permit issued by LTO",
        "TIN card",
        "Transcript of Records",
        "Voter's ID",
    ];

    return (
        <>
            <StackScreen
                title="Preview"
                nextLabel={
                    selectedRow?.status?.toLowerCase() === "approved" || selectedRow?.status?.toLowerCase() === "endorsed"
                        ? undefined
                        : hasSelectedImages
                        ? "Save"
                        : "Endorsed"
                }
                onNext={
                    selectedRow?.status?.toLowerCase() === "approved" || selectedRow?.status?.toLowerCase() === "endorsed"
                        ? false
                        : hasSelectedImages || canEndorsed
                }
                handleFunction={
                    selectedRow?.status?.toLowerCase() === "approved" || selectedRow?.status?.toLowerCase() === "endorsed"
                        ? undefined
                        : hasSelectedImages
                        ? handleSubmit
                        : handleEndorsed
                }
            />
            <ScrollView className="flex-1 p-4 bg-gray-100">
                {groupedPages.map((section) => {
                    if (
                        section.title.toLowerCase() === "remarks" &&
                        !(selectedRow.status.toLowerCase() === "approved" || selectedRow.status.toLowerCase() === "rejected")
                    ) {
                        return null;
                    }

                    return (
                        <View key={section.title} className="bg-white border border-gray-300 rounded-lg shadow-md mb-4 p-4 relative">
                            <View className="flex-row items-center justify-between p-2 rounded-lg">
                                <Text className="text-xl font-semibold text-gray-700 flex-1 flex-wrap">{section.title}</Text>

                                {section.title !== "Remarks" &&
                                    (selectedRow.status.toLowerCase() === "rejected" || selectedRow.status.toLowerCase() === "pending") && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleNextPage({
                                                    title: section.title,
                                                    fields: section.fields,
                                                })
                                            }
                                            className="w-28 h-10 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm ml-auto"
                                        >
                                            <MaterialCommunityIcons name="pencil" size={16} color="#4B5563" className="mr-2" />
                                            <Text className="text-gray-700 font-medium text-lg">Edit</Text>
                                        </TouchableOpacity>
                                    )}
                            </View>

                            {section.fields.map((field) => {
                                const rawValue = selectedRow[field as keyof MeteringApplication] ?? "N/A";
                                const value = String(rawValue);

                                let badgeStyles = "bg-gray-100 text-gray-700";

                                if (section.title === "Client Information" && field === "status") {
                                    switch (value.toLowerCase()) {
                                        case "pending":
                                            badgeStyles = "bg-yellow-300 text-yellow-900";
                                            break;
                                        case "approved":
                                            badgeStyles = "bg-green-300 text-white";
                                            break;
                                        case "endorsed":
                                            badgeStyles = "bg-blue-400 text-white";
                                            break;
                                        case "rejected":
                                            badgeStyles = "bg-red-500 text-white";
                                            break;
                                    }
                                }

                                return (
                                    <View key={field} className="flex-row justify-between py-1 items-center">
                                        {field !== "remarks" && <Text className="text-lg text-gray-600 font-medium flex-1">{fieldLabels[field] || field}</Text>}
                                        {section.title === "Client Information" && field === "status" ? (
                                            <Text className={`px-3 py-1 text-md font-bold rounded-full ${badgeStyles}`}>{value}</Text>
                                        ) : section.title === "Client Information" && field === "application_id" ? (
                                            <Text className="text-gray-800 font-bold text-xl">{value}</Text>
                                        ) : (
                                            <Text className="text-gray-800 text-xl">{value}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}

                {(selectedRow?.status?.toLowerCase() === "endorsed" || selectedRow?.status?.toLowerCase() === "approved") && (
                    <View className="space-y-3 mb-6">
                        {captureButtons.map((item) => (
                            <View key={item.label} className="bg-white border border-gray-300 rounded-lg shadow-md p-4 mb-2">
                                <Text className="text-lg text-gray-700 font-medium">{item.label}</Text>

                                {imagesByType[item.label] && imagesByType[item.label].length > 0 ? (
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                                            <View className="flex-row gap-2">
                                                {imagesByType[item.label].map((uri, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => {
                                                            setModalImageUri(uri);
                                                            setModalVisible(true);
                                                        }}
                                                    >
                                                        <View className="relative">
                                                            <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                                            {selectedRow?.status?.toLowerCase() !== "endorsed" &&
                                                                selectedRow?.status?.toLowerCase() !== "approved" && (
                                                                    <TouchableOpacity
                                                                        className="absolute top-1 right-1 bg-red-500 p-1 rounded-full"
                                                                        onPress={() => handleDeleteImage(item.label, uri)}
                                                                    >
                                                                        <Ionicons name="trash" size={16} color="white" />
                                                                    </TouchableOpacity>
                                                                )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                ) : (
                                    <Text className="text-lg text-gray-500 mt-2">No images added</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}
                {selectedRow?.status?.toLowerCase() !== "endorsed" && selectedRow?.status?.toLowerCase() !== "approved" && (
                    <View className="space-y-3 mb-6">
                        {captureButtons.map((item) => (
                            <View key={item.label} className="bg-white border border-gray-300 rounded-lg shadow-md p-4 mb-2">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-xl font-semibold text-gray-700">{item.label} </Text>
                                    <TouchableOpacity
                                        onPress={() => pickImageOrTakePhoto(item.label)}
                                        className="w-1/2 h-10 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm"
                                    >
                                        {item.label === "Pole_Images" ? (
                                            <MaterialCommunityIcons name={item.icon as any} size={18} color="gray" className="mr-1" />
                                        ) : (
                                            <Ionicons name={item.icon as any} size={24} color="gray" className="mr-2" />
                                        )}
                                        <Text className="text-lg text-gray-700 font-medium">{item.label}</Text>
                                    </TouchableOpacity>
                                </View>
                                {item.label === "Premises" && (
                                    <View className="flex flex-row items-center">
                                        {locationLoading.Premises && (
                                            <View className="flex flex-row items-center">
                                                <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                                <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                            </View>
                                        )}

                                        {!locationLoading.Premises && premiseLocation && (
                                            <Text className="text-sm text-gray-600 mb-2">
                                                Lat: {premiseLocation.latitude}, Long: {premiseLocation.longitude}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {item.label === "Meter" && (
                                    <View className="flex flex-row items-center">
                                        {locationLoading.Meter && (
                                            <View className="flex flex-row items-center">
                                                <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                                <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                            </View>
                                        )}
                                        {!locationLoading.Meter && meterLocation && (
                                            <Text className="text-sm text-gray-600 mb-2">
                                                Lat: {meterLocation.latitude}, Long: {meterLocation.longitude}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {item.label === "Pole_Images" && (
                                    <View className="flex flex-row items-center">
                                        {locationLoading.Pole_Images && (
                                            <View className="flex flex-row items-center">
                                                <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                                <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                            </View>
                                        )}

                                        {!locationLoading.Pole_Images && poleLocation && (
                                            <Text className="text-sm text-gray-600 mb-2">
                                                Lat: {poleLocation.latitude}, Long: {poleLocation.longitude}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {selectedImages[item.label]?.length > 0 && (
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row space-x-2">
                                                {selectedImages[item.label].map((uri, index) => (
                                                    <View key={index} className="relative">
                                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                                        <TouchableOpacity
                                                            className="absolute top-1 right-1 bg-red-500 p-1 rounded-full"
                                                            onPress={() => {
                                                                setSelectedImages((prev) => ({
                                                                    ...prev,
                                                                    [item.label]: prev[item.label].filter((_, i) => i !== index),
                                                                }));
                                                                if (item.label === "Meter") {
                                                                    setMeterLocation(null);
                                                                }
                                                                if (item.label === "Premises") {
                                                                    setPremiseLocation(null);
                                                                }
                                                                if (item.label === "Pole_Images") {
                                                                    setPoleLocation(null);
                                                                }
                                                            }}
                                                        >
                                                            <Ionicons name="close" size={16} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                        {item.label === "Identity Card" && (
                                            <View className="w-full mt-2">
                                                <View className="border border-gray-300 rounded-lg bg-white my-2">
                                                    <Picker selectedValue={selectedIdType} onValueChange={(itemValue) => setSelectedIdType(itemValue)}>
                                                        <Picker.Item label="Select ID Type" value="" />
                                                        {IdTypes.map((idType, index) => (
                                                            <Picker.Item key={index} label={idType} value={idType} />
                                                        ))}
                                                    </Picker>
                                                </View>
                                                <TextInput
                                                    className="border border-gray-300 rounded-lg px-4 p-4 bg-white text-xl text-gray-900"
                                                    placeholder="Enter ID Number"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={idNumber}
                                                    onChangeText={setIdNumber}
                                                />
                                            </View>
                                        )}
                                        {item.label === "Permit" && (
                                            <View className="w-full mt-2">
                                                <TouchableOpacity
                                                    className="border border-gray-300 rounded-lg px-4 p-4 bg-white my-2"
                                                    onPress={() => setShowDatePicker(true)}
                                                >
                                                    <Text className="text-xl text-gray-900">
                                                        {selectedDate ? selectedDate.toLocaleDateString() : "Permit Effective Date"}
                                                    </Text>
                                                </TouchableOpacity>
                                                {showDatePicker && (
                                                    <DateTimePicker
                                                        value={selectedDate || new Date()}
                                                        mode="date"
                                                        display="default"
                                                        onChange={handleDateChange}
                                                    />
                                                )}
                                                <TextInput
                                                    className="border border-gray-300 rounded-lg px-4 p-4 bg-white text-xl text-gray-900"
                                                    placeholder="Enter Permit Number"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={permitNumber}
                                                    onChangeText={setPermitNumber}
                                                />
                                            </View>
                                        )}
                                    </View>
                                )}
                                {imagesByType[item.label] && imagesByType[item.label].length > 0 ? (
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                                            <View className="flex-row gap-2">
                                                {imagesByType[item.label].map((uri, index) => (
                                                    <View key={index} className="relative">
                                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg" />
                                                        {selectedRow?.status?.toLowerCase() !== "endorsed" &&
                                                            selectedRow?.status?.toLowerCase() !== "approved" && (
                                                                <TouchableOpacity
                                                                    className="absolute top-1 right-1 bg-red-500 p-1 rounded-full"
                                                                    onPress={() => handleDeleteImage(item.label, uri)}
                                                                >
                                                                    <Ionicons name="trash" size={16} color="white" />
                                                                </TouchableOpacity>
                                                            )}
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                ) : (
                                    <Text className="text-lg text-gray-500 mt-2">No images added</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setModalVisible(false);
                    setModalImageUri(null);
                }}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.8)",
                        justifyContent: "center",
                    }}
                >
                    <View className="relative">
                        {modalImageUri && (
                            <Image
                                source={{ uri: modalImageUri }}
                                className="rounded-md"
                                style={{
                                    width: "100%",
                                    height: "95%",
                                    resizeMode: "contain",
                                }}
                            />
                        )}
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                top: 110,
                                right: 20,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                padding: 10,
                                borderRadius: 50,
                            }}
                            onPress={() => {
                                setModalVisible(false);
                                setModalImageUri(null);
                            }}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

export default DetailsScreen;
