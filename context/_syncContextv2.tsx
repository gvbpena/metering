import { createContext, useContext, useState, ReactNode } from "react";
import { useTransferImages } from "./submit_image";
import { useTransferMAData } from "./submit_application";
import { useSQLiteContext } from "expo-sqlite";
import useSyncMeteringApplication from "./syncMaStatus";

interface SyncContextProps {
    startSync: () => Promise<void>;
    startStatusSync: () => Promise<void>;
    checkImageStatus: () => Promise<string>;
    checkApplicationStatus: () => Promise<string>;
    syncing: boolean;
    statusSyncing: boolean;
    getAllSyncedAndUnsyncedData: (application_id: string) => Promise<number>;
}

const SyncContext = createContext<SyncContextProps | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
    const { syncImages } = useTransferImages();
    const { syncMAData } = useTransferMAData();
    const db = useSQLiteContext();
    const [syncing, setSyncing] = useState(false);
    const [statusSyncing, setStatusSyncing] = useState(false);
    const { differences, fetchStatuses } = useSyncMeteringApplication();

    const checkStatus = async (table: string, column: string, status: string): Promise<string> => {
        try {
            const result = await db.getFirstAsync<{ total?: number }>(`SELECT COUNT(*) as total FROM ${table} WHERE ${column} = ?`, [status]);
            return (result?.total ?? 0) > 0 ? "Unsynced" : "Synced";
        } catch (error) {
            console.error(`Error checking ${status} status in ${table}:`, error);
            return "Unsynced";
        }
    };

    const checkImageStatus = async () => {
        return await checkStatus("images", "status", "Unsynced");
    };

    const checkApplicationStatus = async () => {
        return await checkStatus("metering_application", "sync_status", "Unsynced");
    };

    const startSync = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const applicationStatus = await checkApplicationStatus();
            if (applicationStatus === "Unsynced") {
                await syncMAData();
            }

            const imageStatus = await checkImageStatus();
            if (imageStatus === "Unsynced") {
                await syncImages();
            }
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setSyncing(false);
        }
    };
    const startStatusSync = async () => {
        setStatusSyncing(true);
        try {
            await fetchStatuses();
            if (differences.length > 0) {
                await Promise.all(
                    differences.map(async ({ application_id, status, remarks }) => {
                        await db.runAsync("UPDATE metering_application SET status = ?, remarks = ?, sync_status = ? WHERE application_id = ?", [
                            status,
                            remarks,
                            "Unsynced",
                            application_id,
                        ]);
                    })
                );
            }
        } catch (error) {
            console.error("Status sync failed:", error);
        } finally {
            setStatusSyncing(false);
        }
    };

    const getAllSyncedAndUnsyncedData = async (application_id: string) => {
        try {
            await startStatusSync();
            await new Promise((resolve) => setTimeout(resolve, 500));
            const result = await db.getFirstAsync<{
                syncedImages: number;
                unsyncedImages: number;
                syncedApplications: number;
                unsyncedApplications: number;
            }>(
                `SELECT 
                    COUNT(CASE WHEN i.status = 'Synced' THEN 1 END) AS syncedImages,
                    COUNT(CASE WHEN i.status = 'Unsynced' THEN 1 END) AS unsyncedImages,
                    COUNT(CASE WHEN ma.sync_status = 'Synced' THEN 1 END) AS syncedApplications,
                    COUNT(CASE WHEN ma.sync_status = 'Unsynced' THEN 1 END) AS unsyncedApplications
                FROM images i
                LEFT JOIN metering_application ma ON i.reference_id = ma.application_id
                WHERE ma.application_id = ? 
                AND ma.status = 'Endorsed';`,
                [application_id]
            );

            if (!result) return 0;

            const synced = (result.syncedImages ?? 0) + (result.syncedApplications ?? 0);
            const unsynced = (result.unsyncedImages ?? 0) + (result.unsyncedApplications ?? 0);
            const total = synced + unsynced;
            // console.log(`Sync Percentage: ${total > 0 ? (synced / total) * 100 : 0}`);
            return total > 0 ? (synced / total) * 100 : 0;
        } catch (error) {
            console.error("Error fetching sync status:", error);
            return 0;
        }
    };

    return (
        <SyncContext.Provider
            value={{
                startSync,
                startStatusSync,
                checkImageStatus,
                checkApplicationStatus,
                syncing,
                statusSyncing,
                getAllSyncedAndUnsyncedData,
            }}
        >
            {children}
        </SyncContext.Provider>
    );
}

export function useSync() {
    const context = useContext(SyncContext);
    if (!context) throw new Error("useSync must be used within a SyncProvider");
    return context;
}
