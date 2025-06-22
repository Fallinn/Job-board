import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Briefcase, 
  Users, 
  Shield, 
  Heart, 
  Globe, 
  Target,
  CheckCircle,
  Mail
} from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    {
      question: "What is JobHub India?",
      answer: "JobHub India is a premier job portal designed to connect talented professionals with leading companies across India. We specialize in bridging the gap between job seekers and employers, offering a comprehensive platform for career advancement and recruitment solutions."
    },
    {
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click on 'Sign Up' in the top navigation, fill in your details including name, email, and password. You can then complete your profile with your skills, experience, and preferences to get better job matches."
    },
    {
      question: "Is JobHub India free to use?",
      answer: "Yes! JobHub India is completely free for job seekers. You can browse jobs, apply to positions, and manage your applications at no cost. Employers have access to basic posting features with premium options available for enhanced visibility."
    },
    {
      question: "How do I apply for jobs?",
      answer: "Once you're logged in, browse through our job listings, use filters to find relevant positions, and click 'Apply Now' on any job that interests you. Make sure your profile is complete for the best application experience."
    },
    {
      question: "Can companies post jobs for free?",
      answer: "Yes, companies can post jobs for free on JobHub India. Simply create an employer account, complete your company profile, and start posting job openings. We also offer premium features for enhanced job visibility and candidate management."
    },
    {
      question: "How do I edit or delete my job posts?",
      answer: "Navigate to the 'Post Job' section where you can view all your active job postings. Each job listing has options to edit details or delete the posting entirely. Changes are reflected immediately on the platform."
    },
    {
      question: "What types of jobs are available?",
      answer: "JobHub India features a wide range of opportunities including full-time, part-time, contract, and freelance positions across various industries such as IT, finance, healthcare, marketing, education, and many more."
    },
    {
      question: "How do I search for remote jobs?",
      answer: "Use our advanced filters to search specifically for remote positions. Check the 'Remote Jobs Only' option in the filters section, or look for jobs marked with the 'Remote OK' badge in job listings."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We take data privacy seriously and implement industry-standard security measures to protect your personal information. Your data is encrypted and we never share your details without your explicit consent."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team through the contact information provided below, or use the contact form on our website. We're here to help with any questions or issues you may encounter."
    }
  ];

  const features = [
    {
      icon: Target,
      title: "Smart Job Matching",
      description: "Our AI-powered algorithm matches you with relevant job opportunities based on your skills and preferences."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security measures and encryption protocols."
    },
    {
      icon: Users,
      title: "Trusted by Companies",
      description: "Over 500+ companies trust JobHub India for their recruitment needs across various industries."
    },
    {
      icon: Globe,
      title: "Pan-India Coverage",
      description: "Find opportunities across 50+ cities in India, from metros to emerging business hubs."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl opacity-90">
            Everything you need to know about JobHub India
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* About Section */}
        <Card className="mb-12 bg-gradient-to-br from-white to-orange-50/30 border border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl">
              <Briefcase className="h-8 w-8 text-orange-600" />
              <span>About JobHub India</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To empower careers and transform businesses by creating meaningful connections 
                  between talented professionals and forward-thinking companies across India. 
                  We believe that the right opportunity can change lives and drive innovation.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Our Vision
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To become India's most trusted and comprehensive career platform, 
                  where every professional finds their ideal role and every company 
                  discovers exceptional talent that drives their success.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose JobHub India?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border border-orange-200">
                <CardContent className="pt-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Common Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-orange-200 rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-gray-900 hover:text-orange-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="mb-6 opacity-90">Our support team is here to help you succeed</p>
            <div className="flex justify-center items-center">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>aeshakul17@gmail.com</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          © 2025 JobHub India. Created by Gauravi.
        </div>
      </div>
    </div>
  );
};
