import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { useRouter } from "expo-router";

export default function ConsentPage() {
    const router = useRouter();
    const signatureRef = useRef<any>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Save signature
    const handleSignatureSave = (signatureImage: string) => {
        setSignature(signatureImage);
        setIsConfirmed(true);
    };

    // Clear signature
    const handleClear = () => {
        signatureRef.current?.clearSignature();
        setSignature(null);
        setIsConfirmed(false);
    };

    // Save & Confirm
    const handleSaveSignature = () => {
        Alert.alert("Success", "Signature saved successfully!");
        router.back();
    };

    return (
        <ScrollView className="mb-6">
            <View className="flex-1 bg-white px-6 pt-10">
                <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">Consent Agreement</Text>

                <Text className="text-gray-700 text-justify leading-6 mb-4">
                    Here at Davao Light and Power Company, Inc. (the "Company"), we believe in protecting the privacy of your personal information...
                </Text>

                {/* Signature Section */}
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

                {/* Buttons */}
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
                        <TouchableOpacity
                            onPress={handleSaveSignature}
                            className="bg-green-500 rounded-md py-3 flex-row justify-center items-center w-full mt-4"
                        >
                            <Text className="text-white text-lg font-medium">Save Signature</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
