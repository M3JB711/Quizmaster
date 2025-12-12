import React, { useState } from 'react';
import { AppStep, QuizConfig, QuizQuestion, FileData } from './types';
import FileUpload from './components/FileUpload';
import QuizView from './components/QuizView';
import ResultsView from './components/ResultsView';
import AdSpace from './components/AdSpace';
import { generateQuiz } from './services/geminiService';
import { translations, Language } from './translations';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  // Language state lifted to App level
  const [language, setLanguage] = useState<Language>('English');
  const [config, setConfig] = useState<QuizConfig>({ 
    questionCount: 10, 
    language: 'English',
    viewMode: 'all',
    assessmentType: 'quiz'
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = translations[language];
  const isArabic = language === 'Arabic';
  const dir = isArabic ? 'rtl' : 'ltr';

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'English' ? 'Arabic' : 'English');
  };

  const handleStartQuiz = async (files: FileData[], partialConfig: Omit<QuizConfig, 'language'>) => {
    // Combine partial config with current global language
    const fullConfig: QuizConfig = { ...partialConfig, language };
    
    setConfig(fullConfig);
    setStep(AppStep.LOADING);
    setErrorMsg(null);

    try {
      const generatedQuestions = await generateQuiz(files, fullConfig);
      setQuestions(generatedQuestions);
      setStep(AppStep.QUIZ);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected error occurred.");
      setStep(AppStep.ERROR);
    }
  };

  const handleQuizComplete = (answers: Record<number, number>) => {
    setUserAnswers(answers);
    setStep(AppStep.RESULTS);
  };

  const handleRestart = () => {
    setQuestions([]);
    setUserAnswers({});
    setStep(AppStep.UPLOAD);
    setErrorMsg(null);
  };

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-800 ${isArabic ? 'font-sans' : ''} flex flex-col`} dir={dir}>
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <i className={`fas fa-brain text-indigo-600 text-2xl ${isArabic ? 'ml-3' : 'mr-3'}`}></i>
              <span className="font-bold text-xl tracking-tight text-slate-800">{t.appTitle}</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleLanguage}
                className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors font-medium px-3 py-1 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200"
              >
                <i className="fas fa-globe text-xl mx-2"></i>
                <span>{language === 'English' ? 'العربية' : 'English'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* Primary Column */}
          <div className="lg:col-span-9 w-full">
            {step === AppStep.UPLOAD && (
              <div className="fade-in">
                 <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{t.turnContent}</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      {t.uploadDesc}
                    </p>
                 </div>
                 <FileUpload 
                   onStartQuiz={handleStartQuiz} 
                   isLoading={false} 
                   language={language}
                 />
              </div>
            )}

            {step === AppStep.LOADING && (
               <div className="flex flex-col items-center justify-center py-20 fade-in">
                  <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.generating}</h2>
                  <p className="text-slate-500 animate-pulse">{t.loadingDesc}</p>
               </div>
            )}

            {step === AppStep.QUIZ && (
              <QuizView 
                questions={questions} 
                config={config} 
                onComplete={handleQuizComplete} 
              />
            )}

            {step === AppStep.RESULTS && (
              <ResultsView 
                questions={questions} 
                userAnswers={userAnswers} 
                config={config}
                onRestart={handleRestart}
              />
            )}

            {step === AppStep.ERROR && (
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden text-center p-8 border border-red-100">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">{t.generationFailed}</h3>
                 <p className="text-slate-600 mb-6">{errorMsg || t.generationFailed}</p>
                 <button 
                   onClick={handleRestart}
                   className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                 >
                   {t.tryAgain}
                 </button>
              </div>
            )}
          </div>

          {/* Sidebar / Ad Column (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <AdSpace position="sidebar" language={language} />
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-slate-50 rounded-full border border-slate-100 mb-2">
              <i className="fas fa-chart-line text-slate-400 text-xs"></i>
              <span className="text-xs text-slate-500 font-medium">{t.totalVisits}:</span>
              <span className="text-xs text-indigo-600 font-bold font-mono">24,592</span>
           </div>
           <p className="text-[10px] text-slate-400">© {new Date().getFullYear()} {t.appTitle}. {t.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;