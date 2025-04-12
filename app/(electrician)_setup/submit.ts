import useProfile from "@/services/profile";
import { useFormData } from "./_context";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSubmitData = () => {
    const db = useSQLiteContext();
    const { formData } = useFormData();
    const { data } = useProfile();

    const generateApplicationId = () => {
        const timestamp = Date.now().toString().slice(-5);
        const randomNum = Math.floor(100 + Math.random() * 900);
        const electricianSuffix = String(data?.[0]?.id ?? "0000").slice(-4);
        return `APID-${electricianSuffix}${timestamp}${randomNum}`;
    };

    const submitApplication = async () => {
        if (!formData) {
            console.error("Form data is missing");
            return false;
        }

        const application_id = formData.application_id ?? generateApplicationId();
        const signatureUrl = formData.SignatureURL ?? null;

        console.log("Submitting data with application_id:", application_id);

        await db.execAsync("BEGIN TRANSACTION");
        try {
            await db.runAsync(
                `INSERT INTO metering_application (
                    application_id, clienttype, applicationtype, classtype,
                    customertype, businesstype,
                    government_category, government_sub_type,
                    firstname, middlename, lastname,
                    suffix, birthdate, maritalstatus, mobileno, landlineno, email,
                    tin, typeofid, idno, fatherfirstname, fathermiddlename, fatherlastname,
                    motherfirstname, mothermiddlename, motherlastname, representativefirstname,
                    representativemiddlename, representativelastname, representativerelationship,
                    representativemobile, representativeemail, representativeattachedid,
                    representativespecialpowerofattorney, customeraddress, citymunicipality,
                    barangay, streethouseunitno, sitiopurokbuildingsubdivision, postal_code,
                    reference_pole, nearmeterno, pole_latitude, pole_longitude, traversingwire,
                    electricalpermitnumber, permiteffectivedate, landmark, status, sync_status, electrician_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    application_id,
                    formData.ClientType ?? null,
                    formData.ApplicationType ?? null,
                    formData.ClassType ?? null,
                    formData.CustomerType ?? null,
                    formData.BusinessType ?? null,
                    formData.GovernmentCategory ?? null,
                    formData.GovernmentSubType ?? null,
                    formData.FirstName ?? null,
                    formData.MiddleName ?? null,
                    formData.LastName ?? null,
                    formData.Suffix ?? null,
                    formData.Birthdate ?? null,
                    formData.MaritalStatus ?? null,
                    formData.MobileNo ?? null,
                    formData.LandlineNo ?? null,
                    formData.Email ?? null,
                    formData.TIN ?? null,
                    formData.TypeOfID ?? null,
                    formData.IdNo ?? null,
                    formData.FatherFirstName ?? null,
                    formData.FatherMiddleName ?? null,
                    formData.FatherLastName ?? null,
                    formData.MotherFirstName ?? null,
                    formData.MotherMiddleName ?? null,
                    formData.MotherLastName ?? null,
                    formData.RepresentativeFirstName ?? null,
                    formData.RepresentativeMiddleName ?? null,
                    formData.RepresentativeLastName ?? null,
                    formData.RepresentativeRelationship ?? null,
                    formData.RepresentativeMobile ?? null,
                    formData.RepresentativeEmail ?? null,
                    formData.RepresentativeAttachedID ?? null,
                    formData.RepresentativeSpecialPowerOfAttorney ?? null,
                    formData.CustomerAddress ?? null,
                    formData.CityMunicipality ?? null,
                    formData.Barangay ?? null,
                    formData.StreetHouseUnitNo ?? null,
                    formData.SitioPurokBuildingSubdivision ?? null,
                    formData.postal_code ?? null,
                    formData.reference_pole ?? null,
                    formData.NearMeterNo ?? null,
                    formData.pole_latitude ?? null,
                    formData.pole_longitude ?? null,
                    formData.TraversingWire ?? null,
                    formData.ElectricalPermitNumber ?? null,
                    formData.PermitEffectiveDate ?? null,
                    formData.LandMark ?? null,
                    "Pending",
                    "Unsynced",
                    data?.[0]?.id ?? null,
                ]
            );

            if (signatureUrl) {
                await db.runAsync(
                    `INSERT INTO images (image_url, reference_id, image_type, status)
                     VALUES (?, ?, ?, ?);`,
                    [signatureUrl, application_id, "Signature", "Unsynced"]
                );
            }

            await db.execAsync("COMMIT");

            // ✅ Remove saved signature from AsyncStorage after success
            await AsyncStorage.removeItem("userSignature");

            console.log("Insert successful! Application ID:", application_id);
            return true;
        } catch (error) {
            await db.execAsync("ROLLBACK");
            console.error("Error inserting data into metering_application or images:", error);
            return false;
        }
    };

    return { submitApplication };
};
