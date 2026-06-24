import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

import { RootRedirect, RequireAuth, OnboardingOnly, AccessOnly } from "@/components/auth/RouteGuards";
import { OnboardingScreen } from "@/screens/onboarding/OnboardingScreen";
import { AccessScreen } from "@/screens/access/AccessScreen";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { InvoiceScreen } from "@/screens/invoice/InvoiceScreen";
import { EstimationScreen } from "@/screens/estimation/EstimationScreen";
import { StockScreen } from "@/screens/stock/StockScreen";
import { BookingScreen } from "@/screens/booking/BookingScreen";
import { DoctorPortalScreen } from "@/screens/doctor-portal/DoctorPortalScreen";
import { InsightsScreen } from "@/screens/insights/InsightsScreen";
import { AllInvoicesScreen } from "@/screens/all-invoices/AllInvoicesScreen";
import { AdminScreen } from "@/screens/admin/AdminScreen";

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },

  {
    element: <OnboardingOnly />,
    children: [{ path: "/onboarding", element: <OnboardingScreen /> }],
  },

  {
    element: <AccessOnly />,
    children: [{ path: "/access", element: <AccessScreen /> }],
  },

  {
    element: <RequireAuth />,
    children: [
      { path: "/dashboard", element: <DashboardScreen /> },
      { path: "/invoice", element: <InvoiceScreen /> },
      { path: "/estimation", element: <EstimationScreen /> },
      { path: "/stock", element: <StockScreen /> },
      { path: "/booking", element: <BookingScreen /> },
    ],
  },

  {
    element: <RequireAuth roles={["doctor", "admin"]} />,
    children: [{ path: "/doctor-portal", element: <DoctorPortalScreen /> }],
  },

  {
    element: <RequireAuth roles={["admin"]} />,
    children: [
      { path: "/insights", element: <InsightsScreen /> },
      { path: "/all-invoices", element: <AllInvoicesScreen /> },
      { path: "/admin", element: <AdminScreen /> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
