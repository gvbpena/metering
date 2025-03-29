import { useSQLiteContext } from "expo-sqlite";

interface MeteringApplicationRecord {
    application_id: string;
    clienttype: string;
    applicationtype: string;
    classtype: string;
    customertype: string;
    businesstype: string;
    firstname: string;
    middlename?: string;
    lastname: string;
    suffix?: string;
    birthdate: string;
    maritalstatus: string;
    mobileno: string;
    landlineno?: string;
    email: string;
    tin?: string;
    typeofid?: string;
    idno?: string;
    fatherfirstname?: string;
    fathermiddlename?: string;
    fatherlastname?: string;
    motherfirstname?: string;
    mothermiddlename?: string;
    motherlastname?: string;
    representativefirstname?: string;
    representativemiddlename?: string;
    representativelastname?: string;
    representativerelationship?: string;
    representativemobile?: string;
    representativeemail?: string;
    representativeattachedid?: string;
    representativespecialpowerofattorney?: string;
    customeraddress: string;
    citymunicipality: string;
    barangay: string;
    streethouseunitno?: string;
    sitiopurokbuildingsubdivision?: string;
    reference_pole?: string;
    nearmeterno?: string;
    pole_latitude?: string;
    pole_longitude?: string;
    traversingwire?: string;
    deceasedlotowner?: string;
    electricalpermitnumber?: string;
    permiteffectivedate?: string;
    landmark?: string;
    status: string;
    sync_status: string;
    remarks?: string;
    fa_id: string;
    account_id: string;
    electrician_id: string;
    meter_latitude?: string;
    meter_longitude?: string;
    premise_latitude?: string;
    premise_longitude?: string;
}

const FETCH_API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/fetch_metering_application.php";
const POST_API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_application/application_endorsed.php";
const UPDATE_API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/metering_application/application_update.php";

export const useTransferMAData = () => {
    const db = useSQLiteContext();

    const getUnsyncedMAData = async (): Promise<MeteringApplicationRecord[]> => {
        try {
            return await db.getAllAsync<MeteringApplicationRecord>("SELECT * FROM metering_application WHERE sync_status = ?", ["Unsynced"]);
        } catch {
            return [];
        }
    };

    const fetchExistingRecord = async (application_id: string): Promise<MeteringApplicationRecord | null> => {
        try {
            const response = await fetch(FETCH_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "QosSAiS4kjArpMCr", application_id }),
            });
            const data = await response.json();
            return data.meteringApplications?.length > 0 ? sanitizeRecord(data.meteringApplications[0]) : null;
        } catch {
            return null;
        }
    };

    const sanitizeRecord = (record: any): MeteringApplicationRecord => ({
        ...record,
        middlename: record.middlename ?? undefined,
        suffix: record.suffix ?? undefined,
        landlineno: record.landlineno ?? undefined,
        tin: record.tin ?? undefined,
        typeofid: record.typeofid ?? undefined,
        idno: record.idno ?? undefined,
        remarks: record.remarks ?? undefined,
    });

    const getUpdatedFields = (localRecord: MeteringApplicationRecord, existingRecord: MeteringApplicationRecord) => {
        const updatedFields: Partial<MeteringApplicationRecord> = {};
        Object.keys(localRecord).forEach((key) => {
            const field = key as keyof MeteringApplicationRecord;
            if (localRecord[field] !== existingRecord[field]) {
                updatedFields[field] = localRecord[field];
            }
        });
        return updatedFields;
    };

    const syncMAData = async () => {
        const UnsyncedMARecords = await getUnsyncedMAData();
        if (UnsyncedMARecords.length === 0) return;
        await Promise.all(UnsyncedMARecords.map((record) => transferMAData(record)));
    };
    const transferMAData = async (record: MeteringApplicationRecord) => {
        try {
            const existingRecord = await fetchExistingRecord(record.application_id);
            if (existingRecord) {
                console.log("This application has an existing record");
                const updatedFields = getUpdatedFields(record, existingRecord);
                if (Object.keys(updatedFields).length === 0) return;
                const updatePayload = { application: { application_id: record.application_id, ...updatedFields } };
                console.log("Data to POST:", JSON.stringify(updatePayload, null, 2));

                const updateResponse = await fetch(UPDATE_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatePayload),
                });
                const responseText = await updateResponse.text();
                console.log("Raw Response Text:", responseText);
                try {
                    const updateResult = JSON.parse(responseText);
                    console.log("Parsed Response JSON:", updateResult);

                    if (updateResult.success) {
                        await db.runAsync("UPDATE metering_application SET sync_status = ? WHERE application_id = ?", ["Synced", record.application_id]);
                    }
                } catch (jsonError) {
                    console.error("JSON Parse Error:", jsonError);
                    console.error("Raw Response:", responseText);
                }
            } else {
                console.log("This application has no existing record");
                const postPayload = { application: record };
                console.log("Payload to be sent:", postPayload);

                const postResponse = await fetch(POST_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postPayload),
                });

                const responseText = await postResponse.text();
                console.log("Raw Response Text:", responseText);

                try {
                    const postResult = JSON.parse(responseText);
                    console.log("Parsed Response JSON:", postResult);

                    if (postResult.success) {
                        await db.runAsync("UPDATE metering_application SET sync_status = ? WHERE application_id = ?", ["Synced", record.application_id]);
                    }
                } catch (jsonError) {
                    console.error("JSON Parse Error:", jsonError);
                    console.error("Raw Response:", responseText);
                }
            }
        } catch (error) {
            console.error("Error transferring data:", error);
            await db.runAsync("UPDATE metering_application SET sync_status = ? WHERE application_id = ?", ["Unsynced", record.application_id]);
        }
    };

    return { syncMAData };
};
