import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
    const [authenticated, setAuthenticated] = useState(null)

    const checkAuth = async () => {
        try {
            await axios.get("http://localhost:5000/api/v1/auth/me", { withCredentials: true })
            setAuthenticated(true)
        } catch (err) {
            setAuthenticated(false)
        }
    }

    useEffect(() => {
        checkAuth();
    }, [])
  
    if (authenticated === null) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-800'>
                <div className='flex flex-col items-center gap-3'>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
                        <svg className="h-6 w-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div className='flex items-center gap-2 text-xs font-medium text-neutral-500'>
                        <svg className="h-4 w-4 animate-spin text-neutral-700" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Verifying session...</span>
                    </div>
                </div>
            </div>
        )
    }

    return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoutes