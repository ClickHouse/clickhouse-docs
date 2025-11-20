---
'description': '하드웨어 자원의 사용량과 ClickHouse 서버 메트릭스를 모니터링할 수 있습니다.'
'keywords':
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
'sidebar_label': '모니터링'
'sidebar_position': 45
'slug': '/operations/monitoring'
'title': '모니터링'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';


# 모니터링

:::note
이 가이드에 설명된 모니터링 데이터는 ClickHouse Cloud에서 접근할 수 있습니다. 아래에 설명된 내장 대시보드를 통해 표시되는 것 외에도, 기본 및 고급 성능 메트릭도 주요 서비스 콘솔에서 직접 볼 수 있습니다.
:::

모니터링할 수 있는 항목:

- 하드웨어 자원 활용도.
- ClickHouse 서버 메트릭.

## 내장된 고급 관찰 대시보드 {#built-in-advanced-observability-dashboard}

<Image img="https://github.com/ClickHouse/ClickHouse/assets/3936029/2bd10011-4a47-4b94-b836-d44557c7fdc1" alt="스크린샷 2023-11-12 오후 6 08 58" size="md" />

ClickHouse는 `$HOST:$PORT/dashboard`를 통해 접근할 수 있는 내장된 고급 관찰 대시보드 기능을 제공합니다(사용자 이름과 비밀번호 필요)로 다음과 같은 메트릭을 보여줍니다:
- 초당 쿼리 수
- CPU 사용량 (코어)
- 실행 중인 쿼리 수
- 실행 중인 머지 수
- 초당 선택된 바이트 수
- IO 대기
- CPU 대기
- OS CPU 사용량 (유저 스페이스)
- OS CPU 사용량 (커널)
- 디스크에서 읽기
- 파일 시스템에서 읽기
- 메모리 (추적됨)
- 초당 삽입된 행 수
- 총 MergeTree 파트 수
- 파티션당 최대 파트 수

## 자원 활용도 {#resource-utilization}

ClickHouse는 또한 다음과 같은 하드웨어 자원의 상태를 스스로 모니터링합니다:

- 프로세서의 부하 및 온도.
- 저장 시스템, RAM 및 네트워크의 활용도.

이 데이터는 `system.asynchronous_metric_log` 테이블에 수집됩니다.

## ClickHouse 서버 메트릭 {#clickhouse-server-metrics}

ClickHouse 서버는 자가 상태 모니터링을 위한 내장 도구를 가지고 있습니다.

서버 이벤트를 추적하려면 서버 로그를 사용하세요. 구성 파일의 [logger](../operations/server-configuration-parameters/settings.md#logger) 섹션을 참조하세요.

ClickHouse는 다음을 수집합니다:

- 서버가 컴퓨팅 자원을 사용하는 방식에 대한 다양한 메트릭.
- 쿼리 처리에 대한 일반 통계.

메트릭은 [system.metrics](/operations/system-tables/metrics), [system.events](/operations/system-tables/events), [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) 테이블에서 찾을 수 있습니다.

ClickHouse를 구성하여 [Graphite](https://github.com/graphite-project)로 메트릭을 내보내도록 설정할 수 있습니다. ClickHouse 서버 구성 파일의 [Graphite 섹션](../operations/server-configuration-parameters/settings.md#graphite)을 참조하세요. 메트릭 내보내기 구성을 하기 전에, 공식 [가이드](https://graphite.readthedocs.io/en/latest/install.html)에 따라 Graphite를 설정해야 합니다.

ClickHouse를 구성하여 [Prometheus](https://prometheus.io)로 메트릭을 내보내도록 할 수 있습니다. ClickHouse 서버 구성 파일의 [Prometheus 섹션](../operations/server-configuration-parameters/settings.md#prometheus)을 참조하세요. 메트릭 내보내기 구성을 하기 전에, 공식 [가이드](https://prometheus.io/docs/prometheus/latest/installation/)에 따라 Prometheus를 설정해야 합니다.

추가로, HTTP API를 통해 서버 가용성을 모니터링할 수 있습니다. `/ping`에 `HTTP GET` 요청을 보내면, 서버가 가용한 경우 `200 OK`로 응답합니다.

클러스터 구성에서 서버를 모니터링하려면 [max_replica_delay_for_distributed_queries](../operations/settings/settings.md#max_replica_delay_for_distributed_queries) 매개변수를 설정하고 HTTP 리소스 `/replicas_status`를 사용해야 합니다. `/replicas_status`에 대한 요청은 복제본이 가용하고 다른 복제본에 비해 지연되지 않은 경우 `200 OK`를 반환합니다. 복제본이 지연된 경우, 간격에 대한 정보와 함께 `503 HTTP_SERVICE_UNAVAILABLE`을 반환합니다.
