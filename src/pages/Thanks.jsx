import { useLocation, Link } from "react-router-dom";

const Thanks = () => {
  const location = useLocation();
  const nume = location.state?.nume;

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Mulțumim{nume ? `, ${nume}` : ""} pentru comandă!
      </h1>
      <p className="text-gray-700 text-lg">
        Comanda ta a fost înregistrată cu succes. Vei primi un email de confirmare în scurt timp.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
      >
        Înapoi la magazin
      </Link>
    </div>
  );
};

export default Thanks;
