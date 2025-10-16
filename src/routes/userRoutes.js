console.log('[userRoutes] module loaded');

import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { upload } from '../middleware/multer.js';
import { updateUserAvatar } from '../controllers/userController.js';

const router = Router();

// простой пинг без auth — для диагностики подключения роутера
router.get('/users/ping', (_req, res) => res.json({ ok: true }));

// загрузка аватара — защищённый маршрут
router.patch('/users/me/avatar', authenticate, upload.single('avatar'), updateUserAvatar);

console.log('[userRoutes] registering routes: /users/ping, /users/me/avatar');

export default router;
