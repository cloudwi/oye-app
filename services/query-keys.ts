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
  connection: {
    all: () => ['connection'] as const,
    list: () => ['connection', 'list'] as const,
    myCode: () => ['connection', 'myCode'] as const,
  },
  compatibility: {
    all: () => ['compatibility'] as const,
    today: (id: number) => ['compatibility', 'today', id] as const,
    history: (id: number) => ['compatibility', 'history', id] as const,
  },
  lotto: {
    all: () => ['lotto'] as const,
    stats: () => ['lotto', 'stats'] as const,
    history: (winOnly?: boolean) => ['lotto', 'history', { winOnly }] as const,
    winners: () => ['lotto', 'winners'] as const,
    round: (round: number) => ['lotto', 'round', round] as const,
  },
};
