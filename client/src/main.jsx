// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// import "./index.css";
// import App from "./App.jsx";

// const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// if (!googleClientId) {
//   console.error(
//     "VITE_GOOGLE_CLIENT_ID missing hai. Frontend ke root folder me .env file check karein."
//   );
// }

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId={googleClientId}>
//       <App />
//     </GoogleOAuthProvider>
//   </StrictMode>
// );
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.error(
    "VITE_GOOGLE_CLIENT_ID missing hai. Frontend ke root folder me .env file check karein."
  );
}

// ✅ Hidden Google Translate Container Create
const gtDiv = document.createElement("div");
gtDiv.id = "google_translate_element";
gtDiv.style.display = "none";
document.body.appendChild(gtDiv);

// ✅ Google Translate Initialize Function
window.googleTranslateElementInit = function () {
  new window.google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: "en,hi,es,pt,zh-CN,fr",
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    "google_translate_element"
  );
};

// ✅ Load Google Translate Script
const gtScript = document.createElement("script");
gtScript.type = "text/javascript";
gtScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
document.body.appendChild(gtScript);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);