import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { useEffect, useState } from "react";

const LoginDetails = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Ascultă autentificarea
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleResetPassword = async () => {
    setStatus("");
    setError("");
    if (!user?.email) {
      setError("Nu există email asociat contului.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      setStatus("Emailul de resetare a fost trimis cu succes.");
    } catch (err) {
      console.error("Reset error:", err.message);
      setError("A apărut o eroare la trimiterea emailului.");
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-purple-800">Date de autentificare</h2>

      <div className="text-gray-700">
        <p>
          <span className="font-medium">Email:</span> {user?.email || "necunoscut"}
        </p>
      </div>

      <button
        onClick={handleResetPassword}
        disabled={!user?.email}
        className={`px-4 py-2 rounded transition text-white ${
          user?.email
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Schimbă parola
      </button>

      <div aria-live="polite">
        {status && <p className="text-green-600 text-sm">{status}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default LoginDetails;
