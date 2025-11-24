---
'slug': '/use-cases/observability/clickstack/production'
'title': '프로덕션으로 가기'
'sidebar_label': '프로덕션'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack과 함께 프로덕션으로 가기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'production'
- 'deployment'
- 'best practices'
- 'operations'
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';

When deploying ClickStack in production, there are several additional considerations to ensure security, stability, and correct configuration.

## Network and port security {#network-security}

기본적으로, Docker Compose는 호스트에서 포트를 노출시켜 컨테이너 외부에서 접근할 수 있도록 만듭니다. 이는 `ufw` (Uncomplicated Firewall)와 같은 도구가 활성화되어 있어도 마찬가지입니다. 이러한 동작은 Docker 네트워킹 스택 때문이며, 명시적으로 구성되지 않는 한 호스트 수준의 방화벽 규칙을 우회할 수 있습니다.

**권장 사항:**

생산용으로 필요한 포트만 노출하세요. 일반적으로 OTLP 엔드포인트, API 서버 및 프론트엔드입니다.

예를 들어, `docker-compose.yml` 파일에서 불필요한 포트 매핑을 제거하거나 주석 처리하세요:

```yaml
ports:
  - "4317:4317"  # OTLP gRPC
  - "4318:4318"  # OTLP HTTP
  - "8080:8080"  # Only if needed for the API

# Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
```

