const mongoose = require('mongoose');

const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['free', 'premium', 'enterprise'],
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      monthly: { type: Number, required: true },
      yearly: { type: Number, required: true },
    },
    currency: {
      type: String,
      default: 'BRL',
    },
    features: {
      maxTransactions: { type: Number, required: true },
      maxCategories: { type: Number, required: true },
      maxGoals: { type: Number, required: true },
      hasAdvancedReports: { type: Boolean, default: false },
      hasVideoAccess: { type: Boolean, default: false },
      hasExport: { type: Boolean, default: false },
      hasPrioritySupport: { type: Boolean, default: false },
      hasMultipleAccounts: { type: Boolean, default: false },
    },
    highlights: [{
      type: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    stripePriceId: {
      monthly: String,
      yearly: String,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan; 