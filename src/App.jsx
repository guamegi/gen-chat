import React, { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [chatCounter, setChatCounter] = useState(1);
  const [chats, setChats] = useState({ 'chat-1': [] });
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark-theme', isDarkTheme);
    document.body.classList.toggle('light-theme', !isDarkTheme);
  }, [isDarkTheme]);

  React.useEffect(() => {
    // 채팅창 스크롤 항상 아래로
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chats, activeChatId, loading]);

  const handleMenuClick = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleAddChat = () => {
    const newChatId = `chat-${chatCounter + 1}`;
    setChats((prev) => ({ ...prev, [newChatId]: [] }));
    setChatCounter((prev) => prev + 1);
    setActiveChatId(newChatId);
  };

  const addMessageToChat = (sender, text, image) => {
    setChats((prev) => {
      const updated = { ...prev };
      updated[activeChatId] = [
        ...updated[activeChatId],
        image ? { sender, image } : { sender, text },
      ];
      return updated;
    });
  };

  const handleSend = async () => {
    const message = userInput.trim();
    if (!message) return;
    setUserInput('');
    addMessageToChat('user', message);
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp-image-generation',
        generationConfig: { responseModalities: ['Text', 'Image'] },
      });
      const response = await model.generateContent(message);
      const parts = response.response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.text) {
          addMessageToChat('bot', part.text);
        } else if (part.inlineData) {
          addMessageToChat('bot', null, part.inlineData.data);
        }
      }
    } catch (e) {
      addMessageToChat('bot', '오류가 발생했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  const handleThemeToggle = () => {
    setIsDarkTheme((prev) => !prev);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>GenChat AI</h2>
        <button className="theme-toggle-button" onClick={handleThemeToggle}>
          {isDarkTheme ? '🌓' : '☀️'}
        </button>
      </header>
      <div className="app-main">
        <aside className="menu-panel">
          <ul id="menuList">
            {Object.keys(chats).map((chatId) => (
              <li
                key={chatId}
                className={`menu-item${activeChatId === chatId ? ' active' : ''}`}
                data-chat-id={chatId}
                onClick={() => handleMenuClick(chatId)}
              >
                {`새 탭 ${chatId.split('-')[1]}`}
              </li>
            ))}
          </ul>
          <button className="add-chat-button" onClick={handleAddChat}>+</button>
        </aside>
        <section className="content-area">
          <div className="chat-box" id="chatBox" ref={chatBoxRef}>
            {chats[activeChatId].length === 0 && (
              <div id="introMessage" className="intro-message">
                <h2>AI 이미지 생성기</h2>
                보고 싶은 내용을 설명하여 생성 AI를 사용해 이미지를 생성하세요.
              </div>
            )}
            {chats[activeChatId].map((msg, idx) =>
              msg.text ? (
                <div key={idx} className={`chat-message ${msg.sender}`}>{msg.text}</div>
              ) : (
                <div key={idx} className="chat-message bot">
                  <img
                    src={`data:image/png;base64,${msg.image}`}
                    alt="AI 생성 이미지"
                    style={{ maxWidth: '100%', borderRadius: 10, marginTop: 10 }}
                  />
                </div>
              )
            )}
            {loading && <div className="loading-bar">Loading...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              id="userInput"
              placeholder="무엇을 보고 싶으신가요?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button id="sendButton" onClick={handleSend} disabled={loading}>
              전송
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App; 