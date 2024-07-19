import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

function App() {
  const [account, setAccount] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    profilePicture: null,
    fullName: "",
    phoneNumber: "",
    age: "",
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

  return (
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
        <Route 
          path="/forget-password" 
          element={
          <ForgetPassword />
          } 
          />
        <Route
          path="/cash-flow-admin"
          element={
            <CashFlowAdmin cashFlow={cashFlow} setCashFlow={setCashFlow} />
          }
        />
        <Route
          path="/cash-flow-home-owners"
          element={
            <CashflowHomeOwners cashFlow={cashFlow} setCashFlow={setCashFlow} />
          }
        />
         <Route 
        path="/income-state-admin"
        element={
          <IncomeStatementAdmin />
        }
        />
        <Route 
        path="/income-state-home-owners"
        element={
          <IncomeStatementHomeOwners />
        }
        />
         <Route
          path="/profile"
          element={<ProfilePage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
