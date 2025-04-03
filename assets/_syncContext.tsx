// import { createContext, useContext, useState, ReactNode } from "react";
// import { useTransferImages } from "./submit_image";
// import { useTransferFAData } from "./submit_fa";
// import { useSQLiteContext } from "expo-sqlite";
// import syncFaStatus from "./syncFaStatus";

// interface SyncContextProps {
//     startSync: () => Promise<void>;
//     startStatusSync: () => Promise<void>;
//     checkImageStatus: () => Promise<string>;
//     checkFAStatus: () => Promise<string>;
//     syncing: boolean;
//     statusSyncing: boolean;
//     getAllSyncedAndUnsyncedData: (fa_id: string) => Promise<number>;
// }

// const SyncContext = createContext<SyncContextProps | undefined>(undefined);

// export function SyncProvider({ children }: { children: ReactNode }) {
//     const { syncImages } = useTransferImages();
//     const { syncFAData } = useTransferFAData();
//     const db = useSQLiteContext();
//     const [syncing, setSyncing] = useState(false);
//     const [statusSyncing, setStatusSyncing] = useState(false);

//     const checkStatus = async (table: string, column: string, status: string): Promise<string> => {
//         try {
//             const result = await db.getFirstAsync<{ total?: number }>(`SELECT COUNT(*) as total FROM ${table} WHERE ${column} = ?`, [status]);
//             return (result?.total ?? 0) > 0 ? "unsynced" : "synced";
//         } catch (error) {
//             console.error(`Error checking ${status} status in ${table}:`, error);
//             return "unsynced";
//         }
//     };

//     const checkImageStatus = async () => {
//         return await checkStatus("images", "status", "unsynced");
//     };

//     const checkFAStatus = async () => {
//         return await checkStatus("metering_fa", "sync_status", "unsynced");
//     };

//     const getAllSyncedAndUnsyncedData = async (fa_id: string) => {
//         try {
//             const result = await db.getFirstAsync<{
//                 syncedImages: number;
//                 unsyncedImages: number;
//                 syncedFA: number;
//                 unsyncedFA: number;
//             }>(
//                 `
//                 SELECT
//                     COUNT(CASE WHEN i.status = 'synced' THEN 1 END) AS syncedImages,
//                     COUNT(CASE WHEN i.status = 'unsynced' THEN 1 END) AS unsyncedImages,
//                     COUNT(CASE WHEN mfa.sync_status = 'synced' THEN 1 END) AS syncedFA,
//                     COUNT(CASE WHEN mfa.sync_status = 'unsynced' THEN 1 END) AS unsyncedFA
//                 FROM
//                     images i
//                 LEFT JOIN
//                     metering_fa mfa ON (i.reference_id = mfa.sp_id OR i.reference_id = mfa.mp_id)
//                 WHERE
//                     mfa.fa_id = ?`,
//                 [fa_id]
//             );
//             const synced = (result?.syncedImages ?? 0) + (result?.syncedFA ?? 0);
//             const unsynced = (result?.unsyncedImages ?? 0) + (result?.unsyncedFA ?? 0);
//             const total = synced + unsynced;
//             return total > 0 ? (synced / total) * 100 : 0;
//         } catch (error) {
//             console.error("Failed to get synced and unsynced data:", error);
//             return 0;
//         }
//     };

//     const startSync = async () => {
//         setSyncing(true);
//         try {
//             const faStatus = await checkFAStatus();
//             if (faStatus === "unsynced") {
//                 await syncFAData();
//             }

//             const imageStatus = await checkImageStatus();
//             if (imageStatus === "unsynced") {
//                 await syncImages();
//             }
//         } catch (error) {
//             console.error("Sync failed:", error);
//         } finally {
//             setSyncing(false);
//         }
//     };

//     const startStatusSync = async () => {
//         setStatusSyncing(true);
//         try {
//             const { differences } = syncFaStatus();

//             if (differences.length > 0) {
//                 const updatePromises = differences.map(({ fa_id, status }) =>
//                     db.runAsync("UPDATE metering_fa SET status = ? WHERE fa_id = ?", [status, fa_id])
//                 );
//                 await Promise.all(updatePromises);
//                 console.log("Status sync completed.");
//             } else {
//                 console.log("No status updates needed.");
//             }
//         } catch (error) {
//             console.error("Status sync failed:", error);
//         } finally {
//             setStatusSyncing(false);
//         }
//     };

//     return (
//         <SyncContext.Provider
//             value={{
//                 startSync,
//                 startStatusSync,
//                 checkImageStatus,
//                 checkFAStatus,
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
//     const context = useContext(SyncContext);
//     if (!context) throw new Error("useSync must be used within a SyncProvider");
//     return context;
// }
