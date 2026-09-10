import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import {
  GraduationCap,
  Briefcase,
  Code2,
  Plus,
  Trash2,
  MapPin,
  Award,
  Trophy,
  Languages,
  ShieldCheck,
  User,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

// ✅ Edit 1 — Top constants
const API = import.meta.env?.VITE_API_URL || "http://localhost:5000";
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const CreateResume = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // OTP & Payment States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Form Field States
  const [certInput, setCertInput] = useState({
    title: "",
    issuer: "",
    year: "",
  });
  const [achievementInput, setAchievementInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [eduInput, setEduInput] = useState({
    institute: "",
    degree: "",
    specialization: "",
    cgpa: "",
    year: "",
  });
  const [expInput, setExpInput] = useState({
    company: "",
    role: "",
    duration: "",
    description: "",
  });
  const [projectInput, setProjectInput] = useState({
    title: "",
    description: "",
    techStack: "",
    github: "",
    liveLink: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    photo: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  });

  // Dynamic Razorpay Script Loader
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STEP 1: SEND OTP ---
  // ✅ Edit 2 — auth header + real error message + API constant
  const handleResumeSubmission = async () => {
    if (!formData.email) {
      toast.info("Please fill your email first for OTP verification.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/payment/send-otp`,
        { email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("Verification OTP sent to your registered email!");
      setShowOtpModal(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP ---
  // ✅ Edit 3 — auth header + API URL
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/api/payment/verify-otp`,
        { email: formData.email, otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOtpVerified(true);
      setShowOtpModal(false);
      initiatePayment();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or Expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 3: RAZORPAY GATEWAY ---
  // ✅ Edit 4 — key + URLs + verify body (sirf 3 IDs)
  const initiatePayment = async () => {
    try {
      if (!window.Razorpay) {
        toast.error("Razorpay SDK not loaded");
        return;
      }

      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${API}/api/payment/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: RAZORPAY_KEY,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "CareerSphere",
        description: "Premium Resume",
        order_id: data.order.id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response) {
          try {
            await axios.post(
              `${API}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            await saveResumeToDatabase();
            toast.success("Payment Successful 🎉");
          } catch (err) {
            toast.error(err?.response?.data?.message || "Payment Verification Failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Unable to initiate payment");
    }
  };

  // ✅ Edit 5 — saveResumeToDatabase URL
  const saveResumeToDatabase = async () => {
    setLoading(true);
    try {
      const element = document.getElementById("resume-preview");

      if (!element) {
        toast.error("Resume preview not found!");
        return;
      }

      const opt = {
        margin: 5,
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      const pdfBlob = await html2pdf()
        .from(element)
        .set(opt)
        .output("blob");

      const dataToSend = new FormData();
      dataToSend.append("resumeFile", pdfBlob, "resume.pdf");
      dataToSend.append(
        "resumeData",
        JSON.stringify({
          ...formData,
          isPremium: true,
        })
      );

      const response = await axios.post(
        `${API}/api/resume/create`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Resume saved successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error(err?.message || "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("resume-preview");

    if (!element) {
      toast.success("Resume preview not found!");
      return;
    }

    const options = {
      margin: 10,
      filename: `${formData.fullName || "Resume"}_CV.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().from(element).set(options).save();
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput("");
    }
  };
  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };
  const addEducation = () => {
    if (eduInput.institute.trim() && eduInput.degree.trim()) {
      setFormData({
        ...formData,
        education: [...formData.education, eduInput],
      });
      setEduInput({
        institute: "",
        degree: "",
        specialization: "",
        cgpa: "",
        year: "",
      });
    }
  };
  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };
  const addExperience = () => {
    if (expInput.company.trim() && expInput.role.trim()) {
      setFormData({
        ...formData,
        experience: [...formData.experience, expInput],
      });
      setExpInput({ company: "", role: "", duration: "", description: "" });
    }
  };
  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };
  const addProject = () => {
    if (projectInput.title.trim()) {
      setFormData({
        ...formData,
        projects: [...formData.projects, projectInput],
      });
      setProjectInput({
        title: "",
        description: "",
        techStack: "",
        github: "",
        liveLink: "",
      });
    }
  };
  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };
  const addCertification = () => {
    if (certInput.title.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, certInput],
      });
      setCertInput({ title: "", issuer: "", year: "" });
    }
  };
  const removeCertification = (index) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };
  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, achievementInput],
      });
      setAchievementInput("");
    }
  };
  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };
  const addLanguage = () => {
    if (languageInput.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, languageInput],
      });
      setLanguageInput("");
    }
  };
  const removeLanguage = (index) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 relative">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">ATS Resume Builder</h1>
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            👑 Premium Plan (₹50)
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT FORM */}
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold">Resume Details</h2>

            {/* Photo Upload Field */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
                <User size={24} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Upload Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Personal Details Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Registered Email (For OTP)"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="text"
                name="linkedin"
                placeholder="LinkedIn URL"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="text"
                name="github"
                placeholder="GitHub URL"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
              <input
                type="text"
                name="portfolio"
                placeholder="Portfolio URL"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />
            </div>

            <textarea
              name="summary"
              rows="3"
              placeholder="Professional Summary"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            {/* SKILLS */}
            <div>
              <label className="block font-medium mb-1">Skills</label>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="React"
                  className="flex-1 border p-3 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-indigo-600 text-white px-5 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center text-sm font-medium"
                  >
                    {skill}{" "}
                    <Trash2
                      size={14}
                      className="cursor-pointer text-red-500 ml-1"
                      onClick={() => removeSkill(index)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* EDUCATION */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <GraduationCap size={20} /> Qualifications
              </h3>
              {formData.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 mb-2 rounded-lg border shadow-sm"
                >
                  <p className="font-semibold text-sm">
                    {edu.degree} - {edu.institute}
                  </p>
                  <button
                    onClick={() => removeEducation(idx)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="Institute / University"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={eduInput.institute}
                  onChange={(e) =>
                    setEduInput({ ...eduInput, institute: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Degree / Course"
                    className="border p-3 rounded-lg bg-white"
                    value={eduInput.degree}
                    onChange={(e) =>
                      setEduInput({ ...eduInput, degree: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Specialization"
                    className="border p-3 rounded-lg bg-white"
                    value={eduInput.specialization}
                    onChange={(e) =>
                      setEduInput({
                        ...eduInput,
                        specialization: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="CGPA / Percentage"
                    className="border p-3 rounded-lg bg-white"
                    value={eduInput.cgpa}
                    onChange={(e) =>
                      setEduInput({ ...eduInput, cgpa: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Year of Passing"
                    className="border p-3 rounded-lg bg-white"
                    value={eduInput.year}
                    onChange={(e) =>
                      setEduInput({ ...eduInput, year: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={16} /> Add Qualification
                </button>
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Briefcase size={20} /> Experience
              </h3>
              {formData.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 mb-2 rounded-lg border shadow-sm"
                >
                  <p className="font-semibold text-sm">
                    {exp.role} at {exp.company}
                  </p>
                  <button
                    onClick={() => removeExperience(idx)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="Company"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={expInput.company}
                  onChange={(e) =>
                    setExpInput({ ...expInput, company: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Role"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={expInput.role}
                  onChange={(e) =>
                    setExpInput({ ...expInput, role: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Duration"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={expInput.duration}
                  onChange={(e) =>
                    setExpInput({ ...expInput, duration: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={expInput.description}
                  onChange={(e) =>
                    setExpInput({ ...expInput, description: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={addExperience}
                  className="w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={16} /> Add Experience
                </button>
              </div>
            </div>

            {/* PROJECTS */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Code2 size={20} /> Projects
              </h3>
              {formData.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 mb-2 rounded-lg border shadow-sm"
                >
                  <p className="font-semibold text-sm">{proj.title}</p>
                  <button
                    onClick={() => removeProject(idx)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="Project Title"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={projectInput.title}
                  onChange={(e) =>
                    setProjectInput({ ...projectInput, title: e.target.value })
                  }
                />
                <textarea
                  placeholder="Project Description"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={projectInput.description}
                  onChange={(e) =>
                    setProjectInput({
                      ...projectInput,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Tech Stack"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={projectInput.techStack}
                  onChange={(e) =>
                    setProjectInput({
                      ...projectInput,
                      techStack: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={addProject}
                  className="w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={16} /> Add Project
                </button>
              </div>
            </div>

            {/* CERTIFICATIONS */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Award size={20} /> Certifications
              </h3>
              {formData.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 mb-2 rounded-lg border shadow-sm text-sm"
                >
                  <p className="font-semibold">
                    {cert.title} by {cert.issuer}
                  </p>
                  <button
                    onClick={() => removeCertification(idx)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="space-y-3 mt-2">
                <input
                  type="text"
                  placeholder="Certification Title"
                  className="w-full border p-3 rounded-lg bg-white"
                  value={certInput.title}
                  onChange={(e) =>
                    setCertInput({ ...certInput, title: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Issuer"
                    className="border p-3 rounded-lg bg-white"
                    value={certInput.issuer}
                    onChange={(e) =>
                      setCertInput({ ...certInput, issuer: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    className="border p-3 rounded-lg bg-white"
                    value={certInput.year}
                    onChange={(e) =>
                      setCertInput({ ...certInput, year: e.target.value })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={addCertification}
                  className="w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus size={16} /> Add Certification
                </button>
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Trophy size={20} /> Achievements
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  placeholder="Secured 1st rank..."
                  className="flex-1 border p-3 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="bg-indigo-600 text-white px-5 rounded-lg"
                >
                  Add
                </button>
              </div>
              {formData.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-white p-2 rounded-lg border shadow-sm mb-1 text-sm"
                >
                  <p>{ach}</p>
                  <button
                    onClick={() => removeAchievement(idx)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* LANGUAGES */}
            <div className="border rounded-xl p-4 bg-gray-50">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                <Languages size={20} /> Languages
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="English, Hindi"
                  className="flex-1 border p-3 rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="bg-indigo-600 text-white px-5 rounded-lg"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center text-sm font-medium"
                  >
                    {lang}{" "}
                    <Trash2
                      size={14}
                      className="cursor-pointer text-red-500 ml-1"
                      onClick={() => removeLanguage(idx)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={handleResumeSubmission}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white py-4 rounded-xl font-bold text-lg shadow-md transition"
            >
              {loading ? "Processing..." : "Verify Email & Pay ₹50"}
            </button>
          </div>

          {/* RIGHT SIDE LIVE PREVIEW */}
          <div
            id="resume-preview"
            className="rounded-3xl shadow-xl p-8 h-fit sticky top-6"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "1px solid #e5e7eb",
            }}
          >
            <div className="flex flex-col items-center text-center">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-md mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 mb-3 text-gray-400 text-xs">
                  No Photo
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900">
                {formData.fullName || "Your Name"}
              </h1>
              <p className="text-gray-600 text-sm">
                {formData.email || "email@example.com"}{" "}
                {formData.phone && `| ${formData.phone}`}
              </p>
              {formData.location && (
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <MapPin size={12} />
                  {formData.location}
                </p>
              )}
            </div>
            <hr className="my-4 border-gray-300" />

            {formData.summary && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Summary
                </h2>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {formData.summary}
                </p>
              </div>
            )}
            {formData.skills.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formData.education.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Qualifications
                </h2>
                {formData.education.map((edu, i) => (
                  <div key={i} className="mb-2 pl-2 border-l-2 border-gray-400">
                    <h3 className="font-semibold text-xs text-gray-800">
                      {edu.degree}
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      {edu.institute} ({edu.year})
                    </p>
                  </div>
                ))}
              </div>
            )}
            {formData.experience.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Experience
                </h2>
                {formData.experience.map((exp, i) => (
                  <div key={i} className="mb-2 pl-2 border-l-2 border-gray-400">
                    <h3 className="font-semibold text-xs text-gray-800">
                      {exp.role}
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      {exp.company} ({exp.duration})
                    </p>
                  </div>
                ))}
              </div>
            )}
            {formData.projects.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Projects
                </h2>
                {formData.projects.map((proj, i) => (
                  <div key={i} className="mb-2 pl-2 border-l-2 border-gray-400">
                    <h3 className="font-semibold text-xs text-gray-800">
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-gray-600">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {formData.certifications.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Certifications
                </h2>
                {formData.certifications.map((cert, i) => (
                  <div key={i} className="text-xs text-gray-700 mb-0.5">
                    • {cert.title} by {cert.issuer}
                  </div>
                ))}
              </div>
            )}
            {formData.achievements.length > 0 && (
              <div className="mb-5">
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Achievements
                </h2>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
                  {formData.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.languages.length > 0 && (
              <div>
                <h2 className="font-bold text-lg mb-1 text-indigo-700 uppercase tracking-wide">
                  Languages
                </h2>
                <div className="flex gap-1.5">
                  {formData.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- OTP MODAL --- */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 border-t-4 border-indigo-600">
            <div className="mx-auto bg-indigo-50 text-indigo-600 p-3 rounded-full w-fit">
              <ShieldCheck size={36} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Email Verification
            </h3>
            <p className="text-sm text-gray-500">
              We have sent a 6-digit OTP code to{" "}
              <span className="font-semibold text-gray-700">
                {formData.email}
              </span>
              .
            </p>
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-Digit OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full text-center tracking-widest text-xl border-2 border-gray-200 focus:border-indigo-500 p-3 rounded-xl focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
              >
                {loading ? "Verifying..." : "Verify & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateResume;

