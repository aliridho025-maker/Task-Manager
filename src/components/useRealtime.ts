"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

// Subscribe ke perubahan beberapa tabel; panggil onChange (mis. router.refresh)
// dengan debounce kecil agar beberapa event beruntun tidak memicu refresh berkali-kali.
export function useRealtime(tables: string[], onChange: () => void) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cbRef.current(), 250);
    };

    const channel = supabase.channel("realtime:app");
    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        fire
      );
    });
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(",")]);
}
