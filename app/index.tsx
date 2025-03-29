import React, { useState, useEffect, useCallback } from "react";
import { Redirect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

const Index = () => {
    const database = useSQLiteContext();
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        try {
            const result = await database.getAllAsync<{ id: any; name: any; username: any; email: any; crewname: any; orgname: any; role: any }>(
                "SELECT id, name, username, email, crewname, orgname, role FROM metering_user LIMIT 1"
            );

            if (result && result.length > 0) {
                const userRole = result[0].role;
                console.log(userRole);
                switch (userRole) {
                    case "Electrician":
                        setRedirectPath("/(electricianv2)");
                        break;
                    case "Inspector":
                        setRedirectPath("/(inspector)");
                        break;
                    case "Contractor":
                        setRedirectPath("/(contractor)");
                        break;
                    case "Power":
                        setRedirectPath("/(home)");
                        break;
                    default:
                        setRedirectPath("/login"); // Default to login if the role is unrecognized
                        break;
                }
            } else {
                setRedirectPath("/login");
            }
        } catch (error) {
            setRedirectPath("/login");
            console.error("Error fetching user data:", error);
        }
    }, [database]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (!redirectPath) {
        return null; // Optionally, you can show a loading indicator here
    }

    return <Redirect href={redirectPath as any} />;
};

export default React.memo(Index);
