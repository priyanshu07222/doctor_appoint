import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

interface typeOfAdminContext {
    aToken: string,
    setAToken: (token: string) => void, // corrected type for setAToken
    backendUrl: string,
    doctors: any[], // or you can specify the type for doctors
    getAllDoctors: () => Promise<void>, // async function should return a Promise<void>
    changeAvailability: (docId: string) => Promise<void> // async function returning a promise
}

// Initialize context with default values
export const AdminContext = createContext<typeOfAdminContext>({
    aToken: '',
    setAToken: () => {},
    backendUrl: '',
    doctors: [],
    getAllDoctors: async () => {},
    changeAvailability: async () => {}
});

const AdminContextProvider = (props: { children: React.ReactNode }) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [doctors, setDoctors] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendUrl + 'api/admin/all-doctors', {}, { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors);
                console.log(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const changeAvailability = async (docId: string) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    const value = {
        aToken,
        setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
}

export default AdminContextProvider;
