import { Stack } from "expo-router";
export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="change_password" options={{ title: "Change Password", headerShown: true }} />
            <Stack.Screen name="change_password_new" options={{ title: "Change Password", headerShown: false }} />
        </Stack>
    );
}
