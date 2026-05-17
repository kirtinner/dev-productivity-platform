import { useEffect, useState } from "react";
import AppNavigationShell from "./components/AppNavigationShell";
import ClientsPage from "./pages/ClientsPage";
import LoginPage from "./pages/LoginPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import ReportsPage from "./pages/ReportsPage";
import TasksPage from "./pages/TasksPage";
import TimeTrackingPage from "./pages/TimeTrackingPage";
import { getOrganizations } from "./services/organizationsService";
import { getSoftwareProducts } from "./services/softwareProductsService";

function App() {
    const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
    const [page, setPage] = useState("time-tracking");
    const [settingsOpenRequest, setSettingsOpenRequest] = useState(0);
    const [organizations, setOrganizations] = useState([]);
    const [currentOrganizationId, setCurrentOrganizationId] = useState(null);
    const [softwareProducts, setSoftwareProducts] = useState([]);

    useEffect(() => {
        let active = true;

        async function loadOrganizationsAndSettings() {
            try {
                const [nextOrganizations, nextSoftwareProducts] = await Promise.all([
                    getOrganizations(),
                    getSoftwareProducts()
                ]);

                if (!active) {
                    return;
                }

                setOrganizations(nextOrganizations);
                setCurrentOrganizationId(current => current ?? nextOrganizations[0]?.id ?? null);
                setSoftwareProducts(nextSoftwareProducts);
            } catch {
                if (!active) {
                    return;
                }
            }
        }

        loadOrganizationsAndSettings();

        return () => {
            active = false;
        };
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuth(false);
        setPage("time-tracking");
    };

    const handleOpenSettings = () => {
        setPage("time-tracking");
        setSettingsOpenRequest(current => current + 1);
    };

    const renderPage = () => {
        switch (page) {
            case "time-tracking":
                return (
                    <TimeTrackingPage
                        settingsOpenRequest={settingsOpenRequest}
                        organizations={organizations}
                        softwareProducts={softwareProducts}
                        currentOrganizationId={currentOrganizationId}
                        onCurrentOrganizationChange={setCurrentOrganizationId}
                        onSoftwareProductsChange={setSoftwareProducts}
                    />
                );
            case "reports":
                return <ReportsPage />;
            case "clients":
                return (
                    <ClientsPage
                        key={currentOrganizationId ?? "clients"}
                        organizations={organizations}
                        currentOrganizationId={currentOrganizationId}
                    />
                );
            case "projects":
                return (
                    <ProjectsPage
                        key={currentOrganizationId ?? "projects"}
                        organizations={organizations}
                        currentOrganizationId={currentOrganizationId}
                    />
                );
            case "tasks":
                return (
                    <TasksPage
                        key={currentOrganizationId ?? "tasks"}
                        organizations={organizations}
                        currentOrganizationId={currentOrganizationId}
                        softwareProducts={softwareProducts}
                    />
                );
            case "organizations":
                return <OrganizationsPage />;
            default:
                return (
                    <TimeTrackingPage
                        settingsOpenRequest={settingsOpenRequest}
                        organizations={organizations}
                        softwareProducts={softwareProducts}
                        currentOrganizationId={currentOrganizationId}
                        onCurrentOrganizationChange={setCurrentOrganizationId}
                        onSoftwareProductsChange={setSoftwareProducts}
                    />
                );
        }
    };

    return (
        <div>
            {isAuth ? (
                <AppNavigationShell
                    activePage={page}
                    onNavigate={setPage}
                    onOpenSettings={handleOpenSettings}
                    onLogout={logout}
                >
                    {renderPage()}
                </AppNavigationShell>
            ) : (
                <LoginPage
                    onLogin={() => {
                        setIsAuth(true);
                        setPage("time-tracking");
                    }}
                />
            )}
        </div>
    );
}

export default App;
