import { Stack } from "expo-router";
export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="change_password" options={{ title: "Change Password", headerShown: true }} />
            <Stack.Screen
                name="change_password_new"
                options={{
                    title: "Genius Electrician Tool",
                    headerShown: true,
                    headerBackVisible: false,
                    headerLeft: () => null,
                }}
            />
        </Stack>
    );
}
