// C:/Users/GPena/Desktop/expo-testing/metering/app/(electrician)_setup/_context.tsx
import React, { createContext, useReducer, useContext, ReactNode, useMemo } from "react";

export interface FormData {
    application_id?: string;
    ClientType?: string | null;
    ApplicationType?: string | null;
    ClassType?: string | null;
    CustomerType?: string | null;
    BusinessType?: string | null;
    GovernmentCategory?: string | null;
    GovernmentSubType?: string | null;
    FirstName?: string;
    MiddleName?: string;
    LastName?: string;
    Suffix?: string;
    Birthdate?: string;
    MaritalStatus?: string;
    MobileNo?: string;
    LandlineNo?: string;
    Email?: string;
    TIN?: string;
    TypeOfID?: string;
    IdNo?: string;
    FatherFirstName?: string;
    FatherMiddleName?: string;
    FatherLastName?: string;
    MotherFirstName?: string;
    MotherMiddleName?: string;
    MotherLastName?: string;
    RepresentativeFirstName?: string;
    RepresentativeMiddleName?: string;
    RepresentativeLastName?: string;
    RepresentativeRelationship?: string;
    RepresentativeMobile?: string;
    RepresentativeEmail?: string;
    RepresentativeAttachedID?: string;
    RepresentativeSpecialPowerOfAttorney?: string;
    CustomerAddress?: string;
    CityMunicipality?: string;
    Barangay?: string;
    StreetHouseUnitNo?: string;
    SitioPurokBuildingSubdivision?: string;
    reference_pole?: string;
    NearMeterNo?: string;
    latitude?: string;
    longitude?: string;
    pole_latitude?: string;
    pole_longitude?: string;
    TraversingWire?: string;
    ElectricalPermitNumber?: string;
    PermitEffectiveDate?: string;
    LandMark?: string;
    postal_code?: string | null; // Added | null for consistency
}

type Action = { type: "SET_INPUT_FIELD"; field: keyof FormData; payload: string | null } | { type: "SET_FORM_DATA"; payload: FormData };

const initialState: FormData = {
    application_id: undefined,
    ClientType: null,
    ApplicationType: null,
    ClassType: null,
    CustomerType: null,
    BusinessType: null,
    GovernmentCategory: null,
    GovernmentSubType: null,
    FirstName: undefined,
    MiddleName: undefined,
    LastName: undefined, // Added missing initializations for completeness
    Suffix: undefined,
    Birthdate: undefined,
    MaritalStatus: undefined,
    MobileNo: undefined,
    LandlineNo: undefined,
    Email: undefined,
    TIN: undefined,
    TypeOfID: undefined,
    IdNo: undefined,
    FatherFirstName: undefined,
    FatherMiddleName: undefined,
    FatherLastName: undefined,
    MotherFirstName: undefined,
    MotherMiddleName: undefined,
    MotherLastName: undefined,
    RepresentativeFirstName: undefined,
    RepresentativeMiddleName: undefined,
    RepresentativeLastName: undefined,
    RepresentativeRelationship: undefined,
    RepresentativeMobile: undefined,
    RepresentativeEmail: undefined,
    RepresentativeAttachedID: undefined,
    RepresentativeSpecialPowerOfAttorney: undefined,
    CustomerAddress: undefined,
    CityMunicipality: undefined,
    Barangay: undefined,
    StreetHouseUnitNo: undefined,
    SitioPurokBuildingSubdivision: undefined,
    reference_pole: undefined,
    NearMeterNo: undefined,
    latitude: undefined,
    longitude: undefined,
    pole_latitude: undefined,
    pole_longitude: undefined,
    TraversingWire: undefined,
    ElectricalPermitNumber: undefined,
    PermitEffectiveDate: undefined,
    LandMark: undefined,
    postal_code: null, // Initialized postal_code
};

const formReducer = (state: FormData, action: Action): FormData => {
    switch (action.type) {
        case "SET_INPUT_FIELD":
            return { ...state, [action.field]: action.payload };
        case "SET_FORM_DATA":
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

const FormContext = createContext<{ formData: FormData; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const useFormData = () => {
    const context = useContext(FormContext);
    if (!context) throw new Error("useFormData must be used within a FormProvider");
    return context;
};

export const FormProvider = ({ children }: { children: ReactNode }) => {
    const [formData, dispatch] = useReducer(formReducer, initialState);
    const value = useMemo(() => ({ formData, dispatch }), [formData]);
    return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const groupedPages = [
    {
        title: "Client Information",
        fields: ["ClientType", "ApplicationType", "ClassType", "CustomerType", "BusinessType", "GovernmentCategory", "GovernmentSubType"],
    },
    {
        title: "Client Details",
        fields: ["FirstName", "MiddleName", "LastName", "Suffix", "Birthdate", "MaritalStatus", "MobileNo", "LandlineNo", "Email", "TIN", "TypeOfID", "IdNo"],
    },
    { title: "Parent Information", fields: ["FatherFirstName", "FatherMiddleName", "FatherLastName", "MotherFirstName", "MotherMiddleName", "MotherLastName"] },
    {
        title: "Representative Information",
        fields: [
            "RepresentativeFirstName",
            "RepresentativeMiddleName",
            "RepresentativeLastName",
            "RepresentativeRelationship",
            "RepresentativeMobile",
            "RepresentativeEmail",
            "RepresentativeAttachedID",
            "RepresentativeSpecialPowerOfAttorney",
        ],
    },
    {
        title: "Client Address",
        fields: ["CustomerAddress", "CityMunicipality", "Barangay", "StreetHouseUnitNo", "SitioPurokBuildingSubdivision", "postal_code"],
    }, // Added postal_code
    { title: "Metering Location", fields: ["NearMeterNo", "LandMark", "latitude", "longitude", "pole_latitude", "pole_longitude", "reference_pole"] },
    { title: "Client Additional Info", fields: ["TraversingWire", "ElectricalPermitNumber", "PermitEffectiveDate"] },
];

// Removed unnecessary export of formReducer and initialState
