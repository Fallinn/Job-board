
-- Create user profiles table with image storage
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  skills TEXT[],
  experience_level TEXT,
  profile_image_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  size TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  job_type TEXT NOT NULL, -- full-time, part-time, contract, freelance
  experience_level TEXT NOT NULL, -- entry, mid, senior
  location TEXT,
  remote_ok BOOLEAN DEFAULT false,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  posted_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, reviewed, shortlisted, rejected
  cover_letter TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(job_id, applicant_id)
);

-- Create storage bucket for profile images and resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Company creators can update" ON public.companies FOR UPDATE USING (true);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Job posters can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = posted_by);

-- Job applications policies
CREATE POLICY "Users can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications FOR SELECT USING (
  auth.uid() IN (SELECT posted_by FROM public.jobs WHERE id = job_id)
);
CREATE POLICY "Users can apply to jobs" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Users can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = applicant_id);

-- Storage policies for profile images
CREATE POLICY "Users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Users can update own profile images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own profile images" ON storage.objects FOR DELETE USING (
  bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for resumes
CREATE POLICY "Users can upload resumes" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view own resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own resumes" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own resumes" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some sample companies
INSERT INTO public.companies (name, description, logo_url, location, size, industry) VALUES
('TechCorp', 'Leading technology company focused on innovation and digital transformation', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&crop=center', 'San Francisco, CA', '1000-5000', 'Technology'),
('DesignStudio', 'Creative design agency specializing in modern digital experiences', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&fit=crop&crop=center', 'New York, NY', '50-200', 'Design'),
('DataCorp', 'Data analytics and AI solutions provider', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center', 'Austin, TX', '200-1000', 'Analytics'),
('StartupLab', 'Innovation hub for emerging technologies', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100&h=100&fit=crop&crop=center', 'Remote', '10-50', 'Startup');

-- Insert some sample jobs
INSERT INTO public.jobs (company_id, title, description, requirements, skills_required, job_type, experience_level, location, remote_ok, salary_min, salary_max) VALUES
((SELECT id FROM public.companies WHERE name = 'TechCorp'), 'Senior Frontend Developer', 'Join our team to build cutting-edge web applications using React and TypeScript. You will work on user-facing features that impact millions of users worldwide.', ARRAY['5+ years of frontend development experience', 'Strong knowledge of React and TypeScript', 'Experience with modern build tools', 'Understanding of responsive design'], ARRAY['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'], 'full-time', 'senior', 'San Francisco, CA', true, 120000, 160000),
((SELECT id FROM public.companies WHERE name = 'DesignStudio'), 'UX/UI Designer', 'Create beautiful and intuitive user experiences for web and mobile applications. Collaborate with product and engineering teams to bring designs to life.', ARRAY['3+ years of UX/UI design experience', 'Proficiency in Figma or Sketch', 'Strong portfolio showcasing design process', 'Understanding of user-centered design principles'], ARRAY['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research'], 'full-time', 'mid', 'New York, NY', false, 80000, 110000),
((SELECT id FROM public.companies WHERE name = 'DataCorp'), 'Data Scientist', 'Analyze complex datasets to derive actionable insights and build predictive models. Work with cross-functional teams to solve business problems using data.', ARRAY['Masters degree in Data Science or related field', 'Experience with Python and R', 'Knowledge of machine learning algorithms', 'Strong statistical analysis skills'], ARRAY['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'], 'full-time', 'mid', 'Austin, TX', true, 95000, 130000),
((SELECT id FROM public.companies WHERE name = 'StartupLab'), 'Full Stack Developer', 'Build and maintain web applications from front to back. Work in a fast-paced startup environment with cutting-edge technologies.', ARRAY['2+ years of full stack development', 'Experience with React and Node.js', 'Knowledge of databases and APIs', 'Ability to work in agile environment'], ARRAY['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'AWS'], 'full-time', 'entry', 'Remote', true, 70000, 95000),
((SELECT id FROM public.companies WHERE name = 'TechCorp'), 'Product Manager', 'Lead product strategy and roadmap for our core platform. Work closely with engineering, design, and business teams to deliver exceptional user experiences.', ARRAY['3+ years of product management experience', 'Strong analytical and problem-solving skills', 'Experience with agile development', 'Excellent communication skills'], ARRAY['Product Strategy', 'Agile', 'Analytics', 'Leadership', 'Communication'], 'full-time', 'mid', 'San Francisco, CA', true, 110000, 140000),
((SELECT id FROM public.companies WHERE name = 'DesignStudio'), 'Frontend Developer', 'Implement responsive and interactive user interfaces using modern web technologies. Collaborate with designers to create pixel-perfect experiences.', ARRAY['2+ years of frontend development', 'Strong HTML, CSS, and JavaScript skills', 'Experience with React or Vue.js', 'Eye for design and attention to detail'], ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'SASS'], 'contract', 'entry', 'New York, NY', false, 60000, 80000);
