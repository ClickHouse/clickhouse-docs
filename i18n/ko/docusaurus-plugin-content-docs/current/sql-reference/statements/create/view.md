---
description: 'CREATE VIEW 문서'
sidebar_label: 'VIEW'
sidebar_position: 37
slug: /sql-reference/statements/create/view
title: 'CREATE VIEW'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW \{#create-view\}

새 VIEW를 생성합니다. VIEW는 [일반 VIEW](#normal-view), [구체화된 뷰(Materialized View)](#materialized-view), [갱신 가능한 구체화된 뷰(Refreshable Materialized View)](#refreshable-materialized-view), [윈도우 뷰](/sql-reference/statements/create/view#window-view)로 생성할 수 있습니다.

## 일반 뷰 \{#normal-view\}

문법:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

일반 VIEW는 어떤 데이터도 저장하지 않습니다. 각 조회 시마다 다른 테이블에서 읽기만 합니다. 다시 말해, 일반 VIEW는 저장된 쿼리에 불과합니다. VIEW에서 읽을 때는 이 저장된 쿼리가 [FROM](../../../sql-reference/statements/select/from.md) 절에 서브쿼리로 사용됩니다.

예를 들어, VIEW를 하나 CREATE했다고 가정해 보겠습니다:

```sql
CREATE VIEW view AS SELECT ...
```

그리고 다음 쿼리를 작성했습니다:

```sql
SELECT a, b, c FROM view
```

이 쿼리는 서브쿼리를 사용하는 것과 기능적으로 완전히 동일합니다.

```sql
SELECT a, b, c FROM (SELECT ...)
```


## 매개변수화된 View \{#parameterized-view\}

매개변수화된 View는 일반 View와 비슷하지만, 매개변수를 즉시 평가하지 않고 생성할 수 있습니다. 이러한 View는 table function과 함께 사용할 수 있으며, 이때 View의 이름을 function 이름으로, 매개변수 값을 해당 function의 인수로 지정합니다.

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

위의 정의는 아래와 같이 매개변수를 치환하여 테이블 함수(table function)로 사용할 수 있는 테이블에 대한 VIEW를 생성합니다.

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```


## materialized view \{#materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[REFRESH ...]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

```sql
CREATE OR REPLACE MATERIALIZED VIEW [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[REFRESH ...]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

`OR REPLACE`와 `IF NOT EXISTS`는 함께 사용할 수 없습니다. 둘을 조합하면 구문 오류가 발생합니다.

### CREATE OR REPLACE MATERIALIZED VIEW \{#create-or-replace-materialized-view\}

`CREATE OR REPLACE MATERIALIZED VIEW`는 기존 materialized view와 해당 내부 저장 테이블(있는 경우)을 원자적으로 교체합니다. 이 작업을 수행하려면 `Atomic` 또는 `Replicated` 데이터베이스 엔진이 필요합니다.

```sql
CREATE OR REPLACE MATERIALIZED VIEW [db.]name [ON CLUSTER cluster]
[TO [db.]target_table]
[ENGINE = engine]
[POPULATE]
[REFRESH ...]
AS SELECT ...
```

주요 동작:

* **`TO` 절 없이**: 기존 내부 테이블이 삭제되고 새 테이블이 생성됩니다. `POPULATE`를 지정하지 않으면 내부 테이블의 기존 데이터는 손실됩니다.
* **`TO` 절 사용 시**: 뷰 정의만 대체되며, 대상 테이블과 그 데이터는 영향을 받지 않습니다.
* `REFRESH`, `ON CLUSTER`, 그리고 모든 엔진 옵션과 호환됩니다. `POPULATE`는 `Atomic` 데이터베이스에서만 지원되며, `Replicated` 데이터베이스에서는 허용되지 않습니다(`POPULATE`에 대한 아래 참고 사항 참조).
* `CREATE VIEW` 및 `DROP VIEW` 권한이 필요합니다.

:::note
`CREATE OR REPLACE MATERIALIZED VIEW`는 `Atomic` 또는 `Replicated` 데이터베이스 엔진에서만 지원됩니다. `Ordinary` 데이터베이스 엔진에서는 지원되지 않습니다.
:::

**예시:**

```sql
-- Create a materialized view with an inner table
CREATE OR REPLACE MATERIALIZED VIEW mv
    ENGINE = MergeTree ORDER BY x
    AS SELECT x, sum(y) AS total FROM src GROUP BY x;

-- Replace with a new definition (old inner table data is lost)
CREATE OR REPLACE MATERIALIZED VIEW mv
    ENGINE = MergeTree ORDER BY x
    AS SELECT x, count() AS cnt FROM src GROUP BY x;

-- Replace with POPULATE to backfill from existing source data
CREATE OR REPLACE MATERIALIZED VIEW mv
    ENGINE = MergeTree ORDER BY x
    POPULATE
    AS SELECT x FROM src;

-- Replace an inner-table MV with a TO-table MV (target data is preserved)
CREATE OR REPLACE MATERIALIZED VIEW mv TO target
    AS SELECT x FROM src;
```

:::tip
[Materialized views](/guides/developer/cascading-materialized-views.md)를 사용하는 단계별 가이드는 여기에서 확인할 수 있습니다.
:::

Materialized view는 해당 [SELECT](../../../sql-reference/statements/select/index.md) 쿼리에 의해 변환된 데이터를 저장합니다.

`TO [db].[table]` 없이 materialized view를 생성하는 경우, 데이터를 저장할 테이블 엔진인 `ENGINE`을 반드시 지정해야 합니다.

`TO [db].[table]`을 사용하여 materialized view를 생성하는 경우에는 `POPULATE`를 함께 사용할 수 없습니다.

materialized view는 다음과 같이 구현됩니다. `SELECT`에 지정된 테이블에 데이터를 삽입할 때, 삽입된 데이터의 일부가 이 `SELECT` 쿼리에 의해 변환되고, 그 결과가 뷰에 삽입됩니다.

:::note
ClickHouse의 materialized view는 대상 테이블에 데이터를 삽입할 때 컬럼 순서가 아니라 **컬럼 이름**을 사용합니다. `SELECT` 쿼리 결과에 일부 컬럼 이름이 존재하지 않으면, 해당 컬럼이 [Nullable](../../data-types/nullable.md)이 아니더라도 ClickHouse는 기본값을 사용합니다. 안전한 방법은 Materialized views를 사용할 때 모든 컬럼에 대해 별칭(alias)을 추가하는 것입니다.

ClickHouse의 materialized view는 insert 트리거(insert trigger)에 더 가깝게 구현되어 있습니다. 뷰 쿼리에 집계가 포함된 경우, 이는 새로 삽입된 데이터 배치에만 적용됩니다. 소스 테이블의 기존 데이터(예: update, delete, drop partition 등)에 대한 변경은 materialized view에 반영되지 않습니다.

ClickHouse의 materialized view는 오류가 발생했을 때 결정적인(deterministic) 동작을 보장하지 않습니다. 이는 이미 기록된 블록은 대상 테이블에 그대로 남지만, 오류 이후의 모든 블록은 기록되지 않음을 의미합니다.

기본적으로 뷰 중 하나로 푸시하는 과정에서 예외가 발생하면 `INSERT` 쿼리가 실패합니다. 그 시점까지 해당 블록이 이미 소스 테이블에 기록되었는지는 보장되지 않으며, 이는 뷰 오류가 아니라 삽입 파이프라인의 타이밍에 따라 달라집니다. 소스 테이블과 모든 종속 뷰에 대해 exactly-once 전달을 보장하려면 삽입 중복 제거(insert deduplication) (`insert_deduplicate`, `deduplicate_blocks_in_dependent_materialized_views`)를 사용하여 실패한 `INSERT`를 다시 시도하십시오.

`INSERT` 쿼리에 `materialized_views_ignore_errors=true`를 설정하면 오류 보고 방식만 변경됩니다. 각 뷰 오류는 경고로 기록되고 `INSERT` 쿼리는 성공으로 처리됩니다. 오류가 발생한 뷰의 대상에 대한 전달은 부분적으로만 이루어집니다. 즉, 예외가 발생하기 전에 처리된 블록은 유지되지만, 오류가 발생한 블록과 그 이후의 모든 블록은 해당 뷰에서 삭제됩니다. 해당 대상의 다운스트림 뷰는 실제로 도착한 블록만 보게 되므로, 이들에 대한 전달도 부분적으로만 이루어집니다. 예외를 발생시키지 않은 형제 뷰(및 그 다운스트림 체인)에는 전체 데이터가 기록되며, 소스 테이블에도 평소와 같이 기록됩니다. `INSERT`가 성공으로 보고되므로 클라이언트는 실패 신호를 받지 못하고 자동 retry도 trigger되지 않습니다. 이 설정은 뷰 측 문제로 인해 소스 테이블 쓰기가 차단되지 않아야 하는 경우에만 사용하십시오(예: `system.*_log` 테이블).

`materialized_views_ignore_errors`는 `system.*_log` 테이블에서 기본적으로 `true`입니다.
:::

`POPULATE`를 지정하면 뷰를 생성할 때 기존 테이블 데이터가 뷰에 삽입되며, 이는 `CREATE TABLE ... AS SELECT ...`를 수행하는 것과 같습니다. 그렇지 않으면 쿼리에는 뷰 생성 이후 테이블에 삽입된 데이터만 포함됩니다. 뷰 생성 중에 테이블에 삽입된 데이터는 뷰에 삽입되지 않으므로, `POPULATE` 사용은 **권장하지 않습니다**.

:::note
`POPULATE`는 `CREATE TABLE ... AS SELECT ...`처럼 동작하므로 다음과 같은 제한이 있습니다.

* Replicated 데이터베이스에서는 지원되지 않습니다.
* ClickHouse Cloud에서는 지원되지 않습니다.

대신 별도의 `INSERT ... SELECT`를 사용할 수 있습니다.
:::

`SELECT` 쿼리에는 `DISTINCT`, `GROUP BY`, `ORDER BY`, `LIMIT`를 포함할 수 있습니다. 해당 변환은 삽입된 각 데이터 블록에 대해 독립적으로 수행된다는 점에 유의하십시오. 예를 들어, `GROUP BY`가 설정된 경우, 데이터는 삽입 시 집계되지만, 단일 패킷에 포함된 삽입 데이터 내에서만 집계됩니다. 그 이후에 추가적인 집계는 수행되지 않습니다. 예외적으로, `SummingMergeTree`와 같이 자체적으로 데이터 집계를 수행하는 `ENGINE`을 사용하는 경우는 다릅니다.

materialized view가 `TO [db.]name` 구문을 사용하는 경우, 뷰를 `DETACH`하고 대상 테이블에 대해 `ALTER`를 실행한 뒤, 이전에 분리(`DETACH`)했던 뷰를 다시 `ATTACH`할 수 있습니다.

materialized view는 [optimize&#95;on&#95;insert](/operations/settings/settings#optimize_on_insert) 설정의 영향을 받는다는 점에 유의하십시오. 데이터는 뷰에 삽입되기 전에 머지(merge)됩니다.

뷰는 일반 테이블과 동일하게 보입니다. 예를 들어, `SHOW TABLES` 쿼리 결과에 함께 나열됩니다.

뷰를 삭제하려면 [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view)를 사용하십시오. `DROP TABLE`도 VIEW에 사용할 수 있습니다.

## SQL security \{#sql_security\}

`DEFINER`와 `SQL SECURITY`를 사용하면 뷰의 기본 쿼리를 실행할 때 사용할 ClickHouse 사용자 계정을 지정할 수 있습니다.
`SQL SECURITY`에는 세 가지 유효한 값이 있습니다: `DEFINER`, `INVOKER`, `NONE`. `DEFINER` 절에서 기존 사용자 계정이나 `CURRENT_USER`를 지정할 수 있습니다.

다음 표는 뷰에서 SELECT를 수행하기 위해 어떤 사용자에게 어떤 권한이 필요한지 설명합니다.
SQL security 옵션과 무관하게, 해당 뷰에서 읽기 위해서는 항상 `GRANT SELECT ON <view>` 권한이 필요합니다.

| SQL security option | View                                         | Materialized View                                                       |
| ------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| `DEFINER alice`     | `alice`는 뷰의 소스 테이블에 대한 `SELECT` 권한이 있어야 합니다. | `alice`는 뷰의 소스 테이블에 대한 `SELECT` 권한과 뷰의 대상 테이블에 대한 `INSERT` 권한이 있어야 합니다. |
| `INVOKER`           | 사용자는 뷰의 소스 테이블에 대한 `SELECT` 권한이 있어야 합니다.     | materialized view에는 `SQL SECURITY INVOKER`를 지정할 수 없습니다.                 |
| `NONE`              | -                                            | -                                                                       |

:::note
`SQL SECURITY NONE` 옵션은 더 이상 사용이 권장되지 않는(deprecated) 옵션입니다. `SQL SECURITY NONE`으로 뷰를 생성할 권한이 있는 사용자는 임의의 쿼리를 실행할 수 있게 됩니다.
따라서 이 옵션으로 뷰를 생성하려면 `GRANT ALLOW SQL SECURITY NONE TO <user>` 권한이 필요합니다.
:::

`DEFINER`/`SQL SECURITY`가 지정되지 않은 경우 기본값이 사용됩니다:

* `SQL SECURITY`: 일반 뷰는 `INVOKER`, materialized view는 `DEFINER` ([settings로 구성 가능](../../../operations/settings/settings.md#default_normal_view_sql_security))
* `DEFINER`: `CURRENT_USER` ([settings로 구성 가능](../../../operations/settings/settings.md#default_view_definer))

`DEFINER`/`SQL SECURITY`가 지정되지 않은 상태로 뷰가 `ATTACH`될 때, materialized view의 기본값은 `SQL SECURITY NONE`, 일반 뷰의 기본값은 `SQL SECURITY INVOKER`입니다.

기존 뷰의 SQL security를 변경하려면 다음을 사용하십시오

```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```


### 예제 \{#examples\}

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


## 라이브 view \{#live-view\}

<DeprecatedBadge/>

이 기능은 더 이상 지원되지 않으며, 향후 제거될 예정입니다.

편의를 위해 이전 문서는 [여기](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)에서 확인할 수 있습니다.

## 갱신 가능 구체화 뷰 \{#refreshable-materialized-view\}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
REFRESH [EVERY|AFTER interval [OFFSET interval]]
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

여기서 `interval`은 단순한 인터벌들로 이루어진 시퀀스입니다:

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

`REFRESH` 절에는 `EVERY`, `AFTER`, `DEPENDS ON` 중 적어도 하나를 지정해야 합니다. 이들 중 어느 것도 없는 단독 `REFRESH`는 거부됩니다. `EVERY`/`AFTER` 없이 사용하는 `REFRESH DEPENDS ON ...`는 `REFRESH AFTER 0 SECOND DEPENDS ON ...`의 축약형입니다. 자세한 내용은 아래의 [갱신 종속성](#refresh-dependencies)을 참조하십시오.

해당 쿼리를 주기적으로 실행하여 결과를 테이블에 저장합니다.

* `APPEND`가 지정되어 있으면, 각 갱신 시 기존 행을 삭제하지 않고 테이블에 행을 삽입합니다. 이 삽입은 일반적인 `INSERT INTO ... SELECT` 쿼리와 마찬가지로 원자적이지 않습니다.
* 그렇지 않으면 각 갱신 시 이전 테이블 내용을 원자적으로 교체합니다.

일반적인 갱신 불가능 materialized view와의 차이점:

* 삽입 트리거가 없습니다. `SELECT`에 지정된 테이블에 새 데이터가 삽입되어도 갱신 가능 구체화 뷰로 자동으로 전달되지 *않습니다*. 대신 데이터 삽입은 주기적 또는 수동 갱신 실행 중에만 발생합니다.
* `SELECT` 쿼리에 제한이 없습니다. 테이블 함수(예: `url()`), 뷰, UNION, JOIN이 모두 허용됩니다.

:::note
쿼리의 `REFRESH ... SETTINGS` 부분에 있는 설정(예: `refresh_retries`)은 갱신 설정이며, 일반 설정(예: `max_threads`)과는 다릅니다. 일반 설정은 쿼리 끝에 `SETTINGS`를 사용하여 지정할 수 있습니다.
:::

### 갱신 일정 \{#refresh-schedule\}

다음은 갱신 일정의 예시입니다:

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

`RANDOMIZE FOR`는 각 갱신 시점을 무작위로 조정합니다. 예:

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

특정 view에 대해서는 한 시점에 최대 하나의 갱신만 실행됩니다. 예를 들어 `REFRESH EVERY 1 MINUTE`가 설정된 view의 갱신에 2분이 걸리는 경우, 실제로는 2분마다 갱신가 수행됩니다. 이후 갱신 속도가 빨라져 10초 만에 완료되기 시작하면, 다시 1분마다 갱신를 수행합니다. (특히 누락된 갱신를 따라잡기 위해 10초마다 갱신를 수행하지는 않으며, 그런 backlog 개념은 존재하지 않습니다.)

일반적으로 첫 번째 갱신는 materialized view가 생성된 직후 즉시 시작됩니다. 마지막 갱신 이후 경과 시간은 무한대로 간주되므로, 어떤 스케줄이든 지금 갱신할 시점이라고 판단합니다. `EMPTY`가 지정된 경우 이 초기 갱신는 건너뛰고, 첫 번째 갱신는 다음 예약 시각에 수행됩니다. 예를 들어 `EVERY 1 HOUR`의 경우 첫 번째 갱신는 현재 시간의 끝 시점에 수행됩니다.

### 복제 DB에서 \{#in-replicated-db\}

갱신 가능 구체화 뷰(refreshable materialized view)가 [Replicated 데이터베이스](../../../engines/database-engines/replicated.md)에 있는 경우, 레플리카들은 서로 조율하여 예약된 시각마다 오직 하나의 레플리카만 갱신을 수행하도록 합니다. 모든 레플리카가 갱신으로 생성된 데이터를 볼 수 있도록 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 테이블 엔진이 필요합니다.

`APPEND` 모드에서는 `SETTINGS all_replicas = 1`을 사용하여 조율을 비활성화할 수 있습니다. 이렇게 하면 레플리카들이 서로 독립적으로 갱신을 수행합니다. 이 경우 ReplicatedMergeTree는 필요하지 않습니다.

`APPEND`가 아닌 모드에서는 조율된 갱신만 지원합니다. 조율되지 않은 동작이 필요하다면, `Atomic` 데이터베이스와 `CREATE ... ON CLUSTER` 쿼리를 사용하여 모든 레플리카에 갱신 가능 구체화 뷰를 생성하십시오.

조율은 Keeper를 통해 이루어집니다. znode 경로는 [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path) 서버 설정으로 결정됩니다.

### 갱신 종속성 \{#refresh-dependencies\}

`DEPENDS ON`은 서로 다른 테이블의 갱신 시점을 동기화합니다:

```sql
CREATE MATERIALIZED VIEW dependent REFRESH EVERY 1 HOUR DEPENDS ON dependency [...]
```

종속 뷰의 갱신은 의존하는 모든 뷰의 갱신이 완료된 후에만 시작됩니다.

다른 뷰가 갱신된 직후 바로 갱신하려면:

```sql
CREATE MATERIALIZED VIEW dependent REFRESH AFTER 0 SECOND DEPENDS ON dependency [...]
```

또는 다음과 같이 표현할 수도 있습니다:

```sql
CREATE MATERIALIZED VIEW dependent REFRESH DEPENDS ON dependency [...]
```

:::note
`DEPENDS ON`은 갱신 가능 구체화 뷰 사이에서만 작동합니다. 특히 의존 대상 뷰가 `TO <table>`을 사용하는 경우에는 테이블 이름이 아니라 뷰 이름을 사용해야 합니다. `DEPENDS ON` 목록에 일반 테이블이나 갱신 가능 구체화 뷰가 아닌 뷰가 포함되어 있거나 오타가 있으면 해당 뷰는 갱신되지 않으며, `system.view_refreshes`에 상태가 `MissingDependencies`로 표시됩니다. 의존성은 `ALTER`를 사용하여 변경하거나 제거할 수 있습니다. 자세한 내용은 [갱신 매개변수 변경](#changing-refresh-parameters)을 참조하십시오.
:::

#### 일관된 전파 지연 시간을 위해 DEPENDS ON 사용하기 \{#using-depends-on-for-consistent-propagation-latency\}

두 뷰가 모두 같은 주기로 `REFRESH EVERY`를 사용하면 종속성은 각 시간 슬롯마다 적용됩니다.

예를 들어 뷰 X와 Y가 모두 `REFRESH EVERY 1 HOUR`를 사용하고, Y가 X의 출력 테이블을 읽는다고 가정합니다. 종속성이 없으면 Y는 일반적으로 X의 이전 시간 갱신 데이터만 보게 됩니다. `DEPENDS ON X`를 사용하면 Y의 11:00 갱신은 X의 11:00 갱신이 완료된 후에만 시작됩니다.

```text
           10:00            11:00            12:00
           │                │                │
  X:        [run]┐           [run]┐           [run]┐
                 │                │                │
  Y:             └►[run]          └►[run]          └►[run]
```

dependency와 dependent는 모두 갱신이 갱신 주기보다 오래 걸리면 각각 독립적으로 타임슬롯을 건너뛸 수 있습니다. dependency가 갱신될 때마다 dependent가 정확히 한 번씩 갱신된다는 보장은 없습니다.

```text
           10:00          11:00          12:00          13:00
           │              │              │              |
  X:        [run]┐         [run]┐         [run]┐         [run]┐
                 │              └────┐    (Y skips 12:00)     └───┐
  Y:             └►[10:00 ru------un]└►[11:00 ru---------------un]└►[13:00 run]
```

#### 배치 스트림 처리에 `DEPENDS ON` 사용하기 \{#using-depends-on-for-batched-stream-processing\}

`REFRESH EVERY`를 사용하지 않으면, 종속된 뷰 X는 X가 마지막으로 갱신된 이후 의존하는 모든 뷰가 최소 한 번씩 갱신되었을 때 갱신됩니다. `REFRESH AFTER T`는 지연 시간을 추가합니다. 즉, 의존 대상의 갱신이 완료된 후 T 시간이 지나면 종속된 뷰의 갱신이 시작됩니다.

순환 종속성은 허용되며, 유용하게 활용할 수 있습니다. 다음과 같은 갱신 가능 구체화 뷰 그래프를 생각해 보십시오.

1. X는 어떤 스트림에서 행 배치를 가져와 테이블에 저장합니다.
2. 그런 다음 Y와 Z는 모두 해당 테이블을 읽어 서로 다른 집계를 수행하고, 결과를 다른 테이블에 추가합니다.
3. 배치가 완전히 처리되면 X는 다음 배치를 가져오고, 이 주기가 반복됩니다.

```text
            source
               │
               ▼
          ┌─────────┐
     ┌───►│    X    │◄───┐
     │    └──┬───┬──┘    │
  DEPENDS    │   │    DEPENDS
    ON       ▼   ▼      ON
     │      ┌─┐ ┌─┐      │
     └──────┤Y│ │Z├──────┘
            └─┘ └─┘
```

전체 예시는 다음과 같습니다:

```sql
CREATE TABLE current_batch (t UInt64, v Int64) ENGINE ReplicatedMergeTree ORDER BY t;
CREATE TABLE batch_log (max_t UInt64, n Int64, v_sum Int64, processed_at DateTime64) ENGINE ReplicatedMergeTree ORDER BY max_t;
CREATE TABLE stats (h UInt64, n UInt64) ENGINE ReplicatedSummingMergeTree ORDER BY h;

-- (system.numbers stands in for a data source with monotonically increasing timestamps or sequence numbers)
CREATE MATERIALIZED VIEW current_batch_v REFRESH EVERY 10 SECOND DEPENDS ON batch_log_v, stats_v TO current_batch AS SELECT number as t, number * 10 as v FROM system.numbers WHERE number > (SELECT max(max_t) FROM batch_log) LIMIT 100;

CREATE MATERIALIZED VIEW batch_log_v REFRESH DEPENDS ON current_batch_v APPEND TO batch_log AS SELECT max(t) as max_t, count() as n, sum(v) as v_sum, now64() as processed_at FROM current_batch;

CREATE MATERIALIZED VIEW stats_v REFRESH DEPENDS ON current_batch_v APPEND TO stats AS SELECT cityHash64(v) % 20 as h, count() as n FROM current_batch GROUP BY h;

-- Must trigger initial refresh manually.
SYSTEM REFRESH VIEW current_batch_v;
```

더 긴 체인도 문제없이 작동합니다.

이는 갱신 조정이 사용 설정된 경우에만 제대로 작동합니다. 즉, 뷰가 Replicated 또는 Shared 데이터베이스에 있어야 합니다. 조정이 없으면 서버를 재시작할 때 순환이 끊어지므로, 뷰를 생성한 후 한 번만 `SYSTEM REFRESH VIEW`를 실행하는 것이 아니라 재시작할 때마다 수동으로 `SYSTEM REFRESH VIEW`를 실행해야 합니다.

### 갱신 설정 \{#refresh-settings\}

사용 가능한 갱신 설정은 다음과 같습니다.

* `refresh_retries` - 갱신 쿼리가 예외로 실패했을 때 재시도할 횟수입니다. 모든 재시도가 실패하면 다음에 예약된 갱신 시각까지 건너뜁니다. 0은 재시도 안 함을, -1은 무한 재시도를 의미합니다. 기본값: 2.
* `refresh_retry_initial_backoff_ms` - `refresh_retries`가 0이 아닐 때 첫 번째 재시도 전에 대기하는 시간입니다. 이후 각 재시도마다 대기 시간이 두 배로 증가하며, `refresh_retry_max_backoff_ms`까지 증가합니다. 기본값: 100 ms.
* `refresh_retry_max_backoff_ms` - 갱신 재시도 간 지연 시간이 지수적으로 증가할 때 적용되는 최대 한도입니다. 기본값: 60000 ms (1분).
* `all_replicas` - `APPEND`가 있는 [복제된 데이터베이스](../../../engines/database-engines/replicated.md)에서 모든 레플리카가 독립적으로 갱신할지, 아니면 예약된 각 시각마다 하나의 레플리카만 갱신할지를 제어합니다. 뷰가 생성된 후에는 변경할 수 없습니다. 기본값: `false`.

### 갱신 매개변수 수정 \{#changing-refresh-parameters\}

기존 갱신 가능 구체화 뷰의 갱신 매개변수는 [`ALTER TABLE ... MODIFY REFRESH`](../alter/view.md#alter-table--modify-refresh-statement)를 사용하여 수정합니다:

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

일정(`EVERY` 또는 `AFTER`)은 필수입니다. 이 문은 일정, `RANDOMIZE FOR`, `DEPENDS ON`, 갱신 설정을 포함한 *모든* 갱신 매개변수를 지정된 내용으로 항상 대체합니다. 생략된 항목은 기본값으로 재설정되거나(설정), 제거됩니다(의존성, 랜덤화).

:::note

* 갱신 설정만 변경하려면(예: `refresh_retries`) 기존 일정을 다시 지정하십시오:

  ```sql
  ALTER TABLE rmv MODIFY REFRESH EVERY 1 HOUR SETTINGS refresh_retries = 5;
  ```

* materialized view에서는 `ALTER TABLE ... MODIFY SETTING refresh_retries = ...`가 지원되지 않습니다. 반드시 `MODIFY REFRESH`를 통해 변경해야 합니다.

* `APPEND`를 추가하거나 제거하는 것은 지원되지 않습니다.

* `all_replicas` 설정은 생성 후에는 변경할 수 없습니다.
  :::

예시:

```sql
-- Change the schedule, drop existing settings and dependencies.
ALTER TABLE rmv MODIFY REFRESH EVERY 30 MINUTE;

-- Change the schedule and tune retry behavior.
ALTER TABLE rmv MODIFY REFRESH EVERY 30 MINUTE
SETTINGS refresh_retries = 5,
         refresh_retry_initial_backoff_ms = 500,
         refresh_retry_max_backoff_ms = 60000;

-- Keep the dependency while changing the period.
ALTER TABLE rmv MODIFY REFRESH EVERY 6 HOUR DEPENDS ON other_rmv;

-- Drop the dependency by omitting `DEPENDS ON`.
ALTER TABLE rmv MODIFY REFRESH EVERY 6 HOUR;
```

### 기타 작업 \{#other-operations\}

모든 갱신 가능 materialized view의 상태는 [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md) 테이블에서 확인할 수 있습니다. 여기에는 (실행 중인 경우) 갱신 진행 상황, 마지막 및 다음 갱신 시각, 갱신 실패 시 예외 메시지 등이 포함됩니다.

갱신을 수동으로 중지, 시작, 트리거하거나 취소하려면 [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#managing-refreshable-materialized-views)를 사용하십시오.

갱신이 완료될 때까지 기다리려면 [`SYSTEM WAIT VIEW`](../system.md#wait-view)를 사용하십시오. 특히 뷰를 생성한 후 초기 갱신이 끝날 때까지 대기할 때 유용합니다.

:::note
알면 재미있는 사실: 갱신 쿼리는 갱신 중인 뷰에서 데이터를 읽을 수 있으며, 갱신 전 버전의 데이터를 보게 됩니다. 이는 다음 링크와 같이 Conway&#39;s Game of Life를 구현할 수 있음을 의미합니다: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## 윈도우 뷰(Window View) \{#window-view\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
이는 실험적인 기능으로, 향후 릴리스에서 이전 버전과 호환되지 않는 방식으로 변경될 수 있습니다. 윈도우 뷰와 `WATCH` 쿼리 사용을 활성화하려면 [allow&#95;experimental&#95;window&#95;view](/operations/settings/settings#allow_experimental_window_view) 설정을 활성화하십시오. `set allow_experimental_window_view = 1` 명령을 입력하십시오.
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

윈도우 뷰(window view)는 시간 윈도우 단위로 데이터를 집계하며, 윈도우가 실행될 준비가 되었을 때 결과를 출력합니다. 이 뷰는 지연 시간을 줄이기 위해 내부(또는 지정된) 테이블에 부분 집계 결과를 저장하고, 처리 결과를 지정된 테이블로 푸시하거나 WATCH 쿼리를 사용해 알림을 전송할 수 있습니다.

윈도우 뷰를 생성하는 방식은 materialized view인 `MATERIALIZED VIEW`를 생성하는 것과 유사합니다. 윈도우 뷰에는 중간 데이터를 저장할 내부 저장소 엔진이 필요합니다. 내부 저장소는 `INNER ENGINE` 절을 사용해 지정할 수 있으며, 윈도우 뷰는 기본 내부 엔진으로 `AggregatingMergeTree`를 사용합니다.

`TO [db].[table]` 없이 윈도우 뷰를 생성할 때는 데이터를 저장할 테이블 엔진인 `ENGINE`을 반드시 지정해야 합니다.


### Time Window Functions \{#time-window-functions\}

[Time window functions](../../functions/time-window-functions.md)는 레코드에 대한 윈도우의 하한과 상한 경계를 구하는 데 사용됩니다. Window View는 time window function과 함께 사용해야 합니다.

### 시간 속성(TIME ATTRIBUTES) \{#time-attributes\}

윈도우 뷰(Window View)는 **processing time**과 **event time** 처리를 지원합니다.

**Processing time**은 윈도우 뷰가 로컬 머신의 시간을 기준으로 결과를 생성하도록 하며, 기본값으로 사용됩니다. 가장 직관적인 시간 개념이지만 결과의 결정성을 보장하지는 않습니다. processing time 속성은 윈도우 함수의 `time_attr`를 테이블 컬럼으로 지정하거나 `now()` 함수를 사용하여 정의할 수 있습니다. 다음 쿼리는 processing time을 사용하는 윈도우 뷰를 생성합니다.

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**이벤트 시간(event time)**은 각 개별 이벤트가 해당 이벤트를 생성한 장치에서 실제로 발생한 시각입니다. 이 시간은 일반적으로 레코드가 생성될 때 레코드 내부에 함께 기록됩니다. 이벤트 시간 처리(event time processing)를 사용하면 순서가 뒤바뀐 이벤트나 지연된 이벤트가 있는 경우에도 결과를 일관되게 유지할 수 있습니다. Window view는 `WATERMARK` 구문을 사용하여 이벤트 시간 처리를 지원합니다.

Window view는 세 가지 워터마크 전략을 제공합니다:

* `STRICTLY_ASCENDING`: 지금까지 관찰된 최대 타임스탬프를 워터마크로 출력합니다. 타임스탬프가 최대 타임스탬프보다 작은 행은 지연된 것이 아닙니다.
* `ASCENDING`: 지금까지 관찰된 최대 타임스탬프에서 1을 뺀 값을 워터마크로 출력합니다. 타임스탬프가 최대 타임스탬프 이하인 행은 지연된 것이 아닙니다.
* `BOUNDED`: WATERMARK=INTERVAL. 지정된 지연 시간만큼을 뺀, 관찰된 최대 타임스탬프를 워터마크로 출력합니다.

다음 쿼리는 `WATERMARK`를 사용해 Window view를 생성하는 예시입니다:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

기본적으로 워터마크가 도착하면 윈도우가 트리거되고, 워터마크 이후에 도착한 요소는 버려집니다. Window view는 `ALLOWED_LATENESS=INTERVAL`을 설정하여 지연 이벤트 처리(late event processing)를 지원합니다. 지연 이벤트 처리 예시는 다음과 같습니다.

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

지연 실행으로 인해 방출되는 요소는 이전 계산의 갱신된 결과로 취급해야 합니다. 윈도우의 끝에서 실행하는 대신, 윈도우 뷰는 지연 이벤트가 도착하는 즉시 실행됩니다. 따라서 동일한 윈도우에 대해 여러 번의 출력이 발생하게 됩니다. 사용자는 이러한 중복된 결과를 고려하여 처리하거나, 결과를 중복 제거해야 합니다.

`ALTER TABLE ... MODIFY QUERY` 문을 사용하여 윈도우 뷰에 지정된 `SELECT` 쿼리를 수정할 수 있습니다. 새 `SELECT` 쿼리로 인해 생성되는 데이터 구조는 `TO [db.]name` 절의 사용 여부와 관계없이 원래 `SELECT` 쿼리와 동일해야 합니다. 중간 상태를 재사용할 수 없기 때문에 현재 윈도우의 데이터는 손실된다는 점에 유의하십시오.


### 새 윈도우 모니터링 \{#monitoring-new-windows\}

윈도우 뷰는 변경 사항을 모니터링하기 위해 [WATCH](../../../sql-reference/statements/watch.md) 쿼리를 사용하거나 `TO` 구문을 사용하여 결과를 테이블로 출력할 수 있습니다.

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`LIMIT`을 지정하여 쿼리를 종료하기 전에 수신할 업데이트 개수를 설정할 수 있습니다. `EVENTS` 절을 사용하면 쿼리 결과 대신 최신 쿼리 워터마크 값만을 수신하는 `WATCH` 쿼리의 축약 형태를 사용할 수 있습니다.


### 설정 \{#settings-1\}

- `window_view_clean_interval`: 오래된 데이터를 삭제하기 위한 윈도우 뷰 정리 간격(초)입니다. 시스템 시간 또는 `WATERMARK` 설정에 따라 아직 완전히 트리거되지 않은 윈도우는 유지되며, 나머지 데이터는 삭제됩니다.
- `window_view_heartbeat_interval`: WATCH 쿼리가 살아 있음을 나타내는 하트비트 간격(초)입니다.
- `wait_for_window_view_fire_signal_timeout`: 이벤트 시간(event time) 처리에서 윈도우 뷰 fire 신호를 대기하는 타임아웃 값입니다.

### 예시 \{#example\}

`data`라는 로그 테이블에서 10초 단위로 클릭 로그 개수를 계산해야 한다고 가정합니다. 해당 테이블의 구조는 다음과 같습니다.

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

먼저 10초 텀블 윈도우를 갖는 윈도우 뷰를 생성합니다:

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

그런 다음 `WATCH` 쿼리를 사용하여 결과를 확인합니다.

```sql
WATCH wv
```

로그가 `data` 테이블에 기록되면,

```sql
INSERT INTO data VALUES(1,now())
```

`WATCH` 쿼리는 다음과 같이 결과를 출력합니다:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

또는 `TO` 구문을 사용해 출력을 다른 테이블에 연결할 수 있습니다.

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

추가 예시는 ClickHouse의 stateful 테스트들에서 확인할 수 있으며, 이 테스트들은 이름에 `*window_view*`를 포함합니다.


### Window View 사용 사례 \{#window-view-usage\}

Window View는 다음과 같은 상황에서 유용합니다:

* **모니터링**: 시간 기준으로 메트릭 로그를 집계하고 계산한 뒤, 결과를 대상 테이블에 출력합니다. 대시보드는 이 대상 테이블을 소스 테이블로 사용할 수 있습니다.
* **분석**: 시간 윈도우 내 데이터를 자동으로 집계하고 전처리합니다. 이는 많은 양의 로그를 분석할 때 유용합니다. 전처리를 통해 여러 쿼리에서 반복 계산을 제거하고 쿼리 지연 시간을 줄일 수 있습니다.

## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse에서 시계열 데이터 다루기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- 블로그: [ClickHouse로 관측성 솔루션 구축하기 - 2부: 트레이스](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## 임시 VIEW \{#temporary-views\}

ClickHouse는 다음과 같은 특성을 가지는 **임시 VIEW**를 지원합니다(해당되는 경우 임시 테이블과 동일한 특성입니다).

* **세션 수명(Session-lifetime)**
  임시 VIEW는 현재 세션이 유지되는 동안에만 존재합니다. 세션이 종료되면 자동으로 삭제됩니다.

* **데이터베이스 비소속**
  임시 VIEW에는 데이터베이스 이름을 붙여서 지정할 수 **없습니다**. 어떤 데이터베이스에도 속하지 않으며, 데이터베이스 외부(세션 네임스페이스)에 존재합니다.

* **비복제 / ON CLUSTER 미지원**
  임시 객체는 해당 세션에만 로컬이며 `ON CLUSTER`를 사용하여 생성할 수 **없습니다**.

* **이름 해석(Name resolution)**
  임시 객체(테이블 또는 VIEW)와 영구 객체가 동일한 이름을 가지고 있고, 쿼리에서 데이터베이스 이름 없이 그 이름만 참조하는 경우 **임시** 객체가 사용됩니다.

* **논리적 객체(저장소 없음)**
  임시 VIEW는 자신의 `SELECT` 텍스트만 저장합니다(내부적으로 `View` 스토리지를 사용합니다). 데이터를 영구적으로 저장하지 않으며 `INSERT`를 받을 수 없습니다.

* **ENGINE 절**
  `ENGINE`을 명시할 필요가 **없습니다**. `ENGINE = View`로 지정하더라도 무시되며, 동일한 논리적 VIEW로 처리됩니다.

* **보안 / 권한**
  임시 VIEW를 생성하려면 `CREATE TEMPORARY VIEW` 권한이 필요하며, 이 권한은 `CREATE VIEW`에 의해 암묵적으로 부여됩니다.

* **SHOW CREATE**
  임시 VIEW의 DDL을 출력하려면 `SHOW CREATE TEMPORARY VIEW view_name;`을 사용합니다.

### 구문 \{#temporary-views-syntax\}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

임시 뷰에서는 임시 테이블과 마찬가지로 `OR REPLACE`가 **지원되지 않습니다**. 임시 뷰를 교체해야 하는 경우 해당 뷰를 삭제한 후 다시 생성하십시오.


### 예시 \{#temporary-views-examples\}

임시 원본 테이블과 그 위에 임시 VIEW를 생성합니다:

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

해당 DDL을 확인하십시오:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

삭제:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```


### 허용되지 않음 / 제한 사항 \{#temporary-views-limitations\}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **허용되지 않습니다** (`DROP` + `CREATE`를 사용하십시오).
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **허용되지 않습니다**.
* `CREATE TEMPORARY VIEW db.view AS ...` → **허용되지 않습니다** (데이터베이스 한정자를 사용할 수 없습니다).
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **허용되지 않습니다** (임시 객체는 세션에만 국한됩니다).
* `POPULATE`, `REFRESH`, `TO [db.table]`, 내부 엔진, 그리고 모든 MV 전용 절 → 임시 VIEW에는 **적용되지 않습니다**.

### 분산 쿼리에 대한 참고 사항 \{#temporary-views-distributed-notes\}

임시 **뷰(view)**는 정의만 존재하며, 전달해야 할 데이터는 없습니다. 임시 뷰가 임시 **테이블**(예: `Memory`)을 참조하는 경우, 분산 쿼리를 실행하는 동안 임시 테이블이 동작하는 방식과 동일하게 해당 데이터가 원격 서버로 전송될 수 있습니다.

#### 예제 \{#temporary-views-distributed-example\}

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
