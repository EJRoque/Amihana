import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import ReviewOnboardingPage from "./pages/ReviewOnboardingPage";
import ForgetPassword from "./pages/ForgetPass";
import CashFlowAdmin from "./pages/admin/CashFlow";

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
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/cash-flow-admin" element={<CashFlowAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
