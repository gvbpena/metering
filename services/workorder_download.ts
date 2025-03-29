import { useSQLiteContext } from "expo-sqlite";

export type WorkOrder = {
    wo_no: string;
    wo_no_description: string;
    crew_name: string;
    org_name: string;
};

export type ApiResponse = {
    data: WorkOrder[];
    totalRecords: number;
    totalPages: number;
    page: number;
    perPage: number;
};

export type UserData = {
    crewname: string;
    orgname: string;
};
export const useWorkOrderDownloadService = () => {
    const database = useSQLiteContext();

    // Check if a work order is already downloaded
    const checkIfWorkOrderDownloaded = async (wo_no: string): Promise<boolean> => {
        try {
            const result = await database.getAllAsync<{ wo_no: string }>(
                `
                SELECT wo_no FROM work_order WHERE wo_no = ? LIMIT 1
            `,
                [wo_no]
            );

            return result.length > 0;
        } catch (error) {
            console.error("Check Work Order Downloaded Error:", error);
            return false;
        }
    };

    const fetchWorkOrders = async (page: number, perPage = 6): Promise<ApiResponse | null> => {
        try {
            const userData = await database.getAllAsync<UserData>("SELECT crewname, orgname FROM metering_user LIMIT 1");

            if (!userData || userData.length === 0) {
                console.error("No user data found");
                return null;
            }

            const { crewname, orgname } = userData[0];

            const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/get_wo.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    key: "QosSAiS4kjArpMCr",
                    crew_name: crewname,
                    org_name: orgname,
                    page,
                    perPage,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch work orders");

            return await response.json();
        } catch (error) {
            console.error("Fetch Work Orders Error:", error);
            return null;
        }
    };

    const insertWorkOrder = async (wo_no: string) => {
        try {
            const url = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/get_wo_download.php";
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "QosSAiS4kjArpMCr", wo_no }),
            });

            if (!response.ok) throw new Error("Error downloading work order");

            const result = await response.json();
            const workOrder = result.workorder;
            const workOrderTasks = result.workorder_task || [];

            if (!workOrder) throw new Error(`No work order data found for WO No: ${wo_no}`);

            const insertWorkOrderQuery = `
                INSERT INTO work_order (wo_no, wo_no_description, crew_name, org_name, account_id, plan_start, plan_finish) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            await database.runAsync(insertWorkOrderQuery, [
                workOrder.wo_no,
                workOrder.wo_no_description,
                workOrder.crew_name,
                workOrder.org_name,
                workOrder.account_id,
                workOrder.plan_start,
                workOrder.plan_finish,
            ]);

            for (const task of workOrderTasks) {
                const insertTaskQuery = `
                    INSERT INTO wo_no_task (wo_no, wo_task_no, wo_task_type, wo_task_description, problem_code, problem_description, crew_name)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await database.runAsync(insertTaskQuery, [
                    workOrder.wo_no,
                    task.wo_task_no,
                    task.wo_task_type,
                    task.wo_task_description,
                    task.problem_code,
                    task.problem_description,
                    task.crew_name,
                ]);
            }

            return true;
        } catch (error) {
            console.error("Insert Work Order Error:", error);
            return false;
        }
    };

    const updateWorkOrder = async (woNo: string): Promise<boolean> => {
        try {
            // Step 1: Delete the existing work order
            const deleteWorkOrderQuery = `DELETE FROM work_order WHERE wo_no = ?`;
            await database.runAsync(deleteWorkOrderQuery, [woNo]);

            // Step 2: Delete the associated tasks from wo_no_task
            const deleteWoNoTaskQuery = `DELETE FROM wo_no_task WHERE wo_no = ?`;
            await database.runAsync(deleteWoNoTaskQuery, [woNo]);

            // Step 3: Call the insertWorkOrder function to insert the updated data
            const result = await insertWorkOrder(woNo);

            return result; // Return the result of insertWorkOrder
        } catch (error) {
            console.error("Update Work Order Error:", error);
            return false;
        }
    };

    return { fetchWorkOrders, insertWorkOrder, checkIfWorkOrderDownloaded, updateWorkOrder };
};
