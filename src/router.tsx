import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";

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
  // Default: go to onboarding (first launch) or access
  {
    path: "/",
    element: <Navigate to="/onboarding" replace />,
  },

  // ── Public ──────────────────────────────────────────────
  {
    path: "/onboarding",
    element: <OnboardingScreen />,
  },
  {
    path: "/access",
    element: <AccessScreen />,
  },

  // ── Authenticated app ────────────────────────────────────
  {
    path: "/dashboard",
    element: <DashboardScreen />,
  },
  {
    path: "/invoice",
    element: <InvoiceScreen />,
  },
  {
    path: "/estimation",
    element: <EstimationScreen />,
  },
  {
    path: "/stock",
    element: <StockScreen />,
  },
  {
    path: "/booking",
    element: <BookingScreen />,
  },
  {
    path: "/doctor-portal",
    element: <DoctorPortalScreen />,
  },
  {
    path: "/insights",
    element: <InsightsScreen />,
  },
  {
    path: "/all-invoices",
    element: <AllInvoicesScreen />,
  },
  {
    path: "/admin",
    element: <AdminScreen />,
  },

  // ── Catch-all ────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/onboarding" replace />,
  },
]);
