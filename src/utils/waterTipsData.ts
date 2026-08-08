export interface WaterSavingHabit {
  id: string;
  title: string;
  description: string;
  savings: number; // in liters
  category: 'bathroom' | 'kitchen' | 'laundry' | 'outdoor' | 'maintenance';
}

export interface WaterTip {
  title: string;
  description: string;
  savings: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export interface WaterFact {
  id: number;
  fact: string;
}

export interface ConservationTierInfo {
  name: string;
  grade: string;
  score: number;
  badgeClass: string;
  feedback: string;
  gradient: string;
  tips: WaterTip[];
}

export const waterSavingHabits: WaterSavingHabit[] = [
  {
    id: 'shower_time',
    title: '5-Minute Shower Challenge',
    description: 'Reduce your shower time from 10 minutes to 5 minutes using a timer.',
    savings: 40,
    category: 'bathroom',
  },
  {
    id: 'teeth_brush',
    title: 'Turn Off the Tap',
    description: 'Close the faucet while brushing your teeth, shaving, or washing hands.',
    savings: 12,
    category: 'bathroom',
  },
  {
    id: 'full_laundry',
    title: 'Full Laundry Loads Only',
    description: 'Only run the washing machine when you have a complete, full load of laundry.',
    savings: 30,
    category: 'laundry',
  },
  {
    id: 'dish_scrape',
    title: 'Scrape, Don\'t Rinse Dishes',
    description: 'Scrape food off plates into the trash or compost instead of rinsing under running water before loading the dishwasher.',
    savings: 15,
    category: 'kitchen',
  },
  {
    id: 'leak_check',
    title: 'Inspect for Silent Leaks',
    description: 'Put food coloring in your toilet tank. If color seeps into the bowl without flushing, you have a leak.',
    savings: 150,
    category: 'maintenance',
  },
  {
    id: 'plant_watering',
    title: 'Reuse Rinse Water',
    description: 'Use water collected from washing fruits/veggies to water indoor and balcony plants.',
    savings: 8,
    category: 'outdoor',
  },
];

export const waterFacts: WaterFact[] = [
  {
    id: 1,
    fact: 'A single leaky toilet flapper can silently waste up to 750 liters of fresh water per day without making a sound.',
  },
  {
    id: 2,
    fact: 'Water-efficient showerheads use about 7.5 liters per minute, compared to older models that guzzle up to 20 liters per minute.',
  },
  {
    id: 3,
    fact: 'Only about 1% of all water on Earth is easily accessible freshwater available for human consumption and agricultural use.',
  },
  {
    id: 4,
    fact: 'Running the dishwasher only when fully loaded can save up to 4,000 liters of water per year per household.',
  },
  {
    id: 5,
    fact: 'Installing a simple aerator on your kitchen tap reduces faucet flow rates by up to 40% without compromising water pressure.',
  },
  {
    id: 6,
    fact: 'Washing your car with a bucket instead of a running garden hose saves an average of 300 liters of water per wash.',
  },
];

const ECO_SAVER_TIPS: WaterTip[] = [
  {
    title: 'Install Faucet Aerators',
    description: 'Fit high-efficiency aerators onto bathroom taps to maintain pressure while cutting flow rate to 2 L/min.',
    savings: '15-20 L/day',
    difficulty: 'Easy',
  },
  {
    title: 'Greywater Recirculation',
    description: 'Collect cold water running while waiting for shower water to warm up, and use it to mop floors or flush.',
    savings: '10-15 L/day',
    difficulty: 'Medium',
  },
  {
    title: 'Adopt Dual-Flush Mechanics',
    description: 'If you have a dual-flush toilet, always make conscious use of the half-flush button for liquid waste.',
    savings: '25-35 L/day',
    difficulty: 'Easy',
  },
];

const BALANCED_TIPS: WaterTip[] = [
  {
    title: 'Optimize Appliance Cycles',
    description: 'Run washing machines and dishwashers on eco-mode setting to cut rinse cycle water consumption in half.',
    savings: '20-40 L/load',
    difficulty: 'Easy',
  },
  {
    title: 'Sweep Instead of Faucet-Hose',
    description: 'Sweep balconies, patios, and driveways with a broom instead of hosing them down with water.',
    savings: '80-120 L/clean',
    difficulty: 'Easy',
  },
  {
    title: 'Fix Dripping Faucets',
    description: 'A faucet dripping at a rate of 1 drip per second wastes 10,000 liters of water in a year. Replace washer rings.',
    savings: '30 L/day',
    difficulty: 'Medium',
  },
];

const HIGH_CONSUMER_TIPS: WaterTip[] = [
  {
    title: 'Perform a Toilet Leak Test',
    description: 'Add a few drops of dye or food coloring to your toilet tank. If color appears in the bowl within 20 mins, replace the flapper.',
    savings: '200-750 L/day',
    difficulty: 'Medium',
  },
  {
    title: 'Switch to Low-Flow Fixtures',
    description: 'Upgrade your bathroom showerhead to a certified low-flow 1.8 GPM (gallons per minute) model.',
    savings: '50-100 L/shower',
    difficulty: 'Advanced',
  },
  {
    title: 'Reduce Shower Durations',
    description: 'Install a waterproof sand timer in your shower. Aim for a 5-minute shower to dramatically drop usage.',
    savings: '40-80 L/day',
    difficulty: 'Easy',
  },
];

export const getConservationTier = (myUsage: number, avgUsage: number): ConservationTierInfo => {
  if (myUsage <= 0) {
    // Default tier if no usage data exists
    return {
      name: 'Eco Explorer',
      grade: 'A',
      score: 85,
      badgeClass: 'eco-badge-saver',
      feedback: 'Welcome! You have outstanding potential. Log your water readings or let telemetry sync to establish your conservation rating.',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
      tips: ECO_SAVER_TIPS,
    };
  }

  const ratio = myUsage / avgUsage;

  if (ratio < 0.8) {
    const percentage = Math.round((1 - ratio) * 100);
    return {
      name: 'Eco Saver',
      grade: 'A+',
      score: Math.min(99, 85 + Math.round((0.8 - ratio) * 75)),
      badgeClass: 'eco-badge-saver',
      feedback: `Sensational! Your water footprint is ${percentage}% below the apartment building average. You are leading the community in conservation.`,
      gradient: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)',
      tips: ECO_SAVER_TIPS,
    };
  } else if (ratio <= 1.1) {
    const percentageAboveOrBelow = Math.round(Math.abs(1 - ratio) * 100);
    const relationship = ratio < 1.0 ? 'below' : 'above';
    return {
      name: 'Balanced Consumer',
      grade: 'B',
      score: Math.round(85 - (ratio - 0.8) * 100),
      badgeClass: 'eco-badge-balanced',
      feedback: `Good job. Your usage is ${percentageAboveOrBelow}% ${relationship} the building average. Consistent habits will help you transition to the Saver tier.`,
      gradient: 'linear-gradient(135deg, #0891b2 0%, #3b82f6 100%)',
      tips: BALANCED_TIPS,
    };
  } else {
    const percentageAbove = Math.round((ratio - 1) * 100);
    return {
      name: 'High Consumer',
      grade: 'C-',
      score: Math.max(10, Math.round(60 - (ratio - 1.1) * 50)),
      badgeClass: 'eco-badge-high',
      feedback: `Caution. Your water usage is ${percentageAbove}% higher than the average household in your community. Checking for leaks could yield massive savings!`,
      gradient: 'linear-gradient(135deg, #d97706 0%, #ef4444 100%)',
      tips: HIGH_CONSUMER_TIPS,
    };
  }
};
