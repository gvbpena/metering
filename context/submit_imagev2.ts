import * as FileSystem from "expo-file-system";
import { useSQLiteContext } from "expo-sqlite";

interface ImageRecord {
    image_url: string;
    reference_id: string;
    image_type: string;
}

export const useTransferImages = () => {
    const db = useSQLiteContext();
    const apiUrl = "https://genius-dev.aboitizpower.com/mygenius2/metering_api/post_images.php";

    const syncImages = async () => {
        try {
            const unsyncedImages = await db.getAllAsync<ImageRecord>("SELECT image_url, reference_id, image_type FROM images WHERE status = ?", ["Unsynced"]);

            if (unsyncedImages.length === 0) {
                console.log("No unsynced images found.");
                return;
            }

            for (const { image_url, reference_id, image_type } of unsyncedImages) {
                try {
                    const fileInfo = await FileSystem.getInfoAsync(image_url);
                    if (!fileInfo.exists) {
                        console.warn(`File does not exist: ${image_url}`);
                        continue;
                    }

                    const imageName = image_url.split("/").pop();
                    if (!imageName) {
                        console.error(`Invalid image name for: ${image_url}`);
                        continue;
                    }

                    const formData = new FormData();
                    formData.append("image", {
                        uri: image_url,
                        name: imageName,
                        type: "image/jpeg",
                    } as any);
                    formData.append("reference_id", reference_id);
                    formData.append("image_type", image_type);
                    formData.append("image_name", imageName);

                    const response = await fetch(apiUrl, {
                        method: "POST",
                        body: formData,
                        headers: { Accept: "application/json" },
                    });

                    const result = await response.json();
                    console.log(`Response for ${image_url}:`, result);

                    if (response.ok && result.success) {
                        await db.runAsync("UPDATE images SET status = ? WHERE image_url = ?", ["Synced", image_url]);
                        console.log(`Image ${image_url} Synced successfully.`);
                    } else {
                        console.error(`Failed to sync ${image_url}:`, result.message || "Unknown error");
                    }
                } catch (error) {
                    console.error(`Error processing image: ${image_url}`, error);
                }
            }
        } catch (error) {
            console.error("Error syncing images:", error);
        }
    };

    return { syncImages };
};
