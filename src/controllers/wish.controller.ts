/* eslint-disable camelcase */
import { Request, Response } from 'express';
import wishModel, { CartUser } from '../models/wish.model';

class Wish {
  async sendWish(req: Request, res: Response) {
    const { id_user } = req.params;
    const { idAddress, thing } = req.query;

    let errors = '';
    try {
      const { data: user } = await wishModel.getCart({ id_user: Number(id_user), status: 'creating' });
      if (!user) {
        errors = 'Usuário não encontrado!';
        throw new Error();
      }

      const date = new Date();
      const hora = date.getHours();
      const min = date.getMinutes();

      const { data: CartUser }: {data: CartUser[] | null} = await wishModel.updateCart({
        field: 'status',
        value: 'pending',
        id_cart: user[0].id_cart,
        idAddress: Number(idAddress),
        order_time: `${hora}:${min}`,
        troco: Number(thing),
      });

      if (!CartUser) {
        errors = 'carrinho não encontrado!';
        throw new Error();
      }

      const { data, error } = await wishModel.createCart({ idUser: CartUser[0].id_user });

      return res.json({
        data: CartUser,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async create(req: Request, res: Response) {
    const {
      table, size, border, flavors, comment, id_user,
    } = req.body;

    const errors: string = '';
    try {
      const { data: cart }: { data: CartUser[] | null} = await wishModel.getCart({ id_user, status: 'creating' });

      if (!cart) {
        return res.status(400).json({
          errors: 'carrinho nao encontrado!',
        });
      }

      const { data, error } = await wishModel.addToCart({
        table, size, border, comment, id_cart: cart![0].id_cart, flavors,
      });
      console.log({ data, error });

      if (error) {
        return res.status(400).json({
          errors: error,
        });
      }

      if (table === 'pizza') {
        flavors.map(async (value: number) => {
          await wishModel.addFlavorToPizza({
            table: 'pizza_flavor', idPizza: data![0].id_pizza!, idFlavor: value,
          });
        });
      }
      return res.status(201).json(
        data,
      );
    } catch (error) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async getCart(req: Request, res: Response) {
    const { id_user } = req.params;
    const { status } = req.query;

    let errors: any;
    try {
      if (!id_user) {
        errors = 'ID não informado.';
        throw new Error();
      }

      const { data, error }: {
         data: CartUser[] | null, error: any,
    } = await wishModel.getCart({ id_user: Number(id_user), status: `${status}` });

      if (!data) {
        errors = error.message;
        throw new Error();
      }

      return res.status(200).json({
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async getCartADM(req: Request, res: Response) {
    let errors: any;
    try {
      const { data, error }: {
         data: CartUser[] | null, error: any,
      } = await wishModel.getCartAdm({ status: 'creating' });

      if (!data) {
        errors = error.message;
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

  async deleteCartItem(req: Request, res: Response) {
    const { id_cart, table } = req.query;

    let errors: any;
    try {
      if (!id_cart) {
        errors = 'ID não encontrado.';
        throw new Error();
      }

      const { data, error }: {
         data: CartUser[] | null, error: any,
    } = await wishModel.deleteItem({ id: Number(id_cart), table: `${table}`.toLowerCase() });

      if (error) {
        errors = error.message;
        throw new Error();
      }

      return res.status(200).json('Item deletado');
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }
}
export default new Wish();
