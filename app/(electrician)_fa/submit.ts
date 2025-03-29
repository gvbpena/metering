import * as FileSystem from "expo-file-system";
import { useSQLiteContext } from "expo-sqlite";

export const useSubmitSetupData = () => {
    const db = useSQLiteContext();
    const imageFolderPath = FileSystem.documentDirectory + "image_files/";

    const moveAndSaveImages = async (imageUrls: string[], referenceId: string, imageType: string) => {
        await FileSystem.makeDirectoryAsync(imageFolderPath, { intermediates: true });

        try {
            await db.runAsync("BEGIN TRANSACTION");
            for (const imageUrl of imageUrls) {
                console.log(imageUrl);
                await db.runAsync(`INSERT INTO images (image_url, reference_id, image_type, status) VALUES (?, ?, ?, ?)`, [
                    imageUrl,
                    referenceId,
                    imageType,
                    "Unsynced",
                ]);
            }
            await db.runAsync("COMMIT");
            console.log("Images inserted successfully.");
        } catch (error) {
            await db.runAsync("ROLLBACK");
            console.error("Error inserting images:", error);
        }
    };

    const updateApplicationData = async (
        referenceId: string,
        selectedDate?: string,
        permitNumber?: string,
        selectedIdType?: string,
        idNumber?: string,
        meter_latitude?: string,
        meter_longitude?: string,
        premise_latitude?: string,
        premise_longitude?: string,
        pole_latitude?: string,
        pole_longitude?: string
    ) => {
        try {
            await db.runAsync("BEGIN TRANSACTION");
            const updates = [];
            const params: string[] = [];

            if (selectedDate) {
                updates.push("permiteffectivedate = ?");
                params.push(selectedDate);
            }
            if (permitNumber) {
                updates.push("electricalpermitnumber = ?");
                params.push(permitNumber);
            }
            if (selectedIdType) {
                updates.push("typeofid = ?");
                params.push(selectedIdType);
            }
            if (idNumber) {
                updates.push("idno = ?");
                params.push(idNumber);
            }
            if (meter_latitude) {
                updates.push("meter_latitude = ?");
                params.push(meter_latitude);
            }
            if (meter_longitude) {
                updates.push("meter_longitude = ?");
                params.push(meter_longitude);
            }
            if (premise_latitude) {
                updates.push("premise_latitude = ?");
                params.push(premise_latitude);
            }
            if (premise_longitude) {
                updates.push("premise_longitude = ?");
                params.push(premise_longitude);
            }
            if (pole_latitude) {
                updates.push("pole_latitude = ?");
                params.push(pole_latitude);
            }
            if (pole_longitude) {
                updates.push("pole_longitude = ?");
                params.push(pole_longitude);
            }
            if (updates.length > 0) {
                params.push(referenceId);
                await db.runAsync(`UPDATE metering_application SET ${updates.join(", ")} WHERE application_id = ?`, params);
            }

            await db.runAsync("COMMIT");
            console.log("Application data updated successfully.");
        } catch (error) {
            await db.runAsync("ROLLBACK");
            console.error("Error updating application data:", error);
            throw new Error("Failed to update application data.");
        }
    };

    const deleteImageFromDatabase = async (imageUri: string) => {
        try {
            await db.runAsync(`DELETE FROM images WHERE image_url = ?`, [imageUri]);
            const imageFilePath = FileSystem.documentDirectory + "image_files/" + imageUri.split("/").pop();
            const fileExists = await FileSystem.getInfoAsync(imageFilePath);

            if (fileExists.exists) {
                await FileSystem.deleteAsync(imageFilePath);
                console.log("Image deleted from file system.");
            }
        } catch (error) {
            console.error("Error deleting image from database and file system:", error);
            throw new Error("Failed to delete image.");
        }
    };

    const endorsedApplication = async (id: string): Promise<boolean> => {
        console.log("Endorsing application:", id);
        try {
            await db.runAsync("BEGIN TRANSACTION");
            const result = await db.runAsync("UPDATE metering_application SET status = ?, sync_status = ? WHERE application_id = ? AND status <> ?", [
                "Endorsed",
                "Unsynced",
                id,
                "Endorsed",
            ]);

            if (result.changes === 0) {
                console.log("No update performed. The application is already endorsed.");
                await db.runAsync("ROLLBACK");
                return false;
            }

            console.log("Application endorsed successfully.");
            await db.runAsync("COMMIT");
            return true;
        } catch (error) {
            await db.runAsync("ROLLBACK");
            console.error("Error endorsing application:", error);
            throw new Error("Failed to endorse application.");
        }
    };

    return { moveAndSaveImages, deleteImageFromDatabase, updateApplicationData, endorsedApplication };
};
