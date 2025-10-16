// pages/reset-password.tsx
import swalInstance, { Alert } from "@/helpers/sweetalert";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f3ef; /* ครีมโทนอบอุ่น */
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem 2.5rem; 
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(111, 78, 55, 0.15);
  width: 380px;
  border: 1px solid #ede6db;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #6f4e37; /* กาแฟเข้ม */
  font-family: "Georgia", serif;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #8b7355;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 90%;
  padding: 0.75rem 1rem;
  border: 1px solid #d6ccc2;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  font-family: "Arial", sans-serif;
  &:focus {
    outline: none;
    border-color: #6f4e37;
    box-shadow: 0 0 0 3px rgba(111, 78, 55, 0.25);
  }
`;

const PasswordRules = styled.ul`
  font-size: 0.85rem;
  list-style: none;
  margin: 0.5rem 0 1.2rem;
  padding: 0;
`;

const Rule = styled.li<{ valid: boolean }>`
  margin-bottom: 0.4rem;
  color: ${({ valid }) => (valid ? "#4caf50" : "#b91c1c")};
  font-family: "Arial", sans-serif;
  &:before {
    content: ${({ valid }) => (valid ? '"✔ "' : '"✘ "')};
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.9rem;
  background: ${({ disabled }) => (disabled ? "#d6ccc2" : "#6f4e37")};
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  font-family: "Arial", sans-serif;

  &:hover {
    background: ${({ disabled }) => (disabled ? "#d6ccc2" : "#5a3f2b")};
  }
`;

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = router.query
  const rules = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    length: password.length >= 12 && password.length <= 20,
    match: password === confirm && password.length > 0,
  };

  const handleSubmit = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (token) {
        await axios.post('/api/authen/reset-password', { token, password })
        router.push("/login");
        swalInstance.fire({
          icon: 'success',
          title: 'Password Reset Email Password reset successfully',
          text: 'รหัสผ่านถูกresetเรียบร้อย',
          timer: 2500,
          showConfirmButton: false
        });

      }
    } catch (err) {
      Alert({ data: err })
    } finally {
      setLoading(false);
    }
  }


  const checkExpireToken = async () => {
    try {
      const res = await axios.post('/api/authen/check-expire-token', { token })

      if (res.data !== null) {
        const valid = res.data.data.valid

        if (valid === false) {
          router.replace('/login')
          swalInstance.fire({
            icon: 'error',
            title: 'Token expired',
            text: 'หมดเวลาในการ reset password',
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    } catch (err) {
      Alert({ data: err })
    }

  }
  useEffect(() => {
    if (!token) return;

    checkExpireToken()
  }, [token])

  const allValid = Object.values(rules).every(Boolean);

  return (
    <Container>
      <Card>
        <Title>BaanCoffee</Title>
        <Subtitle>Change Password</Subtitle>

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <PasswordRules>
          <Rule valid={rules.lowercase}>At least one lowercase character (a-z)</Rule>
          <Rule valid={rules.uppercase}>At least one uppercase character (A-Z)</Rule>
          <Rule valid={rules.number}>At least one number (0-9)</Rule>
          <Rule valid={rules.length}>At least 12 - 20 characters</Rule>
          <Rule valid={rules.match}>Password and Confirm Password must match</Rule>
        </PasswordRules>

        <Button disabled={!allValid || loading} onClick={handleSubmit}>Confirm</Button>
      </Card>
    </Container>
  );
}
