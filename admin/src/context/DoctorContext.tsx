import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

interface Appointment {
    _id: string;
    userId: string;
    docId: string;
    slotDate: string;
    slotTime: string;
    userData: Record<string, any>; // Assuming it's a dynamic object
    docData: Record<string, any>;  // Assuming it's a dynamic object
    amount: number;
    date: number;
    cancelled?: boolean; // Optional because of the default value
    payment?: boolean;   // Optional because of the default value
    isCompleted?: boolean; // Optional because of the default value
}

interface DoctorContextType {

    dToken: string;
    setDToken: (value: string) => void;
    backendUrl: string;
    appointments: Appointment[];
    setAppointments: (value: Appointment[]) => void;
    getAppointments: () => void;
    cancelAppointment: (appointmentId: string) => void;
    completeAppointment: (appointmentId: string) => void;
    dashData: any;
    setDashData: (value: boolean | Record<string, any>) => void;
    getDashData: () => void;
    profileData: any;
    setProfileData: (value: boolean | Record<string, any>) => void;
    getProfileData: () => void;
}

export const DoctorContext = createContext<DoctorContextType>({
    dToken: "",
    setDToken: () => { },
    backendUrl: "",
    appointments: [],
    setAppointments: () => { },
    getAppointments: () => { },
    cancelAppointment: () => { },
    completeAppointment: () => { },
    dashData: false,
    setDashData: () => { },
    getDashData: () => { },
    profileData: false,
    setProfileData: () => { },
    getProfileData: () => { },
});



const DoctorContextProvider = (props: { children: React.ReactNode }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState<string>(localStorage.getItem('dToken') || '')
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error: any) {
            // console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment = async (appointmentId: string) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {

                toast.error(data.message)
            }
        } catch (error: any) {
            // console.log(error)
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId: string) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {

                toast.error(data.message)
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })
            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })

            if (data.success) {
                setProfileData(data.profileData)
            } else {
                toast.error(data.message)
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value: any = {
        dToken,
        setDToken,
        backendUrl,
        appointments,
        setAppointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData

    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider;