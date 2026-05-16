import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { Video, Headphones, Download, Heart, Sparkles } from 'lucide-react';

export type Step = 'start' | 'video' | 'audio' | 'download' | 'survey' | 'closure';

interface StepIndicatorProps {
  currentStep: Step;
  completedSteps?: Step[];
}

const steps: { key: Step; icon: typeof Video }[] = [
  { key: 'video', icon: Video },
  { key: 'audio', icon: Headphones },
  { key: 'download', icon: Download },
  { key: 'survey', icon: Heart },
  { key: 'closure', icon: Sparkles },
];

export function StepIndicator({ currentStep, completedSteps = [] }: StepIndicatorProps) {
  const { t } = useApp();
  
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key) || index < currentIndex;
        const isCurrent = step.key === currentStep;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && !isCompleted && 'bg-primary/20 text-primary border-2 border-primary',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 h-0.5 mx-1',
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
