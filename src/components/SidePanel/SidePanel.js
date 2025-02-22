import React, { useState, useEffect } from "react";
import "./SidePanel.css";
import brightImg from "../../assets/bright.jpg";
import marcosImg from "../../assets/marcos.jpg";
import henroImg from "../../assets/henro.jpg";
import { socket } from "../../socket"; // your Socket.IO client instance

function SidePanel({
  onSuggestionClick,
  conversationGoal,
  setConversationGoal,
  conversationHistory // passed from parent
}) {
  // State to store suggestions from the backend
  const [serverSuggestions, setServerSuggestions] = useState([]);

  // Settings state
  const [humor, setHumor] = useState(50);
  const [flirtiness, setFlirtiness] = useState(50);

  // When a suggestion is clicked, call the provided callback
  const handleSuggestionClick = (text) => {
    onSuggestionClick(text);
  };

  const handlePersonaClick = (personaName) => {
    console.log("Persona clicked:", personaName);
    // Future logic for persona-based suggestions can be added here.
  };

  // Refresh handler: clear current suggestions and send conversation data to backend
  const handleRefreshSuggestions = () => {
    // Immediately clear previous suggestions so that nothing is displayed
    setServerSuggestions([]);
    
    // Format the conversation history with a fallback if undefined
    const safeHistory = conversationHistory || [];
    const formattedHistory = safeHistory
      .map((msg) => `${msg.sender}: ${msg.text}`)
      .join("\n");

    console.log("Refreshing suggestions with data:", {
      conversationHistory: formattedHistory,
      conversationGoal: conversationGoal,
      flirtiness: flirtiness,
      humor: humor
    });

    // Emit a socket event to request refreshed suggestions from the backend
    socket.emit("request_suggestions", {
      conversation_id: "default", // Adjust conversation ID as needed
      text: formattedHistory,
      goal: conversationGoal, // added conversation goal
      flirtiness: flirtiness,           // added flirtiness level
      humor: humor                      // added humor level
    });
  };

  // Listen for server new_suggestions
  useEffect(() => {
    const handleNewSuggestions = (data) => {
      if (data.suggestions) {
        console.log("Received suggestions from server:", data.suggestions);
        // If your backend returns a string with newline-separated suggestions,
        // split it into an array. Adjust as needed.
        const suggestionsArray = data.suggestions
          .split("\n")
          .filter((s) => s.trim() !== "");
        setServerSuggestions(suggestionsArray);
      }
    };

    // Adjust the event name if your backend emits under a different name.
    socket.on("new_suggestions", handleNewSuggestions);

    return () => {
      socket.off("new_suggestions", handleNewSuggestions);
    };
  }, []);

  return (
    <div className="side-panel">
      <h2>RizzBot</h2>
      <div className="analysis-section">
        <h3>Conversation Goal</h3>
        <input
          className="goal-input"
          type="text"
          placeholder="Enter your conversation goal..."
          value={conversationGoal}
          onChange={(e) => setConversationGoal(e.target.value)}
        />
      </div>

      <div className="analysis-section">
        <div className="suggestions-header">
          <h3>Suggestions</h3>
          <button className="refresh-button" onClick={handleRefreshSuggestions}>
            ⟳
          </button>
        </div>
        <div className="suggestions-container">
          {serverSuggestions.length > 0 ? (
            serverSuggestions.map((sugg, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => handleSuggestionClick(sugg)}
              >
                {sugg}
              </button>
            ))
          ) : (
            <p style={{ visibility: "hidden" }}>No suggestions yet.</p>
          )}
        </div>
      </div>

      <div className="analysis-section">
        <h3>Personas</h3>
        <div className="personas-container">
          <button className="persona-button" onClick={() => handlePersonaClick("Bright")}>
            <img src={brightImg} alt="Bright" className="persona-image" />
            <div className="persona-name">Bright</div>
          </button>
          <button className="persona-button" onClick={() => handlePersonaClick("Marcos")}>
            <img src={marcosImg} alt="Marcos" className="persona-image" />
            <div className="persona-name">Marcos</div>
          </button>
          <button className="persona-button" onClick={() => handlePersonaClick("Henry")}>
            <img src={henroImg} alt="Henry" className="persona-image" />
            <div className="persona-name">Henry</div>
          </button>
        </div>
      </div>

      <div className="analysis-section">
        <h3>Settings</h3>
        <div className="slider-container">
          <label>Flirtiness: {flirtiness}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={flirtiness}
            onChange={(e) => setFlirtiness(e.target.value)}
          />
        </div>
        <div className="slider-container">
          <label>Humor: {humor}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={humor}
            onChange={(e) => setHumor(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default SidePanel;
