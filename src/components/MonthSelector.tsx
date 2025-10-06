import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, setMonth, getMonth, getYear } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vi } from 'date-fns/locale'; // Import Vietnamese locale

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (newMonth: Date) => void;
}

const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const currentMonthIndex = getMonth(selectedMonth); // 0-indexed
  const currentYear = getYear(selectedMonth);

  const months = Array.from({ length: 12 }, (_, i) => i); // 0 to 11

  const handleMonthSelect = (monthIndexString: string) => {
    const monthIndex = parseInt(monthIndexString);
    const newDate = setMonth(new Date(currentYear, 0, 1), monthIndex); // Set to first day of selected month in current year
    onMonthChange(newDate);
  };

  return (
    <Select
      value={currentMonthIndex.toString()}
      onValueChange={handleMonthSelect}
    >
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue placeholder="Chọn tháng" />
      </SelectTrigger>
      <SelectContent>
        {months.map((monthIndex) => (
          <SelectItem key={monthIndex} value={monthIndex.toString()} className="text-xs">
            {format(setMonth(new Date(), monthIndex), 'MMMM', { locale: vi })} {/* Display full month name */}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthSelector;