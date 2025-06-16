const mongoose = require('mongoose');

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: Number, // em minutos
    },
    category: {
      type: String,
      enum: ['planejamento', 'investimentos', 'economia', 'negociacao', 'mindset', 'outros'],
      default: 'outros',
    },
    difficulty: {
      type: String,
      enum: ['iniciante', 'intermediario', 'avancado'],
      default: 'iniciante',
    },
    requiredPlan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para otimização
videoSchema.index({ category: 1, isPublished: 1 });
videoSchema.index({ requiredPlan: 1, isPublished: 1 });
videoSchema.index({ createdBy: 1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 