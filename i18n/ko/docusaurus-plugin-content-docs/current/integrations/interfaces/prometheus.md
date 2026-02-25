---
description: 'ClickHouse의 Prometheus 프로토콜 지원 문서'
sidebar_label: 'Prometheus 프로토콜'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus 프로토콜'
doc_type: 'reference'
---

# Prometheus 프로토콜 \{#prometheus-protocols\}

## 메트릭 노출 \{#expose\}

:::note
ClickHouse Cloud를 사용하는 경우 [Prometheus Integration](/integrations/prometheus)을(를) 사용하여 Prometheus로 메트릭을 내보낼 수 있습니다.
:::

ClickHouse는 Prometheus에서 수집할 수 있도록 자체 메트릭을 노출합니다.

````xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
    <histograms>true</histograms>
    <dimensional_metrics>true</dimensional_metrics>
</prometheus>

Section `<prometheus.handlers>` can be used to make more extended handlers.
This section is similar to [<http_handlers>](/interfaces/http) but works for prometheus protocols:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
````

설정:

| Name                         | Default    | Description                                                                                                      |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | 메트릭 프로토콜을 노출하는 포트입니다.                                                                                            |
| `endpoint`                   | `/metrics` | Prometheus 서버가 메트릭을 스크레이핑하기 위한 HTTP 엔드포인트입니다. `/`로 시작해야 합니다. `<handlers>` 섹션과 함께 사용해서는 안 됩니다.                    |
| `url` / `headers` / `method` | none       | 요청에 대해 일치하는 핸들러를 찾는 데 사용되는 필터입니다. [`<http_handlers>`](/interfaces/http) 섹션의 동일한 이름을 갖는 필드와 유사합니다.                |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics) 테이블에서 메트릭을 노출합니다.                                            |
| `asynchronous_metrics`       | true       | [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 현재 메트릭 값을 노출합니다.         |
| `events`                     | true       | [system.events](/operations/system-tables/events) 테이블에서 메트릭을 노출합니다.                                              |
| `errors`                     | true       | 마지막 서버 재시작 이후 발생한 오류 코드별 오류 개수를 노출합니다. 이 정보는 [system.errors](/operations/system-tables/errors) 테이블에서도 얻을 수 있습니다. |
| `histograms`                 | true       | [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) 테이블에서 히스토그램 메트릭을 노출합니다.              |
| `dimensional_metrics`        | true       | [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics) 테이블에서 차원 메트릭을 노출합니다.             |

다음을 통해 확인하십시오 (`127.0.0.1`을 ClickHouse 서버의 IP 주소나 호스트 이름으로 바꾸십시오):

```bash
curl 127.0.0.1:9363/metrics
```

## Remote-write 프로토콜

ClickHouse는 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 프로토콜을 지원합니다.
데이터는 해당 프로토콜을 통해 수신되어 [TimeSeries](/engines/table-engines/special/time_series) 테이블에 기록됩니다
(테이블은 미리 생성해 두어야 합니다).

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

Settings:

| Name                         | Default | Description                                                                                                                                |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | `remote-write` 프로토콜을 서비스하는 포트입니다.                                                                                                          |
| `url` / `headers` / `method` | none    | 요청에 대해 일치하는 핸들러를 찾는 데 사용되는 필터입니다. [`<http_handlers>`](/interfaces/http) 섹션에 있는 동일한 이름의 필드와 유사합니다.                                          |
| `table`                      | none    | `remote-write` 프로토콜로 수신한 데이터를 기록할 [TimeSeries](/engines/table-engines/special/time_series) 테이블의 이름입니다. 이 이름에는 선택적으로 데이터베이스 이름도 포함할 수 있습니다. |
| `database`                   | none    | `table` 설정에 데이터베이스 이름이 지정되지 않은 경우, `table` 설정에 지정된 테이블이 위치한 데이터베이스의 이름입니다.                                                                 |

## remote-read 프로토콜

ClickHouse는 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 프로토콜을 지원합니다.
데이터는 [TimeSeries](/engines/table-engines/special/time_series) 테이블에서 읽은 후 이 프로토콜을 통해 전송됩니다.

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

Settings:

| Name                         | Default | Description                                                                                                                                   |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | `remote-read` 프로토콜을 제공하는 포트입니다.                                                                                                               |
| `url` / `headers` / `method` | none    | 요청에 대해 일치하는 핸들러를 찾는 데 사용되는 필터입니다. [`<http_handlers>`](/interfaces/http) 섹션의 동일한 이름을 가진 필드와 유사합니다.                                             |
| `table`                      | none    | `remote-read` 프로토콜로 전송할 데이터를 읽기 위한 [TimeSeries](/engines/table-engines/special/time_series) 테이블 이름입니다. 이 이름에는 선택적으로 데이터베이스 이름을 함께 포함할 수 있습니다. |
| `database`                   | none    | `table` 설정에 데이터베이스 이름이 지정되지 않은 경우, `table` 설정에 지정된 테이블이 위치한 데이터베이스 이름입니다.                                                                     |

## 여러 프로토콜 설정

여러 프로토콜을 하나의 위치에서 함께 지정할 수 있습니다:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
        <my_rule_2>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_2>
        <my_rule_3>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_3>
    </handlers>
</prometheus>
```
