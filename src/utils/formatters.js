class Formatters {
    static formatJobMessage(job, index) {
        const title = job.title || 'No title';
        const company = job.company_name || 'Unknown company';
        const location = job.location || 'Location not specified';
        const postedAt = job.detected_extensions?.posted_at || 'Date unknown';
        const scheduleType = job.detected_extensions?.schedule_type || 'Not specified';
        const salary = job.detected_extensions?.salary || 'Not specified';

        const applyLinks = job.apply_options || [];
        const applyText = applyLinks.length > 0
            ? applyLinks.map((option, i) => `${i + 1}. [${option.title}](${option.link})`).join('\\n')
            : 'No apply links available';

        return `
*${index}. ${title}*

*Company:* ${company}
*Location:* ${location}
*Posted:* ${postedAt}
*Type:* ${scheduleType}
*Salary:* ${salary}

*Apply here:*
${applyText}

---
`;
    }

    static formatSimplifiedJobMessage(job, index) {
        return `
*${index + 1}. ${job.title || 'No title'}*
*Company:* ${job.company_name || 'Unknown'}
*Location:* ${job.location || 'Not specified'}
*Posted:* ${job.detected_extensions?.posted_at || 'Unknown'}

Apply: ${job.apply_options?.[0]?.link || 'No link available'}
`;
    }

    static formatHeaderMessage(jobCount) {
        const jobText = jobCount === 1 ? 'job' : 'jobs';
        return `*Flutter Developer Jobs in Kenya*\\n\\nFound *${jobCount}* ${jobText} today!\\n`;
    }

    // NEW: For batch summary when > MAX_JOBS_PER_RUN
    static formatSummaryMessage(jobs, max) {
        const summaryJobs = jobs.slice(0, max);
        let summary = summaryJobs.map((job, i) => `${i+1}. ${job.title || 'N/A'} - ${job.company_name || 'Unknown'} (${job.location || 'N/A'})`).join('\\n');
        const more = jobs.length > max ? `\\n... and ${jobs.length - max} more.` : '';
        return `*Job Summary* (${jobs.length} total)\\n\\n${summary}${more}\\n\\nTop ${max} detailed below:`;
    }
}

module.exports = Formatters;
