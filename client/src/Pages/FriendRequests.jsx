import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";

function FriendRequests() {
  const [requests, setRequests] =
    useState([]);

  const fetchRequests =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await axios.get(
          "http://localhost:5000/api/friend/requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setRequests(
        res.data.requests
      );
    };

  const acceptRequest =
    async (requestId) => {
      const token =
        localStorage.getItem(
          "token"
        );

      await axios.put(
        "http://localhost:5000/api/friend/accept",
        { requestId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchRequests();
    };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Friend Requests
      </h1>

      {requests.map(
        (request) => (
          <div
            key={request._id}
            className="border p-4 rounded mb-3"
          >
            <h3>
              {
                request.userId
                  .name
              }
            </h3>

            <p>
              {
                request.userId
                  .email
              }
            </p>

            <button
              onClick={() =>
                acceptRequest(
                  request._id
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              Accept
            </button>
          </div>
        )
      )}
    </div>
  );
}

export default FriendRequests;