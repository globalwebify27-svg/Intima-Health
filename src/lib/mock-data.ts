export type Order = {
  id: string;
  patientName: string;
  totalAmount: number;
  date: string;
  status: "Pending" | "Delivered" | "Processing";
};

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    patientName: "John Doe",
    totalAmount: 1250,
    date: "2024-03-10",
    status: "Delivered",
  },
  {
    id: "ORD-002",
    patientName: "Jane Smith",
    totalAmount: 850,
    date: "2024-03-12",
    status: "Processing",
  },
  {
    id: "ORD-003",
    patientName: "Robert Johnson",
    totalAmount: 2100,
    date: "2024-03-15",
    status: "Pending",
  },
];

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "Active" | "Inactive";
};

export const mockPatients: Patient[] = [
  {
    id: "PAT-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 9876543210",
    joinDate: "2023-01-15",
    status: "Active",
  },
  {
    id: "PAT-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 9876543211",
    joinDate: "2023-05-22",
    status: "Active",
  },
  {
    id: "PAT-003",
    name: "Robert Johnson",
    email: "robert@example.com",
    phone: "+91 9876543212",
    joinDate: "2023-11-05",
    status: "Inactive",
  },
];
