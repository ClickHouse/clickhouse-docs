---
'description': '시스템 테이블이 무엇인지 그리고 그것들이 왜 유용한지에 대한 개요.'
'keywords':
- 'system tables'
- 'overview'
'sidebar_label': '개요'
'sidebar_position': 52
'slug': '/operations/system-tables/overview'
'title': '시스템 테이블 개요'
'doc_type': 'reference'
---

## 시스템 테이블 개요 {#system-tables-introduction}

시스템 테이블은 다음에 대한 정보를 제공합니다:

- 서버 상태, 프로세스 및 환경.
- 서버의 내부 프로세스.
- ClickHouse 바이너리가 빌드될 때 사용된 옵션.

시스템 테이블:

- `system` 데이터베이스에 위치합니다.
- 데이터 읽기만 가능.
- 삭제되거나 변경될 수는 없지만 분리될 수 있습니다.

대부분의 시스템 테이블은 RAM에 데이터를 저장합니다. ClickHouse 서버는 시작 시 이러한 시스템 테이블을 생성합니다.

다른 시스템 테이블과 달리, 시스템 로그 테이블 [metric_log](../../operations/system-tables/metric_log.md), [query_log](../../operations/system-tables/query_log.md), [query_thread_log](../../operations/system-tables/query_thread_log.md), [trace_log](../../operations/system-tables/trace_log.md), [part_log](../../operations/system-tables/part_log.md), [crash_log](../../operations/system-tables/crash_log.md), [text_log](../../operations/system-tables/text_log.md) 및 [backup_log](../../operations/system-tables/backup_log.md)은 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블 엔진에 의해 제공되며 기본적으로 파일 시스템에 데이터를 저장합니다. 파일 시스템에서 테이블을 제거하면 ClickHouse 서버는 다음 데이터 기록 시 빈 테이블을 다시 생성합니다. 새로운 릴리스에서 시스템 테이블 스키마가 변경되면 ClickHouse는 현재 테이블의 이름을 변경하고 새 테이블을 생성합니다.

시스템 로그 테이블은 `/etc/clickhouse-server/config.d/` 아래에 테이블과 동일한 이름의 구성 파일을 생성하거나 `/etc/clickhouse-server/config.xml`에서 해당 요소를 설정하여 사용자 정의할 수 있습니다. 사용자 정의할 수 있는 요소는 다음과 같습니다:

- `database`: 시스템 로그 테이블이 속한 데이터베이스. 이 옵션은 이제 더 이상 사용되지 않습니다. 모든 시스템 로그 테이블은 `system` 데이터베이스에 있습니다.
- `table`: 데이터를 삽입할 테이블.
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 표현식을 지정합니다.
- `ttl`: 테이블 [TTL](../../sql-reference/statements/alter/ttl.md) 표현식을 지정합니다.
- `flush_interval_milliseconds`: 디스크에 데이터를 플러시하는 간격.
- `engine`: 매개변수가 포함된 전체 엔진 표현식( `ENGINE =` 로 시작) 을 제공합니다. 이 옵션은 `partition_by` 및 `ttl`과 충돌합니다. 함께 설정할 경우 서버는 예외를 발생시키고 종료됩니다.

예시:

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

기본적으로 테이블 성장에는 제한이 없습니다. 테이블 크기를 제어하려면 만료된 로그 레코드를 제거하기 위해 [TTL](/sql-reference/statements/alter/ttl) 설정을 사용할 수 있습니다. 또한 `MergeTree` 엔진 테이블의 파티셔닝 기능을 사용할 수 있습니다.

## 시스템 메트릭의 출처 {#system-tables-sources-of-system-metrics}

시스템 메트릭을 수집하기 위해 ClickHouse 서버는 다음을 사용합니다:

