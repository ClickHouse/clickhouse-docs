---
slug: /use-cases/observability/clickstack/production
title: '운영 환경으로 이전하기'
sidebar_label: '운영 환경'
pagination_prev: null
pagination_next: null
description: 'ClickStack를 운영 환경에 배포하기'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', '운영 환경', '배포', '모범 사례', '운영']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

운영 환경에 ClickStack을 배포할 때는 보안, 안정성 및 올바른 구성을 보장하기 위해 추가로 고려해야 할 사항이 있습니다. 이러한 사항은 사용 중인 배포판이 오픈 소스인지 관리형인지에 따라 달라집니다.

<Tabs groupId="architectures">
  <TabItem value="managed-clickstack" label="관리형 ClickStack" default>
    프로덕션 배포에서는 [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed)을 사용하는 것이 권장됩니다. 기본적으로 업계 표준 [보안 모범 사례](/cloud/security)를 적용하며, 강화된 암호화, 인증 및 연결, 관리형 액세스 제어를 포함하고, 다음과 같은 이점을 제공합니다:

    * 스토리지와 독립적인 컴퓨트의 자동 확장
    * 객체 스토리지를 기반으로 한 저비용의 사실상 무제한 보존
    * Warehouse를 사용해 읽기 및 쓰기 워크로드를 독립적으로 격리하는 기능
    * 통합된 인증
    * 자동화된 [백업](/cloud/features/backups)
    * 끊김 없는 업그레이드

    **Managed ClickStack를 사용할 때에는 ClickHouse Cloud에 대한 다음 [모범 사례](/cloud/guides/production-readiness)를 따르십시오.**

    ### 수집 보안 \{#secure-ingestion-managed\}

    기본적으로 ClickStack OpenTelemetry Collector는 오픈 소스 배포판 외부에 배포될 때 보안이 적용되지 않으며, OTLP 포트에서 인증을 요구하지 않습니다.

    수집을 보호하려면 `OTLP_AUTH_TOKEN` 환경 변수를 사용하여 collector를 배포할 때 인증 토큰을 지정하십시오. 자세한 내용은 [「Securing the collector」](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)를 참조하십시오.

    #### 수집 전용 사용자 생성 \{#create-a-database-ingestion-user-managed\}

    Managed ClickHouse로의 수집을 위해 OTel collector 전용 사용자를 생성하고, 수집이 `otel`과 같은 특정 데이터베이스로 전송되도록 하는 것이 좋습니다. 자세한 내용은 [「Creating an ingestion user」](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)를 참조하십시오.

    ### Time To Live (TTL) 구성 \{#configure-ttl-managed\}

    Managed ClickStack 배포에 대해 [Time To Live (TTL)](/use-cases/observability/clickstack/ttl)이 [적절히 구성](/use-cases/observability/clickstack/ttl#modifying-ttl)되어 있는지 확인하십시오. 이는 데이터가 얼마나 오래 보존되는지를 제어하며, 기본값인 3일은 종종 변경이 필요합니다.

    ### 리소스 추정 \{#estimating-resources\}

    **Managed ClickStack**를 배포할 때에는 수집 및 쿼리 워크로드를 모두 처리할 수 있도록 충분한 컴퓨트 리소스를 프로비저닝하는 것이 중요합니다. 아래의 추정치는 수집하려는 관측성 데이터 볼륨에 따라 **기본 시작점**을 제공합니다.

    다음과 같은 가정을 기반으로 권장 사항이 제시됩니다:

    * 데이터 볼륨은 월별 **비압축 수집 볼륨**을 의미하며, 로그와 트레이스 모두에 적용됩니다.
    * 쿼리 패턴은 관측성 사용 사례에서 일반적인 형태로, 대부분의 쿼리는 보통 최근 24시간과 같은 **최신 데이터**를 대상으로 합니다.
    * 수집은 **월 전체에 비교적 균등하게** 이루어진다고 가정합니다. 버스트 트래픽 또는 스파이크가 예상되는 경우, 추가 여유 용량을 프로비저닝해야 합니다.
    * 스토리지는 ClickHouse Cloud 객체 스토리지를 통해 별도로 처리되며, 보존의 제한 요소가 되지 않는다고 가정합니다. 장기간 보존되는 데이터는 자주 액세스되지 않는다고 가정합니다.

    더 긴 기간을 정기적으로 조회하는 액세스 패턴, 무거운 집계를 수행하는 쿼리, 또는 많은 수의 동시 사용자를 지원해야 하는 경우에는 더 많은 컴퓨트가 필요할 수 있습니다.

    #### 권장 기본 사이징 \{#recommended-sizing\}

    | 월별 수집 볼륨           | 권장 컴퓨트               |
    | ------------------ | -------------------- |
    | &lt; 10 TB / month | 2 vCPU × 3 replicas  |
    | 10–50 TB / month   | 4 vCPU × 3 replicas  |
    | 50–100 TB / month  | 8 vCPU × 3 replicas  |
    | 100–500 TB / month | 30 vCPU × 3 replicas |
    | 1 PB+ / month      | 59 vCPU × 3 replicas |

    :::note
    이 값들은 **추정치일 뿐**이며 초기 기준선으로 사용해야 합니다. 실제 요구 사항은 쿼리 복잡도, 동시성, 보존 정책, 수집 처리량의 변동에 따라 달라집니다. 항상 리소스 사용량을 모니터링하고, 필요에 따라 확장하십시오.
    :::

    #### 관측성 워크로드 격리 \{#isolating-workloads\}

    이미 실시간 애플리케이션 분석 등 다른 워크로드를 지원하는 **기존 ClickHouse Cloud 서비스**에 ClickStack을 추가하는 경우, 관측성 트래픽을 격리하는 것이 강력히 권장됩니다.

    [**Managed Warehouses**](/cloud/reference/warehouses)를 사용하여 ClickStack 전용 **하위 서비스**를 생성하십시오. 이를 통해 다음을 수행할 수 있습니다:

    * 기존 애플리케이션으로부터 수집 및 쿼리 부하를 격리
    * 관측성 워크로드를 독립적으로 확장
    * 관측성 쿼리가 프로덕션 분석에 영향을 주지 않도록 방지
    * 필요한 경우 여러 서비스에서 동일한 기반 데이터셋을 공유

    이 접근 방식은 ClickStack이 관측성 데이터 증가에 따라 독립적으로 확장되도록 하면서, 기존 워크로드가 영향을 받지 않도록 보장합니다.

    대규모 배포 또는 맞춤형 사이징 가이드가 필요한 경우, 보다 정확한 추정을 위해 지원팀에 문의하십시오.
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 오픈소스">
    ### 네트워크 및 포트 보안 \{#network-security\}

    기본적으로 Docker Compose는 호스트에서 포트를 노출하여 컨테이너 외부에서 접근 가능하도록 합니다. `ufw`(Uncomplicated Firewall)와 같은 도구가 활성화되어 있는 경우에도 마찬가지입니다. 이는 Docker 네트워킹 스택이 명시적으로 구성되지 않는 한 호스트 수준의 방화벽 규칙을 우회할 수 있기 때문입니다.

    **권장사항:**

    프로덕션 사용에 필요한 포트만 노출하세요. 일반적으로 OTLP 엔드포인트, API 서버, 프론트엔드가 해당됩니다.

    예를 들어 `docker-compose.yml` 파일에서 불필요한 포트 매핑을 제거하거나 주석 처리하세요:

    ```yaml
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
      - "8080:8080"  # Only if needed for the API
    # Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
    ```

    컨테이너 격리 및 액세스 강화에 대한 자세한 내용은 [Docker 네트워킹 문서](https://docs.docker.com/network/)를 참조하세요.

    ### 세션 시크릿 설정 \{#session-secret\}

    프로덕션 환경에서는 세션 데이터를 보호하고 변조를 방지하기 위해 ClickStack UI(HyperDX)의 `EXPRESS_SESSION_SECRET` 환경 변수에 강력하고 무작위한 값을 설정해야 합니다.

    앱 서비스의 `docker-compose.yml` 파일에 추가하는 방법은 다음과 같습니다:

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

    `openssl`을 사용하여 강력한 시크릿을 생성하세요:

    ```shell
    openssl rand -hex 32
    ```

    시크릿을 소스 제어에 커밋하지 마십시오. 프로덕션 환경에서는 환경 변수 관리 도구(예: Docker Secrets, HashiCorp Vault 또는 환경별 CI/CD 구성)를 사용하십시오.

    ### 안전한 수집 \{#secure-ingestion\}

    모든 수집은 ClickStack 배포판의 OpenTelemetry(OTel) collector가 노출하는 OTLP 포트를 통해 이루어져야 합니다. 기본적으로 시작 시 생성되는 보안 수집 API key가 필요합니다. 이 키는 OTel 포트로 데이터를 전송할 때 필요하며, HyperDX UI의 「Team Settings → API Keys」에서 확인할 수 있습니다.

    <Image img={ingestion_key} alt="수집 키" size="lg" />

    또한 OTLP 엔드포인트에 대해 TLS를 활성화하는 것을 권장합니다.

    #### 수집 사용자 생성하기 \{#create-a-database-ingestion-user-oss\}

    ClickHouse로 데이터를 수집하기 위해 OTel collector 전용 사용자를 생성하고, 수집된 데이터가 특정 데이터베이스(예: `otel`)로 전송되도록 설정하는 것을 권장합니다. 자세한 내용은 [&quot;수집 사용자 생성&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)을 참조하세요.

    ### ClickHouse \{#clickhouse\}

    자체 ClickHouse 인스턴스를 관리하는 경우 다음 모범 사례를 준수하십시오.

    #### 보안 모범 사례 \{#self-managed-security\}

    자체 ClickHouse 인스턴스를 관리하는 경우, **TLS**를 활성화하고 인증을 강제하며 접근 강화를 위한 모범 사례를 따르는 것이 필수입니다. 실제 잘못된 구성 사례와 이를 방지하는 방법에 대한 내용은 [이 블로그 게시물](https://www.wiz.io/blog/clickhouse-and-wiz)을 참조하세요.

    ClickHouse OSS는 기본적으로 강력한 보안 기능을 제공합니다. 하지만 이를 사용하려면 구성이 필요합니다:

    * `tcp_port_secure` 및 `config.xml`의 `<openSSL>`을 통해 **TLS를 사용**하십시오. 자세한 내용은 [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls)를 참조하십시오.
    * `default` 사용자에 대해 **강력한 비밀번호를 설정**하거나 비활성화하십시오.
    * **명시적으로 그렇게 설정하려는 경우가 아니라면 ClickHouse를 외부에서 접근 가능하도록 노출하지 마십시오.** 기본적으로 ClickHouse는 `listen_host`를 수정하지 않는 한 `localhost`에만 바인딩합니다.
    * 비밀번호, 인증서, SSH 키 또는 [외부 인증자(external authenticators)](/operations/external-authenticators)와 같은 **인증 방법을 사용하십시오**.
    * IP 필터링과 `HOST` 절을 사용하여 **접근을 제한**합니다. [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)를 참고하십시오.
    * **역할 기반 접근 제어(Role-Based Access Control, RBAC)를 활성화**하여 세분화된 권한을 설정합니다. [operations/access-rights](/operations/access-rights)를 참고하십시오.
    * **쿼터와 제한을 강제 적용**하기 위해 [쿼터](/operations/quotas), [설정 프로필](/operations/settings/settings-profiles), 그리고 읽기 전용 모드를 사용합니다.
    * **저장 데이터 암호화**를 적용하고 안전한 외부 스토리지를 사용하십시오. 자세한 내용은 [operations/storing-data](/operations/storing-data) 및 [cloud/security/CMEK](/cloud/security/cmek)를 참조하십시오.
    * **자격 증명을 하드코딩하지 마십시오.** [named collections](/operations/named-collections) 또는 ClickHouse Cloud의 IAM 역할을 사용하십시오.
    * **액세스 및 쿼리를 감사**할 때 [system logs](/operations/system-tables/query_log) 및 [session logs](/operations/system-tables/session_log)를 사용하십시오.

    사용자 관리 및 쿼리/리소스 제한 설정에 대한 자세한 내용은 [외부 인증자](/operations/external-authenticators) 및 [쿼리 복잡도 설정](/operations/settings/query-complexity)을 참조하세요.

    #### ClickStack UI에 대한 사용자 권한 \{#user-permissions\}

    ClickStack UI용 ClickHouse 사용자는 다음 설정을 변경할 수 있는 권한을 가진 `readonly` 사용자면 충분합니다:

    * `max_rows_to_read` (최소 100만 행 이상으로)
    * `read_overflow_mode`
    * `cancel_http_readonly_queries_on_client_close`
    * `wait_end_of_query`

    기본적으로 OSS와 ClickHouse Cloud 모두에서 `default` 사용자가 이러한 권한을 보유하고 있으나, 해당 권한을 가진 새로운 사용자를 생성하시기를 권장합니다.

    ### TTL(Time To Live) 구성 \{#configure-ttl\}

    ClickStack 배포에 대해 [TTL(Time To Live)](/use-cases/observability/clickstack/ttl)이 [적절하게 구성](/use-cases/observability/clickstack/ttl#modifying-ttl)되어 있는지 확인하십시오. TTL은 데이터 보관 기간을 제어하며, 기본값 3일은 대부분의 경우 수정이 필요합니다.

    ### MongoDB 가이드라인 \{#mongodb-guidelines\}

    공식 [MongoDB 보안 체크리스트](https://www.mongodb.com/docs/manual/administration/security-checklist/)를 참고하십시오.
  </TabItem>
</Tabs>