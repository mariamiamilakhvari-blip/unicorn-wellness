import mongoose, { Schema, Document } from 'mongoose'

export interface ISiteConfig extends Document {
  key: string
  value: string
  updatedAt: Date
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema)
