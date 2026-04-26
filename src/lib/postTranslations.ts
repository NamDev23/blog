import type { Locale } from '@/lib/locales';
import type { Post, PostTranslation as StoredPostTranslation } from '@/types';

/**
 * Bản dịch tiếng Anh fallback cho bài viết cũ/mock.
 *
 * CMS song ngữ mới ưu tiên dữ liệu từ bảng `post_translations`. Map tĩnh này chỉ
 * còn là lớp tương thích cho mock data hoặc bản ghi cũ chưa được sync translation.
 * Slug vẫn giữ nguyên giữa hai ngôn ngữ để canonical/hreflang hiện tại ổn định.
 */
type StaticPostTranslation = Pick<Post, 'title' | 'content' | 'excerpt'> & {
  seo_title?: string;
  seo_description?: string;
};

export const englishPostTranslations: Record<string, StaticPostTranslation> = {
  'devops-thuc-chien-tu-commit-den-production': {
    title: 'Practical DevOps: from commit to stable production',
    excerpt: 'A practical DevOps guide for developers: delivery lifecycle, CI/CD, artifacts, environments, deployment strategy, observability, and production checklists.',
    seo_title: 'Practical DevOps from commit to production',
    seo_description: 'Learn practical DevOps concepts: CI/CD, immutable artifacts, deployment strategy, rollback, logs, metrics, and production readiness.',
    content: `
      <h2>DevOps is not just tooling</h2>
      <p>Many developers start DevOps by installing Jenkins, GitHub Actions, Docker, Kubernetes, or Terraform. Those tools matter, but DevOps is first a delivery discipline: how code moves from a developer machine to production in a repeatable, observable, and reversible way.</p>
      <p>A solid DevOps process answers operational questions before incidents happen: who changed what, which checks ran, which artifact is in production, how rollback works, where logs live, which metrics define health, and whether secrets are kept out of source code and images.</p>

      <h2>The delivery lifecycle</h2>
      <ul>
        <li><strong>Commit:</strong> small changes with clear intent and review context.</li>
        <li><strong>Build:</strong> produce an artifact that can be reproduced outside a local machine.</li>
        <li><strong>Test:</strong> run lint, type checks, unit tests, integration checks, and security scans where useful.</li>
        <li><strong>Package:</strong> tag a deployable bundle or container image with a traceable version.</li>
        <li><strong>Deploy:</strong> move the tested artifact into an environment with controlled configuration.</li>
        <li><strong>Observe:</strong> watch logs, metrics, traces, alerts, and user-facing behavior after release.</li>
      </ul>

      <h2>A minimal CI pipeline</h2>
      <p>For a small web application, a useful pipeline can start with validation, build, scanning, and deployment. Fast feedback is more important than an impressive number of stages.</p>
      <pre><code class="language-yaml">name: delivery

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test --if-present
</code></pre>

      <h2>Environment consistency</h2>
      <p>Local, staging, and production do not need to be identical, but the pieces that change application behavior should be standardized: runtime versions, environment variables, migrations, startup commands, network ports, permissions, and cache settings.</p>
      <p>Docker helps standardize runtime, but it does not solve secrets, backups, migrations, storage, or rollback planning by itself. Code should live in the repository; environment-specific configuration and secrets should not.</p>

      <h2>Deployment strategy</h2>
      <p>Not every system needs blue-green or canary releases on day one. Small web products often work well with rolling deployment plus health checks and artifact rollback. Higher-traffic systems may benefit from canary releases where a new version receives a small percentage of traffic first.</p>
      <ul>
        <li><strong>Recreate:</strong> simple, but usually causes a short downtime window.</li>
        <li><strong>Rolling:</strong> replaces instances gradually and needs reliable health checks.</li>
        <li><strong>Blue-green:</strong> keeps two environments and switches traffic when the new one is ready.</li>
        <li><strong>Canary:</strong> releases to a small slice of traffic before wider rollout.</li>
      </ul>

      <h2>Observability is part of the feature</h2>
      <p>Deployment is not finished when the command succeeds. Logs show what happened, metrics show system health, traces show where time was spent, and alerts bring the right person in when user-facing behavior is affected.</p>
      <p>For APIs, start with request rate, error rate, p95/p99 latency, CPU, memory, database connections, queue depth, and restart count. For frontend, track Web Vitals, runtime errors, failed API calls, and key page load time.</p>

      <h2>Production checklist</h2>
      <ul>
        <li>README explains local setup, tests, and deployment.</li>
        <li>CI runs lint, type checks, and tests before merge.</li>
        <li>Artifacts are tagged by commit SHA or release version.</li>
        <li>Secrets are stored in the deployment platform or a secret manager.</li>
        <li>Database migrations have a rollback or compatibility plan.</li>
        <li>Health checks verify meaningful readiness, not just a fake 200 response.</li>
        <li>Logs include request or correlation IDs.</li>
        <li>Alerts focus on user impact, not noisy resource changes.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
      </ul>
    `,
  },
  'docker-cho-developer-image-container-network-volume': {
    title: 'Docker for developers: images, containers, networks, and volumes',
    excerpt: 'A developer-focused Docker guide covering images, containers, Dockerfile cache, Compose, networking, volumes, debugging, and production checklists.',
    seo_title: 'Docker for developers: image and container basics',
    seo_description: 'Learn Docker image, container, network, volume, Dockerfile, Compose, debugging, and production checklist concepts.',
    content: `
      <h2>What Docker solves</h2>
      <p>Docker packages an application with its runtime, system dependencies, and startup command into an image that can run consistently across environments. It is especially useful when a project has multiple services or when onboarding needs to be fast and repeatable.</p>
      <p>A container is not a small virtual machine. Containers share the host kernel, start quickly, and run from immutable images. Understanding images, containers, networks, and volumes makes Docker far easier to debug.</p>

      <h2>Image vs container</h2>
      <p>An image is a layered blueprint. A container is a running instance of that image. You can delete a container without deleting its image, run many containers from one image, and lose filesystem changes unless data is stored in a volume.</p>
      <pre><code class="language-dockerfile">FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
</code></pre>

      <h2>.dockerignore matters</h2>
      <p>Without <code>.dockerignore</code>, build context may include <code>node_modules</code>, local caches, logs, Git history, or secrets. That makes builds slower and increases the risk of leaking data into an image.</p>
      <pre><code class="language-text">node_modules
.next
.git
.env
.env.local
npm-debug.log
coverage
dist
</code></pre>

      <h2>Compose for local stacks</h2>
      <p>Docker Compose describes local services, ports, volumes, and environment variables in one file. In the default Compose network, services can call each other by service name.</p>
      <pre><code class="language-yaml">services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
</code></pre>

      <h2>Networking and volumes</h2>
      <p>Port mapping such as <code>3000:3000</code> exposes a container port to the host. Between containers, use service names such as <code>db:5432</code>. Inside a container, <code>localhost</code> means that same container, not another service.</p>
      <p>Volumes keep data outside the disposable container lifecycle. Use named volumes for local databases and bind mounts for development source code. In production, use managed databases, object storage, or volume systems with backups.</p>

      <h2>Debug commands</h2>
      <pre><code class="language-bash">docker ps
docker logs app
docker exec -it app sh
docker inspect app
docker compose config
docker compose logs -f app
docker system df
</code></pre>

      <h2>Production checklist</h2>
      <ul>
        <li>Use explicit base image versions.</li>
        <li>Keep secrets out of images.</li>
        <li>Use <code>.dockerignore</code> to reduce build context.</li>
        <li>Tag images by commit SHA or release version.</li>
        <li>Run a clear foreground process as the main command.</li>
        <li>Expose the correct port and configure health checks.</li>
        <li>Run as non-root where the base image and framework allow it.</li>
        <li>Scan images and dependencies regularly.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://docs.docker.com/compose/how-tos/networking/">Docker Docs: Compose networking</a></li>
        <li><a href="https://docs.docker.com/engine/storage/volumes/">Docker Docs: Volumes</a></li>
      </ul>
    `,
  },
  'networking-nen-tang-cho-backend-dns-tcp-tls-http-proxy': {
    title: 'Networking basics for backend developers: DNS, TCP, TLS, HTTP, and proxies',
    excerpt: 'A practical backend networking overview: request lifecycle, DNS, TCP timeouts, TLS, HTTP status codes, reverse proxies, and debugging tools.',
    seo_title: 'Networking basics for backend developers',
    seo_description: 'Understand DNS, TCP, TLS, HTTP, reverse proxies, and debugging tools for more reliable production APIs.',
    content: `
      <h2>Why backend developers need networking</h2>
      <p>Many production issues look like code bugs but start in the network: stale DNS, wrong timeouts, proxy body limits, expired TLS certificates, blocked database ports, or failed load balancer health checks.</p>

      <h2>The request path</h2>
      <p>A browser request commonly goes through DNS lookup, TCP connection, TLS negotiation, HTTP request handling, CDN or reverse proxy routing, load balancing, application processing, and database or service calls.</p>
      <ul>
        <li><strong>DNS:</strong> maps a domain name to an IP address.</li>
        <li><strong>TCP:</strong> provides reliable ordered delivery.</li>
        <li><strong>TLS:</strong> encrypts traffic and verifies the server identity.</li>
        <li><strong>HTTP:</strong> carries methods, headers, body, and status codes.</li>
        <li><strong>Proxy/load balancer:</strong> routes traffic, terminates TLS, and applies policies.</li>
      </ul>

      <h2>DNS and TTL</h2>
      <p>Common DNS records include A, AAAA, CNAME, MX, and TXT. TTL controls how long resolvers can cache a record. Lower TTL before infrastructure cutovers; raise it after the change stabilizes.</p>
      <pre><code class="language-bash">dig example.com
dig api.example.com CNAME
nslookup example.com
</code></pre>

      <h2>TCP, timeout, and retry</h2>
      <p>Every dependency call should have a timeout. No timeout can hang resources indefinitely; overly short timeouts create false failures. Use bounded retries and log the dependency that is slow or failing.</p>

      <h2>TLS and HTTP semantics</h2>
      <p>TLS is often terminated at a CDN, load balancer, or reverse proxy. Common issues include expired certificates, missing intermediate certificates, incorrect domains, and wrong forwarded scheme headers.</p>
      <p>HTTP status codes are part of the operational contract. Use 400 for invalid requests, 401 for unauthenticated access, 403 for insufficient permission, 404 for missing resources, 409 for conflicts, 429 for rate limits, 500 for unexpected server errors, and 503 for temporary unavailability.</p>

      <h2>Reverse proxy basics</h2>
      <pre><code class="language-nginx">server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://app:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 10m;
  }
}
</code></pre>

      <h2>Debugging toolkit</h2>
      <pre><code class="language-bash">curl -I https://example.com
curl -v https://api.example.com/health
dig example.com
nc -vz db.example.com 5432
openssl s_client -connect example.com:443 -servername example.com
</code></pre>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP response status codes</a></li>
        <li><a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html">NGINX Docs: HTTP proxy module</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching">MDN: HTTP caching</a></li>
      </ul>
    `,
  },
  'kien-truc-web-app-monolith-ro-rang-den-he-thong-de-mo-rong': {
    title: 'Web application architecture: from a clear monolith to scalable systems',
    excerpt: 'A practical architecture guide: modular monoliths, layering, database constraints, caching, queues, and when to split services.',
    seo_title: 'Scalable web application architecture',
    seo_description: 'Learn modular monoliths, layering, database design, caching, queues, and service boundaries for scalable web apps.',
    content: `
      <h2>Architecture starts with boundaries</h2>
      <p>Architecture is not about showing complexity. It is about managing change. A well-structured monolith is often more effective than premature microservices when the team, domain, and operations are still evolving.</p>

      <h2>A monolith is not the enemy</h2>
      <p>Monoliths are easy to deploy, debug, and transact across. The problem is not one deployable unit; the problem is unclear boundaries. A modular monolith keeps one deployment while separating domains such as identity, content, billing, notification, and reporting.</p>

      <h2>Practical layering</h2>
      <ul>
        <li><strong>Route/controller:</strong> parse requests and return responses.</li>
        <li><strong>Application service:</strong> orchestrate use cases, transactions, permissions, and events.</li>
        <li><strong>Domain logic:</strong> hold core rules such as publishing, state transitions, and eligibility checks.</li>
        <li><strong>Data access:</strong> query and map database data.</li>
        <li><strong>Adapters:</strong> integrate email, payments, storage, and external APIs.</li>
      </ul>

      <h2>Database decisions matter</h2>
      <p>For most web apps, the database is the most valuable system. Use constraints for important invariants: unique slugs, foreign keys, valid status values, non-negative counters, and required fields. App validation improves UX; database constraints protect correctness.</p>

      <h2>Cache and queues</h2>
      <p>Cache can reduce latency and database load, but it adds stale-data risk. Define TTL, cache keys, and invalidation before adding it. Queue slow or retryable work such as email, image processing, webhook delivery, report generation, and external sync. Design jobs to be idempotent.</p>

      <h2>When to split services</h2>
      <p>Split a service when domain ownership is clear, contracts are stable, scaling needs differ, and the team can operate the extra complexity. Splitting a messy monolith too early often creates multiple messy services plus network failure modes.</p>

      <h2>Architecture checklist</h2>
      <ul>
        <li>Modules are named by domain, not only by technical layer.</li>
        <li>Controllers stay thin and business rules live in services or domain code.</li>
        <li>Database constraints protect important data rules.</li>
        <li>Indexes match real product queries.</li>
        <li>Background jobs handle slow or retryable work.</li>
        <li>Cache has clear TTL, keys, and invalidation.</li>
        <li>Logs and metrics map to important user-facing use cases.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/indexes.html">PostgreSQL Docs: Indexes</a></li>
        <li><a href="https://www.postgresql.org/docs/current/ddl-constraints.html">PostgreSQL Docs: Constraints</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching">MDN: HTTP caching</a></li>
      </ul>
    `,
  },
  'git-workflow-chuyen-nghiep-commit-branch-review': {
    title: 'Professional Git workflow: clean commits, clear branches, easier reviews',
    excerpt: 'A practical Git workflow guide for teams: clean commits, branch strategy, rebase, squash, conflicts, pull requests, and safety rules.',
    seo_title: 'Professional Git workflow for developers',
    seo_description: 'Learn clean commits, branch strategy, rebase, squash, conflict resolution, pull requests, and safe Git practices.',
    content: `
      <h2>Git is team communication</h2>
      <p>Git is more than a storage system for code. A clean history helps reviewers understand changes, helps future debugging with blame and bisect, and makes release or rollback decisions more precise.</p>

      <h2>Commits should tell small stories</h2>
      <p>A useful commit has a focused scope and a meaningful message. Avoid mixing UI changes, schema updates, auth logic, formatting, and unrelated fixes in one commit.</p>
      <ul>
        <li>Commit schema or migration changes separately.</li>
        <li>Commit service or repository logic separately.</li>
        <li>Commit API/UI integration separately.</li>
        <li>Commit tests and documentation where they make review easier.</li>
      </ul>

      <h2>Keep branch strategy simple</h2>
      <p>For many web teams, short-lived branches with pull requests and CI are enough. Long-lived branches increase conflict risk and architecture drift. Keep main deployable or close to deployable.</p>

      <h2>Rebase, merge, and squash</h2>
      <p><code>merge</code> preserves branch history. <code>rebase</code> replays your commits on top of a new base. <code>squash</code> combines many commits into one when the intermediate history is not useful.</p>
      <pre><code class="language-bash">git fetch origin
git switch feature/post-editor
git rebase origin/main
git push --force-with-lease
</code></pre>
      <p><code>--force-with-lease</code> is safer than plain force push because it refuses to overwrite remote changes that your local branch has not seen.</p>

      <h2>Conflict resolution</h2>
      <p>A conflict only means Git cannot safely choose between two edits. Read both sides, understand the behavior, resolve one file at a time, and run relevant tests after resolution.</p>
      <pre><code class="language-bash">git status
git diff
git log --oneline --decorate --graph --all -20
git add src/app/api/posts/route.ts
git rebase --continue
</code></pre>

      <h2>Pull request quality</h2>
      <p>A good PR explains what changed, why it changed, how it was tested, and which risks deserve reviewer attention. Reviewers should check behavior, security, edge cases, maintainability, and fit with existing architecture.</p>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://git-scm.com/docs/git-rebase">Git Docs: git rebase</a></li>
        <li><a href="https://git-scm.com/docs/git-push">Git Docs: git push</a></li>
        <li><a href="https://git-scm.com/docs/git-bisect">Git Docs: git bisect</a></li>
      </ul>
    `,
  },
  'bao-mat-web-api-thuc-dung-auth-session-rate-limit-input': {
    title: 'Practical web/API security: auth, sessions, rate limits, and input handling',
    excerpt: 'A practical web/API security guide covering authentication, authorization, session cookies, JWTs, validation, output filtering, rate limiting, and secrets.',
    seo_title: 'Practical web and API security',
    seo_description: 'A practical checklist for API security: auth, session cookies, JWTs, validation, output filtering, rate limits, and secrets.',
    content: `
      <h2>Security begins with ordinary mistakes</h2>
      <p>Many incidents come from simple failures: committed tokens, admin endpoints without authorization, unvalidated input, unsafe session cookies, sensitive data in logs, or APIs returning too many fields.</p>

      <h2>Authentication vs authorization</h2>
      <p>Authentication answers who the user is. Authorization answers what the user may do. A logged-in user should not automatically be allowed to edit every post, view every order, or call every admin endpoint.</p>

      <h2>Session cookies and JWTs</h2>
      <p>Session cookies work well for browser dashboards. Use <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>, and reasonable expiration. JWTs can work well for APIs or service-to-service verification, but revocation and permission changes require careful design.</p>

      <h2>Allowlist validation</h2>
      <p>Validate type, length, format, enum values, and relationships. For HTML content, sanitize scripts, event handlers, and dangerous URLs.</p>
      <pre><code class="language-ts">type PostInput = {
  title: string;
  slug: string;
  content: string;
  published_at: string | null;
};

function isValidSlug(value: string) {
  return /^[a-z0-9-]+$/.test(value) && value.length &lt;= 120;
}
</code></pre>

      <h2>Output filtering</h2>
      <p>Public APIs should return only public fields. For example, comments may store author email for moderation, but public routes should expose only approved author name, content, and timestamps.</p>

      <h2>Rate limiting and secrets</h2>
      <p>Login, contact, comment, search, upload, and AI-generation endpoints need abuse protection. Secrets should never be committed, bundled into frontend JavaScript, or written to logs. Rotate keys when exposure is suspected.</p>

      <h2>Security checklist</h2>
      <ul>
        <li>Every sensitive mutation checks authentication and authorization server-side.</li>
        <li>Session cookies use HttpOnly, Secure, SameSite, and expiration.</li>
        <li>Inputs are validated with allowlists and length limits.</li>
        <li>Public APIs do not return sensitive fields.</li>
        <li>Abuse-prone endpoints have rate limits.</li>
        <li>Secrets stay out of Git, frontend bundles, and logs.</li>
        <li>Admin actions are audit logged.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie">MDN: Set-Cookie header</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">MDN: Content Security Policy</a></li>
      </ul>
    `,
  },
  'cicd-chat-luong-quality-gate-rollback-release-an-toan': {
    title: 'High-quality CI/CD: quality gates, rollback, and safer releases',
    excerpt: 'Design a professional CI/CD pipeline with quality gates, immutable artifacts, promotion, rollback, safe migrations, and release checklists.',
    seo_title: 'High-quality CI/CD with rollback',
    seo_description: 'Practical CI/CD guide covering quality gates, artifacts, environment promotion, rollback, safe migrations, and release readiness.',
    content: `
      <h2>CI/CD is not just automatic deployment</h2>
      <p>A professional pipeline is a sequence of controls. It shows which changes are allowed to move forward, which artifact is being released, what risks remain, and how rollback works if production fails.</p>

      <h2>Quality gates</h2>
      <p>Useful gates include lint, type checking, unit tests, integration tests, production builds, dependency audits, and secret scanning. Fast gates should run on pull requests; expensive gates can run on schedules or before release.</p>

      <h2>Immutable artifacts</h2>
      <p>Build once and promote the same artifact across environments. Use commit SHAs, build numbers, or semantic versions so production can be traced back to source and review history.</p>
      <pre><code class="language-bash">IMAGE_TAG=$(git rev-parse --short HEAD)
docker build -t registry.example.com/app:$IMAGE_TAG .
docker push registry.example.com/app:$IMAGE_TAG
</code></pre>

      <h2>Rollback and migrations</h2>
      <p>Application rollback is usually easier than database rollback. Design risky migrations as multi-step releases: add schema, deploy compatible code, backfill, switch behavior, then remove old schema later.</p>

      <h2>Release checklist</h2>
      <ul>
        <li>Pull requests are small and describe risk and testing.</li>
        <li>CI passes lint, type checks, tests, and production build.</li>
        <li>Artifacts are tagged by commit or release version.</li>
        <li>Migrations are backward-compatible or have a recovery plan.</li>
        <li>Deployment has health checks and timeouts.</li>
        <li>Dashboards show error rate, latency, throughput, and logs.</li>
        <li>Rollback commands or procedures are written before release.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://docs.github.com/en/actions">GitHub Docs: GitHub Actions</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
      </ul>
    `,
  },
  'docker-image-production-nho-an-toan-build-nhanh': {
    title: 'Production Docker images: smaller, safer, and faster to build',
    excerpt: 'Optimize production Docker images with multi-stage builds, layer cache, .dockerignore, runtime secrets, non-root users, and image scanning.',
    seo_title: 'Smaller and safer production Docker images',
    seo_description: 'Optimize production Docker images with multi-stage builds, cache, .dockerignore, secrets, non-root runtime, and image scanning.',
    content: `
      <h2>Production images need design</h2>
      <p>A Dockerfile that works locally may still be poor for production: large images, dev dependencies, copied env files, root users, unclear tags, and slow cache behavior. Treat images as release artifacts.</p>

      <h2>Multi-stage build</h2>
      <p>Build-time tools are often not needed at runtime. Multi-stage builds let you compile in one stage and copy only the required output into a smaller runtime stage.</p>
      <pre><code class="language-dockerfile">FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
</code></pre>

      <h2>Cache and context</h2>
      <p>Copy dependency manifests before source code so install layers can be reused. Keep build context small with <code>.dockerignore</code> to prevent unrelated files from invalidating cache.</p>

      <h2>Secrets and users</h2>
      <p>Never bake secrets into images. Inject database passwords, service keys, signing secrets, and API keys at runtime. Run as a non-root user when the framework and base image allow it.</p>

      <h2>Checklist</h2>
      <ul>
        <li>Use explicit base image versions.</li>
        <li>Use multi-stage builds when runtime needs less than build time.</li>
        <li>Exclude local output, logs, Git history, and env files.</li>
        <li>Keep secrets out of images and logs.</li>
        <li>Tag images by commit SHA or release version.</li>
        <li>Scan dependencies and images in CI.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://docs.docker.com/build/concepts/context/#dockerignore-files">Docker Docs: .dockerignore files</a></li>
        <li><a href="https://docs.docker.com/build/building/secrets/">Docker Docs: Build secrets</a></li>
      </ul>
    `,
  },
  'kubernetes-cho-developer-deployment-service-readiness-autoscaling': {
    title: 'Kubernetes for developers: Deployment, Service, readiness, and autoscaling',
    excerpt: 'A practical Kubernetes guide for developers covering Deployments, Pods, Services, readiness/liveness probes, resource requests, limits, and autoscaling.',
    seo_title: 'Kubernetes for developers: Deployments and probes',
    seo_description: 'Understand Kubernetes Deployments, Services, readiness probes, liveness probes, resource requests, limits, and autoscaling.',
    content: `
      <h2>Do not start with YAML alone</h2>
      <p>Kubernetes is easier to learn by understanding the operational problem each object solves. For developers, start with Pods, Deployments, Services, and probes.</p>

      <h2>Deployment manages rollout</h2>
      <p>A Deployment maintains the desired number of Pods and rolls out new versions. Rolling updates replace Pods gradually, but only work well when readiness checks accurately signal whether a Pod can receive traffic.</p>
      <pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: registry.example.com/api:1.4.2
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
</code></pre>

      <h2>Service stabilizes networking</h2>
      <p>Pod IPs are disposable. A Service selects Pods by labels and gives other workloads a stable DNS name. Public traffic usually comes through Ingress or a load balancer in front of the Service.</p>

      <h2>Requests, limits, and autoscaling</h2>
      <p>Requests help the scheduler place Pods. Limits define maximum resource use. Choose values from measurements, not guesses. Horizontal Pod Autoscaler can scale by CPU, memory, or custom metrics, but scaling out does not fix a slow database query.</p>

      <h2>Checklist</h2>
      <ul>
        <li>Use explicit image tags, not <code>latest</code>, in production.</li>
        <li>Readiness checks are lightweight and reflect traffic readiness.</li>
        <li>Liveness checks do not restart healthy Pods because a dependency is temporarily slow.</li>
        <li>Service selectors match Pod labels consistently.</li>
        <li>Requests and limits come from real measurements.</li>
        <li>ConfigMap and Secret values are kept out of images.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/services-networking/service/">Kubernetes Docs: Services</a></li>
        <li><a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/">Kubernetes Docs: Probes</a></li>
      </ul>
    `,
  },
  'reverse-proxy-cho-api-header-timeout-body-size-cache': {
    title: 'Reverse proxies for APIs: headers, timeouts, body size, and cache',
    excerpt: 'A production reverse proxy guide for APIs: forwarded headers, request IDs, timeouts, body size limits, upload strategy, and public/private caching.',
    seo_title: 'Reverse proxies for production APIs',
    seo_description: 'Learn reverse proxy configuration for APIs: forwarded headers, request IDs, timeouts, body size, uploads, and cache.',
    content: `
      <h2>The proxy is an operational layer</h2>
      <p>Production traffic commonly passes through a CDN, load balancer, or reverse proxy before it reaches the app. If the proxy is wrong, correct application code can still fail.</p>

      <h2>Forwarded headers</h2>
      <p>Applications often need the original host, scheme, and client IP. Proxies should forward the right headers, and applications should trust only known proxy sources.</p>
      <pre><code class="language-nginx">location / {
  proxy_pass http://app:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Request-Id $request_id;
}
</code></pre>

      <h2>Timeouts and body size</h2>
      <p>Timeouts must align across client, proxy, app, database, and internal HTTP clients. Body size limits should match endpoint needs. For large uploads, prefer direct uploads to object storage with signed URLs.</p>

      <h2>Cache policy</h2>
      <p>Public blog content, static assets, and RSS can often be cached. Admin dashboards, user-specific APIs, authorization responses, and cookie-bearing responses should not be cached by shared proxies.</p>
      <ul>
        <li><code>public</code>: shared caches may store the response.</li>
        <li><code>private</code>: only the end user's browser should store it.</li>
        <li><code>no-store</code>: do not store the response.</li>
        <li><code>s-maxage</code>: TTL for shared caches such as CDNs.</li>
      </ul>

      <h2>Checklist</h2>
      <ul>
        <li>Host, scheme, and client IP headers are forwarded correctly.</li>
        <li>The app trusts only known proxy headers.</li>
        <li>Proxy and app timeouts do not contradict each other.</li>
        <li>Body size limits match each endpoint.</li>
        <li>Public cache is not applied to private data.</li>
        <li>Logs include request ID, status, path, and upstream time.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html">NGINX Docs: HTTP proxy module</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control">MDN: Cache-Control</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For">MDN: X-Forwarded-For</a></li>
      </ul>
    `,
  },
  'postgresql-index-explain-toi-uu-query-bang-du-lieu-that': {
    title: 'PostgreSQL indexes and EXPLAIN: optimize queries with real data',
    excerpt: 'Optimize PostgreSQL with real query patterns, indexes, composite indexes, EXPLAIN/EXPLAIN ANALYZE, and constraints that protect data correctness.',
    seo_title: 'PostgreSQL indexes and EXPLAIN in practice',
    seo_description: 'Use PostgreSQL indexes, composite indexes, EXPLAIN ANALYZE, and constraints to optimize real production queries.',
    content: `
      <h2>Indexes are not free</h2>
      <p>Indexes can make reads faster, but they add storage and slow down writes. Add indexes based on real query patterns and plans, not intuition.</p>

      <h2>Start from query patterns</h2>
      <p>List important queries: filters, sorting, pagination, joins, and detail lookups. Blog posts usually need indexes for slug lookups, publish dates, and category filters.</p>
      <pre><code class="language-sql">CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
</code></pre>

      <h2>Composite indexes</h2>
      <p>If a query commonly filters by category and sorts by published date, a composite index may help. Column order matters because PostgreSQL can use the leftmost parts of an index most effectively.</p>
      <pre><code class="language-sql">CREATE INDEX idx_posts_category_published
ON posts(category, published_at DESC);
</code></pre>

      <h2>EXPLAIN</h2>
      <p><code>EXPLAIN</code> shows the planned query strategy. <code>EXPLAIN ANALYZE</code> executes the query and reports actual timing, so use it carefully with expensive or write queries.</p>
      <pre><code class="language-sql">EXPLAIN ANALYZE
SELECT id, title, slug, published_at
FROM posts
WHERE category = 'DevOps'
  AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 10;
</code></pre>

      <h2>Constraints protect correctness</h2>
      <p>Use unique, foreign key, check, and not-null constraints for important invariants. Application validation improves UX; database constraints protect data when scripts, jobs, or bugs write data.</p>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/indexes.html">PostgreSQL Docs: Indexes</a></li>
        <li><a href="https://www.postgresql.org/docs/current/using-explain.html">PostgreSQL Docs: Using EXPLAIN</a></li>
        <li><a href="https://www.postgresql.org/docs/current/ddl-constraints.html">PostgreSQL Docs: Constraints</a></li>
      </ul>
    `,
  },
  'api-ben-vung-pagination-idempotency-versioning-rate-limit': {
    title: 'Durable APIs: pagination, idempotency, versioning, and rate limits',
    excerpt: 'Design durable APIs with pagination, idempotency keys, versioning, consistent error formats, rate limiting, and production logging.',
    seo_title: 'Durable API design: pagination and idempotency',
    seo_description: 'Learn API pagination, idempotency keys, versioning, error formats, rate limits, response filtering, and API security.',
    content: `
      <h2>An API is a long-term contract</h2>
      <p>APIs connect systems. Good APIs are predictable, debuggable, safe to retry, and able to evolve without breaking clients unexpectedly.</p>

      <h2>Pagination</h2>
      <p>Listing endpoints should not return everything. Offset pagination is simple but can be slow or unstable for large changing data sets. Cursor pagination is often better for feeds and large lists.</p>
      <pre><code class="language-http">GET /api/posts?limit=20&cursor=2026-04-25T08:00:00Z
</code></pre>

      <h2>Idempotency</h2>
      <p>Retrying the same sensitive mutation should not create duplicate side effects. Payment, order creation, email sending, and webhook processing often need idempotency keys.</p>
      <pre><code class="language-http">POST /api/orders
Idempotency-Key: 7a2f4e7f-7c2f-4e2f-8c2d-72d2a6c9a111
</code></pre>

      <h2>Versioning and errors</h2>
      <p>Adding fields is usually safe; removing fields, changing types, or changing status code meanings can break clients. Use versioning and deprecation windows for significant changes.</p>
      <pre><code class="language-json">{
  "error": {
    "code": "validation_failed",
    "message": "Title is required.",
    "fields": {
      "title": "Required"
    }
  }
}
</code></pre>

      <h2>Rate limits</h2>
      <p>Login, search, contact, comments, uploads, and AI generation endpoints need abuse protection. Return 429 when appropriate and include retry guidance when useful.</p>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP response status codes</a></li>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After">MDN: Retry-After header</a></li>
      </ul>
    `,
  },
  'git-release-workflow-tag-changelog-hotfix-revert-an-toan': {
    title: 'Git release workflow: tags, changelogs, hotfixes, and safe revert',
    excerpt: 'A practical Git release workflow covering release tags, changelogs, hotfix branches, safe revert, and production release checklists.',
    seo_title: 'Git release workflow: tags and hotfixes',
    seo_description: 'Manage releases with Git tags, changelogs, hotfix branches, safe revert, and production release checklists.',
    content: `
      <h2>Releases need more than merging to main</h2>
      <p>Once real users depend on a product, you need to know which release is running, which changes it contains, how hotfixes move, and which commit to revert if production fails.</p>

      <h2>Tag release commits</h2>
      <p>Tags give a stable name to release commits. Use annotated tags for official releases because they include metadata and a message.</p>
      <pre><code class="language-bash">git tag -a v1.4.2 -m "Release v1.4.2"
git push origin v1.4.2
</code></pre>

      <h2>Write changelogs for readers</h2>
      <p>A changelog should group impact, not dump raw commits. Useful sections include Added, Changed, Fixed, Security, Migration, Deprecated, and Removed.</p>

      <h2>Hotfix and revert</h2>
      <p>A hotfix should be short but still controlled: branch from the production commit, fix, test the relevant path, tag a new release, and merge the fix back so main does not drift.</p>
      <p>For changes already shared or deployed, <code>git revert</code> is usually safer than rewriting history because it creates a new commit that reverses the change.</p>

      <h2>Release checklist</h2>
      <ul>
        <li>Main or the release branch clearly reflects deployable state.</li>
        <li>Every release maps to a tag or build number.</li>
        <li>Changelog describes user and operational impact.</li>
        <li>Hotfixes go through Git, not direct server edits.</li>
        <li>Revert is preferred over history rewriting for public changes.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://git-scm.com/docs/git-tag">Git Docs: git tag</a></li>
        <li><a href="https://git-scm.com/docs/git-revert">Git Docs: git revert</a></li>
        <li><a href="https://git-scm.com/docs/git-merge">Git Docs: git merge</a></li>
      </ul>
    `,
  },
  'seo-ky-thuat-blog-it-canonical-sitemap-structured-data-core-web-vitals': {
    title: 'Technical SEO for IT blogs: canonical URLs, sitemap, structured data, and Core Web Vitals',
    excerpt: 'A technical SEO checklist for IT blogs: titles, descriptions, canonical URLs, sitemap, robots, structured data, hreflang, and Core Web Vitals.',
    seo_title: 'Technical SEO for IT blogs',
    seo_description: 'Technical SEO checklist for IT blogs: canonical URLs, sitemap, robots, structured data, hreflang, and Core Web Vitals.',
    content: `
      <h2>Technical SEO is a foundation</h2>
      <p>Deep technical content matters most, but good content can underperform if metadata is weak, canonical URLs are wrong, sitemap is missing, performance is poor, or multilingual signals are unclear.</p>

      <h2>Title and description</h2>
      <p>Each article should have a unique title and description that accurately describe the problem and the value of reading the page. Avoid keyword stuffing.</p>

      <h2>Canonical URLs</h2>
      <p>Canonical tags identify the preferred URL when similar content can be reached through multiple URLs, tracking parameters, or mirrors.</p>
      <pre><code class="language-html">&lt;link rel="canonical" href="https://example.com/blog/docker-production-image" /&gt;
</code></pre>

      <h2>Sitemap, robots, and structured data</h2>
      <p>Sitemaps help discovery. Robots.txt can discourage crawling of admin routes, but it is not security. Article structured data helps machines understand title, author, publish time, modification time, and images. It must match visible content.</p>

      <h2>Core Web Vitals</h2>
      <ul>
        <li><strong>LCP:</strong> optimize large images, preload critical resources, and reduce blocking work.</li>
        <li><strong>INP:</strong> reduce unnecessary JavaScript and expensive event handlers.</li>
        <li><strong>CLS:</strong> reserve image dimensions and avoid late layout shifts.</li>
      </ul>

      <h2>Multilingual content</h2>
      <p>If pages have full English and Vietnamese versions, route-level i18n with <code>/en/...</code>, <code>/vi/...</code>, and hreflang is best for SEO. For a client-side language switch, make sure the visible UI and article content match the selected language.</p>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://developers.google.com/search/docs/crawling-indexing/canonicalization">Google Search Central: Canonicalization</a></li>
        <li><a href="https://developers.google.com/search/docs/specialty/international/localized-versions">Google Search Central: Localized versions</a></li>
        <li><a href="https://web.dev/articles/vitals">web.dev: Core Web Vitals</a></li>
      </ul>
    `,
  },
  'observability-thuc-chien-log-metric-trace-slo-production': {
    title: 'Practical observability: logs, metrics, traces, and SLOs for production',
    excerpt: 'A practical production observability guide covering structured logs, metrics, distributed traces, SLOs, alerting, and web app operations checklists.',
    seo_title: 'Practical observability for production',
    seo_description: 'Learn production observability with structured logs, metrics, traces, SLOs, alerting, and a practical web app checklist.',
    content: `
      <h2>Observability is more than monitoring</h2>
      <p>Monitoring usually starts with dashboards and alerts: CPU is high, requests are failing, or the database is slow. Observability helps engineers ask new questions about production without deploying new debug code. During an incident, you need to know which requests failed, which users were affected, which dependency is slow, and which release changed behavior.</p>
      <p>The three core signals are logs, metrics, and traces. Logs capture detailed events, metrics show trends over time, and traces connect the steps of a request across services. Missing one signal often turns incident response into guessing.</p>

      <h2>Structured logs and correlation IDs</h2>
      <p>Free-form text logs are hard to query at scale. For production APIs, prefer structured JSON logs with request IDs or correlation IDs that flow from the proxy into application logs, background jobs, and error reports.</p>
      <pre><code class="language-json">{
  "level": "error",
  "request_id": "req_7f2a",
  "route": "POST /api/orders",
  "user_id": "u_123",
  "duration_ms": 842,
  "error_code": "payment_timeout"
}
</code></pre>
      <p>Do not log passwords, tokens, secrets, card data, or unnecessary personal data. Useful logs provide debugging context without becoming a sensitive data warehouse.</p>

      <h2>Metrics should reflect user experience</h2>
      <p>Infrastructure metrics matter, but important alerts should focus on user-facing symptoms: rising error rate, p95 latency above threshold, failed checkout, queue backlog, or unexpected 5xx responses. For web APIs, start with traffic, errors, latency, and saturation.</p>
      <ul>
        <li><strong>Traffic:</strong> request rate, active users, and queue throughput.</li>
        <li><strong>Errors:</strong> 4xx by type, 5xx, exception rate, and failed jobs.</li>
        <li><strong>Latency:</strong> p50, p95, and p99 by route or dependency.</li>
        <li><strong>Saturation:</strong> CPU, memory, database connections, queue depth, and disk.</li>
      </ul>

      <h2>Tracing shows where time went</h2>
      <p>Distributed traces are valuable when a request crosses frontend, API gateway, backend, cache, database, and third-party services. Instead of knowing only that an endpoint took two seconds, a trace shows whether the time came from a database query, payment API, or rendering path.</p>
      <p>You do not need to trace every request. Use sampling, increase sampling during incidents, and make sure trace IDs also appear in logs.</p>

      <h2>SLOs make alerts disciplined</h2>
      <p>SLOs define target service behavior from the user's perspective, such as 99.9% of article reads completing under 800ms over 30 days. With an error budget, teams can decide when to prioritize reliability over feature work.</p>

      <h2>Production checklist</h2>
      <ul>
        <li>Logs include request id, route, status code, and duration.</li>
        <li>Public APIs expose request rate, error rate, and p95/p99 latency metrics.</li>
        <li>Background jobs expose queue depth, retry count, and dead-letter count.</li>
        <li>Database monitoring includes slow queries, connections, and backup status.</li>
        <li>Alerts map to SLOs or clear user impact.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://opentelemetry.io/docs/concepts/signals/">OpenTelemetry Docs: Signals</a></li>
        <li><a href="https://sre.google/sre-book/service-level-objectives/">Google SRE Book: Service Level Objectives</a></li>
        <li><a href="https://prometheus.io/docs/practices/alerting/">Prometheus Docs: Alerting</a></li>
      </ul>
    `,
  },
  'backup-disaster-recovery-rpo-rto-restore-drill-postgresql': {
    title: 'Backup and disaster recovery: RPO, RTO, and restore drills for PostgreSQL',
    excerpt: 'A practical PostgreSQL backup and disaster recovery guide covering RPO, RTO, PITR, restore drills, backup security, and operations checklists.',
    seo_title: 'PostgreSQL backup and disaster recovery',
    seo_description: 'Plan PostgreSQL backups with RPO, RTO, PITR, restore drills, backup security, and disaster recovery checklists.',
    content: `
      <h2>A backup without restore is not enough</h2>
      <p>Many teams only verify that backup jobs completed. During real incidents, they may discover missing permissions, missing WAL files, wrong encryption keys, or restore times that exceed business expectations. A professional backup strategy includes backup, verification, restore drills, and access control.</p>
      <p>For blogs, CMS, CRM, and LMS products, the database is usually the most valuable asset. Code can be rebuilt; user data, comments, orders, and learning records are much harder to recover.</p>

      <h2>RPO and RTO</h2>
      <p><strong>RPO</strong> is the maximum acceptable data loss. <strong>RTO</strong> is the maximum acceptable time to restore service. These numbers determine architecture. Daily backups may be acceptable for a personal blog but not for a transaction-heavy system.</p>
      <ul>
        <li>Content blog: RPO and RTO of several hours may be acceptable.</li>
        <li>Operational CRM: RPO of 15-60 minutes and RTO of a few hours may be needed.</li>
        <li>Payments or orders: plan for PITR, replicas, runbooks, and regular drills.</li>
      </ul>

      <h2>PostgreSQL backup options</h2>
      <p>Logical backups such as <code>pg_dump</code> are easy for small databases and migrations between versions. Physical backups with WAL archiving support point-in-time recovery for more serious production needs.</p>
      <pre><code class="language-bash">pg_dump --format=custom --file=app.dump "$DATABASE_URL"
pg_restore --clean --if-exists --dbname="$RESTORE_DATABASE_URL" app.dump
</code></pre>
      <p>Managed platforms still require operational understanding: retention, PITR limits, backup region, restore workflow, and restore testing into a separate environment.</p>

      <h2>Run restore drills</h2>
      <p>A restore drill measures real recovery time and reveals missing steps. Restore into a separate database, run smoke tests, compare against RTO, and update the runbook.</p>

      <h2>Secure backups like production</h2>
      <p>Backups often contain all sensitive data. Encrypt them, limit access, audit reads, define retention, and avoid copying production backups to personal laptops or public buckets.</p>

      <h2>Checklist</h2>
      <ul>
        <li>Define RPO and RTO for each system.</li>
        <li>Automate backups and alert on failed jobs.</li>
        <li>Use PITR where important data changes frequently.</li>
        <li>Run restore drills into isolated environments.</li>
        <li>Encrypt backups and restrict access.</li>
        <li>Document commands, owners, smoke tests, and rollback steps.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/backup.html">PostgreSQL Docs: Backup and Restore</a></li>
        <li><a href="https://www.postgresql.org/docs/current/continuous-archiving.html">PostgreSQL Docs: Continuous Archiving and PITR</a></li>
        <li><a href="https://supabase.com/docs/guides/platform/backups">Supabase Docs: Backups</a></li>
      </ul>
    `,
  },
  'redis-cache-queue-tang-toc-backend-khong-sai-du-lieu': {
    title: 'Redis cache and queues: speeding up backends without corrupting data',
    excerpt: 'A backend Redis guide covering cache-aside, TTL, invalidation, cache stampede, idempotent jobs, rate limiting, and production checks.',
    seo_title: 'Redis cache and queues for backend systems',
    seo_description: 'Use Redis safely for cache, queues, rate limits, TTL, invalidation, stampede prevention, and idempotent jobs.',
    content: `
      <h2>Redis is fast, but it is not a cure-all</h2>
      <p>Redis is commonly used for caching, rate limiting, sessions, lightweight locks, and queues. It can reduce database load and improve response time, but it can also create stale data, unsafe keys, duplicate jobs, and operational complexity.</p>

      <h2>Cache-aside</h2>
      <p>With cache-aside, the application reads Redis first. On a miss, it reads the database, stores the result with a TTL, and returns the response.</p>
      <pre><code class="language-ts">async function getPost(slug: string) {
  const key = \`post:\${slug}\`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const post = await db.posts.findBySlug(slug);
  if (!post) return null;

  await redis.set(key, JSON.stringify(post), { EX: 300 });
  return post;
}
</code></pre>
      <p>Do not cache personalized responses with keys that are too broad. Tenant and user scope must be part of the key when data is private.</p>

      <h2>TTL, invalidation, and stampede</h2>
      <p>Short TTLs reduce benefit; long TTLs increase stale data. Delete or refresh cache keys when important data changes. For hot keys, reduce cache stampede with locks, TTL jitter, request coalescing, or stale-while-revalidate behavior.</p>

      <h2>Queues need idempotency</h2>
      <p>Redis-backed queues are useful for email, image resizing, webhooks, reports, and external sync. Jobs can run more than once because of retries or worker restarts, so important jobs must be idempotent.</p>
      <ul>
        <li>Use idempotency keys for webhooks and payment-like operations.</li>
        <li>Store important job state in the database.</li>
        <li>Use retry limits and dead-letter queues.</li>
        <li>Log job id, attempt count, duration, and final error.</li>
      </ul>

      <h2>Rate limits</h2>
      <p>Redis works well for rate limits because counters are fast and can expire. Login, comments, contact forms, search, and uploads should each have appropriate limits, especially in multi-instance deployments.</p>

      <h2>Production checklist</h2>
      <ul>
        <li>Use clear namespaces and tenant/user scopes in keys.</li>
        <li>Add TTL jitter for hot keys.</li>
        <li>Invalidate cache on important writes.</li>
        <li>Do not cache sensitive data without correct scope.</li>
        <li>Make queue jobs idempotent with retry limits.</li>
        <li>Monitor memory, hit rate, evictions, latency, and clients.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://redis.io/docs/latest/develop/">Redis Docs: Develop with Redis</a></li>
        <li><a href="https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/">Redis Docs: Benchmarks and latency</a></li>
        <li><a href="https://docs.bullmq.io/">BullMQ Docs</a></li>
      </ul>
    `,
  },
  'zero-trust-web-app-iam-secret-rotation-audit-log-least-privilege': {
    title: 'Zero Trust for web apps: IAM, secret rotation, audit logs, and least privilege',
    excerpt: 'A practical Zero Trust guide for web apps covering IAM, authorization, least privilege, secret rotation, audit logs, RLS, XSS, CSRF, and BOLA.',
    seo_title: 'Zero Trust for web apps: IAM and secrets',
    seo_description: 'Apply Zero Trust to web apps with IAM, least privilege, secret rotation, audit logs, RLS, XSS, CSRF, and BOLA defenses.',
    content: `
      <h2>Zero Trust is a permission design mindset</h2>
      <p>Zero Trust does not mean buying one security product. It means designing systems under the assumption that networks, users, services, and tokens can be misused. Every request should be authenticated, authorized, scoped, and observable enough for investigation.</p>
      <p>For smaller web apps, practical Zero Trust starts with secure cookies, real admin authentication, reduced public fields, server-only service keys, rotated secrets, and database policies that enforce least privilege.</p>

      <h2>Authentication is not authorization</h2>
      <p>Authentication answers who the user is. Authorization answers what they can do to which resource. A common API flaw is checking only that a user is logged in, then allowing access to arbitrary object IDs.</p>
      <pre><code class="language-ts">if (invoice.ownerId !== session.userId && !session.roles.includes('admin')) {
  return forbidden();
}
</code></pre>
      <p>Authorization belongs on the server. Hiding buttons in the frontend improves UX, but it is not a security boundary.</p>

      <h2>Least privilege</h2>
      <p>Each credential should have the minimum required permission. Public frontend code uses an anon or publishable key with strict RLS. Server admin code uses service role credentials only on the server. CI/CD can deploy only the intended project. Runtime database users should not have schema-destroying permissions when they only need application reads and writes.</p>

      <h2>Secret rotation</h2>
      <p>Prepare to rotate API keys, admin keys, webhook secrets, and database passwords without downtime. For important keys, use a dual-key rollout: add a new key, deploy the app to use it, verify traffic, then revoke the old key.</p>
      <p>If a secret was committed to Git, deleting the commit is not enough. Revoke the secret because history may already be cloned.</p>

      <h2>Audit logs</h2>
      <p>Admin systems should record who approved comments, edited posts, deleted messages, or changed configuration. Log actor, action, resource, timestamp, and relevant request metadata for destructive or user-data-sensitive actions.</p>

      <h2>Common defenses</h2>
      <ul>
        <li><strong>XSS:</strong> sanitize HTML, escape output, use CSP, and avoid unsafe rendering of user content.</li>
        <li><strong>CSRF:</strong> use SameSite cookies, Origin/Sec-Fetch-Site checks, and tokens for high-risk forms.</li>
        <li><strong>Brute force:</strong> rate limit login, contact, comments, and search.</li>
        <li><strong>IDOR/BOLA:</strong> authorize every object access on the server.</li>
        <li><strong>Data leakage:</strong> return only required public fields.</li>
      </ul>

      <h2>Checklist</h2>
      <ul>
        <li>Every write endpoint has auth, authorization, and validation.</li>
        <li>Admin cookies use HttpOnly, Secure in production, and SameSite.</li>
        <li>Secrets have owners, storage locations, rotation dates, and revoke procedures.</li>
        <li>Public responses omit sensitive fields.</li>
        <li>Database RLS or equivalent policies are tested.</li>
        <li>Important admin actions have audit trails.</li>
      </ul>

      <h2>Primary references</h2>
      <ul>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html">OWASP CSRF Prevention Cheat Sheet</a></li>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html">OWASP XSS Prevention Cheat Sheet</a></li>
      </ul>
    `,
  },
};

