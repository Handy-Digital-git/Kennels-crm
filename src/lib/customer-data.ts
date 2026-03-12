export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  town: string;
  boarders: string[];
  upcomingStay: string;
  nights: number;
  balanceDue: number;
  status: "Active" | "New" | "Returning";
};

export const customerRecords: CustomerRecord[] = [
  {
    id: "CUST-1001",
    name: "Margaret Fraser",
    email: "margaret.fraser@example.com",
    phone: "07700 900123",
    town: "Perth",
    boarders: ["Iesha", "Blu", "Kase"],
    upcomingStay: "29 Nov 2022 - 6 Dec 2022",
    nights: 8,
    balanceDue: 240,
    status: "Active",
  },
  {
    id: "CUST-1002",
    name: "Alistair McLean",
    email: "alistair.mclean@example.com",
    phone: "07700 900244",
    town: "Dundee",
    boarders: ["Milo"],
    upcomingStay: "14 Mar 2026 - 18 Mar 2026",
    nights: 4,
    balanceDue: 96,
    status: "Returning",
  },
  {
    id: "CUST-1003",
    name: "Fiona Campbell",
    email: "fiona.campbell@example.com",
    phone: "07700 900355",
    town: "Kinross",
    boarders: ["Skye", "Poppy"],
    upcomingStay: "21 Mar 2026 - 29 Mar 2026",
    nights: 8,
    balanceDue: 180,
    status: "Active",
  },
  {
    id: "CUST-1004",
    name: "Callum Stewart",
    email: "callum.stewart@example.com",
    phone: "07700 900466",
    town: "Stirling",
    boarders: ["Rex"],
    upcomingStay: "No booking scheduled",
    nights: 0,
    balanceDue: 0,
    status: "New",
  },
  {
    id: "CUST-1005",
    name: "Emma Robertson",
    email: "emma.robertson@example.com",
    phone: "07700 900577",
    town: "Crieff",
    boarders: ["Teddy", "Bonnie"],
    upcomingStay: "2 Apr 2026 - 5 Apr 2026",
    nights: 3,
    balanceDue: 72,
    status: "Returning",
  },
];