import { Route, Routes } from "react-router-dom";
import ChatsList from "./Chat/ChatsList";
import Conversation from "./Chat/Conversation";

function Chat() {
  return (
    <Routes>
      <Route path="/" element={<ChatsList />} />
      <Route path="/:conversationID" element={<Conversation />} />
    </Routes>
  );
}

export default Chat;
