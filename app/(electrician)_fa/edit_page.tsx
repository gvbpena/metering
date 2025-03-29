import { View, Text, ScrollView, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import StackScreen from "./_stackscreen";
import { fieldLabels } from "./[id]";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";

interface GroupedFields {
    title: string;
    application_id: string;
    fields: Record<string, string>;
}

export default function EditPage() {
    const db = useSQLiteContext();
    const router = useRouter();
    const params = useLocalSearchParams();
    const groupedFields: GroupedFields | null = params.groupedFields && typeof params.groupedFields === "string" ? JSON.parse(params.groupedFields) : null;

    const [editedFields, setEditedFields] = useState<Record<string, string>>(groupedFields?.fields || {});
    const [isEdited, setIsEdited] = useState(false);

    useEffect(() => {
        const hasChanges = Object.entries(editedFields).some(([key, value]) => value !== groupedFields?.fields[key]);
        setIsEdited(hasChanges);
    }, [editedFields, groupedFields]);

    if (!groupedFields) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-100">
                <Text className="text-lg text-red-500">No data available</Text>
            </View>
        );
    }
    const handleSave = async () => {
        if (!groupedFields) return;

        try {
            await db.execAsync("BEGIN TRANSACTION");
            const updateFields = Object.entries(editedFields).filter(([key, value]) => value !== groupedFields.fields[key]);

            if (updateFields.length > 0) {
                const updateQuery = `
                    UPDATE metering_application 
                    SET ${updateFields.map(([key]) => `${key} = ?`).join(", ")}
                    WHERE application_id = ?;
                `;

                const values = [...updateFields.map(([, value]) => value), groupedFields.application_id];

                await db.runAsync(updateQuery, values);
            }
            await db.execAsync("COMMIT");

            Alert.alert("Update Successful", "The record has been successfully updated.", [{ text: "OK", onPress: () => router.back() }]);
        } catch (error) {
            await db.execAsync("ROLLBACK");
            Alert.alert("Update Failed", "An error occurred while updating. Please try again.");
            console.error("Error updating database:", error);
        }
    };
    return (
        <>
            <StackScreen title="Client Information" onNext={isEdited} handleFunction={handleSave} nextLabel="Save" />
            <ScrollView className="flex-1 p-6 bg-gray-100">
                <Text className="text-3xl font-extrabold text-gray-900 mb-6">{groupedFields.title}</Text>
                {/* <View className="mb-6 p-4 border border-gray-300 bg-gray-200 rounded-xl">
                    <Text className="text-lg text-gray-700 font-semibold">Application ID:</Text>
                    <Text className="text-lg text-gray-900 font-bold">{groupedFields.application_id}</Text>
                </View> */}
                {Object.entries(groupedFields.fields).map(([key, value]) => (
                    <View key={key} className="mb-8">
                        {key === "application_id" || key === "status" ? (
                            <View className="p-4 border border-gray-300 bg-gray-200 rounded-xl">
                                <Text className="text-gray-600 text-base font-bold uppercase">
                                    {fieldLabels[key as keyof typeof fieldLabels] || key.replace(/([A-Z])/g, " $1").trim()}
                                </Text>
                                <Text className="text-lg text-gray-900 font-semibold">{value}</Text>
                            </View>
                        ) : (
                            <>
                                <Text className="text-gray-600 text-base font-bold mb-2 uppercase">
                                    {fieldLabels[key as keyof typeof fieldLabels] || key.replace(/([A-Z])/g, " $1").trim()}
                                </Text>
                                <TextInput
                                    className="border border-gray-300 rounded-xl px-6 py-5 bg-white text-lg text-gray-900"
                                    defaultValue={value || ""}
                                    placeholder="Enter value"
                                    placeholderTextColor="#9CA3AF"
                                    onChangeText={(text) => setEditedFields((prev) => ({ ...prev, [key]: text }))}
                                />
                            </>
                        )}
                    </View>
                ))}
            </ScrollView>
        </>
    );
}
