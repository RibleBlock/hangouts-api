/* eslint-disable no-prototype-builtins */
import { Request, Response } from 'express';
import flavorsModel from '../models/flavors.model';

class Flavors {
  async readFlavors(req: Request, res: Response) {
    try {
      const { table } = req.query;
      console.log(req.query);

      if (Object.keys(req.query).length !== 1 || !Object.keys(req.query).includes('table')) {
        return res.status(400).json({
          error: 'Credenciais invalidas',
        });
      }

      const { data, error } = await flavorsModel.store({ table: `${table}` });

      if (error) {
        return res.status(400).json(
          error,
        );
      }
      return res.json(
        data,
      );
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }

  async getSizes(req: Request, res: Response) {
    try {
      const { filter } = req.query;

      if (!filter) {
        return res.status(400).json({
          error: 'Credenciais invalidas',
        });
      }

      const { data, error } = await flavorsModel.selectTable({
        table: 'flavor_type',
        filter: `${filter}`,
        columns: `
          *,
          flavor_type_pizza_size!id_flavor_type(pizza_size (*))
        `,
      });

      if (error) {
        return res.status(400).json(
          error,
        );
      }
      return res.json(
        data,
      );
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }

  async getBorders(req: Request, res: Response) {
    try {
      const { filter } = req.query;

      if (Object.keys(req.query).length === 0 || !Object.keys(req.query).includes('filter')) {
        return res.status(400).json({
          error: 'Credenciais invalidas',
        });
      }

      const { data, error } = await flavorsModel.selectTable({
        table: 'pizza_border',
        filter: `${filter}`,
        columns: '*',
      });

      if (error) {
        return res.status(400).json(
          error,
        );
      }
      return res.json(
        data,
      );
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }

  async flavorFilter(req: Request, res: Response) {
    const { table, filter } = req.query;
    console.log({ table, filter });

    try {
      if (Object.keys(req.query).includes('filter')) {
        const { data, error } = await flavorsModel.filterFlavor({
          table: `${table}`,
          filter: `${filter}`,
        });
        if (error) {
          return res.status(400).json({
            error,
          });
        }

        return res.json(
          data,
        );
      }

      return res.status(400).json({
        error: 'Credenciais invalidas',
      });
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }
}
export default new Flavors();
