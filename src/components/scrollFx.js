// Shared mutable state (no re-renders): written by PortraitTravel, read inside useFrame.
export const scrollFx = {
  progress: 0, // 0 → 1 while the portrait travels from Hero to About
  landed: false, // true once the portrait has taken its place in About
};
