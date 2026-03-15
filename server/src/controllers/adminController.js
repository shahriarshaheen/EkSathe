import User from "../models/User.js";
import nodemailer from "nodemailer";

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ── GET ALL STUDENTS PENDING VERIFICATION ─────────────────────
export const getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      isEmailVerified: true,
      studentVerified: { $ne: true },
      studentRejected: { $ne: true },
    }).select("name email studentId university createdAt trustScore photoUrl");

    return res.status(200).json({ success: true, students });
  } catch (err) {
    console.error("getPendingStudents error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET ALL STUDENTS (approved + pending + rejected) ──────────
export const getAllStudents = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { role: "student", isEmailVerified: true };

    if (status === "approved") query.studentVerified = true;
    else if (status === "rejected") query.studentRejected = true;
    else if (status === "pending") {
      query.studentVerified = { $ne: true };
      query.studentRejected = { $ne: true };
    }

    const students = await User.find(query)
      .select(
        "name email studentId university createdAt trustScore photoUrl studentVerified studentRejected",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, students });
  } catch (err) {
    console.error("getAllStudents error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── APPROVE STUDENT ───────────────────────────────────────────
export const approveStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    student.studentVerified = true;
    student.studentRejected = false;
    student.trustScore = Math.min((student.trustScore || 0) + 10, 100);
    await student.save();

    // Send approval email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await getTransporter().sendMail({
          from: `"EkSathe" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: "Your student ID has been verified — EkSathe",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
              <div style="background:#111827; padding:20px 24px; border-radius:10px 10px 0 0;">
                <span style="color:white; font-size:18px; font-weight:700;">EkSathe</span>
              </div>
              <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-top:none; padding:24px; border-radius:0 0 10px 10px;">
                <p style="font-size:22px; font-weight:700; color:#166534; margin:0 0 12px;">✅ Student ID Verified</p>
                <p style="font-size:15px; color:#374151; margin:0 0 16px;">Hi ${student.name},</p>
                <p style="font-size:15px; color:#374151; line-height:1.6; margin:0 0 16px;">
                  Your student ID <strong>${student.studentId}</strong> has been verified by our team.
                  You now have full access to all EkSathe student features.
                </p>
                <p style="font-size:14px; color:#6b7280;">Your trust score has been increased by 10 points.</p>
                <hr style="border:none; border-top:1px solid #d1fae5; margin:20px 0;" />
                <p style="font-size:12px; color:#9ca3af; text-align:center;">© ${new Date().getFullYear()} EkSathe — Smart Campus Mobility</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Approval email failed:", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `${student.name}'s student ID verified successfully.`,
    });
  } catch (err) {
    console.error("approveStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── REJECT STUDENT ────────────────────────────────────────────
export const rejectStudent = async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    student.studentRejected = true;
    student.studentVerified = false;
    await student.save();

    // Send rejection email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await getTransporter().sendMail({
          from: `"EkSathe" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: "Action required on your EkSathe student verification",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
              <div style="background:#111827; padding:20px 24px; border-radius:10px 10px 0 0;">
                <span style="color:white; font-size:18px; font-weight:700;">EkSathe</span>
              </div>
              <div style="background:#fff7ed; border:1px solid #fed7aa; border-top:none; padding:24px; border-radius:0 0 10px 10px;">
                <p style="font-size:22px; font-weight:700; color:#9a3412; margin:0 0 12px;">⚠️ Verification Needs Attention</p>
                <p style="font-size:15px; color:#374151; margin:0 0 16px;">Hi ${student.name},</p>
                <p style="font-size:15px; color:#374151; line-height:1.6; margin:0 0 16px;">
                  We were unable to verify your student ID <strong>${student.studentId}</strong>.
                </p>
                ${reason ? `<p style="font-size:14px; color:#374151; background:#fee2e2; padding:12px; border-radius:8px; margin:0 0 16px;"><strong>Reason:</strong> ${reason}</p>` : ""}
                <p style="font-size:14px; color:#6b7280; line-height:1.6;">
                  Please contact your university admin or reach out to EkSathe support with the correct student ID.
                </p>
                <hr style="border:none; border-top:1px solid #fed7aa; margin:20px 0;" />
                <p style="font-size:12px; color:#9ca3af; text-align:center;">© ${new Date().getFullYear()} EkSathe — Smart Campus Mobility</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Rejection email failed:", emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `${student.name}'s verification rejected.`,
    });
  } catch (err) {
    console.error("rejectStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET PLATFORM STATS ────────────────────────────────────────
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      pendingVerifications,
      totalHomeowners,
      totalAdmins,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({
        role: "student",
        isEmailVerified: true,
        studentVerified: { $ne: true },
        studentRejected: { $ne: true },
      }),
      User.countDocuments({ role: "homeowner" }),
      User.countDocuments({ role: "admin" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        pendingVerifications,
        totalHomeowners,
        totalAdmins,
      },
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
