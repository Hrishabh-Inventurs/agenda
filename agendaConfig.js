const Agenda = require("agenda");
require('dotenv').config()

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

agenda.on('ready', async () => {
  console.log('Agenda started!');
});

agenda.on('error', () => console.log('Agenda connection error!'));

agenda.define('execute_template', async (job) => {
  console.log('Job executed at:', new Date(), job.attrs.data?.templateId);
});


module.exports = agenda