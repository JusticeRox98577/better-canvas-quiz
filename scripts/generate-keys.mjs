import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import crypto from "crypto";

const { privateKey, publicKey } = await generateKeyPair("RS256");
const publicJwk = await exportJWK(publicKey);
publicJwk.kid = crypto.randomUUID();
publicJwk.use = "sig";
publicJwk.alg = "RS256";

const privatePem = await exportPKCS8(privateKey);

console.log("LTI_PUBLIC_JWK=", JSON.stringify(publicJwk));
console.log("\nLTI_PRIVATE_KEY_PEM=\n", privatePem);
