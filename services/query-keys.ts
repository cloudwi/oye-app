export const queryKeys = {
  fortune: {
    today: () => ['fortune', 'today'] as const,
    history: () => ['fortune', 'history'] as const,
  },
  inquiry: {
    list: () => ['inquiry', 'list'] as const,
    detail: (id: number) => ['inquiry', 'detail', id] as const,
  },
};
