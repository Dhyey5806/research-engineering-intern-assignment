const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchSearchResults = async (query, startDate, endDate, limit = 200) => {
    let url = `${API_BASE_URL}/search?query=${query}&limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

export const fetchTopicTrends = async (query, startDate, endDate, limit = 200, clusters = 4) => {
    let url = `${API_BASE_URL}/topics?query=${query}&limit=${limit}&clusters=${clusters}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};