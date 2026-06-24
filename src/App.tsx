import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "sonner";
import { AppBootstrap } from "@/components/auth/AppBootstrap";

export default function App() {
  return (
    <AppBootstrap>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "font-sans text-sm",
            success: "border-l-4 border-l-ayura-green",
            error: "border-l-4 border-l-destructive",
          },
        }}
        richColors
      />
    </AppBootstrap>
  );
}
