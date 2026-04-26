import type { Post } from '@/types';

/**
 * Dữ liệu bài viết mẫu cho local development.
 *
 * Khi Supabase chưa cấu hình, API public có thể fallback sang danh sách này để
 * kiểm tra UI, SEO layout và blog pagination. Production không nên coi dữ liệu
 * này là nguồn thật; nội dung thật phải nằm trong Supabase.
 */
export const defaultAuthorId = '00000000-0000-0000-0000-000000000001';

function toIsoDate(value: string) {
  // Chuẩn hóa ngày publish để mock data giống format ISO mà Supabase trả về.
  return new Date(value).toISOString();
}

/**
 * Nội dung fallback development khi Supabase chưa kết nối được ở local.
 */
export const mockPosts: Post[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    title: 'DevOps thực chiến: từ commit code đến production ổn định',
    slug: 'devops-thuc-chien-tu-commit-den-production',
    content: `
      <h2>DevOps không chỉ là công cụ</h2>
      <p>Nhiều người bắt đầu học DevOps bằng cách cài Jenkins, GitHub Actions, Docker, Kubernetes hoặc Terraform. Cách học đó không sai, nhưng nếu chỉ nhớ tên công cụ thì rất dễ bị rối khi hệ thống gặp sự cố. DevOps trước hết là cách tổ chức vòng đời phần mềm để code đi từ máy của developer đến production một cách có kiểm soát, có khả năng lặp lại và có dữ liệu để sửa lỗi nhanh.</p>
      <p>Một pipeline DevOps tốt trả lời được các câu hỏi thực tế: ai thay đổi gì, thay đổi đó đã được kiểm tra chưa, artifact nào đang chạy ở production, nếu deploy lỗi thì rollback bằng cách nào, log nằm ở đâu, metric nào báo hệ thống đang khỏe, và secret có bị lộ trong repository hay image không.</p>

      <h2>Bản đồ vòng đời delivery</h2>
      <p>Hãy xem delivery như một chuỗi các checkpoint thay vì một nút deploy duy nhất. Mỗi checkpoint giảm một loại rủi ro khác nhau.</p>
      <ul>
        <li><strong>Commit:</strong> code nhỏ, message rõ, gắn với issue hoặc mục tiêu cụ thể.</li>
        <li><strong>Build:</strong> tạo artifact có thể chạy lại, không phụ thuộc vào trạng thái máy local.</li>
        <li><strong>Test:</strong> chạy unit test, integration test, lint, type check và các kiểm tra bảo mật cơ bản.</li>
        <li><strong>Package:</strong> đóng gói image hoặc bundle với version rõ ràng.</li>
        <li><strong>Deploy:</strong> đưa artifact đã kiểm tra vào môi trường đích.</li>
        <li><strong>Observe:</strong> theo dõi log, metric, trace, alert và hành vi người dùng sau deploy.</li>
      </ul>
      <p>Điểm quan trọng là production không nên build lại từ source theo kiểu thủ công. Production nên nhận artifact đã được tạo bởi CI, đã được gắn tag, đã đi qua test và có thể truy vết về commit gốc.</p>

      <h2>Thiết kế pipeline tối thiểu nhưng đáng tin</h2>
      <p>Với một web app nhỏ hoặc vừa, pipeline ban đầu không cần quá phức tạp. Một cấu trúc hợp lý có thể gồm bốn stage: validate, build, security scan và deploy. Validate chạy nhanh để feedback sớm; build tạo artifact; scan bắt lỗi dependency hoặc secret; deploy chỉ chạy khi nhánh và điều kiện phù hợp.</p>
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
      <p>Pipeline tốt không phải pipeline có nhiều bước nhất. Pipeline tốt là pipeline bắt được lỗi quan trọng trước khi deploy, chạy đủ nhanh để team còn muốn dùng, và không yêu cầu ai phải nhớ thao tác thủ công.</p>

      <h2>Environment phải giống nhau ở những điểm quan trọng</h2>
      <p>Một câu nói quen thuộc là "máy em chạy được". DevOps cố gắng giảm khoảng cách giữa local, staging và production. Không nhất thiết mọi môi trường phải giống 100 phần trăm, nhưng những thứ ảnh hưởng đến hành vi ứng dụng cần được chuẩn hóa: version runtime, biến môi trường, database migration, command start app, network port, quyền truy cập và cấu hình cache.</p>
      <p>Docker giúp chuẩn hóa runtime, nhưng Docker không tự giải quyết toàn bộ vấn đề môi trường. Bạn vẫn cần quản lý secret, migration, storage, backup và cách roll back dữ liệu. Một deployment chuyên nghiệp luôn phân biệt rõ configuration và code. Code nằm trong repository; configuration thay đổi theo môi trường; secret không nằm trong Git.</p>

      <h2>Chiến lược deploy nên phù hợp quy mô</h2>
      <p>Không phải dự án nào cũng cần blue-green deployment hoặc canary release ngay từ đầu. Với một blog, CMS, CRM nội bộ hoặc API vừa phải, rolling deploy kèm health check và rollback artifact thường đã đủ tốt. Với hệ thống có traffic lớn hoặc yêu cầu uptime cao, canary giúp đưa phiên bản mới cho một phần nhỏ request trước khi mở rộng.</p>
      <ul>
        <li><strong>Recreate:</strong> đơn giản, phù hợp app nhỏ nhưng có downtime ngắn.</li>
        <li><strong>Rolling:</strong> thay instance từng phần, giảm downtime, cần health check tốt.</li>
        <li><strong>Blue-green:</strong> chạy song song hai môi trường, switch traffic khi bản mới ổn.</li>
        <li><strong>Canary:</strong> phát hành theo tỷ lệ nhỏ, quan sát metric rồi tăng dần.</li>
      </ul>
      <p>Dù chọn kiểu nào, hãy viết sẵn kế hoạch rollback. Nếu rollback cần 30 phút suy nghĩ khi production đang lỗi, kế hoạch đó chưa đủ tốt.</p>

      <h2>Log, metric và alert là một phần của feature</h2>
      <p>Deploy xong không có nghĩa là hoàn tất. Một thay đổi chỉ thực sự an toàn khi bạn biết nó đang hoạt động như thế nào. Log trả lời "chuyện gì đã xảy ra"; metric trả lời "hệ thống đang khỏe hay yếu"; trace trả lời "request mất thời gian ở đoạn nào"; alert kéo người phụ trách vào đúng lúc cần can thiệp.</p>
      <p>Với backend/API, các metric tối thiểu nên có gồm request rate, error rate, latency p95/p99, CPU, memory, database connection, queue depth và số lần restart. Với frontend, hãy theo dõi Web Vitals, lỗi runtime, tỷ lệ request API thất bại và thời gian tải trang chính.</p>

      <h2>Checklist DevOps cho một dự án web</h2>
      <ul>
        <li>Repository có README mô tả cách chạy local, test và deploy.</li>
        <li>CI chạy lint, type check và test trước khi merge.</li>
        <li>Artifact được gắn tag theo commit SHA hoặc version.</li>
        <li>Secret được lưu trong secret manager hoặc biến môi trường của nền tảng deploy.</li>
        <li>Database migration chạy có kiểm soát và có backup trước thay đổi rủi ro.</li>
        <li>Health check kiểm tra đúng dependency quan trọng, không chỉ trả về 200 giả.</li>
        <li>Log có request id hoặc correlation id để lần theo lỗi.</li>
        <li>Alert tập trung vào triệu chứng người dùng bị ảnh hưởng, không chỉ tài nguyên tăng nhẹ.</li>
      </ul>

      <h2>Lộ trình học DevOps thực tế</h2>
      <p>Nếu bạn là developer muốn nâng cấp tư duy DevOps, hãy học theo thứ tự: Linux cơ bản, Git workflow, Docker, CI/CD, networking nền tảng, reverse proxy, database migration, monitoring, cloud IAM và infrastructure as code. Kubernetes nên học sau khi bạn đã hiểu container, networking, health check và deployment strategy. Nếu nhảy thẳng vào Kubernetes khi chưa hiểu các khái niệm nền, bạn sẽ chỉ nhớ YAML mà không hiểu hệ thống.</p>
      <p>DevOps tốt giúp team ship nhanh hơn nhưng không đánh đổi sự ổn định. Mục tiêu cuối cùng không phải là có pipeline đẹp, mà là mỗi thay đổi đều có đường đi rõ ràng, dễ kiểm chứng, dễ rollback và dễ quan sát sau khi lên production.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
      </ul>
    `,
    excerpt: 'Một hướng dẫn DevOps thực chiến cho developer: pipeline, artifact, environment, deployment strategy, observability và checklist production.',
    featured_image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=700&fit=crop',
    seo_title: 'DevOps thực chiến từ commit đến production',
    seo_description: 'Hướng dẫn DevOps thực tế về CI/CD, artifact, deploy, rollback, log, metric và checklist production cho developer.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'DevOps',
    tags: ['devops', 'cicd', 'deployment', 'observability'],
    published_at: toIsoDate('2026-04-24T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-24T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-24T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    title: 'Docker cho developer: hiểu image, container, network và volume',
    slug: 'docker-cho-developer-image-container-network-volume',
    content: `
      <h2>Docker giải quyết vấn đề gì?</h2>
      <p>Docker giúp đóng gói ứng dụng cùng runtime, thư viện hệ thống và command chạy app vào một image có thể tái sử dụng. Thay vì mỗi máy cài Node, PHP, Python, Nginx hoặc PostgreSQL theo cách riêng, team có thể thống nhất môi trường bằng Dockerfile và Docker Compose. Điều này đặc biệt hữu ích khi dự án có nhiều service hoặc cần onboarding nhanh.</p>
      <p>Tuy nhiên Docker không phải máy ảo nhỏ. Container dùng chung kernel với host, khởi động nhanh hơn VM và được tạo từ image. Hiểu đúng ba khái niệm image, container và volume sẽ giúp bạn debug tốt hơn rất nhiều.</p>

      <h2>Image là bản thiết kế, container là tiến trình đang chạy</h2>
      <p>Image là artifact bất biến gồm nhiều layer. Mỗi instruction trong Dockerfile thường tạo một layer mới. Container là instance chạy từ image. Bạn có thể xóa container mà image vẫn còn; bạn có thể chạy nhiều container từ cùng một image; và dữ liệu ghi bên trong filesystem của container sẽ mất khi container bị xóa nếu không dùng volume.</p>
      <p>Một Dockerfile tốt nên tối ưu cache layer, tránh copy thừa, không chạy app bằng root nếu không cần và tách build dependency khỏi runtime khi có thể.</p>
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
      <p>Ví dụ trên còn có thể tối ưu thêm bằng multi-stage build tách riêng build output, nhưng nó đã thể hiện một nguyên tắc quan trọng: copy file dependency trước để tận dụng cache, sau đó mới copy toàn bộ source.</p>

      <h2>.dockerignore quan trọng như .gitignore</h2>
      <p>Nếu bạn copy cả repository vào image mà không có <code>.dockerignore</code>, build context có thể chứa <code>node_modules</code>, file log, cache, file local hoặc secret. Điều này làm image nặng, build chậm và tăng rủi ro rò rỉ thông tin.</p>
      <pre><code class="language-text">node_modules
.next
.git
.env
.env.local
npm-debug.log
coverage
dist
</code></pre>
      <p>Hãy coi Docker image như thứ có thể được chia sẻ cho môi trường khác. Bất cứ file nào không cần cho build hoặc runtime thì không nên đi vào image.</p>

      <h2>Docker Compose giúp mô tả môi trường local</h2>
      <p>Với một ứng dụng web có database và cache, Compose giúp developer chạy cả stack bằng một command. Quan trọng nhất là nó ghi lại dependency giữa các service, port expose, volume dữ liệu và biến môi trường cơ bản.</p>
      <pre><code class="language-yaml">services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - db-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  db-data:
</code></pre>
      <p>Trong network mặc định của Compose, service có thể gọi nhau bằng tên service. App không cần biết IP của database; nó chỉ cần gọi host <code>db</code>. Đây là lý do connection string trong container khác connection string chạy trực tiếp trên host.</p>

      <h2>Network: port mapping không phải service discovery</h2>
      <p>Dòng <code>3000:3000</code> nghĩa là port 3000 trong container được map ra port 3000 trên host. Mapping này phục vụ truy cập từ bên ngoài Docker network. Còn giữa các container, chúng giao tiếp qua Docker network nội bộ bằng tên service và port trong container.</p>
      <ul>
        <li>Host truy cập app qua <code>localhost:3000</code>.</li>
        <li>Container app truy cập database qua <code>db:5432</code>.</li>
        <li>Container database không cần publish port ra host nếu chỉ app dùng nó.</li>
      </ul>
      <p>Hiểu điểm này giúp bạn tránh lỗi phổ biến: để app trong container gọi <code>localhost:5432</code> và kỳ vọng đó là PostgreSQL container. Với container, <code>localhost</code> là chính container đó.</p>

      <h2>Volume: dữ liệu bền vững nằm ngoài vòng đời container</h2>
      <p>Container có thể bị xóa và tạo lại bất cứ lúc nào. Database, file upload hoặc cache muốn tồn tại sau khi recreate container thì cần volume. Named volume do Docker quản lý, phù hợp cho database local. Bind mount gắn thư mục host vào container, phù hợp cho development khi muốn sửa code và thấy thay đổi ngay.</p>
      <p>Không nên dùng container filesystem để lưu dữ liệu quan trọng. Trong production, hãy dùng managed database, object storage hoặc volume có backup rõ ràng.</p>

      <h2>Debug Docker bằng các command cơ bản</h2>
      <pre><code class="language-bash">docker ps
docker logs app
docker exec -it app sh
docker inspect app
docker compose config
docker compose logs -f app
docker system df
</code></pre>
      <p><code>docker compose config</code> đặc biệt hữu ích vì nó cho bạn xem cấu hình Compose sau khi Docker đã merge và resolve. Khi biến môi trường hoặc file override gây lỗi, command này giúp nhìn ra cấu hình thực tế.</p>

      <h2>Checklist Dockerfile production</h2>
      <ul>
        <li>Dùng base image rõ version, tránh tag quá mơ hồ nếu cần ổn định.</li>
        <li>Không copy secret vào image.</li>
        <li>Dùng <code>.dockerignore</code> để giảm build context.</li>
        <li>Chạy build ở CI và gắn tag image theo commit SHA.</li>
        <li>Không để process chính chạy nền bằng script khó kiểm soát.</li>
        <li>Expose đúng port và có health check ở nền tảng deploy.</li>
        <li>Giảm quyền runtime, không dùng root khi image cho phép.</li>
        <li>Scan image định kỳ để phát hiện lỗ hổng dependency.</li>
      </ul>

      <h2>Khi nào không cần Docker?</h2>
      <p>Nếu dự án rất nhỏ, chỉ có một runtime, team một người và nền tảng deploy đã lo phần build/runtime ổn định, Docker có thể chưa cần thiết. Nhưng khi dự án có nhiều service, nhiều developer, nhiều môi trường hoặc cần deploy nhất quán, Docker là một trong những công cụ đáng học nhất. Điều quan trọng là dùng Docker để giảm phức tạp vận hành, không biến nó thành thêm một lớp bí ẩn.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://docs.docker.com/compose/how-tos/networking/">Docker Docs: Compose networking</a></li>
        <li><a href="https://docs.docker.com/engine/storage/volumes/">Docker Docs: Volumes</a></li>
      </ul>
    `,
    excerpt: 'Giải thích Docker từ góc nhìn developer: image, container, layer cache, Dockerfile, Compose, network, volume và checklist production.',
    featured_image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&h=700&fit=crop',
    seo_title: 'Docker cho developer: image, container, network',
    seo_description: 'Hướng dẫn Docker thực tế cho developer: Dockerfile, Compose, network, volume, debug và checklist production.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Docker',
    tags: ['docker', 'container', 'compose', 'devops'],
    published_at: toIsoDate('2026-04-23T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-23T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-23T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    title: 'Networking nền tảng cho backend: DNS, TCP, TLS, HTTP và proxy',
    slug: 'networking-nen-tang-cho-backend-dns-tcp-tls-http-proxy',
    content: `
      <h2>Vì sao developer backend cần hiểu network?</h2>
      <p>Rất nhiều lỗi production nhìn bề ngoài giống lỗi code nhưng gốc lại nằm ở network: DNS cache sai, timeout quá ngắn, reverse proxy giới hạn body size, TLS certificate hết hạn, database connection bị firewall chặn, hoặc load balancer health check cấu hình sai. Nếu hiểu network ở mức thực dụng, bạn debug nhanh hơn và thiết kế API ổn định hơn.</p>
      <p>Không cần trở thành network engineer để làm backend tốt, nhưng bạn cần biết request đi qua những lớp nào trước khi tới code của mình.</p>

      <h2>Hành trình của một request</h2>
      <p>Khi người dùng mở một URL, trình duyệt thường đi qua các bước sau: phân giải DNS để tìm IP, mở kết nối TCP, thương lượng TLS nếu dùng HTTPS, gửi HTTP request, đi qua CDN hoặc reverse proxy, tới load balancer, vào app server, app gọi database/cache/service khác, rồi response quay ngược lại.</p>
      <ul>
        <li><strong>DNS:</strong> chuyển domain thành IP.</li>
        <li><strong>TCP:</strong> tạo kết nối tin cậy giữa client và server.</li>
        <li><strong>TLS:</strong> mã hóa và xác thực server cho HTTPS.</li>
        <li><strong>HTTP:</strong> giao thức ứng dụng chứa method, header, body và status code.</li>
        <li><strong>Proxy/load balancer:</strong> định tuyến, terminate TLS, cân bằng tải và áp policy.</li>
      </ul>
      <p>Khi một request chậm, hãy xác định nó chậm ở đâu: DNS lookup, TCP connect, TLS handshake, time to first byte, download response hay xử lý phía app.</p>

      <h2>DNS: đơn giản nhưng dễ bị bỏ qua</h2>
      <p>DNS record phổ biến gồm A record trỏ domain tới IPv4, AAAA trỏ tới IPv6, CNAME trỏ alias sang domain khác, MX cho email và TXT cho xác minh hoặc chính sách. Tham số TTL cho biết resolver được cache record bao lâu. TTL quá cao làm thay đổi DNS chậm có hiệu lực; TTL quá thấp tăng số lần query.</p>
      <pre><code class="language-bash">dig example.com
dig api.example.com CNAME
nslookup example.com
</code></pre>
      <p>Khi đổi hạ tầng, hãy giảm TTL trước thời điểm cutover. Sau khi chuyển xong và ổn định, tăng TTL lại để giảm chi phí lookup.</p>

      <h2>TCP và timeout</h2>
      <p>TCP bảo đảm dữ liệu đến đúng thứ tự, nhưng đổi lại có chi phí kết nối và có thể bị ảnh hưởng bởi latency, packet loss hoặc congestion. Backend cần cấu hình timeout hợp lý cho HTTP client, database client và queue worker. Không có timeout là một lỗi thiết kế. Timeout quá ngắn lại gây lỗi giả khi hệ thống chịu tải.</p>
      <p>Một nguyên tắc thực tế: mỗi dependency bên ngoài app phải có timeout, retry có giới hạn, circuit breaker nếu phù hợp và log đủ thông tin để biết dependency nào đang chậm.</p>

      <h2>TLS: HTTPS không chỉ là ổ khóa</h2>
      <p>TLS giúp mã hóa dữ liệu trên đường truyền và xác thực server qua certificate. Trong production, TLS thường được terminate ở CDN, load balancer hoặc reverse proxy như Nginx. App phía sau có thể nhận HTTP nội bộ hoặc HTTPS nội bộ tùy mô hình bảo mật.</p>
      <p>Các lỗi TLS hay gặp gồm certificate hết hạn, thiếu intermediate certificate, domain không khớp certificate, redirect HTTP sang HTTPS sai, hoặc backend tự generate absolute URL bằng scheme sai vì không tin header proxy.</p>

      <h2>HTTP: status code là hợp đồng vận hành</h2>
      <p>Status code không chỉ để frontend hiển thị lỗi. Nó còn ảnh hưởng cache, retry, monitoring và SEO. Hãy dùng status code nhất quán.</p>
      <ul>
        <li><strong>200:</strong> request thành công.</li>
        <li><strong>201:</strong> tạo resource thành công.</li>
        <li><strong>400:</strong> request sai định dạng hoặc thiếu dữ liệu.</li>
        <li><strong>401:</strong> chưa xác thực.</li>
        <li><strong>403:</strong> đã xác thực nhưng không đủ quyền.</li>
        <li><strong>404:</strong> resource không tồn tại hoặc bị ẩn.</li>
        <li><strong>409:</strong> xung đột trạng thái, ví dụ slug đã tồn tại.</li>
        <li><strong>429:</strong> vượt rate limit.</li>
        <li><strong>500:</strong> lỗi không mong đợi phía server.</li>
        <li><strong>503:</strong> service tạm thời không sẵn sàng.</li>
      </ul>
      <p>API tốt không trả 200 cho mọi trường hợp rồi nhét lỗi vào body. Cách đó làm monitoring và client retry khó chính xác.</p>

      <h2>Reverse proxy và những lỗi kinh điển</h2>
      <p>Nginx, Caddy, Traefik hoặc load balancer thường đứng trước app. Proxy có thể nén response, cache, terminate TLS, giới hạn body size, thêm header bảo mật và chuyển tiếp request tới upstream.</p>
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
      <p>Nếu app cần biết IP thật của client hoặc scheme HTTPS, proxy phải chuyển đúng header và app phải được cấu hình tin proxy. Nếu không, bạn sẽ gặp lỗi redirect loop, log toàn IP proxy hoặc tạo link callback sai scheme.</p>

      <h2>Công cụ debug network nên biết</h2>
      <pre><code class="language-bash">curl -I https://example.com
curl -v https://api.example.com/health
ping example.com
traceroute example.com
dig example.com
nc -vz db.example.com 5432
openssl s_client -connect example.com:443 -servername example.com
</code></pre>
      <p><code>curl -v</code> cho bạn thấy DNS, TCP, TLS và header HTTP ở mức đủ chi tiết cho phần lớn lỗi backend. <code>nc -vz</code> giúp kiểm tra port có mở từ môi trường hiện tại hay không. <code>openssl s_client</code> hữu ích khi nghi ngờ certificate chain.</p>

      <h2>Checklist network cho API production</h2>
      <ul>
        <li>Domain có DNS record đúng và TTL phù hợp.</li>
        <li>HTTPS hoạt động, certificate còn hạn và redirect HTTP sang HTTPS đúng.</li>
        <li>Health check đi qua đúng path nhẹ, không phụ thuộc chức năng nặng.</li>
        <li>Proxy chuyển tiếp Host, X-Forwarded-Proto và X-Forwarded-For nếu app cần.</li>
        <li>Body size limit phù hợp với upload thực tế.</li>
        <li>Timeout giữa proxy và upstream không quá thấp cũng không vô hạn.</li>
        <li>API trả status code nhất quán để monitoring bắt lỗi đúng.</li>
        <li>Log có latency, status code, method, path và request id.</li>
      </ul>
      <p>Hiểu network giúp bạn bớt đoán mò. Khi production báo lỗi, bạn có thể đi từng lớp, loại trừ từng khả năng và thu hẹp vấn đề trước khi sửa code.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP response status codes</a></li>
        <li><a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html">NGINX Docs: HTTP proxy module</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching">MDN: HTTP caching</a></li>
      </ul>
    `,
    excerpt: 'Tổng quan network thực dụng cho backend: request lifecycle, DNS, TCP timeout, TLS, HTTP status code, reverse proxy và công cụ debug.',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=700&fit=crop',
    seo_title: 'Networking nền tảng cho backend developer',
    seo_description: 'Học DNS, TCP, TLS, HTTP, reverse proxy và debug network để vận hành API production ổn định hơn.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Networking',
    tags: ['networking', 'backend', 'http', 'tls', 'proxy'],
    published_at: toIsoDate('2026-04-22T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-22T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-22T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    title: 'Kiến trúc web app: từ monolith rõ ràng đến hệ thống dễ mở rộng',
    slug: 'kien-truc-web-app-monolith-ro-rang-den-he-thong-de-mo-rong',
    content: `
      <h2>Kiến trúc tốt bắt đầu từ ranh giới rõ</h2>
      <p>Khi nghe đến kiến trúc hệ thống, nhiều người nghĩ ngay tới microservices, event-driven, Kubernetes hoặc message broker. Nhưng với phần lớn sản phẩm web, kiến trúc tốt trước hết là codebase có ranh giới rõ, dữ liệu có chủ sở hữu, workflow dễ hiểu và thay đổi ít gây hiệu ứng dây chuyền. Một monolith được tổ chức tốt thường hiệu quả hơn nhiều microservice được tách sớm nhưng không có lý do vận hành rõ ràng.</p>
      <p>Kiến trúc không phải mục tiêu để khoe độ phức tạp. Nó là cách quản lý thay đổi. Khi sản phẩm thêm tính năng, thêm người dùng, thêm developer và thêm dữ liệu, kiến trúc phải giúp team vẫn hiểu được hệ thống và sửa lỗi an toàn.</p>

      <h2>Monolith không xấu, monolith rối mới xấu</h2>
      <p>Monolith có ưu điểm lớn: deploy đơn giản, transaction dễ quản lý, debug thuận tiện và chi phí vận hành thấp. Vấn đề xuất hiện khi mọi module gọi trực tiếp vào mọi bảng, business rule nằm rải rác trong controller, job, command và UI, hoặc một thay đổi nhỏ chạm vào quá nhiều nơi.</p>
      <p>Thay vì tách microservice sớm, hãy xây modular monolith. Nghĩa là vẫn deploy một ứng dụng, nhưng code chia theo domain và có boundary rõ.</p>
      <ul>
        <li><strong>Identity:</strong> user, role, permission, session.</li>
        <li><strong>Content:</strong> post, category, tag, publish state, SEO metadata.</li>
        <li><strong>Commerce:</strong> order, payment, invoice, refund nếu có.</li>
        <li><strong>Notification:</strong> email, webhook, in-app message.</li>
        <li><strong>Reporting:</strong> dashboard, export, analytics query.</li>
      </ul>
      <p>Mỗi module nên có model, service, validation và policy riêng. Controller chỉ nên điều phối request/response, không phải nơi chứa toàn bộ business logic.</p>

      <h2>Layering thực dụng</h2>
      <p>Một cấu trúc layer dễ dùng cho web app gồm route/controller, application service, domain logic, data access và infrastructure adapter. Không cần đặt tên quá học thuật, nhưng cần biết logic nào nằm ở đâu.</p>
      <ul>
        <li><strong>Route/controller:</strong> parse request, gọi service, trả response.</li>
        <li><strong>Application service:</strong> điều phối use case, transaction, permission, event.</li>
        <li><strong>Domain logic:</strong> rule cốt lõi như publish bài, tính trạng thái, kiểm tra chuyển state.</li>
        <li><strong>Repository/data access:</strong> truy vấn database, mapping dữ liệu.</li>
        <li><strong>Adapter:</strong> gửi email, gọi payment gateway, upload storage, gọi API ngoài.</li>
      </ul>
      <p>Khi logic gửi email nằm trong adapter, bạn có thể test use case mà không gửi email thật. Khi business rule không nằm trong controller, bạn có thể dùng lại nó cho admin UI, API hoặc background job.</p>

      <h2>Database là trung tâm của nhiều quyết định</h2>
      <p>Trong web app, database thường là tài sản quan trọng nhất. Kiến trúc tốt cần thiết kế schema, index, constraint và migration cẩn thận. Đừng chỉ dựa vào validation ở app. Database nên bảo vệ các bất biến quan trọng như unique slug, foreign key, enum/status hợp lệ, timestamp và constraint số không âm.</p>
      <p>Index nên đi theo query thực tế. Nếu trang blog lọc theo <code>published_at</code>, <code>category</code> và <code>slug</code>, hãy index các cột đó. Nếu tìm kiếm full text tăng lên, cân nhắc full-text index hoặc search engine thay vì dùng <code>LIKE</code> tùy tiện trên bảng lớn.</p>

      <h2>Cache là dao sắc</h2>
      <p>Cache giúp giảm latency và tải database, nhưng cache cũng thêm nguy cơ dữ liệu cũ. Trước khi cache, hãy trả lời ba câu hỏi: dữ liệu này có thể cũ bao lâu, cache key là gì, và khi nào invalidate. Nếu không trả lời được, hãy cache ở lớp ít rủi ro hơn như HTTP cache cho public content.</p>
      <ul>
        <li><strong>Browser/CDN cache:</strong> tốt cho ảnh, asset, bài viết public ít thay đổi.</li>
        <li><strong>Application cache:</strong> tốt cho query đắt nhưng cần invalidate rõ.</li>
        <li><strong>Database cache:</strong> tận dụng query plan, index và connection pooling trước khi thêm Redis.</li>
      </ul>
      <p>Đừng dùng cache để che schema hoặc query quá tệ. Hãy đo bottleneck trước.</p>

      <h2>Queue xử lý công việc chậm và dễ retry</h2>
      <p>Những việc như gửi email, resize ảnh, gọi webhook, generate report hoặc sync dữ liệu bên ngoài không nên chặn request chính nếu chúng không cần kết quả ngay. Queue giúp request trả nhanh hơn và worker xử lý sau. Nhưng queue cũng đòi hỏi idempotency: job chạy lại không được tạo dữ liệu trùng hoặc gây side effect nguy hiểm.</p>
      <p>Ví dụ, job gửi email nên lưu trạng thái đã gửi hoặc dùng idempotency key. Nếu worker chết giữa chừng, hệ thống retry mà không gửi 5 email giống nhau cho người dùng.</p>

      <h2>Khi nào nên tách service?</h2>
      <p>Microservice phù hợp khi boundary domain đã rõ, team đủ năng lực vận hành, service có nhu cầu scale khác nhau, hoặc một phần hệ thống cần độc lập deploy. Tách service chỉ vì codebase lớn thường không giải quyết gốc rễ. Bạn có thể biến một codebase rối thành nhiều service rối, cộng thêm network failure, distributed tracing, versioning API và chi phí deploy.</p>
      <p>Dấu hiệu tách service hợp lý gồm: module có database ownership rõ, giao tiếp có contract ổn định, failure của module này không nên kéo sập module khác, và team có khả năng monitor riêng từng service.</p>

      <h2>Checklist kiến trúc cho web app vừa và nhỏ</h2>
      <ul>
        <li>Module/domain được đặt tên theo nghiệp vụ, không chỉ theo technical layer.</li>
        <li>Controller mỏng, business rule nằm trong service/domain.</li>
        <li>Database có constraint bảo vệ dữ liệu quan trọng.</li>
        <li>Index phản ánh query thật của sản phẩm.</li>
        <li>Background job dùng cho tác vụ chậm hoặc dễ retry.</li>
        <li>Cache có TTL, key và chiến lược invalidate rõ ràng.</li>
        <li>Log và metric được thiết kế theo use case quan trọng.</li>
        <li>API contract được version hoặc quản lý tương thích khi có client bên ngoài.</li>
      </ul>
      <p>Kiến trúc tốt là kiến trúc giúp bạn thay đổi có kiểm soát. Hãy bắt đầu bằng modular monolith rõ ràng, đo vấn đề thực tế, rồi chỉ tách phức tạp khi lợi ích vận hành lớn hơn chi phí.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/indexes.html">PostgreSQL Docs: Indexes</a></li>
        <li><a href="https://www.postgresql.org/docs/current/ddl-constraints.html">PostgreSQL Docs: Constraints</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching">MDN: HTTP caching</a></li>
      </ul>
    `,
    excerpt: 'Cách tư duy kiến trúc web app thực tế: modular monolith, layering, database constraint, cache, queue và thời điểm tách service.',
    featured_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=700&fit=crop',
    seo_title: 'Kiến trúc web app dễ mở rộng',
    seo_description: 'Hướng dẫn kiến trúc web app: modular monolith, layering, database, cache, queue và khi nào nên tách service.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Architecture',
    tags: ['architecture', 'backend', 'database', 'scalability'],
    published_at: toIsoDate('2026-04-21T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-21T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-21T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    title: 'Git workflow chuyên nghiệp: commit sạch, branch rõ, review dễ',
    slug: 'git-workflow-chuyen-nghiep-commit-branch-review',
    content: `
      <h2>Git là công cụ giao tiếp của team</h2>
      <p>Git không chỉ để lưu lịch sử code. Một lịch sử Git sạch giúp reviewer hiểu thay đổi, giúp người sau debug bằng <code>git blame</code>, giúp release manager biết commit nào đang ở production và giúp bạn rollback chính xác khi có lỗi. Ngược lại, commit lộn xộn làm mọi thao tác sau đó tốn thời gian hơn.</p>
      <p>Mục tiêu của Git workflow không phải là tuân thủ nghi thức phức tạp, mà là tạo ra lịch sử thay đổi dễ đọc, dễ review và ít xung đột.</p>

      <h2>Commit nên kể một câu chuyện nhỏ</h2>
      <p>Một commit tốt có phạm vi hẹp và trạng thái build được. Nếu commit vừa sửa UI, vừa đổi schema, vừa format toàn repo và vừa đổi logic auth, reviewer khó hiểu và rollback cũng rủi ro. Hãy tách commit theo ý nghĩa thay đổi.</p>
      <ul>
        <li>Commit 1: thêm migration hoặc schema.</li>
        <li>Commit 2: thêm service/repository xử lý logic mới.</li>
        <li>Commit 3: nối API hoặc UI vào logic.</li>
        <li>Commit 4: thêm test và chỉnh tài liệu nếu cần.</li>
      </ul>
      <p>Message nên nói vì sao hoặc thay đổi gì ở mức có ích. <code>fix bug</code> không giúp gì nhiều. <code>fix post visibility for future published_at</code> cho người đọc biết rõ vấn đề hơn.</p>

      <h2>Branch strategy đừng phức tạp quá sớm</h2>
      <p>Với nhiều team hiện đại, trunk-based development hoặc GitHub flow là đủ: branch ngắn sống, mở pull request, review, CI pass rồi merge vào main. Git Flow với nhiều nhánh develop, release, hotfix có thể phù hợp sản phẩm release theo phiên bản dài, nhưng với web app deploy liên tục, nó thường tạo thêm ceremony.</p>
      <ul>
        <li><strong>main:</strong> luôn có thể deploy hoặc gần deploy được.</li>
        <li><strong>feature branch:</strong> sống ngắn, tập trung một mục tiêu.</li>
        <li><strong>pull request:</strong> nơi review design, code, test và rủi ro deploy.</li>
        <li><strong>tag/release:</strong> đánh dấu artifact đã phát hành.</li>
      </ul>
      <p>Branch sống càng lâu, xác suất conflict và lệch kiến trúc càng cao. Hãy merge thường xuyên hoặc chia feature lớn thành các phần nhỏ có thể review độc lập.</p>

      <h2>Rebase, merge và squash dùng khi nào?</h2>
      <p><code>merge</code> giữ lại lịch sử nhánh và tạo merge commit. <code>rebase</code> đặt commit của bạn lên đầu base mới để lịch sử tuyến tính hơn. <code>squash</code> gom nhiều commit thành một commit khi merge. Không có lựa chọn nào luôn đúng; team cần thống nhất.</p>
      <ul>
        <li>Dùng rebase trên branch cá nhân để cập nhật với main trước khi mở PR hoặc trước khi merge.</li>
        <li>Không rebase branch chung có nhiều người đang dựa vào nếu chưa thống nhất.</li>
        <li>Dùng squash khi lịch sử commit trong PR chỉ là các bước thử nghiệm không cần giữ.</li>
        <li>Dùng merge commit khi muốn giữ ngữ cảnh một feature branch lớn.</li>
      </ul>
      <pre><code class="language-bash">git fetch origin
git switch feature/post-editor
git rebase origin/main
git push --force-with-lease
</code></pre>
      <p><code>--force-with-lease</code> an toàn hơn <code>--force</code> vì nó từ chối ghi đè nếu remote đã có thay đổi mới mà local của bạn chưa biết.</p>

      <h2>Giải quyết conflict có phương pháp</h2>
      <p>Conflict không phải lỗi nghiêm trọng. Nó chỉ nói rằng Git không thể tự quyết định cách kết hợp hai thay đổi. Đừng vội chọn toàn bộ "ours" hoặc "theirs" nếu chưa hiểu logic. Hãy đọc cả hai phía, xem commit liên quan và chạy test sau khi resolve.</p>
      <pre><code class="language-bash">git status
git diff
git log --oneline --decorate --graph --all -20
git add src/app/api/posts/route.ts
git rebase --continue
</code></pre>
      <p>Nếu conflict quá khó, hãy giảm phạm vi: resolve từng file, chạy test nhỏ, commit hoặc continue, rồi sang file tiếp theo. Với conflict ở lockfile, thường nên regenerate bằng package manager sau khi package manifest đã đúng.</p>

      <h2>Pull request tốt giúp reviewer tiết kiệm thời gian</h2>
      <p>Một PR nên có mô tả ngắn về mục tiêu, ảnh hưởng chính, cách test và rủi ro. Đừng bắt reviewer tự suy luận từ diff. Nếu thay đổi có migration, breaking change hoặc ảnh hưởng security, hãy nói rõ.</p>
      <ul>
        <li><strong>What:</strong> thay đổi gì.</li>
        <li><strong>Why:</strong> vì sao cần thay đổi.</li>
        <li><strong>Test:</strong> đã chạy command nào, case nào chưa test được.</li>
        <li><strong>Risk:</strong> phần nào cần reviewer chú ý hơn.</li>
      </ul>
      <p>Reviewer không chỉ tìm lỗi cú pháp. Reviewer kiểm tra behavior, edge case, bảo mật, performance, khả năng maintain và sự phù hợp với kiến trúc hiện tại.</p>

      <h2>Những command Git nên dùng thành thạo</h2>
      <pre><code class="language-bash">git status
git diff
git diff --staged
git log --oneline --graph --decorate
git switch -c feature/name
git restore src/file.ts
git restore --staged src/file.ts
git cherry-pick commit_sha
git revert commit_sha
git bisect start
</code></pre>
      <p><code>git revert</code> thường an toàn hơn xóa lịch sử trên nhánh shared vì nó tạo commit đảo ngược thay đổi. <code>git bisect</code> cực kỳ hữu ích khi cần tìm commit gây lỗi trong một khoảng lịch sử dài.</p>

      <h2>Quy tắc an toàn khi làm việc với Git</h2>
      <ul>
        <li>Luôn kiểm tra <code>git status</code> trước khi pull, rebase, reset hoặc switch branch.</li>
        <li>Không dùng <code>reset --hard</code> nếu chưa chắc dữ liệu local không cần giữ.</li>
        <li>Không force push lên branch người khác đang dùng nếu chưa trao đổi.</li>
        <li>Commit file lock khi dependency thay đổi.</li>
        <li>Không commit secret, token, file env hoặc dữ liệu khách hàng.</li>
        <li>Giữ PR nhỏ hơn mức reviewer có thể đọc kỹ trong một phiên.</li>
      </ul>
      <p>Git workflow chuyên nghiệp không làm bạn chậm lại. Nó giảm thời gian review, giảm lỗi merge và giúp mỗi thay đổi có dấu vết rõ ràng. Đó là nền tảng của một team engineering trưởng thành.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://git-scm.com/docs/git-rebase">Git Docs: git rebase</a></li>
        <li><a href="https://git-scm.com/docs/git-push">Git Docs: git push</a></li>
        <li><a href="https://git-scm.com/docs/git-bisect">Git Docs: git bisect</a></li>
      </ul>
    `,
    excerpt: 'Hướng dẫn Git workflow cho team: commit sạch, branch strategy, rebase, squash, conflict, pull request và các quy tắc an toàn.',
    featured_image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&h=700&fit=crop',
    seo_title: 'Git workflow chuyên nghiệp cho developer',
    seo_description: 'Cách viết commit sạch, quản lý branch, rebase, squash, xử lý conflict và review pull request hiệu quả.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Git',
    tags: ['git', 'workflow', 'review', 'version-control'],
    published_at: toIsoDate('2026-04-20T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-20T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-20T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    title: 'Bảo mật web/API thực dụng: auth, session, rate limit và dữ liệu đầu vào',
    slug: 'bao-mat-web-api-thuc-dung-auth-session-rate-limit-input',
    content: `
      <h2>Bảo mật bắt đầu từ các lỗi rất đời thường</h2>
      <p>Nhiều sự cố bảo mật không đến từ kỹ thuật tấn công quá phức tạp. Chúng đến từ token bị commit lên Git, endpoint admin thiếu kiểm tra quyền, input không được validate, session cookie cấu hình sai, log chứa dữ liệu nhạy cảm, hoặc API trả quá nhiều field. Vì vậy bảo mật thực dụng là xây các lớp phòng vệ cơ bản và kiểm tra chúng đều đặn.</p>
      <p>Một backend an toàn không chỉ có authentication. Nó cần authorization, validation, output filtering, rate limiting, audit trail, secret management và quy trình phản ứng khi có sự cố.</p>

      <h2>Authentication và authorization là hai chuyện khác nhau</h2>
      <p>Authentication trả lời "người này là ai". Authorization trả lời "người này được làm gì". Một user đã đăng nhập không có nghĩa là họ được sửa mọi bài viết, xem mọi đơn hàng hoặc gọi mọi endpoint admin.</p>
      <ul>
        <li><strong>Authentication:</strong> login bằng password, OAuth, magic link, SSO hoặc API key.</li>
        <li><strong>Authorization:</strong> role, permission, ownership, policy theo resource.</li>
      </ul>
      <p>Trong API, hãy kiểm tra quyền ở phía server cho từng mutation quan trọng. Frontend ẩn nút "Delete" chỉ là UX, không phải bảo mật.</p>

      <h2>Session cookie hay JWT?</h2>
      <p>Session cookie phù hợp web app truyền thống hoặc dashboard admin vì browser tự gửi cookie theo domain. Cookie nên có <code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code> và thời hạn hợp lý. <code>HttpOnly</code> giúp JavaScript không đọc được token; <code>Secure</code> yêu cầu HTTPS; <code>SameSite</code> giảm rủi ro CSRF.</p>
      <p>JWT phù hợp khi cần token tự chứa thông tin, nhiều service xác minh độc lập hoặc API client không dùng cookie. Nhưng JWT khó revoke nếu không có blacklist hoặc token version. Đừng chọn JWT chỉ vì nó "hiện đại". Hãy chọn theo mô hình client, khả năng revoke và cách quản lý quyền.</p>

      <h2>Validate input theo allowlist</h2>
      <p>Input từ user, webhook, query string và admin form đều không đáng tin. Validation tốt nên giới hạn kiểu dữ liệu, độ dài, format, enum và relationship. Với HTML content, cần sanitize để loại bỏ script, event handler và URL nguy hiểm.</p>
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
      <p>Allowlist tốt hơn blacklist. Thay vì cố đoán mọi chuỗi độc hại, hãy định nghĩa chính xác dữ liệu hợp lệ là gì. Database constraint cũng nên lặp lại các rule quan trọng như unique slug, foreign key và giới hạn trạng thái.</p>

      <h2>Output filtering giảm rò rỉ dữ liệu</h2>
      <p>Không phải field nào trong database cũng nên trả về public API. Ví dụ comment có thể có email người gửi, nhưng public API chỉ nên trả tên, nội dung đã duyệt và timestamp. User profile public không nên trả password hash, refresh token, provider id nội bộ hoặc audit note.</p>
      <p>Hãy tạo select list rõ ràng cho public route thay vì <code>select *</code>. Với admin route, vẫn nên giới hạn theo nhu cầu màn hình để tránh vô tình lộ dữ liệu khi UI đổi.</p>

      <h2>Rate limit và abuse protection</h2>
      <p>Endpoint login, contact form, comment form, search và file upload đều dễ bị abuse. Rate limit nên đặt theo IP, user id hoặc API key tùy ngữ cảnh. Với login, cần thêm lockout mềm, delay tăng dần hoặc captcha sau nhiều lần sai. Với contact/comment, cần kiểm tra độ dài, honeypot hoặc moderation.</p>
      <p>Rate limit không chỉ bảo vệ hạ tầng. Nó còn bảo vệ chi phí nếu endpoint gọi AI API, gửi email hoặc xử lý upload nặng.</p>

      <h2>Secret management</h2>
      <p>Secret không được commit vào Git và không được đóng gói vào frontend bundle. Phân biệt biến public và private. Trong Next.js, biến có tiền tố public sẽ được expose cho client nếu dùng trong browser. Service role key, database password, signing secret và private API key phải chỉ tồn tại phía server.</p>
      <ul>
        <li>Dùng secret manager của nền tảng deploy.</li>
        <li>Rotate secret khi nghi ngờ lộ.</li>
        <li>Giới hạn quyền của key theo nhu cầu thực tế.</li>
        <li>Không log secret hoặc header authorization.</li>
        <li>Scan repository để phát hiện secret trước khi push.</li>
      </ul>

      <h2>Security headers đáng bật</h2>
      <p>Security headers không thay thế code an toàn, nhưng chúng giảm tác động của một số lỗi. Các header phổ biến gồm <code>X-Content-Type-Options</code>, <code>Referrer-Policy</code>, <code>Permissions-Policy</code>, <code>Content-Security-Policy</code> và <code>X-Frame-Options</code> hoặc <code>frame-ancestors</code> trong CSP.</p>
      <p>CSP mạnh nhưng cần triển khai cẩn thận vì có thể làm hỏng script, image hoặc style hợp lệ. Hãy bắt đầu bằng report-only ở hệ thống lớn, theo dõi violation rồi siết dần.</p>

      <h2>Audit log cho hành động nhạy cảm</h2>
      <p>Admin login, đổi quyền, xóa dữ liệu, publish bài, thay đổi billing hoặc export dữ liệu nên có audit log. Audit log nên ghi ai làm, làm gì, resource nào, khi nào, IP hoặc user agent nếu hợp lý. Đừng ghi password, token hoặc dữ liệu nhạy cảm không cần thiết.</p>
      <p>Khi xảy ra sự cố, audit log giúp bạn trả lời câu hỏi quan trọng: phạm vi ảnh hưởng là gì và hành động nào đã diễn ra.</p>

      <h2>Checklist bảo mật cho web/API</h2>
      <ul>
        <li>Mọi mutation quan trọng đều kiểm tra authentication và authorization phía server.</li>
        <li>Session cookie có HttpOnly, Secure, SameSite và expiration.</li>
        <li>Input được validate theo allowlist và giới hạn độ dài.</li>
        <li>Public API không trả field nhạy cảm.</li>
        <li>Endpoint dễ bị abuse có rate limit.</li>
        <li>Secret không nằm trong Git, frontend bundle hoặc log.</li>
        <li>Database có constraint bảo vệ dữ liệu quan trọng.</li>
        <li>Admin action có audit log.</li>
        <li>Error message không lộ stack trace hoặc chi tiết nội bộ ở production.</li>
      </ul>
      <p>Bảo mật tốt là nhiều lớp nhỏ hoạt động cùng nhau. Không có checklist nào bảo đảm tuyệt đối, nhưng nếu làm chắc các nền tảng này, bạn đã giảm được phần lớn rủi ro phổ biến trong web app và API.</p>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie">MDN: Set-Cookie header</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">MDN: Content Security Policy</a></li>
      </ul>
    `,
    excerpt: 'Bài viết thực dụng về bảo mật web/API: authentication, authorization, session cookie, JWT, validation, output filtering, rate limit và secret.',
    featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=700&fit=crop',
    seo_title: 'Bảo mật web/API thực dụng',
    seo_description: 'Checklist bảo mật web/API về auth, session, JWT, input validation, output filtering, rate limit và secret management.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Security',
    tags: ['security', 'api', 'auth', 'rate-limit'],
    published_at: toIsoDate('2026-04-19T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-19T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-19T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    title: 'CI/CD chất lượng: quality gate, rollback và release an toàn',
    slug: 'cicd-chat-luong-quality-gate-rollback-release-an-toan',
    content: `
      <h2>CI/CD không chỉ là tự động deploy</h2>
      <p>Một pipeline CI/CD chuyên nghiệp không đơn giản là push code rồi server tự restart. Nó là chuỗi kiểm soát chất lượng giúp team biết thay đổi nào đủ điều kiện đi tiếp, artifact nào được phát hành, rủi ro nào còn mở và rollback bằng cách nào nếu production lỗi.</p>
      <p>Điểm dễ sai là nhầm tốc độ với sự vội vàng. CI/CD tốt làm team đi nhanh hơn vì loại bỏ thao tác thủ công, nhưng vẫn giữ checkpoint rõ ràng: kiểm tra code, test, build artifact, scan, review, deploy và quan sát sau deploy.</p>

      <h2>Quality gate nên bắt lỗi đúng tầng</h2>
      <p>Quality gate là các điều kiện phải pass trước khi merge hoặc deploy. Với web app, một bộ gate hợp lý thường gồm lint, type check, unit test, integration test quan trọng, build production, dependency audit và kiểm tra secret. Không phải gate nào cũng chạy ở mọi push. Gate nhanh nên chạy ở pull request; gate nặng có thể chạy theo lịch hoặc trước release.</p>
      <ul>
        <li><strong>Lint:</strong> bắt lỗi style, pattern nguy hiểm và code dễ gây bug.</li>
        <li><strong>Type check:</strong> bắt lỗi contract giữa component, API, model và helper.</li>
        <li><strong>Unit test:</strong> kiểm tra logic nhỏ, nhanh, ít phụ thuộc môi trường.</li>
        <li><strong>Integration test:</strong> kiểm tra luồng nhiều module như auth, post creation, checkout.</li>
        <li><strong>Build:</strong> xác minh app có thể tạo artifact production.</li>
        <li><strong>Security scan:</strong> phát hiện dependency rủi ro, secret hoặc image vulnerability.</li>
      </ul>
      <p>Đừng biến gate thành hình thức. Nếu một gate thường xuyên fail vì flaky test, team sẽ mất niềm tin và bắt đầu bỏ qua nó. Test flaky cần được sửa hoặc tách ra khỏi đường merge chính cho tới khi ổn định.</p>

      <h2>Artifact phải bất biến và truy vết được</h2>
      <p>Mỗi lần build production nên tạo artifact có định danh rõ: image tag theo commit SHA, package version hoặc build number. Khi production đang chạy version nào, bạn phải truy về được commit, pull request, người approve và log deploy. Nếu production build lại từ source theo trạng thái hiện tại của main, rollback sẽ kém chắc chắn.</p>
      <pre><code class="language-bash">IMAGE_TAG=$(git rev-parse --short HEAD)
docker build -t registry.example.com/app:$IMAGE_TAG .
docker push registry.example.com/app:$IMAGE_TAG
</code></pre>
      <p>Với frontend như Next.js, artifact có thể là Docker image, output build hoặc deployment trên platform. Với backend, artifact có thể là image hoặc binary. Dù hình thức nào, nguyên tắc vẫn giống nhau: build một lần, deploy artifact đó qua các môi trường.</p>

      <h2>Rollback là một phần của thiết kế release</h2>
      <p>Nếu chỉ nghĩ tới deploy lên mà không nghĩ tới quay lại, pipeline chưa hoàn chỉnh. Rollback app thường dễ hơn rollback database. Vì vậy migration cần được thiết kế tương thích ngược khi có thể. Một release an toàn thường chia thay đổi lớn thành các bước nhỏ.</p>
      <ol>
        <li>Thêm cột/bảng mới nhưng chưa dùng bắt buộc.</li>
        <li>Deploy code ghi song song hoặc đọc được cả schema cũ và mới.</li>
        <li>Backfill dữ liệu nếu cần.</li>
        <li>Chuyển traffic sang logic mới.</li>
        <li>Sau khi ổn định, dọn schema cũ ở release sau.</li>
      </ol>
      <p>Cách này giảm rủi ro khi cần rollback code. Nếu migration phá schema ngay trong cùng release, rollback app có thể không đủ để phục hồi.</p>

      <h2>Promotion giữa môi trường</h2>
      <p>Staging không nên là nơi build lại một artifact khác với production. Lý tưởng hơn là cùng một artifact được promote qua dev, staging và production với configuration khác nhau. Điều này giúp bạn test đúng thứ sắp chạy ở production.</p>
      <p>Configuration nên nằm ở environment variable hoặc secret manager. Secret không đi vào image. Feature flag có thể giúp bật/tắt hành vi mới theo nhóm user, nhưng feature flag cũng cần cleanup. Flag để lâu trở thành một nhánh logic ẩn khó test.</p>

      <h2>Checklist release an toàn</h2>
      <ul>
        <li>Pull request nhỏ, có mô tả risk và cách test.</li>
        <li>CI pass lint, type check, test và build production.</li>
        <li>Artifact được gắn tag theo commit hoặc version.</li>
        <li>Migration tương thích rollback hoặc có kế hoạch phục hồi dữ liệu.</li>
        <li>Deploy có health check và timeout rõ ràng.</li>
        <li>Dashboard có error rate, latency, throughput và log liên quan.</li>
        <li>Rollback command hoặc quy trình rollback được viết trước.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://docs.github.com/en/actions">GitHub Docs: GitHub Actions</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
      </ul>
    `,
    excerpt: 'Thiết kế CI/CD chuyên nghiệp với quality gate, artifact bất biến, rollback, migration an toàn và checklist release production.',
    featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop',
    seo_title: 'CI/CD chất lượng: quality gate và rollback',
    seo_description: 'Hướng dẫn CI/CD thực tế: quality gate, artifact, promotion, rollback, migration an toàn và checklist release.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'DevOps',
    tags: ['devops', 'cicd', 'release', 'rollback'],
    published_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    title: 'Docker image production: nhỏ hơn, an toàn hơn, build nhanh hơn',
    slug: 'docker-image-production-nho-an-toan-build-nhanh',
    content: `
      <h2>Image production cần được thiết kế</h2>
      <p>Nhiều Dockerfile chạy được ở local nhưng chưa đủ tốt cho production: image quá nặng, chứa dev dependency, copy cả file env, chạy bằng root, không có tag rõ ràng hoặc build chậm vì cache bị phá liên tục. Docker image production cần được xem như artifact phát hành, không phải bản chụp tạm của thư mục dự án.</p>
      <p>Một image tốt có ba đặc điểm: chỉ chứa thứ cần để chạy, build có thể lặp lại và giảm quyền runtime. Điều này giúp deploy nhanh hơn, giảm bề mặt tấn công và dễ debug version đang chạy.</p>

      <h2>Multi-stage build giúp tách build-time và runtime</h2>
      <p>Build app thường cần nhiều công cụ hơn runtime. Ví dụ frontend cần TypeScript, bundler và dev dependency để build, nhưng container runtime chỉ cần output build và package cần thiết để chạy. Multi-stage build cho phép dùng một stage để build, sau đó copy kết quả sang stage runtime nhỏ hơn.</p>
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
      <p>Ví dụ này vẫn cần điều chỉnh theo framework, nhưng nguyên tắc chính là tách dependency build và dependency runtime. Với Next.js, nếu dùng output standalone, image có thể còn nhỏ hơn nữa.</p>

      <h2>Cache layer quyết định tốc độ build</h2>
      <p>Docker cache theo layer. Nếu bạn copy toàn bộ source trước khi chạy <code>npm ci</code>, chỉ cần sửa một file UI cũng khiến layer install dependency bị rebuild. Cách tốt hơn là copy package manifest trước, install dependency, rồi mới copy source. Khi dependency không đổi, build dùng lại cache.</p>
      <p><code>.dockerignore</code> cũng ảnh hưởng trực tiếp tới cache và tốc độ. Build context càng nhỏ, Docker gửi dữ liệu càng nhanh và ít khả năng cache bị invalid bởi file không liên quan.</p>

      <h2>Không đưa secret vào image</h2>
      <p>Secret trong image là lỗi nghiêm trọng vì image có thể được push lên registry, cache ở CI hoặc chia sẻ cho môi trường khác. Biến như database password, service role key, JWT secret và private API key phải được inject ở runtime qua secret manager hoặc environment của nền tảng deploy.</p>
      <p>Nếu build cần token private để tải package, hãy dùng cơ chế secret mount của build system khi có thể, hoặc đảm bảo token không nằm trong layer cuối. Sau build, kiểm tra history và scan image để giảm rủi ro rò rỉ.</p>

      <h2>Chạy non-root khi có thể</h2>
      <p>Container không phải sandbox tuyệt đối. Chạy process bằng user root làm tăng tác động nếu app bị khai thác. Nhiều base image cung cấp user non-root sẵn, hoặc bạn có thể tạo user riêng. Đồng thời, filesystem runtime nên ghi càng ít càng tốt; log nên ra stdout/stderr để platform thu thập.</p>

      <h2>Checklist Docker image production</h2>
      <ul>
        <li>Base image có version rõ, được cập nhật định kỳ.</li>
        <li>Dockerfile dùng multi-stage nếu build cần nhiều tool hơn runtime.</li>
        <li><code>.dockerignore</code> loại node_modules, cache, .env, .git, log và output build local.</li>
        <li>Dependency production được tách khỏi dev dependency khi phù hợp.</li>
        <li>Image không chứa secret, token, file local hoặc credential.</li>
        <li>Process runtime không chạy root nếu framework cho phép.</li>
        <li>Image được tag bằng commit SHA hoặc version release.</li>
        <li>CI scan dependency/image và lưu kết quả theo release.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://docs.docker.com/build/building/multi-stage/">Docker Docs: Multi-stage builds</a></li>
        <li><a href="https://docs.docker.com/build/concepts/context/#dockerignore-files">Docker Docs: .dockerignore files</a></li>
        <li><a href="https://docs.docker.com/build/building/secrets/">Docker Docs: Build secrets</a></li>
      </ul>
    `,
    excerpt: 'Tối ưu Docker image production bằng multi-stage build, cache layer, .dockerignore, non-root runtime và quản lý secret đúng cách.',
    featured_image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=700&fit=crop',
    seo_title: 'Docker image production nhỏ và an toàn',
    seo_description: 'Cách tối ưu Docker image production: multi-stage build, cache, .dockerignore, secret, non-root và scan image.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Docker',
    tags: ['docker', 'image', 'security', 'build'],
    published_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000009',
    title: 'Kubernetes cho developer: Deployment, Service, readiness và autoscaling',
    slug: 'kubernetes-cho-developer-deployment-service-readiness-autoscaling',
    content: `
      <h2>Đừng bắt đầu Kubernetes bằng YAML</h2>
      <p>Kubernetes dễ làm người học choáng vì có nhiều object và cấu hình. Cách học tốt hơn là hiểu vấn đề vận hành mà từng object giải quyết. Với developer, bốn khái niệm thực dụng nhất là Deployment, Pod, Service và probe. Sau đó mới học ConfigMap, Secret, Ingress, autoscaling và rollout strategy.</p>
      <p>Pod là đơn vị chạy container. Deployment quản lý số lượng Pod mong muốn và rollout phiên bản mới. Service cung cấp endpoint ổn định để các Pod khác gọi tới, vì Pod có thể bị thay đổi IP khi recreate.</p>

      <h2>Deployment quản lý rollout</h2>
      <p>Khi bạn cập nhật image trong Deployment, Kubernetes tạo ReplicaSet mới và đưa Pod mới vào dần theo chiến lược rollout. Với rolling update, hệ thống có thể thay Pod từng phần thay vì dừng toàn bộ app. Điều kiện quan trọng là app phải có health check đúng để Kubernetes biết Pod nào sẵn sàng nhận traffic.</p>
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
      <p>Readiness và liveness không giống nhau. Readiness trả lời "Pod đã sẵn sàng nhận request chưa". Liveness trả lời "Pod có cần restart không". Nếu liveness check phụ thuộc database và database chậm tạm thời, bạn có thể vô tình restart hàng loạt Pod đang khỏe. Hãy thiết kế probe theo đúng mục đích.</p>

      <h2>Service ổn định hóa network</h2>
      <p>Pod IP không phải contract ổn định. Service chọn các Pod theo label và cung cấp DNS name ổn định trong cluster. App khác có thể gọi <code>http://api.default.svc.cluster.local</code> hoặc tên ngắn trong cùng namespace. Nếu cần public traffic, bạn thường dùng Ingress hoặc load balancer phía trước Service.</p>

      <h2>Resource request và limit ảnh hưởng scheduling</h2>
      <p>Kubernetes scheduler cần biết Pod cần bao nhiêu CPU/memory để đặt lên node phù hợp. Request là lượng tài nguyên Pod được đảm bảo tương đối; limit là mức tối đa được phép dùng. Không đặt request/limit có thể làm cluster khó dự đoán. Đặt limit quá thấp có thể gây OOM hoặc throttling.</p>
      <p>Với ứng dụng web, hãy bắt đầu bằng đo thực tế dưới tải bình thường và tải cao. Sau đó đặt request gần mức cần ổn định, còn limit có khoảng thở hợp lý. Đừng copy con số từ blog khác vào production.</p>

      <h2>Autoscaling cần metric đúng</h2>
      <p>Horizontal Pod Autoscaler có thể tăng giảm số Pod dựa trên CPU, memory hoặc custom metric. CPU autoscaling phù hợp worker CPU-bound, nhưng không phải lúc nào cũng phản ánh request backlog hoặc latency. Với queue worker, queue depth hoặc processing lag thường có ý nghĩa hơn.</p>
      <p>Autoscaling không thay thế tối ưu ứng dụng. Nếu query database chậm, tăng Pod có thể làm database quá tải hơn. Trước khi scale out, hãy xem bottleneck nằm ở app, database, cache hay network.</p>

      <h2>Checklist Kubernetes cho developer</h2>
      <ul>
        <li>Image có tag rõ, không dùng latest ở production.</li>
        <li>Readiness probe nhẹ và phản ánh khả năng nhận request.</li>
        <li>Liveness probe không restart app vì dependency tạm thời chậm.</li>
        <li>Service chọn Pod bằng label nhất quán.</li>
        <li>Request/limit dựa trên đo đạc, không đoán mò.</li>
        <li>ConfigMap và Secret tách khỏi image.</li>
        <li>Rollout có thể pause, resume và rollback khi cần.</li>
        <li>Log ra stdout/stderr và có correlation id cho request.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/">Kubernetes Docs: Deployments</a></li>
        <li><a href="https://kubernetes.io/docs/concepts/services-networking/service/">Kubernetes Docs: Services</a></li>
        <li><a href="https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/">Kubernetes Docs: Liveness, readiness, startup probes</a></li>
      </ul>
    `,
    excerpt: 'Kubernetes thực dụng cho developer: Deployment, Pod, Service, readiness/liveness probe, resource request/limit và autoscaling.',
    featured_image: 'https://images.unsplash.com/photo-1667372335939-2f5257b1220f?w=1200&h=700&fit=crop',
    seo_title: 'Kubernetes cho developer: Deployment và probe',
    seo_description: 'Giải thích Kubernetes cho developer: Deployment, Service, readiness, liveness, resource request, limit và autoscaling.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Kubernetes',
    tags: ['kubernetes', 'devops', 'deployment', 'autoscaling'],
    published_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000010',
    title: 'Reverse proxy cho API: header, timeout, body size và cache',
    slug: 'reverse-proxy-cho-api-header-timeout-body-size-cache',
    content: `
      <h2>Proxy là lớp vận hành quan trọng</h2>
      <p>Trong production, request hiếm khi đi thẳng từ browser tới app. Nó thường đi qua CDN, load balancer hoặc reverse proxy như Nginx. Proxy có thể terminate TLS, route request, set header, giới hạn body size, timeout upstream, nén response và cache nội dung public. Nếu proxy cấu hình sai, app đúng vẫn có thể lỗi.</p>
      <p>Developer backend nên hiểu proxy ở mức đủ để debug. Khi upload lỗi 413, redirect loop, log toàn IP nội bộ hoặc request chậm bị cắt ngang, nguyên nhân thường nằm ở lớp proxy.</p>

      <h2>Header chuyển tiếp phải nhất quán</h2>
      <p>App thường cần biết host gốc, scheme gốc và IP client. Proxy cần chuyển các header phù hợp như <code>Host</code>, <code>X-Forwarded-Proto</code> và <code>X-Forwarded-For</code>. Đồng thời app phải được cấu hình tin proxy đáng tin cậy, tránh tin bừa header do client tự gửi.</p>
      <pre><code class="language-nginx">location / {
  proxy_pass http://app:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Request-Id $request_id;
}
</code></pre>
      <p><code>X-Request-Id</code> hoặc correlation id giúp lần theo một request qua proxy, app, worker và log. Nếu hệ thống có nhiều service, id này là một trong những công cụ debug rẻ nhất.</p>

      <h2>Timeout nên được thiết kế theo dependency</h2>
      <p>Timeout quá thấp gây lỗi giả trong giờ cao điểm. Timeout vô hạn làm request treo, chiếm connection và che giấu sự cố upstream. Cần đặt timeout ở nhiều lớp: client, CDN/proxy, app server, HTTP client nội bộ, database và queue worker.</p>
      <p>Nguyên tắc thực tế là timeout phía ngoài nên lớn hơn một chút so với timeout phía trong. Nếu app gọi service ngoài với timeout 8 giây, proxy timeout 5 giây sẽ cắt request trước khi app xử lý xong. Ngược lại, nếu app không có timeout nhưng proxy chờ 60 giây, hệ thống có thể bị cạn tài nguyên khi dependency bị treo.</p>

      <h2>Body size và upload</h2>
      <p>API upload cần giới hạn body size rõ. Không giới hạn có thể bị abuse; giới hạn quá thấp gây lỗi upload hợp lệ. Nếu upload file lớn, cân nhắc upload trực tiếp lên object storage bằng signed URL, sau đó app chỉ nhận metadata. Cách này giảm tải app server và proxy.</p>

      <h2>Cache ở proxy cần phân biệt public và private</h2>
      <p>Không phải response nào cũng nên cache. Bài blog public, asset tĩnh và RSS có thể cache. Dashboard admin, API có dữ liệu user, response chứa cookie hoặc authorization thì không nên cache public. Header <code>Cache-Control</code> phải thể hiện đúng ý định.</p>
      <ul>
        <li><code>public</code>: response có thể được cache bởi shared cache nếu phù hợp.</li>
        <li><code>private</code>: chỉ cache ở browser người dùng, không cache ở shared proxy.</li>
        <li><code>no-store</code>: không lưu response.</li>
        <li><code>s-maxage</code>: TTL dành cho shared cache như CDN.</li>
      </ul>

      <h2>Checklist proxy cho API</h2>
      <ul>
        <li>Header Host, scheme và client IP được chuyển đúng.</li>
        <li>App chỉ tin proxy/header từ nguồn đáng tin.</li>
        <li>Timeout ở proxy và app không mâu thuẫn nhau.</li>
        <li>Body size limit phù hợp từng endpoint.</li>
        <li>Public cache không áp vào route có dữ liệu cá nhân.</li>
        <li>Request id được tạo hoặc giữ xuyên suốt hệ thống.</li>
        <li>Log proxy có method, path, status, upstream time và request id.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://nginx.org/en/docs/http/ngx_http_proxy_module.html">NGINX Docs: HTTP proxy module</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control">MDN: Cache-Control</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For">MDN: X-Forwarded-For</a></li>
      </ul>
    `,
    excerpt: 'Reverse proxy cho API production: forwarded headers, request id, timeout, body size, upload và cache public/private.',
    featured_image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=700&fit=crop',
    seo_title: 'Reverse proxy cho API production',
    seo_description: 'Hướng dẫn reverse proxy cho API: header, request id, timeout, body size, upload và cache public/private.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Networking',
    tags: ['networking', 'proxy', 'nginx', 'api', 'cache'],
    published_at: toIsoDate('2026-04-25T16:00:00+07:00'),
    created_at: toIsoDate('2026-04-25T16:00:00+07:00'),
    updated_at: toIsoDate('2026-04-25T16:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000011',
    title: 'PostgreSQL index và EXPLAIN: tối ưu query bằng dữ liệu thật',
    slug: 'postgresql-index-explain-toi-uu-query-bang-du-lieu-that',
    content: `
      <h2>Index không phải cứ thêm là nhanh</h2>
      <p>Index giúp database tìm dữ liệu nhanh hơn, nhưng index cũng có chi phí: tốn storage, làm insert/update/delete chậm hơn và cần maintenance. Một hệ thống tốt không thêm index theo cảm giác. Nó thêm index dựa trên query thật, dữ liệu thật và kết quả đo bằng <code>EXPLAIN</code> hoặc <code>EXPLAIN ANALYZE</code>.</p>

      <h2>Bắt đầu từ query pattern</h2>
      <p>Hãy liệt kê các query quan trọng: trang listing lọc theo gì, sort theo gì, pagination ra sao, endpoint detail lookup bằng khóa nào, dashboard aggregate theo khoảng thời gian nào. Index nên phục vụ pattern này.</p>
      <p>Ví dụ bảng posts public thường có query: lấy bài đã publish, publish time nhỏ hơn hiện tại, sort mới nhất và giới hạn số lượng. Index trên <code>published_at</code> giúp sort/filter tốt hơn. Lookup bài detail theo <code>slug</code> nên có unique index.</p>
      <pre><code class="language-sql">CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_category ON posts(category);
</code></pre>

      <h2>Composite index cần đúng thứ tự</h2>
      <p>Nếu query thường lọc theo category rồi sort theo published_at, composite index có thể hữu ích. Nhưng thứ tự cột trong index quan trọng. Database có thể tận dụng tốt phần đầu của index; nếu bạn đảo thứ tự không phù hợp với filter, index kém hiệu quả hơn.</p>
      <pre><code class="language-sql">CREATE INDEX idx_posts_category_published
ON posts(category, published_at DESC);
</code></pre>
      <p>Đừng tạo mọi tổ hợp index. Hãy đo query đang chậm, xem plan, thêm index phục vụ query đó, rồi đo lại.</p>

      <h2>EXPLAIN giúp nhìn query plan</h2>
      <p><code>EXPLAIN</code> cho biết PostgreSQL dự định đọc dữ liệu bằng cách nào: sequential scan, index scan, bitmap scan, join strategy và chi phí ước tính. <code>EXPLAIN ANALYZE</code> chạy query thật và trả thời gian thực tế, nên hãy cẩn thận với query ghi dữ liệu hoặc query nặng ở production.</p>
      <pre><code class="language-sql">EXPLAIN ANALYZE
SELECT id, title, slug, published_at
FROM posts
WHERE category = 'DevOps'
  AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 10;
</code></pre>
      <p>Khi đọc plan, hãy chú ý số row ước tính so với thực tế. Nếu lệch lớn, thống kê có thể cũ hoặc data distribution đặc biệt. Chạy analyze định kỳ và hiểu dữ liệu giúp planner chọn plan tốt hơn.</p>

      <h2>Constraint bảo vệ dữ liệu, không chỉ performance</h2>
      <p>Index thường đi cùng constraint như unique slug. Nhưng database còn cần foreign key, check constraint và not null để bảo vệ bất biến dữ liệu. Validation ở app tốt cho UX; constraint ở database tốt cho tính đúng đắn khi có bug, job hoặc script ghi dữ liệu.</p>
      <ul>
        <li><strong>UNIQUE:</strong> bảo đảm slug, email hoặc external id không trùng.</li>
        <li><strong>FOREIGN KEY:</strong> bảo đảm quan hệ tồn tại.</li>
        <li><strong>CHECK:</strong> bảo đảm giá trị hợp lệ như view_count không âm.</li>
        <li><strong>NOT NULL:</strong> bảo đảm field bắt buộc luôn có dữ liệu.</li>
      </ul>

      <h2>Checklist tối ưu query</h2>
      <ul>
        <li>Đo query chậm bằng log hoặc APM trước khi tối ưu.</li>
        <li>Xem query pattern: filter, sort, join, limit, pagination.</li>
        <li>Dùng EXPLAIN để hiểu plan, dùng EXPLAIN ANALYZE khi an toàn.</li>
        <li>Thêm index phục vụ query cụ thể, tránh index theo cảm giác.</li>
        <li>Kiểm tra chi phí write sau khi thêm index.</li>
        <li>Dùng constraint để bảo vệ dữ liệu quan trọng.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/indexes.html">PostgreSQL Docs: Indexes</a></li>
        <li><a href="https://www.postgresql.org/docs/current/using-explain.html">PostgreSQL Docs: Using EXPLAIN</a></li>
        <li><a href="https://www.postgresql.org/docs/current/ddl-constraints.html">PostgreSQL Docs: Constraints</a></li>
      </ul>
    `,
    excerpt: 'Tối ưu PostgreSQL bằng query pattern, index đúng chỗ, composite index, EXPLAIN/EXPLAIN ANALYZE và constraint bảo vệ dữ liệu.',
    featured_image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=700&fit=crop',
    seo_title: 'PostgreSQL index và EXPLAIN thực chiến',
    seo_description: 'Học cách dùng PostgreSQL index, composite index, EXPLAIN ANALYZE và constraint để tối ưu query đúng dữ liệu thật.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Database',
    tags: ['postgresql', 'database', 'index', 'performance'],
    published_at: toIsoDate('2026-04-25T15:00:00+07:00'),
    created_at: toIsoDate('2026-04-25T15:00:00+07:00'),
    updated_at: toIsoDate('2026-04-25T15:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000012',
    title: 'API bền vững: pagination, idempotency, versioning và rate limit',
    slug: 'api-ben-vung-pagination-idempotency-versioning-rate-limit',
    content: `
      <h2>API tốt là contract lâu dài</h2>
      <p>API không chỉ là nơi frontend gọi dữ liệu. Nó là contract giữa các hệ thống. Một API bền vững cần predictable, dễ debug, kiểm soát lỗi tốt và có chiến lược thay đổi mà không phá client cũ. Các chủ đề quan trọng gồm pagination, idempotency, versioning, rate limit và error format.</p>

      <h2>Pagination tránh response quá lớn</h2>
      <p>Endpoint listing không nên trả toàn bộ dữ liệu. Offset pagination dễ hiểu nhưng kém ổn định khi dữ liệu thay đổi liên tục và có thể chậm ở offset lớn. Cursor pagination thường tốt hơn cho feed hoặc danh sách lớn vì cursor dựa trên vị trí dữ liệu như id hoặc timestamp.</p>
      <pre><code class="language-http">GET /api/posts?limit=20&cursor=2026-04-25T08:00:00Z
</code></pre>
      <p>Dù dùng kiểu nào, hãy đặt giới hạn tối đa cho limit. Nếu client gửi limit=100000, server không nên tin. Giới hạn này vừa bảo vệ database vừa bảo vệ chi phí truyền tải.</p>

      <h2>Idempotency cho mutation nhạy cảm</h2>
      <p>Idempotency nghĩa là retry cùng một thao tác không tạo thêm side effect không mong muốn. Với payment, order creation, email sending hoặc webhook processing, idempotency rất quan trọng vì network có thể timeout sau khi server đã xử lý thành công.</p>
      <p>Một cách làm phổ biến là client gửi <code>Idempotency-Key</code>. Server lưu key, request hash và kết quả. Nếu nhận lại key đó, server trả kết quả cũ thay vì tạo resource mới.</p>
      <pre><code class="language-http">POST /api/orders
Idempotency-Key: 7a2f4e7f-7c2f-4e2f-8c2d-72d2a6c9a111
</code></pre>
      <p>Key cần có TTL và scope rõ, ví dụ theo user hoặc endpoint. Không nên dùng cùng một key cho nhiều loại mutation khác nhau.</p>

      <h2>Versioning và tương thích ngược</h2>
      <p>API công khai hoặc có nhiều client cần chiến lược version. Version có thể nằm trong path như <code>/v1</code>, header hoặc media type. Quan trọng hơn vị trí version là nguyên tắc thay đổi: thêm field thường an toàn; xóa field, đổi kiểu dữ liệu hoặc đổi ý nghĩa status code là breaking change.</p>
      <p>Khi cần thay đổi lớn, hãy deprecate có thời hạn, ghi log client còn dùng version cũ và cung cấp migration guide. Đừng phá client bằng một deploy bất ngờ.</p>

      <h2>Error format nên nhất quán</h2>
      <p>Client cần biết lỗi là validation, auth, permission, conflict, rate limit hay server error. Hãy dùng HTTP status code đúng và body có cấu trúc ổn định.</p>
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
      <p>Error message public không nên lộ stack trace, query SQL hoặc secret. Log nội bộ có thể chi tiết hơn, nhưng response public cần an toàn.</p>

      <h2>Rate limit là phần của contract</h2>
      <p>Rate limit giúp bảo vệ API khỏi abuse và giữ chất lượng service cho người dùng thật. Endpoint login, search, comment, contact, upload và AI generation cần quan tâm đặc biệt. Khi rate limit, hãy trả status 429 và nếu phù hợp, thêm header cho biết khi nào client có thể thử lại.</p>

      <h2>Checklist API bền vững</h2>
      <ul>
        <li>Listing endpoint có pagination và max limit.</li>
        <li>Mutation rủi ro có idempotency key hoặc cơ chế chống duplicate.</li>
        <li>Status code đúng ý nghĩa và error body nhất quán.</li>
        <li>Breaking change có versioning, deprecation và migration plan.</li>
        <li>Rate limit bảo vệ endpoint dễ abuse.</li>
        <li>Response public không lộ field nhạy cảm.</li>
        <li>Log có request id, user id khi hợp lệ, status và latency.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status">MDN: HTTP response status codes</a></li>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After">MDN: Retry-After header</a></li>
      </ul>
    `,
    excerpt: 'Thiết kế API bền vững với pagination, idempotency key, versioning, error format, rate limit và checklist production.',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=700&fit=crop',
    seo_title: 'API bền vững: pagination và idempotency',
    seo_description: 'Hướng dẫn thiết kế API bền vững: pagination, idempotency, versioning, error format, rate limit và bảo mật.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Architecture',
    tags: ['api', 'architecture', 'security', 'rate-limit'],
    published_at: toIsoDate('2026-04-25T14:00:00+07:00'),
    created_at: toIsoDate('2026-04-25T14:00:00+07:00'),
    updated_at: toIsoDate('2026-04-25T14:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000013',
    title: 'Git release workflow: tag, changelog, hotfix và revert an toàn',
    slug: 'git-release-workflow-tag-changelog-hotfix-revert-an-toan',
    content: `
      <h2>Release cần nhiều hơn merge vào main</h2>
      <p>Với team nhỏ, merge vào main rồi deploy có thể đủ. Nhưng khi sản phẩm có khách hàng thật, bạn cần biết release nào đang chạy, thay đổi nào nằm trong release đó, hotfix đi đường nào và rollback commit nào nếu lỗi. Git release workflow giúp biến lịch sử commit thành lịch sử phát hành có thể audit.</p>

      <h2>Tag đánh dấu artifact phát hành</h2>
      <p>Tag giúp gắn một tên ổn định cho commit release. Với web app deploy liên tục, tag có thể là <code>v2026.04.25-1</code> hoặc semantic version nếu sản phẩm phát hành theo version. Điều quan trọng là tag trỏ tới đúng commit đã build artifact.</p>
      <pre><code class="language-bash">git tag -a v1.4.2 -m "Release v1.4.2"
git push origin v1.4.2
</code></pre>
      <p>Annotated tag lưu thêm metadata như message, tagger và ngày tạo. Với release chính thức, annotated tag thường rõ ràng hơn lightweight tag.</p>

      <h2>Changelog nên viết cho người đọc</h2>
      <p>Changelog không phải dump toàn bộ commit message. Nó nên nhóm thay đổi theo ý nghĩa: Added, Changed, Fixed, Security, Deprecated, Removed. Người đọc cần biết release này ảnh hưởng gì tới người dùng, API, vận hành hoặc dữ liệu.</p>
      <ul>
        <li><strong>Added:</strong> chức năng mới.</li>
        <li><strong>Changed:</strong> thay đổi hành vi hiện có.</li>
        <li><strong>Fixed:</strong> bug fix.</li>
        <li><strong>Security:</strong> vá rủi ro bảo mật.</li>
        <li><strong>Migration:</strong> thay đổi database hoặc thao tác vận hành cần chú ý.</li>
      </ul>

      <h2>Hotfix nên đi đường ngắn nhưng có kiểm soát</h2>
      <p>Khi production lỗi, hotfix cần nhanh nhưng không nên bỏ hết kiểm soát. Nhánh hotfix nên xuất phát từ commit production hiện tại hoặc main nếu main đại diện production. Sau khi fix, chạy test liên quan, review nhanh, tag release mới và merge lại để main không lệch.</p>
      <pre><code class="language-bash">git switch -c hotfix/login-timeout v1.4.2
# fix code, test
git commit -m "fix login timeout handling"
git tag -a v1.4.3 -m "Hotfix v1.4.3"
</code></pre>
      <p>Điểm quan trọng là tránh sửa trực tiếp trên server. Hotfix vẫn phải đi qua Git để có lịch sử và khả năng audit.</p>

      <h2>Revert thường an toàn hơn rewrite history</h2>
      <p>Nếu một commit đã nằm trên branch shared hoặc production, <code>git revert</code> thường an toàn hơn xóa lịch sử. Revert tạo commit mới đảo ngược thay đổi, giữ lịch sử rõ ràng. Rewrite history có thể phù hợp branch cá nhân, nhưng nguy hiểm trên branch nhiều người dùng.</p>
      <pre><code class="language-bash">git revert abc1234
git push origin main
</code></pre>
      <p>Với merge commit, revert cần chỉ định parent. Hãy đọc kỹ diff sau revert và chạy test vì revert logic có thể gây conflict nghiệp vụ nếu các commit sau đó phụ thuộc vào thay đổi bị đảo ngược.</p>

      <h2>Checklist release với Git</h2>
      <ul>
        <li>Main hoặc release branch phản ánh trạng thái deploy rõ ràng.</li>
        <li>Mỗi release có tag hoặc build number truy về commit.</li>
        <li>Changelog nói theo tác động, không chỉ theo commit.</li>
        <li>Hotfix đi qua branch, review tối thiểu và CI liên quan.</li>
        <li>Revert dùng cho thay đổi đã public thay vì rewrite history.</li>
        <li>Release note nêu rõ migration, config change và rollback note nếu có.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://git-scm.com/docs/git-tag">Git Docs: git tag</a></li>
        <li><a href="https://git-scm.com/docs/git-revert">Git Docs: git revert</a></li>
        <li><a href="https://git-scm.com/docs/git-merge">Git Docs: git merge</a></li>
      </ul>
    `,
    excerpt: 'Git release workflow thực tế: tag release, changelog, hotfix branch, revert an toàn và checklist phát hành cho team.',
    featured_image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=700&fit=crop',
    seo_title: 'Git release workflow: tag và hotfix',
    seo_description: 'Cách quản lý release bằng Git: tag, changelog, hotfix, revert an toàn và checklist phát hành production.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Git',
    tags: ['git', 'release', 'changelog', 'hotfix'],
    published_at: toIsoDate('2026-04-25T13:00:00+07:00'),
    created_at: toIsoDate('2026-04-25T13:00:00+07:00'),
    updated_at: toIsoDate('2026-04-25T13:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000014',
    title: 'SEO kỹ thuật cho blog IT: canonical, sitemap, structured data và Core Web Vitals',
    slug: 'seo-ky-thuat-blog-it-canonical-sitemap-structured-data-core-web-vitals',
    content: `
      <h2>SEO kỹ thuật là nền móng, không phải mẹo</h2>
      <p>Với blog IT, nội dung sâu vẫn là yếu tố chính. Nhưng nội dung tốt có thể bị giảm hiệu quả nếu website có metadata yếu, canonical sai, sitemap thiếu, performance kém hoặc trang đa ngôn ngữ không khai báo rõ. SEO kỹ thuật giúp công cụ tìm kiếm hiểu đúng trang, tránh duplicate và cải thiện trải nghiệm đọc.</p>

      <h2>Title và meta description nên viết cho từng trang</h2>
      <p>Title nên mô tả chính xác chủ đề và chứa keyword tự nhiên. Meta description không trực tiếp bảo đảm ranking, nhưng ảnh hưởng cách người dùng hiểu trang trên kết quả tìm kiếm. Với bài kỹ thuật, description tốt nên nêu rõ vấn đề và lợi ích đọc bài.</p>
      <ul>
        <li>Title nên ngắn, rõ chủ đề, không nhồi keyword.</li>
        <li>Description nên khoảng 140-160 ký tự khi có thể.</li>
        <li>Mỗi bài có title/description riêng, tránh lặp toàn site.</li>
      </ul>

      <h2>Canonical tránh duplicate nội dung</h2>
      <p>Nếu cùng một nội dung có nhiều URL, canonical giúp chỉ ra URL chính. Điều này quan trọng với query filter, tracking parameter hoặc bài viết có phiên bản mirror. Canonical sai có thể làm công cụ tìm kiếm chọn nhầm URL hoặc giảm tín hiệu của trang chính.</p>
      <pre><code class="language-html">&lt;link rel="canonical" href="https://example.com/blog/docker-production-image" /&gt;
</code></pre>

      <h2>Sitemap và robots hỗ trợ discovery</h2>
      <p>Sitemap liệt kê các URL quan trọng để crawler dễ phát hiện. Nó không thay thế internal link tốt, nhưng hữu ích cho blog có nhiều bài. Robots.txt giúp khai báo khu vực không nên crawl, ví dụ admin route. Tuy nhiên robots không phải cơ chế bảo mật; route private vẫn cần auth thật.</p>

      <h2>Structured data giúp ngữ nghĩa rõ hơn</h2>
      <p>Với bài blog, structured data dạng Article hoặc BlogPosting có thể giúp máy hiểu title, author, published time, modified time và image. Dữ liệu có cấu trúc phải khớp nội dung hiển thị. Không nên khai báo thông tin giả chỉ để lấy rich result.</p>

      <h2>Core Web Vitals ảnh hưởng trải nghiệm đọc</h2>
      <p>Core Web Vitals tập trung vào tốc độ tải, khả năng phản hồi và ổn định layout. Với blog, các vấn đề phổ biến là ảnh hero quá nặng, font tải chậm, layout shift do ảnh không có kích thước, JavaScript quá nhiều và third-party script không kiểm soát.</p>
      <ul>
        <li><strong>LCP:</strong> tối ưu ảnh lớn, preload hợp lý và giảm render-blocking resource.</li>
        <li><strong>INP:</strong> giảm JavaScript không cần thiết, tránh handler nặng và chia nhỏ work.</li>
        <li><strong>CLS:</strong> đặt kích thước ảnh, tránh nội dung nhảy khi font hoặc ad tải xong.</li>
      </ul>

      <h2>Đa ngôn ngữ cần chiến lược rõ</h2>
      <p>Nếu website có bản English và Vietnamese cho cùng nội dung, route nên phân biệt rõ như <code>/en/...</code> và <code>/vi/...</code>, đồng thời dùng hreflang để khai báo phiên bản tương ứng. Nếu chỉ có UI song ngữ còn bài viết là một ngôn ngữ, hãy đảm bảo metadata của bài phản ánh đúng ngôn ngữ bài viết.</p>
      <p>Với ShadowDev hiện tại, bài blog tiếng Việt có title, excerpt và SEO description tiếng Việt. UI có nút chuyển EN/VI để tránh cảm giác lẫn ngôn ngữ khi đọc. Bước SEO nâng cao tiếp theo là route-level i18n nếu mỗi bài có bản dịch đầy đủ.</p>

      <h2>Checklist SEO kỹ thuật cho blog IT</h2>
      <ul>
        <li>Mỗi bài có title, description, canonical và Open Graph image.</li>
        <li>Sitemap cập nhật bài publish, không đưa draft hoặc admin route.</li>
        <li>Robots chặn crawl admin nhưng không dùng thay auth.</li>
        <li>Structured data khớp nội dung thật.</li>
        <li>Ảnh có kích thước rõ và tối ưu LCP.</li>
        <li>JavaScript không cần thiết được giảm để cải thiện INP.</li>
        <li>Trang đa ngôn ngữ có route và hreflang rõ khi có bản dịch thật.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://developers.google.com/search/docs/crawling-indexing/canonicalization">Google Search Central: Canonicalization</a></li>
        <li><a href="https://developers.google.com/search/docs/specialty/international/localized-versions">Google Search Central: Localized versions</a></li>
        <li><a href="https://web.dev/articles/vitals">web.dev: Core Web Vitals</a></li>
      </ul>
    `,
    excerpt: 'SEO kỹ thuật cho blog IT: title, meta description, canonical, sitemap, robots, structured data, hreflang và Core Web Vitals.',
    featured_image: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&h=700&fit=crop',
    seo_title: 'SEO kỹ thuật cho blog IT',
    seo_description: 'Checklist SEO kỹ thuật cho blog IT: canonical, sitemap, robots, structured data, hreflang và Core Web Vitals.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'SEO',
    tags: ['seo', 'performance', 'core-web-vitals', 'content'],
    published_at: toIsoDate('2026-04-25T12:00:00+07:00'),
    created_at: toIsoDate('2026-04-25T12:00:00+07:00'),
    updated_at: toIsoDate('2026-04-25T12:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000015',
    title: 'Observability thực chiến: log, metric, trace và SLO cho production',
    slug: 'observability-thuc-chien-log-metric-trace-slo-production',
    content: `
      <h2>Observability khác monitoring ở điểm nào?</h2>
      <p>Monitoring thường bắt đầu từ dashboard và alert: CPU cao, request lỗi, database chậm. Observability đi xa hơn: nó giúp team đặt câu hỏi mới về hệ thống mà không cần deploy thêm code chỉ để debug. Khi production có sự cố, bạn cần biết request nào lỗi, user nào bị ảnh hưởng, dependency nào chậm, và thay đổi nào vừa được release.</p>
      <p>Ba tín hiệu nền tảng gồm log, metric và trace. Log ghi sự kiện chi tiết; metric đo xu hướng theo thời gian; trace nối các bước trong một request đi qua nhiều service. Nếu thiếu một trong ba, việc điều tra thường biến thành đoán mò.</p>

      <h2>Log phải có cấu trúc và correlation id</h2>
      <p>Log dạng text tự do rất khó truy vấn khi traffic tăng. Với API production, hãy ưu tiên structured log dạng JSON và luôn gắn request id hoặc correlation id. Id này nên đi từ reverse proxy vào application, database query, background job và log lỗi.</p>
      <pre><code class="language-json">{
  "level": "error",
  "request_id": "req_7f2a",
  "route": "POST /api/orders",
  "user_id": "u_123",
  "duration_ms": 842,
  "error_code": "payment_timeout"
}
</code></pre>
      <p>Không log password, access token, refresh token, secret, số thẻ, hoặc dữ liệu cá nhân không cần thiết. Log hữu ích phải đủ ngữ cảnh để debug nhưng không biến thành kho dữ liệu nhạy cảm.</p>

      <h2>Metric nên gắn với trải nghiệm người dùng</h2>
      <p>Metric hạ tầng như CPU và memory vẫn cần, nhưng alert quan trọng nên bám vào triệu chứng người dùng: tỷ lệ lỗi tăng, latency p95 vượt ngưỡng, checkout thất bại, job quan trọng bị backlog, hoặc API trả 5xx nhiều hơn bình thường. Với web/API, bốn nhóm metric thực dụng là traffic, error, latency và saturation.</p>
      <ul>
        <li><strong>Traffic:</strong> request rate, active users, queue throughput.</li>
        <li><strong>Error:</strong> 4xx theo loại, 5xx, exception rate, failed job.</li>
        <li><strong>Latency:</strong> p50, p95, p99 theo route hoặc dependency.</li>
        <li><strong>Saturation:</strong> CPU, memory, DB connections, queue depth, disk.</li>
      </ul>

      <h2>Trace cho biết request chậm ở đâu</h2>
      <p>Trace đặc biệt hữu ích khi một request đi qua frontend, API gateway, backend, cache, database và service bên thứ ba. Thay vì chỉ biết endpoint mất 2 giây, trace cho bạn thấy 1.4 giây nằm ở query database, 400ms ở payment API và 150ms ở render.</p>
      <p>Không phải mọi request đều cần trace đầy đủ. Có thể sampling theo tỷ lệ, tăng sampling khi lỗi, hoặc trace toàn bộ route quan trọng trong giai đoạn điều tra. Điều quan trọng là trace id phải xuất hiện trong log để bạn chuyển qua lại giữa hai nguồn dữ liệu.</p>

      <h2>SLO giúp alert có kỷ luật</h2>
      <p>Nếu alert chỉ dựa trên cảm tính, team sẽ sớm bị mệt vì cảnh báo nhiễu. SLO định nghĩa mức dịch vụ mong muốn từ góc nhìn user, ví dụ 99.9% request đọc bài viết trả về dưới 800ms trong 30 ngày, hoặc 99.5% form liên hệ xử lý thành công.</p>
      <p>Khi có SLO, bạn có error budget. Nếu budget bị tiêu quá nhanh, team ưu tiên độ ổn định thay vì tiếp tục ship rủi ro. Alert tốt nên báo khi user bị ảnh hưởng hoặc error budget cháy nhanh, không phải khi một metric nhỏ nhảy lên trong vài giây.</p>

      <h2>Checklist observability cho web app</h2>
      <ul>
        <li>Log có cấu trúc, request id, route, status code và duration.</li>
        <li>Public API có metric request rate, error rate và latency p95/p99.</li>
        <li>Background job có metric queue depth, retry count và dead-letter count.</li>
        <li>Database có slow query log, connection count và backup status.</li>
        <li>Trace id liên kết được log, metric exemplar và trace.</li>
        <li>Alert bám vào SLO hoặc triệu chứng người dùng bị ảnh hưởng.</li>
        <li>Dashboard tách rõ overview, dependency, release và business flow chính.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://opentelemetry.io/docs/concepts/signals/">OpenTelemetry Docs: Signals</a></li>
        <li><a href="https://sre.google/sre-book/service-level-objectives/">Google SRE Book: Service Level Objectives</a></li>
        <li><a href="https://prometheus.io/docs/practices/alerting/">Prometheus Docs: Alerting</a></li>
      </ul>
    `,
    excerpt: 'Hướng dẫn observability cho production: structured log, metric, distributed trace, SLO, alert và checklist vận hành web app.',
    featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop',
    seo_title: 'Observability thực chiến cho production',
    seo_description: 'Học observability thực chiến: log, metric, trace, SLO, alert và checklist giám sát production cho web app.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'DevOps',
    tags: ['observability', 'monitoring', 'slo', 'opentelemetry'],
    published_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T08:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000016',
    title: 'Backup và disaster recovery: RPO, RTO, restore drill cho PostgreSQL',
    slug: 'backup-disaster-recovery-rpo-rto-restore-drill-postgresql',
    content: `
      <h2>Backup không có restore thì chưa phải backup</h2>
      <p>Nhiều team chỉ kiểm tra rằng job backup chạy thành công, nhưng chưa từng khôi phục dữ liệu thật. Đến khi xóa nhầm bảng, migration lỗi hoặc cloud region gặp sự cố, họ mới phát hiện file backup thiếu quyền, thiếu WAL, mã hóa sai key hoặc thời gian restore quá lâu. Một chiến lược backup chuyên nghiệp phải bao gồm backup, verify, restore drill và phân quyền truy cập.</p>
      <p>Với blog, CMS, CRM hoặc LMS, database thường là tài sản quan trọng nhất. Code có thể build lại, server có thể tạo lại, nhưng dữ liệu user, bài viết, comment, thanh toán hoặc lịch sử học tập mất đi thì rất khó phục hồi niềm tin.</p>

      <h2>Hiểu RPO và RTO trước khi chọn công cụ</h2>
      <p><strong>RPO</strong> là lượng dữ liệu tối đa có thể mất. Nếu RPO là 15 phút, hệ thống backup phải cho phép khôi phục về điểm cách sự cố tối đa 15 phút. <strong>RTO</strong> là thời gian tối đa để dịch vụ hoạt động trở lại. Hai con số này quyết định kiến trúc: backup hằng ngày có thể đủ cho blog cá nhân, nhưng không đủ cho hệ thống giao dịch.</p>
      <ul>
        <li>Blog nội dung: RPO vài giờ, RTO vài giờ có thể chấp nhận.</li>
        <li>CRM vận hành: RPO 15-60 phút, RTO dưới vài giờ.</li>
        <li>Thanh toán hoặc đơn hàng: cần PITR, replica, runbook và kiểm thử định kỳ.</li>
      </ul>

      <h2>PostgreSQL cần base backup và WAL</h2>
      <p>PostgreSQL có thể backup bằng logical dump hoặc physical backup. Logical dump như <code>pg_dump</code> dễ dùng cho database nhỏ và migration giữa version, nhưng restore có thể chậm. Physical backup kết hợp WAL archiving hỗ trợ point-in-time recovery, phù hợp production nghiêm túc hơn.</p>
      <pre><code class="language-bash">pg_dump --format=custom --file=app.dump "$DATABASE_URL"
pg_restore --clean --if-exists --dbname="$RESTORE_DATABASE_URL" app.dump
</code></pre>
      <p>Dù dùng managed database như Supabase, Neon, RDS hay Cloud SQL, bạn vẫn cần hiểu chính sách retention, PITR, khu vực lưu backup, giới hạn restore và cách kiểm thử restore vào môi trường riêng.</p>

      <h2>Restore drill nên chạy như một bài test vận hành</h2>
      <p>Restore drill là buổi diễn tập khôi phục dữ liệu theo runbook. Mục tiêu không chỉ là restore thành công, mà là đo thời gian, phát hiện bước thiếu, kiểm tra quyền truy cập, xác nhận dữ liệu và cập nhật tài liệu. Hãy chạy drill định kỳ, đặc biệt trước các migration lớn.</p>
      <ol>
        <li>Chọn backup hoặc thời điểm PITR cần restore.</li>
        <li>Restore vào database tách biệt, không ghi đè production.</li>
        <li>Chạy smoke test: số bảng, số record, checksum hoặc query nghiệp vụ.</li>
        <li>Đo thời gian restore thực tế và so với RTO.</li>
        <li>Cập nhật runbook và quyền truy cập nếu phát hiện điểm yếu.</li>
      </ol>

      <h2>Bảo mật backup quan trọng như production</h2>
      <p>Backup thường chứa toàn bộ dữ liệu nhạy cảm. Vì vậy backup cần mã hóa, kiểm soát quyền, audit access, retention rõ ràng và quy trình xóa an toàn. Không lưu backup production vào laptop cá nhân hoặc bucket public. Không dùng cùng một credential cho app runtime và thao tác restore.</p>

      <h2>Checklist backup và DR</h2>
      <ul>
        <li>Xác định RPO/RTO cho từng loại hệ thống.</li>
        <li>Backup tự động, có retention và cảnh báo khi job thất bại.</li>
        <li>Hỗ trợ PITR nếu dữ liệu thay đổi thường xuyên và quan trọng.</li>
        <li>Restore drill định kỳ vào môi trường tách biệt.</li>
        <li>Backup được mã hóa và giới hạn quyền truy cập.</li>
        <li>Runbook nêu rõ ai làm gì, command nào chạy, kiểm tra nào cần qua.</li>
        <li>Migration rủi ro có backup gần thời điểm deploy và rollback plan.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://www.postgresql.org/docs/current/backup.html">PostgreSQL Docs: Backup and Restore</a></li>
        <li><a href="https://www.postgresql.org/docs/current/continuous-archiving.html">PostgreSQL Docs: Continuous Archiving and PITR</a></li>
        <li><a href="https://supabase.com/docs/guides/platform/backups">Supabase Docs: Backups</a></li>
      </ul>
    `,
    excerpt: 'Backup và disaster recovery cho PostgreSQL: RPO, RTO, PITR, restore drill, bảo mật backup và checklist vận hành.',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=700&fit=crop',
    seo_title: 'Backup và disaster recovery cho PostgreSQL',
    seo_description: 'Hướng dẫn backup PostgreSQL: RPO, RTO, PITR, restore drill, bảo mật backup và checklist disaster recovery.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Database',
    tags: ['postgresql', 'backup', 'disaster-recovery', 'database'],
    published_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T09:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000017',
    title: 'Redis cache và queue: tăng tốc backend mà không làm sai dữ liệu',
    slug: 'redis-cache-queue-tang-toc-backend-khong-sai-du-lieu',
    content: `
      <h2>Redis nhanh nhưng không phải thuốc chữa mọi bệnh</h2>
      <p>Redis thường được dùng để cache, rate limit, session, lock nhẹ và queue. Nó giúp giảm tải database và tăng tốc response, nhưng cũng có thể tạo bug khó debug nếu cache sai key, TTL quá dài, dữ liệu stale, job chạy trùng hoặc lock không có timeout. Dùng Redis tốt cần hiểu trade-off giữa tốc độ, độ đúng và độ phức tạp vận hành.</p>

      <h2>Cache-aside là pattern dễ bắt đầu</h2>
      <p>Với cache-aside, application đọc cache trước. Nếu miss, app đọc database, ghi cache rồi trả response. Pattern này đơn giản, nhưng cần key rõ ràng, TTL hợp lý và invalidation khi dữ liệu thay đổi.</p>
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
      <p>Không nên cache response chứa dữ liệu cá nhân bằng key quá chung. Ví dụ <code>dashboard:stats</code> có thể lộ dữ liệu giữa user nếu key không chứa tenant hoặc user id phù hợp.</p>

      <h2>TTL, invalidation và cache stampede</h2>
      <p>TTL quá ngắn làm cache ít tác dụng; TTL quá dài làm user thấy dữ liệu cũ. Với dữ liệu thay đổi theo event như bài viết, hãy xóa key khi publish/edit. Với dữ liệu tổng hợp tốn kém, có thể dùng TTL kèm stale-while-revalidate hoặc background refresh.</p>
      <p>Cache stampede xảy ra khi một key nóng hết hạn và nhiều request cùng lúc đổ vào database. Có thể giảm bằng lock ngắn, jitter TTL, request coalescing hoặc phục vụ dữ liệu stale trong lúc refresh.</p>

      <h2>Queue cần idempotency</h2>
      <p>Redis-backed queue rất hữu ích cho gửi email, resize ảnh, gọi webhook, tạo report hoặc sync dữ liệu. Nhưng job có thể chạy lại vì worker restart, timeout, network lỗi hoặc retry. Vì vậy job phải idempotent: chạy nhiều lần vẫn không tạo side effect sai.</p>
      <ul>
        <li>Dùng idempotency key cho thao tác gửi webhook hoặc tạo thanh toán.</li>
        <li>Lưu trạng thái job quan trọng trong database, không chỉ trong memory.</li>
        <li>Đặt retry có giới hạn và đưa job lỗi vào dead-letter queue.</li>
        <li>Log job id, attempt, duration và lỗi cuối cùng.</li>
      </ul>

      <h2>Rate limit với Redis</h2>
      <p>Redis phù hợp rate limit vì thao tác tăng bộ đếm rất nhanh và có TTL. Endpoint login, comment, contact, search và upload nên có giới hạn riêng. Với hệ thống nhiều instance, rate limit trong memory từng server không đủ nhất quán; Redis hoặc service gateway sẽ đáng tin hơn.</p>
      <pre><code class="language-text">key: rate:contact:ip:203.0.113.10
value: 4
ttl: 600 seconds
</code></pre>

      <h2>Khi nào không nên dùng Redis?</h2>
      <p>Đừng dùng Redis để che query database chưa có index. Trước tiên hãy đo bằng query plan, thêm index đúng và tối ưu schema. Đừng dùng Redis làm source of truth cho dữ liệu cần bền vững nếu bạn chưa cấu hình persistence, backup và recovery. Đừng đưa toàn bộ domain logic vào cache layer khiến hệ thống khó hiểu.</p>

      <h2>Checklist Redis production</h2>
      <ul>
        <li>Key naming có namespace, tenant/user scope khi cần.</li>
        <li>TTL có jitter cho key nóng để giảm stampede.</li>
        <li>Invalidation chạy ở luồng ghi dữ liệu quan trọng.</li>
        <li>Không cache dữ liệu nhạy cảm nếu không có kiểm soát scope và mã hóa phù hợp.</li>
        <li>Queue job có idempotency, retry limit và dead-letter queue.</li>
        <li>Monitoring có memory usage, hit rate, evictions, latency và connected clients.</li>
        <li>Redis được bảo vệ network, auth và backup nếu chứa dữ liệu quan trọng.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://redis.io/docs/latest/develop/">Redis Docs: Develop with Redis</a></li>
        <li><a href="https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/">Redis Docs: Benchmarks and latency</a></li>
        <li><a href="https://docs.bullmq.io/">BullMQ Docs</a></li>
      </ul>
    `,
    excerpt: 'Redis cache và queue cho backend: cache-aside, TTL, invalidation, cache stampede, idempotent jobs, rate limit và checklist production.',
    featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=700&fit=crop',
    seo_title: 'Redis cache và queue cho backend',
    seo_description: 'Hướng dẫn Redis cache và queue: cache-aside, TTL, invalidation, stampede, idempotent jobs và rate limit.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Backend',
    tags: ['redis', 'cache', 'queue', 'backend'],
    published_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T10:00:00+07:00'),
    view_count: 0,
  },
  {
    id: '10000000-0000-4000-8000-000000000018',
    title: 'Zero Trust cho web app: IAM, secret rotation, audit log và least privilege',
    slug: 'zero-trust-web-app-iam-secret-rotation-audit-log-least-privilege',
    content: `
      <h2>Zero Trust là tư duy thiết kế quyền</h2>
      <p>Zero Trust không có nghĩa là mua một sản phẩm bảo mật rồi xong. Nó là cách thiết kế hệ thống với giả định mạng nội bộ, user, service và token đều có thể bị lạm dụng. Vì vậy mỗi request cần được xác thực, phân quyền, giới hạn phạm vi và ghi nhận đủ dấu vết để điều tra.</p>
      <p>Với web app nhỏ, Zero Trust thực dụng bắt đầu từ các việc rất cụ thể: cookie an toàn, admin route có auth thật, API không trả thừa field, service key không nằm trong client, secret được xoay vòng và database policy giới hạn đúng quyền.</p>

      <h2>Authentication chưa đủ nếu authorization yếu</h2>
      <p>Authentication trả lời user là ai. Authorization trả lời user được làm gì trên tài nguyên nào. Lỗi phổ biến trong API là chỉ kiểm tra đăng nhập rồi cho phép sửa tài nguyên bằng id bất kỳ. Đây là dạng broken object level authorization, một rủi ro lớn trong API hiện đại.</p>
      <pre><code class="language-ts">if (invoice.ownerId !== session.userId && !session.roles.includes('admin')) {
  return forbidden();
}
</code></pre>
      <p>Authorization nên nằm ở server, không dựa vào việc ẩn button trên frontend. UI chỉ cải thiện trải nghiệm; server mới là ranh giới bảo mật.</p>

      <h2>Least privilege cho user, service và database</h2>
      <p>Mỗi credential chỉ nên có quyền tối thiểu cần thiết. Public frontend dùng anon key hoặc publishable key với RLS chặt. Server admin dùng service role nhưng chỉ ở server. CI/CD chỉ có quyền deploy đúng project. Database user runtime không nên có quyền drop schema nếu app chỉ cần đọc/ghi bảng nghiệp vụ.</p>
      <ul>
        <li>Public API select rõ field public, không <code>select *</code> nếu có dữ liệu nhạy cảm.</li>
        <li>Admin API kiểm tra session hoặc key ở server và dùng SameSite cookie.</li>
        <li>Service role key không bao giờ xuất hiện trong JavaScript gửi ra browser.</li>
        <li>Storage bucket tách public asset và private upload.</li>
      </ul>

      <h2>Secret rotation cần có quy trình</h2>
      <p>Secret bị lộ thường không báo trước. Hãy chuẩn bị cách xoay vòng API key, admin key, webhook secret và database password mà không downtime. Với key quan trọng, dùng dual-key rollout: thêm key mới, deploy app đọc key mới, xác nhận traffic ổn, rồi revoke key cũ.</p>
      <p>Secret không nên nằm trong Git, Docker image, log, analytics event hoặc client bundle. Nếu lỡ commit secret, xóa commit chưa đủ; bạn phải revoke secret vì lịch sử có thể đã bị clone.</p>

      <h2>Audit log giúp điều tra và răn đe</h2>
      <p>Admin dashboard cần biết ai đã approve comment, sửa bài, xóa tin nhắn hoặc đổi cấu hình. Audit log nên ghi actor, action, resource, timestamp, IP hoặc user agent khi phù hợp. Không cần log mọi thứ ngay từ đầu, nhưng các thao tác phá hủy hoặc liên quan dữ liệu user nên có dấu vết.</p>

      <h2>Phòng thủ các tấn công phổ biến</h2>
      <ul>
        <li><strong>XSS:</strong> sanitize HTML, escape output, dùng CSP và tránh render nội dung user tùy tiện.</li>
        <li><strong>CSRF:</strong> SameSite cookie, kiểm tra Origin/Sec-Fetch-Site và token nếu form rủi ro cao.</li>
        <li><strong>Brute force:</strong> rate limit login/contact/comment và cảnh báo bất thường.</li>
        <li><strong>IDOR/BOLA:</strong> kiểm tra quyền theo từng object ở server.</li>
        <li><strong>Data leakage:</strong> public API chỉ trả field cần thiết và không lộ email comment.</li>
      </ul>

      <h2>Checklist Zero Trust cho web app</h2>
      <ul>
        <li>Mọi write endpoint có auth, authorization và validation.</li>
        <li>Cookie admin có HttpOnly, Secure ở production và SameSite phù hợp.</li>
        <li>Secret có owner, nơi lưu, ngày xoay vòng và quy trình revoke.</li>
        <li>Public response được giảm field nhạy cảm.</li>
        <li>Database RLS hoặc policy tương đương được kiểm thử.</li>
        <li>Admin action quan trọng có audit trail.</li>
        <li>Security headers gồm CSP, X-Frame-Options, nosniff và Referrer-Policy.</li>
      </ul>

      <h2>Nguồn tham khảo chính</h2>
      <ul>
        <li><a href="https://owasp.org/API-Security/editions/2023/en/0x00-header/">OWASP API Security Top 10 2023</a></li>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html">OWASP CSRF Prevention Cheat Sheet</a></li>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html">OWASP XSS Prevention Cheat Sheet</a></li>
      </ul>
    `,
    excerpt: 'Zero Trust cho web app: IAM, authorization, least privilege, secret rotation, audit log, RLS và phòng thủ XSS/CSRF/BOLA.',
    featured_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=700&fit=crop',
    seo_title: 'Zero Trust cho web app: IAM và secret',
    seo_description: 'Hướng dẫn Zero Trust cho web app: IAM, least privilege, secret rotation, audit log, RLS và phòng thủ XSS/CSRF.',
    canonical_url: null,
    noindex: false,
    author_id: defaultAuthorId,
    category: 'Security',
    tags: ['security', 'zero-trust', 'iam', 'secrets'],
    published_at: toIsoDate('2026-04-26T11:00:00+07:00'),
    created_at: toIsoDate('2026-04-26T11:00:00+07:00'),
    updated_at: toIsoDate('2026-04-26T11:00:00+07:00'),
    view_count: 0,
  },
];
