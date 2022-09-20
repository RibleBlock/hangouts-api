/* eslint-disable camelcase */
import supabase from '../config/supabase';

interface User {
  id_user?: number,
  name: string,
  email: string,
  password: string,
  phone?: string,
  admin?: boolean,
  is_active?: boolean,
  cart?: [
    {
      id_cart: number,
      created_at: string,
      id_user: number,
      status: number,
    }
  ]
}

interface UserDB extends User {
  id: number,
  created_at: string,
}
export interface UpdateFields {
  id_user: any,
  field: string,
  value: string,
}

class Users {
  async read(columns: string, query: Partial<UserDB>) {
    const { data, error }: { data: UserDB[] | null, error: any } = await supabase
      .from('users')
      .select(columns)
      .match(query);

    return { data, error };
  }

  async create(newUser: User) {
    const { data, error }: { data: UserDB[] | null, error: any } = await supabase
      .from('users')
      .insert([
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        },
      ]);
    return { data, error };
  }

  async getAllUsers({ filter }: {filter: string}) {
    const { data, error }: { data: UserDB[] | null, error: any } = await supabase
      .from('users')
      .select('*')
      .ilike('name', `%${filter}%`);

    return { data, error };
  }

  async readAddress({ id_user }: {id_user: number}) {
    const { data, error } = await supabase
      .from('address')
      .select('*')
      .match({ id_user });

    return { data, error };
  }

  async updateOneUser({ id_user, field, value }: UpdateFields) {
    const { data, error }: { data: UserDB[] | null, error: any } = await supabase
      .from('users')
      .update({ [field]: value })
      .match({ id_user });

    return { data, error };
  }
}

export default new Users();
