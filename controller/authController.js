const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/emailSender");
//signup cpontroller
const signupUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  //heck if user exist in datavase
  const userExist = await User.findOne({ email });
  //if user does not exist send an error message
  //*IMPORTANT SET UP PROPER ERROR HANDLING *//
  if (userExist) return next(new AppError("this user already exist", 400));

  //save the variable to the database using "User.create"
  const user = await User.create({ name, email, password });
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(201).json({
    status: "success",
    message: "user created successfully",
    token,
  });
});

const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //check if user exist in db
  const user = await User.findOne({ email });
  //send error if user does not exist in db and redirect to sign up
  if (!user) return next(new AppError("Invalid credentials ", 401));

  //use bcrypt to see if the password matches the stored password
  const confirmPassword = await bcrypt.compare(password, user.password);
  if (!confirmPassword) return next(new AppError("Invalid credentials ", 401));
  //create jwt token and store in req.user
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(200).json({
    status: "success",
    message: "Login successful",
    token,
  });
});
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide your email", 400));

  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json({
      status: "success",
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  console.log(process.env.FRONTEND_URL);
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
    .button {padding: 0 !important;}
    .button a {padding: 12px 30px !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; min-width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; color: #333333;">
  <center style="width: 100%; table-layout: fixed; background-color: #f9fafb; padding: 40px 0;">
    <div style="max-width: 600px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
          <td align="center" bgcolor="#4f46e5" style="padding: 30px 0;">
            <!-- Replace with your actual logo -->
            <img src="https://via.placeholder.com/150x50/4f46e5/ffffff?text=YourLogo" alt="Ecomerce site" width="150" style="display: block; border: 0;">
          </td>
        </tr>
      </table>
      
      <!-- Content -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
          <td style="padding: 36px 30px 20px 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 24px; line-height: 28px; font-weight: bold; color: #333333;">
                  Password Reset Request
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                  Hi there,
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                  <strong>You forgot, didn't you?</strong> No worries - it happens to the best of us! We received a request to reset your password.
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                  Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for your security.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 30px 0;">
                  <!-- Button -->
                  <table border="0" cellpadding="0" cellspacing="0" class="button">
                    <tr>
                      <td align="center" style="border-radius: 6px;" bgcolor="#4f46e5">
                        <a href="${resetURL}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Your Password</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                  If the button doesn't work, you can also copy and paste this link into your browser:
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #666666; word-break: break-all;">
                  <a href="${resetURL}" style="color: #4f46e5; text-decoration: underline;">${resetURL}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0; font-size: 14px; line-height: 22px; color: #666666; border-top: 1px solid #eeeeee;">
                  If you didn't request this password reset, please ignore this email or <a href="#" style="color: #4f46e5; text-decoration: underline;">contact our support team</a> if you have any concerns.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      
      <!-- Footer -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        <tr>
          <td bgcolor="#f4f4f5" style="padding: 30px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #666666;">
                  © 2025 Your Ecommerce site. All rights reserved.
                </td>
              </tr>
            
              <tr>
                <td align="center" style="font-size: 13px; line-height: 18px; color: #666666;">
                  <a href="#" style="color: #4f46e5; text-decoration: underline;">Privacy Policy</a> | 
                  <a href="#" style="color: #4f46e5; text-decoration: underline;">Unsubscribe</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "So you wanna know your Password, huh?",
      message,
      html: message,
    });

    res.status(200).json({
      status: "success",
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500
      )
    );
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) {
    return next(
      new AppError("Please provide and confirm your new password.", 400)
    );
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.find({
    passwordResetToken: hashedToken,
    passwordResetExpires: { gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1D",
  });
  res.status(200).json({
    status: "success",
    message: "Password successfully reset.",
    token,
  });
});
module.exports = { signupUser, loginUser, forgotPassword, resetPassword };
