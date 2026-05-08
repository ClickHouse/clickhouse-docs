---
sidebar_label: '모니터링'
description: 'Prometheus 메트릭으로 ClickPipes를 모니터링합니다.'
slug: /integrations/clickpipes/monitoring
title: 'ClickPipes 모니터링'
doc_type: 'reference'
keywords: ['ClickPipes', '모니터링', '메트릭', 'Prometheus', '관측성']
---

# ClickPipes 모니터링 \{#monitoring-clickpipes\}

Console에서 제공되는 모니터링 외에도, ClickPipes는 스크레이핑할 수 있도록 [Prometheus 호환 엔드포인트](/integrations/prometheus)에 메트릭을 노출합니다. 이러한 메트릭은 다른 ClickHouse Cloud 서비스 메트릭과 함께 제공되며, 기존 관측성 스택에 ClickPipes 모니터링을 통합할 수 있습니다(예: [Grafana](/integrations/prometheus#integrating-with-grafana), [Datadog](/integrations/prometheus#integrating-with-datadog)).

## 메트릭 레이블 \{#metric-labels\}

ClickPipes 메트릭은 [표준 서비스 수준 레이블](/integrations/prometheus#metric-labels) (`clickhouse_org`, `clickhouse_service`, `clickhouse_service_name`)과 다음 ClickPipes 전용 레이블을 사용합니다:

| 레이블                | 설명                                                     |
| ------------------ | ------------------------------------------------------ |
| `clickpipe_id`     | ClickPipe의 고유 식별자                                      |
| `clickpipe_name`   | ClickPipe의 이름                                          |
| `clickpipe_source` | 소스 유형(예: `kafka`, `postgres`, `s3`)                    |
| `clickpipe_state`  | ClickPipe의 상태(예: `Stopped`, `Provisioning`, `Running`) |

### 응답 예시 \{#sample-response\}

다음은 Prometheus 스크레이프 응답에 표시되는 ClickPipes 메트릭의 예입니다:

```response
# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent",clickpipe_state="Running"} 1

# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5535376

# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_Errors_Total Total errors ingesting data.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_Latency Time in milliseconds between when the record was produced to when it was written to ClickHouse.
# TYPE ClickPipes_Latency gauge
ClickPipes_Latency{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 340
```

## 사용 가능한 메트릭 \{#available-metrics\}

### 데이터 전송 \{#metrics-data-transfer\}

| 메트릭                                     | 유형      | 설명                                                                                  |
| ------------------------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `ClickPipes_FetchedBytes_Total`            | Counter | 소스에서 가져온 총 비압축 바이트 수입니다.                                                            |
| `ClickPipes_FetchedBytesCompressed_Total`  | Counter | 소스에서 가져온 총 압축 바이트 수입니다. 소스 데이터가 비압축 데이터인 경우 `ClickPipes_FetchedBytes_Total`와 동일합니다. |
| `ClickPipes_FetchedBytesInitialLoad_Total` | Counter | **CDC ClickPipes** 초기 적재 단계에서 가져온 총 비압축 바이트 수입니다.                                   |
| `ClickPipes_FetchedBytesResync_Total`      | Counter | **CDC ClickPipes** 재동기화 작업 중 가져온 총 비압축 바이트 수입니다.                                    |
| `ClickPipes_SentBytes_Total`               | Counter | ClickHouse로 전송한 총 비압축 바이트 수입니다.                                                     |
| `ClickPipes_SentBytesCompressed_Total`     | Counter | ClickHouse로 전송한 총 압축 바이트 수입니다.                                                      |

### 이벤트 및 레코드 \{#metrics-events\}

| 메트릭                              | 유형      | 설명                                                                                                   |
| ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `ClickPipes_FetchedEvents_Total`    | Counter | 소스에서 가져온 레코드의 총수입니다.                                                                                 |
| `ClickPipes_SentEvents_Total`       | Counter | ClickHouse로 전송한 레코드의 총수입니다.                                                                          |
| `ClickPipes_FetchedEvents_PerTable` | Gauge   | **CDC ClickPipes** 대상 테이블 및 이벤트 유형별로 가져온 레코드 수입니다. 추가 `destination_table` 및 `event_type` 레이블을 사용합니다. |

### 오류 \{#metrics-errors\}

| 메트릭                       | 유형      | 설명                                                              |
| ------------------------- | ------- | --------------------------------------------------------------- |
| `ClickPipes_Errors_Total` | Counter | 수집 중 발생한 [오류](/integrations/clickpipes#error-reporting)의 총수입니다. |

### 지연 시간 \{#metrics-latency\}

| 메트릭                                        | 유형            | 설명                                                                                                   |
| ----------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `ClickPipes_Latency`                      | Gauge (*avg*) | 소스에서 레코드가 생성된 시점부터 ClickHouse에 기록될 때까지 걸리는 시간(밀리초)입니다.                                               |
| `ClickPipes_SourceReplicationLatency_MiB` | Gauge (*avg*) | **CDC ClickPipes**의 소스 복제 지연을 MiB 단위로 나타냅니다. Postgres ClickPipes에서는 이 값이 replication slot 지연을 반영합니다. |

### 리소스 사용량 \{#metrics-resources\}

| 메트릭                               | 유형             | 설명                                  |
| -------------------------------- | -------------- | ----------------------------------- |
| `ClickPipes_Replica_CPUUsage`    | Gauge (*avg*)  | 수집 레플리카의 평균 CPU 사용량이며, 단위는 밀리코어입니다. |
| `ClickPipes_Replica_CPULimit`    | Gauge (*last*) | 수집 레플리카에 설정된 CPU 제한이며, 단위는 밀리코어입니다. |
| `ClickPipes_Replica_MemoryUsage` | Gauge (*avg*)  | 수집 레플리카의 평균 메모리 사용량이며, 단위는 바이트입니다.  |
| `ClickPipes_Replica_MemoryLimit` | Gauge (*last*) | 수집 레플리카에 설정된 메모리 제한이며, 단위는 바이트입니다.  |

### 상태 및 진행 상황 \{#metrics-state\}

| 메트릭                          | 유형    | 설명                                                                 |
| ------------------------------- | ----- | ------------------------------------------------------------------ |
| `ClickPipes_Info`               | Gauge | 항상 `1`입니다. `clickpipe_state` 레이블을 사용해 파이프라인 상태별로 필터링하거나 알림을 설정합니다. |
| `ClickPipes_LastFetchedBatchId` | Gauge | 소스에서 마지막으로 가져온 배치 ID입니다.                                           |
| `ClickPipes_LastSentBatchId`    | Gauge | ClickHouse로 마지막으로 전송한 배치 ID입니다.                                    |

## 관련 페이지 \{#related\}

* [Prometheus 엔드포인트](/integrations/prometheus) — 외부 도구(예: Grafana, Datadog)용 엔드포인트 참조, 인증 및 설정
* [오류 리포팅](/integrations/clickpipes#error-reporting) — 레코드 오류와 시스템 오류가 저장되는 위치