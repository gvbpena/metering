import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useFormData } from "./_context"; // Import your context
import { useRouter } from "expo-router";

const SetServicePage = () => {
    const router = useRouter();
    const { formData, dispatch } = useFormData();
    const [showUserLocation, setShowUserLocation] = useState(false);
    const defaultLat = formData.pole_latitude ? parseFloat(formData.pole_latitude) : 7.0654;
    const defaultLong = formData.pole_longitude ? parseFloat(formData.pole_longitude) : 125.61;

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        dispatch({ type: "SET_INPUT_FIELD", field: "latitude", payload: latitude.toString() });
        dispatch({ type: "SET_INPUT_FIELD", field: "longitude", payload: longitude.toString() });
    };

    return (
        <View className="flex-1 justify-start items-center">
            <View className="flex-row justify-between items-start px-4 py-2 h-[13vh]">
                <View className="flex-1 mr-2">
                    <View className="border border-gray-300 p-3 bg-white rounded-lg flex-row h-full relative">
                        <View className="flex flex-col space-y-2">
                            <View className="flex flex-row items-center">
                                <Ionicons name="ellipse-sharp" size={15} color="#15BCCA" />
                                <Text className="ml-2 text-sm font-medium text-gray-800">Metering Location</Text>
                            </View>
                            <View className="flex flex-row items-center">
                                <Ionicons name="ellipse-sharp" size={15} color="#0066A0" />
                                <Text className="ml-2 text-sm font-medium text-gray-800">Pole Location</Text>
                            </View>
                        </View>

                        {(formData.latitude || formData.longitude) && (
                            <View className="absolute bottom-2 left-3">
                                <Text className="text-sm text-gray-700">{`Lat: ${formData.latitude || "Not set"}`}</Text>
                                <Text className="text-sm text-gray-700 mt-1">{`Long: ${formData.longitude || "Not set"}`}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View className="flex-1 flex-col justify-between gap-2">
                    <TouchableOpacity
                        className="border border-gray-300 bg-white p-3 rounded-lg flex-row items-center justify-center w-full"
                        onPress={() => {
                            router.back();
                            console.log("Saved", formData.latitude, formData.longitude);
                        }}
                    >
                        <Ionicons name="save-outline" size={20} color="gray" />
                        <Text className="text-sm text-gray-700 font-medium text-sm ml-3">Save Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="border border-gray-300 bg-white p-3 rounded-lg flex-row items-center justify-center w-full"
                        onPress={() => setShowUserLocation((prev) => !prev)}
                    >
                        <Ionicons name={showUserLocation ? "location-sharp" : "location-outline"} size={20} color="gray" />
                        <Text className="ml-2 text-sm text-gray-700">{showUserLocation ? "Hide" : "Show"} Location</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className={`w-full overflow-hidden border border-gray-300 ${!showUserLocation ? "bg-gray-300" : ""}`} style={{ height: "100%" }}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: defaultLat,
                        longitude: defaultLong,
                        latitudeDelta: 0.0009,
                        longitudeDelta: 0.0009,
                    }}
                    onPress={handleMapPress}
                    showsUserLocation={showUserLocation}
                    showsMyLocationButton={true}
                >
                    {formData.pole_latitude && formData.pole_longitude && (
                        <Marker
                            coordinate={{
                                latitude: parseFloat(formData.pole_latitude),
                                longitude: parseFloat(formData.pole_longitude),
                            }}
                            anchor={{ x: 0.2, y: 0.2 }}
                            tappable={false}
                        >
                            <Ionicons name="ellipse-sharp" size={20} color="#0066A0" pointerEvents="none" />
                        </Marker>
                    )}
                    {formData.latitude && formData.longitude && (
                        <Marker
                            coordinate={{
                                latitude: parseFloat(formData.latitude),
                                longitude: parseFloat(formData.longitude),
                            }}
                            anchor={{ x: 0.2, y: 0.2 }}
                            tappable={false}
                        >
                            <Ionicons name="ellipse-sharp" size={20} color="#15BCCA" />
                        </Marker>
                    )}
                    {formData.pole_latitude && formData.pole_longitude && formData.latitude && formData.longitude && (
                        <Polyline
                            coordinates={[
                                {
                                    latitude: parseFloat(formData.pole_latitude),
                                    longitude: parseFloat(formData.pole_longitude),
                                },
                                {
                                    latitude: parseFloat(formData.latitude),
                                    longitude: parseFloat(formData.longitude),
                                },
                            ]}
                            strokeWidth={3}
                            strokeColor="#4285F4"
                            lineDashPattern={[2, 5]}
                        />
                    )}
                </MapView>
            </View>
        </View>
    );
};

export default SetServicePage;
