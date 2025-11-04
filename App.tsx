import React, { useState, useCallback } from 'react';
import { generateProductSpecifications } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { ProductSpecificationsOutput } from './types';

const App: React.FC = () => {
  const [productDescription, setProductDescription] = useState<string>('');
  const [specifications, setSpecifications] = useState<ProductSpecificationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [englishCopied, setEnglishCopied] = useState<boolean>(false);
  const [arabicCopied, setArabicCopied] = useState<boolean>(false);

  const handleGenerateSpecs = useCallback(async () => {
    setError(null);
    setSpecifications(null);
    setEnglishCopied(false);
    setArabicCopied(false);
    if (!productDescription.trim()) {
      setError('Please enter a product description.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateProductSpecifications({ productDescription });
      setSpecifications(result);
    } catch (err: any) {
      console.error("Failed to generate specifications:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [productDescription]);

  const handleClearData = useCallback(() => {
    setProductDescription('');
    setSpecifications(null);
    setError(null);
    setEnglishCopied(false);
    setArabicCopied(false);
  }, []);

  const handleCopyText = useCallback(async (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally, show a temporary error message to the user
    }
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 w-full max-w-3xl border border-gray-200">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 text-center">
        Product Spec Generator
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-md mx-auto">
        Enter a detailed product description below, and I'll generate a comprehensive list of specifications in bullet points in both English and Arabic.
      </p>

      <div className="mb-6">
        <label htmlFor="productDescription" className="block text-gray-700 text-sm font-semibold mb-2">
          Product Description:
        </label>
        <textarea
          id="productDescription"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-y min-h-[150px]"
          rows={7}
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="e.g., 'A portable Bluetooth speaker with 20-hour battery life, IPX7 waterproof rating, dual passive radiators, and USB-C charging. It supports aptX codec and can pair with another speaker for stereo sound.'"
          disabled={isLoading}
        ></textarea>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="sticky bottom-0 bg-white pt-4 -mx-6 md:-mx-8 px-6 md:px-8 pb-4 border-t border-gray-200 flex justify-center space-x-4">
        <button
          onClick={handleClearData}
          className={`
            w-full md:w-auto px-8 py-3 rounded-full text-gray-700 font-bold text-lg
            transition-all duration-300 ease-in-out shadow-md
            ${isLoading
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75'}
          `}
          disabled={isLoading}
        >
          Clear Data
        </button>
        <button
          onClick={handleGenerateSpecs}
          className={`
            w-full md:w-auto px-8 py-3 rounded-full text-white font-bold text-lg
            transition-all duration-300 ease-in-out shadow-md
            ${isLoading
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75'}
          `}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Specifications'}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}

      {specifications && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Product Specifications:</h2>
          
          {specifications.englishSpecs && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-700">English:</h3>
                <button
                  onClick={() => handleCopyText(specifications.englishSpecs, setEnglishCopied)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-1"
                >
                  {englishCopied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0-4h.01M12 15h.01" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base bg-gray-100 p-4 rounded-md">
                {specifications.englishSpecs}
              </pre>
            </div>
          )}

          {specifications.arabicSpecs && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-700">Arabic:</h3>
                <button
                  onClick={() => handleCopyText(specifications.arabicSpecs, setArabicCopied)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-1"
                >
                  {arabicCopied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0-4h.01M12 15h.01" />
                      </svg>
                      نسخ
                    </>
                  )}
                </button>
              </div>
              <pre 
                className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base text-right rtl bg-gray-100 p-4 rounded-md"
                dir="rtl" // Explicitly set text direction for Arabic
              >
                {specifications.arabicSpecs}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;