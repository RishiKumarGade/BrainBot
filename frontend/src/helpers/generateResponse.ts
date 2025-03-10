import { GoogleGenerativeAI } from '@google/generative-ai';
const configuration = new GoogleGenerativeAI("AIzaSyD3Hn8xycYpTwbEF5z35KpVUkauKfvYLiA");

const modelId = "gemini-2.0-flash";
const model = configuration.getGenerativeModel({ model: modelId });


export const generateResponse = async (prompt:any,currentMessages:any) => {
  try {
    const chat = model.startChat({
      history: currentMessages,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const responseText = response.text();
    return responseText
  } catch (err) {
    console.error(err);
    return false;
  }
};