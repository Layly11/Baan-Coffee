import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import Image from "next/image";
import axios from "axios";
import swalInstance, { Alert } from "@/helpers/sweetalert";
import { useRouter } from "next/router";

type ForgotPasswordForm = {
    email: string;
};

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();
      const router = useRouter()
      const [loading, setLoading] = useState(false); 
    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
             setLoading(true);
            await axios.post(`/api/authen/forgot-password`, data)
             setLoading(false); 
            router.replace('/login')
            swalInstance.fire({
                icon: 'success',
                title: 'Password Reset Email Sent',
                text: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว',
                timer: 2500,
                showConfirmButton: false
            });


        } catch (err) {
          setLoading(false)
            Alert({ data: err })
        }
    };

    return (
        <Wrapper>
            <Card>
                <Image
                    src="/sign_in.png"
                    width={550}
                    height={550}
                    style={{ width: "70%", height: "30%", marginBottom: "-20px", marginTop: "-30px" }}
                    alt="sign in logo"
                    loading="eager"
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                />
                {/* <Logo>BaanCoffee</Logo> */}
                <Title>Forgot your password?</Title>
                <Subtitle>Don’t worry, we’ll help you reset it</Subtitle>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", { required: "Email is required" })}
                    />
                    {errors.email && <Error>{errors.email.message}</Error>}

                    <Button type="submit" disabled={loading}>
                        {loading ? "Sending..." : "Send"}
                    </Button>
                </Form>
            </Card>
        </Wrapper>
    );
}

// styled-components
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f9f5f0; /* ครีม */
`;

const Card = styled.div`
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0px 6px 20px rgba(93, 58, 0, 0.15);
  text-align: center;
  width: 380px;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #5d3a00; /* น้ำตาลเข้ม */
  margin-bottom: 10px;
`;

const Title = styled.h2`
  margin: -20px 0 5px;
  font-size: 20px;
  font-weight: 600;
  color: #3c2a1e;
`;

const Subtitle = styled.p`
  color: #8c7a65;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #d3c5b2;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #5d3a00;
    box-shadow: 0 0 4px rgba(93, 58, 0, 0.4);
  }
`;

const Error = styled.p`
  color: #b23b3b;
  font-size: 12px;
  text-align: left;
`;

const Button = styled.button`
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #5d3a00;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    background: #472b00;
  }
`;
