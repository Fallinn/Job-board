import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Search, MapPin, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Job = Tables<'jobs'> & {
  companies: Tables<'companies'> | null;
};

export const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    
    // Set up real-time subscription for job updates
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Real-time job update:', payload);
          fetchJobs(); // Refresh jobs when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Only show user's posted jobs if logged in, otherwise show no jobs
      if (user) {
        query = query.eq('posted_by', user.id);
      } else {
        // Return empty array if no user is logged in
        setJobs([]);
        setFilteredJobs([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;

      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (filters: {
    search: string;
    jobType: string[];
    experienceLevel: string[];
    location: string;
    remoteOnly: boolean;
  }) => {
    let filtered = [...jobs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.companies?.name.toLowerCase().includes(searchLower) ||
        job.skills_required?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (filters.jobType.length > 0) {
      filtered = filtered.filter(job => filters.jobType.includes(job.job_type));
    }

    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter(job => filters.experienceLevel.includes(job.experience_level));
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters.remoteOnly) {
      filtered = filtered.filter(job => job.remote_ok);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to apply for jobs.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Applied",
            description: "You have already applied for this job.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = [
    { icon: Briefcase, label: "My Jobs", value: filteredJobs.length.toString() },
    { icon: Users, label: "Companies", value: "500+" },
    { icon: MapPin, label: "Cities", value: "50+" },
    { icon: TrendingUp, label: "Success Rate", value: "85%" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
            🇮🇳 JobHub India
          </h1>
          <p className="text-xl md:text-3xl mb-8 opacity-90 font-medium">
            {user ? "Manage Your Job Postings" : "Find Your Dream Career in India"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <stat.icon className="h-8 w-8 text-yellow-300" />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-90">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!user && (
            <div className="space-x-4">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 text-lg"
                onClick={() => navigate('/auth')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user ? "Your Posted Jobs" : "Latest Jobs"}
              </h2>
              <p className="text-gray-600">
                {filteredJobs.length} jobs available
              </p>
            </div>

            {!user ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200">
                <Search className="h-20 w-20 text-orange-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">Please sign in</h3>
                <p className="text-gray-600 mb-6">Sign in to view and manage your job postings.</p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Sign In
                </Button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200">
                <Search className="h-20 w-20 text-orange-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No jobs posted yet</h3>
                <p className="text-gray-600 mb-6">Start by creating your first job posting.</p>
                <Button 
                  onClick={() => navigate('/hire')} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Post a Job
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    showApplyButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 via-orange-500 to-red-600 py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            🚀 Build Your Career in India
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect with top companies and make your dreams come true
          </p>
          <div className="text-white/80 text-sm">
            © 2025 JobHub India. Created by Gauravi.
          </div>
        </div>
      </footer>
    </div>
  );
};
