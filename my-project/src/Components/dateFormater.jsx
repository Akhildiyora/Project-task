const formatDateManually = (dateString) => {
  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthName = months[date.getUTCMonth()]; 
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${monthName} ${day}, ${year}`;
};


export default formatDateManually