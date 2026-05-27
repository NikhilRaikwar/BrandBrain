"use client";

import { Switch } from "@/components/ui/switch";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PublicToggle({ brainId, value }: { brainId: string; value: boolean }) {
  const router = useRouter();

  const toggle = async (nextValue: boolean) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("brains").update({ is_public: nextValue }).eq("id", brainId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(nextValue ? "Public access enabled" : "Public access disabled");
    router.refresh();
  };

  return <Switch checked={value} onCheckedChange={toggle} />;
}
