import React, { useState, useEffect } from "react";
import { Tabs } from "antd"; // Import Ant Design Tabs
import Header from "../components/Header";
import SidebarHomeOwners from "../components/home-owners/Sidebar";
import SidebarAdmin from "../components/admin/Sidebar";
import MobileSidebarHOA from "../components/home-owners/MobileSidebarHOA";
import MobileSidebar from "../components/admin/MobileSidebar";
import { db } from "../firebases/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ChangePassword from "../components/Modals/Parts/EditPassword"; // Import ChangePassword
import EditProfileContent from "../components/Modals/Parts/EditProfileContent"; // Import EditProfileContent
import MobileProfprev from "../pages/MobileProfprev"; // Import MobileProfilePreview

function useMobileView() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobileOrTablet;
}

function ProfilePage() {
  const [homeOwner, setHomeOwner] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePicture: "",
    age: "",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobileOrTablet = useMobileView();

  useEffect(() => {
    const fetchUserData = async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setHomeOwner(userData);
            localStorage.setItem("homeOwner", JSON.stringify(userData));
          } else {
            console.error("User document not found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  if (loading) {
    return <div className="text-center mt-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header user={homeOwner} onSidebarToggle={toggleMobileSidebar} />

      <div className="flex flex-grow">
        {/* Sidebar */}
        {isMobileOrTablet ? (
          homeOwner.isAdmin ? (
            <MobileSidebar
              isOpen={isMobileSidebarOpen}
              onClose={toggleMobileSidebar}
            />
          ) : (
            <MobileSidebarHOA
              isOpen={isMobileSidebarOpen}
              onClose={toggleMobileSidebar}
            />
          )
        ) : homeOwner.isAdmin ? (
          <SidebarAdmin />
        ) : (
          <SidebarHomeOwners />
        )}

        {/* Main Content */}
        <div className="flex-grow flex justify-center items-start px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="bg-white shadow rounded-lg w-full max-w-4xl p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12">
              {/* Profile Picture for Mobile View */}
              <div className="flex-shrink-0">
                {isMobileOrTablet ? (
                  // Display Mobile Profile Preview when on mobile view
                  <MobileProfprev homeOwner={homeOwner} />
                ) : (
                  <img
                    src={homeOwner.profilePicture || "/placeholder-profile.png"}
                    alt="Profile"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Render Tabs only when not on mobile view */}
              {!isMobileOrTablet && (
                <div className="flex-grow w-full">
                  <Tabs
                    defaultActiveKey="1"
                    type="card"
                    size="large"
                    centered
                    items={[
                      {
                        key: "1",
                        label: "Overview",
                        children: (
                          <div>
                            <h2 className="text-lg md:text-xl font-semibold mb-4">
                              Overview
                            </h2>
                            <p>
                              Full Name: <strong>{homeOwner.fullName}</strong>
                            </p>
                            <p>
                              Email: <strong>{homeOwner.email}</strong>
                            </p>
                            <p>
                              Phone Number:{" "}
                              <strong>{homeOwner.phoneNumber}</strong>
                            </p>
                            <p>
                              Age: <strong>{homeOwner.age}</strong>
                            </p>
                          </div>
                        ),
                      },
                      {
                        key: "2",
                        label: "Settings",
                        children: (
                          <div>
                            <h2 className="text-lg md:text-xl font-semibold mb-4">
                              Settings
                            </h2>
                            <EditProfileContent
                              onProfileUpdate={(updatedProfilePic) => {
                                console.log(
                                  "Profile updated with new picture:",
                                  updatedProfilePic
                                );
                              }}
                            />
                          </div>
                        ),
                      },
                      {
                        key: "3",
                        label: "Security",
                        children: (
                          <div>
                            <h2 className="text-lg md:text-xl font-semibold mb-4">
                              Security
                            </h2>
                            <ChangePassword />
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
