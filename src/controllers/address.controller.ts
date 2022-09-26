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
      return res.status(200).json({
        data,
      });
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
      const { data, error } = await addressModel.deleteAddress({ id_address: Number(id) });

      if (error) {
        errors = `${error.code} - ${error.message}`;
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
