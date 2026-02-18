import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/advanced_otel_collector.png';
import vector_config from '@site/static/images/clickstack/getting-started/vector_config.png';
import ExampleOTelConfig from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={start_ingestion} size="lg" alt="수집 시작" border />

「Start Ingestion」을 선택하면 수집 소스를 선택하라는 메시지가 표시됩니다. Managed ClickStack은 주요 수집 소스로 OpenTelemetry와 [Vector](https://vector.dev/)를 지원합니다. 또한 사용자는 [ClickHouse Cloud support integrations](/integrations)를 사용해 자체 스키마로 데이터를 ClickHouse에 직접 전송할 수도 있습니다.

<Image img={select_source} size="lg" alt="소스 선택" border />

:::note[OpenTelemetry 권장]
수집 포맷으로 OpenTelemetry를 사용하는 것을 강력히 권장합니다.
가장 간단하고 최적화된 사용 경험을 제공하며, ClickStack과 효율적으로 동작하도록 특별히 설계된 기본 제공 스키마를 제공합니다.
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="OpenTelemetry" label="OpenTelemetry" default>
    Managed ClickStack로 OpenTelemetry 데이터를 보내기 위해서는 OpenTelemetry Collector 사용이 권장됩니다. Collector는 애플리케이션(및 다른 collector)에서 OpenTelemetry 데이터를 수신하고 이를 ClickHouse Cloud로 전달하는 게이트웨이 역할을 합니다.

    Collector가 이미 실행 중이 아니라면 아래 단계를 따라 collector를 시작하십시오. 이미 collector가 있는 경우를 위해 구성 예제도 제공됩니다.

    ### Collector 시작 \{#start-a-collector\}

    다음 내용은 **OpenTelemetry Collector의 ClickStack 배포판** 사용을 권장하는 경로를 전제로 합니다. 이 배포판에는 추가 처리 기능이 포함되어 있으며 ClickHouse Cloud에 특화되어 최적화되어 있습니다. 자체 OpenTelemetry Collector를 사용하려는 경우 [&quot;기존 collector 구성&quot;](#configure-existing-collectors)을 참고하십시오.

    빠르게 시작하려면 표시된 Docker 명령을 복사하여 실행하십시오.

    <Image img={otel_collector_start} size="md" alt="OTel collector 소스" />

    이 명령에는 연결 자격 증명이 미리 채워져 있어야 합니다.

    :::note[프로덕션 배포]
    이 명령은 Managed ClickStack에 연결하기 위해 `default` 사용자를 사용하지만, [프로덕션으로 전환](/use-cases/observability/clickstack/production#create-a-user)할 때는 전용 사용자를 생성하고 구성을 수정하는 것이 좋습니다.
    :::

    이 단일 명령을 실행하면 OTLP 엔드포인트를 포트 4317(gRPC)과 4318(HTTP)에 노출하는 ClickStack collector가 시작됩니다. 이미 OpenTelemetry 계측 및 에이전트가 있다면, 즉시 이 엔드포인트로 텔레메트리 데이터를 전송할 수 있습니다.

    ### 기존 collector 구성 \{#configure-existing-collectors\}

    기존 OpenTelemetry Collector를 구성하거나 자체 배포판을 사용하는 것도 가능합니다.

    :::note[ClickHouse exporter 필요]
    예를 들어 [contrib 이미지](https://github.com/open-telemetry/opentelemetry-collector-contrib)와 같은 자체 배포판을 사용하는 경우, 해당 이미지에 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)가 포함되어 있는지 확인하십시오.
    :::

    이를 위해 ClickHouse exporter를 적절한 설정과 함께 사용하고 OTLP 리시버를 노출하는 예제 OpenTelemetry Collector 구성이 제공됩니다. 이 구성은 ClickStack 배포판에서 기대하는 인터페이스와 동작에 맞춰져 있습니다.

    <ExampleOTelConfig />

    <Image img={advanced_otel_collector} size="lg" alt="고급 OTel collector 소스" border />

    OpenTelemetry collector 구성에 대한 자세한 내용은 [&quot;OpenTelemetry를 사용한 수집&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참고하십시오.

    ### 수집 시작(선택 사항) \{#start-ingestion-create-new\}

    OpenTelemetry로 계측할 기존 애플리케이션이나 인프라가 있는 경우, UI에서 연결된 관련 가이드로 이동하십시오.

    애플리케이션을 계측하여 트레이스와 로그를 수집하려면, 데이터를 OpenTelemetry Collector로 전송하는 [지원 언어 SDKs](/use-cases/observability/clickstack/sdks)를 사용하십시오. 이 Collector는 Managed ClickStack으로의 수집을 위한 게이트웨이 역할을 합니다.

    로그는 에이전트 모드로 실행되며 동일한 collector로 데이터를 전달하는 [OpenTelemetry Collector를 사용해 수집](/use-cases/observability/clickstack/integrations/host-logs)할 수 있습니다. Kubernetes 모니터링의 경우 [전용 가이드](/use-cases/observability/clickstack/integrations/kubernetes)를 따르십시오. 다른 통합에 대해서는 [빠른 시작 가이드](/use-cases/observability/clickstack/integration-guides)를 참고하십시오.

    ### 데모 데이터 \{#demo-data\}

    또는 기존 데이터가 없다면 샘플 데이터셋 중 하나를 사용해 보십시오.

    * [예제 데이터셋](/use-cases/observability/clickstack/getting-started/sample-data) - 공개 데모에서 예제 데이터셋을 로드하여 간단한 문제를 진단해 보십시오.
    * [로컬 파일 및 메트릭](/use-cases/observability/clickstack/getting-started/local-data) - 로컬 OTel collector를 사용하여 OSX 또는 Linux에서 로컬 파일을 로드하고 시스템을 모니터링합니다.

    <br />
  </TabItem>

  <TabItem value="벡터" label="Vector" default>
    [Vector](https://vector.dev)는 고성능의 벤더 중립적 관측성(observability) 데이터 파이프라인으로, 유연성과 낮은 리소스 사용량 덕분에 특히 로그 수집(ingestion)에 많이 사용됩니다.

    Vector를 ClickStack과 함께 사용할 때는 사용자가 직접 스키마를 정의해야 합니다. 이 스키마는 OpenTelemetry 규약을 따를 수도 있지만, 사용자 정의 이벤트 구조를 표현하는 완전히 사용자 정의 스키마일 수도 있습니다.

    :::note 타임스탬프 필수
    Managed ClickStack에서 유일하게 엄격한 요구 사항은 데이터에 **타임스탬프 컬럼(timestamp column)**(또는 이에 상응하는 시간 필드)이 포함되어 있어야 한다는 점이며, 이는 ClickStack UI에서 데이터 소스를 구성할 때 선언할 수 있습니다.
    :::

    아래 내용에서는 Vector 인스턴스가 이미 실행 중이며, 수집 파이프라인이 사전에 구성되어 데이터를 전달하고 있다고 가정합니다.

    ### 데이터베이스와 테이블 생성 \{#create-database-and-tables\}

    Vector를 사용하려면 데이터 수집 전에 테이블과 스키마가 정의되어 있어야 합니다.

    먼저 데이터베이스를 생성합니다. 이는 [ClickHouse Cloud console](/cloud/get-started/sql-console)을 통해 수행할 수 있습니다.

    예를 들어, 로그용 데이터베이스를 생성합니다:

    ```sql
    CREATE DATABASE IF NOT EXISTS logs
    ```

    그런 다음 로그 데이터 구조에 맞는 스키마를 가진 테이블을 CREATE 합니다. 아래 예시는 일반적인 Nginx access log 형식을 가정합니다:

    ```sql
    CREATE TABLE logs.nginx_logs
    (
        `time_local` DateTime,
        `remote_addr` IPv4,
        `remote_user` LowCardinality(String),
        `request` String,
        `status` UInt16,
        `body_bytes_sent` UInt64,
        `http_referer` String,
        `http_user_agent` String,
        `http_x_forwarded_for` LowCardinality(String),
        `request_time` Float32,
        `upstream_response_time` Float32,
        `http_host` String
    )
    ENGINE = MergeTree
    ORDER BY (toStartOfMinute(time_local), status, remote_addr);
    ```

    테이블은 Vector가 생성하는 출력 스키마와 일치해야 합니다. 권장되는 [스키마 모범 사례](/docs/best-practices/select-data-types)를 참고하여 데이터에 맞게 스키마를 조정하십시오.

    ClickHouse에서 [Primary keys](/docs/primary-indexes)가 어떻게 동작하는지 이해하고, 액세스 패턴에 따라 정렬 키를 선택할 것을 강력히 권장합니다. 기본 키 선택에 대한 지침은 [ClickStack 전용](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) 가이드를 참고하십시오.

    테이블을 생성한 후 표시된 구성 스니펫을 복사하십시오. 필요한 경우 기존 파이프라인을 입력으로 사용하도록 조정하고, 대상 테이블과 데이터베이스를 수정하십시오. 자격 증명 정보는 미리 채워져 있어야 합니다.

    <Image img={vector_config} size="lg" alt="Vector 구성" />

    Vector로 데이터를 수집하는 추가 예시는 [&quot;Vector로 수집하기&quot;](/use-cases/observability/clickstack/ingesting-data/vector) 또는 고급 옵션을 위한 [Vector ClickHouse sink 문서](https://vector.dev/docs/reference/configuration/sinks/clickhouse/)를 참고하십시오.

    <br />
  </TabItem>
</Tabs>