import express from 'express';
import flavorController from './controllers/flavor.controller';
import usersControllers from './controllers/users.controller';
import wishControllers from './controllers/wish.controller';

const route = express.Router();

route.patch('/updateuserdata', usersControllers.selectUser);

route.get('/allusers', usersControllers.allUsers);
route.post('/login', usersControllers.store);
route.post('/createUser', usersControllers.create);
route.get('/getaddress', usersControllers.getAddress);

route.post('/makewish', wishControllers.create);
route.get('/getcart/:id_cart', wishControllers.getCart); /// PARAMS

route.get('/createnewmonth', flavorController.relatorioMensal);
route.get('/flavors', flavorController.readFlavors); /// QUERY
route.get('/flavorsfilter', flavorController.flavorFilter); /// QUERy
route.get('/sizes', flavorController.getSizes); /// QUEry
route.get('/borders', flavorController.getBorders); /// QUery?

export default route;
