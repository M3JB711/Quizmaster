import React, { useState } from 'react';
import { QuizConfig, FileData, AssessmentType } from '../types';
import { extractTextFromPPTX } from '../utils/pptxParser';
import { translations, Language } from '../translations';

interface FileUploadProps {
  onStartQuiz: (files: FileData[], config: Omit<QuizConfig, 'language'>) => void;
  isLoading: boolean;
  language: Language;
}

const FileUpload: React.FC<FileUploadProps> = ({ onStartQuiz, isLoading, language }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('quiz');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];
  const isArabic = language === 'Arabic';

  // Constants for question counts
  const quizOptions = [5, 10, 15, 20];
  const examOptions = [30, 40, 50];
  const currentCountOptions = assessmentType === 'quiz' ? quizOptions : examOptions;

  const handleAssessmentTypeChange = (type: AssessmentType) => {
    setAssessmentType(type);
    // Reset question count to the first valid option for the new type
    if (type === 'quiz') {
      setQuestionCount(10);
    } else {
      setQuestionCount(30);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const fileList = Array.from(event.target.files) as File[];
      
      // Check max files limit (10)
      if (files.length + fileList.length > 10) {
        setError(t.maxFilesError);
        return;
      }

      const newFiles: FileData[] = [];
      
      for (const file of fileList) {
        const isPdf = file.type === 'application/pdf';
        const isPptx = file.name.endsWith('.pptx') || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        if (!isPdf && !isPptx) {
            setError(t.unsupportedFile.replace('{fileName}', file.name));
            continue;
        }

        try {
            const base64 = await readFileAsBase64(file);
            let extractedText = undefined;

            if (isPptx) {
               extractedText = await extractTextFromPPTX(file);
            }

            newFiles.push({
                name: file.name,
                type: file.type,
                base64: base64,
                extractedText: extractedText
            });
        } catch (e: any) {
            console.error(e);
            setError(t.uploadError.replace('{fileName}', file.name).replace('{error}', e.message));
        }
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      if (newFiles.length > 0) setError(null);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError(t.pleaseUpload);
      return;
    }
    
    onStartQuiz(files, { 
      questionCount, 
      viewMode: 'all',
      assessmentType
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-indigo-600 p-6 text-white text-center">
        <h1 className="text-3xl font-bold">{t.appTitle}</h1>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.courseMaterials} <span className="text-xs text-slate-400 font-normal">(Max 10 files)</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 transition-colors hover:border-indigo-400 bg-slate-50 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.pptx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex flex-col items-center pointer-events-none">
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                <p className="text-slate-600 font-medium">{t.clickUpload}</p>
                <p className="text-xs text-slate-400 mt-1">{t.supportedFormats}</p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <i className={`fas ${file.name.endsWith('.pptx') ? 'fa-file-powerpoint text-orange-500' : 'fa-file-pdf text-red-500'}`}></i>
                      <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {error && <p className="mt-2 text-sm text-red-500 font-medium"><i className={`fas fa-exclamation-circle ${isArabic ? 'ml-1' : 'mr-1'}`}></i>{error}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Assessment Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t.assessmentType}
              </label>
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleAssessmentTypeChange('quiz')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    assessmentType === 'quiz' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className={`fas fa-stopwatch ${isArabic ? 'ml-2' : 'mr-2'}`}></i>
                  {t.quiz}
                </button>
                <button
                  type="button"
                  onClick={() => handleAssessmentTypeChange('exam')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    assessmentType === 'exam' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className={`fas fa-university ${isArabic ? 'ml-2' : 'mr-2'}`}></i>
                  {t.finalExam}
                </button>
              </div>
            </div>

            {/* Question Count Presets (Conditional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t.numQuestions}
              </label>
              <div className="flex flex-wrap gap-2">
                {currentCountOptions.map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 px-2 text-sm rounded-lg font-medium border transition-all ${
                      questionCount === count 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || files.length === 0}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 ${
              isLoading || files.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <i className="fas fa-circle-notch fa-spin"></i>
                <span>{t.analyzing}</span>
              </span>
            ) : (
              t.generateQuiz
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;