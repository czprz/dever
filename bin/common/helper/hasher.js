import crypto from "crypto";

export default new class {
    hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
}