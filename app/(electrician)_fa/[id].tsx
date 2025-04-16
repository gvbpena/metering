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
import * as DocumentPicker from "expo-document-picker";
import { useDeleteData } from "@/context/delete_application"; // <-- Adjust the path as needed

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
    remarks?: string;
    reference_pole?: string;
    nearmeterno?: string;
    pole_latitude?: string;
    pole_longitude?: string;
    meter_latitude?: string;
    meter_longitude?: string;
    premise_latitude?: string;
    premise_longitude?: string;
    traversingwire?: string;
    deceasedlotowner?: string;
    electricalpermitnumber?: string;
    permiteffectivedate?: string;
    fatherfirstname?: string;
    fathermiddlename?: string;
    fatherlastname?: string;
    motherfirstname?: string;
    mothermiddlename?: string;
    motherlastname?: string;
    representativefirstname?: string;
    representativemiddlename?: string;
    representativelastname?: string;
    representativerelationship?: string;
    representativemobile?: string;
    representativeemail?: string;
    representativeattachedid?: string;
    representativespecialpowerofattorney?: string;
    streethouseunitno?: string;
    sitiopurokbuildingsubdivision?: string;
    has_representative?: string;
}

interface ImageData {
    [key: string]: string[];
}

interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface LoadingState {
    Meterbase: boolean;
    Premises: boolean;
    "Pole Images": boolean;
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
            "has_representative",
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
    electricalpermitnumber: "Electrical Permit Number",
    permiteffectivedate: "Permit Effective Date",
    landmark: "Landmark",
    has_representative: "Has Representative",
};

const DetailsScreen = () => {
    const database = useSQLiteContext();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedImages, setSelectedImages] = useState<{ [key: string]: string[] }>({});
    const [selectedRow, setSelectedRow] = useState<MeteringApplication | null>(null);
    const [imagesByType, setImagesByType] = useState<ImageData>({});
    const { moveAndSaveImages, deleteImageFromDatabase, updateApplicationData, endorsedApplication } = useSubmitSetupData();
    const { deleteApplicationData } = useDeleteData();
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
    const [locationLoading, setLocationLoading] = useState<LoadingState>({ Meterbase: false, Premises: false, "Pole Images": false });

    const getLocation = async (type: "Meterbase" | "Premises" | "Pole Images") => {
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

        if (type === "Meterbase") {
            setMeterLocation(newLocation);
        } else if (type === "Premises") {
            setPremiseLocation(newLocation);
        } else if (type === "Pole Images") {
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
            const result: any[] = await database.getAllAsync(query, [id]);
            if (result.length > 0) {
                const firstRow = result.find((row) => row.application_id);
                const meteringApplication = firstRow ? { ...(firstRow as MeteringApplication) } : null;

                if (!meteringApplication) {
                    const singleAppQuery = `SELECT * FROM metering_application WHERE application_id = ?`;
                    const appResult: any = await database.getFirstAsync(singleAppQuery, [id]);
                    if (appResult) {
                        setSelectedRow(appResult as MeteringApplication);
                        setImagesByType({});
                    } else {
                        setSelectedRow(null);
                        setImagesByType({});
                    }
                } else {
                    const groupedImages: ImageData = {};
                    result.forEach((row: any) => {
                        if (row.image_type && row.image_urls) {
                            groupedImages[row.image_type] = row.image_urls.split(",");
                        }
                    });
                    setSelectedRow(meteringApplication);
                    setImagesByType(groupedImages);
                }
            } else {
                const singleAppQuery = `SELECT * FROM metering_application WHERE application_id = ?`;
                const appResult: any = await database.getFirstAsync(singleAppQuery, [id]);
                if (appResult) {
                    setSelectedRow(appResult as MeteringApplication);
                    setImagesByType({});
                } else {
                    setSelectedRow(null);
                    setImagesByType({});
                }
            }
        } catch (error) {
            console.error("Error fetching data from SQLite:", error);
            Alert.alert("Error", "Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    }, [id, database]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    const captureButtons = useMemo(() => {
        const baseButtons = [
            { label: "Meterbase" },
            { label: "Pole Images" },
            { label: "Permit" },
            { label: "Proof of Ownership" },
            { label: "Identity Card" },
            { label: "Premises" },
            { label: "Signature" },
            { label: "Attach Document" },
            // SPA is added conditionally below
        ];

        // Check if selectedRow has data and if has_representative is 'Yes'
        // Using optional chaining (?.) and toLowerCase() for robustness
        if (selectedRow?.has_representative?.toLowerCase() === "yes") {
            baseButtons.push({ label: "SPA" });
        }

        return baseButtons;
    }, [selectedRow]); // Recalculate only when selectedRow changes
    useEffect(() => {
        const checkHasSelected = () => {
            const hasAnySelected = Object.values(selectedImages).some((uris) => uris.length > 0);
            const hasLocation = !!meterLocation || !!premiseLocation || !!poleLocation;
            const hasPermitInfo = !!selectedDate || !!permitNumber;
            const hasIdInfo = !!selectedIdType || !!idNumber;
            setHasSelectedImages(hasAnySelected || hasLocation || hasPermitInfo || hasIdInfo);
        };
        checkHasSelected();
    }, [selectedImages, meterLocation, premiseLocation, poleLocation, selectedDate, permitNumber, selectedIdType, idNumber]);

    const canEndorsed = useMemo(() => {
        if (!selectedRow || (selectedRow.status.toLowerCase() !== "pending" && selectedRow.status.toLowerCase() !== "rejected")) {
            return false;
        }
        const requiredImageTypes = captureButtons.map((btn) => btn.label);
        return requiredImageTypes.every((type) => imagesByType[type]?.length > 0);
    }, [imagesByType, selectedRow, captureButtons]);

    useEffect(() => {
        if (id) {
            dispatch({ type: "SET_ACTIVITY_ID", payload: id });
        }
    }, [id, dispatch]);

    const router = useRouter();

    const launchDocumentPicker = async (category: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uris = result.assets.map((asset) => asset.uri);
                setSelectedImages((prev) => ({
                    ...prev,
                    [category]: [...(prev[category] || []), ...uris],
                }));
            } else if (result.canceled) {
                console.log("Document picking cancelled");
            } else {
                Alert.alert("Error", "Could not select document.");
            }
        } catch (error) {
            console.error("Error picking document:", error);
            Alert.alert("Error", "An error occurred while picking the document.");
        }
    };

    const pickImageOrTakePhoto = async (category: string) => {
        if (category === "Signature") {
            router.push("/consent" as any);
            return;
        }

        if (category === "Attach Document") {
            launchDocumentPicker(category);
            return;
        }

        const options: AlertButton[] = [
            { text: "Cancel", style: "cancel" },
            { text: "Take Photo", onPress: () => launchCamera(category) },
        ];

        if (!["Meterbase", "Premises", "Pole Images"].includes(category)) {
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
        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (category === "Premises") {
                getLocation("Premises");
            }
            if (category === "Meterbase") {
                getLocation("Meterbase");
            }
            if (category === "Pole Images") {
                getLocation("Pole Images");
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
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImages((prev) => ({ ...prev, [category]: [...(prev[category] || []), ...result.assets.map((asset) => asset.uri)] }));
        }
    };
    const handleDelete = async () => {
        const applicationId = selectedRow?.application_id;
        if (!applicationId) {
            Alert.alert("Error", "Cannot delete: Application ID is missing.");
            console.error("Delete failed: application_id is missing from selectedRow", selectedRow);
            return;
        }

        console.log("Attempting to delete application with ID:", applicationId);

        try {
            await deleteApplicationData(applicationId);
            Alert.alert("Success", "Application deleted successfully.", [
                {
                    text: "OK",
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: unknown) {
            console.error("Failed to delete application:", error);

            let errorMessage = "Unknown error";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            Alert.alert("Error", `Failed to delete application: ${errorMessage}`);
        }
    };

    const handleDeleteImage = async (category: string, uri: string) => {
        try {
            await deleteImageFromDatabase(uri);

            if (category === "Signature") {
                await AsyncStorage.removeItem("userSignature");
            }

            await fetchData();
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

        setLoading(true);

        try {
            const hasDataToUpdate =
                selectedDate ||
                permitNumber ||
                selectedIdType ||
                idNumber ||
                meterLocation ||
                premiseLocation ||
                poleLocation ||
                Object.keys(selectedImages).length > 0;

            if (hasDataToUpdate) {
                await updateApplicationData(
                    id,
                    selectedDate ? selectedDate.toISOString().split("T")[0] : undefined,
                    permitNumber || undefined,
                    selectedIdType || undefined,
                    idNumber || undefined,
                    meterLocation?.latitude?.toString(),
                    meterLocation?.longitude?.toString(),
                    premiseLocation?.latitude?.toString(),
                    premiseLocation?.longitude?.toString(),
                    poleLocation?.latitude?.toString(),
                    poleLocation?.longitude?.toString()
                );

                for (const category of Object.keys(selectedImages)) {
                    if (selectedImages[category] && selectedImages[category].length > 0) {
                        await moveAndSaveImages(selectedImages[category], id, category);
                    }
                }

                setSelectedImages({});
                setMeterLocation(null);
                setPremiseLocation(null);
                setPoleLocation(null);
                setSelectedDate(null);
                setPermitNumber("");
                setSelectedIdType("");
                setIdNumber("");

                await fetchData();

                Alert.alert("Success", "Data and images saved successfully!");
            } else {
                Alert.alert("No Changes", "No new data or images to save.");
            }
        } catch (error) {
            console.error("Save error:", error);
            Alert.alert("Error", "Failed to save data or images.");
        } finally {
            setLoading(false);
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
                acc[field] = String(selectedRow[field as keyof MeteringApplication] ?? "N/A");
                return acc;
            }, {} as Record<string, string>),
        };
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

    const isReadOnly = selectedRow?.status?.toLowerCase() === "approved" || selectedRow?.status?.toLowerCase() === "endorsed";

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
                            <View className="flex-row items-center justify-between p-2 rounded-lg mb-2">
                                <Text className="text-xl font-semibold text-gray-700 flex-1 flex-wrap">{section.title}</Text>

                                {section.title !== "Remarks" &&
                                    !isReadOnly &&
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
                                            badgeStyles = "bg-green-300 text-green-900";
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
                                    <View key={field} className="flex-row justify-between py-1 items-center px-2">
                                        {field !== "remarks" && <Text className="text-lg text-gray-600 font-medium flex-1">{fieldLabels[field] || field}</Text>}
                                        {section.title === "Client Information" && field === "status" ? (
                                            <Text className={`px-3 py-1 text-md font-bold rounded-full ${badgeStyles}`}>{value}</Text>
                                        ) : section.title === "Client Information" && field === "application_id" ? (
                                            <Text className="text-gray-800 font-bold text-xl">{value}</Text>
                                        ) : (
                                            <Text className="text-gray-800 text-xl flex-shrink text-right">{value}</Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}

                <View className="space-y-3 mb-6">
                    {captureButtons.map((item) => (
                        <View key={item.label} className="bg-white border border-gray-300 rounded-lg shadow-md p-4 mb-2">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xl font-semibold text-gray-700">{item.label} </Text>
                                {!isReadOnly && (
                                    <TouchableOpacity
                                        onPress={() => pickImageOrTakePhoto(item.label)}
                                        className="w-1/2 h-10 flex-row items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm"
                                    >
                                        {item.label === "Attach Document" ? (
                                            <Ionicons name="attach" size={20} color="gray" className="mr-2" />
                                        ) : item.label === "Signature" ? (
                                            <Ionicons name="pencil" size={20} color="gray" className="mr-2" />
                                        ) : (
                                            <Ionicons name="camera" size={20} color="gray" className="mr-2" />
                                        )}
                                        <Text className="text-lg text-gray-700 font-medium">
                                            {item.label === "Attach Document" ? "Attach" : item.label === "Signature" ? "Sign" : "Capture"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {!isReadOnly && item.label === "Premises" && (
                                <View className="flex flex-row items-center mt-2">
                                    {locationLoading.Premises && (
                                        <View className="flex flex-row items-center">
                                            <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                            <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                        </View>
                                    )}
                                    {!locationLoading.Premises && premiseLocation && (
                                        <Text className="text-sm text-gray-600">
                                            Lat: {premiseLocation.latitude.toFixed(6)}, Long: {premiseLocation.longitude.toFixed(6)}
                                        </Text>
                                    )}
                                    {errorMsg && <Text className="text-sm text-red-500 ml-2">{errorMsg}</Text>}
                                </View>
                            )}

                            {!isReadOnly && item.label === "Meterbase" && (
                                <View className="flex flex-row items-center mt-2">
                                    {locationLoading.Meterbase && (
                                        <View className="flex flex-row items-center">
                                            <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                            <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                        </View>
                                    )}
                                    {!locationLoading.Meterbase && meterLocation && (
                                        <Text className="text-sm text-gray-600">
                                            Lat: {meterLocation.latitude.toFixed(6)}, Long: {meterLocation.longitude.toFixed(6)}
                                        </Text>
                                    )}
                                    {errorMsg && <Text className="text-sm text-red-500 ml-2">{errorMsg}</Text>}
                                </View>
                            )}

                            {!isReadOnly && item.label === "Pole Images" && (
                                <View className="flex flex-row items-center mt-2">
                                    {locationLoading["Pole Images"] && (
                                        <View className="flex flex-row items-center">
                                            <ActivityIndicator size="small" color="#4B5563" className="mr-2" />
                                            <Text className="text-sm text-gray-600">Fetching Location...</Text>
                                        </View>
                                    )}
                                    {!locationLoading["Pole Images"] && poleLocation && (
                                        <Text className="text-sm text-gray-600">
                                            Lat: {poleLocation.latitude.toFixed(6)}, Long: {poleLocation.longitude.toFixed(6)}
                                        </Text>
                                    )}
                                    {errorMsg && <Text className="text-sm text-red-500 ml-2">{errorMsg}</Text>}
                                </View>
                            )}

                            {!isReadOnly && selectedImages[item.label]?.length > 0 && (
                                <View className="mt-2">
                                    <Text className="text-md font-medium text-blue-600 mb-1">New:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row space-x-2">
                                            {selectedImages[item.label].map((uri, index) =>
                                                item.label === "Attach Document" ? (
                                                    <View
                                                        key={`${item.label}-new-${index}`}
                                                        className="relative p-2 border border-blue-300 rounded-lg bg-blue-50 w-24 h-24 items-center justify-center"
                                                    >
                                                        <Ionicons name="document-text-outline" size={32} color="gray" />
                                                        <Text numberOfLines={2} ellipsizeMode="tail" className="text-xs text-center mt-1">
                                                            {decodeURIComponent(uri.split("/").pop() || "File")}
                                                        </Text>
                                                        <TouchableOpacity
                                                            className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full z-10"
                                                            onPress={() => {
                                                                setSelectedImages((prev) => ({
                                                                    ...prev,
                                                                    [item.label]: prev[item.label]?.filter((_, i) => i !== index),
                                                                }));
                                                            }}
                                                        >
                                                            <Ionicons name="close" size={14} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <View key={`${item.label}-new-${index}`} className="relative">
                                                        <Image source={{ uri }} className="w-24 h-24 rounded-lg border border-blue-300" />
                                                        <TouchableOpacity
                                                            className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full z-10"
                                                            onPress={() => {
                                                                setSelectedImages((prev) => ({
                                                                    ...prev,
                                                                    [item.label]: prev[item.label]?.filter((_, i) => i !== index),
                                                                }));
                                                                if (item.label === "Meterbase") setMeterLocation(null);
                                                                if (item.label === "Premises") setPremiseLocation(null);
                                                                if (item.label === "Pole Images") setPoleLocation(null);
                                                            }}
                                                        >
                                                            <Ionicons name="close" size={14} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )
                                            )}
                                        </View>
                                    </ScrollView>
                                    {!isReadOnly && item.label === "Identity Card" && (
                                        <View className="w-full mt-4">
                                            <Text className="text-md font-medium text-gray-600 mb-1">ID Details:</Text>
                                            <View className="border border-gray-300 rounded-lg bg-white mb-2">
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
                                    {!isReadOnly && item.label === "Permit" && (
                                        <View className="w-full mt-4">
                                            <Text className="text-md font-medium text-gray-600 mb-1">Permit Details:</Text>
                                            <TouchableOpacity
                                                className="border border-gray-300 rounded-lg px-4 p-4 bg-white mb-2"
                                                onPress={() => setShowDatePicker(true)}
                                            >
                                                <Text className="text-xl text-gray-900">
                                                    {selectedDate ? selectedDate.toLocaleDateString() : "Permit Effective Date"}
                                                </Text>
                                            </TouchableOpacity>
                                            {showDatePicker && (
                                                <DateTimePicker value={selectedDate || new Date()} mode="date" display="default" onChange={handleDateChange} />
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
                                <View className="mt-2">
                                    <Text className="text-md font-medium text-green-600 mb-1">Saved:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-2">
                                            {imagesByType[item.label].map((uri, index) =>
                                                item.label === "Attach Document" ? (
                                                    <TouchableOpacity key={`${item.label}-saved-${index}`}>
                                                        <View className="relative p-2 border border-gray-300 rounded-lg bg-gray-100 w-24 h-24 items-center justify-center">
                                                            <Ionicons name="document-text-outline" size={32} color="gray" />
                                                            <Text numberOfLines={2} ellipsizeMode="tail" className="text-xs text-center mt-1">
                                                                {decodeURIComponent(uri.split("/").pop() || "File")}
                                                            </Text>
                                                            {!isReadOnly && (
                                                                <TouchableOpacity
                                                                    className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full z-10"
                                                                    onPress={() => handleDeleteImage(item.label, uri)}
                                                                >
                                                                    <Ionicons name="trash" size={14} color="white" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        key={`${item.label}-saved-${index}`}
                                                        onPress={() => {
                                                            setModalImageUri(uri);
                                                            setModalVisible(true);
                                                        }}
                                                    >
                                                        <View className="relative">
                                                            <Image source={{ uri }} className="w-24 h-24 rounded-lg border border-gray-300" />
                                                            {!isReadOnly && (
                                                                <TouchableOpacity
                                                                    className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full z-10"
                                                                    onPress={() => handleDeleteImage(item.label, uri)}
                                                                >
                                                                    <Ionicons name="trash" size={14} color="white" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                )
                                            )}
                                        </View>
                                    </ScrollView>
                                </View>
                            ) : (
                                !selectedImages[item.label]?.length && <Text className="text-lg text-gray-500 mt-2">No items added</Text>
                            )}
                        </View>
                    ))}
                    {(selectedRow?.status?.toLowerCase() === "approved" || selectedRow?.status?.toLowerCase() === "pending") && (
                        <View className="mt-2 mb-2">
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        "Confirm Delete",
                                        "Are you sure you want to delete this application?",
                                        [
                                            {
                                                text: "Cancel",
                                                onPress: () => console.log("Delete cancelled"),
                                                style: "cancel",
                                            },
                                            {
                                                text: "Delete",
                                                onPress: handleDelete,
                                                style: "destructive",
                                            },
                                        ],
                                        { cancelable: true }
                                    )
                                }
                                className="bg-red-600 flex-row items-center justify-center py-3 px-4 rounded-lg shadow-md"
                            >
                                <Ionicons name="trash-outline" size={20} color="white" className="mr-2" />
                                <Text className="text-white text-lg font-semibold">Delete Application</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
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
                        alignItems: "center",
                    }}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={{ width: "95%", height: "85%" }}>
                        {modalImageUri && (
                            <Image
                                source={{ uri: modalImageUri }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    resizeMode: "contain",
                                    borderRadius: 5,
                                }}
                            />
                        )}
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                padding: 8,
                                borderRadius: 20,
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
