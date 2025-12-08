// middleware/ensureLogin.js
module.exports = (req, res, next) => {
  if (!req.session || !req.session.user) {
    req.session.error = 'You must be logged in to access this page';
    return res.redirect('/auth/login');
  }

  next();
};
