import Application from '../models/Application.mongo.js';
import Job from '../models/Job.mongo.js';

// Programmer applies to a job
export const createApplication = async(req, res) => {
    try {
        const { job_id, cover_letter, cv_url } = req.body;
        const applicant_id = req.user.id;

        // Check if job exists
        const job = await Job.findById(job_id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Prevent duplicate application
        const existing = await Application.findOne({ job_id, applicant_id });
        if (existing) {
            return res.status(400).json({ message: 'You have already applied to this job.' });
        }

        const application = new Application({
            job_id,
            applicant_id,
            cover_letter,
            cv_url
        });

        await application.save();
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        res.status(500).json({ message: 'Error applying to job', error: error.message });
    }
};

// Recruiter: Get all applications for their jobs, including programmer info
export const getApplicationsByRecruiter = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const jobs = await Job.find({ recruiter_id }).select('_id');
        const jobIds = jobs.map(job => job._id);
        const applications = await Application.find({ job_id: { $in: jobIds } })
            .populate('applicant_id'); // populate programmer info
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

// Recruiter: Get all applications for a specific job they own, including programmer info and job details
export const getApplicationsByRecruiterAndJob = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const { job_id } = req.params;
        const job = await Job.findOne({ _id: job_id, recruiter_id });
        if (!job) return res.status(404).json({ message: 'Job not found or not owned by recruiter' });
        const applications = await Application.find({ job_id })
            .populate({
                path: 'job_id',
                populate: { path: 'recruiter_id' }
            })
            .populate('applicant_id');
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

// Recruiter: Accept an application and close the job
export const acceptApplication = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const { application_id } = req.params;
        const application = await Application.findById(application_id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        const job = await Job.findOne({ _id: application.job_id, recruiter_id });
        if (!job) return res.status(404).json({ message: 'Job not found or not owned by recruiter' });
        application.status = 'accepted';
        await application.save();
        job.status = 'closed';
        await job.save();
        res.status(200).json({ message: 'Application accepted and job closed', application });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting application', error: error.message });
    }
};

// Recruiter: Get application by ID with job and programmer info (and job details)
export const getApplicationById = async(req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate({
                path: 'job_id',
                populate: { path: 'recruiter_id' } // also get recruiter info in job
            })
            .populate('applicant_id');
        if (!application) return res.status(404).json({ message: 'Application not found' });
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
};