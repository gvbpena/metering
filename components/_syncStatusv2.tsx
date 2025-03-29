import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface SyncStatusPageProps {
    status: string | null;
    sync_status: string | null;
    totalRecords: string;
    syncedRecords: string;
    application_id: string;
}

const SyncStatusPage: React.FC<SyncStatusPageProps> = ({ status, sync_status, totalRecords, syncedRecords, application_id }) => {
    const total = Number(totalRecords) || 1;
    const synced = Number(syncedRecords) || 0;
    const percentage = Math.round((synced / total) * 100);

    if (status === "Rejected" || status === "Pending") return <SyncStatusText status="Unsynced" percentage={percentage} />;

    if (status === "Approved" || sync_status === "Synced") return <SyncStatusText status="Synced" percentage={percentage} />;

    return (
        <View className="flex flex-row items-center justify-center px-3 py-1 bg-gray-100 rounded-full">
            <Text className="text-md font-bold text-gray-700 text-center">Syncing... ({percentage}%)</Text>
            <ActivityIndicator size="small" color="#4B5563" className="ml-2" />
        </View>
    );
};

const SyncStatusText = React.memo(({ status, percentage }: { status: string; percentage: number }) => (
    <Text
        className={`px-3 py-1 text-md font-bold rounded-full text-center ${status === "Synced" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
    >
        {status}
    </Text>
));

export default SyncStatusPage;
