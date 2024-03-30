const express = require('express')
const app = express()
const cors = require('cors')
const agenda = require('./agendaConfig')

require('dotenv').config()

app.use(cors({
  origin: '*'
}))
app.use(express.json())

app.get('/', (req, res) => {
  try {
    res.send({ msg: 'you are welcome.' })
  } catch (error) {
    res.send({ error })
  }
})

app.post('/', async (req, res) => {
  try {
    const { jobName, interval, data } = req.body;

    // Dynamically define and create a job based on input parameters
    agenda.define(jobName, async (job) => {
      try {
        console.log(`${jobName} started at:`, new Date());

        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log(`${jobName} completed at:`, new Date());
      } catch (error) {
        console.error(`Error in ${jobName} execution:`, error);
      }
    });

    // Create a new job instance based on the provided name
    const dynamicJob = agenda.create(jobName, data);
    dynamicJob.repeatEvery(interval);

    // Save and schedule the dynamically created job
    await dynamicJob.save();

    // Start the agenda scheduler if not already started
    if (!agenda._isRunning) {
      await agenda.start();
    }

    res.status(200).send(`Job ${jobName} created and scheduled successfully`);
  } catch (error) {
    console.error('Error creating or scheduling job:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.post('/template', async (req, res) => {
  try {
    const { frequency, data } = req.body || {};

    const job = agenda.create('execute_template', { templateId: data });
    job.repeatEvery(frequency);
    await job.save();

    res.status(200).send(`Job created and scheduled successfully`);
  } catch (error) {
    console.error('Error creating or scheduling job:', error);
    res.status(500).send('Internal Server Error');
  }
})
app.put('/template', async (req, res) => {
  try {
    const { frequency, data } = req.body || {};

    const existingJob = await agenda.jobs({ 'data.templateId': data })

    if (existingJob.length === 1) {
      existingJob[0].repeatEvery(frequency);

      await existingJob[0].save();
      // Update the schedule time of the existing job
      // const jobsCollection = agenda._collection;
      // await jobsCollection.updateOne(
      //   { _id: existingJob[0]._id },
      //   { $set: { lockedAt: null } }
      // );

      // existingJob[0].repeatEvery(frequency);
      // await existingJob[0].save();
      // if (!existingJob[0].isRunning()) {
      //   existingJob[0].repeatEvery(frequency);
      //   await existingJob[0].save();
      //   res.status(200).send(`Schedule time for Job  updated successfully`);
      // } else {
      //   res.status(400).send(`Job  is currently running and cannot be updated`);
      // }

      res.status(200).send(`Schedule time for Job updated successfully new`);
    } else {
      res.status(404).send(`Job  not found`);
    }

    // res.status(200).send(`Job created and scheduled successfully`);
  } catch (error) {
    console.error('Error creating or scheduling job:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.listen(process.env.port, async () => {
  console.log('Server is live with 4100')

  await agenda.start();

  const jobs = await agenda.jobs({ nextRunAt: { $lt: new Date() } });
  for (const job of jobs) {
    console.log(`Updating nextRunAt for ${job.attrs.name}`);
    job.attrs.nextRunAt = new Date(Date.now() + 1000);
    await job.save();
  }

})
