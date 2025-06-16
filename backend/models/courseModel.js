const mongoose = require('mongoose');

const courseVideoSchema = mongoose.Schema({
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
  duration: {
    type: Number, // em segundos
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      enum: ['planejamento', 'investimentos', 'economia', 'negociacao', 'mindset', 'outros'],
      required: true,
    },
    level: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced'],
      default: 'basic',
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
    publishedAt: {
      type: Date,
    },
    videos: [courseVideoSchema],
    totalDuration: {
      type: Number,
      default: 0,
    },
    enrollments: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Middleware para calcular duração total automaticamente
courseSchema.pre('save', function(next) {
  if (this.videos && this.videos.length > 0) {
    this.totalDuration = this.videos.reduce((total, video) => total + video.duration, 0);
  }
  next();
});

// Índices para otimização
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ requiredPlan: 1, isPublished: 1 });
courseSchema.index({ createdBy: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 