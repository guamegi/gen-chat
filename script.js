import { GoogleGenerativeAI } from "@google/generative-ai"; 

const genAI = new GoogleGenerativeAI("AIzaSyAX5vhQ0BY6BAjmnacWQraKB1KaVj-QTsc");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

function sendMessage() {
    if (userInput.value.trim() === "") return;

    const userMessage = document.createElement("div");
    userMessage.className = "chat-message user";
    userMessage.textContent = userInput.value;
    chatBox.appendChild(userMessage);

    // 로딩 프로그래스바 추가
    const loadingBar = document.createElement("div");
    loadingBar.className = "loading-bar";
    loadingBar.textContent = "Loading...";
    chatBox.appendChild(loadingBar);

    // 스크롤을 맨 아래로 이동 (로딩바 추가 후)
    chatBox.scrollTop = chatBox.scrollHeight;

    generateImage(userInput.value, loadingBar);
    userInput.value = "";
}

async function generateImage(prompt, loadingBar) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
            responseModalities: ['Text', 'Image']
        },
    });

    try {
        const response = await model.generateContent(prompt);
        const parts = response.response.candidates[0].content.parts;

        // 로딩 프로그래스바 제거
        chatBox.removeChild(loadingBar);

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

        // DOM 업데이트 후 스크롤을 맨 아래로 이동
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 0);
    } catch (error) {
        console.error("Error generating content:", error);

        // 로딩 프로그래스바 제거 (에러 발생 시)
        chatBox.removeChild(loadingBar);
    }
}

window.sendMessage = sendMessage;