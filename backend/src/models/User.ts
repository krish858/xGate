import { Schema, model, Document, Types } from "mongoose";

/**
 * Separate API schema
 */
export interface IApi extends Document {
  name: string;
  description: string;
  generatedEndpoint: string;
  serviceUrl: string;
  method: string;
  queryParams?: Record<string, string>;
  body?: Record<string, any>;
  amountGenerated: number;
  pricePerRequest: number;
  owner: Types.ObjectId; // reference to User
}

const ApiSchema = new Schema<IApi>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  generatedEndpoint: { type: String, required: true },
  serviceUrl: { type: String, required: true },
  method: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
  queryParams: { type: Object, default: {} },
  body: { type: Object, default: {} },
  amountGenerated: { type: Number, default: 0 },
  pricePerRequest: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const ApiModel = model<IApi>("Api", ApiSchema);

/**
 * Separate WebSocket schema
 */
export interface IWebSocket extends Document {
  name: string;
  generatedEndpoint: string;
  owner: Types.ObjectId; // reference to User
}

const WebSocketSchema = new Schema<IWebSocket>({
  name: { type: String, required: true },
  generatedEndpoint: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const WebSocketModel = model<IWebSocket>("WebSocket", WebSocketSchema);

/**
 * User schema with references to APIs and WebSockets
 */
export interface IUser extends Document {
  publicKey: string;
  restEndpoints: Types.ObjectId[]; // array of API IDs
  webSockets: Types.ObjectId[]; // array of WebSocket IDs
}

const UserSchema = new Schema<IUser>({
  publicKey: { type: String, required: true, unique: true },
  restEndpoints: [{ type: Schema.Types.ObjectId, ref: "Api", default: [] }],
  webSockets: [{ type: Schema.Types.ObjectId, ref: "WebSocket", default: [] }],
});

export const UserModel = model<IUser>("User", UserSchema);
