/* eslint-disable camelcase */
import { Request, Response } from 'express';
import addressModel from '../models/address.model';

class Address {
  async newAddress(req: Request, res: Response) {
    const dataAddress = req.body;

    let errors = '';
    try {
      const { data, error } = await addressModel.addAddress(dataAddress);

      if (error) {
        errors = `${error.code} - ${error.message}`;
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

  async removeAddress(req: Request, res: Response) {
    const { id } = req.query;

    let errors = '';
    try {
      const { data: address } = await addressModel.getAddress({ id_address: Number(id) });

      if (!address) {
        errors = 'Endereço não encontrado!';
        throw new Error();
      }

      const { is_active } = address[0];

      const { data, error } = await addressModel.deleteAddress({
        id_address: Number(id),
        is_active: !is_active,
      });

      if (error) {
        errors = `${error.code} - ${error.message}!`;
        throw new Error();
      }

      if (data?.length === 0) {
        errors = 'Endereço não existe!';
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
}
export default new Address();
