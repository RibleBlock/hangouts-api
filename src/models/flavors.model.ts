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

interface Flavor {
  id_flavor?: number,
  url_image?: string,
  name?: string,
  ingredients?: string[],
  id?: number,
  id_image?: number,
  id_flavor_type?: number,
  id_flavor_category?: number,
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

  async getFlavorCategory({ category }:{category:string}) {
    const { data, error } = await supabase
      .from('flavor_category')
      .select('id_flavor_category, name')
      .match({ name: category });

    return { data, error };
  }

  async getFlavorType({ type }:{type:string}) {
    const { data, error } = await supabase
      .from('flavor_type')
      .select('id_flavor_type, name')
      .match({ name: type });

    return { data, error };
  }

  async updateFlavor({ table, object, filter }: {
    table: string, object: Flavor, filter: Flavor}) {
    const { data, error } = await supabase
      .from(table)
      .update(object)
      .match({ ...filter });

    return { data, error };
  }

  async createImage({ image }: { image: string }) {
    const { data, error } = await supabase
      .from('image')
      .insert([{ url_image: image }]);

    return { data, error };
  }

  async createRelatorio(dataInsert: DataInsert[]) {
    const { data, error } = await supabase
      .from('report')
      .insert(dataInsert);
    return { data, error };
  }

  async insertFlavor(flavor: Flavor) {
    const { data, error } = await supabase
      .from('flavor')
      .insert([flavor]);
    return { data, error };
  }
}
export default new Flavors();
