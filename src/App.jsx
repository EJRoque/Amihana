import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import ReviewOnboardingPage from "./pages/ReviewOnboardingPage";
import ForgetPassword from "./pages/ForgetPass";
import CashFlowAdmin from "./pages/admin/CashFlow";
import CashflowHomeOwners from "./pages/home-owners/Cashflow";
import IncomeStatementAdmin from "./pages/admin/IncomeStatement";
import IncomeStatementHomeOwners from "./pages/home-owners/IncomeStatement";
import ProfilePage from "./pages/ProfilePage";
import AnnouncementAdmin from "./pages/admin/Announcement";
import AnnouncementHomeOwners from "./pages/home-owners/Announcement";
import EventsAdmin from "./pages/admin/Events";
import ReserveEvent from "./pages/home-owners/ReserveEvent";
import BalanceSheet from "./pages/home-owners/BalanceSheet";
import BalanceSheetAdmin from "./pages/admin/BalanceSheetAdmin";
import Dashboard from "./pages/home-owners/Dashboard";
import DashboardAdmin from "./pages/admin/Dashboard";

function App() {
  const [account, setAccount] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
    fullName: "",
    phoneNumber: "",
    age: "",
    phase: "",
    block: "",
    lot: "",
    isAdmin: false,
  });

  //image preview
  const [imagePreview, setImagePreview] = useState(null);

  //cash flow record state
  const [cashFlow, setCashFlow] = useState({
    date: "",
    openingBalance: [{ description: "", amount: "" }],
    cashReceipts: [{ description: "", amount: "" }],
    cashPaidOut: [{ description: "", amount: "" }],
    totalCashAvailable: { description: "Total Cash Available", amount: "" },
    totalCashPaidOut: { description: "Total Cash Paid-out", amount: "" },
    endingBalance: { description: "Ending Balance", amount: "" },
  });

  //announcement state
  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
  });

  //1. DATA STRUCTURE UPDATE: name tapos status every month if paid
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  const addNewEntry = (name) => {
    setData((prevData) => [
      ...prevData,
      {
        name,
        status: {
          Jan: false,
          Feb: false,
          Mar: false,
          Apr: false,
          May: false,
          Jun: false,
          Jul: false,
          Aug: false,
          Sep: false,
          Oct: false,
          Nov: false,
          Dec: false,
          Hoa: false,
        },
      },
    ]);
  };

  //income statement record state
  const [incomeStatement, setIncomeStatement] = useState({
    date: "",
    revenue: [{ description: "", amount: "" }],
    expenses: [{ description: "", amount: "" }],
    totalRevenue: { description: "Total Cash Revenue", amount: "" },
    totalExpenses: { description: "Total Cash Expenses", amount: "" },
    netIncome: { description: "Net Income", amount: "" },
  });

  return (
    <>
      <Router>
        <Routes>
          <Route
            exact
            path="/"
            element={<LoginPage account={account} setAccount={setAccount} />}
          />
          <Route
            path="/signup"
            element={<SignupPage account={account} setAccount={setAccount} />}
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingPage
                account={account}
                setAccount={setAccount}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
              />
            }
          />
          <Route
            path="/review-onboarding"
            element={
              <ReviewOnboardingPage
                account={account}
                setAccount={setAccount}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
              />
            }
          />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route
            path="/cash-flow-admin"
            element={
              <CashFlowAdmin cashFlow={cashFlow} setCashFlow={setCashFlow} />
            }
          />

          {/* Route for Balance Sheet */}
          <Route path="/balance-sheet-home-owners" element={<BalanceSheet />} />
          <Route
            path="/balance-sheet-admin"
            element={
              <BalanceSheetAdmin
                data={data}
                setData={setData}
                addNewEntry={addNewEntry}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
              />
            }
          />

          <Route
            path="/cash-flow-home-owners"
            element={
              <CashflowHomeOwners
                cashFlow={cashFlow}
                setCashFlow={setCashFlow}
              />
            }
          />
          <Route
            path="/income-state-admin"
            element={
              <IncomeStatementAdmin
                incomeStatement={incomeStatement}
                setIncomeStatement={setIncomeStatement}
              />
            }
          />
          <Route
            path="/income-state-home-owners"
            element={<IncomeStatementHomeOwners
              incomeStatement={incomeStatement}
              setIncomeStatement={setIncomeStatement}
              
              />}
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/announcement-admin"
            element={
              <AnnouncementAdmin
                announcement={announcement}
                setAnnouncement={setAnnouncement}
              />
            }
          />
          <Route
            path="/announcement-home-owners"
            element={
              <AnnouncementHomeOwners
                announcement={announcement}
                setAnnouncement={setAnnouncement}
              />
            }
          />
          <Route path="/events-admin" element={<EventsAdmin />} />
          <Route path="/events-home-owners" element={<ReserveEvent />} />

          <Route path="/dashboard-home-owners" element={<Dashboard />} />

          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
