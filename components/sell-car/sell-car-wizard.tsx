"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSellCarStore } from "@/lib/store/use-sell-car-store";
import { SellCarStepper } from "@/components/sell-car/sell-car-stepper";
import { StepContact } from "@/components/sell-car/step-contact";
import { StepRegistration } from "@/components/sell-car/step-registration";
import { StepVehicle } from "@/components/sell-car/step-vehicle";
import { StepValuation } from "@/components/sell-car/step-valuation";
import { SellCarSuccess } from "@/components/sell-car/sell-car-success";

// Directional slide animation variants
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 36 : -36,
    opacity: 0,
  }),
};

export function SellCarWizard() {
  const { step, direction } = useSellCarStore();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-3xl border border-border bg-card/90 shadow-xl backdrop-blur-md p-6 sm:p-8 space-y-8">
        {/* Stepper only shown during steps 1 to 4 */}
        {step <= 4 && <SellCarStepper currentStep={step} />}

        {/* Animated Wizard Body */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <StepContact />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <StepRegistration />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <StepVehicle />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <StepValuation />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SellCarSuccess />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
