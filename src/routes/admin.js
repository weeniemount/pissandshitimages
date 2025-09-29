const { supabase } = require('../utils/db.js');
const { getHashedIP } = require('../middleware/ipCheck.js');
const { generateSessionToken, authenticateAdmin, recordLoginAttempt, isRateLimited } = require('../middleware/adminCheck.js');
const express = require('express');
const adminRouter = express.Router();
const { getImageStats } = require('../utils/image.js');
const bcrypt = require('bcrypt');

const adminLoginRouter = require('./admin/login.js');
const adminLogoutRouter = require('./admin/logout.js');
const adminSessionsRouter = require('./admin/sessions.js');
const adminPasswordRouter = require('./admin/changePassword.js');
const adminPanelRouter = require('./admin/panel.js');
const adminIpBanRouter = require('./admin/ipBan.js');
const adminVisibillityRouter = require('./admin/toggleVisibillity.js');
const adminDeleteRouter = require('./admin/delete.js');
const adminDiscordBanRouter = require('./admin/discordBan.js');

adminRouter.use('/', adminLoginRouter)
adminRouter.use('/', adminLogoutRouter);
adminRouter.use('/', adminSessionsRouter);
adminRouter.use('/', adminPasswordRouter);
adminRouter.use('/', adminPanelRouter);
adminRouter.use('/', adminIpBanRouter);
adminRouter.use('/', adminVisibillityRouter);
adminRouter.use('/', adminDeleteRouter);
adminRouter.use('/', adminDiscordBanRouter);

module.exports = adminRouter;