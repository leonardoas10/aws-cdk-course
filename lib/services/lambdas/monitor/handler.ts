import { SNSEvent } from 'aws-lambda';

const webHookUrl = '<insert-web-hook>';

async function handler(event: SNSEvent, context: any) {
    for (const record of event.Records) {
        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                text: `Huston, we have a problem: ${record.Sns.Message}`,
            }),
        });
    }
}

export { handler };
