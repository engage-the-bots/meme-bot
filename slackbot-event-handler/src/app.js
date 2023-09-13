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

let keywordMemeMap = {
    'this-is-fine': { template: '/fine', resourcePathParms: 2, type: '.png', title: 'This is fine', memeString: '_this-is-fine&top&bottom_', exampleImageUrl: 'https://api.memegen.link/images/fine/top/bottom.png'}, //https://api.memegen.link/images/fine/_/this_is_fine.png
    // 'panik-kalm-panik': { template: '/panik-kalm-panik', resourcePathParms: 3, type: '.png' },
    // 'patrick', // https://api.memegen.link/images/patrick/why_don't_we_take_all_the_memes/and_put_them_on_memegen.png
    // https://api.memegen.link/images/right/Senior_Developer/Junior_Developer/Put_it_in_the_backlog./So_we_can_fix_it_later,_right~q/So_we_can_fix_it_later,_right~q.png
    // https://api.memegen.link/images/yodawg/yo_dawg/i_heard_you_like_memes.png
    // https://api.memegen.link/images/dbg/Clicking_the_'X'_on_a_mobile_ad/The_'X'_is_part_of_the_ad.png
    // https://api.memegen.link/images/doge/such_meme/very_skill.png
    // https://api.memegen.link/images/drake/left_on_unread/left_on_read.png
    // https://api.memegen.link/images/drowning/Me_Asking_for_Help/Online_Commenter/I'm_having_that_problem_too..png
    'feels-good': { template: '/feelsgood', resourcePathParms: 2, type: '.png', title: 'Feels good', memeString: '_feels-good&top&bottom_', exampleImageUrl: 'https://api.memegen.link/images/feelsgood/top/bottom.png'}, //https://api.memegen.link/images/fine/_/this_is_fine.png
}

function messageToImageUrl(userMessage) {
    // Parse message into parts
    let userMessageParts = userMessage.split('&amp;').map(function(item) {
        item = item.trim();
        item = item.replace(/ /g, '_');
        return item;
    });
    console.log('Parsing user message into parts -> meme-template and captions')
    console.log(userMessageParts)

    let memeMap = keywordMemeMap[userMessageParts[0]];
    console.log('Using meme:');
    console.log(memeMap);
    if(memeMap && userMessageParts.length > 0 && userMessageParts.length <= memeMap.resourcePathParms + 1) {
        let imageUrl = 'https://api.memegen.link/images';
        console.log('On Image URL Base:');
        console.log(imageUrl);
        imageUrl += memeMap.template;
        console.log('On Image URL Base + template:');
        console.log(imageUrl);
        for(let i = 1; i < userMessageParts.length; i++) {
            let part = userMessageParts[i];
            imageUrl += `/${part}`;
            console.log(`On Image URL resource-path parameter[${i}]:`);
            console.log(imageUrl);
        }
        imageUrl += memeMap.type;
        console.log('On Image URL filetype:');
        console.log(imageUrl);
        return imageUrl;
    } else {
        return null;
    }
}

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

    // remove mention from message
    let message = event.text.replace(/<@.*>/, '').trim();
    let imageUrl = messageToImageUrl(message);

    if(imageUrl) {
        console.log('on imageUrl')
        console.log(imageUrl)
        await say(imageBlocksBuilder(imageUrl));
    } else {
        await client.chat.postEphemeral({
            token: process.env.SLACK_BOT_TOKEN,
            channel: event.channel,
            user: event.user,
            text: "There was a problem fulfilling your request. Try direct messaging 'help' to see what I can do."
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

    let helpMessage= {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Sure! Here are some mems I can make if you mention me with one of the the meme strings:\n\nExample:\n>@Engage Bot N this-is-fine& &this is fine"
                }
            },
            {
                "type": "divider"
            }
        ]
    }
    for (const [keyword, meme] of keywordMemeMap.entries()) {
        let memeSections = {
            type: "section",
            text: {
                "type": "mrkdwn",
                "text": `*${meme.title}*\nmeme string: @me ${meme.memeString}\n`
            },
            "accessory": {
                "type": "image",
                "image_url": `${meme.exampleImageUrl}`,
                "alt_text": "alt text for image"
            }
        };
        helpMessage.blocks.push({
            memeSections
        });
    }
    await say(helpMessage);
});

// Boilerplate - Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
    console.log('on lambda handler');
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}
