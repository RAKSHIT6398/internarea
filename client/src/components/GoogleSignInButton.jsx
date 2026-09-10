import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleSignInButton = ({
  disabled = false,
  onCredential,
  onError,
}) => {
  const handleSuccess = (credentialResponse) => {
    const credential = credentialResponse?.credential;

    if (!credential) {
      onError?.("Google credential missing");
      return;
    }

    // Google credential Login.jsx ke handleGoogleLogin me jayega
    onCredential?.(credential);
  };

  const handleError = () => {
    onError?.("Google login failed");
  };

  return (
    <div
      className={`mt-4 flex w-full justify-center ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="380"
        useOneTap={false}
      />
    </div>
  );
};

export default GoogleSignInButton;