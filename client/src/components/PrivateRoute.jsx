// this is a wrapper component which wraps other component and only allows particular role based user to access the component

import React, { Children } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute =({children, allowedRoles})=>{
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user ? user.role : null;

    if(!token || !user){
        return <Navigate to='/login' />
    }

    if(!allowedRoles.includes(userRole)){
        return <Navigate to={`/${userRole}/dashboard`} />
    }

    return children;
}

export default PrivateRoute;
// Usage example:
// <PrivateRoute allowedRoles={['teacher']}>
//   <TeacherDashboard />
// </PrivateRoute>
// <PrivateRoute allowedRoles={['student']}>
//   <StudentDashboard />
// </PrivateRoute>