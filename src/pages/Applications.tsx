import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { FileText, Building2, MapPin, DollarSign, Clock, Calendar, Trash2 } from 'lucide-react';

type JobApplication = Tables<'job_applications'> & {
  jobs: (Tables<'jobs'> & {
    companies: Tables<'companies'> | null;
  }) | null;
};

export const Applications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchApplications();
    
    // Set up real-time subscription for application updates
    const channel = supabase
      .channel('applications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applications',
          filter: `applicant_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time application update:', payload);
          if (payload.eventType === 'DELETE') {
            // Remove deleted application from local state
            setApplications(prev => prev.filter(app => app.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching applications for user:', user.id);
      
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            *,
            companies (*)
          )
        `)
        .eq('applicant_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching applications:', error);
        throw error;
      }
      
      console.log('Fetched applications:', data);
      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error loading applications",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!user) return;
    
    console.log('Withdrawing application:', applicationId, 'for user:', user.id);
    
    try {
      // First, optimistically remove from UI
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      
      // Then delete from database
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId)
        .eq('applicant_id', user.id);

      if (error) {
        console.error('Supabase error withdrawing application:', error);
        // Revert the optimistic update if there's an error
        fetchApplications();
        throw error;
      }

      console.log('Application withdrawn successfully');
      
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
    } catch (error: any) {
      console.error('Error withdrawing application:', error);
      toast({
        title: "Error withdrawing application",
        description: error.message || "Failed to withdraw application",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span>My Job Applications ({applications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-20 w-20 text-orange-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Applications Yet</h3>
                <p className="text-gray-600 mb-6">You haven't applied to any jobs yet. Start exploring opportunities!</p>
                <Button 
                  onClick={() => navigate('/')} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application.id} className="border border-orange-200 rounded-lg p-6 bg-white/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {application.jobs?.title || 'Job Title Not Available'}
                        </h3>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{application.jobs?.companies?.name || 'Company'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(application.status || 'pending')}>
                          {application.status || 'pending'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdrawApplication(application.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Withdraw
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{application.jobs?.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {formatSalary(
                            application.jobs?.salary_min, 
                            application.jobs?.salary_max, 
                            application.jobs?.currency || 'INR'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {application.jobs?.job_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {application.jobs?.experience_level}
                      </Badge>
                      {application.jobs?.remote_ok && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Remote OK
                        </Badge>
                      )}
                    </div>

                    {application.cover_letter && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Cover Letter:</h4>
                        <p className="text-gray-700 text-sm">{application.cover_letter}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-4">
                      <Clock className="h-3 w-3" />
                      <span>Job posted {application.jobs?.created_at ? new Date(application.jobs.created_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          © 2025 JobHub India. Created by Gauravi.
        </div>
      </div>
    </div>
  );
};