export function localizePost(post: Post, locale: Locale): Post {
  const storedTranslation = getStoredTranslation(post, locale);
  if (storedTranslation) {
    return {
      ...post,
      title: storedTranslation.title || post.title,
      excerpt: storedTranslation.excerpt || post.excerpt,
      content: storedTranslation.content || post.content,
      seo_title: storedTranslation.seo_title || post.seo_title,
      seo_description: storedTranslation.seo_description || post.seo_description,
    };
  }

  if (locale !== 'en') return post;
  const translation = englishPostTranslations[post.slug];
  if (!translation) return post;

  return {
    ...post,
    ...translation,
    seo_title: translation.seo_title || post.seo_title,
    seo_description: translation.seo_description || post.seo_description,
  };
}

export function localizePosts(posts: Post[], locale: Locale) {
  return posts.map((post) => localizePost(post, locale));
}

function getStoredTranslation(post: Post, locale: Locale) {
  // Supabase relation mặc định trả field theo tên bảng `post_translations`. Field
  // `translations` được giữ như alias dự phòng nếu sau này API normalize payload.
  const translations = post.post_translations || post.translations || [];
  return translations.find((translation) => isCompleteTranslation(translation) && translation.locale === locale);
}

function isCompleteTranslation(value: StoredPostTranslation) {
  return Boolean(value.title && value.excerpt && value.content);
}
