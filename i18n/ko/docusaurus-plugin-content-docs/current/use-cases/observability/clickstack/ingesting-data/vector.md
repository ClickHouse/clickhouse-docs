---
slug: /use-cases/observability/clickstack/ingesting-data/vector
pagination_prev: null
pagination_next: null
description: 'Vector를 사용한 ClickStack 데이터 수집 - ClickHouse 관측성 스택'
title: 'Vector로 데이터 수집하기'
toc_max_heading_level: 2
doc_type: 'guide'
keywords: ['clickstack', 'vector', '트레이스', '관측성', '텔레메트리']
---

import Image from '@theme/IdealImage';
import InstallingVector from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_installing_vector.md';
import VectorSampleData from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_vector_sample_data.md';
import ingestion_key from '@site/static/images/clickstack/clickstack-ingestion-key.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import create_vector_datasource_oss from '@site/static/images/clickstack/create-vector-datasource-oss.png';
import nginx_logs_vector_search from '@site/static/images/clickstack/nginx-logs-vector-search.png';
import launch_clickstack_vector from '@site/static/images/clickstack/launch-clickstack-vector.png';
import play_ui from '@site/static/images/clickstack/play-ui-clickstack.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Vector](https://vector.dev)는 고성능의 벤더 중립적인 관측성(observability) 데이터 파이프라인입니다. 다양한 소스에서 로그와 메트릭을 수집, 변환 및 라우팅하는 데 널리 사용되며, 특히 유연성과 낮은 리소스 사용량 덕분에 로그 수집(ingestion) 용도로 많이 활용됩니다.

Vector를 ClickStack과 함께 사용할 때는 스키마를 직접 정의해야 합니다. 이 스키마는 OpenTelemetry 규칙을 따를 수도 있고, 사용자 정의 이벤트 구조를 완전히 커스텀한 형태로 표현할 수도 있습니다. 실제로 Vector를 통한 수집은 **로그**에 가장 많이 사용되며, 데이터가 ClickHouse에 기록되기 전에 파싱과 부가 정보(enrichment) 추가 과정을 완전히 제어하고자 할 때 주로 활용됩니다.

이 가이드는 ClickStack 오픈 소스와 관리형 ClickStack 모두에서 Vector를 사용하여 데이터를 ClickStack으로 도입하는 방법에 초점을 맞춥니다. 단순화를 위해 Vector 소스나 파이프라인 구성은 자세히 다루지 않습니다. 대신 데이터를 ClickHouse에 기록하는 **sink**를 구성하는 방법과, 그 결과 스키마가 ClickStack과 호환되도록 하는 데 중점을 둡니다.

오픈 소스든 관리형 배포든 ClickStack에서 유일하게 엄격하게 요구되는 사항은 데이터에 **timestamp 컬럼**(또는 동등한 시간 필드)이 포함되어 있어야 한다는 점입니다. 이 필드는 ClickStack UI에서 데이터 소스를 구성할 때 선언할 수 있습니다.


## Vector를 사용하여 데이터 전송 \{#sending-data-with-vector\}

<br/>

