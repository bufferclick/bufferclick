import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="w-48 h-48 rounded-full bg-white overflow-hidden border-4 border-white shadow-2xl">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=bufferclick"
              alt="bufferclick"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Introduction Text */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">
            Hello, I'm <span className="text-white">bufferclick</span>
          </h1>
          <p className="text-2xl text-gray-300">
            I'm from Sweden and I love to make stuff
          </p>
        </div>

        {/* Browse Projects Button */}
        <button
          onClick={() => navigate('/projects')}
          className="mt-8 px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
        >
          Browse My Projects
        </button>
      </div>
    </div>
  );
}
