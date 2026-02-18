import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  console.warn(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID – Sanity client will not be fully configured."
  );
}

export const sanityClient = createClient({
  projectId: projectId || "",
  dataset,
  apiVersion: "2024-01-01",
  useCdn: true
});

