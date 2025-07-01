import { useSelector } from "react-redux";
import styled, { ThemeProvider, css } from "styled-components";
import type { UseSelectorProps } from "../../props/useSelectorProps";
import type { JSX, ReactNode } from "react";
import React from "react";

interface ButtonProps {
  $authen?: boolean;
  $primary?: boolean;
  $hidden?: boolean;
  $secondary?: boolean;
  $success?: boolean;
  $danger?: boolean;
  $normal?: boolean;
  $primaryalt?: boolean;
  $secondaryalt?: boolean;
  $successalt?: boolean;
  $dangeralt?: boolean;
  $normalalt?: boolean;
  $userCloseAlt?: boolean;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  $disabled?: boolean;
  $loading?: boolean;
  type?: string;
}

const Button = styled.button<ButtonProps>`
  display: block;
  width: 100%;
  height: 35px;
  outline: none;
  border: none;
  border-radius: 10px;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  > i {
    margin-right: 5px;
  }
  @media (max-width: 1024px) {
    font-size: 0.5em;
  }

  ${(props) =>
    props.$authen === true &&
    css`
      background: rgba(166, 146, 238, 1);
    `}
  ${(props) =>
    props.$primary === true &&
    css`
      background: #6f4e37;
    `}
${(props) =>
    props.$secondary === true &&
    css`
      background: #a47149;
    `}
${(props) =>
    props.$success === true &&
    css`
      background: #8b5e3c;
    `}
${(props) =>
    props.$danger === true &&
    css`
      background: #d96e54;
    `}
${(props) =>
    props.$normal === true &&
    css`
      background: #3e2723;
      box-shadow: 0px 5px 10px rgba(62, 39, 35, 0.35);
    `}

${(props) =>
    props.$primaryalt === true &&
    css`
      border: 0.5px solid #6f4e37;
      background: white;
    `}
${(props) =>
    props.$secondaryalt === true &&
    css`
      border: 0.5px solid #a47149;
      background: white;
    `}
${(props) =>
    props.$successalt === true &&
    css`
      border: 2px solid #8b5e3c;
      background: white;
    `}
${(props) =>
    props.$dangeralt === true &&
    css`
      border: 0.5px solid #d96e54;
      background: white;
    `}
${(props) =>
    props.$normalalt === true &&
    css`
      border: 2px solid #3e2723;
      background: white;
      box-shadow: 0px 5px 10px rgba(62, 39, 35, 0.35);
    `}
  ${(props) =>
    props.$normalalt === true &&
    css`
      border: 2px solid rgba(12, 47, 95, 1);
      background: white;
      box-shadow: 0px 5px 10px rgba(12, 47, 95, 0.35);
    `}
  ${(props) =>
    props.$userCloseAlt === true &&
    css`
      border: 2px solid rgb(237, 237, 237, 1);
      background: white;
    `}
   ${(props) =>
    (props.$disabled ?? false) &&
    css`
      background: rgba(0, 0, 0, -0.5);
      color: #b0b0b0;
      cursor: not-allowed;
      opacity: 0.3;
      &:hover {
        cursor: not-allowed;
        transform: translateY(0px);
        opacity: 0.5;
      }
    `}

    ${(props) =>
    props.$loading === true &&
    css`
      border: 2px solid #bcb7cd;
      background: rgba(0, 0, 0, 0.3);
      cursor: wait;
      &:hover {
        cursor: wait;
        transform: translateY(0px);
        opacity: 1;
      }
    `}
`;

const Childen = styled.span.attrs<ButtonProps>((props) => ({}))<
  ButtonProps & {
    $primaryalt?: boolean;
    $secondaryalt?: boolean;
    $successalt?: boolean;
    $dangeralt?: boolean;
    $normalalt?: boolean;
    $userCloseAlt?: boolean;
    disabled?: boolean;
  }
>`
  font-weight: 400;
  color: white;
  ${(props) =>
    props.disabled !== true &&
    props.$primaryalt === true &&
    css`
      color: #6f4e37;
    `}
  ${(props) =>
    props.disabled !== true &&
    props.$secondaryalt === true &&
    css`
      color: #a47149;
    `}
${(props) =>
    props.disabled !== true &&
    props.$successalt === true &&
    css`
      color: #8b5e3c;
    `}
${(props) =>
    props.disabled !== true &&
    props.$dangeralt === true &&
    css`
      color: #d96e54;
    `}
${(props) =>
    props.disabled !== true &&
    props.$normalalt === true &&
    css`
      color: #3e2723;
    `}
  ${(props) =>
    props.disabled !== true &&
    props.$userCloseAlt === true &&
    css`
      color: #242146;
    `}
  ${(props) =>
    props.disabled === true &&
    css`
      color: rgba(12, 47, 95, 1);
    `}
`;

const ButtonWrapper = (props: ButtonProps): JSX.Element => {
  return (
    <>
      {props.$hidden !== true && (
        <Button
          {...props}
          $authen={props.$authen}
          $primary={props.$primary}
          $secondary={props.$secondary}
          $success={props.$success}
          $danger={props.$danger}
          $normal={props.$normal}
          $primaryalt={props.$primaryalt}
          $successalt={props.$successalt}
          $dangeralt={props.$dangeralt}
          $normalalt={props.$normalalt}
          $secondaryalt={props.$secondaryalt}
          disabled={props.$disabled}
          $loading={props.$loading}
          onClick={props.onClick}
        >
          <Childen
            $primaryalt={props.$primaryalt}
            $secondaryalt={props.$secondaryalt}
            $successalt={props.$successalt}
            $dangeralt={props.$dangeralt}
            $normalalt={props.$normalalt}
            $userCloseAlt={props.$userCloseAlt}
            disabled={props.$disabled}
          >
            {props.children}
          </Childen>
        </Button>
      )}
    </>
  );
};

export default ButtonWrapper;
