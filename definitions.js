const agenda = require("./agendaConfig");

agenda.define('welcomeMessage', (job, done) => {
  console.log('Sending a welcome message every few seconds');
  done()
});

agenda.define('instant', async (job, done) => {
  console.log('job is done with instant')
  await agenda.every('18 seconds', 'welcomeMessage');
  done()
})

agenda
  .on('ready', () => console.log("Agenda started!"))
  .on('error', () => console.log("Agenda connection error!"));

console.log({ jobs: agenda._definitions });

module.exports = agenda