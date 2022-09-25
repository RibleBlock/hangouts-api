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
}

export default new Address();
