export const getDateString = (daysLess: number = 0): string => {
  const today = new Date();
  const futureDate = new Date(today.getTime() - daysLess * 24 * 60 * 60 * 1000); // Milliseconds in a day

  const month = (futureDate.getMonth() + 1).toString().padStart(2, "0");
  const day = futureDate.getDate().toString().padStart(2, "0");
  const year = futureDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export const normalizeWrongSpanishDate = (dateString: string) => {
  const arrDate = dateString.split("/");

  return `${arrDate[0].padStart(2, "0")}/${arrDate[1].padStart(2, "0")}/${arrDate[2].padStart(4, "0")}`;
};
