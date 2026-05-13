---
slug: /cloud/managed-postgres/monitoring/metrics
sidebar_label: '메트릭 참고'
title: 'Managed Postgres 메트릭 참고'
description: 'Managed Postgres의 Prometheus 엔드포인트에 노출되는 메트릭 전체 목록'
keywords: ['Managed Postgres', '메트릭', 'Prometheus', '참고', '관측성']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# 메트릭 참고 \{#metrics-reference\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-metrics" />

이 페이지에는
[Managed Postgres Prometheus endpoint](/cloud/managed-postgres/monitoring/prometheus)에서 제공하는 모든 메트릭이 나열되어 있습니다.
설정 및 인증 방법은 [Prometheus 엔드포인트] 페이지를 참조하십시오.

## 공통 레이블 \{#common-labels\}

모든 메트릭에는 다음 레이블이 포함됩니다.

| 레이블                     | 설명              |
| ----------------------- | --------------- |
| `clickhouse_org`        | 조직 ID           |
| `postgres_service`      | Postgres 서비스 ID |
| `postgres_service_name` | Postgres 서비스 이름 |

일부 메트릭에는 세분화 기준이 되는 차원을 나타내는 레이블이 추가됩니다(예:
CPU 메트릭의 `mode`, 연결의 `state`, 데이터베이스
크기의 `database`). 이러한 레이블은 각 메트릭과 함께 나열됩니다.

## 정보 메트릭 \{#information-metric\}

`PostgresServiceInfo`는 값이 항상 `1`인 gauge이며, 레이블에
서비스의 현재 상태와 버전을 담고 있습니다. 이를 사용해
상태 정보를 다른 메트릭과 조인하거나, 서비스가
`running` 상태를 벗어날 때 알림을 설정할 수 있습니다.

| 메트릭                   | 유형    | 추가 레이블                                | 설명                            |
| --------------------- | ----- | ------------------------------------- | ----------------------------- |
| `PostgresServiceInfo` | gauge | `postgres_status`, `postgres_version` | 서비스당 하나의 시계열이며, 값은 항상 `1`입니다. |

`postgres_status`는 서비스의 현재 수명 주기 상태를 나타냅니다
(예: `running`, `creating`, `stopped`). `postgres_version`은
Postgres의 메이저 버전(예: `17`, `18`)을 나타냅니다.

## 용량 \{#capacity\}

서비스에 프로비저닝된 정적 한도입니다. 이 값은
서비스 크기를 조정할 때만 변경됩니다.

| 메트릭                                | 유형    | 단위    | 설명                    |
| ---------------------------------- | ----- | ----- | --------------------- |
| `PostgresServer_CPUCores`          | gauge | cores | 서비스에 할당된 CPU 코어 수입니다. |
| `PostgresServer_MemoryLimitBytes`  | gauge | bytes | 서비스에 할당된 메모리 용량입니다.   |
| `PostgresServer_StorageLimitBytes` | gauge | bytes | 서비스에 할당된 스토리지 용량입니다.  |

## 리소스 사용량 \{#resource-utilization\}

| 메트릭                                    | 유형      | 추가 레이블 | 설명                                                                                               |
| -------------------------------------- | ------- | ------ | ------------------------------------------------------------------------------------------------ |
| `PostgresServer_CPUSeconds_Total`      | counter | `mode` | 사용된 CPU 시간입니다. `user`, `system`, `iowait`, `softirq`, `steal`, `irq`, `nice`, `idle` 모드별로 구분됩니다. |
| `PostgresServer_MemoryUsedPercent`     | gauge   |        | `PostgresServer_MemoryLimitBytes` 대비 사용 중인 메모리의 백분율입니다.                                          |
| `PostgresServer_MemoryCachePercent`    | gauge   |        | 캐시와 버퍼가 사용하는 메모리의 비율로, 전체 메모리 대비 백분율입니다.                                                         |
| `PostgresServer_FilesystemUsedPercent` | gauge   |        | 사용 중인 파일시스템 공간의 비율로, 전체 스토리지 대비 백분율입니다.                                                          |

CPU 사용량을 백분율로 계산하려면,
확인하려는 모드에 대한 `PostgresServer_CPUSeconds_Total`의 rate를 구한 다음
이를 `PostgresServer_CPUCores`로 나누십시오.

## 디스크 및 네트워크 I/O \{#io\}

| 메트릭                                         | 유형      | 단위    | 설명                 |
| ------------------------------------------- | ------- | ----- | ------------------ |
| `PostgresServer_DiskReads_Total`            | counter | ops   | 디스크 읽기 작업 완료 횟수    |
| `PostgresServer_DiskWrites_Total`           | counter | ops   | 디스크 쓰기 작업 완료 횟수    |
| `PostgresServer_NetworkReceiveBytes_Total`  | counter | bytes | 네트워크를 통해 수신한 바이트 수 |
| `PostgresServer_NetworkTransmitBytes_Total` | counter | bytes | 네트워크를 통해 전송한 바이트 수 |

## 데이터베이스 활동 \{#database-activity\}

서비스 시작 이후 누적된 카운터입니다. `rate()` 또는 `irate()`를 사용해
초당 값으로 변환하세요.

| 메트릭                                           | 유형      | 설명               |
| --------------------------------------------- | ------- | ---------------- |
| `PostgresServer_TuplesFetched_Total`          | counter | 쿼리에서 가져온 행 수입니다. |
| `PostgresServer_TuplesInserted_Total`         | counter | 삽입된 행 수입니다.      |
| `PostgresServer_TuplesUpdated_Total`          | counter | 업데이트된 행 수입니다.    |
| `PostgresServer_TuplesDeleted_Total`          | counter | 삭제된 행 수입니다.      |
| `PostgresServer_TransactionsCommitted_Total`  | counter | 커밋된 트랜잭션 수입니다.   |
| `PostgresServer_TransactionsRolledBack_Total` | counter | 롤백된 트랜잭션 수입니다.   |
| `PostgresServer_Deadlocks_Total`              | counter | 감지된 교착 상태 수입니다.  |

## 연결, 캐시 및 데이터베이스 크기 \{#connections-cache-size\}

| 메트릭                                | 유형    | 추가 레이블     | 설명                                                                         |
| ---------------------------------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `PostgresServer_ActiveConnections` | gauge | `state`    | 상태별 연결 수입니다(예: `active`, `idle`).                                          |
| `PostgresServer_CacheHitRatio`     | gauge |            | 버퍼 캐시 적중률입니다. 전체 접근 블록 중 캐시에서 제공된 블록의 비율을 백분율로 나타냅니다.                      |
| `PostgresServer_DatabaseSizeBytes` | gauge | `database` | 각 데이터베이스의 디스크 크기(바이트)입니다. 기본 `postgres` 데이터베이스와 사용자가 생성한 모든 데이터베이스를 포함합니다. |

## 관련 페이지 \{#related\}

* [Prometheus 엔드포인트] — 설정, 인증 및 스크레이프
* [대시보드](/cloud/managed-postgres/monitoring/dashboard) — Cloud Console에 기본 제공되는 차트
* [OpenAPI 가이드](/cloud/managed-postgres/openapi) — API key 생성
  및 organization 및 service ID 확인

[Prometheus 엔드포인트]: /cloud/managed-postgres/monitoring/prometheus