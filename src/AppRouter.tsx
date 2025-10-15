import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { Navigation } from "./components/Navigation";

import Index from "./pages/Index";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";
import BadgeGallery from "./pages/BadgeGallery";
import CreateBadge from "./pages/CreateBadge";
import EditBadge from "./pages/EditBadge";
import ManageBadges from "./pages/ManageBadges";
import MyBadges from "./pages/MyBadges";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/badges" element={<BadgeGallery />} />
        <Route path="/badges/create" element={<CreateBadge />} />
        <Route path="/badges/edit" element={<EditBadge />} />
        <Route path="/badges/manage" element={<ManageBadges />} />
        <Route path="/badges/my" element={<MyBadges />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;