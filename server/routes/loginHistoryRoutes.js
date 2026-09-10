
const { deleteLoginHistory } = require("../controllers/authController"); 

router.delete("/login-history/:id", isAuthenticated, deleteLoginHistory);