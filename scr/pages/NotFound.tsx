
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLang } from "../contexts/LangContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRTL } = useLang();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="text-center space-y-4 max-w-md px-4">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="pt-4">
          <Button onClick={() => navigate("/dashboard")}>
            العودة إلى لوحة القيادة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
