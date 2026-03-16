import { createContext, useState, useEffect, useContext } from 'react';
import { useUserDataContext } from './UserDataContext';
const API = import.meta.env.VITE_BACKEND_API;

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, loading: userLoading } = useUserDataContext();
    const [projects, setProjects] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    const fetchProjects = async () => {

        if (!user) {
            setProjects([]);
            setDataLoading(false);
            return;
        }

        try {
            setDataLoading(true);
            const response = await fetch(`${API}/projects`, { credentials: 'include' });
            if (response.ok) {
                const projectData = await response.json();
                setProjects(projectData);
            } else {
                throw new Error("failed to fetch projects")
            }
        } catch (error) {
            console.error("Error fetching project data:", error);
            setProjects([]);
        } finally {
            setDataLoading(false);
        }
    };

    
    useEffect(() => {
        if (!userLoading && user) {
            fetchProjects();
        }
    }, [user, userLoading]);



return (
    <DataContext.Provider value={{ projects, setProjects, setDataLoading, dataLoading, refetchProjects: fetchProjects }}>
        {children}
    </DataContext.Provider>
);
};

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useDataContext must be used within a DataProvider");
    }
    return context;
};