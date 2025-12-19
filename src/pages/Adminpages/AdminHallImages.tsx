// pages/AdminHallImages.tsx
import React, { useState, useEffect } from 'react';
import GitHubImageManager from '../../components/GithubImageManger';
import { db, collection, getDocs, doc, updateDoc } from '../../firebase/firebase_config';

const AdminHallImages = () => {
  const [halls, setHalls] = useState<any[]>([]);
  const [selectedHall, setSelectedHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const hallsSnapshot = await getDocs(collection(db, 'halls'));
      const hallsList: any[] = [];
      hallsSnapshot.forEach(doc => {
        hallsList.push({ id: doc.id, ...doc.data() });
      });
      setHalls(hallsList);
    } catch (error) {
      console.error('Error fetching halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHallImages = async (hallId: string, imageNames: string[]) => {
    try {
      const hallRef = doc(db, 'halls', hallId);
      await updateDoc(hallRef, {
        images: imageNames,
        updatedAt: new Date().toISOString()
      });
      
      alert('Images updated successfully!');
      fetchHalls(); // Refresh list
    } catch (error) {
      console.error('Error updating hall images:', error);
      alert('Failed to update images');
    }
  };

  if (loading) {
    return <div>Loading halls...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Hall Images</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hall List */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Select Hall</h2>
            <div className="space-y-2">
              {halls.map(hall => (
                <button
                  key={hall.id}
                  onClick={() => setSelectedHall(hall)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedHall?.id === hall.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium">{hall.name}</div>
                  <div className="text-sm opacity-80">
                    {hall.images?.length || 0} images
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Manager */}
        <div className="lg:col-span-2">
          {selectedHall ? (
            <GitHubImageManager
              hallId={selectedHall.id}
              onImagesUpdated={(imageNames) => 
                updateHallImages(selectedHall.id, imageNames)
              }
              existingImages={selectedHall.images || []}
            />
          ) : (
            <div className="bg-card rounded-lg border p-12 text-center">
              <div className="text-muted-foreground">
                Select a hall from the left to manage its images
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
          <li>Select a hall from the left panel</li>
          <li>Choose images from your computer</li>
          <li>Follow the instructions to upload to GitHub</li>
          <li>After uploading to GitHub, click "Mark as Uploaded"</li>
          <li>The images will be automatically linked to the hall</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminHallImages;