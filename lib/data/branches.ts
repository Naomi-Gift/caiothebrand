import type { Branch, BranchId } from "@/lib/types";

export const branches: Record<BranchId, Branch> = {
  owerri: {
    id: "owerri",
    name: "Owerri",
    address: "Sekani Mall, Eziobodo, Owerri, Imo State",
    hours: "10am – 10pm",
    phone: "08137550148",
    whatsapp: "08137550148",
    mapsQuery: "Sekani+Mall+Eziobodo+Owerri+Imo+State",
    deliveryEstimate: "35–50 min",
    lat: 5.3866,
    lng: 6.9909,
    comingSoon: true,
  },
  lagos: {
    id: "lagos",
    name: "Lagos",
    address: "5A Ojaja Mall, Ogombo Road, Ajah, Lagos",
    hours: "10am – 10pm",
    phone: "08137550148",
    whatsapp: "08137550148",
    mapsQuery: "5A+Ojaja+Mall+Ogombo+Road+Ajah+Lagos",
    deliveryEstimate: "30–45 min",
    lat: 6.466,
    lng: 3.587,
  },
};

export const branchList: Branch[] = [branches.owerri, branches.lagos];
