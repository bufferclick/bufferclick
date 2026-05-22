import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsArray = Object.entries(data).map(([id, project]: [string, any]) => ({
          id,
          ...project,
        }));
        // Sort by order
        projectsArray.sort((a, b) => a.order - b.order);
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProjectClick = (redirectUrl: string) => {
    window.open(redirectUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">My Projects</h1>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {projects.length === 0 ? (
          <div className="text-center text-xl text-gray-400 mt-20">
            No projects yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.redirectUrl)}
                className="bg-white text-black rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
              >
                {/* Project Image */}
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Project Info */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                  <p className="text-gray-700">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
