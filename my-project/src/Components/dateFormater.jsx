const formatDateManually = (dateString) => {
  const date = new Date(dateString);
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[date.getUTCMonth()]; 
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${monthName} ${day}, ${year}`;
};


export default formatDateManually