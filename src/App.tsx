import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SiteMap from "@/pages/SiteMap";
import DeviceStatus from "@/pages/DeviceStatus";
import BookingQueue from "@/pages/BookingQueue";
import BatteryInventory from "@/pages/BatteryInventory";
import ChargingRecords from "@/pages/ChargingRecords";
import MemberAccount from "@/pages/MemberAccount";
import ExceptionTickets from "@/pages/ExceptionTickets";
import BusinessReports from "@/pages/BusinessReports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<SiteMap />} />
          <Route path="/devices" element={<DeviceStatus />} />
          <Route path="/bookings" element={<BookingQueue />} />
          <Route path="/batteries" element={<BatteryInventory />} />
          <Route path="/records" element={<ChargingRecords />} />
          <Route path="/members" element={<MemberAccount />} />
          <Route path="/tickets" element={<ExceptionTickets />} />
          <Route path="/reports" element={<BusinessReports />} />
        </Route>
      </Routes>
    </Router>
  );
}
