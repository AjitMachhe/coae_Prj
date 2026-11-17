import { isAllowedUrl, isAllowedImage } from "./linkUtil";

export const TEMPLATES = [
  { key: "custom", label: "Custom page (blocks)", short: "Custom" },
  { key: "department", label: "Department", short: "Department" },
  { key: "faculty", label: "Faculty profile", short: "Faculty" },
];

export const LAYOUTS = [
  { key: "boxed", label: "Boxed (960 px)" },
  { key: "wide", label: "Wide (1280 px)" },
  { key: "full", label: "Full width (edge to edge)" },
];

export const shortLabel = (k) => (TEMPLATES.find((t) => t.key === k) || TEMPLATES[0]).short;
export const layoutOf = (k) => (LAYOUTS.some((l) => l.key === k) ? k : "boxed");

export function defaultData(template) {
  if (template === "department") {
    return {
      bannerImage: "", tagline: "", about: "",
      stats: [{ value: "", label: "" }],
      hodName: "", hodDesignation: "", hodPhoto: "", hodMessage: "",
      programs: [{ name: "", level: "", duration: "", description: "" }],
      facilities: [{ title: "", image: "", text: "" }],
      showFaculty: true,
      email: "", phone: "", address: "",
    };
  }
  if (template === "faculty") {
    return {
      photo: "", designation: "", departmentId: "", expertise: "",
      email: "", phone: "", bio: "",
      qualifications: [{ degree: "", institute: "", year: "" }],
      experience: [{ role: "", org: "", period: "" }],
      publications: [{ text: "", link: "" }],
      links: [{ label: "", url: "" }],
    };
  }
  return {};
}

// Fill in anything missing on data loaded from the database
export function normalizeData(template, data) {
  const base = defaultData(template);
  const src = data || {};
  const out = { ...base };
  for (const k of Object.keys(base)) {
    if (!(k in src)) continue;
    out[k] = Array.isArray(base[k]) ? (Array.isArray(src[k]) ? src[k] : base[k]) : src[k];
  }
  return out;
}

const t = (s) => (typeof s === "string" ? s.trim() : "");

const rows = (arr, keys) =>
  (Array.isArray(arr) ? arr : [])
    .map((r) => Object.fromEntries(keys.map((k) => [k, t(r && r[k])])))
    .filter((r) => keys.some((k) => r[k]));

export function cleanData(template, d) {
  if (template === "department") {
    return {
      bannerImage: t(d.bannerImage), tagline: t(d.tagline), about: d.about || "",
      stats: rows(d.stats, ["value", "label"]),
      hodName: t(d.hodName), hodDesignation: t(d.hodDesignation),
      hodPhoto: t(d.hodPhoto), hodMessage: t(d.hodMessage),
      programs: rows(d.programs, ["name", "level", "duration", "description"]),
      facilities: rows(d.facilities, ["title", "image", "text"]),
      showFaculty: d.showFaculty !== false,
      email: t(d.email), phone: t(d.phone), address: t(d.address),
    };
  }
  if (template === "faculty") {
    return {
      photo: t(d.photo), designation: t(d.designation), departmentId: t(d.departmentId),
      expertise: t(d.expertise), email: t(d.email), phone: t(d.phone), bio: d.bio || "",
      qualifications: rows(d.qualifications, ["degree", "institute", "year"]),
      experience: rows(d.experience, ["role", "org", "period"]),
      publications: rows(d.publications, ["text", "link"]),
      links: rows(d.links, ["label", "url"]),
    };
  }
  return {};
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-()\s]{5,20}$/;
const badImage = (v) => v && !isAllowedImage(v);

export function validateData(template, d) {
  if (template === "custom") return "";

  if (d.email && !EMAIL_RE.test(d.email.trim())) return "Email address is not valid";
  if (d.phone && !PHONE_RE.test(d.phone.trim())) {
    return "Phone number is not valid (digits, spaces, + - ( ) only)";
  }

  if (template === "department") {
    if (badImage(d.bannerImage)) return "Banner image must be an https:// URL or an upload";
    if (badImage(d.hodPhoto)) return "Head of department photo must be an https:// URL or an upload";
    for (let i = 0; i < d.facilities.length; i++) {
      if (badImage(d.facilities[i].image)) {
        return `Facility ${i + 1}: image must be an https:// URL or an upload`;
      }
    }
  }

  if (template === "faculty") {
    if (badImage(d.photo)) return "Photo must be an https:// URL or an upload";
    for (let i = 0; i < d.links.length; i++) {
      const l = d.links[i];
      if (l.label.trim() && !l.url.trim()) return `Profile link ${i + 1}: add a URL`;
      if (l.url.trim() && !isAllowedUrl(l.url.trim())) {
        return `Profile link ${i + 1}: URL must start with https://, http://, mailto:, tel: or /`;
      }
    }
    for (let i = 0; i < d.publications.length; i++) {
      const p = d.publications[i];
      if (p.link.trim() && !isAllowedUrl(p.link.trim())) {
        return `Publication ${i + 1}: link must start with https://, http://, mailto:, tel: or /`;
      }
    }
  }
  return "";
}