컨테이너를 격리하고 접근을 강화하는 방법에 대한 자세한 내용은 [Docker 네트워킹 문서](https://docs.docker.com/network/)를 참조하세요.

## Session secret configuration {#session-secret}

프로덕션에서는 세션 데이터를 보호하고 변조를 방지하기 위해 `EXPRESS_SESSION_SECRET` 환경 변수에 강력하고 무작위 값을 설정해야 합니다.

다음은 앱 서비스의 `docker-compose.yml` 파일에 추가하는 방법입니다:

```yaml
app:
  image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
  ports:
    - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
    - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
  environment:
    FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
    HYPERDX_API_KEY: ${HYPERDX_API_KEY}
    HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
    HYPERDX_APP_URL: ${HYPERDX_APP_URL}
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    MINER_API_URL: 'http://miner:5123'
    MONGO_URI: 'mongodb://db:27017/hyperdx'
    NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
    OTEL_SERVICE_NAME: 'hdx-oss-api'
    USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
    EXPRESS_SESSION_SECRET: "super-secure-random-string"
  networks:
    - internal
  depends_on:
    - ch-server
    - db1
```

강력한 비밀을 생성하려면 openssl을 사용할 수 있습니다:

```shell
openssl rand -hex 32
```

비밀을 소스 제어에 커밋하지 마세요. 프로덕션에서는 환경 변수 관리 도구(예: Docker Secrets, HashiCorp Vault 또는 환경별 CI/CD 설정)를 사용하는 것을 고려하세요.

## Secure ingestion {#secure-ingestion}

모든 수집은 ClickStack 배포의 OpenTelemetry (OTel) 수집기가 노출하는 OTLP 포트를 통해 이루어져야 합니다. 기본적으로, 이는 시작 시 생성된 보안 수집 API 키가 필요합니다. 이 키는 OTel 포트에 데이터를 전송할 때 필요하며, HyperDX UI의 `팀 설정 → API 키`에서 찾을 수 있습니다.

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

또한, OTLP 엔드포인트에 대해 TLS를 활성화하고 [ClickHouse 수집을 위한 전용 사용자 생성](#database-ingestion-user)을 권장합니다.

## ClickHouse {#clickhouse}

프로덕션 배포를 위해, [ClickHouse Cloud](https://clickhouse.com/cloud)를 사용하는 것을 권장합니다. 이는 업계 표준의 [보안 관행](/cloud/security)을 기본으로 적용하여 강화된 암호화, 인증 및 연결, 관리되는 접근 제어를 포함합니다. ClickHouse Cloud를 활용한 모범 사례의 단계별 가이드는 ["ClickHouse Cloud"](#clickhouse-cloud-production)를 참조하세요.

### User permissions {#user-permissions}

#### HyperDX user {#hyperdx-user}

HyperDX를 위한 ClickHouse 사용자는 다음 설정을 변경할 수 있는 `readonly` 사용자만 필요합니다:

- `max_rows_to_read` (최소 100만 행)
- `read_overflow_mode`
- `cancel_http_readonly_queries_on_client_close`
- `wait_end_of_query`

기본적으로 OSS와 ClickHouse Cloud의 `default` 사용자는 이러한 권한을 가집니다. 그러나 이러한 권한이 있는 새 사용자를 생성하는 것이 좋습니다.

#### Database and ingestion user {#database-ingestion-user}

OTel 수집용으로 ClickHouse에 데이터를 수집하기 위한 전용 사용자를 생성하고 특정 데이터베이스(예: `otel`)로 수집이 전송되도록 보장하는 것을 권장합니다. 자세한 내용은 ["수집 사용자 생성"](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)를 참조하세요.

### Self-managed security {#self-managed-security}

자체 ClickHouse 인스턴스를 관리하는 경우, **SSL/TLS**를 활성화하고 인증을 강제하며 접근을 강화하기 위한 모범 사례를 따르는 것이 필수적입니다. 실제 구성 오류에 대한 맥락과 이를 피하는 방법에 대해서는 [이 블로그 게시물](https://www.wiz.io/blog/clickhouse-and-wiz)을 참조하세요.

ClickHouse OSS는 기본적으로 강력한 보안 기능을 제공합니다. 그러나 이러한 기능은 구성이 필요합니다:

- **SSL/TLS 사용**: `tcp_port_secure` 및 `config.xml`의 `<openSSL>`을 통해. [가이드/설정/SSL 구성](/guides/sre/configuring-ssl) 참조.
- **default 사용자에 대해 강력한 비밀번호 설정** 또는 비밀번호를 비활성화합니다.
- **ClickHouse를 외부에 노출하는 것을 피하십시오**: 의도적으로 설정하지 않는 이상, ClickHouse는 기본적으로 `localhost`에만 바인딩됩니다.
- **비밀번호, 인증서, SSH 키 또는 [외부 인증자](/operations/external-authenticators)와 같은 인증 방법 사용**.
- **IP 필터링 및 `HOST` 절을 사용하여 접근 제한**. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host) 참조.
- **세분화된 권한 부여를 위해 역할 기반 접근 제어 (RBAC) 활성화**. [operations/access-rights](/operations/access-rights) 참조.
- **쿼터 및 제한을 강제**: [쿼터](/operations/quotas), [설정 프로필](/operations/settings/settings-profiles) 및 읽기 전용 모드를 사용합니다.
- **휴지 데이터 암호화 및 안전한 외부 저장소 사용**. [operations/storing-data](/operations/storing-data) 및 [cloud/security/CMEK](/cloud/security/cmek) 참조.
- **자격 증명을 하드 코딩하지 마십시오**. ClickHouse Cloud에서 [명명된 컬렉션](/operations/named-collections) 또는 IAM 역할을 사용하세요.
- **접근 및 쿼리 감사**: [system logs](/operations/system-tables/query_log) 및 [session logs](/operations/system-tables/session_log)을 사용합니다.

사용자를 관리하고 쿼리/리소스 제한을 보장하기 위해 [외부 인증자](/operations/external-authenticators)와 [쿼리 복잡성 설정](/operations/settings/query-complexity)도 참조하세요.

### Configure Time To Live (TTL) {#configure-ttl}

ClickStack 배포에 대해 [TTL (Time To Live)](/use-cases/observability/clickstack/ttl)가 [적절하게 구성되었는지](/use-cases/observability/clickstack/ttl#modifying-ttl) 확인하세요. 이는 데이터 보존 기간을 제어합니다 - 기본값 3일은 종종 수정이 필요합니다.

## MongoDB guidelines {#mongodb-guidelines}

공식 [MongoDB 보안 체크리스트](https://www.mongodb.com/docs/manual/administration/security-checklist/)를 따르세요.

## ClickHouse Cloud {#clickhouse-cloud-production}

다음은 ClickHouse Cloud를 사용한 ClickStack의 간단한 배포로, 모범 사례를 충족합니다.

<VerticalStepper headerLevel="h3">

### Create a service {#create-a-service}

서비스를 생성하기 위해 [ClickHouse Cloud 시작 가이드](/getting-started/quick-start/cloud/#1-create-a-clickhouse-service)를 따르세요.

### Copy connection details {#copy-connection-details}

HyperDX의 연결 세부정보를 찾으려면 ClickHouse Cloud 콘솔로 이동하여 사이드바에서 <b>연결</b> 버튼을 클릭하고 HTTP 연결 세부정보, 특히 URL을 기록하세요.

**이 단계에서 표시된 기본 사용자 이름 및 비밀번호를 사용하여 HyperDX에 연결할 수 있지만 전용 사용자를 생성하는 것을 권장합니다 - 아래를 참조하세요**

<Image img={connect_cloud} alt="Connect Cloud" size="md" background/>

### Create a HyperDX user {#create-a-user}

HyperDX를 위한 전용 사용자를 생성하는 것을 권장합니다. 다음 SQL 명령을 [Cloud SQL 콘솔](/cloud/get-started/sql-console)에서 실행하며, 복잡성 요구 사항에 맞는 안전한 비밀번호를 제공합니다:

```sql
CREATE USER hyperdx IDENTIFIED WITH sha256_password BY '<YOUR_PASSWORD>' SETTINGS PROFILE 'readonly';
GRANT sql_console_read_only TO hyperdx;
```

### Prepare for ingestion user {#prepare-for-ingestion}

데이터를 위한 `otel` 데이터베이스와 제한된 권한을 가진 `hyperdx_ingest` 사용자를 생성하세요.

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

### Deploy ClickStack {#deploy-clickstack}

ClickStack을 배포합니다 - [Helm](/use-cases/observability/clickstack/deployment/helm) 또는 [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)(ClickHouse를 제외하도록 수정된)이 선호됩니다. 

:::note 구성 요소를 별도로 배포
고급 사용자는 [OTel 수집기](/use-cases/observability/clickstack/ingesting-data/opentelemetry#standalone)와 [HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only)를 각자의 독립적 배포 모드로 별도로 배포할 수 있습니다.
:::

ClickHouse Cloud와 함께 Helm 차트를 사용하는 방법에 대한 지침은 [여기](https://use-cases/observability/clickstack/deployment/helm#using-clickhouse-cloud)에서 찾을 수 있습니다. Docker Compose에 대한 동등한 지침은 [여기](https://use-cases/observability/clickstack/deployment/docker-compose)에서 찾을 수 있습니다.

### Navigate to the HyperDX UI {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)로 이동하여 HyperDX UI에 접속하세요.

사용자를 생성하고 요구 사항에 맞는 사용자 이름 및 비밀번호를 제공합니다.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

`생성`을 클릭하면 연결 세부정보 입력을 요청받습니다.

### Connect to ClickHouse Cloud {#connect-to-clickhouse-cloud}

이전에 생성한 자격 증명을 사용하여 연결 세부정보를 완성하고 `생성`을 클릭하세요.

<Image img={hyperdx_cloud} alt="HyperDX Cloud" size="md"/>

### Send data to ClickStack {#send-data}

ClickStack으로 데이터를 보내려면 ["OpenTelemetry 데이터 보내기"](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)를 참조하세요.

</VerticalStepper>
