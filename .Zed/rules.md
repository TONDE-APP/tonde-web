# TONDE — Règles de Code · Web Dashboard (Next.js + TypeScript)

> Décision Option A validée : ce repository utilise Next.js App Router.

## Règles obligatoires

### 1. TypeScript strict — jamais de `any`

```typescript
// ✅ Toujours typer explicitement
interface Ticket {
  id: string;
  number: string;
  status: TicketStatus;
  position: number;
  estimatedWaitMinutes: number;
}

async function fetchTicket(ticketId: string): Promise<Ticket> { ... }

// ❌ JAMAIS any
async function fetchTicket(ticketId: any): Promise<any> { ... } // INTERDIT
```

### 2. TanStack Query pour toutes les données serveur

```typescript
// ✅ Données serveur via TanStack Query (cache, retry, loading states)
function useQueueData(agencyId: string) {
  return useQuery({
    queryKey: ['queue', agencyId],
    queryFn: () => queueApi.getQueue(agencyId),
    refetchInterval: 30_000, // fallback si WebSocket déconnecté
  });
}

// ❌ Jamais fetch direct dans un composant
function QueueScreen() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/queue').then(...); // INTERDIT dans les composants
  }, []);
}
```

### 3. Zustand pour le state global UI uniquement

```typescript
// ✅ Zustand pour state UI global (pas les données serveur)
interface AppStore {
  sidebarOpen: boolean;
  selectedAgencyId: string | null;
  setSidebarOpen: (open: boolean) => void;
  setSelectedAgency: (id: string) => void;
}

const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  selectedAgencyId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedAgency: (id) => set({ selectedAgencyId: id }),
}));

// ❌ Données serveur dans Zustand
// ❌ useState dans les composants pour des données serveur
```

### 4. Un composant = une responsabilité

```typescript
// ✅ Composants petits et ciblés
<QueueTable tickets={tickets} />
<AgentStatusBadge status={agent.status} />
<StatCard label="Tickets aujourd'hui" value={stats.total} />

// ❌ Composant god
function DashboardPage() {
  // 400 lignes, tout mélangé : appels API, state, affichage = INTERDIT
}
```

### 5. API calls — couche service séparée

```typescript
// ✅ Toujours passer par une couche service
// src/services/queue.service.ts
export const queueService = {
  getQueue: (agencyId: string) =>
    apiClient.get<Queue>(`/api/v1/agencies/${agencyId}/queue`),

  callNext: (data: CallNextDto) =>
    apiClient.post('/api/v1/tickets/counter/call-next', data),
};

// ❌ Appels Axios directs dans les composants ou hooks
function useQueue() {
  return useQuery({ queryFn: () => axios.get('/api/v1/queue') }); // INTERDIT
}
```

### 6. Gestion des erreurs — toast + fallback UI

```typescript
// ✅ Toujours gérer les erreurs avec feedback visuel
const mutation = useMutation({
  mutationFn: queueService.callNext,
  onSuccess: () => toast.success('Client appelé avec succès'),
  onError: (error) => toast.error(getErrorMessage(error)),
});

// ❌ Erreur silencieuse
try {
  await queueService.callNext(data);
} catch {} // INTERDIT — l'utilisateur doit savoir
```

### 7. RBAC — vérification des permissions dans l'UI

```typescript
// ✅ Vérifier les permissions avant d'afficher les actions sensibles
function AgentManagementSection() {
  const { user } = useAuth();
  if (!hasPermission(user.role, 'manage_agents')) return null;
  return <AgentList />;
}

// ❌ Afficher des actions sans vérifier le rôle
function Dashboard() {
  return <DeleteAgencyButton />; // Sans vérification de rôle = INTERDIT
}
```

### 8. Internationalisation — jamais de texte en dur

```typescript
// ✅ Toujours i18next
const { t } = useTranslation();
<h1>{t('dashboard.title')}</h1>
<p>{t('queue.position', { position: 5, total: 23 })}</p>

// ❌ Texte en dur
<h1>Tableau de bord</h1>  // INTERDIT
```

### 9. WebSocket — reconnexion automatique obligatoire

```typescript
// ✅ WebSocket avec reconnexion
class QueueWebSocketService {
  private reconnectTimeout: NodeJS.Timeout | null = null;

  connect(agencyId: string) {
    this.ws = new WebSocket(`${WS_URL}/ws/agency/${agencyId}`);
    this.ws.onclose = () => {
      this.reconnectTimeout = setTimeout(() => this.connect(agencyId), 3000);
    };
  }
}

// ❌ WebSocket sans gestion de déconnexion = INTERDIT
```

---

## Ce qu'il ne faut jamais faire

```
❌ TypeScript any
❌ Appels API directs dans les composants
❌ Données serveur dans Zustand (utiliser TanStack Query)
❌ Texte en dur sans i18next
❌ Composant > 200 lignes sans décomposition
❌ Action UI sans vérification du rôle RBAC
❌ WebSocket sans reconnexion automatique
❌ Afficher un message d'erreur technique à l'utilisateur
❌ CSS inline ou styles hardcodés (utiliser Tailwind)
❌ Créer un appel API sans vérifier le contrat API
```

---

## Contexte business

```
Fondateur / Tech Lead : Vital
GitHub repo           : tonde-app/tonde-web
Backend DEV           : http://localhost:8000
Backend PROD          : https://api.tonde.app
Dashboard port DEV    : http://localhost:3000
Rôles web             : agent, supervisor, admin_agency, admin_org, super_admin
```
