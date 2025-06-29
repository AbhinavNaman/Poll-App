// To avoid repeating Authorization: Bearer token everywhere, we will craete a custom fetch function
export const API_BASE = process.env.BASE_URL;

export const getToken =()=> localStorage.getItem('token') || null;

export const fetchWithAuth = async (URL, options ={}) => {
    const token = getToken();
    return fetch(`${API_BASE}${URL}`, {
        ...options, //spread operator
        headers:{
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
}