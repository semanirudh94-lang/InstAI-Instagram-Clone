import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  // AuthGuard has to wait for loadUser() to read localStorage. Without this, a
  // hard refresh on a protected route renders one pass with `user: null` and
  // bounces the visitor off the page they asked for.
  ready: false,
  login: ({ user, token }) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token, ready: true });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      ready: true,
    });
  },
  loadUser: () => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        ready: true,
      });
    } else {
      set({ ready: true });
    }
  },
  setUser: (user) => set({ user }),
}));
export default useAuthStore;
