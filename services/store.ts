import { create } from "zustand"; // Ensure correct import
// import type { MeteringApplication } from "@/app/(electricianv2)_fa/"; // Import or define the type
interface MeteringApplication {
    application_id: string;
    status: string;
}
interface MeteringStore {
    differences: MeteringApplication[];
    setDifferences: (data: MeteringApplication[]) => void;
}

export const useMeteringStore = create<MeteringStore>((set) => ({
    differences: [],
    setDifferences: (data: MeteringApplication[]) => set({ differences: data }),
}));
