import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAX5vhQ0BY6BAjmnacWQraKB1KaVj-QTsc");
const userInput = document.getElementById("userInput");
const menuList = document.getElementById("menuList");
const addChatButton = document.getElementById("addChatButton");
const chatBox = document.getElementById("chatBox");
const sendButton = document.getElementById("sendButton");
const themeToggleButton = document.getElementById("themeToggleButton");

// 초기 테마 설정
let isDarkTheme = true; // 기본값: 다크 테마
document.body.classList.add("dark-theme");

let chatCounter = 1; // 초기 메뉴 카운터
const chats = { "chat-1": [] }; // 각 대화창의 메시지를 저장

// 초기 메뉴 항목에 이벤트 리스너 추가
document.querySelectorAll(".menu-item").forEach((menuItem) => {
  menuItem.addEventListener("click", () => {
    const chatId = menuItem.dataset.chatId;
    switchChat(chatId);
  });
});

// 새로운 대화창 추가
addChatButton.addEventListener("click", () => {
  chatCounter++;
  const newChatId = `chat-${chatCounter}`;
  chats[newChatId] = []; // 새로운 대화창 데이터 초기화

  // 새로운 메뉴 항목 추가
  const newMenuItem = document.createElement("li");
  newMenuItem.className = "menu-item";
  newMenuItem.textContent = `새 탭 ${chatCounter}`;
  newMenuItem.dataset.chatId = newChatId;

  // 메뉴 클릭 이벤트 추가
  newMenuItem.addEventListener("click", () => switchChat(newChatId));

  menuList.appendChild(newMenuItem);

  // 새로 생성된 메뉴로 전환
  switchChat(newChatId);
});

// 대화창 전환
function switchChat(chatId) {
  console.log("click", chatId, chats);
  // 모든 메뉴 항목에서 active 클래스 제거
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });

  // 선택된 메뉴 항목에 active 클래스 추가
  const activeMenuItem = document.querySelector(`[data-chat-id="${chatId}"]`);
  if (activeMenuItem) {
    activeMenuItem.classList.add("active");
  }

  // 채팅창 초기화
  chatBox.innerHTML = "";

  // 선택된 대화창의 메시지 표시
  if (chats[chatId]) {
    chats[chatId].forEach((message) => {
      if (message.text) {
        addMessageToChat(message.sender, message.text, false);
      } else if (message.image) {
        const imgElement = document.createElement("img");
        imgElement.src = `data:image/png;base64,${message.image}`;
        imgElement.style.maxWidth = "100%";
        imgElement.style.borderRadius = "10px";
        imgElement.style.marginTop = "10px";

        const imageContainer = document.createElement("div");
        imageContainer.className = `chat-message ${message.sender}`;
        imageContainer.appendChild(imgElement);
        chatBox.appendChild(imageContainer);
      }
    });
  }

  // 스크롤을 맨 아래로 이동
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 메시지 전송 함수
function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // 소개 메시지 제거
  const introMessage = document.getElementById("introMessage");
  if (introMessage) {
    introMessage.remove();
  }

  // 현재 활성화된 대화창 ID 가져오기
  const activeChatId =
    document.querySelector(".menu-item.active").dataset.chatId;

  // 사용자 메시지 추가
  addMessageToChat("user", message);

  // 로딩 프로그래스바 추가
  const loadingBar = addLoadingBar();

  // 메시지 전송 및 응답 처리
  generateResponse(message, loadingBar, activeChatId);

  // 입력 필드 초기화
  userInput.value = "";
}

// 메시지를 채팅창에 추가하는 함수
function addMessageToChat(sender, text, saveToChat = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);

  // 스크롤을 맨 아래로 이동
  chatBox.scrollTop = chatBox.scrollHeight;

  // 현재 활성화된 대화창에 메시지 저장
  if (saveToChat) {
    const activeChatId =
      document.querySelector(".menu-item.active").dataset.chatId;
    if (chats[activeChatId]) {
      chats[activeChatId].push({ sender, text });
    }
  }
}

// 로딩 프로그래스바 추가 함수
function addLoadingBar() {
  const loadingBar = document.createElement("div");
  loadingBar.className = "loading-bar";
  loadingBar.textContent = "Loading...";
  chatBox.appendChild(loadingBar);

  // 스크롤을 맨 아래로 이동
  chatBox.scrollTop = chatBox.scrollHeight;

  return loadingBar;
}

// AI 응답 생성 함수
async function generateResponse(prompt, loadingBar, chatId) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ["Text", "Image"],
    },
  });

  try {
    const response = await model.generateContent(prompt);
    const parts = response.response.candidates[0].content.parts;

    // 로딩 프로그래스바 제거
    chatBox.removeChild(loadingBar);

    // 응답 처리
    for (const part of parts) {
      if (part.text) {
        // 텍스트 응답 처리
        addMessageToChat("bot", part.text);
      } else if (part.inlineData) {
        // 이미지 응답 처리
        const imageData = part.inlineData.data;
        const imgElement = document.createElement("img");
        imgElement.src = `data:image/png;base64,${imageData}`;
        imgElement.style.maxWidth = "100%";
        imgElement.style.borderRadius = "10px";
        imgElement.style.marginTop = "10px";

        const imageContainer = document.createElement("div");
        imageContainer.className = "chat-message bot";
        imageContainer.appendChild(imgElement);
        chatBox.appendChild(imageContainer);

        // 이미지가 로드된 후 스크롤 이동
        imgElement.onload = () => {
          chatBox.scrollTop = chatBox.scrollHeight;
        };

        // 이미지 응답도 대화창 데이터에 저장
        chats[chatId].push({ sender: "bot", image: imageData });
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);

    // 로딩 프로그래스바 제거 (에러 발생 시)
    chatBox.removeChild(loadingBar);

    // 에러 메시지 표시
    addMessageToChat("bot", "오류가 발생했습니다. 다시 시도해주세요.");
  }
}

// 테마 토글 함수
function toggleTheme() {
  isDarkTheme = !isDarkTheme;

  if (isDarkTheme) {
    document.body.classList.add("dark-theme");
    document.body.classList.remove("light-theme");
    themeToggleButton.textContent = "🌓"; // 다크 테마 아이콘
  } else {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
    themeToggleButton.textContent = "☀️"; // 화이트 테마 아이콘
  }
}

// 테마 변경 버튼 클릭 이벤트
themeToggleButton.addEventListener("click", toggleTheme);

// 이벤트 리스너 추가
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
