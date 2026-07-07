import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

// ENUMS & CONSTANTS
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPERVISOR: 'supervisor'
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
};

// USER SCHEMA
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z\s'-]+$/
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: validator.isEmail,
    index: true
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
    validate: {
      validator: v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(v),
      message: 'Password must contain uppercase, lowercase, number, and special character'
    }
  },

  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER,
    index: true
  },

  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE,
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },

  modifiedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  refreshToken: {
    type: String,
    select: false,
    index: true
  },
  isPasswordResetRequired: {
    type: Boolean,
    default: true
  },

  phoneNumber: {
    type: String,
    trim: true,
    maxlength: 20
  },

  address: {
    type: String,
    trim: true,
    maxlength: 200
  },

  dob: Date,
  hireDate: {
    type: Date,
    default: Date.now
  },
  nationalId: {
    type: String,
    trim: true
  }
},
  { timestamps: false, collection: 'users' });

// INDEXES
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ role: 1, status: 1 });

// PRE-SAVE MIDDLEWARE
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (!this.isNew) this.modifiedAt = new Date();
});

// METHODS
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.password;
  delete obj.__v;
  return obj;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getSafeData = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, status: this.status, isPasswordResetRequired: this.isPasswordResetRequired, phoneNumber: this.phoneNumber, address: this.address, dob: this.dob, hireDate: this.hireDate, nationalId: this.nationalId, createdAt: this.createdAt, modifiedAt: this.modifiedAt };
};

// STATICS
userSchema.statics.findByEmail = function (email) { return this.findOne({ email: email.toLowerCase() }); };
userSchema.statics.findByRole = function (role) { return this.find({ role, status: USER_STATUS.ACTIVE }); };

// MODEL
const User = mongoose.model('User', userSchema);

export { User, USER_ROLES, USER_STATUS };