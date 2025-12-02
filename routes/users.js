/**
 * Adhyan Chandhoke
 * Users Routes
 * Handles: logout functionality
 */

const express = require("express");
const router = express.Router();

// LOGOUT ROUTE
// Destroys the user session and redirects to homepage (change as needed - Adhyan Chandhoke)
router.get("/logout", (req, res) => {
    // destroy session
    req.session.destroy(err => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.redirect("/"); 
        }        
        // redirect to homepage or login page
        res.redirect("/"); 
    });
});

module.exports = router;