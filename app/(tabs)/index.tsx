import { Platform } from "react-native";
import ChatListScreen from "@/views/mobile/chat/screens/ChatListScreen";

export default function TabsIndex() {
    // On mobile, render the ChatListScreen directly
    // On web, you can add a web-specific layout later
    return <ChatListScreen />;
}
