import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteItem = {
  productId: string;
  titleFa: string;
  imageUrl: string;
  priceMinor?: number;
  href: string;
  addedAt: number;
};

type FavoritesState = {
  items: FavoriteItem[];
  add: (item: Omit<FavoriteItem, "addedAt">) => void;
  remove: (productId: string) => void;
  toggle: (item: Omit<FavoriteItem, "addedAt">) => boolean;
  has: (productId: string) => boolean;
  clear: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.some((favorite) => favorite.productId === item.productId)) {
          return;
        }
        set({ items: [{ ...item, addedAt: Date.now() }, ...get().items] });
      },
      remove: (productId) =>
        set({
          items: get().items.filter((favorite) => favorite.productId !== productId),
        }),
      toggle: (item) => {
        const exists = get().items.some(
          (favorite) => favorite.productId === item.productId,
        );
        if (exists) {
          get().remove(item.productId);
          return false;
        }
        get().add(item);
        return true;
      },
      has: (productId) =>
        get().items.some((favorite) => favorite.productId === productId),
      clear: () => set({ items: [] }),
    }),
    {
      name: "mojasame-saidi-favorites",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
