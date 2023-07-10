const repl = require('node:repl');
const { mutex } = require("./util/mutex");
const { Configuration, OpenAIApi } = require('openai');
const config = require('../config');
const fs = require('fs/promises');
const path = require('path');

if (!config.ai.OPENAI_KEY) {
  console.error(`Please add OPENAI_KEY to your ENV`);
  return;
}

const openai = new OpenAIApi(new Configuration({
  apiKey: config.ai.OPENAI_KEY,
}));

const openingMessage = {
  role: 'system',
  content: `You are Kamiya, you help generate stories  
  & diaglogues for making into short Tiktok videos.  
  Provide 5 - 10 lines for each response.  
  Format your response in JSON with a title property and a story property containing the greentext.
  `,

}

const slugify = (s) => {
  return s.toLowerCase().trim().replace(/ /g, '_');
}

const initializeContext = (context) => {
  context.messages = [];
}

console.log('Use .clear to reset the AI');
const r = repl.start({
  prompt: '$: ',
  useColors: true,
  writer: (s) => s.toString(),
  eval: async (input, context, filename, callback) => {
    let lock = mutex.lock();

    if (!lock) {
      console.log('Processing previous command, current command ignored');
      return;
    }

    if(input === '.write') {

    }

    try {
      context.messages.push({
        role: 'user',
        content: input,
      });

      const res = await openai.createChatCompletion({
        messages: [
          openingMessage,
          ...context.messages
        ],
        model: config.ai.model,
      });

      const aiResponse = res.data.choices[0].message;
      
      context.messages.push({
        role: aiResponse.role,
        content: aiResponse.content,
      });
      
      const parsedRes = JSON.parse(aiResponse.content);
      const formatted = `Title: ${parsedRes.title}\nStory:\n${parsedRes.story}`;

      callback(null, formatted);

    } catch (err) {
      console.error(err);
      callback(err, "Error occurred");
      console.debug(JSON.stringify(context.messages, null, 2));
    } finally {
      mutex.unlock(lock);
    }
  }
})

r.defineCommand('write', {
  help: 'Write the last story to the inputs file according to the title.',
  action: async function() {
    const lastMessage = this.context.messages[this.context.messages.length - 1];
    const parsedRes = JSON.parse(lastMessage.content);

    const slug = slugify(parsedRes.title);
    const filename = `${slug}.txt`;
    const filepath = path.join(config.inputs, filename);

    await fs.writeFile(filepath, parsedRes.story);
    console.log(`Wrote last story to "${filename}", use .clear to restart story generation`);

    this.displayPrompt();
  }
})
initializeContext(r.context);


r.on('reset', (context) => {
  console.debug('Resetting message history');
  initializeContext(context);
})

