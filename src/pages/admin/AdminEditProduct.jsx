import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import ProductForm from "../../components/ProductForm";

const AdminEditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "produse", id));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
    };
    fetch();
  }, [id]);

  if (!product) return <p className="p-4">Se încarcă...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">Editează produsul</h1>
      <ProductForm product={product} />
    </div>
  );
};

export default AdminEditProduct;
