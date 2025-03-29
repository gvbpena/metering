import React, { createContext, useReducer, useContext, ReactNode, useMemo } from "react";

interface ElectricianSetupState {
    activityId: string;
}

type ElectricianSetupAction = { type: "SET_ACTIVITY_ID"; payload: string };

const ElectricianSetupContext = createContext<{ state: ElectricianSetupState; dispatch: React.Dispatch<ElectricianSetupAction> } | undefined>(undefined);

const electricianSetupReducer = (state: ElectricianSetupState, action: ElectricianSetupAction): ElectricianSetupState => {
    switch (action.type) {
        case "SET_ACTIVITY_ID":
            return { ...state, activityId: action.payload };
        default:
            return state;
    }
};

export const useActivityId = () => {
    const context = useContext(ElectricianSetupContext);
    if (!context) throw new Error("useActivityId must be used within an ElectricianSetupProvider");
    return context;
};

export const ElectricianSetupProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(electricianSetupReducer, { activityId: "" });
    const memoizedValue = useMemo(() => ({ state, dispatch }), [state]);

    return <ElectricianSetupContext.Provider value={memoizedValue}>{children}</ElectricianSetupContext.Provider>;
};
