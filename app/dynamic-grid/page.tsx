import Link from "next/link";
import { PAGE_ROUTE } from "@/helpers/constant/constant";

export default function DynamicGridPage() {
  return (
    <main style={{ padding: "24px" }}>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{ display: "inline-block", marginBottom: "12px", fontSize: "0.875rem" }}
      >
        ← Back
      </Link>
      <h1>Dynamic Grid</h1>
      <p>This is the dynamic-grid route.</p>
    </main>
  );
}
