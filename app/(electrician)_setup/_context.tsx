import React, { createContext, useReducer, useContext, ReactNode, useMemo } from "react";

export interface FormData {
    application_id?: string;
    ClientType?: string;
    ApplicationType?: string;
    ClassType?: string;
    CustomerType?: string;
    BusinessType?: string;
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
    // DeceasedLotOwner?: string;
    ElectricalPermitNumber?: string;
    PermitEffectiveDate?: string;
    LandMark?: string;
}
type Action = { type: "SET_INPUT_FIELD"; field: keyof FormData; payload: string } | { type: "SET_FORM_DATA"; payload: FormData };

const initialState: FormData = {};

const formReducer = (state: FormData, action: Action): FormData => {
    switch (action.type) {
        case "SET_INPUT_FIELD":
            return { ...state, [action.field]: action.payload };
        case "SET_FORM_DATA":
            return { ...state, ...action.payload }; // Merge new form data
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
    return <FormContext.Provider value={{ formData: useMemo(() => formData, [formData]), dispatch }}>{children}</FormContext.Provider>;
};

export const groupedPages = [
    { title: "Client Information", fields: ["ClientType", "ApplicationType", "ClassType", "CustomerType", "BusinessType"] },
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
    { title: "Client Address", fields: ["CustomerAddress", "CityMunicipality", "Barangay", "StreetHouseUnitNo", "SitioPurokBuildingSubdivision"] },
    { title: "Metering Location", fields: ["NearMeterNo"] },
    { title: "Client Additional Info", fields: ["TraversingWire", "ElectricalPermitNumber", "PermitEffectiveDate", "LandMark"] },
];

export { formReducer, initialState };
