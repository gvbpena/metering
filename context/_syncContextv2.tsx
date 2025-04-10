import { createContext, useContext, useState, ReactNode } from "react";
import { useTransferImages } from "./submit_image"; // Ensure this path is correct
import { useTransferMAData } from "./submit_application"; // Ensure this path is correct
import { useSQLiteContext } from "expo-sqlite";
import useSyncMeteringApplication from "./syncMaStatus"; // Ensure this path is correct

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
            return "Unsynced"; // Default to Unsynced on error
        }
    };

    const checkImageStatus = async (): Promise<string> => {
        return checkStatus("images", "status", "Unsynced");
    };

    const checkApplicationStatus = async (): Promise<string> => {
        return checkStatus("metering_application", "sync_status", "Unsynced");
    };

    const startSync = async () => {
        if (syncing) {
            return;
        }
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
        if (statusSyncing) {
            return;
        }
        setStatusSyncing(true);
        try {
            await fetchStatuses();
            if (differences.length > 0) {
                await Promise.all(
                    differences.map(async ({ application_id, status, remarks }) => {
                        // Ensure remarks is not undefined before updating
                        const finalRemarks = remarks === undefined ? null : remarks;
                        await db.runAsync("UPDATE metering_application SET status = ?, remarks = ?, sync_status = ? WHERE application_id = ?", [
                            status,
                            finalRemarks, // Use potentially null remarks
                            "Unsynced", // Or should this be "Synced" if update is successful from server? Review logic.
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

    const getAllSyncedAndUnsyncedData = async (application_id: string): Promise<number> => {
        try {
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
                FROM metering_application ma -- Start with metering_application
                LEFT JOIN images i ON i.reference_id = ma.application_id -- Left join images
                WHERE ma.application_id = ? 
                -- Removed the hardcoded 'Endorsed' status filter here unless it's specifically required for this percentage calculation
                -- AND ma.status = 'Endorsed' 
                GROUP BY ma.application_id;`, // Added GROUP BY
                [application_id]
            );

            if (!result) {
                return 0;
            }

            // Ensure counts default to 0 if null/undefined
            const syncedImg = result.syncedImages ?? 0;
            const unsyncedImg = result.unsyncedImages ?? 0;
            const syncedApp = result.syncedApplications ?? 0;
            const unsyncedApp = result.unsyncedApplications ?? 0;

            // Decide what constitutes "synced" for the percentage.
            // Option 1: Only app sync status matters
            // const synced = syncedApp;
            // const total = syncedApp + unsyncedApp;

            // Option 2: Both app and all its images must be synced
            // const appIsSynced = syncedApp > 0 && unsyncedApp === 0;
            // const imagesAreSynced = unsyncedImg === 0; // Assuming at least one image exists if app exists
            // const synced = (appIsSynced && imagesAreSynced) ? 1 : 0;
            // const total = 1; // Represents the application as a whole unit

            // Option 3: Percentage of total items (app + images) synced
            const synced = syncedImg + syncedApp;
            const total = syncedImg + unsyncedImg + syncedApp + unsyncedApp;

            const percentage = total > 0 ? Math.round((synced / total) * 100) : 0; // Use Math.round for integer percentage
            return percentage;
        } catch (error) {
            console.error(`Error fetching sync status for ${application_id}:`, error);
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

export function useSync(): SyncContextProps {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync must be used within a SyncProvider");
    }
    return context;
}
