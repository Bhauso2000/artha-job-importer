const axios = require('axios');
const { parseStringPromise } = require('xml2js');

async function fetchJobsFromXML(feedUrl) {
  const response = await axios.get(feedUrl);
  const xml = response.data;

  const json = await parseStringPromise(xml, {
    explicitArray: false,
    tagNameProcessors: [name => name.replace('job_listing:', '')],
    mergeAttrs: true
  });

  const items = json.rss.channel.item;

  return Array.isArray(items) ? items.map(normalizeJob) : [normalizeJob(items)];
}

function normalizeJob(item) {
  // Some feeds use nested `_` field for values inside CDATA
  const extractText = (field) =>
    typeof field === 'string'
      ? field
      : (typeof field === 'object' && '_' in field
          ? field._ 
          : '');

  const shortDescription = extractText(item.description);
  const fullDescription = extractText(item['content:encoded']);

  return {
    jobId: item.guid?._ || item.guid || item.id || item.link || item.title,
    title: item.title || 'Untitled',
    link: item.link || '',
    pubDate: new Date(item.pubDate || Date.now()),
    shortDescription,
    fullDescription,
    image: item['media:content']?.url || null,
    location: item.location || 'Unknown',
    jobType: item.job_type || 'Unknown',
    company: item.company || 'Unknown'
  };
}

module.exports = fetchJobsFromXML;
