import { createRoot } from "react-dom/client";
import "./index.css";

const root = createRoot(document.getElementById("root"));

function showError(err) {
  root.render(
    <pre style={{ padding: 20, color: "#c0392b", whiteSpace: "pre-wrap" }}>
      {String((err && err.stack) || err)}
    </pre>
  );
}

Promise.all([import("./App"), import("./ErrorBoundary")])
  .then(([appModule, boundaryModule]) => {
    const App = appModule.default;
    const ErrorBoundary = boundaryModule.default;
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  })
  .catch(showError);