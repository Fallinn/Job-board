import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { PlusCircle, Building2, MapPin, DollarSign, Trash2, Edit, Clock, Briefcase } from 'lucide-react';

type Job = Tables<'jobs'> & {
  companies: Tables<'companies'> | null;
};

export const Hire = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    currency: 'INR',
    remote_ok: false,
    skills_required: '',
    requirements: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserJobs();
  }, [user, navigate]);

  const fetchUserJobs = async () => {
    if (!user) return;
    
    setLoadingJobs(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (*)
        `)
        .eq('posted_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching user jobs:', error);
      toast({
        title: "Error loading your jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // First, create or get company
      let companyId = null;
      
      if (formData.company_name.trim()) {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', formData.company_name.trim())
          .single();
        
        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: formData.company_name.trim(),
            })
            .select('id')
            .single();
          
          if (companyError) throw companyError;
          companyId = newCompany.id;
        }
      }

      // Create job posting
      const jobData = {
        title: formData.title,
        description: formData.description,
        company_id: companyId,
        location: formData.location,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        currency: formData.currency,
        remote_ok: formData.remote_ok,
        skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
        posted_by: user.id,
        is_active: true
      };

      const { error } = await supabase
        .from('jobs')
        .insert(jobData);

      if (error) throw error;

      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and visible to candidates.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        company_name: '',
        location: '',
        job_type: '',
        experience_level: '',
        salary_min: '',
        salary_max: '',
        currency: 'INR',
        remote_ok: false,
        skills_required: '',
        requirements: ''
      });

      // Refresh user jobs
      fetchUserJobs();

    } catch (error: any) {
      console.error('Error posting job:', error);
      toast({
        title: "Error posting job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!user) return;
    
    try {
      console.log('Attempting to deactivate job:', jobId, 'for user:', user.id);
      
      // Update the job to set is_active to false instead of deleting
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: false })
        .eq('id', jobId)
        .eq('posted_by', user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Job Removed",
        description: "Your job posting has been removed successfully.",
      });

      // Remove the job from the state immediately
      setUserJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error: any) {
      console.error('Error removing job:', error);
      toast({
        title: "Error removing job",
        description: error.message || "Failed to remove job posting",
        variant: "destructive",
      });
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string = 'INR') => {
    if (!min && !max) return 'Salary Negotiable';
    
    const formatNumber = (num: number) => {
      if (currency === 'INR') {
        if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      } else {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      }
      return num.toString();
    };

    const symbol = currency === 'INR' ? '₹' : '$';
    
    if (min && max) {
      return `${symbol}${formatNumber(min)} - ${symbol}${formatNumber(max)}`;
    }
    return `${symbol}${formatNumber(min || max!)}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Job Posting Form */}
          <Card className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
                <span>Post a New Job</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="e.g. Tech Solutions Inc"
                    required
                  />
                </div>

                {/* Job Type and Experience Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select value={formData.job_type} onValueChange={(value) => handleInputChange('job_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select value={formData.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                  />
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label>Salary Range (Annual)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => handleInputChange('salary_min', e.target.value)}
                      placeholder="Min salary"
                    />
                    <Input
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => handleInputChange('salary_max', e.target.value)}
                      placeholder="Max salary"
                    />
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remote Work */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={formData.remote_ok}
                    onChange={(e) => handleInputChange('remote_ok', e.target.checked)}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <Label htmlFor="remote">Remote work allowed</Label>
                </div>

                {/* Skills Required */}
                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills_required}
                    onChange={(e) => handleInputChange('skills_required', e.target.value)}
                    placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                  />
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    rows={4}
                    required
                  />
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="List requirements (one per line)"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3"
                >
                  {isSubmitting ? 'Posting Job...' : 'Post Job'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Your Posted Jobs */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <span>Your Posted Jobs ({userJobs.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingJobs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading your jobs...</p>
                  </div>
                ) : userJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No jobs posted yet</p>
                    <p className="text-sm text-gray-500">Create your first job posting using the form</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userJobs.map((job) => (
                      <div key={job.id} className="border border-orange-200 rounded-lg p-4 bg-white/50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{job.title}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Building2 className="h-4 w-4" />
                              <span>{job.companies?.name || 'Company'}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location || 'Remote'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatSalary(job.salary_min, job.salary_max, job.currency || 'INR')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {job.job_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {job.experience_level}
                            </Badge>
                            {job.remote_ok && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Remote OK
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          © 2025 JobHub India. Created by Gauravi.
        </div>
      </div>
    </div>
  );
};
