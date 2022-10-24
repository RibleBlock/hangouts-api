/* eslint-disable camelcase */
import supabase from '../config/supabase';

interface Pedido {
  id_pizza?: number;
  size: number | null;
  border: string;
  flavors?: number[];
  comment?: string;
  id_cart: number;
}

export interface CartUser {
  id_cart: number;
  created_at: string;
  id_user: number;
  status: string | null;
  pizza: [
    {
      id: number;
      created_at: string;
      id_pizza_size: number;
      id_pizza_border: number;
      comment: string;
      pizza_size: {
        id_pizza_size: number;
        created_at: string;
        name: string;
        price: number;
        quantidade_flavors: number;
      };
      pizza_border: {
        id_pizza_border: number;
        created_at: string;
        name: string;
        price: number;
      };
      pizza_flavor: [
        {
          flavor: {
            id_flavor: number;
            created_at: string;
            name: string;
            id_flavor_type: number;
            id_flavor_category: number;
            id_image: number | null;
          };
        }
      ];
    }
  ];
  calzone: [
    {
      id_calzone: number;
      created_at: string;
      comment: string;
      id_calzone_flavor: number;
      calzone_flavor: {
        id_calzone_flavor: number;
        created_at: string;
        name: string;
        price: number;
        id_image: number | null;
      };
    }
  ];
  drink_cart: [
    {
      id_drink_cart: number;
      created_at: string;
      id_cart: number;
      id_drink: number;
      id_drink_size: number;
      drink: {
        name_drink: string;
      };
      drink_size: {
        id_drink_size: number;
        created_at: string;
        name_drink_size: string;
        price: number;
      };
    }
  ];
}

interface Report {

      id_report: 21,
      created_at: '2022-10-01T03:03:55.110148+00:00',
      date: '2022-10',
      times_ordered: 0,
      id_flavor: 3,
      id_calzone_flavor: null

}

class Wish {
  async createCart({ idUser }: { idUser: number }) {
    const { data, error } = await supabase
      .from('cart')
      .insert([{ id_user: idUser, status: 'creating', id_address: null }]);
    return { data, error };
  }

  async updateCart({
    idAddress, id_cart, value, field, troco, order_time,
  }: {
    id_cart: number,
    field: string | number,
    value: string,
    order_time: string,
    idAddress: number | null,
    troco?: number,
  }) {
    const { data, error } = await supabase
      .from('cart')
      .update({
        [field]: value,
        id_address: idAddress,
        order_time,
        troco,
      })
      .match({ id_cart });
    return { data, error };
  }

  async addToCart({
    table,
    size,
    border,
    comment,
    id_cart,
    flavors,
  }: Pedido & { table: string }) {
    if (table === 'pizza') {
      const { data, error }: {
         data: Pedido[] | null; error: any
      } = await supabase.from(table).insert([
        {
          id_pizza_size: size,
          id_pizza_border: border,
          comment,
          id_cart,
        },
      ]);
      return { data, error };
    }
    if (table === 'calzone' && flavors) {
      const { data, error }: {
        data: Pedido[] | null; error: any
      } = await supabase.from(table).insert([
        {
          id_calzone_flavor: flavors[0],
          comment,
          id_cart,
        },
      ]);
      return { data, error };
    }
    const { data, error }: {
       data: Pedido[] | null; error: any
    } = await supabase.from(table).insert([
      {
        id_cart,
        id_drink: flavors![0],
        id_drink_size: size,
      },
    ]);
    return { data, error };
  }

  /* ↑ together ↓ */
  async addFlavorToPizza({
    table,
    idPizza,
    idFlavor,
  }: {
    table: string;
    idPizza: number;
    idFlavor: number;
  }) {
    const { data, error } = await supabase.from(table).insert([
      {
        id_pizza: idPizza,
        id_flavor: idFlavor,
      },
    ]);
    return { data, error };
  }

  async getCart({ id_user, status }: { id_user: number, status: string }) {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        pizza!id_cart(
          *,
          pizza_size (*),
          pizza_border (*),
          pizza_flavor!id_pizza (
            flavor (
              id_flavor,
              name,
              flavor_category!inner (name, price)
            )
          )
        ),
        calzone!id_cart (
          *,
          calzone_flavor (*)
        ),
        drink_cart!id_cart (
          *,
          drink (*),
          drink_size (*)
        )
      `)
      .match({ id_user, status });
    return { data, error };
  }

  async getCartAdm({ status }: { status: string }) {
    const { data, error } = await supabase
      .from('cart')
      .select(
        `
        *,
        pizza!id_cart(
          *,
          pizza_size (*),
          pizza_border (*),
          pizza_flavor!id_pizza (
            flavor (
              name,
              flavor_category!inner (name, price)
            )
          )
        ),
        calzone!id_cart (
          *,
          calzone_flavor (*)
        ),
        drink_cart!id_cart (
          *,
          drink (*),
          drink_size (*)
        ),
        address!inner (*),
        users!inner (
          id_user,
          name,
          email
        )
      `,
      )
      .neq('status', status);
    return { data, error };
  }

  async deleteItem({ id, table }: { id: number; table: string }) {
    if (table === 'pizza') {
      await supabase.from('pizza_flavor').delete().match({ id_pizza: id });

      const { data, error } = await supabase
        .from('pizza')
        .delete()
        .match({ id_pizza: id });

      return { data, error };
    }
    if (table === 'calzone') {
      const { data, error } = await supabase
        .from('calzone')
        .delete()
        .match({ id_calzone: id });

      return { data, error };
    }
    const { data, error } = await supabase
      .from('drink_cart')
      .delete()
      .match({ id_drink_cart: id });

    return { data, error };
  }

  // SABORES //
  async getFlavor({ id_flavor, date }:{id_flavor: number, date: string}) {
    const { data, error }:{data: Report[] | null, error: any} = await supabase
      .from('report')
      .select('*')
      .match({ id_flavor, date });
    return { data, error };
  }

  async updateFlavor({ id_flavor, date, value }:{id_flavor: number, date: string, value: number}) {
    const { data, error } = await supabase
      .from('report')
      .update({ times_ordered: value })
      .match({ id_flavor, date });
    return { data, error };
  }
}
export default new Wish();
