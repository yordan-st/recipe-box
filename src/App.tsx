import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Theme, Flex, Container } from '@radix-ui/themes'
import { InstallPrompt } from '@/components/install-prompt'
import { RecipesListPage } from '@/pages/recipes-list'
import { AddRecipePage } from '@/pages/add-recipe'
import { WeeklyViewPage } from '@/pages/weekly-view'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`nav-link${isActive ? ' nav-link-active' : ''}`}
    >
      {children}
    </Link>
  )
}

function AppLayout() {
  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <nav>
        <Container size="3">
          <Flex gap="4" align="center" py="3" px="4">
            <Link to="/" className="nav-link" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Recipe Box
            </Link>
            <Flex gap="3" ml="auto">
              <NavLink to="/">Recipes</NavLink>
              <NavLink to="/add">Add Recipe</NavLink>
              <NavLink to="/weekly">Weekly Plan</NavLink>
            </Flex>
          </Flex>
        </Container>
      </nav>

      <Container size="3" px="4" flexGrow="1" py="4">
        <Routes>
          <Route path="/" element={<RecipesListPage />} />
          <Route path="/add" element={<AddRecipePage />} />
          <Route path="/weekly" element={<WeeklyViewPage />} />
        </Routes>
      </Container>
    </Flex>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Theme accentColor="orange" radius="medium" scaling="100%">
        <AppLayout />
        <InstallPrompt />
      </Theme>
    </BrowserRouter>
  )
}

export default App
