import { Platform } from "react-native";
import GlobalSearchMobileScreen from "@/views/mobile/contacts/GlobalSearchMobileScreen";
import SearchUsersScreen from "@/views/web/components/SearchUsersScreen";

export default function ContactsSearchScreen() {
    if (Platform.OS === "web") {
        // Bản web: dùng lại SearchUsersScreen với ô tìm kiếm riêng
        return <SearchUsersScreen />;
    }
    return <GlobalSearchMobileScreen />;
}

