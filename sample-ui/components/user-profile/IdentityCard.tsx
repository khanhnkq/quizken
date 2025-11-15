
import React from 'react';
import type { UserProfile } from '../types';
import { SignatureIcon, WatermarkIcon, BarcodeIcon } from './Icons';

interface IdentityCardProps {
  user: UserProfile;
  theme: 'blue' | 'pink';
}

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="w-full">
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-lg font-medium text-black -mt-1">{value}</p>
    <div className="border-b border-gray-300 w-full mt-1"></div>
  </div>
);

export const IdentityCard: React.FC<IdentityCardProps> = ({ user, theme }) => {
  const themeClasses = {
    blue: {
      gradient: 'from-blue-400 to-purple-500',
      photoBorder: 'border-blue-400/50',
      classBorder: 'border-blue-500',
      watermarkText: 'text-blue-200/50',
    },
    pink: {
      gradient: 'from-pink-400 to-fuchsia-500',
      photoBorder: 'border-pink-400/50',
      classBorder: 'border-pink-500',
      watermarkText: 'text-pink-200/50',
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className="w-full max-w-lg mx-auto font-sans shadow-2xl rounded-2xl overflow-hidden bg-stone-50 flex flex-col aspect-[85.6/54]">
      <header className="px-5 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700">YJM LOVERS CLUB</h1>
          <h2 className="text-sm font-semibold text-gray-500 tracking-[0.2em]">IDENTITY CARD</h2>
        </div>
      </header>
      
      <main className="flex-grow flex px-5 pb-3 gap-4 relative">
        <div className="w-1/3 flex-shrink-0">
          <img 
            src={user.photoUrl} 
            alt={user.name} 
            className={`w-full h-full object-cover rounded-lg border-4 ${currentTheme.photoBorder}`} 
          />
        </div>
        
        <div className="w-2/3 flex flex-col justify-between relative">
          <div className="flex flex-col items-start space-y-2">
            <div className={`border-2 ${currentTheme.classBorder} rounded-full px-4 py-0.5`}>
              <span className={`font-bold text-sm ${currentTheme.classBorder.replace('border-', 'text-')}`}>CLASS '00</span>
            </div>
            
            <div className="w-full flex space-x-4">
                <div className="flex-1 flex flex-col space-y-2">
                    <InfoField label="Name" value={user.name} />
                    <InfoField label="Nationality" value={user.nationality} />
                </div>
                 <div className="flex-1 flex flex-col space-y-2">
                    <InfoField label="Member No." value={user.memberNo} />
                    <InfoField label="Date of Birth" value={user.dateOfBirth} />
                </div>
            </div>

            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Signature</p>
                <SignatureIcon className="w-32 h-12 -ml-2" />
                 <div className="border-b border-gray-300 w-full mt-1"></div>
            </div>
          </div>
          <WatermarkIcon className={`absolute bottom-0 right-0 w-20 h-20 ${currentTheme.watermarkText}`} />
        </div>
      </main>

      <footer className={`h-16 flex-shrink-0 bg-gradient-to-r ${currentTheme.gradient} flex items-center justify-end px-5`}>
          <div className="flex flex-col items-center">
             <BarcodeIcon />
             <div className="flex justify-between w-full mt-1">
                <span className="text-white text-[10px] font-mono">{user.name}</span>
                <span className="text-white text-[10px] font-mono">00</span>
             </div>
          </div>
      </footer>
    </div>
  );
};
