// import React from "react";
// import { View, Text, Button, Alert } from "react-native";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

// const DownloadSQLiteFile = () => {
//     const downloadFile = async () => {
//         try {
//             const sourceUri = FileSystem.documentDirectory + "SQLite/database.db";
//             const destinationUri = FileSystem.documentDirectory + "test.db";

//             // Check if the file exists
//             const fileInfo = await FileSystem.getInfoAsync(sourceUri);
//             if (!fileInfo.exists) {
//                 Alert.alert("Error", "File does not exist!");
//                 return;
//             }

//             const downloadsUri = FileSystem.documentDirectory + "test.db";

//             await FileSystem.copyAsync({
//                 from: sourceUri,
//                 to: downloadsUri,
//             });

//             await Sharing.shareAsync(downloadsUri);

//             Alert.alert("Success", "File has been saved and is ready to be accessed.");
//         } catch (error) {
//             console.error("Error downloading file:", error);
//             Alert.alert("Error", "Failed to download the file.");
//         }
//     };

//     const logAllFilesInSQLiteDirectory = async () => {
//         try {
//             const directoryUri = FileSystem.documentDirectory + "SQLite/";
//             const files = await FileSystem.readDirectoryAsync(directoryUri);
//             console.log("Files in SQLite directory:", files);
//         } catch (error) {
//             console.error("Error reading directory:", error);
//         }
//     };

//     React.useEffect(() => {
//         logAllFilesInSQLiteDirectory();
//     }, []);

//     return (
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//             <Text>Download SQLite File</Text>
//             <Button title="Download" onPress={downloadFile} />
//         </View>
//     );
// };

// export default DownloadSQLiteFile;
