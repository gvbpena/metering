import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import useProfile from "@/services/profile";

interface MeteringApplication {
    application_id: string;
    status: string;
    remarks: string;
}

const useSyncMeteringApplication = () => {
    const database = useSQLiteContext();
    const [sqliteData, setSqliteData] = useState<MeteringApplication[]>([]);
    const [postgresData, setPostgresData] = useState<MeteringApplication[]>([]);
    const [differences, setDifferences] = useState<MeteringApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const { data } = useProfile();

    const fetchStatuses = async () => {
        if (!data || !data[0]?.id) {
            console.warn("Electrician ID not found");
            setLoading(false);
            return;
        }

        try {
            const electricianId = data[0].id;

            const [sqliteRows, postgresResponse] = await Promise.all([
                database
                    .getAllAsync<MeteringApplication>("SELECT application_id, status FROM metering_application WHERE electrician_id = ?", [electricianId])
                    .then((result) => {
                        // console.log("📥 SQLite rows:", result);
                        return result;
                    }),
                fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_metering_application_sync.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "QosSAiS4kjArpMCr" }),
                }).then(async (response) => {
                    // console.log("🌐 PostgreSQL fetch response status:", response.status);
                    return response;
                }),
            ]);

            if (!postgresResponse.ok) throw new Error("Failed to fetch PostgreSQL data");

            const postgresDataJson = await postgresResponse.json();

            const filteredPostgresData: MeteringApplication[] = postgresDataJson.meteringApplications.map(
                ({ application_id, status, remarks }: MeteringApplication) => ({
                    application_id,
                    status,
                    remarks,
                })
            );

            setSqliteData(sqliteRows);
            setPostgresData(filteredPostgresData);

            const sqliteMap = new Map(sqliteRows.map((item) => [item.application_id, item.status]));
            const diff = filteredPostgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.application_id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });
            // console.log("😎 differences: ", diff);
            setDifferences(diff);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data && data[0]?.id) {
            fetchStatuses();
        }
    }, [data]);

    useEffect(() => {
        if (sqliteData.length > 0 && postgresData.length > 0) {
            const sqliteMap = new Map(sqliteData.map((item) => [item.application_id, item.status]));
            const diff = postgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.application_id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });
            setDifferences(diff);
        }
    }, [sqliteData, postgresData]);

    return { differences, loading, fetchStatuses };
};

export default useSyncMeteringApplication;
