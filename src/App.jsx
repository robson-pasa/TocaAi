import { useEffect, useState } from "react";
import { apiJson, getToken, setToken, decodeToken } from "./api.js";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import BandDetailPage from "./pages/BandDetailPage.jsx";
import ApplyPage from "./pages/ApplyPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import MusicianEditPage from "./pages/MusicianEditPage.jsx";

function initialAuth() {
  const token = getToken();
  if (!token) return { role: null, bandId: null };
  const claims = decodeToken(token);
  if (!claims || (claims.exp && claims.exp * 1000 < Date.now())) {
    setToken(null);
    return { role: null, bandId: null };
  }
  return { role: claims.role, bandId: claims.id ?? null };
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedBandId, setSelectedBandId] = useState(null);
  const [auth, setAuth] = useState(initialAuth);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    apiJson("/banners").then(setBanners).catch(() => {});
  }, []);

  function openBand(id) {
    setSelectedBandId(id);
    setPage("band");
  }

  function handleLoggedIn({ role, bandId }) {
    setAuth({ role, bandId });
    setPage(role === "admin" ? "admin" : "edit");
  }

  function handleLogout() {
    setToken(null);
    setAuth({ role: null, bandId: null });
    setPage("home");
  }

  let content;
  if (page === "catalog") {
    content = <CatalogPage onOpenBand={openBand} />;
  } else if (page === "band") {
    content = <BandDetailPage bandId={selectedBandId} onBack={() => setPage("catalog")} />;
  } else if (page === "apply") {
    content = <ApplyPage />;
  } else if (page === "login") {
    content = auth.role ? (
      <AdminOrEdit auth={auth} />
    ) : (
      <LoginPage onLoggedIn={handleLoggedIn} />
    );
  } else if (page === "admin") {
    content = auth.role === "admin" ? <AdminPage /> : <LoginPage onLoggedIn={handleLoggedIn} />;
  } else if (page === "edit") {
    content =
      auth.role === "band" ? (
        <MusicianEditPage bandId={auth.bandId} />
      ) : (
        <LoginPage onLoggedIn={handleLoggedIn} />
      );
  } else {
    content = (
      <HomePage
        banners={banners}
        setPage={setPage}
        onOpenBand={openBand}
        isAuthed={!!auth.role}
        role={auth.role}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header page={page} setPage={setPage} isAuthed={!!auth.role} role={auth.role} onLogout={handleLogout} />
      {content}
    </div>
  );
}

function AdminOrEdit({ auth }) {
  return auth.role === "admin" ? <AdminPage /> : <MusicianEditPage bandId={auth.bandId} />;
}
