import { createContext } from "react";

export const AppContext = createContext({})

const AppContextProvider = (props: { children: React.ReactNode }) => {
    const value = {

    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;