<Tabs groupId="vector-options">
  <TabItem value="managed-clickstack" label="관리형 ClickStack" default>
    다음 가이드는 Managed ClickStack 서비스를 이미 생성하고 서비스 자격 증명을 기록한 상태를 가정합니다. 아직 생성하지 않았다면 Vector를 구성하도록 안내받기 전까지 Managed ClickStack의 [시작하기](/use-cases/observability/clickstack/getting-started/managed) 가이드를 따르십시오.

    <VerticalStepper headerLevel="h3">
      ### 데이터베이스 및 테이블 생성하기

      Vector는 데이터를 수집하기 전에 테이블과 스키마를 미리 정의해야 합니다.

      먼저 데이터베이스를 생성하세요. [ClickHouse Cloud 콘솔](/cloud/get-started/sql-console)을 통해 수행할 수 있습니다.

      아래 예제에서는 `logs`를 사용합니다:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      데이터를 위한 테이블을 생성하세요. 이는 데이터의 출력 스키마와 일치해야 합니다. 아래 예시는 일반적인 Nginx 구조를 가정합니다. [스키마 모범 사례](/best-practices/select-data-types)를 준수하여 데이터에 맞게 조정하세요. [기본 키(Primary Key)의 개념](/primary-indexes)을 숙지하고, [여기](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)에 설명된 가이드라인에 따라 기본 키를 선택하실 것을 **강력히 권장**합니다.

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 기본 키
      위의 기본 키는 ClickStack UI에서 Nginx 로그의 일반적인 접근 패턴을 가정합니다. 프로덕션 환경의 워크로드에 따라 조정해야 할 수 있습니다.
      :::

      ### Vector 구성에 ClickHouse 싱크 추가하기

      Vector 구성을 수정하여 ClickHouse 싱크를 포함하고, 기존 파이프라인에서 이벤트를 수신할 수 있도록 `inputs` 필드를 업데이트하세요.

      이 구성은 업스트림 Vector 파이프라인이 이미 **대상 ClickHouse 스키마에 맞게 데이터를 준비**했다고 가정합니다. 즉, 필드가 파싱되고 올바르게 명명되었으며 삽입에 적합한 타입으로 지정되어 있어야 합니다. 원시 로그 라인을 ClickStack에 적합한 스키마로 파싱하고 정규화하는 전체 예시는 [**아래 Nginx 예제**](#example-dataset-with-vector)를 참조하세요.

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      기본적으로 **`json_each_row`** 형식을 사용하는 것을 권장합니다. 이 형식은 각 이벤트를 행당 하나의 JSON 객체로 인코딩합니다. 이는 JSON 데이터를 수집할 때 ClickStack의 기본 권장 형식이며, 문자열로 인코딩된 JSON 객체와 같은 다른 형식보다 우선적으로 사용해야 합니다.

      ClickHouse 싱크는 **Arrow 스트림 인코딩**(현재 베타)도 지원합니다. 이를 통해 더 높은 처리량을 제공할 수 있지만 중요한 제약 사항이 있습니다. 데이터베이스와 테이블은 정적이어야 하며(스키마는 시작 시 한 번만 가져옴), 동적 라우팅은 지원되지 않습니다. 이러한 이유로 Arrow 인코딩은 고정되고 명확하게 정의된 수집 파이프라인에 가장 적합합니다.

      [Vector 문서](https://vector.dev/docs/reference/configuration/sinks/clickhouse)에서 사용 가능한 싱크(sink) 구성 옵션을 검토하십시오:

      :::note
      위 예제는 Managed ClickStack의 기본 사용자를 사용합니다. 프로덕션 배포 환경에서는 적절한 권한과 제한이 설정된 [전용 수집 사용자를 생성](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)하는 것을 권장합니다.
      :::

      ### ClickStack UI로 이동

      관리형 ClickStack 서비스로 이동하여 왼쪽 메뉴에서 「ClickStack」을 선택하세요. 온보딩을 이미 완료했다면 새 탭에서 ClickStack UI가 실행되며 자동으로 인증됩니다. 온보딩을 완료하지 않았다면 온보딩을 진행한 후 입력 소스로 Vector를 선택하고 &quot;Launch ClickStack&quot;을 선택하세요.

      <Image img={launch_clickstack_vector} alt="Vector용 ClickStack 시작하기" size="lg" />

      ### 데이터 소스 생성하기

      로그 데이터 소스를 생성하세요. 데이터 소스가 없는 경우 첫 로그인 시 생성 안내가 표시됩니다. 데이터 소스가 이미 있는 경우 Team Settings로 이동하여 새 데이터 소스를 추가하세요.

      <Image img={create_vector_datasource} alt="데이터 소스 생성 - Vector" size="lg" />

      위 구성은 타임스탬프로 사용되는 `time_local` 컬럼을 포함한 Nginx 스타일 스키마를 가정합니다. 가능한 경우, 이 컬럼은 기본 키에 선언된 타임스탬프 컬럼이어야 합니다. 이 컬럼은 필수입니다.

      로그 뷰에서 반환되는 컬럼을 명시적으로 정의하도록 `Default SELECT`를 업데이트하는 것을 권장합니다. 서비스 이름, 로그 레벨 또는 본문 컬럼과 같은 추가 필드를 사용할 수 있는 경우 이러한 필드도 구성할 수 있습니다. 타임스탬프 표시 컬럼은 테이블의 기본 키에 사용된 컬럼과 다르며 위에서 구성된 경우 재정의할 수 있습니다.

      위 예시에서 `Body` 컬럼은 데이터에 존재하지 않습니다. 대신, 사용 가능한 필드에서 Nginx 로그 라인을 재구성하는 SQL 표현식을 사용하여 정의됩니다.

      다른 가능한 옵션은 [구성 참조](/use-cases/observability/clickstack/config)를 참조하십시오.

      ### 데이터 탐색하기

      로그 뷰로 이동하여 데이터를 탐색하고 ClickStack을 사용하세요.

      <Image img={nginx_logs_vector_search} alt="ClickStack의 Nginx 로그" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="오픈소스 ClickStack">
    <VerticalStepper headerLevel="h3">
      ### 데이터베이스 및 테이블 생성하기

      Vector는 데이터를 수집하기 전에 테이블과 스키마를 미리 정의해야 합니다.

      먼저 데이터베이스를 생성하세요. [http://localhost:8123/play](http://localhost:8123/play)의 [ClickHouse 웹 사용자 인터페이스](/interfaces/http#web-ui)를 통해 수행할 수 있습니다. 기본 사용자 이름과 비밀번호 `api:api`를 사용하세요.

      <Image img={play_ui} alt="UI에서 ClickStack 사용해 보기" size="lg" />

      아래 예제에서는 `logs`를 사용합니다:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      데이터를 위한 테이블을 생성하세요. 이는 데이터의 출력 스키마와 일치해야 합니다. 아래 예시는 일반적인 Nginx 구조를 가정합니다. [스키마 모범 사례](/best-practices/select-data-types)를 준수하여 데이터에 맞게 조정하세요. [기본 키(Primary Key)의 개념](/primary-indexes)을 숙지하고, [여기](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)에 설명된 가이드라인에 따라 기본 키를 선택하실 것을 **강력히 권장**합니다.

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 기본 키
      위의 기본 키는 ClickStack UI에서 Nginx 로그의 일반적인 접근 패턴을 가정합니다. 프로덕션 환경의 워크로드에 따라 조정해야 할 수 있습니다.
      :::

      ### Vector 구성에 ClickHouse 싱크 추가하기

      Vector를 사용하는 경우 ClickStack으로의 데이터 수집은 컬렉터가 노출하는 OTLP 엔드포인트를 우회하고 ClickHouse로 직접 수행해야 합니다.

      Vector 구성을 수정하여 ClickHouse 싱크를 포함하고, `inputs` 필드를 업데이트하여 기존 파이프라인으로부터 이벤트를 수신하세요.

      이 구성은 업스트림 Vector 파이프라인이 이미 **대상 ClickHouse 스키마에 맞게 데이터를 준비**했다고 가정합니다. 즉, 필드가 파싱되고 올바르게 명명되었으며 삽입에 적합한 타입으로 지정되어 있어야 합니다. 원시 로그 라인을 ClickStack에 적합한 스키마로 파싱하고 정규화하는 전체 예시는 [**아래 Nginx 예제**](#example-dataset-with-vector)를 참조하세요.

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      기본적으로 **`json_each_row`** 형식을 사용하는 것을 권장합니다. 이 형식은 각 이벤트를 행당 하나의 JSON 객체로 인코딩합니다. 이는 JSON 데이터를 수집할 때 ClickStack의 기본 권장 형식이며, 문자열로 인코딩된 JSON 객체와 같은 다른 형식보다 우선적으로 사용해야 합니다.

      ClickHouse 싱크는 **Arrow 스트림 인코딩**(현재 베타)도 지원합니다. 이를 통해 더 높은 처리량을 제공할 수 있지만 중요한 제약 사항이 있습니다. 데이터베이스와 테이블은 정적이어야 하며(스키마는 시작 시 한 번만 가져옴), 동적 라우팅은 지원되지 않습니다. 이러한 이유로 Arrow 인코딩은 고정되고 명확하게 정의된 수집 파이프라인에 가장 적합합니다.

      [Vector 문서](https://vector.dev/docs/reference/configuration/sinks/clickhouse)에서 사용 가능한 싱크 구성 옵션을 검토하는 것을 권장합니다:

      :::note
      위 예제는 ClickStack Open Source의 `api` 사용자를 사용합니다. 프로덕션 배포 환경에서는 적절한 권한과 제한이 설정된 [전용 수집 사용자를 생성](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)하는 것을 권장합니다. 또한 위 구성은 Vector가 ClickStack과 동일한 호스트에서 실행된다고 가정합니다. 프로덕션 배포 환경에서는 이와 다를 가능성이 높습니다. 보안 HTTPS 포트 8443을 통해 데이터를 전송하는 것을 권장합니다.
      :::

      ### ClickStack UI로 이동

      [http://localhost:8080](http://localhost:8080)에서 ClickStack UI로 이동하세요. 온보딩을 완료하지 않은 경우 사용자를 생성하세요.

      <Image img={hyperdx_login} alt="ClickStack 로그인" size="lg" />

      ### 데이터 소스 생성하기

      Team Settings로 이동하여 새 데이터 소스를 추가하세요.

      <Image img={create_vector_datasource_oss} alt="데이터 소스 생성 - Vector" size="lg" />

      위 구성은 타임스탬프로 사용되는 `time_local` 컬럼을 포함한 Nginx 스타일 스키마를 가정합니다. 가능한 경우, 이 컬럼은 기본 키(primary key)에 선언된 타임스탬프 컬럼이어야 합니다. 이 컬럼은 필수입니다.

      로그 뷰에서 반환되는 컬럼을 명시적으로 정의하도록 `Default SELECT`를 업데이트하는 것을 권장합니다. 서비스 이름, 로그 레벨 또는 본문 컬럼과 같은 추가 필드를 사용할 수 있는 경우 이러한 필드도 구성할 수 있습니다. 타임스탬프 표시 컬럼은 테이블의 기본 키에 사용된 컬럼과 다르며 위에서 구성된 경우 재정의할 수 있습니다.

      위 예시에서 `Body` 컬럼은 데이터에 존재하지 않습니다. 대신 사용 가능한 필드에서 Nginx 로그 라인을 재구성하는 SQL 표현식을 사용하여 정의됩니다.

      다른 옵션에 대해서는 [구성 참조](/use-cases/observability/clickstack/config)를 참조하세요.

      ### 데이터 탐색하기

      로그 뷰로 이동하여 데이터를 탐색하고 ClickStack을 사용하세요.

      <Image img={nginx_logs_vector_search} alt="ClickStack에서의 Nginx 로그" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## Vector를 사용한 예제 데이터 세트 {#example-dataset-with-vector}

더 완전한 예제를 위해 아래에서는 **Nginx 로그 파일**을 사용합니다.

<Tabs groupId="example-dataset-options">
  <TabItem value="managed-clickstack" label="관리형 ClickStack" default>
    다음 가이드는 Managed ClickStack 서비스를 이미 생성하고 서비스 자격 증명을 기록한 상태를 가정합니다. 아직 완료하지 않았다면 Vector를 구성하도록 안내받기 전까지 Managed ClickStack의 [시작하기](/use-cases/observability/clickstack/getting-started/managed) 가이드를 따르십시오.

    <VerticalStepper headerLevel="h3">
      ### Vector 설치하기

      <InstallingVector />

      ### 샘플 데이터 다운로드하기

      <VectorSampleData />

      ### 데이터베이스 및 테이블 생성하기

      Vector는 데이터를 수집하기 전에 테이블과 스키마를 정의해야 합니다.

      먼저 데이터베이스를 생성하세요. [ClickHouse Cloud 콘솔](/cloud/get-started/sql-console)을 통해 수행할 수 있습니다.

      `logs` 데이터베이스를 생성하세요:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      데이터를 저장할 테이블을 생성하세요.

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 기본 키
      위의 기본 키는 ClickStack UI에서 Nginx 로그에 대한 일반적인 접근 패턴을 가정합니다. 프로덕션 환경의 워크로드에 따라 조정해야 할 수 있습니다.
      :::

      ### Vector 구성 복사하기

      vector 구성을 복사하고 `nginx.yaml` 파일을 생성한 후, `CLICKHOUSE_ENDPOINT`와 `CLICKHOUSE_PASSWORD`를 설정하세요.

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      :::note
      위 예제는 Managed ClickStack의 기본 사용자를 사용합니다. 프로덕션 배포 환경에서는 적절한 권한과 제한이 설정된 [전용 수집 사용자를 생성](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)하는 것을 권장합니다.
      :::

      ### Vector 시작

      파일 오프셋을 기록하기 위해 데이터 디렉토리를 먼저 생성한 후, 다음 명령으로 Vector를 시작하세요.

      ```bash
      mkdir ./.vector-data
      vector --config nginx.yaml
      ```

      ### ClickStack UI로 이동

      관리형 ClickStack 서비스로 이동하여 왼쪽 메뉴에서 「ClickStack」을 선택하세요. 온보딩을 이미 완료했다면 새 탭에서 ClickStack UI가 실행되고 자동으로 인증됩니다. 온보딩을 완료하지 않았다면 온보딩을 진행한 후 Vector를 입력 소스로 선택하고 &quot;Launch ClickStack&quot;을 선택하세요.

      <Image img={launch_clickstack_vector} alt="Vector용 ClickStack 시작하기" size="lg" />

      ### 데이터 소스 생성하기

      로그 데이터 소스를 생성하세요. 데이터 소스가 없는 경우 첫 로그인 시 생성 안내가 표시됩니다. 데이터 소스가 이미 있는 경우 Team Settings로 이동하여 새 데이터 소스를 추가하세요.

      <Image img={create_vector_datasource} alt="Vector용 데이터 소스 생성" size="lg" />

      이 구성은 타임스탬프로 사용되는 `time_local` 컬럼을 포함한 Nginx 스키마를 가정합니다. 이는 기본 키에 선언된 타임스탬프 컬럼입니다. 이 컬럼은 필수입니다.

      또한 기본 select를 `time_local, remote_addr, status, request`로 지정하여 로그 뷰에서 반환되는 컬럼을 정의합니다.

      위 예시에서 `Body` 컬럼은 데이터에 존재하지 않으며, 대신 다음과 같은 SQL 표현식으로 정의됩니다:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      구조화된 필드로부터 로그 라인을 재구성합니다.

      다른 가능한 옵션은 [구성 참조](/use-cases/observability/clickstack/config)를 참고하세요.

      ### 데이터 탐색하기

      `2025년 10월 20일`의 검색 뷰로 이동하여 데이터를 탐색하고 ClickStack 사용을 시작하세요.

      <Image img={nginx_logs_vector_search} alt="HyperDX UI" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="오픈 소스 ClickStack">
    다음 가이드는 [시작 가이드](use-cases/observability/clickstack/getting-started/managed)를 사용하여 ClickStack Open Source를 설정한 것으로 가정합니다.

    <VerticalStepper headerLevel="h3">
      ### Vector 설치하기

      <InstallingVector />

      ### 샘플 데이터 다운로드하기

      <VectorSampleData />

      ### 데이터베이스 및 테이블 생성하기

      Vector는 데이터를 수집하기 전에 테이블과 스키마를 정의해야 합니다.

      먼저 데이터베이스를 생성합니다. 이는 [http://localhost:8123/play](http://localhost:8123/play)의 [ClickHouse 웹 사용자 인터페이스](/interfaces/http#web-ui)를 통해 수행할 수 있습니다. 기본 사용자 이름과 비밀번호 `api:api`를 사용하세요.

      <Image img={play_ui} alt="ClickStack UI 체험" size="lg" />

      `logs` 데이터베이스를 생성하세요:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      데이터를 저장할 테이블을 생성하세요.

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 기본 키
      위의 기본 키는 ClickStack UI에서 Nginx 로그에 대한 일반적인 접근 패턴을 가정합니다. 프로덕션 환경의 워크로드에 따라 조정해야 할 수 있습니다.
      :::

      ### Vector 구성 복사하기

      Vector를 사용하는 경우 ClickStack으로의 데이터 수집은 컬렉터가 노출하는 OTLP 엔드포인트를 우회하고 ClickHouse로 직접 수행해야 합니다.

      Vector 구성을 복사하고 `nginx.yaml` 파일을 생성하세요.

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      :::note
      위 예제는 ClickStack Open Source의 `api` 사용자를 사용합니다. 프로덕션 배포 환경에서는 적절한 권한과 제한이 설정된 [전용 수집 사용자를 생성](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)하는 것을 권장합니다. 또한 위 구성은 Vector가 ClickStack과 동일한 호스트에서 실행된다고 가정합니다. 프로덕션 배포 환경에서는 다를 가능성이 높습니다. 보안 HTTPS 포트 8443을 통해 데이터를 전송하는 것을 권장합니다.
      :::

      ### Vector 시작

      다음 명령어로 Vector를 시작하세요.

      ```bash
      mkdir ./.vector-data
      vector --config nginx-local.yaml
      ```

      ### 데이터 소스 생성하기

      `Team -> Sources`를 통해 로그 데이터 소스를 생성하세요

      <Image img={create_vector_datasource_oss} alt="데이터 소스 생성 - Vector" size="lg" />

      이 구성은 타임스탬프로 사용되는 `time_local` 컬럼을 포함한 Nginx 스키마를 가정합니다. 이는 기본 키에 선언된 타임스탬프 컬럼입니다. 이 컬럼은 필수입니다.

      또한 기본 select를 `time_local, remote_addr, status, request`로 지정하였으며, 이는 로그 뷰에서 반환되는 컬럼들을 정의합니다.

      위 예시에서 `Body` 컬럼은 데이터에 실제로 존재하지 않으며, 대신 다음과 같은 SQL 표현식으로 정의됩니다:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      구조화된 필드로부터 로그 라인을 재구성합니다.

      다른 가능한 옵션은 [구성 참조](/use-cases/observability/clickstack/config)를 참고하세요.

      ### ClickStack UI로 이동

      [http://localhost:8080](http://localhost:8080)에서 ClickStack UI로 이동하세요. 온보딩을 완료하지 않은 경우 사용자를 생성하세요.

      <Image img={hyperdx_login} alt="ClickStack 로그인" size="lg" />

      ### 데이터 탐색하기

      `2025년 10월 20일`의 검색 뷰로 이동하여 데이터를 탐색하고 ClickStack 사용을 시작하세요.

      <Image img={nginx_logs_vector_search} alt="HyperDX UI" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>