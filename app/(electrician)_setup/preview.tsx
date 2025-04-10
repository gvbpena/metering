import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useFormData, groupedPages } from "./_context";
import StackScreen from "./_stackscreen";

const PreviewPage = () => {
    const { formData } = useFormData();

    return (
        <>
            <StackScreen title="Client Additional Info" nextRoute="/(electrician)_setup/preview" nextLabel="Done" onNext={() => true} />
            <ScrollView className="space-y-6 mx-4">
                <View className="mt-4">
                    {groupedPages.map((section) => (
                        <View key={section.title as string} className="bg-white border border-gray-300 rounded-2xl shadow-sm p-8 mb-6">
                            <Text className="text-xl font-semibold text-gray-900 mb-6">{section.title}</Text>
                            <View className="space-y-4">
                                {section.fields.map((field) => (
                                    <View key={field as string} className="flex-row justify-between pb-3  border-gray-300">
                                        <Text className="text-lg text-gray-700 font-medium">
                                            {String(field)
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                            :
                                        </Text>
                                        <Text className="text-lg text-gray-600">{formData[field as keyof typeof formData] || "N/A"}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </>
    );
};

export default PreviewPage;
