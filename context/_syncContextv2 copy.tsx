// import { createContext, useContext, useState, ReactNode } from "react";
// import { useTransferImages } from "./submit_image";
// import { useTransferMAData } from "./submit_application";
// import { useSQLiteContext } from "expo-sqlite";
// import useSyncMeteringApplication from "./syncMaStatus";

// interface SyncContextProps {
//     startSync: () => Promise<void>;
//     startStatusSync: () => Promise<void>;
//     checkImageStatus: () => Promise<string>;
//     checkApplicationStatus: () => Promise<string>;
//     syncing: boolean;
//     statusSyncing: boolean;
//     getAllSyncedAndUnsyncedData: (application_id: string) => Promise<number>;
// }

// const SyncContext = createContext<SyncContextProps | undefined>(undefined);

// export function SyncProvider({ children }: { children: ReactNode }) {
//     console.log("SyncProvider: Initializing");
//     const { syncImages } = useTransferImages();
//     const { syncMAData } = useTransferMAData();
//     const db = useSQLiteContext();
//     const [syncing, setSyncing] = useState(false);
//     const [statusSyncing, setStatusSyncing] = useState(false);
//     const { differences, fetchStatuses } = useSyncMeteringApplication();

//     const checkStatus = async (table: string, column: string, status: string): Promise<string> => {
//         console.log(`checkStatus: Called for table=${table}, column=${column}, status=${status}`);
//         try {
//             const result = await db.getFirstAsync<{ total?: number }>(`SELECT COUNT(*) as total FROM ${table} WHERE ${column} = ?`, [status]);
//             const statusResult = (result?.total ?? 0) > 0 ? "Unsynced" : "Synced";
//             console.log(`checkStatus: Result for ${table}.${column}='${status}' is ${statusResult}`);
//             return statusResult;
//         } catch (error) {
//             console.error(`checkStatus: Error checking ${status} status in ${table}:`, error);
//             return "Unsynced";
//         }
//     };

//     const checkImageStatus = async () => {
//         console.log("checkImageStatus: Called");
//         return await checkStatus("images", "status", "Unsynced");
//     };

//     const checkApplicationStatus = async () => {
//         console.log("checkApplicationStatus: Called");
//         return await checkStatus("metering_application", "sync_status", "Unsynced");
//     };

//     const startSync = async () => {
//         console.log("startSync: Called");
//         if (syncing) {
//             console.log("startSync: Already syncing, returning.");
//             return;
//         }
//         setSyncing(true);
//         console.log("startSync: Set syncing state to true");
//         try {
//             console.log("startSync: Checking application status...");
//             const applicationStatus = await checkApplicationStatus();
//             console.log(`startSync: Application status is ${applicationStatus}`);
//             if (applicationStatus === "Unsynced") {
//                 console.log("startSync: Application is Unsynced, calling syncMAData...");
//                 await syncMAData();
//                 console.log("startSync: syncMAData completed.");
//             }

//             console.log("startSync: Checking image status...");
//             const imageStatus = await checkImageStatus();
//             console.log(`startSync: Image status is ${imageStatus}`);
//             if (imageStatus === "Unsynced") {
//                 console.log("startSync: Images are Unsynced, calling syncImages...");
//                 await syncImages();
//                 console.log("startSync: syncImages completed.");
//             }
//             console.log("startSync: Sync checks complete.");
//         } catch (error) {
//             console.error("startSync: Sync failed:", error);
//         } finally {
//             console.log("startSync: Set syncing state to false");
//             setSyncing(false);
//         }
//     };

