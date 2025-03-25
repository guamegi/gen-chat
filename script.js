import { GoogleGenerativeAI } from "@google/generative-ai"; 
// import dotenv from "dotenv";

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI("AIzaSyAX5vhQ0BY6BAjmnacWQraKB1KaVj-QTsc");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

function sendMessage() {
    if (userInput.value.trim() === "") return;
    
    const userMessage = document.createElement("div");
    userMessage.className = "chat-message user";
    userMessage.textContent = userInput.value;
    chatBox.appendChild(userMessage);
    
    generateImage(userInput.value);
    userInput.value = "";
}

async function generateImage(prompt) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
            responseModalities: ['Text', 'Image']
        },
    });

    try {
        const response = await model.generateContent(prompt);
        const parts = response.response.candidates[0].content.parts;

        for (const part of parts) {
            if (part.text) {
                // 텍스트 응답 처리
                const botMessage = document.createElement("div");
                botMessage.className = "chat-message bot";
                botMessage.textContent = part.text;
                chatBox.appendChild(botMessage);
            } else if (part.inlineData) {
                // 이미지 응답 처리
                const imageData = part.inlineData.data;
                const imgElement = document.createElement("img");
                imgElement.src = `data:image/png;base64,${imageData}`;
                imgElement.style.maxWidth = "100%"; // 이미지 크기 조정
                imgElement.style.borderRadius = "10px";
                imgElement.style.marginTop = "10px";

                const imageContainer = document.createElement("div");
                imageContainer.className = "chat-message bot";
                imageContainer.appendChild(imgElement);
                chatBox.appendChild(imageContainer);
            }
        }

        // 스크롤을 맨 아래로 이동
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

window.sendMessage = sendMessage;