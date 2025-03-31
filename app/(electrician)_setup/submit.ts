import useProfile from "@/services/profile";
import { useFormData } from "./_context";
import { useSQLiteContext } from "expo-sqlite";

export const useSubmitData = () => {
    const db = useSQLiteContext();
    const { formData } = useFormData();
    const { data } = useProfile();
    const generateApplicationId = () => {
        const timestamp = Date.now().toString().slice(-5);
        const randomNum = Math.floor(100 + Math.random() * 900);
        const id = String(data[0]?.id ?? "0000").slice(-4);
        return `APID-${id}${timestamp}${randomNum}`;
    };

    const submitApplication = async () => {
        if (!formData) {
            console.error("Form data is missing");
            return false;
        }
        const application_id = formData.application_id ?? generateApplicationId();

        console.log("Generated application_id:", application_id);

        await db.execAsync("BEGIN TRANSACTION");
        try {
            await db.runAsync(
                `INSERT INTO metering_application (
                    application_id, clienttype, applicationtype, classtype,
                    customertype, businesstype, firstname, middlename, lastname,
                    suffix, birthdate, maritalstatus, mobileno, landlineno, email,
                    tin, typeofid, idno, fatherfirstname, fathermiddlename, fatherlastname,
                    motherfirstname, mothermiddlename, motherlastname, representativefirstname,
                    representativemiddlename, representativelastname, representativerelationship,
                    representativemobile, representativeemail, representativeattachedid,
                    representativespecialpowerofattorney, customeraddress, citymunicipality,
                    barangay, streethouseunitno, sitiopurokbuildingsubdivision, reference_pole,
                    nearmeterno, pole_latitude, pole_longitude, traversingwire, deceasedlotowner,
                    electricalpermitnumber, permiteffectivedate, landmark, status, sync_status, electrician_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    application_id, // Use the generated 8-digit ID
                    formData.ClientType ?? null,
                    formData.ApplicationType ?? null,
                    formData.ClassType ?? null,
                    formData.CustomerType ?? null,
                    formData.BusinessType ?? null,
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
                    formData.reference_pole ?? null,
                    formData.NearMeterNo ?? null,
                    formData.pole_latitude ?? null,
                    formData.pole_longitude ?? null,
                    formData.TraversingWire ?? null,
                    formData.DeceasedLotOwner ?? null,
                    formData.ElectricalPermitNumber ?? null,
                    formData.PermitEffectiveDate ?? null,
                    formData.LandMark ?? null,
                    "Pending",
                    "Unsynced",
                    data[0]?.id,
                ]
            );
            await db.execAsync("COMMIT");
            console.log("Insert successful!");
            return true;
        } catch (error) {
            await db.execAsync("ROLLBACK");
            console.error("Error inserting data:", error);
            return false;
        }
    };

    return { submitApplication };
};
