/* eslint-disable camelcase */
import supabase from '../config/supabase';

interface AddressProps {
  id_user: number,
  cep: string,
  district: string,
  number: number,
  complement: string,
  street: string,
  city: string,
  is_active: boolean,
}
class Address {
  async addAddress(dataAddress: AddressProps) {
    const { data, error } = await supabase
      .from('address')
      .insert([
        dataAddress,
      ]);
    return { data, error };
  }

  async readAddress({ id_user }: {id_user: number}) {
    const { data, error } = await supabase
      .from('address')
      .select('*')
      .match({ id_user, is_active: true });

    return { data, error };
  }

  async getAddress({ id_address }: { id_address: number }) {
    const { data, error }: {data: AddressProps[] | null, error: any} = await supabase
      .from('address')
      .select('*')
      .match({ id_address });

    return { data, error };
  }

  async deleteAddress({ id_address, is_active }: { id_address: number, is_active: boolean }) {
    const { data, error } = await supabase
      .from('address')
      .update({ is_active })
      .match({ id_address });

    return { data, error };
  }
}

export default new Address();
