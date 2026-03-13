export type CustomerFormValues = {
  customer: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    townCity: string;
    postcode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    status: "Active" | "New" | "Returning";
  };
  booking: {
    arrivalDate: string;
    departureDate: string;
    boardersBooked: string;
    daysInclusive: string;
    bookingNotes: string;
  };
  vetDetails: {
    vetName: string;
    vetAddress: string;
    vetContactNumber: string;
  };
  boarders: Array<{
    name: string;
    description: string;
    age: string;
    medications: string;
    specialDiet: string;
    comments: string;
    vaccinationDate: string;
    kennelCoughDate: string;
    dailyRate: string;
  }>;
  extras: {
    grooming: string;
    pickupDelivery: string;
    medication: string;
    vetsFees: string;
    training: string;
    totalExtras: string;
  };
  billing: {
    totalDailyRate: string;
    totalDays: string;
    discount: string;
    extras: string;
    subtotal: string;
    vatPercent: string;
    total: string;
    amountPaid: string;
    balanceOwed: string;
  };
};

export const boarderTitles = ["Boarder 1", "Boarder 2", "Boarder 3"];

export const emptyCustomerFormValues: CustomerFormValues = {
  customer: {
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    townCity: "",
    postcode: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    status: "Active",
  },
  booking: {
    arrivalDate: "",
    departureDate: "",
    boardersBooked: "",
    daysInclusive: "",
    bookingNotes: "",
  },
  vetDetails: {
    vetName: "",
    vetAddress: "",
    vetContactNumber: "",
  },
  boarders: boarderTitles.map(() => ({
    name: "",
    description: "",
    age: "",
    medications: "",
    specialDiet: "",
    comments: "",
    vaccinationDate: "",
    kennelCoughDate: "",
    dailyRate: "",
  })),
  extras: {
    grooming: "0.00",
    pickupDelivery: "0.00",
    medication: "0.00",
    vetsFees: "0.00",
    training: "0.00",
    totalExtras: "0.00",
  },
  billing: {
    totalDailyRate: "0.00",
    totalDays: "0",
    discount: "0.00",
    extras: "0.00",
    subtotal: "0.00",
    vatPercent: "0.00",
    total: "0.00",
    amountPaid: "0.00",
    balanceOwed: "0.00",
  },
};