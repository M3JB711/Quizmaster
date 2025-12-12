import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import { QuizQuestion, QuizConfig } from '../types';
import { translations } from '../translations';
import AdSpace from './AdSpace';

interface ResultsViewProps {
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
  config: QuizConfig;
  onRestart: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, userAnswers, config, onRestart }) => {
  const t = translations[config.language];
  const isArabic = config.language === 'Arabic';
  const textClass = isArabic ? 'text-right' : 'text-left';

  // Calculate Score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswerIndex) {
      correctCount++;
    }
  });
  
  const score = correctCount;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  // Chart Data
  const data = [
    { name: t.correct, value: score },
    { name: t.incorrect, value: total - score },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("Gemini QuizMaster - Results Report", 20, 20);
    
    // Score
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`${t.score}: ${score} / ${total} (${percentage}%)`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);
    
    // Questions
    let yPos = 55;
    
    questions.forEach((q, idx) => {
        // Check page break
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
        const status = isCorrect ? t.correct.toUpperCase() : t.incorrect.toUpperCase();
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        
        // Wrap question text
        const splitQuestion = doc.splitTextToSize(`Q${idx+1}: ${q.question}`, 170);
        doc.text(splitQuestion, 20, yPos);
        yPos += splitQuestion.length * 5 + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Status
        doc.setTextColor(isCorrect ? 16 : 220, isCorrect ? 185 : 38, isCorrect ? 129 : 38); // Green or Red
        doc.text(`${t.status}: ${status}`, 20, yPos);
        yPos += 5;

        // User Answer
        const userOpt = q.options[userAnswers[idx]];
        doc.setTextColor(100, 100, 100);
        const splitUser = doc.splitTextToSize(`${t.yourAnswer}: ${userOpt || "Skipped"}`, 170);
        doc.text(splitUser, 20, yPos);
        yPos += splitUser.length * 4;

        // Correct Answer (if wrong)
        if (!isCorrect) {
            const correctOpt = q.options[q.correctAnswerIndex];
            doc.setTextColor(0, 150, 0);
            const splitCorrect = doc.splitTextToSize(`${t.correctAnswer}: ${correctOpt}`, 170);
            doc.text(splitCorrect, 20, yPos);
            yPos += splitCorrect.length * 4;
        }

        // Explanation
        doc.setTextColor(50, 50, 70);
        doc.setFont("helvetica", "italic");
        const splitExp = doc.splitTextToSize(`${t.explanation}: ${q.explanation}`, 170);
        doc.text(splitExp, 20, yPos);
        yPos += splitExp.length * 4 + 10; // Spacing between questions
    });

    doc.save("quiz-results.pdf");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Score Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{t.quizCompleted}</h2>
          <p className="text-slate-500 mb-6">{t.performanceDesc}</p>
          <div className="flex items-center justify-center md:justify-start space-x-4 mb-6">
             <div className="text-center">
                 <span className="block text-4xl font-black text-indigo-600">{score}/{total}</span>
                 <span className="text-sm text-slate-400 font-medium">{t.score}</span>
             </div>
             <div className="w-px h-12 bg-slate-200"></div>
             <div className="text-center">
                 <span className={`block text-4xl font-black ${percentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{percentage}%</span>
                 <span className="text-sm text-slate-400 font-medium">{t.accuracy}</span>
             </div>
          </div>
          <button 
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <i className={`fas fa-file-pdf ${isArabic ? 'ml-2' : 'mr-2'}`}></i> {t.downloadReport}
          </button>
        </div>
        
        <div className="w-48 h-48 mt-6 md:mt-0 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <i className={`fas ${percentage >= 70 ? 'fa-trophy text-emerald-500' : 'fa-graduation-cap text-indigo-500'} text-2xl`}></i>
             </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
          <h3 className={`text-xl font-bold text-slate-700 ${isArabic ? 'mr-2 border-r-4 pr-3 border-indigo-500' : 'ml-2 border-l-4 pl-3 border-indigo-500'}`}>{t.detailedReview}</h3>
          
          {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              
              return (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className={`p-6 ${isArabic ? 'border-r-8' : 'border-l-8'} ${isCorrect ? 'border-emerald-500' : 'border-red-500'}`}>
                          <div className="flex justify-between items-start mb-4">
                              <h4 className={`text-lg font-semibold text-slate-800 w-full ${textClass}`}>
                                  <span className={`text-slate-400 ${isArabic ? 'ml-2' : 'mr-2'}`}>Q{idx + 1}.</span>
                                  {q.question}
                              </h4>
                              {isCorrect ? (
                                  <span className={`bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide flex-shrink-0 ${isArabic ? 'mr-2' : 'ml-2'}`}>{t.correct}</span>
                              ) : (
                                  <span className={`bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide flex-shrink-0 ${isArabic ? 'mr-2' : 'ml-2'}`}>{t.incorrect}</span>
                              )}
                          </div>

                          <div className="space-y-2 mb-4">
                              {q.options.map((opt, optIdx) => {
                                  let bgClass = "bg-slate-50 border-slate-100 text-slate-600";
                                  let icon = null;

                                  if (optIdx === q.correctAnswerIndex) {
                                      bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium";
                                      icon = <i className="fas fa-check text-emerald-600"></i>;
                                  } else if (optIdx === userAnswer && !isCorrect) {
                                      bgClass = "bg-red-50 border-red-200 text-red-800";
                                      icon = <i className="fas fa-times text-red-600"></i>;
                                  }

                                  return (
                                      <div key={optIdx} className={`p-3 rounded-lg border flex items-center justify-between ${bgClass}`}>
                                          <span className={textClass}>{opt}</span>
                                          {icon}
                                      </div>
                                  );
                              })}
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <p className={`text-sm text-slate-600 ${textClass}`}>
                                  <strong className="text-indigo-600 block mb-1">{t.explanation}:</strong>
                                  {q.explanation}
                              </p>
                          </div>
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onRestart}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center"
        >
          <i className={`fas fa-redo-alt ${isArabic ? 'ml-2' : 'mr-2'}`}></i> {t.createNewQuiz}
        </button>
      </div>

      {/* Ad Space Banner */}
      <AdSpace position="banner" language={config.language} />
    </div>
  );
};

export default ResultsView;