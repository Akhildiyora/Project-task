import { createContext, useState, useEffect, useContext } from 'react';
import { useUserDataContext } from './UserDataContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, loading: userLoading } = useUserDataContext();
    const [projects, setProjects] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;

        if (!user) {
            setProjects([]);
            setDataLoading(false);
            return;
        }

        const fetchProjects = async () => {
            setDataLoading(true);
            try {
                const response = await fetch('http://localhost:3000/projects', { credentials: 'include' });
                if (response.ok) {
                    const projectData = await response.json();
                    setProjects(projectData);
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error("Error fetching project data:", error);
                setProjects([]);
            } finally {
                setDataLoading(false);
            }
        };

        fetchProjects();
    }, [user, userLoading]);

    return (
        <DataContext.Provider value={{ projects, setProjects, dataLoading }}>
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