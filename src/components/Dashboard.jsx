import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2, 
  Image as ImageIcon, 
  Trash2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { Button } from './UI';
import { formatDate } from '../lib/utils';

export const Dashboard = ({ onNewDesign }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Studio</h1>
          <p className="text-zinc-500 mt-1">Manage and revisit your AI-powered designs</p>
        </div>
        <Button onClick={onNewDesign} className="rounded-full px-6">
          <Plus className="w-5 h-5" />
          New Design
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-zinc-300" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-zinc-300 w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium">No designs yet</h3>
          <p className="text-zinc-500 mt-1 mb-6">Start by uploading a photo of your room</p>
          <Button variant="secondary" onClick={onNewDesign}>Create your first design</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div 
              layout
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={project.generated_image} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteProject(project.id)}
                    className="p-2 bg-white/90 backdrop-blur rounded-full text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur text-white text-[10px] uppercase tracking-widest font-bold rounded-full">
                    {project.style}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{project.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">{formatDate(project.created_at)}</span>
                </div>
                <p className="text-zinc-500 text-sm line-clamp-2 italic">"{project.prompt}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
