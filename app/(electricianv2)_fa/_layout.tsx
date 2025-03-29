import { Stack, Tabs } from "expo-router";
// import { SyncProvider } from "@/context/_syncContext";
import { ElectricianSetupProvider } from "./_context";

export default function RootLayout() {
    return (
        <ElectricianSetupProvider>
            <Stack>
                <Stack.Screen name="[id]" options={{ headerShown: false }} />
                <Stack.Screen name="show_location" options={{ headerShown: false }} />
                <Stack.Screen name="consent" options={{ headerShown: false }} />
                <Stack.Screen name="consent_signature" options={{ headerShown: false }} />
                <Stack.Screen name="edit_page" options={{ headerShown: false }} />
            </Stack>
        </ElectricianSetupProvider>
    );
}
