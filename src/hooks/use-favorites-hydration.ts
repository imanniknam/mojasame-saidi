import { useEffect } from "react";
import { useFavoritesStore } from "@/lib/stores/favorites-store";

let favoritesRehydrateStarted = false;

export function useFavoritesHydration() {
  useEffect(() => {
    if (!favoritesRehydrateStarted) {
      favoritesRehydrateStarted = true;
      void useFavoritesStore.persist.rehydrate();
    }
  }, []);
}
