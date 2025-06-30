import Job from '../models/Job.mongo.js';

// Create a new job (recruiter only)
export const createJob = async(req, res) => {
    try {
        const { title, description, specialization, governorate, work_mode, job_type } = req.body;
        const recruiter_id = req.user.id; // from auth middleware

        const job = new Job({
            title,
            description,
            specialization,
            governorate,
            recruiter_id,
            work_mode,
            job_type
        });

        await job.save();
        res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error creating job', error: error.message });
    }
};

// Get all jobs with optional filtering by title, location, or both
export const getAllJobs = async(req, res) => {
    try {
        const { title, location } = req.query;
        let filter = {};
        if (title) {
            filter.title = { $regex: title, $options: 'i' };
        }
        if (location) {
            filter.governorate = { $regex: location, $options: 'i' };
        }
        const jobs = await Job.find(filter);
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error: error.message });
    }
};

// Get job by ID
export const getJobById = async(req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job', error: error.message });
    }
};

// Edit job by ID (recruiter only, must own job)
export const updateJobById = async(req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Only the recruiter who created the job can edit it
        if (job.recruiter_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: Not your job' });
        }

        const { title, description, specialization, governorate, status } = req.body;
        if (title !== undefined) job.title = title;
        if (description !== undefined) job.description = description;
        if (specialization !== undefined) job.specialization = specialization;
        if (governorate !== undefined) job.governorate = governorate;
        if (status !== undefined) job.status = status;

        await job.save();
        res.status(200).json({ message: 'Job updated successfully', job });
    } catch (error) {
        res.status(500).json({ message: 'Error updating job', error: error.message });
    }
};

// Delete job by ID (recruiter only, must own job)
export const deleteJobById = async(req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Only the recruiter who created the job can delete it
        if (job.recruiter_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: Not your job' });
        }

        await job.deleteOne();
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting job', error: error.message });
    }
};

// Get job details + whether programmer applied
export const getJobWithApplicationCheck = async(req, res) => {
    try {
        console.debug('[getJobWithApplicationCheck] params:', req.params);
        console.debug('[getJobWithApplicationCheck] user:', req.user);
        const { id } = req.params;
        const job = await Job.findById(id).populate('recruiter_id', 'name');
        console.debug('[getJobWithApplicationCheck] job:', job);
        if (!job) {
            console.warn('[getJobWithApplicationCheck] Job not found for id:', id);
            return res.status(404).json({ message: 'Job not found' });
        }

        let hasApplied = false;
        if (req.user.role === 'programmer') {
            const Application = (await import('../models/Application.mongo.js')).default;
            const application = await Application.findOne({
                job_id: id,
                applicant_id: req.user.id
            });
            console.debug('[getJobWithApplicationCheck] application:', application);
            hasApplied = !!application;
        }

        console.debug('[getJobWithApplicationCheck] recruiterName:', job.recruiter_id?.name);
        res.status(200).json({ 
            job, 
            hasApplied, 
            recruiterName: job.recruiter_id?.name || null 
        });
    } catch (error) {
        console.error('[getJobWithApplicationCheck] Error:', error);
        res.status(500).json({ message: 'Error loading job', error: error.message });
    }
};