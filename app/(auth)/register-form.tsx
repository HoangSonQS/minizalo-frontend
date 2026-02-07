import { Platform } from "react-native";

const RegisterFormView = Platform.select({
    web: require("../../src/views/web/auth/LoginWeb").default, // TODO: Create RegisterWeb
    default: require("../../src/views/mobile/auth/screens/RegisterFormScreen").default,
});

export default function RegisterFormRoute() {
    return <RegisterFormView />;
}
