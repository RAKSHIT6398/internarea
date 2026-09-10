import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";

function Friends() {
  const [friends, setFriends] =
    useState([]);

  const fetchFriends =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await axios.get(
          "http://localhost:5000/api/friend/my-friends",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setFriends(
        res.data.friends
      );
    };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        My Friends
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        {friends.map(
          (friend) => (
            <div
              key={friend._id}
              className="border p-4 rounded shadow"
            >
              <h2>
                {
                  friend
                    .friendId
                    ?.name
                }
              </h2>

              <p>
                {
                  friend
                    .friendId
                    ?.email
                }
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Friends;