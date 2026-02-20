export const queryKeys = {
  fortune: {
    all: () => ['fortune'] as const,
    today: () => ['fortune', 'today'] as const,
    history: () => ['fortune', 'history'] as const,
  },
  inquiry: {
    all: () => ['inquiry'] as const,
    list: () => ['inquiry', 'list'] as const,
    detail: (id: number) => ['inquiry', 'detail', id] as const,
  },
};
