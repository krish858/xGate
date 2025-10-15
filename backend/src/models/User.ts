import { Schema, model, Document } from "mongoose";

interface IApi {
  name: string;
  description: string;
  generatedEndpoint: string;
  amountGenerated: number;
}

export interface IUser extends Document {
  publicKey: string;
  restEndpoints: IApi[];
  webSockets: IApi[];
}

const ApiSchema = new Schema<IApi>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  generatedEndpoint: { type: String, required: true },
  amountGenerated: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>({
  publicKey: { type: String, required: true, unique: true },
  restEndpoints: { type: [ApiSchema], default: [] },
  webSockets: { type: [ApiSchema], default: [] },
});

export default model<IUser>("User", UserSchema);
