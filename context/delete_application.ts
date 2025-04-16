import * as FileSystem from "expo-file-system";
import { useSQLiteContext } from "expo-sqlite";

export const useDeleteData = () => {
    const db = useSQLiteContext();
    const imageFolderPath = FileSystem.documentDirectory + "image_files/";

    const deleteApplicationData = async (application_id: string): Promise<void> => {
        try {
            await db.runAsync("BEGIN TRANSACTION");
            const imagesToDelete = await db.getAllAsync<{ image_url: string }>(`SELECT image_url FROM images WHERE reference_id = ?`, [application_id]);

            for (const image of imagesToDelete) {
                const imageUrl = image.image_url;
                const filename = imageUrl.split("/").pop();
                if (!filename) {
                    continue;
                }

                const imageFilePath = imageFolderPath + filename;

                try {
                    const fileInfo = await FileSystem.getInfoAsync(imageFilePath);
                    if (fileInfo.exists) {
                        await FileSystem.deleteAsync(imageFilePath);
                    }
                } catch (fileError) {
                    throw new Error(`Failed to delete image file: ${imageFilePath}`);
                }
            }

            await db.runAsync(`DELETE FROM images WHERE reference_id = ?`, [application_id]);
            await db.runAsync(`DELETE FROM metering_application WHERE application_id = ?`, [application_id]);

            await db.runAsync("COMMIT");
        } catch (error) {
            await db.runAsync("ROLLBACK");
            throw new Error(`Failed to delete application data for ID ${application_id}.`);
        }
    };

    return { deleteApplicationData };
};
