export const getUser =()=> {
    return JSON.parse(localStorage.getItem('user')) || null;
}

export const getToken = () => {
    return localStorage.getItem('token') || null;
}

export const logout =()=>{
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login'; // Redirect to login page
}