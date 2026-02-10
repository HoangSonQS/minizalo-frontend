import "zmp-ui/zaui.css";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Button, Input } from "zmp-ui";
import authService from "@/shared/services/authService";

const COLORS = {
    primary: "#0068FF",
    white: "#fff",
    text: "#333",
    textSecondary: "#666",
    border: "#e0e0e0",
};

export default function RegisterFormWeb() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");
        if (!name.trim()) {
            setError("Vui lòng nhập tên");
            return;
        }
        if (!phone.trim()) {
            setError("Vui lòng nhập số điện thoại");
            return;
        }
        if (!/^[0-9]{10,11}$/.test(phone)) {
            setError("Số điện thoại phải có 10-11 chữ số");
            return;
        }
        if (!email.trim()) {
            setError("Vui lòng nhập email");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Email không hợp lệ");
            return;
        }
        if (!password) {
            setError("Vui lòng nhập mật khẩu");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp");
            return;
        }

        setLoading(true);
        try {
            await authService.signup({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                password,
            });
            router.replace("/(auth)/login-form");
        } catch (err: any) {
            const message =
                err.response?.data?.message ||
                "Đăng ký thất bại. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: COLORS.white,
                padding: 24,
            }}
        >
            <div
                style={{
                    paddingTop: 20,
                    paddingBottom: 20,
                }}
            >
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: 24,
                        color: COLORS.text,
                        cursor: "pointer",
                        padding: "12px 16px",
                    }}
                >
                    ←
                </button>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 32,
                    marginBottom: 40,
                }}
            >
                <h1
                    style={{
                        fontSize: 28,
                        fontWeight: "bold",
                        color: COLORS.primary,
                        textAlign: "center",
                        margin: 0,
                    }}
                >
                    Đăng ký
                </h1>
            </div>

            <div style={{ maxWidth: 400, margin: "0 auto" }}>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Tên"
                        value={name}
                        onChange={(e: any) => setName(e.target?.value ?? e)}
                        disabled={loading}
                        style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            padding: "12px 0",
                            fontSize: 16,
                        }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e: any) => setPhone(e.target?.value ?? e)}
                        disabled={loading}
                        style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            padding: "12px 0",
                            fontSize: 16,
                        }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e: any) => setEmail(e.target?.value ?? e)}
                        disabled={loading}
                        style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            padding: "12px 0",
                            fontSize: 16,
                        }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e: any) => setPassword(e.target?.value ?? e)}
                        disabled={loading}
                        style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            padding: "12px 0",
                            fontSize: 16,
                        }}
                    />
                </div>
                <div style={{ marginBottom: 16 }}>
                    <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e: any) =>
                            setConfirmPassword(e.target?.value ?? e)
                        }
                        disabled={loading}
                        style={{
                            borderBottom: `1px solid ${COLORS.border}`,
                            padding: "12px 0",
                            fontSize: 16,
                        }}
                    />
                </div>

                {error ? (
                    <p
                        style={{
                            color: "#d32f2f",
                            fontSize: 14,
                            marginBottom: 12,
                        }}
                    >
                        {error}
                    </p>
                ) : null}

                <Button
                    fullWidth
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? "#88b4ff" : COLORS.primary,
                        borderRadius: 25,
                        padding: "14px 24px",
                        color: COLORS.white,
                        fontWeight: 600,
                        fontSize: 16,
                        border: "none",
                        marginTop: 16,
                        marginBottom: 40,
                    }}
                >
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
            </div>
        </div>
    );
}
