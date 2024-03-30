const express = require('express');
const cors = require('cors')
const Agenda = require('agenda');
require('dotenv').config()

const app = express();

app.use(cors({
  origin: '*'
}))
app.use(express.json())

const agenda = new Agenda(
  {
    db: {
      address: process.env.URI,
      collection: 'New_Agenda',
      options: { useNewUrlParser: true },
    },
    defaultLockLifetime: 0,
  }
);

// Define your job
const defineJob = (jobName) => {
  agenda.define(jobName, async (job) => {
    try {
      console.log(`Job ${jobName} started at:`, new Date());

      // Your job logic here

      console.log(`Job ${jobName} completed at:`, new Date());
    } catch (error) {
      console.error(`Error in job ${jobName} execution:`, error);
    }
  });
};

// Endpoint to create a job with scheduling
app.post('/create-job', async (req, res) => {
  try {
    // Get parameters from the request body
    const { jobName, interval } = req.body;

    // Dynamically define the job
    defineJob(jobName);

    // Schedule the job
    agenda.every(interval, jobName);

    res.status(200).send(`Job ${jobName} scheduled to run every ${interval}`);
  } catch (error) {
    console.error('Error creating or scheduling job:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to update a job's scheduling interval
app.put('/update-job/', async (req, res) => {
  try {
    // Get the new scheduling interval from the request body
    const { interval, jobId } = req.body;

    // Use the job ID to find the existing job
    const existingJob = await agenda.jobs({ name: 'template' });

    if (existingJob.length === 1) {
      // Update the existing job's scheduling interval
      existingJob[0].repeatEvery(interval);
      await existingJob[0].save();

      res.status(200).send(`Job ${existingJob[0].attrs.name} scheduling interval updated to ${interval}`);
    } else {
      res.status(404).send(`Job not found`);
    }
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to cancel a job
app.delete('/cancel-job/', async (req, res) => {
  try {

    // Use the job ID to find the existing job
    const existingJob = await agenda.jobs({ name: 'template' });

    if (existingJob.length === 1) {
      // Cancel the existing job
      await existingJob[0].remove();

      res.status(200).send(`Job ${existingJob[0].attrs.name} canceled successfully`);
    } else {
      res.status(404).send(`Job not found`);
    }
  } catch (error) {
    console.error('Error canceling job:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await agenda.start();
});
