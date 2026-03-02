---
description: 'ClickHouse 샘플링 쿼리 프로파일러 도구에 대한 문서'
sidebar_label: '쿼리 프로파일링'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: '샘플링 쿼리 프로파일러'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# 샘플링 쿼리 프로파일러 \{#sampling-query-profiler\}

ClickHouse는 쿼리 실행을 분석할 수 있는 샘플링 프로파일러를 실행합니다. 이 프로파일러를 사용하면 쿼리 실행 중 가장 자주 사용되는 소스 코드 루틴을 찾을 수 있습니다. CPU 시간과 유휴 시간을 포함한 경과 시간(벽시계 기준 시간)을 추적할 수 있습니다.

쿼리 프로파일러는 ClickHouse Cloud에서 자동으로 활성화되어 있으며, 다음과 같이 샘플 쿼리를 실행할 수 있습니다.

:::note ClickHouse Cloud에서 다음 쿼리를 실행하는 경우, 클러스터의 모든 노드에서 조회하려면 `FROM system.trace_log`를 `FROM clusterAllReplicas(default, system.trace_log)`로 변경해야 합니다.
:::

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c' AND trace_type = 'CPU' AND event_date = today()
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
SETTINGS allow_introspection_functions = 1
```

자가 관리형 배포에서 query profiler를 사용하려면 다음을 수행하십시오:

* 서버 설정의 [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) 섹션을 구성합니다.

  이 섹션은 profiler 동작 결과를 포함하는 [trace&#95;log](/operations/system-tables/trace_log) 시스템 테이블을 구성합니다. 기본적으로 설정되어 있습니다. 이 테이블의 데이터는 서버가 실행 중일 때만 유효합니다. 서버를 재시작한 후에는 ClickHouse가 이 테이블을 정리하지 않으며, 저장된 모든 가상 메모리 주소가 무효화될 수 있습니다.

* [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 또는 [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 설정을 구성합니다. 두 설정은 동시에 사용할 수 있습니다.

  이 설정으로 profiler 타이머를 구성할 수 있습니다. 이들은 세션 설정이므로, 전체 서버, 개별 사용자 또는 사용자 프로필, 대화형 세션, 그리고 각 개별 쿼리에 대해 서로 다른 샘플링 빈도를 사용할 수 있습니다.

기본 샘플링 빈도는 초당 1개의 샘플이며 CPU 타이머와 실시간 타이머가 모두 활성화되어 있습니다. 이 빈도는 ClickHouse 클러스터에 대한 충분한 정보를 수집할 수 있게 해 줍니다. 동시에 이 빈도로 동작할 때 profiler는 ClickHouse 서버 성능에 영향을 주지 않습니다. 각 개별 쿼리를 프로파일링해야 한다면 더 높은 샘플링 빈도를 사용하십시오.

`trace_log` 시스템 테이블을 분석하려면:

* `clickhouse-common-static-dbg` 패키지를 설치합니다. [DEB 패키지에서 설치](../../getting-started/install/install.mdx)를 참고하십시오.

* [allow&#95;introspection&#95;functions](../../operations/settings/settings.md#allow_introspection_functions) 설정을 통해 introspection 함수 사용을 허용합니다.

  보안상의 이유로 introspection 함수는 기본적으로 비활성화되어 있습니다.

* `addressToLine`, `addressToLineWithInlines`, `addressToSymbol`, `demangle` [introspection 함수](../../sql-reference/functions/introspection.md)를 사용하여 ClickHouse 코드에서 FUNCTION 이름과 위치를 확인합니다. 특정 쿼리에 대한 프로파일을 얻으려면 `trace_log` 테이블의 데이터를 집계해야 합니다. 개별 FUNCTION별로 또는 전체 스택 트레이스 단위로 데이터를 집계할 수 있습니다.

`trace_log` 정보를 시각화해야 한다면 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)와 [speedscope](https://www.speedscope.app)를 사용해 보십시오.

## 예시 \{#example\}

이 예시에서는 다음을 수행합니다:

* 현재 날짜와 쿼리 식별자로 `trace_log` 데이터를 필터링합니다.

* 스택 트레이스로 집계합니다.

* 내성 함수(introspection functions)를 사용하여 다음과 같은 보고서를 얻습니다:

  * 심볼 이름과 해당하는 소스 코드 함수 이름
  * 해당 함수들의 소스 코드 위치

{/* */ }

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = 'ebca3574-ad0a-400a-9cbc-dca382f5998c') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
