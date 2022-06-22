require('file-loader?name=[name].[ext]!./index.html');
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

var language = (window.navigator.userLanguage || window.navigator.language) || "en";
if (language.includes("en")) language = "en";
else if (language.includes("bg")) language = "bg";

const appElement = document.getElementById("app");

ReactDOM.render(<App language={language} />, appElement);