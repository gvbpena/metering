import React, { useEffect, useState, useRef } from "react";
import { Text, View } from "react-native";
import { useSync } from "@/context/_syncContext";

interface SyncStatusPageProps {
    fa_id: string;
}

const SyncStatusPage: React.FC<SyncStatusPageProps> = ({ fa_id }) => {
    const { getAllSyncedAndUnsyncedData } = useSync();
    const [percentage, setPercentage] = useState(0);
    const [dots, setDots] = useState(".");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const dotIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchSyncStatus = async () => {
            const syncPercentage = await getAllSyncedAndUnsyncedData(fa_id);
            setPercentage(syncPercentage);
        };

        if (percentage < 100) {
            intervalRef.current = setInterval(fetchSyncStatus, 500);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fa_id, getAllSyncedAndUnsyncedData, percentage]);

    useEffect(() => {
        if (percentage === 100) return;

        dotIntervalRef.current = setInterval(() => {
            setDots((prev) => (prev.length === 3 ? "." : prev + "."));
        }, 500);

        return () => {
            if (dotIntervalRef.current) clearInterval(dotIntervalRef.current);
        };
    }, [percentage]);

    if (percentage === 100) return null;

    return <Text className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{`${Math.round(percentage)}% Syncing${dots}`}</Text>;
};

export default SyncStatusPage;
