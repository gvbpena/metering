import axios from "axios";
import { useSQLiteContext } from "expo-sqlite";

const API_URL = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/application_create.php";

interface MeteringApplication {
    id: number;
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
    typeofid: string;
    idno: string;
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
    latitude?: string;
    longitude?: string;
    traversingwire?: string;
    deceasedlotowner?: string;
    electricalpermitnumber?: string;
    permiteffectivedate?: string;
    landmark?: string;
    status: string;
    sync_status?: string;
    remarks?: string;
    fa_id?: string;
    account_id?: string;
}

export const fetchMeteringApplication = async (id: string): Promise<MeteringApplication | null> => {
    const database = useSQLiteContext();
    const query = `SELECT * FROM metering_application WHERE id = ?;`;

    try {
        const result = await database.getAllSync(query, [id]);
        console.log("result:", result);
        return result ? (result as unknown as MeteringApplication) : null;
    } catch (error) {
        console.error("Error fetching data from SQLite:", error);
        throw new Error("Failed to fetch data from the database.");
    }
};

export const submitMeteringApplication = async (id: string, fetchMeteringApplication: (id: string) => Promise<MeteringApplication | null>) => {
    try {
        const applicationData = await fetchMeteringApplication(id);
        if (!applicationData) throw new Error("Application data not found.");

        const payload = { application: { ...applicationData } };
        const response = await axios.post(API_URL, payload, { headers: { "Content-Type": "application/json" } });

        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);

        return response.data;
    } catch (error: any) {
        console.error("Submission failed:", error.message);
        throw new Error(error.response?.data?.message || "Network error or API issue.");
    }
};
