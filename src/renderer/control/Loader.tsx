import { lighten, styled } from "@mui/material";
import { FC } from "react";

const LoaderContainer = styled('div')`
  margin: auto;
  width: 300px;
  height: 30px;
  position: relative;
  filter: url(#gooey);

  > * {
    position: absolute;
    display: inline-block;
    left: 0;
    top: 0;
    width: 2rem;
    height: 2rem;
    background: ${p => lighten(p.theme.palette.primary.light, 0.6)};

    border-radius: 50%;
    animation: loading 4s infinite;
    transform: scale(.1);
    opacity: 0;

    &:nth-of-type(1) {
      animation-delay: .5s;
    }
    &:nth-of-type(2) {
      animation-delay: 1s;
    }
    &:nth-of-type(3) {
      animation-delay: 1.5s;
    }
    &:nth-of-type(4) {
      animation-delay: 2s;
    }
  }

  @keyframes loading {
    50% {
      transform: scale(1.25);
      left: 50%;
      opacity: 1;
    }
    100% {
      transform: scale(.1);
      left: 100%;
      opacity: 0;
    }
  }
`
interface IProp {
  ishidden: boolean;
}

export const Loader: FC<IProp> = ({ishidden}) => {
  return ishidden
    ? <div />
    : (
        <>
          <LoaderContainer><div/><div/><div/><div/></LoaderContainer>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" display='none'>
            <defs>
              <filter id="gooey">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
        </>
      )
}
