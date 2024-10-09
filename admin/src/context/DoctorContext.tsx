import { createContext } from "react";

export const DoctorContext = createContext({})

const DoctorContextProvider = (props: { children: React.ReactNode }) => {
    const value = {

    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider;