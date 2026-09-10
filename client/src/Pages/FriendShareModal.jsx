import React from "react";

function FriendShareModal({
  friends,
  postId,
  onShare,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

      <div className="bg-white p-5 rounded w-96">

        <h2 className="text-xl font-bold mb-4">
          Share Post
        </h2>

        {friends.map(
          (friend) => (
            <div
              key={
                friend._id
              }
              className="flex justify-between mb-3"
            >
              <span>
                {
                  friend
                    .friendId
                    ?.name
                }
              </span>

              <button
                onClick={() =>
                  onShare(
                    postId,
                    friend
                      .friendId
                      ._id
                  )
                }
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Share
              </button>

            </div>
          )
        )}

        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          Close
        </button>

      </div>

    </div>
  );
}

export default FriendShareModal;