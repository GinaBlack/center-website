import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase_config';

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  instructor: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
}

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchWorkshops();
  }, [selectedCategory]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const workshopsRef = collection(db, 'workshops');
      let q = query(workshopsRef, orderBy('date'), where('date', '>=', new Date().toISOString()));
      
      if (selectedCategory !== 'all') {
        q = query(q, where('category', '==', selectedCategory));
      }
      
      const querySnapshot = await getDocs(q);
      const workshopsData: Workshop[] = [];
      
      querySnapshot.forEach((doc) => {
        workshopsData.push({
          id: doc.id,
          ...doc.data()
        } as Workshop);
      });
      
      setWorkshops(workshopsData);
    } catch (err) {
      console.error('Error fetching workshops:', err);
      setError('Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', '3D Printing', 'CAD Design', 'Prototyping', 'Business', 'Technology'];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-lg">Loading workshops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Workshops & Events</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our hands-on workshops to learn practical skills and network with industry professionals.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Workshops Grid */}
        {workshops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No upcoming workshops found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {workshop.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={workshop.imageUrl} 
                      alt={workshop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{workshop.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {workshop.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{workshop.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {workshop.location}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {workshop.instructor}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {workshop.price > 0 ? `${workshop.price} XAF` : 'FREE'}
                    </span>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      onClick={() => {
                        if (!currentUser) {
                          alert('Please login to register for workshops');
                          return;
                        }
                        // Handle workshop registration
                        alert(`Registered for ${workshop.title}`);
                      }}
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopsPage;
