import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { ProjectSubmissionPage } from "./pages/ProjectSubmissionPage";
import { GalleryPage } from "./pages/GalleryPage";
import { LearningResourcesPage } from "./pages/LearningResourcesPage";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { PricingPage } from "./pages/PricingPage";
import { MaterialLibraryPage } from "./pages/MaterialLibraryPage";
import { FileGuidelinesPage } from "./pages/FileGuidelinesPage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider } from './contexts/languageContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simple hash-based routing
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "home";
      setCurrentPage(hash);
      window.scrollTo(0, 0);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "services":
        return <ServicesPage />;
      case "submit-project":
        return <ProjectSubmissionPage />;
      case "gallery":
        return <GalleryPage />;
      case "learning":
        return <LearningResourcesPage />;
      case "workshops":
        return <WorkshopsPage />;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "pricing":
        return <PricingPage />;
      case "materials":
        return <MaterialLibraryPage />;
      case "file-guidelines":
        return <FileGuidelinesPage />;
      case "dashboard":
        return isLoggedIn ? <UserDashboardPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />;
      case "AdminDash":
        return isLoggedIn ? <AdminDashboardPage /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />;;
      case "login":
        return <LoginPage setIsLoggedIn={setIsLoggedIn} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          <main>{renderPage()}</main>
          <Footer />
          <Toaster />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
