import { Platform } from "react-native";

const LoginFormView = Platform.select({
    web: require("../../src/views/web/auth/LoginFormWeb").default,
    default: require("../../src/views/mobile/auth/screens/LoginFormScreen").default,
});

export default function LoginFormRoute() {
    return <LoginFormView />;
}
