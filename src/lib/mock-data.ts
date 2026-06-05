export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  status: "Active" | "Inactive" | "Pending";
  patientsSeen: number;
  rating: number;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "Active" | "Inactive";
};

export type Medicine = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

export type Appointment = {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: "Video" | "In-person";
  status: "Scheduled" | "Completed" | "Cancelled";
};

export type Order = {
  id: string;
  patientName: string;
  totalAmount: number;
  date: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
};

export const mockDoctors: Doctor[] = [
  { id: "doc_1", name: "Dr. Sarah Jenkins", specialty: "Sexual Medicine", status: "Active", patientsSeen: 142, rating: 4.9 },
  { id: "doc_2", name: "Dr. Michael Chen", specialty: "Urology", status: "Active", patientsSeen: 89, rating: 4.8 },
  { id: "doc_3", name: "Dr. Emily Rodriguez", specialty: "Gynecology", status: "Active", patientsSeen: 210, rating: 4.9 },
  { id: "doc_4", name: "Dr. James Wilson", specialty: "Psychiatry", status: "Inactive", patientsSeen: 45, rating: 4.5 },
  { id: "doc_5", name: "Dr. Anita Patel", specialty: "Endocrinology", status: "Pending", patientsSeen: 0, rating: 0 },
];

export const mockPatients: Patient[] = [
  { id: "pat_1", name: "John Doe", email: "john@example.com", phone: "+91 9876543210", joinDate: "2024-03-15", status: "Active" },
  { id: "pat_2", name: "Jane Smith", email: "jane@example.com", phone: "+91 9876543211", joinDate: "2024-03-20", status: "Active" },
  { id: "pat_3", name: "Robert Johnson", email: "robert@example.com", phone: "+91 9876543212", joinDate: "2024-04-05", status: "Inactive" },
  { id: "pat_4", name: "Michael Brown", email: "michael@example.com", phone: "+91 9876543213", joinDate: "2024-04-12", status: "Active" },
  { id: "pat_5", name: "William Davis", email: "william@example.com", phone: "+91 9876543214", joinDate: "2024-05-01", status: "Active" },
];

export const mockMedicines: Medicine[] = [
  { id: "med_1", name: "Tadalafil 5mg", category: "ED Treatment", price: 1200, stock: 14, status: "Low Stock" },
  { id: "med_2", name: "Sildenafil 50mg", category: "ED Treatment", price: 800, stock: 150, status: "In Stock" },
  { id: "med_3", name: "Dapoxetine 30mg", category: "PE Treatment", price: 1500, stock: 45, status: "In Stock" },
  { id: "med_4", name: "Testosterone Gel", category: "Hormone Therapy", price: 3500, stock: 0, status: "Out of Stock" },
  { id: "med_5", name: "L-Arginine Supplement", category: "Vitamins", price: 600, stock: 200, status: "In Stock" },
];

export const mockAppointments: Appointment[] = [
  { id: "apt_1", patientName: "John Doe", doctorName: "Dr. Sarah Jenkins", date: "2024-06-05", time: "10:00 AM", type: "Video", status: "Completed" },
  { id: "apt_2", patientName: "Michael Brown", doctorName: "Dr. Michael Chen", date: "2024-06-05", time: "02:30 PM", type: "Video", status: "Scheduled" },
  { id: "apt_3", patientName: "William Davis", doctorName: "Dr. Emily Rodriguez", date: "2024-06-06", time: "11:00 AM", type: "In-person", status: "Scheduled" },
  { id: "apt_4", patientName: "Jane Smith", doctorName: "Dr. Sarah Jenkins", date: "2024-06-04", time: "04:00 PM", type: "Video", status: "Cancelled" },
];

export const mockOrders: Order[] = [
  { id: "ord_1", patientName: "John Doe", totalAmount: 2400, date: "2024-06-01", status: "Delivered" },
  { id: "ord_2", patientName: "Robert Johnson", totalAmount: 1500, date: "2024-06-04", status: "Shipped" },
  { id: "ord_3", patientName: "Michael Brown", totalAmount: 800, date: "2024-06-05", status: "Processing" },
  { id: "ord_4", patientName: "William Davis", totalAmount: 3500, date: "2024-06-05", status: "Pending" },
];
