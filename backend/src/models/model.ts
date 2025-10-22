import { Schema, model, Document, Types } from "mongoose";

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
  owner: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ApiSchema = new Schema<IApi>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    generatedEndpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
  },
  { timestamps: true }
);

export const ApiModel = model<IApi>("Api", ApiSchema);

export interface IWebSocket extends Document {
  name: string;
  generatedEndpoint: string;
  serviceUrl?: string;
  owner: Types.ObjectId;
  pricePerMinute: number;
  billingMode: "subscription";
  sessionTtlSeconds: number;
  amountGenerated: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const WebSocketSchema = new Schema<IWebSocket>(
  {
    name: { type: String, required: true },
    generatedEndpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    serviceUrl: { type: String, required: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pricePerMinute: { type: Number, required: true, default: 0 },
    billingMode: {
      type: String,
      enum: ["subscription"],
      default: "subscription",
    },
    sessionTtlSeconds: { type: Number, default: 60 },
    amountGenerated: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WebSocketModel = model<IWebSocket>("WebSocket", WebSocketSchema);

export interface IUser extends Document {
  publicKey: string;
  restEndpoints: Types.ObjectId[];
  webSockets: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    publicKey: { type: String, required: true, unique: true },
    restEndpoints: [{ type: Schema.Types.ObjectId, ref: "Api", default: [] }],
    webSockets: [
      { type: Schema.Types.ObjectId, ref: "WebSocket", default: [] },
    ],
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
