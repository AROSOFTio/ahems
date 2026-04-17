import { AuthProvider } from "./context/AuthContext";
import { SimulationProvider } from "./context/SimulationContext";
import { UIProvider } from "./context/UIContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <UIProvider>
          <AppRouter />
        </UIProvider>
      </SimulationProvider>
    </AuthProvider>
  );
}

export default App;

