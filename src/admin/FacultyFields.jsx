import ImageField from "./ImageField";
import RichTextField from "./RichTextField";
import RowsField from "./RowsField";

export default function FacultyFields({ d, set, departments }) {
  return (
    <>
      <div className="mg-card">
        <h3>Profile</h3>
        <ImageField value={d.photo} onChange={(v) => set({ photo: v })} maxWidth={640} maxBytes={150000} />
        <small>A portrait photo (about 4:5 shape) works best.</small>
        <input
          placeholder="Designation (e.g. Professor and Head)"
          value={d.designation}
          onChange={(e) => set({ designation: e.target.value })}
        />
        <label className="pe-field">
          Department
          <select value={d.departmentId} onChange={(e) => set({ departmentId: e.target.value })}>
            <option value="">None</option>
            {departments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}{p.status === "draft" ? " (draft)" : ""}
              </option>
            ))}
          </select>
        </label>
        <small>Save the department page first so it appears in this list.</small>
        <input
          placeholder="Areas of expertise, separated by commas"
          value={d.expertise}
          onChange={(e) => set({ expertise: e.target.value })}
        />
      </div>

      <div className="mg-card">
        <h3>Contact</h3>
        <input placeholder="Email" value={d.email} onChange={(e) => set({ email: e.target.value })} />
        <input placeholder="Phone" value={d.phone} onChange={(e) => set({ phone: e.target.value })} />
      </div>

      <div className="mg-card">
        <h3>Biography</h3>
        <RichTextField value={d.bio} onChange={(html) => set({ bio: html })} />
      </div>

      <div className="mg-card">
        <h3>Qualifications</h3>
        <RowsField
          rows={d.qualifications}
          onChange={(rows) => set({ qualifications: rows })}
          max={10}
          addLabel="+ Add qualification"
          columns={[
            { key: "degree", placeholder: "Degree (e.g. Ph.D. Computer Science)" },
            { key: "institute", placeholder: "Institute / University" },
            { key: "year", placeholder: "Year" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>Experience</h3>
        <RowsField
          rows={d.experience}
          onChange={(rows) => set({ experience: rows })}
          max={10}
          addLabel="+ Add experience"
          columns={[
            { key: "role", placeholder: "Role (e.g. Associate Professor)" },
            { key: "org", placeholder: "Organization" },
            { key: "period", placeholder: "Period (e.g. 2015 to 2020)" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>Publications</h3>
        <RowsField
          rows={d.publications}
          onChange={(rows) => set({ publications: rows })}
          max={30}
          addLabel="+ Add publication"
          columns={[
            { key: "text", placeholder: "Citation (title, journal, year)", type: "textarea" },
            { key: "link", placeholder: "Link (optional, https://...)" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>Profile links</h3>
        <RowsField
          rows={d.links}
          onChange={(rows) => set({ links: rows })}
          max={6}
          addLabel="+ Add link"
          columns={[
            { key: "label", placeholder: "Label (e.g. Google Scholar)" },
            { key: "url", placeholder: "https://..." },
          ]}
        />
      </div>
    </>
  );
}