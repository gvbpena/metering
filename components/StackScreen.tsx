// import { View, Text, TouchableOpacity, Alert } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { ElectricianSetupProvider, useElectricianSetupData } from "@/app/(electrician)_setup/_context";
// import { useSubmitSetupData } from "@/app/(electrician)_setup/submit";
// import { useState } from "react";

// interface NavbarProps {
//     title: string;
//     nextRoute?: string;
//     nextLabel: string;
//     onNext: boolean;
// }

// export default function Navbar({ title, nextRoute, nextLabel, onNext }: NavbarProps) {
//     const router = useRouter();
//     const { setupData } = useElectricianSetupData();
//     const { submitData } = useSubmitSetupData();
//     const [loading, setLoading] = useState(false);
//     const iconName = nextLabel === "Next" ? "arrow-forward" : "checkmark";

//     const handleNextPress = () => {
//         if (nextLabel === "Done") {
//             handleSubmit();
//         } else if (!onNext) {
//             Alert.alert("Please enter all fields", "Make sure all fields are completed before proceeding.", [{ text: "OK" }]);
//         } else if (nextRoute) {
//             router.push(nextRoute as any);
//         }
//     };

//     const handleSubmit = () => {
//         if (!setupData || Object.keys(setupData).length === 0) {
//             Alert.alert("Error", "No setup data available");
//             return;
//         }

//         setLoading(true);
//         submitData(setupData).finally(() => {
//             setLoading(false);
//             Alert.alert("Success", "Setup data added successfully");
//             router.push(nextRoute as any);
//         });
//     };

//     return (
//         <View className="flex-row items-center justify-between p-4 border-b border-gray-300 bg-white">
//             <TouchableOpacity onPress={() => router.back()} className="p-2 flex-row items-center">
//                 <Ionicons name="arrow-back" size={24} color="black" />
//                 <Text className="ml-2">Prev</Text>
//             </TouchableOpacity>

//             <Text className="text-lg font-semibold">{title}</Text>

//             <TouchableOpacity onPress={handleNextPress} className="p-2 flex-row items-center" disabled={loading}>
//                 <Text className="mr-2">{nextLabel}</Text>
//                 <Ionicons name={iconName} size={24} color="black" />
//             </TouchableOpacity>
//         </View>
//     );
// }
