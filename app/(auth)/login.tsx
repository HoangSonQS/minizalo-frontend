import { Platform } from "react-native";

// View Splitter Pattern: Dynamically import platform-specific views
const LoginView = Platform.select({
    web: require("../../src/views/web/auth/LoginWeb").default,
    default: require("../../src/views/mobile/auth/screens/LoginScreen").default,
});

export default function LoginRoute() {
    return <LoginView />;
}
