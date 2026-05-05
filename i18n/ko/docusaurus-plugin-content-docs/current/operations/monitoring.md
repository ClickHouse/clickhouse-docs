---
description: '하드웨어 리소스 사용량과 ClickHouse 서버 메트릭을 모니터링할 수 있습니다.'
keywords: ['monitoring', '관측성', '고급 대시보드', '대시보드', '관측성 대시보드']
sidebar_label: '모니터링'
sidebar_position: 45
slug: /operations/monitoring
title: '모니터링'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';


# 모니터링 \{#monitoring\}

:::note
이 가이드에서 설명하는 모니터링 데이터는 ClickHouse Cloud에서 확인할 수 있습니다. 아래에 설명된 기본 제공 대시보드에 표시될 뿐만 아니라, 기본 및 고급 성능 지표를 모두 메인 서비스 콘솔에서 직접 조회할 수도 있습니다.
:::

다음을 모니터링할 수 있습니다:

- 하드웨어 리소스 사용률
- ClickHouse 서버 메트릭



## 기본 제공 고급 관측성 대시보드 \{#built-in-advanced-observability-dashboard\}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="스크린샷 2023-11-12 오후 6:08:58" size="md" />

ClickHouse에는 기본 제공되는 고급 관측성 대시보드가 있으며, `$HOST:$PORT/dashboard`(사용자 이름과 비밀번호 필요)를 통해 액세스할 수 있습니다. 이 대시보드는 다음과 같은 메트릭을 보여 줍니다:
- 초당 쿼리 수
- CPU 사용량(코어)
- 실행 중인 쿼리 수
- 실행 중인 머지 작업 수
- 초당 선택된 바이트 수
- I/O 대기 시간
- CPU 대기 시간
- OS CPU 사용률(사용자 공간)
- OS CPU 사용률(커널 공간)
- 디스크 읽기
- 파일 시스템 읽기
- 메모리(추적)
- 초당 삽입된 행 수
- 전체 MergeTree 파트 수
- 파티션당 최대 파트 수



## 리소스 사용률 \{#resource-utilization\}

ClickHouse는 다음과 같은 하드웨어 리소스의 상태도 자체적으로 모니터링합니다:

- 프로세서의 부하 및 온도
- 스토리지 시스템, RAM 및 네트워크의 사용률

이 데이터는 `system.asynchronous_metric_log` 테이블에 수집됩니다.



## ClickHouse server metrics \{#clickhouse-server-metrics\}

ClickHouse 서버에는 자체 상태 모니터링을 위한 도구가 내장되어 있습니다.

서버 이벤트를 추적하려면 서버 로그를 사용하십시오. 설정 파일의 [logger](../operations/server-configuration-parameters/settings.md#logger) 섹션을 참조하십시오.

ClickHouse는 다음을 수집합니다:

- 서버가 연산 자원(컴퓨팅 리소스)을 어떻게 사용하는지에 대한 다양한 메트릭.
- 쿼리 처리에 대한 일반적인 통계.

메트릭은 [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events), [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 확인할 수 있습니다.

ClickHouse가 메트릭을 [Graphite](https://github.com/graphite-project)로 내보내도록 설정할 수 있습니다. ClickHouse 서버 설정 파일의 [Graphite 섹션](../operations/server-configuration-parameters/settings.md#graphite)을 참조하십시오. 메트릭 내보내기를 설정하기 전에 공식 [가이드](https://graphite.readthedocs.io/en/latest/install.html)를 따라 먼저 Graphite를 설정해야 합니다.

ClickHouse가 메트릭을 [Prometheus](https://prometheus.io)로 내보내도록 설정할 수 있습니다. ClickHouse 서버 설정 파일의 [Prometheus 섹션](../operations/server-configuration-parameters/settings.md#prometheus)을 참조하십시오. 메트릭 내보내기를 설정하기 전에 공식 [가이드](https://prometheus.io/docs/prometheus/latest/installation/)를 따라 먼저 Prometheus를 설정해야 합니다.

또한 HTTP API를 통해 서버 가용성을 모니터링할 수 있습니다. `HTTP GET` 요청을 `/ping`으로 전송하십시오. 서버가 정상적으로 동작 중이면 `200 OK`로 응답합니다.

클러스터 구성에서 서버를 모니터링하려면 [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) 파라미터를 설정하고 HTTP 리소스 `/replicas_status`를 사용해야 합니다. `/replicas_status`에 대한 요청은 레플리카가 사용 가능하며 다른 레플리카보다 지연되지 않은 경우 `200 OK`를 반환합니다. 레플리카가 지연된 경우, 지연 시간에 대한 정보와 함께 `503 HTTP_SERVICE_UNAVAILABLE`을 반환합니다.
