import { useState, useEffect, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import useProfile from "@/services/profile";

interface MeteringApplication {
    application_id: string;
    status: string;
    remarks: string;
}

const useSyncMeteringApplication = () => {
    const database = useSQLiteContext();
    const { data: profileData, isLoading: isProfileLoading } = useProfile();

    const [sqliteData, setSqliteData] = useState<MeteringApplication[]>([]);
    const [postgresData, setPostgresData] = useState<MeteringApplication[]>([]);
    const [differences, setDifferences] = useState<MeteringApplication[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStatuses = useCallback(async () => {
        if (!profileData || !profileData[0]?.id) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const electricianId = profileData[0].id;

            const [sqliteRows, postgresResponse] = await Promise.all([
                database.getAllAsync<Pick<MeteringApplication, "application_id" | "status">>(
                    "SELECT application_id, status FROM metering_application WHERE electrician_id = ?",
                    [electricianId]
                ),
                fetch("https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_metering_application_sync.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "QosSAiS4kjArpMCr" }),
                }),
            ]);

            const formattedSqliteData: MeteringApplication[] = sqliteRows.map((row) => ({
                ...row,
                remarks: "",
            }));
            setSqliteData(formattedSqliteData);

            if (!postgresResponse.ok) {
                const errorBody = await postgresResponse.text();
                throw new Error(`Failed to fetch PostgreSQL data: ${postgresResponse.status} ${postgresResponse.statusText} - ${errorBody}`);
            }

            const postgresDataJson = await postgresResponse.json();

            if (!postgresDataJson || !Array.isArray(postgresDataJson.meteringApplications)) {
                throw new Error("Invalid PostgreSQL response format");
            }

            const filteredPostgresData: MeteringApplication[] = postgresDataJson.meteringApplications.map(
                ({ application_id, status, remarks }: MeteringApplication) => ({
                    application_id,
                    status,
                    remarks,
                })
            );
            setPostgresData(filteredPostgresData);
        } catch (error) {
            console.error("Error fetching or processing sync data:", error);
        } finally {
            setLoading(false);
        }
    }, [database, profileData]);

    useEffect(() => {
        if (!isProfileLoading && profileData && profileData[0]?.id) {
            fetchStatuses();
        } else if (!isProfileLoading && (!profileData || !profileData[0]?.id)) {
            setDifferences([]);
            setSqliteData([]);
            setPostgresData([]);
        }
    }, [isProfileLoading, profileData, fetchStatuses]);

    useEffect(() => {
        if (sqliteData.length > 0 || postgresData.length > 0) {
            const sqliteMap = new Map(sqliteData.map((item) => [item.application_id, item.status]));

            const diff = postgresData.filter((pgItem) => {
                const sqliteStatus = sqliteMap.get(pgItem.application_id);
                return sqliteStatus === undefined || sqliteStatus !== pgItem.status;
            });

            setDifferences(diff);
        } else {
            setDifferences([]);
        }
    }, [sqliteData, postgresData]);

    return { differences, loading, fetchStatuses };
};

export default useSyncMeteringApplication;
