import Application from '../models/Application.mongo.js';
import Job from '../models/Job.mongo.js';
import { sendEmail } from '../utils/email.js';
import { io } from '../server.js';

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
        // Populate applicant and job for response
        const populatedApplication = await Application.findById(application._id)
            .populate('applicant_id')
            .populate('job_id');
        res.status(201).json({ message: 'Application submitted successfully', application: populatedApplication });
    } catch (error) {
        res.status(500).json({ message: 'Error applying to job', error: error.message });
    }
};

// Recruiter: Get all applications for their jobs, including programmer and job info
export const getApplicationsByRecruiter = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const jobs = await Job.find({ recruiter_id }).select('_id');
        const jobIds = jobs.map(job => job._id);
        const applications = await Application.find({ job_id: { $in: jobIds } })
            .populate({
                path: 'applicant_id',
                strictPopulate: false
            })
            .populate({
                path: 'job_id',
                strictPopulate: false
            });
        // Filter out applications where job_id is not populated (job deleted)
        const filtered = applications.filter(app => app.job_id && typeof app.job_id === 'object');
        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

// Recruiter: Get all applications for a specific job they own, including programmer and job info
export const getApplicationsByRecruiterAndJob = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const { job_id } = req.params;
        const job = await Job.findOne({ _id: job_id, recruiter_id });
        if (!job) return res.status(404).json({ message: 'Job not found or not owned by recruiter' });
        const applications = await Application.find({ job_id })
            .populate({
                path: 'applicant_id',
                strictPopulate: false
            })
            .populate({
                path: 'job_id',
                strictPopulate: false
            });
        const filtered = applications.filter(app => app.job_id && typeof app.job_id === 'object');
        res.status(200).json(filtered);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

// Accept Application
export const acceptApplication = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const { application_id } = req.params;

        let application = await Application.findById(application_id)
            .populate('applicant_id')
            .populate('job_id');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        const job = await Job.findOne({ _id: application.job_id._id, recruiter_id });
        if (!job) return res.status(404).json({ message: 'Job not found or not owned by recruiter' });

        application.status = 'accepted';
        await application.save();

        job.status = 'closed';
        await job.save();

        // ✉️ Send email
        await sendEmail(
            application.applicant_id.email,
            'Application Accepted',
            `🎉 Congratulations!\nYour application for the job "${application.job_id.title}" has been accepted.`
        );

        // 🔔 Emit real-time notification (always use string for room and event)
        const applicantRoom = application.applicant_id._id.toString();
        const eventName = `application-update-${applicantRoom}`;
        console.log('Emitting notification to room:', applicantRoom, eventName);
        // Debug: print all rooms for this socket
        if (io.sockets.adapter.rooms) {
            console.log('Current rooms:', Array.from(io.sockets.adapter.rooms.keys()));
        }
        io.to(applicantRoom).emit(eventName, {
            message: `✅ Your application for "${application.job_id.title}" was accepted.`,
        });

        res.status(200).json({ message: 'Application accepted and job closed', application });
    } catch (error) {
        console.error('Accept error:', error);
        res.status(500).json({ message: 'Error accepting application', error: error.message });
    }
};

// Reject Application
export const rejectApplication = async(req, res) => {
    try {
        const recruiter_id = req.user.id;
        const { application_id } = req.params;

        let application = await Application.findById(application_id)
            .populate('applicant_id')
            .populate('job_id');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        const job = await Job.findOne({ _id: application.job_id._id, recruiter_id });
        if (!job) return res.status(404).json({ message: 'Job not found or not owned by recruiter' });

        application.status = 'rejected';
        await application.save();

        // ✉️ Send email
        await sendEmail(
            application.applicant_id.email,
            'Application Rejected',
            `😞 We're sorry.\nYour application for the job "${application.job_id.title}" was rejected.`
        );

        // 🔔 Emit real-time notification (always use string for room and event)
        const applicantRoom = application.applicant_id._id.toString();
        const eventName = `application-update-${applicantRoom}`;
        console.log('Emitting notification to room:', applicantRoom, eventName);
        // Debug: print all rooms for this socket
        if (io.sockets.adapter.rooms) {
            console.log('Current rooms:', Array.from(io.sockets.adapter.rooms.keys()));
        }
        io.to(applicantRoom).emit(eventName, {
            message: `❌ Your application for "${application.job_id.title}" was rejected.`,
        });

        res.status(200).json({ message: 'Application rejected', application });
    } catch (error) {
        console.error('Reject error:', error);
        res.status(500).json({ message: 'Error rejecting application', error: error.message });
    }
};

// Get a single application by ID (for recruiter or programmer)
export const getApplicationById = async(req, res) => {
    try {
        const { application_id } = req.params;
        const application = await Application.findById(application_id)
            .populate('applicant_id')
            .populate('job_id');
        if (!application || !application.applicant_id || !application.job_id) {
            return res.status(404).json({ message: 'Application not found or missing related data' });
        }
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
};

// Get all applications (optionally filter by job_id)
export const getApplications = async(req, res) => {
    try {
        const { job_id } = req.query;
        let query = {};
        if (job_id) query.job_id = job_id;
        const applications = await Application.find(query)
            .populate('applicant_id')
            .populate('job_id');
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
};

// Update application status (generic PATCH)
export const updateApplicationStatus = async(req, res) => {
    try {
        const { application_id } = req.params;
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            application_id, { status }, { new: true }
        ).populate('applicant_id').populate('job_id');
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update application status', error: error.message });
    }
};

// Check if programmer has applied to a specific job
export const checkIfApplied = async(req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.id;
        const existing = await Application.findOne({ job_id: jobId, applicant_id: userId });
        res.status(200).json({ hasApplied: !!existing });
    } catch (error) {
        res.status(500).json({ message: 'Error checking application', error: error.message });
    }
};