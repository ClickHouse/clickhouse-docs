---
'sidebar_label': '플러그인 구성'
'sidebar_position': 3
'slug': '/integrations/grafana/config'
'description': 'Grafana에서 ClickHouse 데이터 소스 플러그인을 위한 구성 옵션'
'title': 'Grafana에서 ClickHouse 데이터 소스 구성'
'doc_type': 'guide'
'keywords':
- 'Grafana plugin configuration'
- 'data source settings'
- 'connection parameters'
- 'authentication setup'
- 'plugin options'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Grafana에서 ClickHouse 데이터 소스 구성하기

<ClickHouseSupportedBadge/>

구성 수정의 가장 쉬운 방법은 Grafana UI의 플러그인 구성 페이지에서 이루어지지만, 데이터 소스는 [YAML 파일로 프로비저닝](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)될 수도 있습니다.

이 페이지는 ClickHouse 플러그인에서 사용할 수 있는 구성 옵션 목록과 YAML로 데이터 소스를 프로비저닝하는 데 사용할 수 있는 구성 코드 스니펫을 보여줍니다.

모든 옵션에 대한 빠른 개요는 [여기](#all-yaml-options)에서 전체 구성 옵션 목록을 확인할 수 있습니다.

## 일반 설정 {#common-settings}

예시 구성 화면:
<Image size="sm" img={config_common} alt="Example secure native config" border />

일반 설정을 위한 구성 YAML 예시:
```yaml
jsonData:
  host: 127.0.0.1 # (required) server address.
  port: 9000      # (required) server port. For native, defaults to 9440 secure and 9000 insecure. For HTTP, defaults to 8443 secure and 8123 insecure.

  protocol: native # (required) the protocol used for the connection. Can be set to "native" or "http".
  secure: false    # set to true if the connection is secure.

  username: default # the username used for authentication.

  tlsSkipVerify:     <boolean> # skips TLS verification when set to true.
  tlsAuth:           <boolean> # set to true to enable TLS client authentication.
  tlsAuthWithCACert: <boolean> # set to true if CA certificate is provided. Required for verifying self-signed TLS certificates.

secureJsonData:
  password: secureExamplePassword # the password used for authentication.

  tlsCACert:     <string> # TLS CA certificate
  tlsClientCert: <string> # TLS client certificate
  tlsClientKey:  <string> # TLS client key
```

UI에서 구성 저장 시 `version` 속성이 추가됩니다. 이는 구성이 저장된 플러그인의 버전을 표시합니다.

### HTTP 프로토콜 {#http-protocol}

HTTP 프로토콜로 연결을 선택하면 추가 설정이 표시됩니다.

<Image size="md" img={config_http} alt="Extra HTTP config options" border />

#### HTTP 경로 {#http-path}

HTTP 서버가 다른 URL 경로에 노출되어 있으면 여기에 추가할 수 있습니다.

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### 사용자 정의 HTTP 헤더 {#custom-http-headers}

서버에 전송되는 요청에 사용자 정의 헤더를 추가할 수 있습니다.

헤더는 일반 텍스트 또는 보안으로 설정할 수 있습니다. 모든 헤더 키는 일반 텍스트로 저장되고, 보안 헤더 값은 보안 구성에 저장됩니다 (비밀번호 필드와 유사함).

:::warning 보안 값은 HTTP를 통해 전송됩니다
보안 헤더 값은 구성에서 안전하게 저장되지만, 보안 연결이 비활성화되어 있는 경우 값은 여전히 HTTP를 통해 전송됩니다.
:::

일반/보안 헤더를 위한 YAML 예시:
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" is excluded
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 추가 설정 {#additional-settings}

이 추가 설정은 선택 사항입니다.

<Image size="sm" img={config_additional} alt="Example additional settings" border />

YAML 예시:
```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel)는 플러그인 내에 깊이 통합되어 있습니다. OpenTelemetry 데이터는 [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)을 통해 ClickHouse에 내보낼 수 있습니다. 최상의 사용을 위해, [로그](#logs)와 [트레이스](#traces) 모두에 대해 OTel을 구성하는 것이 권장됩니다.

이 기능은 [데이터 링크](./query-builder.md#data-links)를 활성화하기 위해 필요한 기본값을 구성하는 것도 필수적입니다. 데이터 링크는 강력한 가시성 워크플로를 가능하게 합니다.

### 로그 {#logs}

[로그 쿼리 작성](./query-builder.md#logs)을 가속화하기 위해 기본 데이터베이스/테이블 및 로그 쿼리를 위한 컬럼을 설정할 수 있습니다. 이를 통해 쿼리 빌더가 실행 가능한 로그 쿼리로 미리 로드되어 가시성을 위한 탐색 페이지에서 빠르게 탐색할 수 있습니다.

OpenTelemetry를 사용하는 경우, "**Use OTel**" 스위치를 활성화하고 **기본 로그 테이블**을 `otel_logs`로 설정해야 합니다. 이렇게 하면 기본 컬럼이 선택한 OTel 스키마 버전을 사용하도록 자동으로 재정의됩니다.

OpenTelemetry가 로그에 필수는 아니지만, 단일 로그/트레이스 데이터 세트를 사용하는 것이 [데이터 링크](./query-builder.md#data-links)와 함께 가시성 워크플로를 보다 원활하게 하는 데 도움이 됩니다.

예시 로그 구성 화면:
<Image size="sm" img={config_logs} alt="Logs config" border />

예시 로그 구성 YAML:
```yaml
jsonData:
  logs:
    defaultDatabase: default # default log database.
    defaultTable: otel_logs  # default log table. If you're using OTel, this should be set to "otel_logs".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new log query. Will be ignored if OTel is enabled.
    timeColumn:       <string> # the primary time column for the log.
    levelColumn:   <string> # the log level/severity of the log. Values typically look like "INFO", "error", or "Debug".
    messageColumn: <string> # the log's message/content.
```

### 트레이스 {#traces}

[트레이스 쿼리 작성](./query-builder.md#traces)을 가속화하기 위해 기본 데이터베이스/테이블 및 트레이스 쿼리를 위한 컬럼을 설정할 수 있습니다. 이를 통해 쿼리 빌더가 실행 가능한 트레이스 검색 쿼리로 미리 로드되어 가시성을 위한 탐색 페이지에서 빠르게 탐색할 수 있습니다.

OpenTelemetry를 사용하는 경우, "**Use OTel**" 스위치를 활성화하고 **기본 트레이스 테이블**을 `otel_traces`로 설정해야 합니다. 이렇게 하면 기본 컬럼이 선택한 OTel 스키마 버전을 사용하도록 자동으로 재정의됩니다. OpenTelemetry는 필수 사항은 아니지만, 이 기능은 트레이스를 위해 그 스키마를 사용할 때 최상의 효과를 발휘합니다.

예시 트레이스 구성 화면:
<Image size="sm" img={config_traces} alt="Traces config" border />

예시 트레이스 구성 YAML:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # default trace database.
    defaultTable: otel_traces # default trace table. If you're using OTel, this should be set to "otel_traces".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new trace query. Will be ignored if OTel is enabled.
    traceIdColumn:       <string>    # trace ID column.
    spanIdColumn:        <string>    # span ID column.
    operationNameColumn: <string>    # operation name column.
    parentSpanIdColumn:  <string>    # parent span ID column.
    serviceNameColumn:   <string>    # service name column.
    durationTimeColumn:  <string>    # duration time column.
    durationUnitColumn:  <time unit> # duration time unit. Can be set to "seconds", "milliseconds", "microseconds", or "nanoseconds". For OTel the default is "nanoseconds".
    startTimeColumn:     <string>    # start time column. This is the primary time column for the trace span.
    tagsColumn:          <string>    # tags column. This is expected to be a map type.
    serviceTagsColumn:   <string>    # service tags column. This is expected to be a map type.
```

### 컬럼 별칭 {#column-aliases}

컬럼 별칭은 데이터 쿼리를 다른 이름 및 유형으로 수행하는 편리한 방법입니다. 별칭을 사용하면 중첩 스키마를 평탄화하여 Grafana에서 쉽게 선택할 수 있도록 할 수 있습니다.

별칭이 여러분에게 관련이 있을 수 있는 경우:
- 스키마와 대부분의 중첩 속성/유형을 알고 있습니다.
- 데이터를 Map 유형으로 저장합니다.
- JSON을 문자열로 저장합니다.
- 선택한 컬럼에 변환 함수를 자주 적용합니다.

#### 테이블 정의 ALIAS 컬럼 {#table-defined-alias-columns}

ClickHouse는 컬럼 별칭을 내장하고 있으며, Grafana와 즉시 작동합니다. 별칭 컬럼은 직접 테이블에서 정의할 수 있습니다.

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

위 예제에서는 `TimestampDate`라는 별칭을 생성하여 나노초 타임스탬프를 `Date` 유형으로 변환합니다. 이 데이터는 첫 번째 컬럼처럼 디스크에 저장되지 않고 쿼리 시간에 계산됩니다. 테이블 정의 별칭은 `SELECT *`로 반환되지 않지만, 이는 서버 설정에서 구성할 수 있습니다.

자세한 내용은 [ALIAS](/sql-reference/statements/create/table#alias) 컬럼 유형 문서를 참조하십시오.

#### 컬럼 별칭 테이블 {#column-alias-tables}

기본적으로 Grafana는 `DESC table`의 응답을 기반으로 컬럼 제안을 제공합니다. 어떤 경우에는 Grafana가 보는 컬럼을 완전히 재정의하고 싶을 수도 있습니다. 이는 복잡한 테이블의 경우 사용자가 컬럼을 선택할 때 스키마를 숨기는 데 도움이 됩니다.

테이블 정의 별칭에 비해 이 점의 장점은 테이블을 변경하지 않고도 쉽게 업데이트할 수 있다는 것입니다. 일부 스키마에서는 수천 개의 항목이 있을 수 있기 때문에 기본 테이블 정의가 혼잡해질 수 있습니다. 또한 사용자가 무시하도록 하려는 컬럼을 숨기는 것을 허용합니다.

Grafana는 별칭 테이블에 다음과 같은 컬럼 구조를 요구합니다:
```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

별칭 테이블을 사용하여 `ALIAS` 컬럼의 동작을 복제할 수 있는 방법은 다음과 같습니다:
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

이를 Grafana에서 사용하도록 구성할 수 있습니다. 이름은 아무거나 지정할 수 있으며, 별도의 데이터베이스에 정의할 수도 있습니다:
<Image size="md" img={alias_table_config_example} alt="Example alias table config" border />

이제 Grafana는 `DESC example_table`의 결과 대신 별칭 테이블의 결과를 볼 수 있습니다:
<Image size="md" img={alias_table_select_example} alt="Example alias table select" border />

두 가지 유형의 별칭을 사용하여 복잡한 유형 변환이나 JSON 필드 추출을 수행할 수 있습니다.

## 모든 YAML 옵션 {#all-yaml-options}

이것은 플러그인에서 제공하는 모든 YAML 구성 옵션입니다. 일부 필드는 예시 값을 가지고 있으며, 다른 필드는 필드의 유형만을 보여줍니다.

[YAML로 데이터 소스를 프로비저닝하는 상세 정보](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)는 Grafana 문서를 참조하세요.

```yaml
datasources:
  - name: Example ClickHouse
    uid: clickhouse-example
    type: grafana-clickhouse-datasource
    jsonData:
      host: 127.0.0.1
      port: 9000
      protocol: native
      secure: false
      username: default
      tlsSkipVerify: <boolean>
      tlsAuth: <boolean>
      tlsAuthWithCACert: <boolean>
      defaultDatabase: default
      defaultTable: <string>
      dialTimeout: 10
      queryTimeout: 60
      validateSql: false
      httpHeaders:
      - name: X-Example-Plain-Header
        value: plain text value
        secure: false
      - name: X-Example-Secure-Header
        secure: true
      logs:
        defaultDatabase: default
        defaultTable: otel_logs
        otelEnabled: false
        otelVersion: latest
        timeColumn: <string>
        levelColumn: <string>
        messageColumn: <string>
      traces:
        defaultDatabase: default
        defaultTable: otel_traces
        otelEnabled: false
        otelVersion: latest
        traceIdColumn: <string>
        spanIdColumn: <string>
        operationNameColumn: <string>
        parentSpanIdColumn: <string>
        serviceNameColumn: <string>
        durationTimeColumn: <string>
        durationUnitColumn: <time unit>
        startTimeColumn: <string>
        tagsColumn: <string>
        serviceTagsColumn: <string>
    secureJsonData:
      tlsCACert:     <string>
      tlsClientCert: <string>
      tlsClientKey:  <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
