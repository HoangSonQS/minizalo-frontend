import "zmp-ui/zaui.css";
import React from "react";
import { useRouter } from "expo-router";
import { Button } from "zmp-ui";

const COLORS = {
    primary: "#0068FF",
    white: "#fff",
    text: "#333",
    textSecondary: "#666",
};

export default function LoginScreenWeb() {
    const router = useRouter();

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: COLORS.white,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 280,
                }}
            >
                <h1
                    style={{
                        fontSize: 48,
                        fontWeight: "bold",
                        color: COLORS.primary,
                        marginBottom: 80,
                        margin: "0 0 80px 0",
                    }}
                >
                    MiniZalo
                </h1>

                <div style={{ width: "100%" }}>
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            fullWidth
                            onClick={() => router.push("/(auth)/login-form")}
                            style={{
                                backgroundColor: COLORS.primary,
                                borderRadius: 25,
                                padding: "14px 24px",
                                color: COLORS.white,
                                fontWeight: "bold",
                                fontSize: 14,
                                border: "none",
                            }}
                        >
                            ĐĂNG NHẬP
                        </Button>
                    </div>
                    <div>
                        <Button
                            fullWidth
                            onClick={() => router.push("/(auth)/register-form")}
                            style={{
                                backgroundColor: "#e5e5e5",
                                borderRadius: 25,
                                padding: "14px 24px",
                                color: COLORS.text,
                                fontWeight: "bold",
                                fontSize: 14,
                                border: "none",
                            }}
                        >
                            ĐĂNG KÝ
                        </Button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {}}
                    style={{
                        marginTop: 24,
                        background: "none",
                        border: "none",
                        color: COLORS.textSecondary,
                        fontSize: 14,
                        cursor: "pointer",
                        padding: 0,
                    }}
                >
                    Quên mật khẩu
                </button>
            </div>
        </div>
    );
}
