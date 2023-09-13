/* Slack bolt application boilerplate */
const { App, AwsLambdaReceiver } = require('@slack/bolt');

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
});

function imageBlocksBuilder(imageUrl) {
    return {
        blocks: [
            {
                "type": "image",
                "title": {
                    "type": "plain_text",
                    "text": "Memes everywhere",
                    "emoji": true
                },
                "image_url": imageUrl,
                "alt_text": "memes-everywhere"
            }
        ],
    }
}

/* Mention handler */
app.event('app_mention', async ({ event, say , client}) => {
    console.log('on event -- app_mention');
    console.log(`with event [${JSON.stringify(event)}]`);

    if(event.text.includes('hello')) {
        // Respond to mentions that say "hello" or "hi"
        console.log('A mention was made with "hello" or "hi" in the message');
        await say(imageBlocksBuilder("https://api.memegen.link/images/fine/services_down/this_is_fine.png"));
    } else {
        await client.chat.postEphemeral({
            token: process.env.SLACK_BOT_TOKEN,
            channel: event.channel,
            user: event.user,
            text: "There was a problem fulfilling your request"
        });
    }
});

/* Direct message handlers */
// A user clicked into your App Home (aka App DM)
app.event('app_home_opened', async ({ event, say }) => {
    console.log('on event -- app_home_opened');
    console.log(`with event [${JSON.stringify(event)}]`);
    await say(`Hello, <@${event.user}>! Try typing 'help' to see what I can do.`);
});

// Listens to incoming messages that contain "hello"
app.message('help', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    console.log('on message -- help')
    console.log(`with message [${JSON.stringify(message)}]`);
    await say({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Sure! Here are some example mentions I respond to:\n>@me help\n>@me hello\n>@me goodbye"
                }
            }
        ]
    });
});

// Boilerplate - Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
    console.log('on lambda handler');
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}
