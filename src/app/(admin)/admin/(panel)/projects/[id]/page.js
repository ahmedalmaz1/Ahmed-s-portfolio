"use client";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/admin/useApi";
import { Alert, Button, Spinner } from "@/components/admin/ui";
import ProjectForm from "@/components/admin/ProjectForm";

export default function EditProjectPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi(`/admin/projects/${id}`);
  if (loading) return <Spinner />;
  if (error) {
    return (
      <div className="space-y-3">
        <Alert>{error}</Alert>
        <Button variant="ghost" onClick={reload}>Try again</Button>
      </div>
    );
  }
  return <ProjectForm key={data.id} project={data} />;
}
