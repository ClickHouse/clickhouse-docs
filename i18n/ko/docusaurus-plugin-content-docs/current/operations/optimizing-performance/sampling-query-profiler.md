---
'description': 'ClickHouse의 샘플링 쿼리 프로파일러 도구에 대한 문서'
'sidebar_label': '쿼리 프로파일링'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/sampling-query-profiler'
'title': '샘플링 쿼리 프로파일러'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 샘플링 쿼리 프로파일러

ClickHouse는 쿼리 실행을 분석할 수 있는 샘플링 프로파일러를 실행합니다. 프로파일러를 사용하면 쿼리 실행 동안 가장 자주 사용된 소스 코드 루틴을 찾을 수 있습니다. CPU 시간과 유휴 시간을 포함한 실시간 경과 시간을 추적할 수 있습니다.

쿼리 프로파일러는 ClickHouse Cloud에서 자동으로 활성화되며, 다음과 같이 샘플 쿼리를 실행할 수 있습니다.

:::note ClickHouse Cloud에서 다음 쿼리를 실행하는 경우, `FROM system.trace_log`를 `FROM clusterAllReplicas(default, system.trace_log)`로 변경하여 클러스터의 모든 노드에서 선택하도록 하세요.
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

자체 관리 배포에서 쿼리 프로파일러를 사용하려면:

- 서버 구성의 [trace_log](../../operations/server-configuration-parameters/settings.md#trace_log) 섹션을 설정합니다.

    이 섹션은 프로파일러 기능의 결과를 포함하는 [trace_log](/operations/system-tables/trace_log) 시스템 테이블을 구성합니다. 기본적으로 구성되어 있습니다. 이 테이블의 데이터는 활성 서버에서만 유효함을 기억하세요. 서버가 재시작되면 ClickHouse는 테이블을 정리하지 않으며, 저장된 모든 가상 메모리 주소는 무효화될 수 있습니다.

- [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 또는 [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 설정을 구성합니다. 두 설정은 동시에 사용할 수 있습니다.

    이 설정들은 프로파일러 타이머를 구성할 수 있게 해줍니다. 이는 세션 설정이므로 전체 서버, 개별 사용자 또는 사용자 프로필, 상호 작용 세션 및 각 개별 쿼리에 대해 다양한 샘플링 주기를 가져올 수 있습니다.

기본 샘플링 주기는 초당 하나의 샘플이며, CPU 타이머와 실제 타이머가 모두 활성화되어 있습니다. 이 주기는 ClickHouse 클러스터에 대한 충분한 정보를 수집할 수 있게 해줍니다. 동시에 이 주기로 작업할 때, 프로파일러는 ClickHouse 서버의 성능에 영향을 미치지 않습니다. 각 개별 쿼리를 프로파일링해야 하는 경우 더 높은 샘플링 주기를 사용하는 것이 좋습니다.

`trace_log` 시스템 테이블을 분석하려면:

- `clickhouse-common-static-dbg` 패키지를 설치합니다. [DEB 패키지에서 설치하기](../../getting-started/install/install.mdx)를 참조하세요.

- [allow_introspection_functions](../../operations/settings/settings.md#allow_introspection_functions) 설정을 통해 내부 함수에 대한 실행을 허용합니다.

    보안상의 이유로 내부 함수는 기본적으로 비활성화되어 있습니다.

- `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` 및 `demangle` [내부 함수](../../sql-reference/functions/introspection.md)를 사용하여 ClickHouse 코드에서 함수 이름과 해당 위치를 가져옵니다. 특정 쿼리에 대한 프로파일을 얻으려면 `trace_log` 테이블에서 데이터를 집계해야 합니다. 개별 함수 또는 전체 스택 추적별로 데이터를 집계할 수 있습니다.

`trace_log` 정보를 시각화해야 하는 경우, [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)와 [speedscope](https://github.com/laplab/clickhouse-speedscope)를 사용해보세요.

## 예제 {#example}

이 예제에서는:

- 쿼리 식별자 및 현재 날짜로 `trace_log` 데이터를 필터링합니다.

- 스택 추적별로 집계합니다.

- 내부 함수를 사용하여 다음 보고서를 생성합니다:

  - 기호 이름과 해당 소스 코드 함수.
  - 이러한 함수의 소스 코드 위치.

<!-- -->

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
