function checkTimeConflict(
    existingStart: Date, existingEnd: Date, startDate: Date, endDate: Date): boolean {
        return (
          (startDate >= existingStart && startDate < existingEnd) ||
          (endDate > existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd)
        );
    }

export { checkTimeConflict };