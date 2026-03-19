require('dotenv').config();
const { getJson } = require('serpapi');

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

getJson({
  engine: 'google_jobs',
  q: 'flutter developer',
  location: 'Kenya',
  google_domain: 'google.co.ke',
  hl: 'en',
  gl: 'ke',
  api_key: SERPAPI_API_KEY
}, (json) => {
  if (json.error) {
    console.error('Error:', json.error);
  } else {
    console.log('✅ API connection successful!');
    console.log(`Found ${json.jobs_results?.length || 0} jobs`);
    if (json.jobs_results?.length > 0) {
      console.log('\nFirst job:', json.jobs_results[0].title);
      console.log('Company:', json.jobs_results[0].company_name);
    }
  }
});