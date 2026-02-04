import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { Question } from "@/types/quiz";

export interface ValidationIssue {
  questionIndex: number;
  type: "fact" | "grammar" | "safety" | "suggestion" | "logic";
  severity: "info" | "warning" | "critical";
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  generalFeedback?: string;
  issues: ValidationIssue[];
}

interface QuizValidationResultProps {
  result: ValidationResult | null;
  onApplyFix?: (questionIndex: number, suggestion: string) => void;
  questions?: Question[]; // To show context if needed
}

const QuizValidationResult: React.FC<QuizValidationResultProps> = ({
  result,
  onApplyFix,
  questions,
}) => {
  const { t } = useTranslation();

  if (!result) return null;

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
    }
  };

  if (result.isValid && (!result.issues || result.issues.length === 0)) {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold">{t("validation.valid_title")}</h4>
          <p className="text-sm mt-1">
            {result.generalFeedback || t("validation.valid_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
          {result.isValid ? (
             <Info className="w-5 h-5 text-blue-500" />
          ) : (
             <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
          {t("validation.report_title")}
        </h3>
        
        {result.generalFeedback && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 italic border-l-4 border-gray-300 pl-3">
            "{result.generalFeedback}"
          </p>
        )}

        <div className="space-y-3">
          {result.issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-md border flex gap-3 ${severityColor(issue.severity)}`}
            >
              <div className="mt-0.5 shrink-0">{severityIcon(issue.severity)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <span className="font-medium text-sm uppercase tracking-wider opacity-80">
                        {t(`validation.types.${issue.type}`) || issue.type} • {t("validation.question")} {issue.questionIndex + 1}
                    </span>
                </div>
                <p className="text-sm font-semibold mt-1">{issue.message}</p>
                {issue.suggestion && (
                  <div className="mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                    <strong>{t("validation.suggestion")}:</strong> {issue.suggestion}
                    {/* Future: Add "Apply" button here if structured well */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizValidationResult;
