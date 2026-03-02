# OYE App - Expo React Native (TypeScript)

## Quick Reference
- **Type check**: `npx tsc --noEmit`
- **Run**: `npx expo start`
- **Tech**: Expo SDK, React Native, TypeScript
- **Routing**: expo-router (file-based)
- **State**: Zustand (auth-store, user-store)
- **Data fetching**: @tanstack/react-query + Axios
- **Bundle ID**: `com.oyeapp.fortune`

## Project Structure
```
oye-app/
├── app/                    # Expo Router file-based routes
│   ├── (tabs)/             # Tab navigation (홈, 궁합, 로또, 마이)
│   ├── (onboarding)/       # Onboarding flow
│   ├── connection/         # 1:1 연결 (LOVER)
│   ├── group/              # 그룹 궁합
│   ├── auth/               # 인증
│   ├── settings/           # 설정
│   ├── inquiry/            # 문의
│   ├── lotto/              # 로또
│   └── _layout.tsx         # Root Stack
├── components/ui/          # Reusable UI (EmptyState, Skeleton, IconSymbol, etc.)
├── hooks/
│   ├── queries/            # React Query hooks (useXxx pattern)
│   ├── use-theme-color.ts
│   ├── use-responsive-layout.ts
│   └── use-rewarded-ad.ts
├── services/
│   ├── api/                # API clients (apiClient + domain services)
│   │   ├── client.ts       # Axios instance (interceptors, token refresh)
│   │   ├── connection.ts
│   │   ├── compatibility.ts
│   │   ├── group.ts
│   │   └── ...
│   └── query-keys.ts       # React Query key factory
├── types/                  # TypeScript interfaces
├── stores/                 # Zustand stores
├── constants/theme.ts      # Design system (Colors, Spacing, Shadows, etc.)
└── utils/                  # Utilities (score, alert, etc.)
```

## Coding Patterns

### API Service
```typescript
export const xxxApi = {
  async getList(): Promise<Item[]> {
    const response = await apiClient.get<Item[]>('/api/v1/xxx');
    return response.data;  // ApiResponse unwrapped by interceptor
  },
};
```

### Query Keys (`services/query-keys.ts`)
```typescript
export const queryKeys = {
  domain: {
    all: () => ['domain'] as const,
    list: () => ['domain', 'list'] as const,
    detail: (id: number) => ['domain', 'detail', id] as const,
  },
};
```

### React Query Hooks (`hooks/queries/`)
- Query: `useQuery({ queryKey, queryFn, staleTime })`
- Mutation: `useMutation({ mutationFn, onSuccess: invalidateQueries })`
- File naming: `use-xxx.ts` (kebab-case)

### Screen
- `SafeAreaView` → `ScrollView` with `RefreshControl`
- Theme: `useThemeColor({}, 'text')` for dark/light mode
- Animation: `Animated.View entering={FadeInDown.duration(400).delay(100)}`
- Layout: `useResponsiveLayout()` for responsive sizing
- Navigation: `router.push()`, `router.back()`, `useLocalSearchParams()`

### Design System (`constants/theme.ts`)
- Colors: Gray scale, Accent (indigo-purple), Semantic (success/warning/error)
- RelationConfig: LOVER(#D47C9A), FRIEND(#5B8EC9), FAMILY(#4CAF82), COLLEAGUE(#5248A3)
- Spacing: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- BorderRadius: sm(8), md(14), lg(16), xl(20)
- Shadows: sm, md, lg

### Auth
- Token stored in Zustand (useAuthStore) → secureStorage
- User info in Zustand (useUserStore) → AsyncStorage
- API client auto-adds `Authorization: Bearer` header
- Auto token refresh on 401

## Key Domain Concepts
- **궁합 탭**: 연인 궁합 (1:1 LOVER) + 그룹 궁합 섹션
- **Connection**: 코드 기반 1:1 연결 → 일일 궁합
- **Group**: 초대 코드 기반 그룹 → 모든 멤버 쌍 일일 궁합
- **Fortune**: 개인 일일 운세 (리워드 광고 잠금)
- **Lotto**: AI 로또 번호 추천
