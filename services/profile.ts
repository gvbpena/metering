import { useState, useEffect, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import * as Device from "expo-device";
import * as Application from "expo-application";

export type UserData = {
    id: number;
    name: string;
    username: string;
    email: string;
    crewname: string;
    orgname: string;
    role: string;
};

const useProfile = () => {
    const database = useSQLiteContext();
    const router = useRouter();
    const [data, setData] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await database.getAllAsync<UserData>("SELECT id, name, username, email, crewname, orgname, role FROM metering_user");
            if (result && result.length > 0) {
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [database]);

    const deleteUserData = useCallback(
        async (userId: number) => {
            try {
                await database.runAsync("DELETE FROM metering_user WHERE id = ?", [userId]);
                setData([]);
            } catch (error) {
                console.error("Error deleting user data:", error);
                Alert.alert("Error", "Could not delete user data.");
            }
        },
        [database]
    );

    const getModelName = useCallback(async (): Promise<string | null> => {
        try {
            const modelName = Device.modelName || "UnknownModel";
            let uniqueDeviceId: string | null = null;

            if (Platform.OS === "android") {
                uniqueDeviceId = await Application.getAndroidId();
            } else if (Platform.OS === "ios") {
                uniqueDeviceId = await Application.getIosIdForVendorAsync();
            } else {
                uniqueDeviceId = "UnknownPlatformID";
            }

            return `${modelName}-${uniqueDeviceId}`;
        } catch (error) {
            console.error("Error getting device model name or ID:", error);
            return `UnknownModel-UnknownID`;
        }
    }, []);

    const handleHistoryLogs = useCallback(() => {
        console.log("Navigate to History Logs");
    }, [router]);

    const handleDownloadWorkOrders = useCallback(() => {
        router.push("/work_order/workorder_download" as any);
    }, [router]);

    const handleLogout = useCallback(async () => {
        const user = data[0];
        if (user?.id) {
            try {
                const modelName = await getModelName();
                const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_user/user_logout.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        model_name: modelName,
                    }),
                });

                const result = await response.json();
                if (!response.ok) {
                    console.error("API Error:", result);
                    Alert.alert("Logout Failed", result.error || "Something went wrong while updating the server.");
                    return;
                }
                console.log("API Response:", result);
                await deleteUserData(user.id);
                router.push("/login" as any);
            } catch (error) {
                console.error("Logout error:", error);
                Alert.alert("Logout Failed", "Could not log out properly. Please try again.");
            }
        } else {
            console.warn("No user ID found in state, navigating to login.");
            router.push("/login" as any);
        }
    }, [data, deleteUserData, getModelName, router]);

    const confirmLogout = useCallback(() => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: handleLogout, style: "destructive" },
            ],
            { cancelable: true }
        );
    }, [handleLogout]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return {
        data,
        isLoading,
        handleHistoryLogs,
        handleDownloadWorkOrders,
        confirmLogout,
        getModelName,
    };
};

export default useProfile;
