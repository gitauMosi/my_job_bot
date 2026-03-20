const { getJson } = require('serpapi');
const config = require('../config');

class JobService {
  async fetchJobs() {
    try {
      const result = await getJson(config.JOB_CONFIG);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.jobs_results || [];
    } catch (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }
}

module.exports = new JobService();