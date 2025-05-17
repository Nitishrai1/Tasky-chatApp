import mongoose, { Schema, Document } from 'mongoose';
export interface IMessage extends Document {
    sender: string;
    message: string,
    timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
    sender: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
})

export const Message = mongoose.model<IMessage>('Message', MessageSchema);