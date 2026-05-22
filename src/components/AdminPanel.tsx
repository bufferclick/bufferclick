import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { Project } from '../types';

export default function AdminPanel() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    redirectUrl: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated');
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }

    // Load projects
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsArray = Object.entries(data).map(([id, project]: [string, any]) => ({
          id,
          ...project,
        }));
        projectsArray.sort((a, b) => a.order - b.order);
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectsRef = ref(database, 'projects');
    const newProject = {
      ...formData,
      order: projects.length,
    };

    await push(projectsRef, newProject);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      redirectUrl: '',
    });
    setShowAddForm(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const projectRef = ref(database, `projects/${projectId}`);
      await remove(projectRef);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newProjects = [...projects];
    [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];
    
    // Update orders in Firebase
    const updates: any = {};
    newProjects.forEach((project, idx) => {
      updates[`projects/${project.id}/order`] = idx;
    });
    
    await update(ref(database), updates);
  };

  const handleMoveDown = async (index: number) => {
    if (index === projects.length - 1) return;
    
    const newProjects = [...projects];
    [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
    
    // Update orders in Firebase
    const updates: any = {};
    newProjects.forEach((project, idx) => {
      updates[`projects/${project.id}/order`] = idx;
    });
    
    await update(ref(database), updates);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
              >
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-white text-white font-bold rounded hover:bg-white hover:text-black transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Project Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-8 px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add New Project'}
        </button>

        {/* Add Project Form */}
        {showAddForm && (
          <div className="bg-white text-black rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none h-24"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Redirect URL</label>
                <input
                  type="url"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800 transition-colors"
              >
                Add Project
              </button>
            </form>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Manage Projects ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No projects yet. Add your first project above!
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="bg-white text-black rounded-lg p-4 flex items-center gap-4"
                >
                  {/* Project Image */}
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  {/* Project Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">{project.description}</p>
                    <a
                      href={project.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      {project.redirectUrl}
                    </a>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`px-3 py-1 rounded font-bold ${
                        index === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === projects.length - 1}
                      className={`px-3 py-1 rounded font-bold ${
                        index === projects.length - 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
