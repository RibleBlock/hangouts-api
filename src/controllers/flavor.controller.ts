/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
import { Request, Response } from 'express';
import flavorsModel from '../models/flavors.model';

class Flavors {
  async readFlavors(req: Request, res: Response) {
    try {
      const { table } = req.query;

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

  async relatorioMensal(req: Request, res: Response) {
    try {
      const { data, error } = await flavorsModel.store({ table: 'flavor' });

      if (!error) {
        const date = new Date();
        const dateString = `${date.getFullYear()}-${(date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}`;

        const dataInsert: { id_flavor: any; times_ordered: number; date: string; }[] = [];
        data?.map(({ id_flavor }) => {
          dataInsert.push({ id_flavor, times_ordered: 0, date: dateString });
        });

        const { data: dataReport, error: errorReport } = await flavorsModel
          .createRelatorio(dataInsert);

        if (!errorReport && !error) {
          res.status(200).json({
            data: dataReport,
          });
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  async updateFlavor(req: Request, res: Response) {
    const { id_flavor } = req.params;
    const {
      name, ingredients, image, id_type, id_category,
    } = req.body;

    try {
      const { data, error } = await flavorsModel.updateFlavor({
        table: 'flavor',
        object: {
          name,
          ingredients,
          id_flavor: Number(id_flavor),
          id_flavor_type: id_type,
          id_flavor_category: id_category,
        },
        filter: { id_flavor: Number(id_flavor) },
      });

      if (!data) {
        return res.status(400).json({
          error,
        });
      }
      if (data[0].id_image !== null) {
        const { data: updateData, error: updateError } = await flavorsModel.updateFlavor({
          table: 'image',
          object: { url_image: image },
          filter: { id: data[0].id_image },
        });

        if (!updateData) {
          return res.status(400).json({
            error: updateError?.message,
          });
        }
      } else {
        const { data: imageData, error: imageError } = await flavorsModel.createImage({ image });

        if (!imageData) {
          return res.status(400).json({
            error: imageError?.message,
          });
        }
        console.log(imageData);
        const { data, error } = await flavorsModel.updateFlavor({
          table: 'flavor',
          object: { id_image: imageData[0].id },
          filter: { id_flavor: Number(id_flavor) },
        });
        console.log({ data, error });
      }

      return res.json({
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        error,
      });
    }
  }
}
export default new Flavors();
