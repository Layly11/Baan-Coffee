import styled, { keyframes } from 'styled-components'

const load = keyframes`
  from { left: -150px; }
  to { left: 100%; }
`

const Skeleton = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;
  height: 1em;
  overflow: hidden;
  background-color: #f1f1f1;
  &::before {
    display: block;
    position: absolute;
    top: 0px;
    left: -150px;
    width: 150px;
    height: 100%;
    content: '';
    background: linear-gradient(
      to right,
      transparent 0%,
      #e8e8e8 50%,
      transparent 100%
    );
    animation: ${load} 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

export default Skeleton
