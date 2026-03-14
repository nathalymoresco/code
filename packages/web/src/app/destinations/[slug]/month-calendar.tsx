const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface MonthCalendarProps {
  bestMonths: number[];
}

export function MonthCalendar({ bestMonths }: MonthCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-12" data-testid="month-calendar">
      {MONTH_LABELS.map((label, i) => {
        const month = i + 1;
        const isBest = bestMonths.includes(month);
        const isCurrent = month === currentMonth;

        return (
          <div
            key={label}
            className={`flex flex-col items-center rounded-lg px-2 py-2 text-xs transition ${
              isBest
                ? 'bg-turquoise-100 text-turquoise-700 font-medium'
                : 'bg-sand-50 text-sand-400'
            } ${isCurrent ? 'ring-2 ring-coral-400' : ''}`}
          >
            <span>{label}</span>
            {isBest && <span className="mt-0.5 text-[10px]">✓</span>}
          </div>
        );
      })}
    </div>
  );
}
