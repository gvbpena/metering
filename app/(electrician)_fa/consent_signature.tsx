import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { useSubmitSetupData } from "./submit";
import { useActivityId } from "./_context";
import StackScreen from "./_stackscreen";

const SignaturePage = () => {
    const signatureRef = useRef<any>(null);
    const router = useRouter();
    const [signature, setSignature] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const { state } = useActivityId();
    const { moveAndSaveImages, deleteImageFromDatabase } = useSubmitSetupData();
    const referenceId = state.activityId;
    const imageType = "Signature";

    useEffect(() => {
        const loadSignature = async () => {
            const savedSignature = await AsyncStorage.getItem("userSignature");
            if (savedSignature) {
                setSignature(savedSignature);
                setIsConfirmed(true);
            }
        };
        loadSignature();
    }, []);

    const handleSignatureSave = async (signatureImage: string) => {
        try {
            const base64Data = signatureImage.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
            const fileName = `signature_${Date.now()}.png`;
            const filePath = FileSystem.documentDirectory + "image_files/" + fileName;

            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "image_files/", { intermediates: true });
            await FileSystem.writeAsStringAsync(filePath, base64Data, { encoding: FileSystem.EncodingType.Base64 });

            setSignature(filePath);
            setIsConfirmed(true);
            await AsyncStorage.setItem("userSignature", filePath);

            await moveAndSaveImages([filePath], referenceId, imageType);
        } catch (error) {
            console.error("Error saving signature:", error);
            Alert.alert("Error", "Failed to save signature.");
        }
    };

    const handleClear = async () => {
        console.log(signature);
        if (signature) {
            await deleteImageFromDatabase(signature);
        }
        signatureRef.current?.clearSignature();
        setSignature(null);
        setIsConfirmed(false);
        await AsyncStorage.removeItem("userSignature");
    };

    return (
        <>
            <StackScreen title="Customer Signature" nextRoute="consent_signature" nextLabel="Next" onNext={false} />
            <View className="flex-1 bg-gray-50 px-6">
                <View className="mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <Text className="text-base text-gray-700 leading-relaxed">
                        Dear <Text className="font-medium">Customer</Text>,{"\n"}
                        {"\n"}
                        Please confirm that the seal is intact by signing below.
                    </Text>
                </View>

                <View className="mt-6">
                    <Text className="text-gray-700 text-sm font-medium mb-2">Signature</Text>
                    {!isConfirmed ? (
                        <View className="w-full h-72 border rounded-lg border-gray-300 bg-white overflow-hidden">
                            <SignatureScreen
                                ref={signatureRef}
                                onEnd={() => console.log("Signature drawing ended")}
                                onOK={handleSignatureSave}
                                descriptionText="Draw your signature"
                                clearText="Clear"
                                confirmText="Confirm"
                            />
                        </View>
                    ) : (
                        <View className="mt-4 w-full items-center">
                            <Image source={{ uri: signature || "" }} style={{ width: 280, height: 160, borderRadius: 12 }} resizeMode="contain" />
                            <Text className="text-sm text-gray-600 mt-2">Your signature</Text>
                        </View>
                    )}
                </View>

                <View className="flex-row justify-between w-full mt-6">
                    {!isConfirmed ? (
                        <>
                            <TouchableOpacity onPress={handleClear} className="bg-red-500 rounded-md py-3 flex-row justify-center items-center w-1/2">
                                <Text className="text-white text-lg font-medium">Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => signatureRef.current?.readSignature()}
                                className="bg-[#0066A0] rounded-md py-3 flex-row justify-center items-center w-1/2 ml-4"
                            >
                                <Text className="text-white text-lg font-medium">Confirm</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={handleClear} className="bg-red-500 rounded-md py-3 flex-row justify-center items-center w-1/2">
                                <Text className="text-white text-lg font-medium">Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-green-500 rounded-md py-3 flex-row justify-center items-center w-1/2 ml-4"
                            >
                                <Text className="text-white text-lg font-medium">Done</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </>
    );
};

export default SignaturePage;
