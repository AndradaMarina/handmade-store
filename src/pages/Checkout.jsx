import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/config";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";

const Checkout = () => {
  const { cart, clearCart, getCartTotal, getCartItemsCount } = useCart();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset
  } = useForm();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [loading, setLoading] = useState(true);
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // Flag nou!

  // Validări personalizate
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || "Format email invalid";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+4|4|0)[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, '')) || "Numărul de telefon nu este valid";
  };

  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.length === 16 && /^\d+$/.test(cleaned) || "Numărul cardului trebuie să aibă 16 cifre";
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv) || "CVV-ul trebuie să aibă 3-4 cifre";
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(date)) return "Formatul trebuie să fie MM/YY";
    
    const [month, year] = date.split('/').map(num => parseInt(num));
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Cardul a expirat";
    }
    
    return true;
  };

  // 🔒 Verifică autentificarea și coșul - DAR NU în timpul procesării!
  useEffect(() => {
    console.log("Auth user:", auth.currentUser);
    console.log("Cart contents:", cart);
    console.log("Cart length:", cart?.length);
    console.log("Is processing order:", isProcessingOrder);

    if (!auth.currentUser) {
      navigate("/login-client", { 
        state: { from: "/checkout", message: "Trebuie să fii logat pentru a plasa o comandă." }
      });
      return;
    }

    // ✅ DOAR verifică coșul dacă NU procesează comanda
    if (!isProcessingOrder && (!cart || cart.length === 0)) {
      console.log("Cart is empty and not processing, redirecting to cart page");
      navigate("/cart", { 
        state: { message: "Coșul tău este gol. Adaugă produse pentru a continua." }
      });
      return;
    }

    setLoading(false);
  }, [auth.currentUser, cart, navigate, isProcessingOrder]);

  // 📥 Preia datele utilizatorului
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser || loading) return;

      try {
        const docRef = doc(db, "utilizatori", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          reset({
            nume: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            email: data.email || auth.currentUser.email || "",
            telefon: data.telephone || "",
            adresa: data.address || "",
            observatii: "",
            cardNumber: "",
            cardName: "",
            expiryDate: "",
            cvv: ""
          });
        } else {
          reset({
            nume: auth.currentUser.displayName || "",
            email: auth.currentUser.email || "",
            telefon: "",
            adresa: "",
            observatii: "",
            cardNumber: "",
            cardName: "",
            expiryDate: "",
            cvv: ""
          });
        }
        setUserDataLoaded(true);
      } catch (error) {
        console.error("Eroare la preluarea datelor utilizatorului:", error);
        setSubmitError("Eroare la încărcarea datelor. Te rugăm să reîmprospătezi pagina.");
        setUserDataLoaded(true);
      }
    };

    fetchUserData();
  }, [auth.currentUser, reset, loading]);

  // 📨 Trimite comanda
  const onSubmit = async (data) => {
    setSubmitError("");
    setIsProcessingOrder(true); // ✅ Setează flag-ul ÎNAINTE de orice
    
    try {
      const total = getCartTotal();
      const itemsCount = getCartItemsCount();
      
      console.log("Submitting order with data:", data);
      console.log("Cart total:", total);
      console.log("Items count:", itemsCount);
      
      // Pregătește datele pentru comandă cu cantități corecte
      const orderData = {
        // Date personale
        nume: data.nume,
        email: data.email,
        telefon: data.telefon,
        adresa: data.adresa,
        observatii: data.observatii || "",
        
        // Date comandă
        produse: cart.map(item => ({
          ...item,
          quantity: item.quantity || 1,
          subtotal: item.price * (item.quantity || 1)
        })),
        total: total,
        dataCreare: Timestamp.now(),
        data: Timestamp.now(), // Pentru compatibilitate cu cod existent
        uid: auth.currentUser.uid,
        procesata: false,
        livrata: false,
        status: "nou",
        metodaPlata: "card", // ✅ DOAR CARD
        numarProduse: itemsCount,
        
        // Date plată (fără a salva datele reale ale cardului din motive de securitate)
        plataSumar: {
          metodaPlata: "card",
          ultimeleCifre: data.cardNumber ? data.cardNumber.slice(-4) : "",
          statusPlata: "procesata",
          dataPlata: Timestamp.now()
        }
      };

      console.log("Order data to be saved:", orderData);

      // Simulăm procesarea plății
      console.log("Processing card payment...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Salvează comanda în Firestore
      const docRef = await addDoc(collection(db, "comenzi"), orderData);
      console.log("Order saved with ID:", docRef.id);
      
      // ✅ NAVIGEAZĂ DIRECT, fără clearCart aici!
      navigate("/thanks", { 
        state: { 
          nume: data.nume,
          orderId: docRef.id,
          total: total,
          metodaPlata: "card"
        },
        replace: true // ✅ Înlocuiește pagina în istoric
      });

      // ✅ Doar DUPĂ navigare curăță totul
      setTimeout(() => {
        clearCart();
        reset();
      }, 100);
      
    } catch (error) {
      console.error("Eroare la trimiterea comenzii:", error);
      setIsProcessingOrder(false); // ✅ Resetează flag-ul la eroare
      
      // Mesaje de eroare mai specifice
      if (error.code === 'permission-denied') {
        setSubmitError("Nu aveți permisiunea să plasați această comandă. Verificați dacă sunteți logat.");
      } else if (error.code === 'unavailable') {
        setSubmitError("Serviciul este temporar indisponibil. Încercați din nou în câteva minute.");
      } else {
        setSubmitError("A apărut o eroare la procesarea comenzii. Te rugăm să încerci din nou.");
      }
    }
  };

  // Funcție pentru formatarea numărului de card
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Loading state
  if (loading || !userDataLoaded) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Se încarcă...</span>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const itemsCount = getCartItemsCount();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        💳 Finalizare comandă cu cardul
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formularul - 2/3 din spațiu */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {/* Date personale */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Date personale</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume complet *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.nume ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register("nume", { 
                      required: "Numele este obligatoriu",
                      minLength: { value: 2, message: "Numele trebuie să aibă cel puțin 2 caractere" }
                    })}
                  />
                  {errors.nume && (
                    <p className="text-red-500 text-sm mt-1">{errors.nume.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register("email", { 
                      required: "Emailul este obligatoriu",
                      validate: validateEmail
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.telefon ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0722 123 456"
                  {...register("telefon", { 
                    required: "Numărul de telefon este obligatoriu",
                    validate: validatePhone
                  })}
                />
                {errors.telefon && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefon.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresă de livrare *
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.adresa ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Strada, numărul, orașul, județul, codul poștal"
                  {...register("adresa", { 
                    required: "Adresa de livrare este obligatorie",
                    minLength: { value: 10, message: "Adresa trebuie să fie mai detaliată" }
                  })}
                />
                {errors.adresa && (
                  <p className="text-red-500 text-sm mt-1">{errors.adresa.message}</p>
                )}
              </div>
            </div>

            {/* Date card - DOAR CARD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Date card</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numărul cardului *
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register("cardNumber", { 
                      required: "Numărul cardului este obligatoriu",
                      validate: validateCardNumber,
                      onChange: (e) => {
                        e.target.value = formatCardNumber(e.target.value);
                      }
                    })}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numele de pe card *
                  </label>
                  <input
                    type="text"
                    placeholder="IONESCU MARIA"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.cardName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register("cardName", { 
                      required: "Numele de pe card este obligatoriu",
                      minLength: { value: 2, message: "Numele trebuie să aibă cel puțin 2 caractere" }
                    })}
                  />
                  {errors.cardName && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data expirării *
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register("expiryDate", { 
                        required: "Data expirării este obligatorie",
                        validate: validateExpiryDate,
                        onChange: (e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.substring(0, 2) + '/' + value.substring(2, 4);
                          }
                          e.target.value = value;
                        }
                      })}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="4"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register("cvv", { 
                        required: "CVV-ul este obligatoriu",
                        validate: validateCVV
                      })}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <p className="text-xs text-green-800">
                    🔒 <strong>Securitate:</strong> Datele cardului sunt procesate securizat. 
                    Nu salvăm informațiile cardului în baza noastră de date.
                  </p>
                </div>
              </div>
            </div>

            {/* Observații */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💭 Observații</h2>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Instrucțiuni speciale pentru livrare..."
                {...register("observatii")}
              />
            </div>

            {/* Butoane */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                ← Înapoi la coș
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Se procesează plata...
                  </span>
                ) : (
                  `Plătește cu cardul - ${total.toFixed(2)} lei`
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sumar comandă - 1/3 din spațiu */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">📋 Sumar comandă</h2>
            
            <div className="space-y-3 mb-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-purple-600"> × {item.quantity}</span>
                    )}
                    {item.variant && (
                      <div className="text-xs text-gray-500">({item.variant})</div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {(item.price * (item.quantity || 1)).toFixed(2)} lei
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Produse ({itemsCount}):</span>
                <span>{total.toFixed(2)} lei</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Livrare:</span>
                <span>GRATUITĂ</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-purple-700 pt-2 border-t">
                <span>Total:</span>
                <span>{total.toFixed(2)} lei</span>
              </div>
            </div>

            {/* Informații livrare */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">ℹ️ Informații</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Plată securizată cu cardul</li>
                <li>• Livrare gratuită în toată țara</li>
                <li>• Timp de livrare: 2-5 zile lucrătoare</li>
                <li>• Returnare în 14 zile</li>
                <li>• Suport: 0723 456 789</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;