---
description: 'system 테이블이 무엇이며 왜 유용한지 설명하는 개요입니다.'
keywords: ['system 테이블', '개요']
sidebar_label: '개요'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'system 테이블 개요'
doc_type: 'reference'
---



## 시스템 테이블 개요 \{#system-tables-introduction\}

시스템 테이블은 다음과 같은 정보를 제공합니다:

* 서버 상태, 프로세스 및 환경
* 서버의 내부 프로세스
* ClickHouse 바이너리를 빌드할 때 사용된 옵션

시스템 테이블은 다음과 같은 특징이 있습니다:

* `system` 데이터베이스에 위치합니다.
* 데이터 읽기 전용으로만 사용할 수 있습니다.
* 삭제하거나 변경(`ALTER`)할 수 없지만 분리(detach)할 수는 있습니다.

대부분의 시스템 테이블은 데이터를 RAM에 저장합니다. ClickHouse 서버는 시작 시 이러한 시스템 테이블을 생성합니다.

다른 시스템 테이블과 달리, 시스템 로그 테이블인 [metric&#95;log](../../operations/system-tables/metric_log.md), [query&#95;log](../../operations/system-tables/query_log.md), [query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md), [trace&#95;log](../../operations/system-tables/trace_log.md), [part&#95;log](../../operations/system-tables/part_log.md), [crash&#95;log](../../operations/system-tables/crash_log.md), [text&#95;log](../../operations/system-tables/text_log.md), [backup&#95;log](../../operations/system-tables/backup_log.md)는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블 엔진을 사용하며, 기본적으로 파일 시스템에 데이터를 저장합니다. 파일 시스템에서 테이블을 제거하면 ClickHouse 서버는 다음 데이터 쓰기 시점에 빈 테이블을 다시 생성합니다. 새 릴리스에서 시스템 테이블 스키마가 변경된 경우 ClickHouse는 현재 테이블의 이름을 변경하고 새 테이블을 생성합니다.

시스템 로그 테이블은 `/etc/clickhouse-server/config.d/` 아래에 테이블과 동일한 이름의 설정 파일을 생성하거나, `/etc/clickhouse-server/config.xml`에서 해당 요소를 설정하여 구성할 수 있습니다. 구성할 수 있는 요소는 다음과 같습니다:

* `database`: 시스템 로그 테이블이 속하는 데이터베이스. 이 옵션은 현재 사용 중단(deprecated)되었습니다. 모든 시스템 로그 테이블은 `system` 데이터베이스 아래에 있습니다.
* `table`: 데이터를 삽입할 테이블.
* `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 식을 지정합니다.
* `ttl`: 테이블 [TTL](../../sql-reference/statements/alter/ttl.md) 식을 지정합니다.
* `flush_interval_milliseconds`: 디스크로 데이터를 플러시하는 간격.
* `engine`: 파라미터와 함께 전체 엔진 식(`ENGINE =` 으로 시작)을 지정합니다. 이 옵션은 `partition_by` 및 `ttl`과 충돌합니다. 함께 설정하면 서버는 예외를 발생시키고 종료합니다.

예시는 다음과 같습니다:

```xml
<clickhouse>
    <query_log>
        <database>system</database>
        <table>query_log</table>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <ttl>event_date + INTERVAL 30 DAY DELETE</ttl>
        <!--
        <engine>ENGINE = MergeTree PARTITION BY toYYYYMM(event_date) ORDER BY (event_date, event_time) SETTINGS index_granularity = 1024</engine>
        -->
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_log>
</clickhouse>
```

기본적으로 테이블 크기에는 제한이 없습니다. 테이블 크기를 제어하려면 오래된 로그 레코드를 제거하기 위한 [TTL](/sql-reference/statements/alter/ttl) 설정을 사용할 수 있습니다. 또한 `MergeTree` 엔진 기반 테이블의 파티션 기능을 사용할 수도 있습니다.


## 시스템 메트릭의 소스 \{#system-tables-sources-of-system-metrics\}

시스템 메트릭을 수집하기 위해 ClickHouse 서버는 다음을 사용합니다:

- `CAP_NET_ADMIN` capability
- [procfs](https://en.wikipedia.org/wiki/Procfs) (Linux에서만 지원)

**procfs**

ClickHouse 서버에 `CAP_NET_ADMIN` capability가 없는 경우 `ProcfsMetricsProvider`를 사용하도록 대체합니다. `ProcfsMetricsProvider`는 쿼리별 시스템 메트릭(CPU 및 I/O)을 수집할 수 있게 합니다.

시스템에서 procfs가 지원되며 활성화되어 있으면 ClickHouse 서버는 다음 메트릭을 수집합니다:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds`는 Linux 커널 5.14.x 이상에서 기본적으로 비활성화되어 있습니다.
`sudo sysctl kernel.task_delayacct=1` 명령을 사용하거나 `/etc/sysctl.d/` 디렉터리에 `kernel.task_delayacct = 1`이 포함된 `.conf` 파일을 생성하여 활성화할 수 있습니다.
:::



## ClickHouse Cloud의 시스템 테이블 \{#system-tables-in-clickhouse-cloud\}

ClickHouse Cloud에서 시스템 테이블은 자가 관리형 배포에서와 마찬가지로 서비스의 상태와 성능에 대한 중요한 정보를 제공합니다. 일부 시스템 테이블은 특히 분산 메타데이터를 관리하는 Keeper 노드에서 데이터를 가져오기 때문에 클러스터 전역 수준에서 동작합니다. 이러한 테이블은 클러스터의 전체 상태를 반영하며, 개별 노드에서 조회하더라도 결과가 일관되어야 합니다. 예를 들어, [`parts`](/operations/system-tables/parts) 테이블은 어느 노드에서 조회하더라도 동일한 결과를 반환해야 합니다.

```sql
SELECT hostname(), count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-vccsrty-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.005 sec.

SELECT
 hostname(),
    count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-w59bfco-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.004 sec.
```

반대로, 다른 system 테이블은 노드별 특성을 가집니다. 예를 들어, 메모리에만 존재하거나 MergeTree 테이블 엔진을 사용해 데이터를 영구적으로 저장합니다. 이는 로그와 메트릭과 같은 데이터에 일반적인 방식입니다. 이러한 영속성 덕분에 과거 데이터가 분석을 위해 계속 사용 가능하게 유지됩니다. 그러나 이러한 노드별 테이블은 본질적으로 각 노드마다 고유합니다.

일반적으로, system 테이블이 노드별인지 판단할 때 다음 규칙을 적용할 수 있습니다.

* `_log` 접미사가 있는 system 테이블
* `metrics`, `asynchronous_metrics`, `events`처럼 메트릭을 노출하는 system 테이블
* `processes`, `merges`처럼 진행 중인 프로세스를 노출하는 system 테이블

또한, system 테이블의 새 버전은 업그레이드나 스키마 변경의 결과로 생성될 수 있습니다. 이러한 버전은 숫자 접미사를 사용하여 이름이 지정됩니다.

예를 들어, `system.query_log` 테이블은 각 노드에서 실행된 쿼리마다 하나의 행을 포함합니다.

```sql
SHOW TABLES FROM system LIKE 'query_log%'

┌─name─────────┐
│ query_log    │
│ query_log_1  │
│ query_log_10 │
│ query_log_2  │
│ query_log_3  │
│ query_log_4  │
│ query_log_5  │
│ query_log_6  │
│ query_log_7  │
│ query_log_8  │
│ query_log_9  │
└──────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### 여러 버전에서 쿼리 실행하기 \{#querying-multiple-versions\}

[`merge`](/sql-reference/table-functions/merge) 함수를 사용하여 이러한 테이블들을 가로질러 쿼리를 수행할 수 있습니다. 예를 들어, 아래 쿼리는 각 `query_log` 테이블에서 대상 노드에 대해 가장 최근에 실행된 쿼리를 식별합니다.

```sql
SELECT
    _table,
    max(event_time) AS most_recent
FROM merge('system', '^query_log')
GROUP BY _table
ORDER BY most_recent DESC

┌─_table───────┬─────────most_recent─┐
│ query_log    │ 2025-04-13 10:59:29 │
│ query_log_1  │ 2025-04-09 12:34:46 │
│ query_log_2  │ 2025-04-09 12:33:45 │
│ query_log_3  │ 2025-04-07 17:10:34 │
│ query_log_5  │ 2025-03-24 09:39:39 │
│ query_log_4  │ 2025-03-24 09:38:58 │
│ query_log_6  │ 2025-03-19 16:07:41 │
│ query_log_7  │ 2025-03-18 17:01:07 │
│ query_log_8  │ 2025-03-18 14:36:07 │
│ query_log_10 │ 2025-03-18 14:01:33 │
│ query_log_9  │ 2025-03-18 14:01:32 │
└──────────────┴─────────────────────┘
```


Set에 11개 행이 있습니다. 경과 시간: 0.373초. 6.44백만 행, 25.77 MB가 처리되었습니다 (초당 17.29백만 행, 69.17 MB/s).
최대 메모리 사용량: 28.45 MiB.

````

:::note Don't rely on the numerical suffix for ordering
While the numeric suffix on tables can suggest the order of data, it should never be relied upon. For this reason, always use the merge table function combined with a date filter when targeting specific date ranges.
:::

Importantly, these tables are still **local to each node**.

### Querying across nodes                         

To comprehensively view the entire cluster, users can leverage the [`clusterAllReplicas`](/sql-reference/table-functions/cluster) function in combination with the `merge` function. The `clusterAllReplicas` function allows querying system tables across all replicas within the "default" cluster, consolidating node-specific data into a unified result. When combined with the `merge` function this can be used to target all system data for a specific table in a cluster. 

This approach is particularly valuable for monitoring and debugging cluster-wide operations, ensuring users can effectively analyze the health and performance of their ClickHouse Cloud deployment.

:::note
ClickHouse Cloud provides clusters of multiple replicas for redundancy and failover. This enables its features, such as dynamic autoscaling and zero-downtime upgrades. At a certain moment in time, new nodes could be in the process of being added to the cluster or removed from the cluster. To skip these nodes, add `SETTINGS skip_unavailable_shards = 1` to queries using `clusterAllReplicas` as shown below.
:::

For example, consider the difference when querying the `query_log` table - often essential to analysis.

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 17.87 thousand rows, 71.51 KB (1.75 million rows/s., 7.01 MB/s.)

SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
│ c-ecru-qn-34-server-6em4y4t-0 │  656029 │
│ c-ecru-qn-34-server-iejrkg0-0 │  641155 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.026 sec. Processed 1.97 million rows, 7.88 MB (75.51 million rows/s., 302.05 MB/s.)
````

### 노드와 버전에 걸친 쿼리 실행 \{#querying-across-nodes\}

시스템 테이블 버전 관리로 인해 이것만으로는 클러스터의 전체 데이터를 나타내지 않습니다. 위 내용을 `merge` 함수와 함께 사용하면 지정한 기간에 대한 정확한 결과를 얻을 수 있습니다:

```sql
SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', merge('system', '^query_log'))
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │ 3008000 │
│ c-ecru-qn-34-server-6em4y4t-0 │ 3659443 │
│ c-ecru-qn-34-server-iejrkg0-0 │ 1078287 │
└───────────────────────────────┴─────────┘
```


Set에 3행. 경과 시간: 0.462초. 처리된 7.94 million 행, 31.75 MB(초당 17.17 million 행, 68.67 MB/s.)

```
```


## 관련 콘텐츠 {#related-content}

- 블로그: [System Tables와 ClickHouse 내부 구조 살펴보기](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 블로그: [필수 모니터링 쿼리 - 1부 - INSERT 쿼리](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 블로그: [필수 모니터링 쿼리 - 2부 - SELECT 쿼리](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
