import { createContext } from "react";

export const AppContext = createContext({
    calculateAge: (dob: Date):any => { },
    slotDateFormat: (slotDate: string):any => { },
    currency: '$'
})

const AppContextProvider = (props: { children: React.ReactNode }) => {

    const calculateAge = (dob: Date):number => {
        const today = new Date()
        const birthDate = new Date(dob)

        const age = today.getFullYear() - birthDate.getFullYear()

        return age
    }

    const currency = '$'

    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


    const slotDateFormat = (slotDate: string) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    }
    const value = {
        calculateAge,
        slotDateFormat,
        currency
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;