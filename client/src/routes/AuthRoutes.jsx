import React from 'react'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import Dashboard from '../pages/Dashboard'
import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoutes from '../components/ProtectedRoutes'

const router = createBrowserRouter([
    {
        element:<ProtectedRoutes/>,
        children:[
            {
                path:"/",
                element:<Dashboard/>
            }
        ]
    },
    {
        path:"/signup",
        element:<SignupPage/>
    },
    {
        path:"/login",
        element:<LoginPage/>
    }
])


export default router;