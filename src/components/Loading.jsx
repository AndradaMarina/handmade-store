import React from 'react';

const Loading = ({ 
  size = 'md', 
  text = 'Se încarcă...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Spinner */}
      <div className="relative">
        <div className={`animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 ${sizes[size]}`}></div>
        {/* Puncte rotative pentru un efect mai plăcut */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Text */}
      {text && (
        <p className={`text-gray-600 font-medium ${textSizes[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner />
    </div>
  );
};

// Loading pentru carduri/produse
export const CardLoading = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
          {/* Imagine */}
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          
          {/* Titlu */}
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          
          {/* Preț */}
          <div className="h-5 bg-purple-200 rounded w-1/3 mb-3"></div>
          
          {/* Buton */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

// Loading pentru liste
export const ListLoading = ({ rows = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading pentru formular
export const FormLoading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-12 bg-purple-200 rounded"></div>
    </div>
  );
};

// Loading pentru butoane
export const ButtonLoading = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      Se încarcă...
    </div>
  );
};

// Loading pentru tabel
export const TableLoading = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;