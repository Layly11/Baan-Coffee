import styled from 'styled-components'
const colors = {
  WHITE: '#ffffff',
  GRAY: '#545454'
}

export const ModalBackgroundContainer = styled.div<{ color?: string }>`
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: auto;
  z-index: 1000;
  font-size: inherit;
  cursor: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: transparent;
    border: 0px solid transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.GRAY};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.GRAY};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-corner {
    display: none;
  }

  .m-modal {
    width: 60% !important;
    max-width: 36em !important;

    @media screen and (max-width: 1366px) {
      width: 70% !important;
    }

    @media screen and (max-width: 450px) {
      width: 90% !important;
    }
  }

  .xl-modal {
    width: 80% !important;
    max-width: 64em !important;

    @media screen and (max-width: 768px) {
      width: 90% !important;
    }
  }

  .l-modal {
    width: 80% !important;
    max-width: 52em !important;

    @media screen and (max-width: 768px) {
      width: 90% !important;
    }
  }

  .m-modal-then-s {
    width: 60% !important;
    max-width: 36em !important;

    @media screen and (max-width: 1366px) {
      width: 70% !important;
    }
  }

  .s-modal {
    width: 28em !important;
    max-width: 28em !important;

    @media screen and (max-width: 450px) {
      width: 90% !important;
    }
  }

  .extra-s-modal {
    width: 24em !important;
    max-width: 24em !important;

    @media screen and (max-width: 768px) {
      width: 70% !important;
    }

    @media screen and (max-width: 500px) {
      width: 90% !important;
    }
  }

  .s-modal-menu-panel {
    grid-template-columns: 1fr !important;
    width: 100% !important;
  }

  .s-modal-t-sl {
    width: 500px !important;

    @media screen and (max-width: 768px) {
      width: 70% !important;
    }
  }
  .alert-img {
    display: flex;
    justify-content: center;
    vertical-align: center;
    width: 100%;
    margin-top: 15vw;
  }

  .desc {
    font-size: 1em;
    font-weight: 200;
    margin-top: 0;
  }
`

export const ModalContainer = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  max-width: 656px;
  margin-top: auto;
  margin-bottom: auto;
  box-sizing: border-box;
  transition: all ease 0.2s;

  @media screen and (max-width: 1366px) {
    width: 70%;
  }

  @media screen and (max-width: 450px) {
    width: 90% !important;
  }

  &.center {
    margin: 0;
  }
`

export const ModalCard = styled.div`
  display: flex;
  flex-direction: column;

  .desc {
    font-size: 1em;
    font-weight: 200;
  }

  .confirm-button-panel {
    display: grid;
    justify-content: flex-end;
    grid-template-columns: auto auto;
    grid-gap: 1em;
  }

  .step-header-container {
    display: grid;
    grid-template-columns: auto auto auto;
    column-gap: 1em;
    row-gap: 0.5em;
    justify-content: flex-start;
  }

  .step-header-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.5em;
    align-items: center;

    .text {
      font-weight: 500;
    }

    .icon-container {
      background-color : #F2F5FF;
      width: 2em;
      height: 2em;
      border-radius: 0.75em;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      width: 1em;
      height: 1em;
    }
  }
`

export const ModalCardBody = styled.div`
  padding: 24px 32px;
  border-radius: 2em;
  background-color: white;

  .close-btn {
    position: absolute;
    right: 0px;
    width: 32px;
    height: 32px;
    opacity: 0.3;
    z-index: 1;
    transition: all ease 0.2s;
  }
  .close-btn:hover {
    opacity: 1;
  }
  .close-btn:before, .close-btn:after {
    position: absolute;
    left: 15px;
    content: ' ';
    height: 24px;
    width: 2px;
    background-color: #333;
  }
  .close-btn:before {
    transform: rotate(45deg);
  }
  .close-btn:after {
    transform: rotate(-45deg);
  }

  .title {
    font-size: 1.75em;
    font-weight: 1000;
  }

  .sub-title {
    color: #92a3b9;
    font-size: 1em;
    font-weight: 200;
  }

  .label {
    font-size: 1em;
    color: #92a3b9;
  }
  .sub-label {
    font-size: 1em;
    color: #92a3b9;
  }
  .value {
    font-size: 1em;

    overflow-wrap: break-word;
  }
  .sub-value {
    font-size: 1em;

    overflow-wrap: break-word;
  }

  .input-label {
    font-size: 1em;
    color: #92a3b9;
  }

  textarea::placeholder {
    color: #92a3b9;
    opacity: 0.5;
  }
`

interface ITextAreaFeild {
  $invalid: boolean
  $disabled: boolean
}
export const TextAreaFeild = styled.textarea<ITextAreaFeild>`
  width: 100%;
  line-height: 1em;
  color:#0C2F5F;
  opacity: 1;
  font-weight: 300;
  font-size: 1em;
  resize: none;
  border-radius: 0.5em;
  border: 1px solid ${(props) => (props.$invalid ? 'rgba(242, 27, 63, 1)' : '#e2e9f2')};
  ${(props) => (props.$disabled ? 'background-color: #fafbfd;' : '')}
  font-family: 'Kanit';
  transition: all ease 0.2s;
  padding: 1em;
  box-sizing: border-box; /* Opera/IE 8+ */
  
  &:focus {
    outline: none;
    border-color: ${'#545454'};
  }
  ${props =>
    props.$disabled
      ? ''
      : `
    &:hover {
      border-color: ${'#545454'};
    }
    `
}
`

interface IButtonContainer {
  $backgroundColor: string
  $color: string
}
export const ButtonContainer = styled.div<IButtonContainer>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  height: 45px;
  background-color: ${(props) => props.$backgroundColor ?? '#fafbfd'};
  border: 1px solid ${(props) => props.$color ?? '#e2e9f2'};;
  border-radius: 10px;
  color: ${(props) => props.$color ?? 'auto'};
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  cursor: pointer;
`
