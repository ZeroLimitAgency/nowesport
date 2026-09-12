# Sécurité

Trois couches: navigation filtrée, garde serveur par page/action, RLS. `workspace_has_permission` est `SECURITY DEFINER` uniquement pour éviter la récursion RLS; `search_path` est vide, les noms sont qualifiés et EXECUTE est limité aux utilisateurs authentifiés. Les requêtes incluent `organization_id`; la policy tâches limite aussi le département/scope. Les finances doivent utiliser une projection dédiée et `omitFinancialFields`, jamais du CSS. L'admin historique demeure sous `requireAdmin`; la transition vers `administration.access` sera progressive.

EventSub bypasses user sessions only after raw-body HMAC, timestamp, payload-size and replay validation. Twitch/VAPID secrets remain server-only. Push URLs are internal-path allowlisted and payloads exclude sensitive fields. The service worker has no offline cache. Service-role writes are confined to verified webhooks and scheduled sync entry points.

Overlay security uses hashed high-entropy assignment tokens, neutral failures, a strict config/binding/asset allowlist, React text escaping, no administrable HTML, RLS for management data, and service-side public rendering. Public assets must be non-sensitive; SVG is not accepted in V1.
