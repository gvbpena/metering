import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, FlatList, RefreshControl, TouchableOpacity, Animated } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite";
import { useSync } from "@/context/_syncContextv2";
import SyncStatusPage from "@/components/_syncStatusv2";
import useSyncMeteringApplication from "@/context/syncMaStatus";
import useProfile from "@/services/profile";

interface Order {
    id: string;
    status: string | null;
    sync_status: string | null;
    application_id: string | null;
    clienttype: string | null;
    electricalpermitnumber: string | null;
    customer_name: string | null;
    totalRecords: string | null;
    syncedRecords: string | null;
}

const ElectricianPage = () => {
    const router = useRouter();
    const database = useSQLiteContext();
    const { startSync, startStatusSync } = useSync();
    const { fetchStatuses } = useSyncMeteringApplication();
    const [searchQuery, setSearchQuery] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;
    const prevScrollY = useRef(0);
    const { data } = useProfile();
    const isMounted = useRef(true);
    const isFetchingData = useRef(false);

    const fetchQuery = `
        WITH MeteringSyncStatus AS (
            SELECT
                ma.id,
                ma.application_id,
                ma.status,
                CASE
                    WHEN (
                        (SELECT COUNT(*) FROM images i WHERE i.reference_id = ma.application_id AND i.status = 'Synced') +
                        CASE WHEN ma.sync_status = 'Synced' THEN 1 ELSE 0 END
                    ) =
                    ((SELECT COUNT(*) FROM images i WHERE i.reference_id = ma.application_id) + 1)
                    THEN 'Synced'
                    ELSE 'Unsynced'
                END AS sync_status,
                ma.clienttype,
                ma.electricalpermitnumber,
                ma.lastname || ', ' || ma.firstname AS customer_name
            FROM metering_application ma
            WHERE ma.electrician_id = '${data?.[0]?.id ?? ""}'
        )
        SELECT
            mss.*,
            (SELECT COUNT(*) FROM images i WHERE i.reference_id = mss.application_id) + 1 AS totalRecords,
            (
                (SELECT COUNT(*) FROM images i WHERE i.reference_id = mss.application_id AND i.status = 'Synced')
                + CASE WHEN mss.sync_status = 'Synced' THEN 1 ELSE 0 END
            ) AS syncedRecords
        FROM MeteringSyncStatus mss
        ORDER BY mss.id DESC;
    `;

    const fetchData = async () => {
        if (isFetchingData.current) {
            return;
        }
        isFetchingData.current = true;

        try {
            const result = await database.getAllAsync<Order>(fetchQuery);
            if (isMounted.current) {
                setOrders(result);
            }
        } catch (error: any) {
            if (isMounted.current) {
                if (error.message?.includes("Access to closed resource")) {
                    console.warn("Caught 'Access to closed resource' error during fetch, likely due to unmount/refocus race condition.", error);
                } else {
                    console.error("Error fetching data from SQLite", error);
                }
            } else {
                console.log("Caught error during fetch, but component unmounted.", error.message);
            }
        } finally {
            isFetchingData.current = false;
        }
    };

    const checkAndSyncOrders = async () => {
        let currentOrders = orders;
        if (orders.length === 0) {
            try {
                currentOrders = await database.getAllAsync<Order>(fetchQuery);
                if (isMounted.current) {
                    setOrders(currentOrders);
                }
            } catch (error) {
                console.error("Error fetching orders within checkAndSyncOrders:", error);
                return;
            }
        }
        const unsyncedOrders = currentOrders.filter((order) => order.sync_status?.toLowerCase() === "unsynced" && order.status?.toLowerCase() === "endorsed");
        if (unsyncedOrders.length > 0) {
            await startSync();
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (!isMounted.current) {
                setRefreshing(false);
                return;
            }
            await checkAndSyncOrders();
            if (!isMounted.current) {
                setRefreshing(false);
                return;
            }
            await startStatusSync();
            if (!isMounted.current) {
                setRefreshing(false);
                return;
            }
            await fetchStatuses();
            if (!isMounted.current) {
                setRefreshing(false);
                return;
            }
            await fetchData();
        } catch (error) {
            if (isMounted.current) {
                console.error("Error during refresh:", error);
            }
        } finally {
            if (isMounted.current) {
                setRefreshing(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const initialLoad = async () => {
            try {
                await checkAndSyncOrders();
                if (!isMounted.current) return;

                await startStatusSync();
                if (!isMounted.current) return;

                await fetchStatuses();
                if (!isMounted.current) return;

                await fetchData();
            } catch (error) {
                if (isMounted.current) {
                    console.error("Error during initial load:", error);
                } else {
                    console.log("Caught error during initial load, but component unmounted.", error);
                }
            }
        };

        initialLoad();

        return () => {
            isMounted.current = false;
        };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            isMounted.current = true;

            const loadDataOnFocus = async () => {
                await checkAndSyncOrders();
                if (!isMounted.current) return;
                await fetchData();
            };

            loadDataOnFocus();

            return () => {
                isMounted.current = false;
            };
        }, [fetchData, checkAndSyncOrders, startSync, startStatusSync, fetchStatuses])
    );

    const lowerSearchQuery = searchQuery.toLowerCase();
    const filteredOrders = orders.filter(
        (order) =>
            (order.application_id?.toLowerCase() || "").includes(lowerSearchQuery) ||
            (order.sync_status?.toLowerCase() || "").includes(lowerSearchQuery) ||
            (order.status?.toLowerCase() || "").includes(lowerSearchQuery) ||
            (order.clienttype?.toLowerCase() || "").includes(lowerSearchQuery) ||
            (order.electricalpermitnumber?.toLowerCase() || "").includes(lowerSearchQuery) ||
            (order.customer_name?.toLowerCase() || "").includes(lowerSearchQuery)
    );

    useEffect(() => {
        const scrollListener = scrollY.addListener(({ value }) => {
            if (value > prevScrollY.current && value > 50) {
                setShowButton(false);
            } else {
                setShowButton(true);
            }
            prevScrollY.current = value;
        });

        return () => scrollY.removeListener(scrollListener);
    }, [scrollY]);

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <View className="my-4 flex-row items-center bg-white rounded-lg px-5 py-4 shadow-md border border-gray-300">
                <AntDesign name="search1" size={28} color="#555" />
                <TextInput
                    className="flex-1 pl-4 text-xl text-gray-900"
                    placeholder="Search Application..."
                    placeholderTextColor="#777"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0066A0"]} tintColor={"#0066A0"} />}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-24">
                        <Text className="text-xl text-gray-600">No Data Available</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    let badgeStyles = "bg-gray-200 text-gray-800";
                    if (item.status) {
                        switch (item.status.toLowerCase()) {
                            case "pending":
                                badgeStyles = "bg-yellow-400 text-yellow-900";
                                break;
                            case "approved":
                                badgeStyles = "bg-green-500 text-white";
                                break;
                            case "endorsed":
                                badgeStyles = "bg-[#0066A0] text-white";
                                break;
                            case "rejected":
                                badgeStyles = "bg-red-500 text-white";
                                break;
                        }
                    }
                    return (
                        <TouchableOpacity
                            className="px-6 p-4 mb-5 border border-gray-300 rounded-xl shadow-md bg-white"
                            onPress={() => router.push(`/(electrician)_fa/${item.application_id}` as any)}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-2xl font-bold text-gray-800">{item.application_id}</Text>
                                <Text className={`px-3 py-1 text-sm font-semibold rounded-full text-center ${badgeStyles}`}>{item.status || "Unknown"}</Text>
                            </View>
                            <View className="flex-row justify-between items-center mt-1">
                                <Text className="text-base font-medium text-gray-700">{item.customer_name || "N/A"}</Text>
                                <SyncStatusPage
                                    status={item.status}
                                    sync_status={item.sync_status}
                                    totalRecords={item.totalRecords ?? "0"}
                                    syncedRecords={item.syncedRecords ?? "0"}
                                    application_id={item.application_id ?? ""}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                }}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
            />

            {showButton && (
                <TouchableOpacity
                    onPress={() => router.push("/(electrician)_setup/consent")}
                    className="absolute bottom-5 right-5 bg-[#0066A0] px-7 py-4 rounded-full shadow-lg elevation-5"
                >
                    <Text className="text-white font-bold text-lg">Get Started</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ElectricianPage;
