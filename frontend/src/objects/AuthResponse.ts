import type { UserProfile } from './UserProfile';
export interface AuthResponse {
    token: string;
    user: UserProfile;
}
