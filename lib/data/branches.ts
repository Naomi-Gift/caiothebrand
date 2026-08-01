import type { Branch, BranchId } from "@/lib/types";

export const branches: Record<BranchId, Branch> = {
  owerri: {
    id: "owerri",
    name: "Owerri",
    address: "Sekani Mall, Eziobodo, Owerri, Imo State",
    hours: "10am – 10pm",
    phone: "08111111222",
    whatsapp: "07022223333",
    mapsQuery: "Sekani Mall, Eziobodo, Owerri, Imo State, Nigeria",
    deliveryEstimate: "35–50 min",
    lat: 5.3866,
    lng: 6.9909,
  },
  lagos: {
    id: "lagos",
    name: "Lagos",
    address: "5A Ojaja Mall, Ogombo Road, Ajah, Lagos",
    hours: "10am – 10pm",
    phone: "08111111222",
    whatsapp: "07022223333",
    mapsQuery: "5A Ojaja Mall, Ogombo Road, Ajah, Lagos, Nigeria",
    deliveryEstimate: "30–45 min",
    lat: 6.466,
    lng: 3.587,
  },
};

export const branchList: Branch[] = [branches.owerri, branches.lagos];
