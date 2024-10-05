import { createContext, ReactNode } from "react";
import { doctors } from "../assets/assets";

interface AppContextType {
    doctors: typeof doctors;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = (props: { children: ReactNode }) => {
    const value = {
        doctors
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;