//     const startStatusSync = async () => {
//         console.log("startStatusSync: Called");
//         if (statusSyncing) {
//             // Added check from previous version
//             console.log("startStatusSync: Already status syncing, returning.");
//             return;
//         }
//         setStatusSyncing(true);
//         console.log("startStatusSync: Set statusSyncing state to true");
//         try {
//             console.log("startStatusSync: Calling fetchStatuses...");
//             await fetchStatuses();
//             console.log(`startStatusSync: fetchStatuses completed. Found ${differences.length} differences.`);
//             if (differences.length > 0) {
//                 console.log("startStatusSync: Updating local records based on differences...");
//                 await Promise.all(
//                     differences.map(async ({ application_id, status, remarks }) => {
//                         console.log(`startStatusSync: Updating application ${application_id} to status ${status}, remarks ${remarks}, sync_status Unsynced`);
//                         await db.runAsync("UPDATE metering_application SET status = ?, remarks = ?, sync_status = ? WHERE application_id = ?", [
//                             status,
//                             remarks,
//                             "Unsynced",
//                             application_id,
//                         ]);
//                     })
//                 );
//                 console.log("startStatusSync: Finished updating local records.");
//             } else {
//                 console.log("startStatusSync: No differences found, no updates needed.");
//             }
//         } catch (error) {
//             console.error("startStatusSync: Status sync failed:", error);
//         } finally {
//             console.log("startStatusSync: Set statusSyncing state to false");
//             setStatusSyncing(false);
//         }
//     };

//     const getAllSyncedAndUnsyncedData = async (application_id: string) => {
//         console.log(`getAllSyncedAndUnsyncedData: Called for application_id=${application_id}`);
//         try {
//             // Note: Calling startStatusSync here might trigger nested calls if used elsewhere without care.
//             // Consider if this is the best place for it. Removing the call for now based on potential issues.
//             // console.log(`getAllSyncedAndUnsyncedData: Calling startStatusSync for ${application_id}`);
//             // await startStatusSync();
//             // console.log(`getAllSyncedAndUnsyncedData: startStatusSync completed for ${application_id}`);

//             // Removing the arbitrary delay unless specifically needed for some reason
//             // await new Promise((resolve) => setTimeout(resolve, 500));

//             console.log(`getAllSyncedAndUnsyncedData: Querying sync counts for ${application_id}`);
//             const result = await db.getFirstAsync<{
//                 syncedImages: number;
//                 unsyncedImages: number;
//                 syncedApplications: number;
//                 unsyncedApplications: number;
//             }>(
//                 `SELECT
//                     COUNT(CASE WHEN i.status = 'Synced' THEN 1 END) AS syncedImages,
//                     COUNT(CASE WHEN i.status = 'Unsynced' THEN 1 END) AS unsyncedImages,
//                     COUNT(CASE WHEN ma.sync_status = 'Synced' THEN 1 END) AS syncedApplications,
//                     COUNT(CASE WHEN ma.sync_status = 'Unsynced' THEN 1 END) AS unsyncedApplications
//                 FROM images i
//                 LEFT JOIN metering_application ma ON i.reference_id = ma.application_id
//                 WHERE ma.application_id = ?
//                 AND ma.status = 'Endorsed';`,
//                 [application_id]
//             );
//             console.log(`getAllSyncedAndUnsyncedData: Query result for ${application_id}:`, result);

//             if (!result) {
//                 console.log(`getAllSyncedAndUnsyncedData: No result found for ${application_id}, returning 0.`);
//                 return 0;
//             }

//             const synced = (result.syncedImages ?? 0) + (result.syncedApplications ?? 0);
//             const unsynced = (result.unsyncedImages ?? 0) + (result.unsyncedApplications ?? 0);
//             const total = synced + unsynced;
//             const percentage = total > 0 ? (synced / total) * 100 : 0;
//             console.log(
//                 `getAllSyncedAndUnsyncedData: Calculated percentage for ${application_id}: ${percentage}% (Synced: ${synced}, Unsynced: ${unsynced}, Total: ${total})`
//             );
//             return percentage;
//         } catch (error) {
//             console.error(`getAllSyncedAndUnsyncedData: Error fetching sync status for ${application_id}:`, error);
//             return 0;
//         }
//     };

//     console.log("SyncProvider: Setup complete, returning provider.");
//     return (
//         <SyncContext.Provider
//             value={{
//                 startSync,
//                 startStatusSync,
//                 checkImageStatus,
//                 checkApplicationStatus,
//                 syncing,
//                 statusSyncing,
//                 getAllSyncedAndUnsyncedData,
//             }}
//         >
//             {children}
//         </SyncContext.Provider>
//     );
// }

// export function useSync() {
//     // console.log("useSync: Hook called");
//     const context = useContext(SyncContext);
//     if (!context) {
//         console.error("useSync: Context not found! Ensure component is wrapped in SyncProvider.");
//         throw new Error("useSync must be used within a SyncProvider");
//     }
//     return context;
// }