- `CAP_NET_ADMIN` 능력.
- [procfs](https://en.wikipedia.org/wiki/Procfs) (리눅스에서만).

**procfs**

ClickHouse 서버에 `CAP_NET_ADMIN` 능력이 없으면 `ProcfsMetricsProvider`로 대체하려고 시도합니다. `ProcfsMetricsProvider`는 쿼리별 시스템 메트릭( CPU 및 I/O에 대한)을 수집할 수 있게 해줍니다.

시스템에서 procfs가 지원되고 활성화된 경우 ClickHouse 서버는 다음 메트릭을 수집합니다:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds`는 리눅스 커널 5.14.x부터 기본적으로 비활성화되어 있습니다.
`sudo sysctl kernel.task_delayacct=1`를 사용하거나 `/etc/sysctl.d/`에 `kernel.task_delayacct = 1`이 포함된 `.conf` 파일을 생성하여 활성화할 수 있습니다.
:::

## ClickHouse Cloud의 시스템 테이블 {#system-tables-in-clickhouse-cloud}

ClickHouse Cloud에서 시스템 테이블은 자체 관리 배포와 마찬가지로 서비스의 상태 및 성능에 대한 중요한 통찰을 제공합니다. 일부 시스템 테이블은 클러스터 전체 수준에서 작동하며, 특히 분산 메타데이터를 관리하는 Keeper 노드에서 데이터를 파생하는 테이블이 그러합니다. 이러한 테이블은 클러스터의 집합적 상태를 반영하며 개별 노드에서 쿼리할 때 일관성을 유지해야 합니다. 예를 들어, [`parts`](/operations/system-tables/parts)는 쿼리하는 노드에 관계없이 일관성을 가져야 합니다:

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

반대로, 다른 시스템 테이블은 노드 전용으로, 예를 들어 메모리 내에서 운영되거나 MergeTree 테이블 엔진을 사용하여 데이터를 지속적으로 저장합니다. 이는 로그 및 메트릭과 같은 데이터에 일반적입니다. 이 지속성은 역사적 데이터가 분석을 위해 계속 사용 가능함을 보장합니다. 그러나 이러한 노드 전용 테이블은 본질적으로 각 노드에 고유합니다.

일반적으로 시스템 테이블이 노드 전용인지 판별할 때 다음 규칙을 적용할 수 있습니다:

- `_log` 접미사가 있는 시스템 테이블.
- 메트릭을 노출하는 시스템 테이블, 예: `metrics`, `asynchronous_metrics`, `events`.
- 진행 중인 프로세스를 노출하는 시스템 테이블, 예: `processes`, `merges`.

추가로 시스템 테이블의 업그레이드나 스키마 변경의 결과로 새로운 버전이 생성될 수 있습니다. 이러한 버전은 숫자 접미사를 사용하여 이름이 지정됩니다.

예를 들어, 노드에서 실행된 각 쿼리에 대한 행을 포함하는 `system.query_log` 테이블을 고려해 보세요:

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

### 여러 버전 쿼리하기 {#querying-multiple-versions}

[`merge`](/sql-reference/table-functions/merge) 함수를 사용하여 이러한 테이블 간에 쿼리할 수 있습니다. 아래 쿼리는 각 `query_log` 테이블에서 대상 노드에 발행된 최신 쿼리를 식별합니다:

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

11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
Peak memory usage: 28.45 MiB.
```

:::note 숫자 접미사에 의존하지 마세요
테이블의 숫자 접미사는 데이터의 순서를 제안할 수 있지만 이는 결코 의존해서는 안 됩니다. 이러한 이유로 특정 날짜 범위를 대상으로 할 때는 항상 날짜 필터와 함께 merge 테이블 함수를 사용하세요.
:::

중요하게도, 이러한 테이블은 여전히 **각 노드에 로컬**입니다.

### 노드 간 쿼리하기 {#querying-across-nodes}

전체 클러스터를 포괄적으로 보기 위해 사용자들은 `merge` 함수와 함께 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 함수를 활용할 수 있습니다. `clusterAllReplicas` 함수는 "default" 클러스터 내의 모든 복제본에서 시스템 테이블을 쿼리할 수 있게 해주며, 노드 전용 데이터를 통합된 결과로 집계합니다. 이와 `merge` 함수를 결합하면 클러스터 내 특정 테이블의 모든 시스템 데이터를 타겟팅하는 데 사용할 수 있습니다.

이 접근 방식은 클러스터 전체 작업을 모니터링하고 디버깅하는 데 특히 유용하며, 사용자가 ClickHouse Cloud 배포의 건강과 성능을 효과적으로 분석할 수 있도록 보장합니다.

:::note
ClickHouse Cloud는 중복성과 장애 조치를 위해 여러 복제본의 클러스터를 제공합니다. 이는 동적 자동 스케일링 및 제로 다운타임 업그레이드와 같은 기능을 가능하게 합니다. 특정 시점에 클러스터에 추가되거나 제거되는 과정 중인 새로운 노드가 있을 수 있습니다. 이러한 노드를 건너뛰려면 아래와 같이 `clusterAllReplicas`를 사용하는 쿼리에 `SETTINGS skip_unavailable_shards = 1`을 추가하세요.
:::

예를 들어, 분석에 종종 필수적인 `query_log` 테이블을 쿼리할 때의 차이를 고려해 보세요.

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
```

### 노드와 버전 간 쿼리하기 {#querying-across-nodes-and-versions}

시스템 테이블 버전화로 인해 이는 여전히 클러스터의 전체 데이터를 나타내지 않습니다. 위의 내용을 `merge` 함수와 결합하면 특정 날짜 범위를 위한 정확한 결과를 얻을 수 있습니다:

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

3 rows in set. Elapsed: 0.462 sec. Processed 7.94 million rows, 31.75 MB (17.17 million rows/s., 68.67 MB/s.)
```

## 관련 콘텐츠 {#related-content}

- 블로그: [시스템 테이블 및 ClickHouse의 내부를 엿볼 수 있는 창](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- 블로그: [필수 모니터링 쿼리 - 파트 1 - INSERT 쿼리](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- 블로그: [필수 모니터링 쿼리 - 파트 2 - SELECT 쿼리](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
