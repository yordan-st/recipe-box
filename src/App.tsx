import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Theme, Flex, Container } from '@radix-ui/themes'
import { RecipesListPage } from '@/pages/recipes-list'
import { AddRecipePage } from '@/pages/add-recipe'
import { WeeklyViewPage } from '@/pages/weekly-view'

function App() {
  return (
    <BrowserRouter>
      <Theme accentColor="orange" radius="medium" scaling="100%">
        <Flex direction="column" style={{ minHeight: '100vh' }}>
          <nav>
            <Container size="3">
              <Flex gap="4" align="center" py="3" px="4">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: '1.1rem' }}>
                  Recipe Box
                </Link>
                <Flex gap="3" ml="auto">
                  <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Recipes
                  </Link>
                  <Link to="/add" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Add Recipe
                  </Link>
                  <Link to="/weekly" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Weekly Plan
                  </Link>
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
      </Theme>
    </BrowserRouter>
  )
}

export default App
