import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
  steps: {
    title: string;
    description: string;
  }[];
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="w-full py-4 sm:py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200">
            <div
              className="absolute h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > index + 1;
              const isCurrent = currentStep === index + 1;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-500",
                      isCompleted
                        ? "border-primary bg-primary text-white"
                        : isCurrent
                        ? "border-primary bg-white text-primary"
                        : "border-gray-300 bg-white text-gray-300"
                    )}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}