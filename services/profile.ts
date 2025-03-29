import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

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
            } catch (error) {
                console.error("Error deleting user data:", error);
            }
        },
        [database]
    );

    const handleHistoryLogs = useCallback(() => {}, [router]);

    const handleDownloadWorkOrders = useCallback(() => {
        router.push("/work_order/workorder_download" as any);
    }, [router]);

    const handleLogout = useCallback(() => {
        if (data[0]?.id) {
            deleteUserData(data[0].id);
        }
        router.push("/login" as any);
    }, [data, deleteUserData, router]);

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

    return { data, isLoading, handleHistoryLogs, handleDownloadWorkOrders, confirmLogout };
};

export default useProfile;
