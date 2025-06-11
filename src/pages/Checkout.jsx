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
    reset,
    setValue
  } = useForm();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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

  // 🔒 Verifică autentificarea și coșul
  useEffect(() => {
    console.log("Auth user:", auth.currentUser);
    console.log("Cart contents:", cart);
    console.log("Is processing order:", isProcessingOrder);

    if (!auth.currentUser) {
      navigate("/login-client", { 
        state: { from: "/checkout", message: "Trebuie să fii logat pentru a plasa o comandă." }
      });
      return;
    }

    if (!isProcessingOrder && (!cart || cart.length === 0)) {
      console.log("Cart is empty and not processing, redirecting to cart page");
      navigate("/cart", { 
        state: { message: "Coșul tău este gol. Adaugă produse pentru a continua." }
      });
      return;
    }

    setLoading(false);
  }, [auth.currentUser, cart, navigate, isProcessingOrder]);

  // 📥 Preia și unifică datele utilizatorului din TOATE sursele
  useEffect(() => {
    const fetchAllUserData = async () => {
      if (!auth.currentUser || loading) return;

      try {
        console.log("Fetching user data for:", auth.currentUser.uid);

        // Structură finală pentru date
        let userData = {
          nume: "",
          email: auth.currentUser.email || "",
          telefon: "",
          adresa: "",
          observatii: "",
          cardNumber: "",
          cardName: "",
          expiryDate: "",
          cvv: ""
        };

        // 1. Încearcă să încarce din "utilizatori" (MyDetails format)
        try {
          const userDocRef = doc(db, "utilizatori", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userDoc = userDocSnap.data();
            console.log("Found utilizatori data:", userDoc);
            
            // Format MyDetails (nume, prenume, telefon)
            if (userDoc.nume && userDoc.prenume) {
              userData.nume = `${userDoc.prenume} ${userDoc.nume}`.trim();
            } else if (userDoc.firstName && userDoc.lastName) {
              // Format RegisterClient (firstName, lastName)
              userData.nume = `${userDoc.firstName} ${userDoc.lastName}`.trim();
            }
            
            if (userDoc.telefon || userDoc.telephone) {
              userData.telefon = userDoc.telefon || userDoc.telephone || "";
            }
            
            if (userDoc.email) {
              userData.email = userDoc.email;
            }
            
            // Adresă din utilizatori dacă există
            if (userDoc.address) {
              userData.adresa = userDoc.address;
            }
          }
        } catch (error) {
          console.log("No utilizatori document or error:", error);
        }

        // 2. Încearcă să încarce din "adrese" (AdressBook format)
        try {
          const addressDocRef = doc(db, "adrese", auth.currentUser.uid);
          const addressDocSnap = await getDoc(addressDocRef);
          
          if (addressDocSnap.exists()) {
            const addressDoc = addressDocSnap.data();
            console.log("Found adrese data:", addressDoc);
            
            // Suprascrie cu date din adrese (mai recente)
            if (addressDoc.nume && addressDoc.prenume) {
              userData.nume = `${addressDoc.prenume} ${addressDoc.nume}`.trim();
            }
            
            if (addressDoc.telefon) {
              userData.telefon = addressDoc.telefon;
            }
            
            if (addressDoc.adresa) {
              userData.adresa = addressDoc.adresa;
            }
          }
        } catch (error) {
          console.log("No adrese document or error:", error);
        }

        // 3. Încearcă să încarce din "plati" (PaymentAndBilling format)
        try {
          const paymentDocRef = doc(db, "plati", auth.currentUser.uid);
          const paymentDocSnap = await getDoc(paymentDocRef);
          
          if (paymentDocSnap.exists()) {
            const paymentDoc = paymentDocSnap.data();
            console.log("Found plati data:", paymentDoc);
            
            // Completează doar numele de pe card și data expirării
            if (paymentDoc.titular) {
              userData.cardName = paymentDoc.titular;
            }
            
            if (paymentDoc.expira) {
              userData.expiryDate = paymentDoc.expira;
            }
            
            // NU completăm numărul cardului din motive de securitate
          }
        } catch (error) {
          console.log("No plati document or error:", error);
        }

        // 4. Fallback la date din Firebase Auth
        if (!userData.nume && auth.currentUser.displayName) {
          userData.nume = auth.currentUser.displayName;
        }

        console.log("Final merged user data:", userData);

        // Aplică toate datele în formular
        Object.keys(userData).forEach(key => {
          if (userData[key]) {
            setValue(key, userData[key]);
          }
        });

      } catch (error) {
        console.error("Eroare la preluarea datelor utilizatorului:", error);
        setSubmitError("Eroare la încărcarea datelor. Te rugăm să reîmprospătezi pagina.");
      }
    };

    fetchAllUserData();
  }, [auth.currentUser, loading, setValue]);

  // 📨 Trimite comanda
  const onSubmit = async (data) => {
    setSubmitError("");
    setIsProcessingOrder(true);
    
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
        data: Timestamp.now(),
        uid: auth.currentUser.uid,
        procesata: false,
        livrata: false,
        status: "nou",
        metodaPlata: "card",
        numarProduse: itemsCount,
        
        // Date plată (fără a salva datele reale ale cardului)
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

      // 💾 SALVEAZĂ datele utilizatorului pentru viitor (OPTIONAL)
      try {
        // Actualizează adresa dacă este diferită
        const addressRef = doc(db, "adrese", auth.currentUser.uid);
        const currentAddressSnap = await getDoc(addressRef);
        
        if (!currentAddressSnap.exists() || currentAddressSnap.data().adresa !== data.adresa) {
          const [prenume, ...numeParts] = data.nume.split(' ');
          await setDoc(addressRef, {
            prenume: prenume || "",
            nume: numeParts.join(' ') || "",
            telefon: data.telefon,
            adresa: data.adresa,
            uid: auth.currentUser.uid
          });
          console.log("Updated user address for future orders");
        }
      } catch (error) {
        console.log("Could not save user data for future:", error);
        // Nu oprește procesul de comandă pentru această eroare
      }
      
      // ✅ NAVIGEAZĂ DIRECT
      navigate("/thanks", { 
        state: { 
          nume: data.nume,
          orderId: docRef.id,
          total: total,
          metodaPlata: "card"
        },
        replace: true
      });

      // ✅ Curăță totul DUPĂ navigare
      setTimeout(() => {
        clearCart();
        reset();
      }, 100);
      
    } catch (error) {
      console.error("Eroare la trimiterea comenzii:", error);
      setIsProcessingOrder(false);
      
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
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Se încarcă datele...</span>
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

      {/* Info box pentru autocompletare */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-800 text-sm">
            <strong>💡 Datele tale au fost precompletate</strong> din contul tău pentru o experiență mai rapidă!
          </p>
        </div>
      </div>

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