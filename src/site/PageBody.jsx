import BlockRenderer from "./BlockRenderer";
import DepartmentPage from "./DepartmentPage";
import FacultyPage from "./FacultyPage";
import { layoutOf } from "../templateUtil";

export default function PageBody({ page, pages }) {
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  return (
    <div className={`pb-wrap w-${layoutOf(page.layout)}`}>
      {page.template === "department" && <DepartmentPage page={page} pages={pages} />}
      {page.template === "faculty" && <FacultyPage page={page} pages={pages} />}
      {blocks.length > 0 && <BlockRenderer blocks={blocks} pages={pages} />}
    </div>
  );
}