import React from 'react';
import { Star } from 'lucide-react';

interface RatingSelectorProps {
  rating: number;
  onChange: (rating: number) => void;
  primaryColor?: string;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional (5/5)',
  4: 'Great Experience (4/5)',
  3: 'Average (3/5)',
  2: 'Needs Improvement (2/5)',
  1: 'Unsatisfactory (1/5)',
};

export const RatingSelector: React.FC<RatingSelectorProps> = ({ rating, onChange, primaryColor }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          How was your overall experience?
        </label>
        <span
          className="text-xs font-extrabold px-2 py-0.5 rounded-lg border transition-colors"
          style={{
            color: primaryColor || '#D97706',
            backgroundColor: primaryColor ? `${primaryColor}15` : '#FFFBEB',
            borderColor: primaryColor ? `${primaryColor}30` : '#FDE68A'
          }}
        >
          {RATING_LABELS[rating] || `${rating}/5 Stars`}
        </span>
      </div>

      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 justify-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= rating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
              title={`${star} Stars`}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
