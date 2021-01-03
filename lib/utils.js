import { getDay, getMinutes, getHours } from 'date-fns';

export const daysLookup = (num) => {
  const table = {
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
    SUN: 7
  };

  return table[num];
};
export const dateToCron = (d) => {
  const day = getDay(d);
  const minutes = getMinutes(d);
  const hour = getHours(d);

  return `${minutes} ${hour} * * ${day}`;
};
export const labelToNames = (label) => {
  return label.split('/').join(' and ');
};
export const formattedTime = (minutes) => {
  if (minutes > 59) {
    return `${minutes / 60} hours`;
  } else {
    return `${minutes} minutes`;
  }
};
