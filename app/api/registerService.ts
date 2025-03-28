import { getApiDomain } from "@/utils/domain";
import { User } from '@/types/user';
import axios from 'axios';

// Move to users service
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const { data } = await axios.get(getApiDomain() + '/users');
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

// Create a new Era
export const createUser = async (user: { username: string; password: string}): Promise<string> => {
  try {
    const response = await axios.post(getApiDomain() + '/users', user);
    console.log("logging stuff..")
    console.log(JSON.stringify(response))
    const token = response.headers["Token"]
    if (!token) {
        throw new Error('Token not found in response headers');
      }
    return token;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
};

// Update an Era
export const updateEra = async (id: string, updatedEraData: { name?: string; description?: string; image_url?: string }): Promise<void> => {
  try {
    await axios.put(`/api/eras/${id}`, updatedEraData);
  } catch (error) {
    console.error('Error updating era:', error);
    throw new Error('Failed to update era');
  }
};

// Delete an Era
export const deleteEra = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/eras/${id}`);
  } catch (error) {
    console.error('Error deleting era:', error);
    throw new Error('Failed to delete era');
  }
};