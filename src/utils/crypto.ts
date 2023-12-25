/**
 * 使用 sha256 算法进行加密
 */
import * as crypto from "crypto";
export default(value: string, salt: string) => {
    return crypto.pbkdf2Sync(value, salt, 1000, 18, "sha256").toString("hex");
}