export const ClientType = ["New", "Existing"];

export const NewClientOptions = ["PERMANENT", "SEPARATION OF METER", "TEMPORARY", "TFC"];

export const ExistingClientOptions = ["CHANGE NAME", "DOWNGRADE LOAD", "RE-CON & CHANGE NAME", "RE-CONNECTION", "TLM", "UPGRADE LOAD"];

export const ApplicationType = ["PERMANENT", "SEPARATION OF METER", "TEMPORARY", "TFC"];

export const ClassType = ["GOVERNMENT", "NON-RESIDENTIAL", "RESIDENTIAL"];

export const CustomerType = ["Business", "Person"];

export const BusinessType = ["COOPERATIVE", "CORPORATION", "MARKET STALL", "PARTNERSHIP", "SOLE PROPRIETORSHIP"];

export const PersonPropertyType = ["AUTHORIZED OCCUPANT", "OWNED", "PURCHASED", "RENTED", "URBAN POOR"];

export const MaritalStatus = ["Single", "Married", "Widowed", "Divorced"];

type FormFields = "ClientType" | "NewClientOptions" | "Signature";

export const IdTypes = [
    "Social Security (SS) card",
    "Unified Multi-Purpose ID (UMID) card",
    "Passport",
    "Professional Regulation Commission (PRC) card",
    "Seaman's Book (Seafarer's Identification & Record Book)",
    "Alien Certificate of Registration",
    "ATM card (with cardholder's name)",
    "Bank Account Passbook",
    "Company ID card",
    "Certificate of Confirmation issued by National Commission on Indigenous People",
    "Certificate of Licensure/Qualification Documents from MARINA",
    "Certificate of Naturalization",
    "Driver's License",
    "Firearm License card issued by Philippine National Police (PNP)",
    "Fishworker's License issued by BFAR",
    "GSIS card/Member's Record/Certificate of Membership",
    "Health or Medical card",
    "Life Insurance Policy of member",
    "Marriage Contract/Marriage Certificate",
    "NBI Clearance",
    "Pag-IBIG Transaction Card/Member's Data Form",
    "Phil Health ID card/Member's Data Record",
    "Police Clearance",
    "Postal ID card",
    "School ID card",
    "Seafarer's Registration Certificate issued by POEA",
    "Senior Citizen card",
    "Student Permit issued by LTO",
    "TIN card",
    "Transcript of Records",
    "Voter's ID",
];

export const MeteringLocation = [
    "MOH",
    "MOP",
    "EMC (CONVENTIONAL)",
    "EMC (HAWKEYE)",
    "METER CENTER",
    "PEDESTAL (TFC)",
    "PEDESTAL (PERMANENT)",
    "METER CLUSTER",
    "ELEVATED METERING CENTER",
    "ELEVATED METERING CENTER - GUARD",
    "ELEVATED METERING CENTER - HAWK EYE",
    "ELEVATED METERING CENTER - RADIO FREQUENCY",
    "ELEVATED METERING CENTER - TILTED",
    "FACING THE STREET",
    "IN THE GARAGE",
    "INSIDE THE HOUSE",
    "LEFT SIDE OF THE HOUSE",
    "POLE",
    "RIGHT SIDE OF THE HOUSE",
    "WALL/CONCRETE FENCE",
];

export const YesNoOptions = ["Yes", "No"];

export const PermitFields = {
    EffectiveDate: "dd/mm/yyyy", // * Required
    Landmark: "",
};

export const InputFields = {
    AccountCount: "",
    FirstName: "", // * Required
    MiddleName: "", // * Required
    LastName: "", // * Required
    Suffix: "", // * Required
    Birthdate: "dd/mm/yyyy", // * Required
    MaritalStatus: "", // * Required
    MobileNo: "", // * Required
    LandlineNo: "", // * Required
    Email: "", // * Required
    TIN: "", // * Required
    IdNo: "",
    CustomerAddress: "",
    CityMunicipality: "",
    Barangay: "",
    StreetHouseUnitNo: "",
    SitioPurokBuildingSubdivision: "",
    Signature: "", // Added Signature field
};

export const RequiredFields = {
    ClientType: true,
    ApplicationType: true,
    ClassType: true,
    CustomerType: true,
    BusinessType: true,
    PersonPropertyType: true,
    TraversingWire: true,
    // DeceasedLotOwner: true,
    ElectricalPermitNumber: true,
    PermitEffectiveDate: true,
    Signature: true,

    // Additional required fields for meter installation
    FirstName: true,
    MiddleName: true,
    LastName: true,
    Birthdate: true,
    MaritalStatus: true,
    MobileNo: true,
    Email: true,
    TIN: true,
    IdNo: true,
    CustomerAddress: true,
    CityMunicipality: true,
    Barangay: true,
    StreetHouseUnitNo: true,
    SitioPurokBuildingSubdivision: true,
    MeteringLocation: true, // Important for defining installation location
    IdTypes: true, // Required for identification verification
};

export const Questions = {
    ClientType,
    NewClientOptions,
    ExistingClientOptions,
    ApplicationType,
    ClassType,
    CustomerType,
    BusinessType,
    PersonPropertyType,
    MaritalStatus,
    IdTypes,
    MeteringLocation,
    YesNoOptions,
    PermitFields,
    InputFields,
    RequiredFields,
};
