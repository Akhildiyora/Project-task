import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUserDataContext } from '../Context/UserDataContext';

export default function GoogleLoginBtn() {
    const { setUser } = useUserDataContext();
    const navigate = useNavigate();
    console.log("google client id ", import.meta.env.VITE_GOOGLE_CLIENT_ID)

    const handleGoogleResponse = useCallback(async (response) => {
        try {
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

            if (data.user) {
                setUser(data.user);
            }

            navigate('/dashboard');
        } catch (error) {
            console.error("Google login error:", error);
            alert(error.message);
        }
    }, [navigate, setUser]);

    useEffect(() => {
        const loadGoogleScript = () => {
            return new Promise((resolve) => {
                if (typeof window.google !== 'undefined') {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        };

        const initGoogle = async () => {
            await loadGoogleScript();
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