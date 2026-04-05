export const getTimelineData = (results) => {
  if (!results || results.length === 0) return { labels: [], values: [] };
  
  const counts = {};
  results.forEach(post => {
    if (post.date) {
      const date = new Date(post.date).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    }
  });
  
  const sortedDates = Object.keys(counts).sort();
  return {
    labels: sortedDates,
    values: sortedDates.map(date => counts[date])
  };
};

export const getSubredditData = (results) => {
  if (!results || results.length === 0) return { labels: [], values: [] };

  const subs = {};
  results.forEach(post => {
    if (post.subreddit) {
      if (!subs[post.subreddit]) {
        subs[post.subreddit] = 0;
      }
      subs[post.subreddit] += ((post.score || 0) + (post.num_comments || 0));
    }
  });

  const sortedSubs = Object.entries(subs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    labels: sortedSubs.map(item => item[0]),
    values: sortedSubs.map(item => item[1])
  };
};