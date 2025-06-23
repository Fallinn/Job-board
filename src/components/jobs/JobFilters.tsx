
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, MapPin } from 'lucide-react';

interface JobFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    jobType: string[];
    experienceLevel: string[];
    location: string;
    remoteOnly: boolean;
  }) => void;
}

export const JobFilters = ({ onFiltersChange }: JobFiltersProps) => {
  const [search, setSearch] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' }
  ];

  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 
    'Kolkata', 'Ahmedabad', 'Gurgaon', 'Noida'
  ];

  const toggleFilter = (value: string, current: string[], setter: (arr: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(item => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const applyFilters = () => {
    onFiltersChange({
      search,
      jobType: jobTypes,
      experienceLevel: experienceLevels,
      location,
      remoteOnly,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setJobTypes([]);
    setExperienceLevels([]);
    setLocation('');
    setRemoteOnly(false);
    onFiltersChange({
      search: '',
      jobType: [],
      experienceLevel: [],
      location: '',
      remoteOnly: false,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm border border-orange-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <span className="text-gray-800">Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-gray-700 font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
            <Input
              id="search"
              type="text"
              placeholder="Job title, company, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">
            Job Type
          </Label>
          <div className="flex flex-wrap gap-2">
            {jobTypeOptions.map((type) => (
              <Badge
                key={type.value}
                variant={jobTypes.includes(type.value) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs transition-all duration-200 ${
                  jobTypes.includes(type.value) 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0' 
                    : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}
                onClick={() => toggleFilter(type.value, jobTypes, setJobTypes)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-gray-700 font-medium">
            Experience Level
          </Label>
          <div className="flex flex-wrap gap-2">
            {experienceOptions.map((level) => (
              <Badge
                key={level.value}
                variant={experienceLevels.includes(level.value) ? 'default' : 'outline'}
                className={`cursor-pointer text-xs transition-all duration-200 ${
                  experienceLevels.includes(level.value) 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0' 
                    : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}
                onClick={() => toggleFilter(level.value, experienceLevels, setExperienceLevels)}
              >
                {level.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label htmlFor="location" className="text-gray-700 font-medium">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
            <Input
              id="location"
              type="text"
              placeholder="City, state..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400"
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {popularCities.map((city) => (
              <Badge
                key={city}
                variant="outline"
                className="cursor-pointer text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={() => setLocation(city)}
              >
                {city}
              </Badge>
            ))}
          </div>
        </div>

        {/* Remote Work */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-gray-700 font-medium">
              Remote Jobs Only
            </span>
          </Label>
        </div>

        {/* Filter Actions */}
        <div className="flex space-x-2 pt-4 border-t border-orange-200">
          <Button 
            onClick={applyFilters} 
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
          >
            Apply Filters
          </Button>
          <Button 
            onClick={clearFilters} 
            variant="outline" 
            size="icon"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
