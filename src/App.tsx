import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Theme, Flex, Container, IconButton, Text } from "@radix-ui/themes";
import {
  SunIcon,
  MoonIcon,
  ReaderIcon,
  PlusIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { InstallPrompt } from "@/components/install-prompt";
import { LoginScreen } from "@/components/login-screen";
import { SyncStatusIndicator } from "@/components/sync-status-indicator";
import { useAuth } from "@/hooks/useAuth";
import { startSyncScheduler } from "@/lib/sync/sync-scheduler";
import { t } from "@/lib/i18n";
const RecipesListPage = lazy(() =>
  import("@/pages/recipes-list").then((m) => ({ default: m.RecipesListPage })),
);
const AddRecipePage = lazy(() =>
  import("@/pages/add-recipe").then((m) => ({ default: m.AddRecipePage })),
);
const WeeklyViewPage = lazy(() =>
  import("@/pages/weekly-view").then((m) => ({ default: m.WeeklyViewPage })),
);

function getInitialAppearance(): "light" | "dark" {
  const stored = localStorage.getItem("theme-appearance");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-link${isActive ? " nav-link-active" : ""}`}>
      {children}
    </Link>
  );
}

function BottomNav() {
  const location = useLocation();
  const items = [
    {
      to: "/",
      icon: <ReaderIcon width={20} height={20} />,
      label: t.navRecipes,
    },
    { to: "/add", icon: <PlusIcon width={20} height={20} />, label: t.navAdd },
    {
      to: "/weekly",
      icon: <CalendarIcon width={20} height={20} />,
      label: t.navMenu,
    },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon, label }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`bottom-nav-item${isActive ? " bottom-nav-active" : ""}`}
          >
            {icon}
            <Text size="1">{label}</Text>
          </Link>
        );
      })}
    </nav>
  );
}

function AppLayout({
  appearance,
  toggleAppearance,
}: {
  appearance: "light" | "dark";
  toggleAppearance: () => void;
}) {
  return (
    <Flex direction="column" style={{ minHeight: "100vh" }}>
      <nav className="top-nav">
        <Container size="2">
          <Flex gap="4" align="center" py="3" px="5">
            <Link
              to="/"
              className="nav-link"
              style={{ fontWeight: 600, fontSize: "1.1rem", padding: 0 }}
            >
              {t.appName}
            </Link>
            {/* Desktop nav */}
            <Flex gap="3" ml="auto" align="center" className="nav-desktop">
              <NavLink to="/">{t.navRecipes}</NavLink>
              <NavLink to="/add">{t.navAdd}</NavLink>
              <NavLink to="/weekly">{t.navMenu}</NavLink>
              <SyncStatusIndicator />
              <IconButton
                size="2"
                variant="ghost"
                onClick={toggleAppearance}
                aria-label={t.toggleDarkMode}
              >
                {appearance === "dark" ? <SunIcon /> : <MoonIcon />}
              </IconButton>
            </Flex>

            {/* Mobile top-right: sync + theme only */}
            <Flex ml="auto" align="center" gap="2" className="nav-mobile">
              <SyncStatusIndicator />
              <IconButton
                size="2"
                variant="ghost"
                onClick={toggleAppearance}
                aria-label={t.toggleDarkMode}
              >
                {appearance === "dark" ? <SunIcon /> : <MoonIcon />}
              </IconButton>
            </Flex>
          </Flex>
        </Container>
      </nav>

      <Container size="2" flexGrow="1" py="4" pb="6" className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<div />}>
            <Routes>
              <Route path="/" element={<RecipesListPage />} />
              <Route path="/add" element={<AddRecipePage />} />
              <Route path="/weekly" element={<WeeklyViewPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Container>

      {/* Mobile bottom nav */}
      <BottomNav />
    </Flex>
  );
}

function App() {
  const { state: authState, login } = useAuth();
  const [appearance, setAppearance] = useState<"light" | "dark">(
    getInitialAppearance,
  );

  useEffect(() => {
    if (authState === "authenticated") {
      startSyncScheduler();
    }
  }, [authState]);

  const toggleAppearance = useCallback(() => {
    setAppearance((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme-appearance", next);
      return next;
    });
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        appearance === "dark" ? "#1c1c1e" : "#e07a3a",
      );
    }
  }, [appearance]);

  if (authState === "loading") {
    return (
      <Theme
        accentColor="orange"
        appearance={appearance}
        radius="medium"
        scaling="100%"
      >
        <div />
      </Theme>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <Theme
        accentColor="orange"
        appearance={appearance}
        radius="medium"
        scaling="100%"
      >
        <LoginScreen onLogin={login} />
      </Theme>
    );
  }

  return (
    <BrowserRouter>
      <Theme
        accentColor="orange"
        appearance={appearance}
        radius="medium"
        scaling="100%"
      >
        <AppLayout
          appearance={appearance}
          toggleAppearance={toggleAppearance}
        />
        <InstallPrompt />
        <Toaster richColors position="bottom-right" theme={appearance} />
      </Theme>
    </BrowserRouter>
  );
}

export default App;
