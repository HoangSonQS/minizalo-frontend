import ChatScreen from "@/views/mobile/chat/screens/ChatScreen";
import { Stack } from "expo-router";

export default function ChatRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ChatScreen />
        </>
    );
}
