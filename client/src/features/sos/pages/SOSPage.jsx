import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Mail,
  Trash2,
  Plus,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { sosService } from "../../../services/sosService";
import { useAuth } from "../../../context/AuthContext";

const SOSPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", relation: "" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await sosService.getContacts();
      setContacts(res.data.contacts || []);
    } catch (err) {
      toast.error("Could not load emergency contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = async () => {
    if (contacts.length === 0) {
      toast.error("Add at least one emergency contact before triggering SOS.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setTriggering(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await sosService.triggerSOS(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setTriggered(true);
          toast.success(res.data.message);
        } catch (err) {
          toast.error(err.message || "Failed to send SOS.");
        } finally {
          setTriggering(false);
        }
      },
      () => {
        toast.error(
          "Could not get your location. Please allow location access.",
        );
        setTriggering(false);
      },
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Enter a valid email";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async () => {
    if (!validateForm()) return;
    setAddLoading(true);
    try {
      const res = await sosService.addContact(form);
      setContacts((prev) => [...prev, res.data.contact]);
      setForm({ name: "", email: "", relation: "" });
      setFormErrors({});
      setShowAddForm(false);
      toast.success("Emergency contact added.");
    } catch (err) {
      toast.error(err.message || "Could not add contact.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await sosService.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      toast.success("Contact removed.");
    } catch (err) {
      toast.error("Could not remove contact.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen dashboard-bg"
    >
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 tracking-tight text-sm">
              EkSathe
            </span>
          </div>
          <span className="text-stone-300">·</span>
          <span className="text-sm font-medium text-stone-600">
            SOS & Safety
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            SOS & Safety
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            One tap sends your live location to all emergency contacts via
            email.
          </p>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-stone-200 p-8 flex flex-col items-center text-center"
        >
          <AnimatePresence mode="wait">
            {triggered ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-700 mb-2">
                  SOS Alert Sent
                </h2>
                <p className="text-sm text-stone-500 mb-6">
                  Your location has been emailed to your emergency contacts.
                </p>
                <button
                  onClick={() => setTriggered(false)}
                  className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Reset
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="sos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Pulsing ring behind button */}
                <div className="relative mb-2">
                  {!triggering && contacts.length > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                  <button
                    onClick={handleSOS}
                    disabled={triggering}
                    className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 font-bold text-white text-xl shadow-xl transition-all select-none
                      ${
                        triggering
                          ? "bg-red-300 scale-95 cursor-not-allowed"
                          : contacts.length === 0
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 active:scale-95 hover:shadow-2xl"
                      }`}
                  >
                    {triggering ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-10 h-10" />
                        <span>SOS</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-stone-500 mt-4 leading-relaxed">
                  Press to send your live GPS location to{" "}
                  <span className="font-bold text-stone-700">
                    {contacts.length} emergency contact
                    {contacts.length !== 1 ? "s" : ""}
                  </span>
                </p>

                {contacts.length === 0 && (
                  <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      Add at least one emergency contact below to enable SOS.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-stone-200 p-5"
        >
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            How it works
          </h3>
          <div className="space-y-3">
            {[
              "Press the SOS button above",
              "Your browser shares your live GPS location",
              "An email is sent to all your emergency contacts",
              "Each email includes a clickable Google Maps link to your location",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emergency contacts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-stone-200 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-700">
                Emergency Contacts
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {contacts.length}/3 contacts added
              </p>
            </div>
            {contacts.length < 3 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 bg-stone-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add contact
              </button>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state with illustration */}
          {!loading && contacts.length === 0 && !showAddForm && (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 w-36 h-24">
                <svg
                  viewBox="0 0 150 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r="22"
                    fill="#fee2e2"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                  <circle cx="40" cy="32" r="8" fill="#fca5a5" />
                  <path
                    d="M22 58 Q40 48 58 58"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle
                    cx="110"
                    cy="40"
                    r="22"
                    fill="#fee2e2"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                  />
                  <circle cx="110" cy="32" r="8" fill="#fca5a5" />
                  <path
                    d="M92 58 Q110 48 128 58"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M58 42 L92 42"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <circle cx="75" cy="42" r="6" fill="#ef4444" />
                  <text
                    x="72"
                    y="46"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </svg>
              </div>
              <p className="text-sm font-semibold text-stone-600 mb-1">
                No emergency contacts yet
              </p>
              <p className="text-xs text-stone-400 leading-relaxed">
                Add up to 3 contacts who will receive your SOS alerts via email.
              </p>
            </div>
          )}

          {/* Contact list */}
          {!loading && contacts.length > 0 && (
            <div className="space-y-2 mb-4">
              <AnimatePresence>
                {contacts.map((contact) => (
                  <motion.div
                    key={contact._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-red-600">
                        {contact.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800">
                        {contact.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {contact.email}
                        {contact.relation && ` · ${contact.relation}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-stone-200 rounded-2xl p-4 mt-3 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-stone-700">
                    New contact
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormErrors({});
                    }}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Full name *"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address * (e.g. contact@gmail.com)"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Relation (optional — e.g. Mom, Friend)"
                    value={form.relation}
                    onChange={(e) =>
                      setForm({ ...form, relation: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddContact}
                    disabled={addLoading}
                    className="w-full bg-stone-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
                  >
                    {addLoading ? "Adding..." : "Add contact"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default SOSPage;
