import axios from "axios";
import { useState } from "react";

export default function UploadTest() {
  const [image, setImage] =
    useState("");

  const uploadImage = async (e) => {
    const file =
      e.target.files[0];

    const formData =
      new FormData();

    formData.append(
      "photo",
      file
    );

    const res =
      await axios.post(
        "http://localhost:5000/api/upload/photo",
        formData
      );

    setImage(res.data.url);
  };

  return (
    <div>
      <input
        type="file"
        onChange={uploadImage}
      />

      {image && (
        <img
          src={image}
          alt=""
          width="200"
        />
      )}
    </div>
  );
}