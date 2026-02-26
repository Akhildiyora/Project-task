import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginBtn() {
    const navigate = useNavigate();
    console.log("google client id ", import.meta.env.VITE_GOOGLE_CLIENT_ID)

    const handleGoogleResponse = useCallback(async (response) => {

        const res = await fetch('http://localhost:3000/google-login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: response.credential })
        });

        const data = await res.json();
        console.log("Google login response:", data);
        if (!res.ok) {
            alert("Google login failed!");
            return;
        }

        navigate('/dashboard');
    }, [navigate]);

    useEffect(() => {

        const initGoogle = () => {
            if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "outline", size: "large" }
                );
            }
        };

        initGoogle();
    }, [handleGoogleResponse]);




    return (
        <div id="googleBtn" className="flex items-center justify-center cursor-pointer">
        </div>
    );
}