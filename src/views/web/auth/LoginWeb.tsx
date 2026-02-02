import React from "react";
import { Page, Input, Button, Box } from "zmp-ui";
import "zmp-ui/zaui.css";

export default function LoginWeb() {
    const [phone, setPhone] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = () => {
        console.log("Login Web:", { phone, password });
        // TODO: Implement login logic
    };

    return (
        <Page className="page">
            <Box
                flex
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #0068FF 0%, #0054CC 100%)",
                    padding: "20px",
                }}
            >
                <Box
                    style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "40px",
                        maxWidth: "400px",
                        width: "100%",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h1
                        style={{
                            color: "#0068FF",
                            fontSize: "32px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            textAlign: "center",
                        }}
                    >
                        MiniZalo
                    </h1>
                    <p
                        style={{
                            color: "#666",
                            fontSize: "14px",
                            marginBottom: "32px",
                            textAlign: "center",
                        }}
                    >
                        Đăng nhập để tiếp tục
                    </p>

                    <Input
                        type="text"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.currentTarget.value)}
                        style={{ marginBottom: "16px" }}
                    />

                    <Input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
                        style={{ marginBottom: "24px" }}
                    />

                    <Button
                        fullWidth
                        onClick={handleLogin}
                        style={{
                            background: "#0068FF",
                            color: "white",
                            fontWeight: "600",
                            height: "48px",
                            borderRadius: "8px",
                        }}
                    >
                        Đăng nhập
                    </Button>

                    <p
                        style={{
                            textAlign: "center",
                            marginTop: "16px",
                            fontSize: "14px",
                            color: "#666",
                        }}
                    >
                        Chưa có tài khoản?{" "}
                        <a href="#" style={{ color: "#0068FF", fontWeight: "600" }}>
                            Đăng ký ngay
                        </a>
                    </p>
                </Box>
            </Box>
        </Page>
    );
}
