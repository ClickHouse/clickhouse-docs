---
'description': 'ClickHouse의 Prometheus 프로토콜 지원에 대한 문서'
'sidebar_label': '프라메테우스 프로토콜'
'sidebar_position': 19
'slug': '/interfaces/prometheus'
'title': '프라메테우스 프로토콜'
'doc_type': 'reference'
---


# Prometheus 프로토콜

## 메트릭 노출 {#expose}

:::note
ClickHouse Cloud를 사용하고 있는 경우, [Prometheus 통합](/integrations/prometheus)을 사용하여 메트릭을 Prometheus에 노출할 수 있습니다.
:::

ClickHouse는 Prometheus에서 스크랩할 수 있도록 자체 메트릭을 노출할 수 있습니다:

```xml
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
```

설정:

| 이름                         | 기본값    | 설명                                                                                                                                                                                  |
|------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | 없음       | 메트릭 노출 프로토콜을 제공하는 포트.                                                                                                                                              |
| `endpoint`                   | `/metrics` | prometheus 서버가 메트릭을 스크랩하기 위한 HTTP 엔드포인트. `/`로 시작해야 합니다. `<handlers>` 섹션과 함께 사용해서는 안 됩니다.                                                                  |
| `url` / `headers` / `method` | 없음       | 요청에 대한 일치하는 핸들러를 찾기 위해 사용되는 필터. [`<http_handlers>`](/interfaces/http) 섹션의 동일한 이름을 가진 필드와 유사합니다.                                    |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics) 테이블에서 메트릭을 노출합니다.                                                                                                        |
| `asynchronous_metrics`       | true       | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 현재 메트릭 값을 노출합니다.                                                               |
| `events`                     | true       | [system.events](/operations/system-tables/events) 테이블에서 메트릭을 노출합니다.                                                                                                          |
| `errors`                     | true       | 마지막 서버 재시작 이후 발생한 오류 코드별 오류 수를 노출합니다. 이 정보는 [system.errors](/operations/system-tables/errors)에서도 얻을 수 있습니다. |
| `histograms`                 | true       | [system.histogram_metrics](/operations/system-tables/histogram_metrics)에서 히스토그램 메트릭을 노출합니다. |
| `dimensional_metrics`        | true       | [system.dimensional_metrics](/operations/system-tables/dimensional_metrics)에서 차원 메트릭을 노출합니다. |

확인 (여기서 `127.0.0.1`을 ClickHouse 서버의 IP 주소 또는 호스트 이름으로 대체하십시오):
```bash
curl 127.0.0.1:9363/metrics
```

## 원격 쓰기 프로토콜 {#remote-write}

ClickHouse는 [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) 프로토콜을 지원합니다.
데이터는 이 프로토콜을 통해 수신되어 [TimeSeries](/engines/table-engines/special/time_series) 테이블에 기록됩니다
(사전에 생성되어야 함).

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

설정:

| 이름                         | 기본값 | 설명                                                                                                                                                                                         |
|------------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | 없음    | `remote-write` 프로토콜을 제공하는 포트.                                                                                                                                                       |
| `url` / `headers` / `method` | 없음    | 요청에 대한 일치하는 핸들러를 찾기 위해 사용되는 필터. [`<http_handlers>`](/interfaces/http) 섹션의 동일한 이름을 가진 필드와 유사합니다.                                           |
| `table`                      | 없음    | `remote-write` 프로토콜을 통해 수신된 데이터를 기록할 [TimeSeries](/engines/table-engines/special/time_series) 테이블의 이름. 이 이름에는 선택적으로 데이터베이스 이름도 포함될 수 있습니다. |
| `database`                   | 없음    | `table` 설정에 지정되지 않은 경우, 지정된 테이블이 위치한 데이터베이스의 이름.                                                                    |

## 원격 읽기 프로토콜 {#remote-read}

ClickHouse는 [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) 프로토콜을 지원합니다.
데이터는 [TimeSeries](/engines/table-engines/special/time_series) 테이블에서 읽혀져 이 프로토콜을 통해 전송됩니다.

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

설정:

| 이름                         | 기본값 | 설명                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | 없음    | `remote-read` 프로토콜을 제공하는 포트.                                                                                                                                                     |
| `url` / `headers` / `method` | 없음    | 요청에 대한 일치하는 핸들러를 찾기 위해 사용되는 필터. [`<http_handlers>`](/interfaces/http) 섹션의 동일한 이름을 가진 필드와 유사합니다.                                        |
| `table`                      | 없음    | `remote-read` 프로토콜을 통해 데이터를 전송할 [TimeSeries](/engines/table-engines/special/time_series) 테이블의 이름. 이 이름에는 선택적으로 데이터베이스 이름도 포함될 수 있습니다. |
| `database`                   | 없음    | `table` 설정에 지정되지 않은 경우, 지정된 테이블이 위치한 데이터베이스의 이름.                                                                 |

## 여러 프로토콜 구성 {#multiple-protocols}

여러 프로토콜을 한 곳에서 함께 지정할 수 있습니다:

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
