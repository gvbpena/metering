import { ElectricianSetupProvider } from "../(electrician)_fa/_context";
import { FormProvider } from "./_context";
import { router, Stack } from "expo-router";

export default function Layout() {
    return (
        <ElectricianSetupProvider>
            <FormProvider>
                <Stack>
                    <Stack.Screen
                        name="consent_signature_setup"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="consent"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page1"
                        options={{
                            title: "Select Orientaion",
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page2"
                        options={{
                            headerShown: false,
                        }}
                    />
                    {/* <Stack.Screen
                        name="page2_location"
                        options={{
                            title: "Set Service Point Location",
                            // headerShown: false,
                            headerTitleAlign: "center",
                        }}
                    /> */}
                    <Stack.Screen
                        name="page3"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page3_location"
                        options={{
                            title: "Set Metering Point Location",
                            headerTitleAlign: "center",
                        }}
                    />
                    <Stack.Screen
                        name="page4"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page5"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page6"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="page6_location"
                        options={{
                            title: "Select Metering Location",
                            headerShown: true,
                        }}
                    />
                    <Stack.Screen
                        name="page7"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="preview"
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack>
            </FormProvider>
        </ElectricianSetupProvider>
    );
}
