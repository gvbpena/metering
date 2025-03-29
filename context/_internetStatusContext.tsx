import React, { createContext, useState, useEffect, useContext } from "react";
import * as Network from "expo-network";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import MaterialCommunityIcons

interface NetworkContextProps {
    isConnected: boolean;
    connectionSpeed: "fast" | "slow" | "none";
    connectionStatusIcon: JSX.Element;
    children: React.ReactNode;
}

const NetworkContext = createContext<NetworkContextProps | undefined>(undefined);

export const useNetworkContext = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error("useNetworkContext must be used within a NetworkProvider");
    }
    return context;
};

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionSpeed, setConnectionSpeed] = useState<"fast" | "slow" | "none">("none");
    const [connectionStatusIcon, setConnectionStatusIcon] = useState<JSX.Element>(<MaterialCommunityIcons name="wifi-off" size={24} color="red" />);

    useEffect(() => {
        const checkConnection = async () => {
            const networkState = await Network.getNetworkStateAsync();

            if (networkState.isInternetReachable) {
                setIsConnected(true);
                if (networkState.type === Network.NetworkStateType.WIFI) {
                    setConnectionSpeed("fast");
                    setConnectionStatusIcon(<MaterialCommunityIcons name="wifi" size={24} color="green" />);
                } else if (networkState.type === Network.NetworkStateType.CELLULAR) {
                    setConnectionSpeed("slow");
                    setConnectionStatusIcon(<MaterialCommunityIcons name="cellphone-wireless" size={24} color="yellow" />);
                } else {
                    setConnectionSpeed("none");
                    setConnectionStatusIcon(<MaterialCommunityIcons name="wifi-off" size={24} color="red" />);
                }
            } else {
                setIsConnected(false);
                setConnectionSpeed("none");
                setConnectionStatusIcon(<MaterialCommunityIcons name="wifi-off" size={24} color="red" />);
            }
        };

        checkConnection();
        const intervalId = setInterval(checkConnection, 5000); // Recheck every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return <NetworkContext.Provider value={{ isConnected, connectionSpeed, connectionStatusIcon, children }}>{children}</NetworkContext.Provider>;
};
