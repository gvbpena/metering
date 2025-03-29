import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";

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

    const fetchStatuses = async () => {
        try {
            const [sqliteRows, postgresResponse] = await Promise.all([
                database.getAllAsync<MeteringApplication>("SELECT application_id, status FROM metering_application"),
                fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_metering_application.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "QosSAiS4kjArpMCr" }),
                }),
            ]);

            if (!postgresResponse.ok) throw new Error("Failed to fetch PostgreSQL data");
            const postgresDataJson = await postgresResponse.json();

            const filteredPostgresData: MeteringApplication[] = postgresDataJson.meteringApplications.map(
                ({ application_id, status, remarks }: MeteringApplication) => ({ application_id, status, remarks })
            );
            // console.log(sqliteRows);
            setSqliteData(sqliteRows);
            setPostgresData(filteredPostgresData);
            const sqliteMap = new Map(sqliteRows.map((item) => [item.application_id, item.status]));
            const diff = filteredPostgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.application_id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });
            // console.log(diff);
            setDifferences(diff);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const computeDifferences = () => {
        if (sqliteData.length > 0 && postgresData.length > 0) {
            const sqliteMap = new Map(sqliteData.map((item) => [item.application_id, item.status]));
            const diff = postgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.application_id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });
            setDifferences(diff);
        }
    };

    useEffect(() => {
        fetchStatuses();
    }, []);

    useEffect(() => {
        computeDifferences();
    }, [sqliteData, postgresData]);

    return { differences, loading, fetchStatuses };
};

export default useSyncMeteringApplication;
