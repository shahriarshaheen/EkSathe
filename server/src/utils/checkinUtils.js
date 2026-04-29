// Check-in window: opens 15 minutes before departure, closes at departure time
export const getCheckinWindow = (departureTime) => {
  const departure = new Date(departureTime);
  const windowOpen  = new Date(departure.getTime() - 15 * 60 * 1000); // 15 min before
  const windowClose = new Date(departure.getTime());                    // at departure
  return { windowOpen, windowClose, departure };
};

export const isCheckinWindowOpen = (departureTime) => {
  const now = new Date();
  const { windowOpen, windowClose } = getCheckinWindow(departureTime);
  return now >= windowOpen && now <= windowClose;
};

export const isBeforeCheckinWindow = (departureTime) => {
  const now = new Date();
  const { windowOpen } = getCheckinWindow(departureTime);
  return now < windowOpen;
};

export const isDeparturePasssed = (departureTime) => {
  return new Date() > new Date(departureTime);
};