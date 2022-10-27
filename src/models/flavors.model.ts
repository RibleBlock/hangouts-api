/* eslint-disable camelcase */
import supabase from '../config/supabase';

export interface SelectTable {
  columns: string,
  table: string,
  filter: string,
}
export interface DataInsert {
  date: string,
  times_ordered: number,
  id_flavor: number,
}

class Flavors {
  async store({ table }: {table: string}) {
    if (table === 'drink_size') {
      const { data, error } = await supabase
        .from(table)
        .select(`
          *,
          drink_size_drink!id_drink_size ( drink (*) )
        `);
      return { data, error };
    }
    if (table === 'flavor') {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      return { data, error };
    }
    if (table) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('price', { ascending: true });
      return { data, error };
    }
    const { data, error } = await supabase
      .from('flavor_category')
      .select(`
        *,
        flavor!id_flavor_category (
          *,
          image (*),
          flavor_type:id_flavor_type ( name, created_at )
        )
      `)
      .order('price', { ascending: true });
    return { data, error };
  }

  async filterFlavor({ table, filter }: {table?: string, filter: string}) {
    if (table === 'flavor') {
      const { data, error } = await supabase
        .from(table)
        .select(`
          *,
          flavor_type!id_flavor_type (*),
          flavor_category!id_flavor_category (*),
          report (*),
          image (*)
        `)
        .ilike('name', `%${filter}%`); // <-- isso é loucura

      return { data, error };
    }

    const { data, error } = await supabase
      .from('flavor_type')
      .select(`
        *,
        flavor!inner(
          *,
          report (*),
          image!id_image (*)
        )
      `)
      .ilike('flavor.name', `%${filter}%`); // <-- isso é loucura

    return { data, error };
  }

  async selectTable({ table, filter, columns }: SelectTable) {
    if (filter) {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('name', filter);
      return { data, error };
    }
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order('price', { ascending: true });
    return { data, error };
  }

  async createRelatorio(dataInsert: DataInsert[]) {
    const { data, error } = await supabase
      .from('report')
      .insert(dataInsert);
    return { data, error };
  }
}
export default new Flavors();
