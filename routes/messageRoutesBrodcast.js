import  express from 'express';

import  {getAllMessages,createMessage,getMessageById,updateMessage,deleteMessage} from '../controllers/messageControllerbroadcast.js';
import { authenticate } from "../middleware/authMiddleware.js";

const massagerouteBrodcast = express.Router();


massagerouteBrodcast.get('/getallmassagesbroadcast', getAllMessages);
massagerouteBrodcast.post('/creatmassagebroadcast',authenticate, createMessage);
massagerouteBrodcast.get('/getmassagebroadcast/:id',getMessageById);
massagerouteBrodcast.put('/updatemassagebroadcast/:id',authenticate,updateMessage);
massagerouteBrodcast.delete('/deletemassagebroadcast/:id',authenticate,deleteMessage);
export default massagerouteBrodcast;
