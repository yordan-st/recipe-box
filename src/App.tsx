import { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Theme, Flex, Container, IconButton, DropdownMenu } from "@radix-ui/themes";
import { SunIcon, MoonIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { InstallPrompt } from "@/components/install-prompt";
import { RecipesListPage } from "@/pages/recipes-list";
import { AddRecipePage } from "@/pages/add-recipe";
import { WeeklyViewPage } from "@/pages/weekly-view";

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

function AppLayout({
  appearance,
  toggleAppearance,
}: {
  appearance: "light" | "dark";
  toggleAppearance: () => void;
}) {
  return (
    <Flex direction="column" style={{ minHeight: "100vh" }}>
      <nav>
        <Container size="3">
          <Flex gap="4" align="center" py="3" px="4">
            <Link
              to="/"
              className="nav-link"
              style={{ fontWeight: 600, fontSize: "1.1rem" }}
            >
              Recipe Box
            </Link>
            {/* Desktop nav */}
            <Flex gap="3" ml="auto" align="center" className="nav-desktop">
              <NavLink to="/">Recipes</NavLink>
              <NavLink to="/add">Add</NavLink>
              <NavLink to="/weekly">Menu</NavLink>
              <IconButton
                size="2"
                variant="ghost"
                onClick={toggleAppearance}
                aria-label="Toggle dark mode"
              >
                {appearance === "dark" ? <SunIcon /> : <MoonIcon />}
              </IconButton>
            </Flex>

            {/* Mobile nav */}
            <Flex ml="auto" align="center" gap="2" className="nav-mobile">
              <IconButton
                size="2"
                variant="ghost"
                onClick={toggleAppearance}
                aria-label="Toggle dark mode"
              >
                {appearance === "dark" ? <SunIcon /> : <MoonIcon />}
              </IconButton>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton size="2" variant="ghost" aria-label="Menu">
                    <HamburgerMenuIcon />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item asChild>
                    <Link to="/" className="nav-dropdown-link">Recipes</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link to="/add" className="nav-dropdown-link">Add Recipe</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link to="/weekly" className="nav-dropdown-link">Weekly Menu</Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Flex>
        </Container>
      </nav>

      <Container size="3" px="4" flexGrow="1" py="4">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<RecipesListPage />} />
            <Route path="/add" element={<AddRecipePage />} />
            <Route path="/weekly" element={<WeeklyViewPage />} />
          </Routes>
        </ErrorBoundary>
      </Container>
    </Flex>
  );
}

function App() {
  const [appearance, setAppearance] = useState<"light" | "dark">(
    getInitialAppearance
  );

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
        appearance === "dark" ? "#1c1c1e" : "#e07a3a"
      );
    }
  }, [appearance]);

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
