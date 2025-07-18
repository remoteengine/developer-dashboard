const Bull = require('bull');
const AWS = require('aws-sdk');
const { logger } = require('../config/logger');

const config = require('../config/config');
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db
};

const emailQueue = new Bull('email-queue', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db || 0
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 10,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
  httpOptions: {
    timeout: 20000,
    connectTimeout: 10000
  },
  maxRetries: 3
});

async function sendEmailWithRetry(params, attempt = 1) {
  try {
    logger.info(
      `Attempt ${attempt} to send email to ${params.Destination.ToAddresses[0]}`
    );

    const result = await ses.sendEmail(params).promise();
    logger.info(
      `Email sent successfully to ${params.Destination.ToAddresses[0]}`
    );
    return result;
  } catch (error) {
    logger.error(
      `Attempt ${attempt} failed for ${params.Destination.ToAddresses[0]}: ${error.message}`
    );

    if (attempt >= 3) {
      throw error;
    }

    await new Promise(resolve =>
      setTimeout(resolve, 1000 * Math.pow(2, attempt))
    );
    return sendEmailWithRetry(params, attempt + 1);
  }
}

emailQueue.process(5, async job => {
  const startTime = Date.now();
  const { to, subject, htmlContent, textContent } = job.data;

  try {
    logger.info(`Processing email job ${job.id} to ${to}`);

    const emailParams = {
      Source: process.env.EMAIL_FROM || 'no-reply@example.com',
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: htmlContent, Charset: 'UTF-8' },
          Text: {
            Data: textContent || htmlContent.replace(/<[^>]*>/g, ''),
            Charset: 'UTF-8'
          }
        }
      }
    };

    await sendEmailWithRetry(emailParams);

    const processingTime = Date.now() - startTime;
    logger.info(`Successfully processed job ${job.id} in ${processingTime}ms`);

    return {
      success: true,
      to,
      subject,
      processingTime,
      messageId: job.id
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(
      `Failed to process job ${job.id} after ${processingTime}ms: ${error.message}`
    );

    job.data.error = {
      message: error.message,
      stack: error.stack,
      time: processingTime,
      attempt: job.attemptsMade
    };

    throw error;
  }
});

emailQueue.on('completed', (job, result) => {
  logger.info(
    `✅ Email sent to ${result.to} with subject "${result.subject}" in ${result.processingTime}ms (Job ID: ${job.id})`
  );
});

emailQueue.on('failed', (job, error) => {
  logger.error(
    `💥 Failed to send email to ${job.data.to} after ${job.attemptsMade} attempts: ${error.message}`
  );

  if (job.attemptsMade >= job.opts.attempts) {
    logger.error(
      `🔴 Final failure for job ${job.id}. No more retries will be attempted.`
    );
  }
});

emailQueue.on('stalled', job => {
  logger.warn(
    `⚠️ Job ${job.id} stalled while sending to ${job.data.to}. Attempting to recover.`
  );
});

emailQueue.on('error', error => {
  logger.error(`🔥 Queue error: ${error.message}`);
});

emailQueue.on('waiting', jobId => {
  logger.debug(`⌛ Job ${jobId} is waiting to be processed`);
});

emailQueue.on('active', job => {
  logger.debug(
    `🔵 Job ${job.id} is now active (attempt ${job.attemptsMade + 1})`
  );
});

const addEmailJob = async (emailData, options = {}) => {
  try {
    if (!emailData.to || !emailData.subject || !emailData.htmlContent) {
      throw new Error(
        'Missing required email fields (to, subject, or htmlContent)'
      );
    }

    const jobData = {
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent || ''
    };

    const job = await emailQueue.add(jobData, options);
    logger.info(`📨 Queued email to ${emailData.to} with job ID ${job.id}`);

    return {
      jobId: job.id,
      status: 'queued',
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(
      `❌ Failed to queue email to ${emailData.to}: ${error.message}`
    );
    throw error;
  }
};

const cleanOldJobs = async () => {
  try {
    await emailQueue.clean(24 * 60 * 60 * 1000, 'completed');

    await emailQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');

    logger.info('🧹 Completed regular queue maintenance');
  } catch (error) {
    logger.error('❌ Queue maintenance failed:', error.message);
  }
};

setInterval(cleanOldJobs, 6 * 60 * 60 * 1000);

const initializeQueue = async () => {
  try {
    const counts = await emailQueue.getJobCounts();
    logger.info('📬 Email queue initialized with jobs:', counts);

    await cleanOldJobs();
  } catch (error) {
    logger.error('❌ Failed to initialize email queue:', error.message);
  }
};

module.exports = {
  emailQueue,
  addEmailJob,
  cleanOldJobs,
  initializeQueue
};
