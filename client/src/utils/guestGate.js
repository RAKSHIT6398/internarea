import Swal from "sweetalert2";

/* 🔒 Guest action pe login gate — login ke baad wapas isi page pe */
export const requireAuth = (navigate, location, action = "continue") => {
  const token = localStorage.getItem("token");
  if (token) return true;

  Swal.fire({
    icon: "info",
    title: "Login Required",
    text: `${action} karne ke liye pehle login ya register karein`,
    confirmButtonText: "Login / Signup",
    showCancelButton: true,
    cancelButtonText: "Browse more",
    background: "#0b1329",
    color: "#fff",
    confirmButtonColor: "#6366f1",
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
    }
  });

  return false;
};