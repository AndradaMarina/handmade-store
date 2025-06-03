import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ADMIN_UID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2"; // UID-ul tău personal

const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = în curs de verificare

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return <p className="text-center mt-10">Se verifică accesul...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.uid !== ADMIN_UID) {
    return (
      <div className="text-center mt-10 text-red-600 font-semibold">
        Acces interzis – nu ai permisiuni de administrator.
      </div>
    );
  }

  return children;
};

export default AdminRoute;
