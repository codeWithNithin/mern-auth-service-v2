import bcrypt from 'bcryptjs';

export default class CredentialService {
    async verifyPassword(password: string, hashedPassword: string) {
        return await bcrypt.compare(password, hashedPassword);
    }
}
