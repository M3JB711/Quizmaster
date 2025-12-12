import React, { useState } from 'react';
import { QuizQuestion, QuizConfig } from '../types';
import { translations } from '../translations';

interface QuizViewProps {
  questions: QuizQuestion[];
  config: QuizConfig;
  onComplete: (userAnswers: Record<number, number>) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, config, onComplete }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const t = translations[config.language];
  const isArabic = config.language === 'Arabic';
  const textClass = isArabic ? 'text-right' : 'text-left';

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(userAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitAll = () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const msg = t.confirmSubmit.replace('{count}', answeredCount.toString()).replace('{total}', questions.length.toString());
      if (!confirm(msg)) {
        return;
      }
    }
    onComplete(userAnswers);
  };

  // --- RENDER SINGLE MODE ---
  if (config.viewMode === 'single') {
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-full h-4 mb-6 shadow-sm overflow-hidden border border-slate-100">
          <div 
            className="bg-indigo-500 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
            <span className="text-slate-500 font-medium text-sm">
              {t.question} {currentIndex + 1} {t.of} {questions.length}
            </span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
              {config.language}
            </span>
          </div>

          {/* Question Body */}
          <div className="p-8">
            <h2 className={`text-xl font-bold text-slate-800 mb-8 leading-relaxed ${textClass}`}>
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(currentIndex, idx)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 group flex items-start ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'
                    } ${isArabic ? 'ml-4' : 'mr-4'}`}>
                      {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                    </div>
                    <span className={`flex-1 text-lg ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'} ${textClass}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentIndex === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <i className={`fas ${isArabic ? 'fa-arrow-right ml-2' : 'fa-arrow-left mr-2'}`}></i> {t.previous}
            </button>

            <button
              onClick={handleNext}
              className={`px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-95 ${
                 userAnswers[currentIndex] === undefined
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
              }`}
            >
              {currentIndex === questions.length - 1 ? (
                 t.submitQuiz
              ) : (
                <>{t.next} <i className={`fas ${isArabic ? 'fa-arrow-left mr-2' : 'fa-arrow-right ml-2'}`}></i></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER ALL MODE ---
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center sticky top-20 z-10">
         <div>
            <h2 className="text-xl font-bold text-slate-800">{t.quizOverview}</h2>
            <p className="text-sm text-slate-500">{t.answerAll}</p>
         </div>
         <div className="text-indigo-600 font-bold">
            {Object.keys(userAnswers).length} / {questions.length} {t.answered}
         </div>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
             <span className="text-slate-500 font-bold text-sm">{t.question} {qIndex + 1}</span>
          </div>
          <div className="p-6">
            <h3 className={`text-lg font-bold text-slate-800 mb-6 ${textClass}`}>{q.question}</h3>
            <div className="space-y-3">
               {q.options.map((option, optIdx) => {
                  const isSelected = userAnswers[qIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(qIndex, optIdx)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-start text-left ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                      } ${isArabic ? 'ml-3' : 'mr-3'}`}>
                        {isSelected && <i className="fas fa-check text-white text-[10px]"></i>}
                      </div>
                      <span className={`${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-600'} ${textClass}`}>
                        {option}
                      </span>
                    </button>
                  );
               })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center pb-12">
         <button
            onClick={handleSubmitAll}
            className="bg-indigo-600 text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all hover:scale-105"
         >
            {t.submitAll}
         </button>
      </div>
    </div>
  );
};

export default QuizView;