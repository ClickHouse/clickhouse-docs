---
title: '시스템 테이블 쿼리하기'
slug: /cloud/monitoring/system-tables
description: '시스템 테이블을 직접 쿼리해 ClickHouse Cloud 모니터링하기'
keywords: ['클라우드', '모니터링', '시스템 테이블', 'query_log', 'clusterAllReplicas', '관측성 대시보드']
sidebar_label: '시스템 테이블'
sidebar_position: 5
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';


# ClickHouse의 system 데이터베이스 쿼리 \{#querying-clickhouses-system-database\}

모든 ClickHouse 인스턴스에는 다음에 대한 정보를 담고 있는 `system` 데이터베이스의 [시스템 테이블](/operations/system-tables/overview) 집합이 함께 제공됩니다.

- 서버 상태, 프로세스 및 환경.
- 서버의 내부 프로세스.
- ClickHouse 바이너리가 빌드될 때 사용된 옵션.

이러한 테이블을 직접 쿼리하는 것은 ClickHouse 배포를 모니터링하는 데 유용하며, 특히 심층적인 내부 분석과 디버깅에 도움이 됩니다.

## ClickHouse Cloud 콘솔 사용하기 \{#using-cloud-console\}

ClickHouse Cloud 콘솔에는 시스템 테이블을 쿼리하는 데 사용할 수 있는 [SQL 콘솔](/cloud/get-started/sql-console)과 [대시보드 도구](/cloud/manage/dashboards)가 포함되어 있습니다. 예를 들어, 아래 쿼리는 지난 2시간 동안 새 파트가 몇 개 생성되었는지(그리고 얼마나 자주 생성되었는지)를 보여줍니다:

```sql
SELECT
    count() AS new_parts,
    toStartOfMinute(event_time) AS modification_time_m,
    table,
    sum(rows) AS total_written_rows,
    formatReadableSize(sum(size_in_bytes)) AS total_bytes_on_disk
FROM clusterAllReplicas(default, system.part_log)
WHERE (event_type = 'NewPart') AND (event_time > (now() - toIntervalHour(2)))
GROUP BY
    modification_time_m,
    table
ORDER BY
    modification_time_m ASC,
    table DESC
```

:::tip[추가 예시 쿼리]
추가 Monitoring 쿼리는 다음 리소스를 참조하십시오:

* [문제 해결에 유용한 쿼리](/knowledgebase/useful-queries-for-troubleshooting)
* [삽입 쿼리 모니터링 및 문제 해결](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
* [select 쿼리 모니터링 및 문제 해결](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

이 쿼리를 사용해 Cloud Console에서 [사용자 지정 dashboard를 생성](https://clickhouse.com/blog/essential-monitoring-queries-creating-a-dashboard-in-clickHouse-cloud)할 수도 있습니다.
:::


## 기본 제공 고급 관측성 대시보드 \{#built-in-advanced-observability-dashboard\}

ClickHouse에는 기본 제공 고급 관측성 대시보드 기능이 있으며, `$HOST:$PORT/dashboard`로 액세스할 수 있습니다(사용자 이름 및 비밀번호 필요). 이 대시보드는 `system.dashboards`에 포함된 Cloud Overview metrics를 표시합니다.

<Image img={NativeAdvancedDashboard} size="lg" alt="기본 제공 고급 관측성 대시보드" border />

:::note
이 대시보드는 ClickHouse 인스턴스에 직접 인증해야 하며, 추가 인증 없이 Cloud Console UI를 통해 액세스할 수 있는 [Cloud Console Advanced Dashboard](/cloud/monitoring/cloud-console#advanced-dashboard)와는 별개입니다.
:::

사용 가능한 시각화와 이를 문제 해결에 활용하는 방법에 대한 자세한 내용은 [고급 대시보드 문서](/cloud/manage/monitor/advanced-dashboard)를 참조하십시오.

## 노드와 버전 전반에서 쿼리하기 \{#querying-across-nodes\}

전체 클러스터를 포괄적으로 확인하려면 사용자는 `clusterAllReplicas` FUNCTION을 `merge` FUNCTION과 함께 활용할 수 있습니다. `clusterAllReplicas` FUNCTION을 사용하면 "default" 클러스터 내의 모든 레플리카에 있는 시스템 테이블을 쿼리할 수 있으며, 노드별 데이터를 하나의 통합된 결과로 모을 수 있습니다. 이를 `merge` FUNCTION과 함께 사용하면 클러스터에서 특정 테이블에 대한 모든 시스템 데이터를 대상으로 지정할 수 있습니다.

예를 들어, 지난 1시간 동안 모든 레플리카에서 가장 오래 실행된 상위 5개의 쿼리를 찾으려면 다음과 같이 합니다:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

이 접근 방식은 특히 클러스터 전반의 작업을 모니터링하고 디버깅하는 데 매우 유용하며, 사용자가 ClickHouse Cloud 배포의 상태와 성능을 효과적으로 분석할 수 있도록 해줍니다.

자세한 내용은 [노드 전체에서 쿼리하기](/operations/system-tables/overview#querying-across-nodes)를 참조하십시오.

## 시스템 관련 고려 사항 \{#system-considerations\}

:::warning
시스템 테이블을 직접 쿼리하면 프로덕션 서비스에 쿼리 부하가 추가되고, ClickHouse Cloud 인스턴스가 유휴 상태로 전환되지 않아 비용에 영향을 줄 수 있으며, 모니터링 가용성이 프로덕션 시스템 상태에 종속됩니다. 프로덕션 시스템에 장애가 발생하면 모니터링도 영향을 받을 수 있습니다.
:::

운영 환경을 분리한 실시간 프로덕션 모니터링이 필요하다면 [Prometheus 호환 metrics endpoint](/integrations/prometheus) 또는 [Cloud Console dashboards](/cloud/monitoring/cloud-console)를 고려하십시오. 둘 다 미리 수집된 metrics를 사용하며 기본 서비스에 쿼리를 실행하지 않습니다.

## 관련 페이지 \{#related\}

- [시스템 테이블 참조](/operations/system-tables/overview) — 사용 가능한 모든 시스템 테이블에 대한 전체 참조
- [Cloud Console 모니터링](/cloud/monitoring/cloud-console) — 서비스 성능에 영향을 주지 않는 별도 설정 없는 대시보드
- [Prometheus endpoint](/integrations/prometheus) — 외부 모니터링 도구로 메트릭을 내보냅니다
- [고급 대시보드](/cloud/manage/monitor/advanced-dashboard) — 대시보드 시각화에 대한 자세한 참조