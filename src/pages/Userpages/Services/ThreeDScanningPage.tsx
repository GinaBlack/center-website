import { motion } from "framer-motion";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Scan, Layers,  FileCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { db } from "../../../firebase/firebase_config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ThreeDScanningPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    objectDescription: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "3d_scanning_requests"), {
        ...formData,
        createdAt: Timestamp.now()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', objectDescription: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      {/* Hero and Services Sections (unchanged) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">3D Scanning Services</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Convert physical objects into precise digital 3D models using advanced scanning technologies for design, analysis, reverse engineering, and rapid prototyping.</p>
      </motion.div>

      {/* Services Overview and Process Sections remain unchanged */}

      {/* Booking / Request Form Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-10">
            <h3 className="text-2xl font-semibold mb-4 text-center">Request 3D Scanning Service</h3>
            {success && <p className="text-green-600 text-center mb-4">Your request has been submitted successfully!</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg" />
              <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg" />
              <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg" />
              <input type="text" name="objectDescription" placeholder="Object Description" required value={formData.objectDescription} onChange={handleChange} className="w-full p-3 border rounded-lg" />
              <textarea name="message" placeholder="Additional Notes" rows={4} value={formData.message} onChange={handleChange} className="w-full p-3 border rounded-lg"></textarea>
              <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
