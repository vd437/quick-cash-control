
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";
import { useLang } from "../contexts/LangContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t, isRTL } = useLang();
  
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Navigation items
  const navItems = [
    {
      title: t("dashboard"),
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      title: t("products"),
      path: "/products",
      icon: <Package className="w-5 h-5" />,
    },
    {
      title: t("cashier"),
      path: "/cashier",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      title: t("sales"),
      path: "/sales",
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  // Toggle dark mode
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    toast({
      title: newMode ? t("darkMode") : t("lightMode"),
      duration: 2000,
    });
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Set initial theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className={`flex h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="outline"
        size="icon"
        className={`fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-50 lg:hidden`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-40 w-64 transform transition-transform duration-300 ease-in-out bg-sidebar text-sidebar-foreground lg:translate-x-0 ${
          isSidebarOpen 
            ? 'translate-x-0' 
            : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-4 py-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ShoppingCart className={`h-6 w-6 text-sidebar-primary ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <span className="text-lg font-semibold">كاش كونترول</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }`
                    }
                  >
                    {isRTL ? (
                      <>
                        <span className="mr-3">{item.title}</span>
                        {item.icon}
                      </>
                    ) : (
                      <>
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 mt-auto border-t border-sidebar-border">
            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle Theme</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="bg-sidebar-accent hover:bg-sidebar-accent/90 text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">{t("logout")}</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isSidebarOpen ? (isRTL ? 'mr-64' : 'ml-64') : ""
        }`}
      >
        <div className="px-4 py-4 md:px-6 lg:px-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
