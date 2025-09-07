import React, { useState } from 'react';
import type { ContactInfo } from '../../types';

interface ContactSectionProps {
  contact: ContactInfo;
}

/**
 * Contact section with copy-to-clipboard functionality
 */
const ContactSection: React.FC<ContactSectionProps> = ({ contact }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const generateVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL:${contact.email}
URL:${contact.website || ''}
NOTE:Full Stack Developer
ADR:;;${contact.location};;;;
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'john-doe.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Get In Touch
      </h2>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send me a message</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                {contact.email}
              </span>
              <button
                onClick={() => copyToClipboard(contact.email, 'email')}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Copy email address"
              >
                {copiedField === 'email' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = `mailto:${contact.email}`}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Send Email
              </button>
              <button
                onClick={() => copyToClipboard(contact.email, 'email-alt')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {copiedField === 'email-alt' ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">LinkedIn</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Professional network</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-gray-100 text-sm">
                /in/johndoe
              </span>
              <button
                onClick={() => copyToClipboard(contact.linkedin, 'linkedin')}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Copy LinkedIn URL"
              >
                {copiedField === 'linkedin' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <button
              onClick={() => openLink(contact.linkedin)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              View Profile
            </button>
          </div>
        </div>

        {/* GitHub */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">GitHub</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Code repositories</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-gray-100 text-sm">
                @johndoe
              </span>
              <button
                onClick={() => copyToClipboard(contact.github, 'github')}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                title="Copy GitHub URL"
              >
                {copiedField === 'github' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <button
              onClick={() => openLink(contact.github)}
              className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-md hover:bg-gray-900 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              View Repositories
            </button>
          </div>
        </div>

        {/* Website */}
        {contact.website && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Website</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personal portfolio</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <span className="text-gray-900 dark:text-gray-100 text-sm">
                  {contact.website.replace('https://', '')}
                </span>
                <button
                  onClick={() => copyToClipboard(contact.website!, 'website')}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  title="Copy website URL"
                >
                  {copiedField === 'website' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <button
                onClick={() => openLink(contact.website!)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Visit Website
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location & vCard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Location</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently based in</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            📍 {contact.location}
          </span>
          <button
            onClick={generateVCard}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
            title="Download contact card"
          >
            Download vCard
          </button>
        </div>
      </div>

      {/* Contact Form CTA */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
        <h3 className="text-xl font-semibold mb-2">
          Let's Work Together
        </h3>
        <p className="mb-4 opacity-90">
          I'm always interested in new opportunities and exciting projects.
        </p>
        <button
          onClick={() => window.location.href = `mailto:${contact.email}?subject=Let's work together`}
          className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
        >
          Start a Conversation
        </button>
      </div>
    </div>
  );
};

export default ContactSection;