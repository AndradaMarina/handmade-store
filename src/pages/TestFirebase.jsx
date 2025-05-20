import { auth } from '../firebase/config';

const TestFirebase = () => {
  const user = auth.currentUser;

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Firebase e conectat!</h1>
      <p className="mt-4 text-gray-700">
        {user ? `Utilizator logat: ${user.email}` : 'Niciun utilizator logat'}
      </p>
    </div>
  );
};

export default TestFirebase;
