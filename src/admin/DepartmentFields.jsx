import ImageField from "./ImageField";
import RichTextField from "./RichTextField";
import RowsField from "./RowsField";

export default function DepartmentFields({ d, set }) {
  return (
    <>
      <div className="mg-card">
        <h3>Banner</h3>
        <ImageField value={d.bannerImage} onChange={(v) => set({ bannerImage: v })} maxWidth={1400} maxBytes={250000} />
        <input
          placeholder="Tagline (short line under the department name)"
          value={d.tagline}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </div>

      <div className="mg-card">
        <h3>Key numbers (optional, up to 4)</h3>
        <RowsField
          rows={d.stats}
          onChange={(rows) => set({ stats: rows })}
          max={4}
          addLabel="+ Add number"
          columns={[
            { key: "value", placeholder: "Number (e.g. 25+)" },
            { key: "label", placeholder: "Label (e.g. Faculty members)" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>About the department</h3>
        <RichTextField value={d.about} onChange={(html) => set({ about: html })} />
      </div>

      <div className="mg-card">
        <h3>Head of department</h3>
        <input placeholder="Name" value={d.hodName} onChange={(e) => set({ hodName: e.target.value })} />
        <input placeholder="Designation" value={d.hodDesignation} onChange={(e) => set({ hodDesignation: e.target.value })} />
        <ImageField value={d.hodPhoto} onChange={(v) => set({ hodPhoto: v })} maxWidth={640} maxBytes={150000} />
        <textarea rows={4} placeholder="Message from the head of department" value={d.hodMessage} onChange={(e) => set({ hodMessage: e.target.value })} />
      </div>

      <div className="mg-card">
        <h3>Programs</h3>
        <RowsField
          rows={d.programs}
          onChange={(rows) => set({ programs: rows })}
          max={12}
          addLabel="+ Add program"
          columns={[
            { key: "name", placeholder: "Program name (e.g. B.Tech Computer Engineering)" },
            { key: "level", placeholder: "Level (e.g. Undergraduate)" },
            { key: "duration", placeholder: "Duration (e.g. 4 years)" },
            { key: "description", placeholder: "Short description", type: "textarea" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>Facilities and labs</h3>
        <RowsField
          rows={d.facilities}
          onChange={(rows) => set({ facilities: rows })}
          max={8}
          addLabel="+ Add facility"
          columns={[
            { key: "title", placeholder: "Title (e.g. Robotics Lab)" },
            { key: "image", type: "image" },
            { key: "text", placeholder: "Short description", type: "textarea" },
          ]}
        />
      </div>

      <div className="mg-card">
        <h3>Faculty list</h3>
        <label className="he-check">
          <input type="checkbox" checked={d.showFaculty !== false} onChange={(e) => set({ showFaculty: e.target.checked })} />
          Show this department's faculty automatically
        </label>
        <small>
          Faculty appear here when their profile is Published and has this department selected.
        </small>
      </div>

      <div className="mg-card">
        <h3>Contact</h3>
        <input placeholder="Email" value={d.email} onChange={(e) => set({ email: e.target.value })} />
        <input placeholder="Phone" value={d.phone} onChange={(e) => set({ phone: e.target.value })} />
        <textarea rows={3} placeholder="Address / location" value={d.address} onChange={(e) => set({ address: e.target.value })} />
      </div>
    </>
  );
}