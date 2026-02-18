---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: '관리형'
pagination_prev: null
pagination_next: null
sidebar_position: 1
toc_max_heading_level: 2
description: '관리형 ClickStack 배포'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import clickstack_ui_setup_ingestion from '@site/static/images/clickstack/clickstack-ui-setup-ingestion.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import select_source_clickstack_ui from '@site/static/images/clickstack/select-source-clickstack-ui.png';
import advanced_otel_collector_clickstack_ui from '@site/static/images/clickstack/advanced-otel-collector-clickstack-ui.png'
import otel_collector_start_clickstack_ui from '@site/static/images/clickstack/otel-collector-start-clickstack-ui.png';
import vector_config_clickstack_ui from '@site/static/images/clickstack/vector-config-clickstack-ui.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import JSONSupport from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import ExampleOTelConfig from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import SetupManagedIngestion from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import NavigateClickStackUI from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import ProviderSelection from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import new_service from '@site/static/images/clickstack/getting-started/new_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<BetaBadge />

::::note[베타 기능]
이 기능은 현재 ClickHouse Cloud 베타 단계에 있습니다.
::::

이 **가이드는 기존 ClickHouse Cloud 사용자**를 위한 것입니다. ClickHouse Cloud가 처음이라면, Managed ClickStack용 [시작하기](/use-cases/observability/clickstack/getting-started/managed) 가이드를 참고하기를 권장합니다.

이 배포 패턴에서는 ClickHouse와 ClickStack UI(HyperDX) 모두 ClickHouse Cloud에서 호스팅되며, 사용자가 자체적으로 호스팅해야 하는 구성 요소의 수를 최소화합니다.

인프라 관리 부담을 줄여 줄 뿐만 아니라, 이 배포 패턴은 인증이 ClickHouse Cloud SSO/SAML과 통합되도록 보장합니다. 셀프 호스팅 배포와 달리, 대시보드, 저장된 검색, 사용자 설정, 알림과 같은 애플리케이션 상태를 저장하기 위한 MongoDB 인스턴스를 프로비저닝할 필요도 없습니다. 또한 다음과 같은 이점이 있습니다.

* 스토리지와 독립적인 컴퓨트 리소스의 자동 확장
* 객체 스토리지를 기반으로 한 저비용의 사실상 무제한 보존 기간
* Warehouses를 사용하여 읽기 및 쓰기 워크로드를 서로 분리해 격리할 수 있는 기능
* 통합 인증
* 자동 백업
* 보안 및 규정 준수 기능
* 중단 없는 업그레이드

이 모드에서는 데이터 수집이 전적으로 사용자 책임입니다. 사용자가 호스팅하는 OpenTelemetry collector, 클라이언트 라이브러리에서의 직접 수집, Kafka 또는 S3와 같은 ClickHouse 네이티브 테이블 엔진, ETL 파이프라인, 또는 ClickHouse Cloud의 관리형 수집 서비스인 ClickPipes를 사용하여 Managed ClickStack으로 데이터를 수집할 수 있습니다. 이 방식은 ClickStack을 운영하기 위한 가장 단순하면서도 성능이 뛰어난 방법을 제공합니다.


### 적합한 경우 \{#suitable-for\}

이 배포 패턴은 다음과 같은 시나리오에 적합합니다.

1. 이미 ClickHouse Cloud에 관측성 데이터가 있으며, 이를 ClickStack을 사용해 시각화하고자 하는 경우.
2. 대규모 관측성 배포를 운영 중이며, ClickHouse Cloud에서 실행되는 ClickStack의 전용 성능과 확장성이 필요한 경우.
3. 이미 분석용으로 ClickHouse Cloud를 사용 중이며, ClickStack 계측 라이브러리를 사용해 애플리케이션을 계측하고 동일한 클러스터로 데이터를 전송하고자 하는 경우. 이때는 관측성 워크로드용 컴퓨트를 분리하기 위해 [warehouses](/cloud/reference/warehouses)를 사용할 것을 권장합니다.

## 설정 단계 \{#setup-steps\}

