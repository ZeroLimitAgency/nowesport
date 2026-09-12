# NOW Workspace V1

Le Workspace est le système de travail interne, distinct du backoffice technique `/admin`. Cette vague livre le socle portable (organisation, membres, RBAC, scopes), une navigation autorisée, Fortnite Room et les fondations opérationnelles. Consultez [ARCHITECTURE](ARCHITECTURE.md), [SECURITY](SECURITY.md) et [PORTABILITY](PORTABILITY.md).

## Correspondances existantes

| Existant | Workspace | Règle |
|---|---|---|
| `auth.users` | `workspace_members.user_id` | Auth reste la source d'identité; aucun mot de passe copié. |
| `profiles.role=admin` | permission `administration.access` | Coexistence V1; l'admin historique reste protégé séparément. |
| `games` / `rosters` / `roster_members` | `workspace_player_profiles.roster_member_id` | Le public demeure canonique pour la présentation; les champs internes restent privés. |
| Aucun audit existant | `audit_logs` | Journal Workspace unique, sans secrets. |
