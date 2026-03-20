import React from 'react';
import styled from 'styled-components';


const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <div className="progress" data-percentage="100%" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`   
.loader {
    width: 400px;
    height: 32px;
    background-color: #000000;
    position: relative;
    overflow: hidden;
    border: 3px solid white;
}

.progress {
    width: 0%;
    height: 100%;
    background-color: #ffffff;
    position: absolute;
    top: 0;
    left: 0;
    animation: progress-animation 3s ease-in-out forwards infinite;
}

.progress::after {
    content: attr(data-percentage);
    position: absolute;
    top: 50%;
    left: 50%;
    font-weight: bold;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    color: black;
  }

  @keyframes progress-animation {
    0% {
      width: 0%;
    }
    25% {
      width: 25%;
    }
    50% {
      width: 50%;
    }
    75% {
      width: 75%;
    }
    100% {
      width: 100%;
    }
  }

  @keyframes percentage-animation {
    0% {
      content: "0%";
    }
    25% {
      content: "25%";
    }
    50% {
      content: "50%";
    }
    75% {
      content: "75%";
    }
    100% {
      content: "100%";
    }
  }

  .progress::after {
    animation: percentage-animation 3s ease-in-out forwards infinite;
  }`;

export default Loader;