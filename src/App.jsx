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


// step 1: import balance sheet
import BalanceSheet from "./pages/home-owners/BalanceSheet";
import BalanceSheetAdmin from './pages/admin/BalanceSheetAdmin'

function App() {
      const [account, setAccount] = useState({
            email: "",
            password: "",
            confirmPassword: "",
            profilePicture: null,
            fullName: "",
            phoneNumber: "",
            age: "",
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

                              {/* step 2: Make a route for Balance Sheet */}
                              <Route
                                    path="/balance-sheet-home-owners"
                                    element={
                                          <BalanceSheet />
                                    }
                              />
                              <Route
                                    path="/balance-sheet-admin"
                                    element={
                                          <BalanceSheetAdmin

                                                cashFlow={cashFlow}
                                                setCashFlow={setCashFlow}
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
                                    element={<IncomeStatementAdmin />}
                              />
                              <Route
                                    path="/income-state-home-owners"
                                    element={<IncomeStatementHomeOwners />}
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
                              <Route
                                    path="/events-admin"
                                    element={
                                          <EventsAdmin />
                                    }
                              />
                        </Routes>
                  </Router>
                  <ToastContainer />
            </>
      );
}

export default App;
