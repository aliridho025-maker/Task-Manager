export type Task = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: "tinggi" | "sedang" | "rendah";
  status: "todo" | "proses" | "selesai";
  due_date: string | null;
  budget: number;
  project_id: string | null;
  created_at: string;
};
