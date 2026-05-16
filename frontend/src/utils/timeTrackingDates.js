export function getDaysInMonth(monthIndex, year) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export function buildCalendarDays(monthIndex, year) {
    const daysInMonth = getDaysInMonth(monthIndex, year);
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const leadingEmptyDays = (firstWeekday + 6) % 7;

    return Array.from({ length: 42 }, (_, index) => {
        const dayNumber = index - leadingEmptyDays + 1;

        if (dayNumber >= 1 && dayNumber <= daysInMonth) {
            const dayString = String(dayNumber).padStart(2, "0");
            const weekdayIndex = new Date(year, monthIndex, dayNumber).getDay();

            return {
                id: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${dayString}`,
                day: dayNumber,
                label: dayNumber,
                date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${dayString}`,
                isWeekend: weekdayIndex === 0 || weekdayIndex === 6,
                isMuted: false
            };
        }

        return {
            id: `muted-${index}`,
            day: null,
            label: "",
            date: null,
            isWeekend: false,
            isMuted: true
        };
    });
}

export function formatMonthYear(monthIndex, year) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric"
    }).format(new Date(year, monthIndex, 1));
}
