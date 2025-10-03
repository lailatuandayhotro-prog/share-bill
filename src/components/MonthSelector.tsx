import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, setMonth, getMonth, getYear } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const currentMonthIndex = getMonth(selectedMonth); // 0-indexed
  const currentYear = getYear(selectedMonth);

  const months = Array.from({ length: 12 }, (_, i) => i); // 0 to 11

  const handleMonthClick = (monthIndex: number) => {
    const newDate = setMonth(new Date(currentYear, 0, 1), monthIndex); // Set to first day of selected month in current year
    onMonthChange(newDate);
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start"> {/* Reduced gap */}
      {months.map((monthIndex) => (
        <Button
          key={monthIndex}
          variant="outline"
          size="sm"
          onClick={() => handleMonthClick(monthIndex)}
          className={cn(
            "w-8 h-7 text-xs font-semibold", // Adjusted size and text size
            currentMonthIndex === monthIndex && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {format(setMonth(new Date(), monthIndex), 'M')}
        </Button>
      ))}
    </div>
  );
};

export default MonthSelector;