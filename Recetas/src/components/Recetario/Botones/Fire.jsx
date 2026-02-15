import React from "react";
import "./Fire.css";

const Fire = ({ color = "#f5f5f5" }) => {
  const fireStyle = { "--fire-color": color };

  return (
    <div className="fire" style={fireStyle}>
      <div className="fire-left">
        <div className="main-fire"></div>
      </div>
      <div className="fire-center">
        <div className="main-fire"></div>
      </div>
      <div className="fire-right">
        <div className="main-fire"></div>
      </div>
      <div className="fire-bottom">
        <div className="main-fire"></div>
      </div>
    </div>
  );
};

export default Fire;
