const { supabase } = require('../config/supabase');

/**
 * Authentication & Authorization Middleware for ExamSync Admin Endpoints.
 * Verifies Supabase Bearer token and confirms user profile has role = 'admin'.
 */
async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired authentication session.',
      });
    }

    // Query database for authoritative user profile role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Account profile not found.',
      });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Administrator privileges required to perform this action.',
      });
    }

    // Attach authenticated admin to request object
    req.user = user;
    req.adminProfile = profile;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Unexpected verification error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authorization error.',
    });
  }
}

/**
 * Optional / Permissive auth middleware for read endpoints that can be viewed
 * by authenticated students or admins.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.',
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session invalid or expired.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal auth error.' });
  }
}

module.exports = {
  requireAdminAuth,
  requireAuth,
};