이 가이드는 이미 ClickHouse Cloud 서비스를 생성했다고 가정합니다. 아직 서비스를 생성하지 않았다면 Managed ClickStack용 [시작하기](/use-cases/observability/clickstack/getting-started/managed) 가이드를 따르십시오. 이 과정을 마치면 이 가이드와 동일한 상태, 즉 ClickStack이 활성화되어 관측성 데이터를 수집할 준비가 된 서비스가 생성됩니다.

<Tabs groupId="service-create-select">
  <TabItem value="CREATE" label="새 서비스를 생성하십시오." default>
    <br />

    <VerticalStepper headerLevel="h3">
      ### 새 서비스 생성

      ClickHouse Cloud 랜딩 페이지에서 `New service`를 선택하여 새 서비스를 생성합니다.

      <Image img={new_service} size="lg" alt="새 서비스" border />

      ### 프로바이더, 리전 및 리소스 지정

      <ProviderSelection />

      ### 수집 설정

      서비스가 프로비저닝 완료된 후 해당 서비스가 선택되어 있는지 확인한 다음, 왼쪽 메뉴에서 「ClickStack」을 클릭합니다.

      <SetupManagedIngestion />

      ### ClickStack UI로 이동

      <NavigateClickStackUI />

      <br />
    </VerticalStepper>
  </TabItem>

  <TabItem value="선택" label="기존 서비스 사용">
    <br />

    <VerticalStepper headerLevel="h3">
      ### 서비스를 선택하세요

      ClickHouse Cloud 랜딩 페이지에서 관리형 ClickStack을 활성화할 서비스를 선택하십시오.

      :::important 리소스 예측
      이 가이드는 ClickStack으로 수집하고 쿼리할 관측성 데이터의 양을 처리하기에 충분한 리소스를 프로비저닝했다고 가정합니다. 필요한 리소스를 예측하려면 [프로덕션 가이드](/use-cases/observability/clickstack/production#estimating-resources)를 참조하세요.

      ClickHouse 서비스가 실시간 애플리케이션 분석과 같은 기존 워크로드를 이미 호스팅하고 있는 경우, [ClickHouse Cloud의 웨어하우스 기능](/cloud/reference/warehouses)을 사용하여 하위 서비스를 생성하고 관측성 워크로드를 격리하는 것을 권장합니다. 이를 통해 기존 애플리케이션의 중단 없이 두 서비스 모두에서 데이터셋에 액세스할 수 있습니다.
      :::

      <Image img={select_service} alt="서비스 선택" size="lg" />

      ### ClickStack UI로 이동

      왼쪽 탐색 메뉴에서 &#39;ClickStack&#39;을 선택하세요. ClickStack UI로 리디렉션되며 ClickHouse Cloud 권한을 기반으로 자동으로 인증됩니다.

      서비스에 OpenTelemetry 테이블이 이미 존재하는 경우, 자동으로 감지되며 해당 데이터 소스가 생성됩니다.

      :::note 데이터 소스 자동 감지
      자동 감지는 ClickStack 배포판의 OpenTelemetry 수집기에서 제공하는 표준 OpenTelemetry 테이블 스키마를 기반으로 합니다. 가장 완전한 테이블 세트를 보유한 데이터베이스에 대해 소스가 생성됩니다. 필요한 경우 추가 테이블을 [별도의 데이터 소스](/use-cases/observability/clickstack/config#datasource-settings)로 추가할 수 있습니다.
      :::

      자동 감지가 성공하면 검색 뷰로 이동되며, 즉시 데이터 탐색을 시작할 수 있습니다.

      <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

      이 단계가 성공하면 모든 설정이 완료된 것입니다 🎉. 그렇지 않은 경우 수집 설정을 진행하세요.

      ### 수집 설정하기

      자동 감지가 실패하거나 기존 테이블이 없는 경우, 수집을 설정하라는 메시지가 표시됩니다.

      <Image img={clickstack_ui_setup_ingestion} alt="ClickStack UI에서 수집 설정" size="lg" />

      &quot;Start Ingestion&quot;을 선택하면 수집 소스를 선택하라는 메시지가 표시됩니다. 관리형 ClickStack은 OpenTelemetry와 [Vector](https://vector.dev/)를 주요 수집 소스로 지원합니다. 또한 [ClickHouse Cloud 지원 통합](/integrations)을 사용하여 자체 스키마로 ClickHouse에 직접 데이터를 전송할 수도 있습니다.

      <Image img={select_source_clickstack_ui} size="lg" alt="소스 선택 - ClickStack UI" border />

      :::note[OpenTelemetry 권장]
      수집 형식으로 OpenTelemetry 사용을 강력히 권장합니다.
      ClickStack과 효율적으로 작동하도록 특별히 설계된 기본 제공 스키마를 통해 가장 간단하고 최적화된 환경을 제공합니다.
      :::

      <Tabs groupId="ingestion-sources-existing">
        <TabItem value="OpenTelemetry" label="OpenTelemetry" default>
          Managed ClickStack로 OpenTelemetry 데이터를 전송하려면 OpenTelemetry Collector 사용이 권장됩니다. Collector는 애플리케이션(및 다른 collector)에서 OpenTelemetry 데이터를 수신하고 이를 ClickHouse Cloud로 전달하는 게이트웨이 역할을 합니다.

          Collector가 아직 실행 중이 아니라면 아래 단계를 따라 Collector를 시작하십시오. 이미 Collector를 사용 중인 경우에도 참고할 수 있는 구성 예제가 제공됩니다.

          ### Collector 시작

          다음 내용은 **OpenTelemetry Collector에 대한 ClickStack 배포판** 사용을 권장하는 경로를 전제로 합니다. 이 배포판에는 추가 처리 로직이 포함되어 있으며 ClickHouse Cloud에 최적화되어 있습니다. 자체 OpenTelemetry Collector를 사용하려는 경우 [&quot;기존 Collector 구성하기&quot;](#configure-existing-collectors)를 참조하십시오.

          빠르게 시작하려면 표시된 Docker 명령을 복사하여 실행하십시오.

          <Image img={otel_collector_start_clickstack_ui} size="md" alt="OTel collector source" />

          **서비스를 생성할 때 기록해 둔 서비스 자격 증명으로 이 명령을 수정하십시오.**

          :::note[프로덕션 배포]
          이 명령은 Managed ClickStack에 연결하기 위해 `default` 사용자를 사용하지만, [프로덕션으로 전환](/use-cases/observability/clickstack/production#create-a-user)할 때는 전용 사용자를 생성하고 구성을 수정해야 합니다.
          :::

          이 단일 명령을 실행하면 ClickStack Collector가 시작되며, OTLP 엔드포인트가 포트 4317(gRPC)과 4318(HTTP)에 노출됩니다. 이미 OpenTelemetry 계측과 에이전트를 사용 중이라면, 즉시 이 엔드포인트로 텔레메트리 데이터를 전송할 수 있습니다.

          ### 기존 Collector 구성

          기존에 사용 중인 OpenTelemetry Collector를 구성하거나, 자체 배포판의 Collector를 사용할 수도 있습니다.

          :::note[ClickHouse exporter 필수]
          [contrib 이미지](https://github.com/open-telemetry/opentelemetry-collector-contrib)와 같이 자체 배포판을 사용하는 경우, [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)가 포함되어 있는지 반드시 확인하십시오.
          :::

          이를 위해 ClickHouse exporter에 적절한 설정을 적용하고 OTLP 리시버를 노출하는 예제 OpenTelemetry Collector 구성이 제공됩니다. 이 구성은 ClickStack 배포판에서 기대하는 인터페이스와 동작을 그대로 따릅니다.

          <ExampleOTelConfig />

          <Image img={advanced_otel_collector_clickstack_ui} size="lg" alt="Advanced OTel collector source" />

          OpenTelemetry Collector 구성에 대한 자세한 내용은 [&quot;OpenTelemetry를 사용한 수집&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)을 참조하십시오.

          ### 수집 시작(선택 사항)

          이미 OpenTelemetry로 계측할 애플리케이션 또는 인프라가 있는 경우, 「애플리케이션 연결」에서 연결된 관련 가이드를 확인하십시오.

          애플리케이션을 계측하여 트레이스와 로그를 수집하려면 [지원되는 언어 SDKs](/use-cases/observability/clickstack/sdks)를 사용하십시오. 이 SDK는 Managed ClickStack으로의 수집을 위한 게이트웨이 역할을 하는 OpenTelemetry Collector로 데이터를 전송합니다.

          로그는 에이전트 모드로 실행되며 동일한 Collector로 데이터를 전달하는 [OpenTelemetry Collector를 사용해 수집](/use-cases/observability/clickstack/integrations/host-logs)할 수 있습니다. Kubernetes 모니터링의 경우 [전용 가이드](/use-cases/observability/clickstack/integrations/kubernetes)를 따르십시오. 그 밖의 통합 방법은 [빠른 시작 가이드](/use-cases/observability/clickstack/integration-guides)를 참조하십시오.

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          [Vector](https://vector.dev)는 고성능의 벤더 중립 관측성 데이터 파이프라인으로, 특히 유연성과 낮은 리소스 사용량 덕분에 로그 수집에 널리 사용됩니다.

          Vector를 ClickStack과 함께 사용할 때는 스키마를 직접 정의해야 합니다. 이러한 스키마는 OpenTelemetry 컨벤션을 따를 수도 있지만, 사용자 정의 이벤트 구조를 전적으로 커스텀 형식으로 표현할 수도 있습니다.

          :::note 타임스탬프 필수
          Managed ClickStack에서의 유일한 엄격한 요구 사항은 데이터에 **timestamp 컬럼**(또는 이에 상응하는 시간 필드)이 포함되어야 한다는 점이며, 이는 ClickStack UI에서 데이터 소스를 구성할 때 선언할 수 있습니다.
          :::

          다음 설명은 Vector 인스턴스가 이미 실행 중이며, 사전에 구성된 수집 파이프라인을 통해 데이터를 전달하고 있다고 가정합니다.

          ### 데이터베이스와 테이블 생성

          Vector는 데이터 수집 이전에 테이블과 스키마가 정의되어 있어야 합니다.

          먼저 데이터베이스를 생성합니다. 이는 [ClickHouse Cloud 콘솔](/cloud/get-started/sql-console)에서 수행할 수 있습니다.

          예를 들어, 로그용 데이터베이스를 다음과 같이 생성합니다:

          ```sql
          CREATE DATABASE IF NOT EXISTS logs
          ```

          그런 다음 로그 데이터 구조에 맞는 스키마로 테이블을 생성합니다. 아래 예시는 클래식한 Nginx 액세스 로그 형식을 가정합니다.

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

          테이블은 Vector가 생성하는 출력 스키마와 일치해야 합니다. 데이터에 맞게 스키마를 필요한 대로 조정하되, 권장되는 [스키마 모범 사례](/docs/best-practices/select-data-types)를 따르십시오.

          ClickHouse에서 [기본 키(Primary keys)](/docs/primary-indexes)가 어떻게 동작하는지 이해한 뒤, 액세스 패턴에 따라 정렬 키(ordering key)를 선택할 것을 강력히 권장합니다. 기본 키 선택에 대한 지침은 [ClickStack 전용](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) 문서를 참조하십시오.

          테이블을 생성한 뒤에는 표시된 설정 스니펫을 복사하십시오. 기존 파이프라인을 입력으로 사용하도록 input을 조정하고, 필요한 경우 대상 테이블과 데이터베이스도 수정하십시오. 자격 증명은 미리 채워져 있습니다.

          <Image img={vector_config_clickstack_ui} size="lg" alt="Vector 구성" />

          Vector로 데이터를 수집하는 추가 예시는 [「Vector로 수집하기」](/use-cases/observability/clickstack/ingesting-data/vector) 또는 고급 옵션은 [Vector ClickHouse sink 문서](https://vector.dev/docs/reference/configuration/sinks/clickhouse/)를 참조하십시오.

          <br />
        </TabItem>
      </Tabs>

      ### ClickStack UI로 이동

      수집 설정을 완료하고 데이터 전송을 시작한 후 &quot;Next&quot;를 선택하세요.

      <Tabs groupId="datsources-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          이 가이드를 사용하여 OpenTelemetry 데이터를 수집한 경우, 데이터 소스는 자동으로 생성되며 추가 설정은 필요하지 않습니다. 바로 ClickStack 탐색을 시작할 수 있습니다. 검색 뷰로 이동하며, 소스가 자동으로 선택되어 즉시 쿼리를 실행할 수 있습니다.

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          이로써 모든 준비가 완료되었습니다 🎉.

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          Vector 데이터 또는 다른 소스를 통해 수집한 경우, 데이터 소스를 구성하라는 메시지가 표시됩니다.

          <Image img={create_vector_datasource} alt="Create datasource - vector" size="lg" />

          위 구성은 `time_local` 컬럼을 타임스탬프로 사용하는 Nginx 스타일 스키마를 가정합니다. 가능하다면 기본 키에 선언된 타임스탬프 컬럼을 사용해야 합니다. **이 컬럼은 필수입니다**.

          또한 로그 뷰에서 반환되는 컬럼을 명시적으로 정의하도록 `Default SELECT`를 업데이트할 것을 권장합니다. 서비스 이름, 로그 레벨, 본문 컬럼 등 추가 필드를 사용할 수 있는 경우, 이들도 함께 구성할 수 있습니다. 위에서 구성한 테이블 기본 키 컬럼과 다른 컬럼을 표시용 타임스탬프로 사용하려면, 타임스탬프 표시 컬럼을 재정의할 수도 있습니다.

          위 예시에서는 데이터에 `Body` 컬럼이 존재하지 않습니다. 대신 사용 가능한 필드로부터 Nginx 로그 라인을 재구성하는 SQL 식을 사용해 정의합니다.

          다른 가능한 옵션은 [configuration reference](/use-cases/observability/clickstack/config#hyperdx)를 참고하십시오.

          소스 구성이 완료되면 &quot;Save&quot;를 클릭하여 데이터 탐색을 시작하십시오.

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          <br />
        </TabItem>
      </Tabs>
    </VerticalStepper>
  </TabItem>
</Tabs>

## 추가 작업 {#additional-tasks}

### Managed ClickStack에 대한 액세스 권한 부여 \{#configure-access\}

1. ClickHouse Cloud 콘솔에서 해당 서비스로 이동합니다.
2. **Settings** → **SQL Console Access**로 이동합니다.
3. 각 사용자에 대해 적절한 권한 수준을 설정합니다.
   - **Service Admin → Full Access** - 알림을 활성화하는 데 필요합니다.
   - **Service Read Only → Read Only** - 관측성 데이터를 조회하고 대시보드를 생성할 수 있습니다.
   - **No access** - HyperDX에 접근할 수 없습니다.

<Image img={read_only} alt="ClickHouse Cloud 읽기 전용" size="md"/>

:::important 알림에는 관리자 권한이 필요합니다
알림을 활성화하려면 **Service Admin** 권한(**SQL Console Access** 드롭다운의 **Full Access**에 매핑됨)이 있는 사용자가 최소 한 번 HyperDX에 로그인해야 합니다. 이때 알림 쿼리를 실행하는 전용 사용자가 데이터베이스에 생성됩니다.
:::

### 읽기 전용 컴퓨트로 ClickStack 사용 \{#clickstack-read-only-compute\}

ClickStack UI는 읽기 전용 ClickHouse Cloud 서비스만으로도 완전히 동작합니다. 수집 워크로드와 쿼리 워크로드를 분리하려는 상황에서는 이 구성을 권장합니다.

#### ClickStack가 컴퓨트를 선택하는 방식 {#how-clickstack-selects-compute}

ClickStack UI는 항상 ClickHouse Cloud 콘솔에서 해당 UI를 실행한 ClickHouse 서비스에 연결합니다.

이는 다음을 의미합니다.

* 읽기 전용 서비스에서 ClickStack을 여는 경우, ClickStack UI에서 수행되는 모든 쿼리는 해당 읽기 전용 컴퓨트에서 실행됩니다.
* 읽기/쓰기 서비스에서 ClickStack을 여는 경우, ClickStack은 해당 컴퓨트를 사용합니다.

읽기 전용 동작을 보장하기 위해 ClickStack에서 추가로 구성해야 하는 사항은 없습니다.

#### 권장 설정 {#recommended-setup}

읽기 전용 컴퓨트 환경에서 ClickStack을 실행하려면:

1. 웨어하우스에서 읽기 전용으로 구성된 ClickHouse Cloud 서비스를 생성하거나 선택합니다.
2. ClickHouse Cloud 콘솔에서 해당 읽기 전용 서비스를 선택합니다.
3. 왼쪽 내비게이션 메뉴에서 ClickStack을 실행합니다.

실행한 후에는 ClickStack UI가 이 읽기 전용 서비스에 자동으로 연결됩니다.

### 더 많은 데이터 소스 추가하기 \{#adding-data-sources\}

ClickStack은 OpenTelemetry를 네이티브로 지원하지만 OpenTelemetry 전용은 아니므로, 필요하다면 자체 테이블 스키마를 사용할 수도 있습니다.

다음에서는 자동으로 구성되는 데이터 소스 외에 추가 데이터 소스를 추가하는 방법을 설명합니다.

#### OpenTelemetry 스키마 사용 {#using-otel-schemas}

OTel collector를 사용하여 ClickHouse 내에서 데이터베이스와 테이블을 생성하는 경우, 소스 생성 화면의 기본값은 모두 유지하고, 로그 소스를 생성하려면 `Table` 필드에 `otel_logs` 값을 입력하십시오. 다른 모든 설정은 자동으로 감지되므로 `Save New Source`를 클릭하면 됩니다.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 데이터 소스" size="lg"/>

트레이스와 OTel 메트릭에 대한 소스를 생성하려면 상단 메뉴에서 `Create New Source`를 선택하십시오.

<Image img={hyperdx_create_new_source} alt="ClickStack 새 소스 생성" size="lg"/>

여기에서 필요한 소스 유형을 선택한 다음, 해당하는 테이블을 선택하십시오. 예를 들어 트레이스의 경우 `otel_traces` 테이블을 선택합니다. 모든 설정은 자동으로 감지됩니다.

<Image img={hyperdx_create_trace_datasource} alt="ClickStack 트레이스 소스 생성" size="lg"/>

:::note 소스 상관관계 설정
ClickStack의 서로 다른 데이터 소스(예: 로그와 트레이스)는 서로 연관될 수 있습니다. 이를 활성화하려면 각 소스마다 추가 구성이 필요합니다. 예를 들어 로그 소스에서는 해당하는 트레이스 소스를 지정할 수 있고, 반대로 트레이스 소스에서도 로그 소스를 지정할 수 있습니다. 자세한 내용은 ["상관관계 소스"](/use-cases/observability/clickstack/config#correlated-sources)를 참조하십시오.
:::

#### 사용자 지정 스키마 사용 {#using-custom-schemas}

기존 서비스에 이미 존재하는 데이터와 ClickStack을 연결하려는 경우, 필요에 따라 데이터베이스와 테이블 설정을 완료합니다. 테이블이 ClickHouse용 OpenTelemetry 스키마를 준수하는 경우 설정은 자동으로 감지됩니다. 

사용자 지정 스키마를 사용하는 경우, 필수 필드가 지정되도록 Logs 소스를 생성할 것을 권장합니다. 자세한 내용은 ["Log source settings"](/use-cases/observability/clickstack/config#logs)를 참조하십시오.

<JSONSupport/>

또한 ClickHouse Cloud 서비스에서 JSON이 활성화되어 있는지 확인하기 위해 support@clickhouse.com으로 문의해야 합니다.