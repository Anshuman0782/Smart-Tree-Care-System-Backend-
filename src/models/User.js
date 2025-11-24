
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const UserSchema = new mongoose.Schema(
//   {
//     name: { type: String },
//     email: { type: String, unique: true, required: true },
//     phone: { type: String },
//     password: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// // Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// UserSchema.methods.comparePassword = function (candidate) {
//   return bcrypt.compare(candidate, this.password);
// };

// export default mongoose.model("User", UserSchema);


import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    password: { type: String, required: true },

   // Added for Forgot Password
    resetToken: { type: String },
    resetTokenExpire: { type: Number },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", UserSchema);
