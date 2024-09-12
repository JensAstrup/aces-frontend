import { createDecipheriv, scryptSync } from 'crypto'


const KEY = process.env.ENCRYPTION_KEY
const KEY_LENGTH = 32
const key = scryptSync(KEY!, 'salt', KEY_LENGTH)

function decrypt(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':')
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format')
  }
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export default decrypt
