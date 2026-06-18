import mongoose, { Schema, Document } from 'mongoose'

export interface IPageContent extends Document {
  page: string
  key: string
  value: string
  updatedAt: Date
}

const PageContentSchema = new Schema<IPageContent>(
  {
    page: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
)

PageContentSchema.index({ page: 1, key: 1 }, { unique: true })

export default mongoose.models.PageContent ||
  mongoose.model<IPageContent>('PageContent', PageContentSchema)
