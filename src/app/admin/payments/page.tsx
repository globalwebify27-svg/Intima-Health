"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedClinic, setSelectedClinic] = useState<string>("All");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
      }
    } catch (error) {
      console.error("Error fetching payments", error);
    } finally {
      setLoading(false);
    }
  };

  const clinics = Array.from(new Set(payments.map(p => p.appointmentId?.clinicId?.name).filter(Boolean)));
  const doctors = Array.from(new Set(payments.map(p => p.appointmentId?.doctorId?.name).filter(Boolean)));
  
  const filteredPayments = payments.filter(payment => {
    if (selectedClinic !== "All" && payment.appointmentId?.clinicId?.name !== selectedClinic) return false;
    if (selectedDoctor !== "All" && payment.appointmentId?.doctorId?.name !== selectedDoctor) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const patientName = (payment.patientId?.name || "").toLowerCase();
      const transactionId = (payment.gatewayTransactionId || "").toLowerCase();
      if (!patientName.includes(q) && !transactionId.includes(q)) return false;
    }

    if (startDate) {
      if (new Date(payment.createdAt).getTime() < new Date(startDate).setHours(0,0,0,0)) return false;
    }
    if (endDate) {
      if (new Date(payment.createdAt).getTime() > new Date(endDate).setHours(23,59,59,999)) return false;
    }

    return true;
  });

  const downloadReport = () => {
    const exportData = payments.filter(payment => {
      if (exportStartDate) {
        if (new Date(payment.createdAt).getTime() < new Date(exportStartDate).setHours(0,0,0,0)) return false;
      }
      if (exportEndDate) {
        if (new Date(payment.createdAt).getTime() > new Date(exportEndDate).setHours(23,59,59,999)) return false;
      }
      return true;
    });

    const headers = ["Date", "Patient", "Doctor", "Clinic", "Transaction ID", "Context", "Amount", "Status"];
    const csvRows = [headers.join(",")];
    exportData.forEach(payment => {
      const date = new Date(payment.createdAt).toLocaleString().replace(/,/g, "");
      const patient = payment.patientId?.name || "Unknown";
      const doctor = payment.appointmentId?.doctorId?.name || "N/A";
      const clinic = payment.appointmentId?.clinicId?.name || "N/A";
      const txnId = payment.gatewayTransactionId || "";
      const context = payment.appointmentId ? `Appointment (${payment.appointmentId.type})` : payment.orderId ? "Pharmacy Order" : "";
      const amount = `${payment.currency} ${payment.amount}`;
      const status = payment.status;
      csvRows.push([date, patient, doctor, clinic, txnId, context, amount, status].map(v => `"${v}"`).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `payments_report.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Export Report
        </button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center mb-6">
        <div className="relative flex-1 min-w-[250px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search Patient or Transaction ID" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <span className="text-gray-500 text-sm">to</span>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>

        {doctors.length > 0 && (
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer min-w-[150px]"
          >
            <option value="All">All Doctors</option>
            {doctors.map(doc => (
              <option key={doc as string} value={doc as string}>{doc as string}</option>
            ))}
          </select>
        )}

        {clinics.length > 0 && (
          <select 
            value={selectedClinic} 
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer min-w-[150px]"
          >
            <option value="All">All Clinics</option>
            {clinics.map(clinic => (
              <option key={clinic as string} value={clinic as string}>{clinic as string}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p>Loading payments...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Clinic</th>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Context</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.patientId ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.patientId.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">{payment.patientId.phone}</div>
                      </div>
                    ) : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {payment.appointmentId?.doctorId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {payment.appointmentId?.clinicId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {payment.gatewayTransactionId}
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap">
                    {payment.appointmentId && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Appointment ({payment.appointmentId.type})
                      </span>
                    )}
                    {payment.orderId && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Pharmacy Order
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {payment.currency} {payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === "Success" ? "bg-green-100 text-green-800" :
                      payment.status === "Failed" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No payment transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}


      {isExportModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Export Payments Report</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-gray-500">Leaving dates empty will export all payments.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={downloadReport}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
