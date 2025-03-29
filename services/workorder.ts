// src/services/workOrderService.ts
import { useSQLiteContext } from "expo-sqlite";

export interface WorkOrder {
    id: string;
    workOrderNumber: string;
    description: string;
}

export const useWorkOrderService = () => {
    const database = useSQLiteContext();

    const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
        try {
            const result = await database.getAllAsync<{ wo_no: string; wo_no_description: string }>("SELECT wo_no, wo_no_description FROM work_order");

            return result.map((order) => ({
                id: order.wo_no,
                workOrderNumber: order.wo_no,
                description: order.wo_no_description,
            }));
        } catch (error) {
            console.error("Failed to fetch work orders:", error);
            return [];
        }
    };

    return { fetchWorkOrders };
};
