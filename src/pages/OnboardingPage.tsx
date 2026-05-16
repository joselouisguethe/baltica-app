import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sparkles, Calendar, CheckCircle, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const { t, setOnboardingCompleted, setPreferredReminderTime } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState('morning');
  const [customTime, setCustomTime] = useState('08:00');
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding completion and reminder time
    const reminderTime = selectedTime === 'custom' ? customTime :
      selectedTime === 'morning' ? '08:00' :
      selectedTime === 'afternoon' ? '14:00' : '20:00';

    setOnboardingCompleted(true);
    setPreferredReminderTime(reminderTime);

    navigate('/payment');
  };

  const steps = [
    {
      icon: Sparkles,
      title: t('onboarding.step1.title'),
      text: t('onboarding.step1.text'),
    },
    {
      icon: Clock,
      title: t('onboarding.step2.title'),
      text: t('onboarding.step2.text'),
    },
    {
      icon: CheckCircle,
      title: t('onboarding.step3.title'),
      text: t('onboarding.step3.text'),
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Indicator */}
      <div className="w-full px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Icon */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center mx-auto mb-6 shadow-soft"
                >
                  <StepIcon className="h-10 w-10 text-primary-foreground" />
                </motion.div>

                <h1 className="text-2xl font-bold text-foreground mb-3">
                  {currentStepData.title}
                </h1>
                <p className="text-muted-foreground">
                  {currentStepData.text}
                </p>
              </div>

              {/* Step-specific content */}
              {currentStep === 2 && (
                <Card className="shadow-card mb-8">
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="morning" id="morning" />
                        <Label htmlFor="morning" className="flex-1 cursor-pointer">
                          {t('onboarding.time.morning')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="afternoon" id="afternoon" />
                        <Label htmlFor="afternoon" className="flex-1 cursor-pointer">
                          {t('onboarding.time.afternoon')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="evening" id="evening" />
                        <Label htmlFor="evening" className="flex-1 cursor-pointer">
                          {t('onboarding.time.evening')}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="cursor-pointer">
                          {t('onboarding.time.custom')}
                        </Label>
                        {selectedTime === 'custom' && (
                          <Input
                            type="time"
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value)}
                            className="w-28 ml-auto"
                          />
                        )}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              {/* Day preview for step 1 - shows Day 0 (Welcome) + 3 days */}
              {currentStep === 1 && (
                <div className="grid grid-cols-4 gap-2 mb-8">
                  {[0, 1, 2, 3].map((day) => (
                    <Card key={day} className="shadow-card">
                      <CardContent className="p-3 text-center">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 ${day === 0 ? 'bg-primary/20' : 'bg-secondary'}`}>
                          <span className={`font-bold text-sm ${day === 0 ? 'text-primary' : 'text-secondary-foreground'}`}>
                            {day === 0 ? '✓' : day}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t(`onboarding.day${day}.name` as any)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 rounded-full gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('onboarding.back' as any)}
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 rounded-full gap-2"
                  >
                    {t('onboarding.next' as any)}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    className="flex-1 rounded-full gap-2"
                  >
                    {t('onboarding.step3.cta')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Skip option */}
              {currentStep < totalSteps && (
                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep(totalSteps)}
                    className="text-muted-foreground"
                  >
                    {t('onboarding.skip' as any)}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
