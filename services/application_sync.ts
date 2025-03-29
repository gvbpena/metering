import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";

const syncApplicationStatus = () => {
    const database = useSQLiteContext();
    const [sqliteData, setSqliteData] = useState<{ id: string; status: string }[]>([]);
    const [postgresData, setPostgresData] = useState<{ id: string; status: string }[]>([]);
    const [differences, setDifferences] = useState<{ id: string; status: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const getSQLiteStatus = async () => {
        try {
            const rows = await database.getAllAsync<{ id: string; status: string }>("SELECT id, status FROM metering_application");
            setSqliteData(rows);
        } catch (error) {
            console.error("Error fetching SQLite status:", error);
        }
    };

    const getPostgresStatus = async () => {
        try {
            const response = await fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_metering_application.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "QosSAiS4kjArpMCr" }),
            });
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setPostgresData(data.meteringApplications);
        } catch (error) {
            console.error("PostgreSQL Fetch Error:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getSQLiteStatus();
            await getPostgresStatus();
            console.log("getPostgresqlStatus awaited");
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (sqliteData.length > 0 && postgresData.length > 0) {
            const sqliteMap = new Map(sqliteData.map((item) => [item.id, item.status]));
            const diff = postgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });

            setDifferences(diff);
        }
    }, [sqliteData, postgresData]);

    return { differences, loading };
};

export default syncApplicationStatus;
