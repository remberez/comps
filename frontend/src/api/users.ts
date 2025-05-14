import axios from './axios';

export interface User {
    id: number;
    email: string;
    username: string;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
}

export const getUsers = async (): Promise<User[]> => {
    const response = await axios.get<User[]>('/auth/users');
    return response.data;
}; 