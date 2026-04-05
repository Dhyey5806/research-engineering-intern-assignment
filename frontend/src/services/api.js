// Add 'source' to the parameters
export const fetchSearchResults = async (query, startDate, endDate, limit = 200, source = 'reddit') => {
  let url = `http://127.0.0.1:8000/api/search?query=${encodeURIComponent(query)}&limit=${limit}&source=${source}`;
  if (source === 'reddit') {
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
  }
  const res = await fetch(url);
  return res.json();
};

export const fetchTopicTrends = async (query, startDate, endDate, limit = 200, clusters = 4, source = 'reddit') => {
  let url = `http://127.0.0.1:8000/api/topics?query=${encodeURIComponent(query)}&limit=${limit}&clusters=${clusters}&source=${source}`;
  if (source === 'reddit') {
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
  }
  const res = await fetch(url);
  return res.json();
};