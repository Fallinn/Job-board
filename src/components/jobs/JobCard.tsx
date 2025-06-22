
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Building2, BadgeIndianRupee } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Job = Tables<'jobs'> & {
  companies: Tables<'companies'> | null;
};

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
}

export const JobCard = ({ job, onApply, showApplyButton = true }: JobCardProps) => {
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

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'Full-time',
      'part-time': 'Part-time', 
      'contract': 'Contract',
      'freelance': 'Freelance'
    };
    return types[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level'
    };
    return levels[level] || level;
  };

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border border-orange-200 hover:border-orange-400 bg-gradient-to-br from-white to-orange-50/30 backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {job.companies?.logo_url && (
              <img
                src={job.companies.logo_url}
                alt={job.companies.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-orange-200 shadow-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <Building2 className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{job.companies?.name || 'Company'}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 border border-orange-300 text-xs"
                >
                  {getExperienceLabel(job.experience_level)}
                </Badge>
              </div>
            </div>
          </div>
          <Badge
            variant={job.job_type === 'full-time' ? 'default' : 'secondary'}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 font-medium"
          >
            {getJobTypeLabel(job.job_type)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {job.skills_required?.slice(0, 3).map((skill) => (
            <Badge 
              key={skill} 
              variant="outline" 
              className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {skill}
            </Badge>
          ))}
          {job.skills_required && job.skills_required.length > 3 && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              +{job.skills_required.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{job.location || 'Remote'}</span>
              {job.remote_ok && (
                <Badge variant="secondary" className="text-xs ml-2 bg-green-100 text-green-800 border border-green-300">
                  Remote OK
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-orange-100">
          <div className="flex items-center space-x-2">
            <BadgeIndianRupee className="h-5 w-5 text-green-600" />
            <span className="font-bold text-lg text-green-700">
              {formatSalary(job.salary_min, job.salary_max, job.currency || 'INR')}
            </span>
            <span className="text-xs text-gray-500">per year</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            
            {showApplyButton && onApply && (
              <Button
                onClick={() => onApply(job.id)}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                size="sm"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
