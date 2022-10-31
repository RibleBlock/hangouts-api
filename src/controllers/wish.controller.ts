/* eslint-disable camelcase */
import { Request, Response } from 'express';
import wishModel, { CartUser } from '../models/wish.model';

class Wish {
  async updateCartAdm(req: Request, res: Response) {
    const { id_cart } = req.params;
    const { status, reason } = req.body;

    let errors = '';
    try {
      if (!status || !id_cart) {
        errors = 'dados não enviados!';
        throw new Error();
      }

      const { data: CartUser }: {data: CartUser[] | null} = await wishModel.updateCart({
        id_cart: Number(id_cart),
        field: 'status',
        value: `${status}`,
        reason,
      });

      if (!CartUser) {
        errors = 'carrinho não encontrado!';
        throw new Error();
      }

      return res.json({
        data: CartUser,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: errors,
      });
    }
  }

  async sendWish(req: Request, res: Response) {
    const { id_user } = req.params;
    const {
      idAddress, thing, ordertime, date,
    } = req.query;

    let errors = '';
    try {
      const { data: user }: {data: CartUser[] | null} = await wishModel.getCart({ id_user: Number(id_user), status: 'creating' });
      if (!user) {
        errors = 'Usuário não encontrado!';
        throw new Error();
      }

      if (user[0].pizza.length > 0) {
        await user[0].pizza.map(async ({ pizza_flavor }) => {
          await pizza_flavor.map(async ({ flavor: { id_flavor } }) => {
            const { data: flavor, error: flavorErr } = await wishModel.getFlavor({
              id_flavor, date: `${date}`,
            });
            if (flavor) {
              const { data: updateFlavor, error: updateFlavorErr } = await wishModel.updateFlavor({
                id_flavor: flavor![0].id_flavor,
                date: `${date}`,
                value: flavor![0].times_ordered + 1,
              });
            }
          });
        });
      }

      const { data: CartUser }: {data: CartUser[] | null} = await wishModel.updateCart({
        field: 'status',
        value: 'pending',
        id_cart: user[0].id_cart,
        idAddress: Number(idAddress),
        order_time: `${ordertime}`,
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
      } = await wishModel.getCartAdm({ eStatus: ['creating', 'cancel'] });

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
