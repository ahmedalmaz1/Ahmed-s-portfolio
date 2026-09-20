import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("projects").select("*");
  return (
    <div className="text-7xl text-red-600">
      Hello
      <p className="text-7xl text-red-600">
        {error ? error.message : `number of projects: ${data.length}`}
      </p>
    </div>
  );
}
