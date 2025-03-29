import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, RefreshControl, TouchableOpacity, Animated } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/AntDesign";
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
    const fetchQuery = useMemo(
        () => `
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
        `,
        [data]
    );
    const fetchData = useCallback(async () => {
        try {
            const result = await database.getAllAsync<{
                id: string;
                status: string | null;
                sync_status: string | null;
                application_id: string | null;
                clienttype: string | null;
                electricalpermitnumber: string | null;
                customer_name: string | null;
                totalRecords: string | null;
                syncedRecords: string | null;
            }>(fetchQuery);
            setOrders(result);
        } catch (error) {
            console.error("Error fetching data from SQLite", error);
        }
    }, [database, fetchQuery]);

    const checkAndSyncOrders = useCallback(async () => {
        const unsyncedOrders = orders.filter((order) => order.sync_status?.toLowerCase() === "unsynced" && order.status?.toLowerCase() === "endorsed");

        if (unsyncedOrders.length > 0) {
            await startSync();
        }
    }, [startSync, orders]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await checkAndSyncOrders();
            await startStatusSync();
            await fetchStatuses();
            await fetchData();
        } catch (error) {
            console.error("Error during refresh:", error);
        } finally {
            setRefreshing(false);
        }
    }, [checkAndSyncOrders, fetchData, fetchStatuses]);

    useFocusEffect(
        useCallback(() => {
            checkAndSyncOrders();
            fetchData();
        }, [fetchData, checkAndSyncOrders])
    );

    const filteredOrders = useMemo(() => {
        const lowerSearchQuery = searchQuery.toLowerCase();
        return orders.filter(
            (order) =>
                (order.application_id?.toLowerCase() || "").includes(lowerSearchQuery) ||
                (order.sync_status?.toLowerCase() || "").includes(lowerSearchQuery) ||
                (order.status?.toLowerCase() || "").includes(lowerSearchQuery) ||
                (order.clienttype?.toLowerCase() || "").includes(lowerSearchQuery) ||
                (order.electricalpermitnumber?.toLowerCase() || "").includes(lowerSearchQuery) ||
                (order.customer_name?.toLowerCase() || "").includes(lowerSearchQuery)
        );
    }, [orders, searchQuery]);

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
                <Icon name="search1" size={28} color="#555" />
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
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                                badgeStyles = "bg-blue-500 text-white";
                                break;
                            case "rejected":
                                badgeStyles = "bg-red-500 text-white";
                                break;
                        }
                    }
                    return (
                        <TouchableOpacity
                            className="px-6 p-4 mb-5 border border-gray-300 rounded-xl shadow-md bg-white"
                            onPress={() => router.push(`/(electricianv2)_fa/${item.application_id}`)}
                        >
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-2xl font-bold">{item.application_id}</Text>
                                <Text className={`px-3 py-1 text-md font-bold rounded-full text-center ${badgeStyles}`}>{item.status}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-md font-bold text-gray-700">{item.customer_name || "N/A"}</Text>
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
            />
            {showButton && (
                <View className="absolute bottom-6 right-6">
                    <TouchableOpacity onPress={() => router.push("/(electricianv2)_setup/page1")} activeOpacity={1.0}>
                        <Animated.View className="flex-row items-center justify-center rounded-full bg-red-500 px-6 py-3 shadow-2xl active:scale-95 transition-all">
                            <Text className="text-lg font-semibold text-white tracking-wide">Get Started</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default ElectricianPage;
