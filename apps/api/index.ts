// TODO: make sure about session, rn it uses just JWT with 5m 
import express, { type Request, type Response } from 'express';
import { recoverMessageAddress } from 'viem'; 
import { type Hex } from 'viem';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_123456789';
const JWT_EXPIRES = '5m';

const DEFAULT_PORT = process.env.PORT || 3001;

interface VerifySignatureRequest {
  message: string;
  signature: Hex;
}

interface VerifySignatureResponse {
  isValid: boolean;
  signer: Hex | null;
  originalMessage: string;
  token: string | null;
}

const app = express();
app.use(express.json());

app.post('/verify-signature', async (req: Request<{}, {}, VerifySignatureRequest>, res: Response<VerifySignatureResponse>) => {
  const { message, signature } = req.body;

  if (!message || !signature) {
    // todo: add error info to the responce
    return res.status(400).json({ isValid: false, signer: null, originalMessage: message || '', token: null});
  }
  try {
    const signer = await recoverMessageAddress({ message, signature });
    const token = jwt.sign(
      { address: signer },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(200).json({ isValid: true, signer, originalMessage: message, token });
  } catch (error) {
    console.error('Signature verification failed:', error);
    res.status(200).json({ isValid: false, signer: null, originalMessage: message, token: null });
  }
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(DEFAULT_PORT, () => {
  console.log(`Server running on port ${DEFAULT_PORT}`);
});