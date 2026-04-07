import Link from "next/link";
import { PAGE_ROUTE } from "@/helpers/constant/constant";

export default function DinamicFormPage() {
  return (
    <main style={{ padding: "24px" }}>
      <Link
        href={PAGE_ROUTE.HOME}
        style={{ display: "inline-block", marginBottom: "12px", fontSize: "0.875rem" }}
      >
        ← Back
      </Link>
      <h1>Dinamic Form</h1>
      <p>This is the dinamic-form route.</p>
    </main>
  );
}
