---
'description': 'CREATE VIEW에 대한 문서'
'sidebar_label': 'VIEW'
'sidebar_position': 37
'slug': '/sql-reference/statements/create/view'
'title': 'CREATE VIEW'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW

새로운 뷰를 생성합니다. 뷰는 [일반](#normal-view), [물리화된](#materialized-view), [새로 고칠 수 있는 물리화된](#refreshable-materialized-view) 및 [윈도우](/sql-reference/statements/create/view#window-view)일 수 있습니다.

## Normal View {#normal-view}

구문:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

정상 뷰는 데이터를 저장하지 않습니다. 각 접근 시 다른 테이블에서 읽기를 수행합니다. 즉, 정상 뷰는 저장된 쿼리에 불과합니다. 뷰에서 읽을 때 이 저장된 쿼리는 [FROM](../../../sql-reference/statements/select/from.md) 절의 서브쿼리로 사용됩니다.

예를 들어, 뷰를 생성했다고 가정해봅시다:

```sql
CREATE VIEW view AS SELECT ...
```

그리고 쿼리를 작성합니다:

```sql
SELECT a, b, c FROM view
```

이 쿼리는 서브쿼리를 사용하는 것과 완전히 동등합니다:

```sql
SELECT a, b, c FROM (SELECT ...)
```

## Parameterized View {#parameterized-view}

매개변수화된 뷰는 정상 뷰와 비슷하지만 즉시 해결되지 않는 매개변수와 함께 생성될 수 있습니다. 이 뷰는 테이블 함수와 함께 사용될 수 있으며, 여기서 뷰의 이름이 함수 이름으로 지정되고 매개변수 값이 인수로 사용됩니다.

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```
위의 생성된 뷰는 아래와 같이 매개변수를 치환하여 테이블 함수로 사용할 수 있습니다.

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```

## Materialized View {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
[물리화된 뷰](/guides/developer/cascading-materialized-views.md) 사용에 대한 단계별 안내가 여기 있습니다.
:::

물리화된 뷰는 해당 [SELECT](../../../sql-reference/statements/select/index.md) 쿼리로 변환된 데이터를 저장합니다.

`TO [db].[table]` 없이 물리화된 뷰를 생성할 때는 데이터를 저장하기 위한 테이블 엔진인 `ENGINE`을 지정해야 합니다.

`TO [db].[table]`를 사용하여 물리화된 뷰를 생성할 때는 `POPULATE`를 사용할 수 없습니다.

물리화된 뷰는 다음과 같이 구현됩니다: `SELECT`에 지정된 테이블에 데이터를 삽입할 때 삽입된 데이터의 일부가 이 `SELECT` 쿼리로 변환되어 결과가 뷰에 삽입됩니다.

:::note
ClickHouse의 물리화된 뷰는 목적 테이블로 삽입할 때 **컬럼 이름**을 기준으로 사용합니다. 만약 `SELECT` 쿼리 결과에 일부 컬럼 이름이 없으면 ClickHouse는 기본값을 사용합니다. 컬럼이 [Nullable](../../data-types/nullable.md)인이 아닐지라도 기본값이 사용됩니다. 물리화된 뷰를 사용할 때 모든 컬럼에 대해 별칭을 추가하는 것이 안전한 방법입니다.

ClickHouse의 물리화된 뷰는 삽입 트리거와 비슷하게 구현됩니다. 뷰 쿼리에 집계가 있는 경우 이는 갓 삽입된 데이터 배치에만 적용됩니다. 기존 소스 테이블의 데이터 변경(예: 업데이트, 삭제, 파티션 삭제 등)은 물리화된 뷰에 영향을 주지 않습니다.

ClickHouse의 물리화된 뷰는 오류 발생 시 결정론적 행동을 갖지 않습니다. 이는 이미 작성된 블록은 목적 테이블에 보존되지만 오류 이후의 모든 블록은 보존되지 않음을 의미합니다.

기본적으로 뷰 중 하나로의 푸시가 실패하면 INSERT 쿼리도 실패하며 일부 블록이 목적 테이블에 기록되지 않을 수 있습니다. `materialized_views_ignore_errors` 설정을 사용하여 이를 변경할 수 있습니다(INSERT 쿼리에 대해 설정해야 함). `materialized_views_ignore_errors=true`를 설정하면 뷰에 푸시하는 동안 발생하는 오류가 무시되고 모든 블록이 목적 테이블에 작성됩니다.

또한, `materialized_views_ignore_errors`는 `system.*_log` 테이블에 대해 기본적으로 `true`로 설정되어 있습니다.
:::

`POPULATE`를 지정하면 기존 테이블 데이터가 뷰에 삽입되며, 이는 마치 `CREATE TABLE ... AS SELECT ...`를 하는 것과 같습니다. 그렇지 않으면, 쿼리에는 뷰 생성 이후 테이블에 삽입된 데이터만 포함됩니다. 우리는 **POPULATE** 사용을 권장하지 않습니다. 뷰 생성 중 테이블에 삽입된 데이터는 뷰에 삽입되지 않습니다.

:::note
`POPULATE`가 `CREATE TABLE ... AS SELECT ...`처럼 작동하므로 제한이 있습니다:
- 복제된 데이터베이스에서는 지원되지 않습니다.
- ClickHouse 클라우드에서는 지원되지 않습니다.

대신 별도의 `INSERT ... SELECT`를 사용할 수 있습니다.
:::

`SELECT` 쿼리는 `DISTINCT`, `GROUP BY`, `ORDER BY`, `LIMIT`을 포함할 수 있습니다. 관련 변환은 삽입된 각 데이터 블록에 대해 독립적으로 수행됩니다. 예를 들어, `GROUP BY`가 설정되면 데이터는 삽입 중에 집계되지만 한 개의 삽입 패킷 내에서만 수행됩니다. 데이터는 더 이상 집계되지 않습니다. 단, `SummingMergeTree`와 같이 독립적으로 데이터 집계를 수행하는 ENGINE을 사용할 때는 예외가 됩니다.

[ALTER](/sql-reference/statements/alter/view.md) 쿼리의 물리화된 뷰에 대한 실행에는 제한이 있으며, 예를 들어 `SELECT` 쿼리를 업데이트할 수 없습니다. 이는 불편할 수 있습니다. 물리화된 뷰가 `TO [db.]name` 구성을 사용할 경우, 뷰를 `DETACH`하고 대상 테이블에 대해 `ALTER`를 실행한 다음, 이전에 분리된(`DETACH`) 뷰를 다시 `ATTACH`할 수 있습니다.

물리화된 뷰는 [optimize_on_insert](/operations/settings/settings#optimize_on_insert) 설정의 영향을 받습니다. 데이터는 뷰에 삽입되기 전에 병합됩니다.

뷰는 일반 테이블과 동일하게 보입니다. 예를 들어, `SHOW TABLES` 쿼리의 결과에 나열됩니다.

뷰를 삭제하려면 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)를 사용하십시오. `DROP TABLE`은 VIEW에도 작동합니다.

## SQL security {#sql_security}

`DEFINER` 및 `SQL SECURITY`는 뷰의 기본 쿼리를 실행할 때 사용할 ClickHouse 사용자를 지정할 수 있습니다. `SQL SECURITY`에는 세 가지 유효한 값이 있습니다: `DEFINER`, `INVOKER`, 또는 `NONE`. `DEFINER` 절에 기존 사용자 또는 `CURRENT_USER`를 지정할 수 있습니다.

다음 표는 뷰에서 선택하기 위해 어떤 사용자에게 어떤 권한이 필요한지를 설명합니다. SQL 보안 옵션에 관계없이, 읽기 위해서는 항상 `GRANT SELECT ON <view>`가 필요하다는 점에 유의하십시오.

| SQL security option | View                                                            | Materialized View                                                                                                 |
|---------------------|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `DEFINER alice`     | `alice`는 뷰의 소스 테이블에 대해 `SELECT` 권한을 가져야 합니다. | `alice`는 뷰의 소스 테이블에 대해 `SELECT` 권한과 뷰의 대상 테이블에 대해 `INSERT` 권한을 가져야 합니다. |
| `INVOKER`           | 사용자는 뷰의 소스 테이블에 대해 `SELECT` 권한을 가져야 합니다.    | 물리화된 뷰에 대해 `SQL SECURITY INVOKER`를 지정할 수 없습니다.                                                  |
| `NONE`              | -                                                               | -                                                                                                                 |

:::note
`SQL SECURITY NONE`은 더 이상 사용되지 않는 옵션입니다. `SQL SECURITY NONE`으로 뷰를 생성할 권한이 있는 사용자는 무제한 쿼리를 실행할 수 있습니다. 따라서 이 옵션으로 뷰를 생성하려면 `GRANT ALLOW SQL SECURITY NONE TO <user>`가 필요합니다.
:::

`DEFINER`/`SQL SECURITY`가 지정되지 않으면 기본값이 사용됩니다:
- `SQL SECURITY`: 정상 뷰에 대해 `INVOKER` 및 물리화된 뷰에 대해 `DEFINER` ([설정을 통해 구성 가능](../../../operations/settings/settings.md#default_normal_view_sql_security))
- `DEFINER`: `CURRENT_USER` ([설정을 통해 구성 가능](../../../operations/settings/settings.md#default_view_definer))

`DEFINER`/`SQL SECURITY`가 지정되지 않고 뷰가 연결되면 기본값은 물리화된 뷰에 대해 `SQL SECURITY NONE` 및 정상 뷰에 대해 `SQL SECURITY INVOKER`입니다.

기존 뷰의 SQL 보안을 변경하려면 다음을 사용하십시오.
```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```

### Examples {#examples}
```sql
CREATE VIEW test_view
DEFINER = alice SQL SECURITY DEFINER
AS SELECT ...
```

```sql
CREATE VIEW test_view
SQL SECURITY INVOKER
AS SELECT ...
```

## Live View {#live-view}

<DeprecatedBadge/>

이 기능은 더 이상 지원되지 않으며 향후 제거될 예정입니다.

편의를 위해 구식 문서는 [여기](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)에서 확인할 수 있습니다.

## Refreshable Materialized View {#refreshable-materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
REFRESH EVERY|AFTER interval [OFFSET interval]
[RANDOMIZE FOR interval]
[DEPENDS ON [db.]name [, [db.]name [, ...]]]
[SETTINGS name = value [, name = value [, ...]]]
[APPEND]
[TO[db.]name] [(columns)] [ENGINE = engine]
[EMPTY]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```
여기서 `interval`은 간단한 간격의 시퀀스입니다:
```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

정기적으로 해당 쿼리를 실행하고 그 결과를 테이블에 저장합니다.
* 쿼리가 `APPEND`라고 하면 각 새로 고침은 기존 행을 삭제하지 않고 테이블에 행을 삽입합니다. 삽입은 보통의 INSERT SELECT처럼 원자적이지 않습니다.
* 그렇지 않으면 각 새로 고침은 테이블의 이전 내용을 원자적으로 교체합니다.
일반 비갱신 물리화된 뷰와의 차이점:
* 삽입 트리거가 없습니다. 즉, `SELECT`에 지정된 테이블에 새 데이터가 삽입되면 자동으로 갱신 가능한 물리화된 뷰로 푸시되지 않습니다. 주기적인 새로 고침은 전체 쿼리를 실행합니다. * 선택 쿼리에 대한 제한이 없습니다. 테이블 함수(예: `url()`), 뷰, UNION, JOIN 모두 허용됩니다.

:::note
쿼리의 `REFRESH ... SETTINGS` 부분에 있는 설정은 새로 고침 설정입니다(예: `refresh_retries`), 일반 설정(예: `max_threads`)과는 다릅니다. 일반 설정은 쿼리 끝에 `SETTINGS`를 사용하여 지정할 수 있습니다.
:::

### Refresh Schedule {#refresh-schedule}

예제 새로 고침 일정:
```sql
REFRESH EVERY 1 DAY -- every day, at midnight (UTC)
REFRESH EVERY 1 MONTH -- on 1st day of every month, at midnight
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- on 6th day of every month, at 2:00 am
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- every other Saturday, at 3:10 pm
REFRESH EVERY 30 MINUTE -- at 00:00, 00:30, 01:00, 01:30, etc
REFRESH AFTER 30 MINUTE -- 30 minutes after the previous refresh completes, no alignment with time of day
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- syntax error, OFFSET is not allowed with AFTER
REFRESH EVERY 1 WEEK 2 DAYS -- every 9 days, not on any particular day of the week or month;
                            -- specifically, when day number (since 1969-12-29) is divisible by 9
REFRESH EVERY 5 MONTHS -- every 5 months, different months each year (as 12 is not divisible by 5);
                       -- specifically, when month number (since 1970-01) is divisible by 5
```

`RANDOMIZE FOR`는 각 새로 고침의 시간을 무작위로 조정합니다. 예시로:
```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

하나의 새로 고침만 주어진 뷰에 대해 동시에 실행될 수 있습니다. 예를 들어, `REFRESH EVERY 1 MINUTE`가 2분을 소요한다면 2분마다 새로 고침이 진행되는 것입니다. 만약 이후 더 빨라져서 10초에 새로 고침이 시작된다면 다시 1분마다 새로 고침으로 돌아갑니다. (특히, 이전에 놓친 새로 고침에서 따라잡기 위해 매 10초마다 새로 고침되지 않습니다 - 그러한 백로그는 없습니다.)

또한 물리화된 뷰가 생성된 이후 즉시 새로 고침이 시작되며, `CREATE` 쿼리에서 `EMPTY`가 지정되지 않는 한 그렇습니다. `EMPTY`가 지정된 경우 첫 번째 새로 고침은 일정에 따라 발생합니다.

### In Replicated DB {#in-replicated-db}

갱신 가능한 물리화된 뷰가 [복제 데이터베이스](../../../engines/database-engines/replicated.md)에 있을 경우, 복제본 간의 조정으로 매번 예정된 시간에 단 하나의 복제본만 새로 고침을 수행합니다. 모든 복제본이 갱신에서 생성된 데이터를 볼 수 있도록 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 테이블 엔진이 필요합니다.

`APPEND` 모드에서는 `SETTINGS all_replicas = 1`을 사용하여 조정을 비활성화할 수 있습니다. 이는 복제본이 서로 독립적으로 새로 고침을 수행하게 합니다. 이 경우 ReplicatedMergeTree는 필요하지 않습니다.

비 `APPEND` 모드에서는 조정된 새로 고침만 지원됩니다. 조정되지 않은 경우 `Atomic` 데이터베이스와 `CREATE ... ON CLUSTER` 쿼리를 사용하여 모든 복제본에 갱신 가능한 물리화된 뷰를 생성할 수 있습니다.

조정은 Keeper를 통해 이루어집니다. znode 경로는 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 서버 설정에 의해 결정됩니다.

### Dependencies {#refresh-dependencies}

`DEPENDS ON`은 다양한 테이블의 새로 고침을 동기화합니다. 예를 들어, 두 개의 갱신 가능한 물리화된 뷰의 체인이 있다고 가정해 봅시다:
```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```
`DEPENDS ON`이 없으면 두 뷰 모두 자정에 새로 고침을 시작하며, 그 동안 `destination`은 일반적으로 어제의 데이터를 `source`에서 보게 됩니다. 의존성을 추가하면:
```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```
이렇게 하면 그 날 `source`의 새로 고침이 끝난 후에만 `destination`의 새로 고침이 시작되므로 `destination`은 최신 데이터 기반입니다.

또는 동일한 결과를 다음과 같이 얻을 수 있습니다:
```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```
여기서 `1 HOUR`은 `source`의 새로 고침 기간보다 짧은 모든 기간일 수 있습니다. 의존하는 테이블은 그 의존성보다 더 자주 새로 고침되지 않을 것입니다. 이는 실제 새로 고침 주기를 한 번 이상 지정하지 않고 갱신 가능한 뷰 체인을 설정하는 유효한 방법입니다.

추가 예를 들면:
* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`)는 `REFRESH EVERY 1 DAY` (`source`)에 의존합니다.<br/>
  만약 `source`의 새로 고침이 10분 이상 걸린다면 `destination`은 대기합니다.
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR`는 `REFRESH EVERY 1 DAY OFFSET 23 HOUR`에 의존합니다.<br/>
  위와 유사하게, 각 새로 고침이 다른 달력일에 발생하더라도.
  `destination`의 새로 고침은 X일의 X+1일에 있으며 `source`의 새로 고침이 2시간 이상 걸린 경우에 대기합니다.
* `REFRESH EVERY 2 HOUR`는 `REFRESH EVERY 1 HOUR`에 의존합니다.<br/>
  2시간 새로 고침은 매시간 1시간 새로 고침 후에 발생합니다. 예를 들어, 자정 새로 고침 후, 2시 새로 고침 후와 같이.
* `REFRESH EVERY 1 MINUTE`는 `REFRESH EVERY 2 HOUR`에 의존합니다.<br/>
  `REFRESH AFTER 1 MINUTE`는 `REFRESH EVERY 2 HOUR`에 의존합니다.<br/>
  `REFRESH AFTER 1 MINUTE`는 `REFRESH AFTER 2 HOUR`에 의존합니다.<br/>
  `destination`은 모든 `source` 새로 고침 후에 한 번 새로 고침되며, 즉 2시간마다 실시됩니다. `1 MINUTE`는 실제로 무시됩니다.
* `REFRESH AFTER 1 HOUR`는 `REFRESH AFTER 1 HOUR`에 의존합니다.<br/>
  현재 이는 권장되지 않습니다.

:::note
`DEPENDS ON`은 갱신 가능한 물리화된 뷰 사이에서만 작동합니다. `DEPENDS ON` 목록에 일반 테이블을 나열하면 뷰가 새로 고침되지 않습니다 (의존성은 `ALTER`로 제거할 수 있습니다. 아래 참조).
:::

### Settings {#settings}

사용 가능한 새로 고침 설정:
* `refresh_retries` - 새로 고침 쿼리가 예외로 실패할 경우 재시도할 횟수입니다. 모든 재시도가 실패하면 다음 예정된 새로 고침 시간으로 건너뜁니다. 0은 재시도가 없음을 의미하고 -1은 무한 재시도를 의미합니다. 기본값: 0.
* `refresh_retry_initial_backoff_ms` - 첫 번째 재시도 이전의 지연 시간입니다. `refresh_retries`가 0이 아닌 경우. 각 후속 재시도 시 지연 시간이 두 배로 증가하며, 최대 `refresh_retry_max_backoff_ms`까지 증가합니다. 기본값: 100ms.
* `refresh_retry_max_backoff_ms` - 새로 고침 시도 간 지연의 지수적 성장을 제한합니다. 기본값: 60000ms (1분).

### Changing Refresh Parameters {#changing-refresh-parameters}

새로 고침 매개변수를 변경하려면:
```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
이는 *모든* 새로 고침 매개변수를 한 번에 교체합니다: 일정, 의존성, 설정 및 APPEND 여부. 예를 들어, 테이블에 `DEPENDS ON`이 있던 경우, `DEPENDS ON` 없이 `MODIFY REFRESH`를 수행하면 의존성이 제거됩니다.
:::

### Other operations {#other-operations}

모든 갱신 가능한 물리화된 뷰의 상태는 테이블 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md)에서 확인할 수 있습니다. 여기에는 특히 새로 고침 진행 상황(실행 중인 경우), 마지막 및 다음 새로 고침 시간, 새로 고침이 실패한 경우의 예외 메시지가 포함됩니다.

새로 고침을 수동으로 중지, 시작, 트리거하거나 취소하려면 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views)를 사용하십시오.

새로 고침이 완료될 때까지 기다리려면 [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views)를 사용하세요. 특히, 뷰 생성 후 초기 새로 고침을 기다리는 데 유용합니다.

:::note
재미있는 사실: 새로 고침 쿼리는 새로 고침되는 뷰에서 데이터를 읽을 수 있으며, 데이터의 새로 고침 전 버전을 볼 수 있습니다. 이를 통해 콘웨이의 생명 게임을 구현할 수 있습니다: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Window View {#window-view}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::info
이는 향후 릴리스에서 레거시 비호환 방식으로 변경될 수 있는 실험적 기능입니다. [allow_experimental_window_view](/operations/settings/settings#allow_experimental_window_view) 설정을 사용하여 윈도우 뷰 및 `WATCH` 쿼리 사용을 활성화하십시오. 명령 `set allow_experimental_window_view = 1`을 입력합니다.
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

윈도우 뷰는 시간 창별로 데이터를 집계하고 창이 준비되면 결과를 출력할 수 있습니다. 지연 시간을 줄이기 위해 부분 집계 결과를 내부(또는 지정된) 테이블에 저장하고 지정된 테이블에 처리 결과를 푸시하거나 `WATCH` 쿼리를 사용하여 푸시할 수 있습니다.

윈도우 뷰는 `MATERIALIZED VIEW`를 생성하는 것과 비슷합니다. 윈도우 뷰에는 중간 데이터를 저장하기 위한 내부 저장 엔진이 필요합니다. 내부 저장소는 `INNER ENGINE` 절을 사용하여 지정할 수 있으며, 윈도우 뷰는 기본 내부 엔진으로 `AggregatingMergeTree`를 사용합니다.

`TO [db].[table]` 없이 윈도우 뷰를 생성할 때는 데이터를 저장하기 위한 테이블 엔진인 `ENGINE`을 지정해야 합니다.

### Time Window Functions {#time-window-functions}

[시간 창 함수](../../functions/time-window-functions.md)는 기록의 하한 및 상한 창을 얻는 데 사용됩니다. 윈도우 뷰는 시간 창 함수와 함께 사용해야 합니다.

### TIME ATTRIBUTES {#time-attributes}

윈도우 뷰는 **처리 시간** 및 **이벤트 시간** 프로세스를 지원합니다.

**처리 시간**은 윈도우 뷰가 로컬 머신의 시간을 기반으로 결과를 생성하도록 하며 기본적으로 사용됩니다. 가장 간단한 시간 개념이지만 결정론적이지 않습니다. 처리 시간 속성은 시간 창 함수의 `time_attr`를 테이블 컬럼으로 설정하거나 `now()` 함수를 사용하여 정의할 수 있습니다. 다음 쿼리는 처리 시간이 있는 윈도우 뷰를 생성합니다.

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**이벤트 시간**은 각 개별 이벤트가 발생한 시간입니다. 이 시간은 일반적으로 생성될 때 기록에 포함됩니다. 이벤트 시간 처리는 순서가 틀린 이벤트나 지연된 이벤트의 경우에도 일관된 결과를 제공합니다. 윈도우 뷰는 `WATERMARK` 문법을 사용하여 이벤트 시간 처리를 지원합니다.

윈도우 뷰는 세 가지 수문 전략을 제공합니다:

* `STRICTLY_ASCENDING`: 지금까지 관측된 최대 타임스탬프의 수문을 방출합니다. 최대 타임스탬프보다 작은 타임스탬프를 가진 행은 지각하지 않습니다.
* `ASCENDING`: 지금까지 관측된 최대 타임스탬프의 수문을 방출하되 1을 뺀 값입니다. 최대 타임스탬프와 같은 또는 더 작은 타임스탬프를 가진 행은 지각하지 않습니다.
* `BOUNDED`: WATERMARK=INTERVAL. 지정된 지연을 뺀 최대 관측된 타임스탬프의 수문을 방출합니다.

다음 쿼리는 `WATERMARK`로 윈도우 뷰를 생성하는 예입니다:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

기본적으로, 수문이 오면 윈도우가 발사되고, 수문 이후에 도착한 요소는 삭제됩니다. 윈도우 뷰는 `ALLOWED_LATENESS=INTERVAL`을 설정하여 지각된 이벤트 처리를 지원합니다. 지각 처리의 예는 다음과 같습니다:

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

지각시 발생한 요소는 이전 계산의 업데이트된 결과로 간주되어야 한다는 점에 유의하십시오. 윈도우의 끝에서 발사되는 대신, 윈도우 뷰는 지각 이벤트가 도착할 때 즉시 발사됩니다. 따라서 동일한 윈도우에 대해 여러 출력이 발생합니다. 사용자는 이러한 중복된 결과를 고려해야 하며, 중복 제거를 수행해야 합니다.

윈도우 뷰에 지정된 `SELECT` 쿼리는 `ALTER TABLE ... MODIFY QUERY` 문을 사용하여 수정할 수 있습니다. 새로운 `SELECT` 쿼리와 결과적으로 생성된 데이터 구조는 원래 `SELECT` 쿼리와 일치해야 하며, `TO [db.]name` 절이 유무에 관계없이 적합해야 합니다. 현재 윈도우의 데이터는 잃어버리게 되며, 중간 상태를 재사용할 수 없기 때문입니다.

### Monitoring New Windows {#monitoring-new-windows}

윈도우 뷰는 변경 사항 모니터링을 위해 [WATCH](../../../sql-reference/statements/watch.md) 쿼리를 지원하거나 `TO` 문법을 사용하여 결과를 테이블에 출력할 수 있습니다.

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

종료 쿼리를 종료하기 전에 수신할 업데이트 수를 설정하기 위해 `LIMIT`를 지정할 수 있습니다. `EVENTS` 절은 쿼리 결과 대신 최근 쿼리 수문을 얻을 수 있는 `WATCH` 쿼리의 축약 형태를 얻는 데 사용될 수 있습니다.

### Settings {#settings-1}

- `window_view_clean_interval`: 구식 데이터 삭제를 위한 윈도우 뷰의 청소 간격(초)입니다. 시스템은 시스템 시간 또는 `WATERMARK` 구성에 따라 완전히 트리거되지 않은 윈도우를 유지하며, 나머지 데이터는 삭제됩니다.
- `window_view_heartbeat_interval`: `WATCH` 쿼리가 살아 있음을 나타내기 위한 하트비트 간격(초)입니다.
- `wait_for_window_view_fire_signal_timeout`: 이벤트 시간 처리에서 윈도우 뷰 발사 신호를 대기하는 시간 초과입니다.

### Example {#example}

로그 테이블인 `data`에서 10초마다 클릭 로그 수를 세어야 한다고 가정해봅시다. 테이블 구조는 다음과 같습니다:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

먼저 10초 간격의 텀블 윈도우로 윈도우 뷰를 생성합니다:

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

그런 다음 `WATCH` 쿼리를 사용하여 결과를 가져옵니다.

```sql
WATCH wv
```

로그가 테이블 `data`에 삽입되면,

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 쿼리는 다음과 같은 결과를 출력해야 합니다:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

또한 `TO` 문법을 사용하여 출력을 다른 테이블에 연결할 수 있습니다.

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

ClickHouse의 상태 저장 테스트에서 추가 예제를 찾을 수 있습니다(여기서 이름이 `*window_view*`입니다).

### Window View Usage {#window-view-usage}

윈도우 뷰는 다음 시나리오에서 유용합니다:

* **모니터링**: 시간별로 집계 및 계산된 메트릭 로그를 집계하여 결과를 대상 테이블에 출력합니다. 대시보드는 대상 테이블을 소스 테이블로 사용할 수 있습니다.
* **분석**: 시간 창에서 데이터를 자동으로 집계 및 전처리합니다. 이는 대량의 로그를 분석할 때 유용할 수 있습니다. 전처리는 여러 쿼리에서 반복 계산을 줄이고 쿼리 대기 시간을 단축합니다.

## Related Content {#related-content}

- 블로그: [ClickHouse에서 시계열 데이터 다루기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 블로그: [ClickHouse로 관측 솔루션 구축하기 - 2부 - 추적](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## Temporary Views {#temporary-views}

ClickHouse는 다음과 같은 특성을 가진 **임시 뷰**를 지원합니다(적용 가능한 경우 임시 테이블에 일치):

* **세션 수명**
  임시 뷰는 현재 세션의 기간 동안만 존재합니다. 세션이 종료되면 자동으로 삭제됩니다.

* **데이터베이스 없음**
  임시 뷰는 데이터베이스 이름으로 자격을 부여할 수 없습니다. 세션(namespace) 외부에 존재합니다.

* **복제되지 않음 / 클러스터에서 사용 불가**
  임시 객체는 세션에 국한되어 있으며 **ON CLUSTER**로 생성할 수 없습니다.

* **이름 해결**
  임시 객체(테이블 또는 뷰)가 지속적인 객체와 동일한 이름을 가진 경우, 쿼리가 데이터베이스 없이 이 이름을 참조하면 **임시** 객체가 사용됩니다.

* **논리적 객체(저장소 없음)**
  임시 뷰는 자신의 `SELECT` 텍스트만 저장합니다(내부적으로 `View` 저장소를 사용). 데이터가 지속되지 않으며 `INSERT`를 수락할 수 없습니다.

* **Engine 절**
  `ENGINE`을 지정할 필요가 없습니다. `ENGINE = View`로 제공되면 무시되며 동일한 논리적 뷰로 간주됩니다.

* **보안 / 권한**
  임시 뷰를 생성하려면 `CREATE TEMPORARY VIEW` 권한이 필요하며 이는 `CREATE VIEW`에 의해 암묵적으로 부여됩니다.

* **SHOW CREATE**
  임시 뷰의 DDL을 출력하려면 `SHOW CREATE TEMPORARY VIEW view_name;`를 사용합니다.

### Syntax {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE`는 임시 뷰에서 지원되지 않습니다(임시 테이블과 일치). 임시 뷰를 "교체"해야 하는 경우, 삭제하고 다시 생성해야 합니다.

### Examples {#temporary-views-examples}

임시 소스 테이블과 그 위에 임시 뷰를 생성합니다:

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

그 DDL을 표시합니다:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

삭제합니다:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```

### Disallowed / limitations {#temporary-views-limitations}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **허용되지 않음** (사용 `DROP` + `CREATE`).
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **허용되지 않음**.
* `CREATE TEMPORARY VIEW db.view AS ...` → **허용되지 않음** (데이터베이스 한정어 없음).
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **허용되지 않음** (임시 객체는 세션 로컬입니다).
* `POPULATE`, `REFRESH`, `TO [db.table]`, 내부 엔진 및 모든 MV 특정 절 → **임시 뷰에 해당하지 않음**.

### Notes on distributed queries {#temporary-views-distributed-notes}

임시 **뷰**는 정의에 불과하며 전달할 데이터가 없습니다. 임시 뷰가 임시 **테이블**을 참조하는 경우(예: `Memory`), 그 데이터는 전달된 쿼리 실행 중 원격 서버에 전달될 수 있습니다. 임시 테이블과 동일한 방식으로 작동합니다.

#### Example {#temporary-views-distributed-example}

```sql
-- A session-scoped, in-memory table
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- A session-scoped view over the temp table (purely logical)
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- Replace 'test' with your cluster name.
-- GLOBAL JOIN forces ClickHouse to *ship* the small join-side (temp_ids via v_ids)
-- to every remote server that executes the left side.
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```
