/* eslint-disable camelcase */
import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModels from '../models/users.model';
import { checkErrorInDB } from '../utils/errorDB.utils';
import { passwordIsValid } from '../utils/checkPassword.util';
import wishModel from '../models/wish.model';

class User {
  async store(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;

    let errors: string = '';
    try {
      if (email && password) {
        const { data: user, error } = await UserModels.read('*, cart!inner(id_cart, status)', { email });

        if (error) {
          errors = error.message;
          throw new Error();
        }
        if (checkErrorInDB(error)) {
          errors = 'Email já existe';
          throw new Error();
        }

        if (!user || user?.length === 0) {
          return res.status(406).json({
            error: 'Usuário não existe',
          });
        }

        const {
          id_user, name, password: passwordHash, phone, admin, cart, is_active,
        } = user[0];

        if (!(await passwordIsValid(password, passwordHash))) {
          return res.status(406).json({
            error: 'Senha inválida',
          });
        }

        if (!is_active) {
          return res.status(401).json({
            error: 'Usuário Desativado',
          });
        }

        const token = jwt.sign({
          id_user, name, email, phone, admin, cart,
        }, 'código_do_serviço_secreto');

        return res.json({
          token,
        });
      }
      return res.status(409).json({
        error: 'Credenciais inválidas',
      });
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;

    let errors: string = '';
    try {
      // validar dados aqui //

      if (name && email && password) {
        const salt = await bcryptjs.genSalt();
        const passwordHash = bcryptjs.hashSync(password, salt);

        const { data, error } = await UserModels.create({ name, email, password: passwordHash });

        if (checkErrorInDB(error)) {
          errors = 'Email já existe';
          throw new Error();
        }
        const { data: cart, error: errorCart } = await wishModel.createCart({
          idUser: data![0].id,
        });

        if (errorCart) {
          return res.status(400).json({
            error: errorCart,
          });
        }

        return res.json({
          data,
          cart,
        });
      }

      return res.json({
        error: 'Credenciais inválidas',
      });
    } catch (error: any) {
      return res.status(406).json({
        error: errors,
      });
    }
  }

  async selectUser(req: Request, res: Response) {
    const {
      id, field, value, password, isAdmin,
    } = req.body;

    try {
      if ((!Number(id) || !String(field)) || (field !== 'name' && field !== 'password' && field !== 'phone' && field !== 'is_active' && field !== 'admin')) {
        return res.status(400).json({
          error: 'Credenciais inválidas',
        });
      }

      const { data: user } = await UserModels.read(
        '*, cart!id_user(*)',
        { id_user: id },
      );

      if (!user || user?.length === 0) {
        return res.status(406).json({
          error: 'Usuário não existe',
        });
      }

      if (!isAdmin && !(await passwordIsValid(password, user[0].password))) {
        return res.status(400).json({
          error: 'Senha invalida.',
        });
      }

      let passwordHash: string = '';
      if (!isAdmin && field === 'password') {
        const salt = await bcryptjs.genSalt();
        passwordHash = bcryptjs.hashSync(value, salt);
      }

      const { data, error } = await UserModels.updateOneUser({
        id_user: id, field, value: passwordHash || value,
      });

      if (error) { // caso erro no supabase
        return res.status(400).json({
          error,
        });
      }
      const {
        id_user, name, email, phone, admin, is_active,
      } = data![0];

      const token = jwt.sign({
        id_user, name, email, phone, admin, is_active, cart: user[0].cart,
      }, 'código_do_serviço_secreto');

      if (isAdmin) {
        return res.json( // sucesso
          data![0],
        );
      }
      return res.json({ // sucesso
        token,
      });
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }

  async getAddress(req: Request, res: Response) {
    const { id } = req.query;

    const errors = '';
    try {
      const { data, error } = await UserModels.readAddress({ id_user: Number(id) });

      if (error) {
        return res.status(400).json({
          error,
        });
      }

      return res.status(200).json(
        data,
      );
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async allUsers(req: Request, res: Response) {
    const { filter } = req.query;

    let errors: string = '';
    try {
      const { data, error } = await UserModels.getAllUsers({ filter: `${filter}` });

      if (error) {
        errors = 'algo nao está certo!';
        throw new Error();
      }

      return res.status(200).json(
        data,
      );
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }
}
export default new User();
