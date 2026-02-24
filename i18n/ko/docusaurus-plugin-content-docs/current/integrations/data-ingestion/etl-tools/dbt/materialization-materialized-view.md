---
sidebar_label: 'Materialization: materialized_view'
slug: /integrations/dbt/materialization-materialized-view
sidebar_position: 4
description: 'materialized_view materialization에 대한 상세 문서입니다'
keywords: ['clickhouse', 'dbt', 'materialized view', 'refreshable', 'external target table', 'catchup']
title: 'Materialized Views'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Materialized Views \{#materialized-views\}

<ClickHouseSupportedBadge/>

`materialized_view` materialization은 기존(소스) 테이블에 대한 `SELECT`여야 합니다. PostgreSQL과 달리 ClickHouse의 materialized view는 「정적(static)」이 아니며, 이에 대응하는 REFRESH 작업도 없습니다. 대신 **삽입 트리거(insert trigger)**처럼 동작하여, 소스 테이블에 행이 삽입될 때 정의된 `SELECT` 변환을 적용해 대상 테이블에 새 행을 삽입합니다. ClickHouse에서 materialized view가 어떻게 동작하는지에 대한 자세한 내용은 [ClickHouse materialized view 설명서](/materialized-view)를 참고하십시오.

:::note
일반적인 materialization 개념과 공통 설정(engine, order_by, partition_by 등)에 대해서는 [Materializations](/integrations/dbt/materializations) 페이지를 참고하십시오.
:::

## 대상 테이블 관리 방식 \{#target-table-management\}

`materialized_view` materialization을 사용할 때 dbt-clickhouse는 변환된 행이 삽입되는 **materialized view**와 **대상 테이블**을 모두 생성해야 합니다. 대상 테이블을 관리하는 방법에는 두 가지가 있습니다.

| Approach | Description | Status   |
|----------|-------------|----------|
| **Implicit target** | dbt-clickhouse가 동일한 모델 내에서 대상 테이블을 자동으로 생성하고 관리합니다. 대상 테이블 스키마는 MV의 SQL에서 추론됩니다. | Stable   |
| **Explicit target** | 대상 테이블을 별도의 `table` materialization으로 정의하고, MV 모델에서 `materialization_target_table()` 매크로를 사용하여 이를 참조합니다. MV는 해당 테이블을 가리키는 `TO` 절과 함께 생성됩니다. 이 기능은 **dbt-clickhouse 버전 1.10**부터 사용할 수 있습니다. **주의**: 이 기능은 베타 상태이며, 커뮤니티 피드백에 따라 API가 변경될 수 있습니다. | **Beta** |

어떤 방식을 선택하는지에 따라 스키마 변경 처리, 전체 새로 고침, 복수 MV 구성 방식이 달라집니다. 다음 섹션에서는 각 방식을 자세히 설명합니다.

## 암시적 대상을 사용하는 머티리얼라이제이션 \{#implicit-target\}

기본 동작입니다. `materialized_view` 모델을 정의하면 어댑터는 다음을 수행합니다:

1. 모델 이름과 동일한 이름으로 **대상 테이블**을 생성합니다.
2. `<model_name>_mv`라는 이름으로 ClickHouse **materialized view**를 생성합니다.

대상 테이블 스키마는 MV의 `SELECT` 문에 포함된 컬럼으로부터 유추됩니다. 모든 리소스(대상 테이블 + MV)는 동일한 모델 구성을 공유합니다.

```sql
-- models/events_mv.sql
{{
    config(
        materialized='materialized_view',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```

추가 예제는 [테스트 파일](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)에서 확인하십시오.


### 여러 개의 materialized view \{#multiple-materialized-views\}

ClickHouse는 둘 이상의 materialized view가 동일한 대상 테이블에 레코드를 기록하도록 지원합니다. dbt-clickhouse에서 암시적 대상(implicit target) 방식을 사용할 때 이를 지원하려면, 모델 파일에서 `UNION`을 구성하고 각 materialized view에 대한 SQL을 `--my_mv_name:begin` 및 `--my_mv_name:end` 형식의 주석으로 감싸면 됩니다.

예를 들어, 다음 예시는 두 개의 materialized view를 생성하며, 둘 다 모델의 동일한 대상 테이블에 데이터를 기록합니다. materialized view의 이름은 `<model_name>_mv1` 및 `<model_name>_mv2` 형식이 됩니다:

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 중요!
>
> 여러 개의 materialized view(MV)를 사용하는 모델을 업데이트할 때, 특히 MV 이름 중 하나를 변경하는 경우,
> dbt-clickhouse는 기존 MV를 자동으로 삭제하지 않습니다. 대신
> 다음과 같은 경고 메시지가 표시됩니다:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


### 대상 테이블 스키마 반복 처리 방법 \{#how-to-iterate-the-target-table-schema\}

**dbt-clickhouse 1.9.8 버전**부터는 `dbt run` 실행 시 MV의 SQL에서 컬럼 차이가 발견될 경우 대상 테이블 스키마를 어떻게 반복 처리할지 제어할 수 있습니다.

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    on_schema_change='fail'  # this setting
)}}
```

기본적으로 dbt는 대상 테이블에 어떠한 변경 사항도 적용하지 않으며, 설정 값은 `ignore`입니다. 그러나 이 설정을 변경하여 [증분 모델에서](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change) `on_schema_change` 설정과 동일한 동작을 따르도록 할 수 있습니다.

또한 이 설정을 안전장치로 활용할 수도 있습니다. 값을 `fail`로 설정하면, 구체화된 뷰(Materialized View)의 SQL에 정의된 컬럼이 최초 `dbt run`으로 생성된 대상 테이블의 컬럼과 다를 경우 빌드가 실패합니다.


### 데이터 캐치업 \{#data-catch-up\}

기본적으로(`catchup=True`) materialized view(MV)를 생성하거나 재생성할 때는 MV 자체가 생성되기 전에 먼저 대상 테이블이 과거 데이터로 채워집니다. `catchup` 설정을 `False`로 지정하여 이 동작을 비활성화할 수 있습니다.

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False  # this setting
)}}
```

| Operation                               | `catchup: True` (기본값)              | `catchup: False`                           |
| --------------------------------------- | ---------------------------------- | ------------------------------------------ |
| Initial deployment (`dbt run`)          | 대상 테이블이 과거 데이터로 채워짐                | 대상 테이블이 비어 있는 상태로 생성됨                      |
| Full refresh (`dbt run --full-refresh`) | 대상 테이블이 다시 생성되고 과거 데이터로 채워짐        | 대상 테이블이 비어 있는 상태로 다시 생성되며, **기존 데이터가 손실됨** |
| Normal operation                        | materialized view가 새로운 INSERT를 캡처함 | materialized view가 새로운 INSERT를 캡처함         |

:::warning 전체 새로 고침 시 데이터 손실 위험
`catchup: False`와 `dbt run --full-refresh`를 함께 사용하면 대상 테이블의 **기존 데이터가 모두 삭제**됩니다. 테이블은 비어 있는 상태로 다시 생성되며, 이후부터 들어오는 새로운 데이터만 캡처합니다. 나중에 과거 데이터가 필요할 수 있다면 사전에 백업을 준비하십시오.
:::


## 명시적 대상(explicit target)을 사용한 materialization (베타) \{#explicit-target\}

:::warning Beta
이 기능은 베타 단계이며 **dbt-clickhouse 버전 1.10**부터 사용할 수 있습니다. API는 커뮤니티 피드백에 따라 변경될 수 있습니다.
:::

기본적으로 dbt-clickhouse는 하나의 모델 내에서 대상 테이블과 materialized view(s)를 모두 생성하고 관리합니다(위에서 설명한 [암시적 대상](#implicit-target) 접근 방식). 이 접근 방식에는 다음과 같은 제한 사항이 있습니다.

- 모든 리소스(대상 테이블 + MVs)가 동일한 설정을 공유합니다. 여러 MV가 동일한 대상 테이블을 가리키는 경우, `UNION ALL` 문법을 사용하여 함께 정의해야 합니다.
- 이러한 모든 리소스를 개별적으로 실행(iterate)할 수 없고, 하나의 동일한 모델 파일을 사용하여 관리해야 합니다.
- 각 MV의 이름을 쉽게 제어할 수 없습니다.
- 모든 설정이 대상 테이블과 MVs 사이에서 공유되므로, 각 리소스를 개별적으로 구성하기 어렵고 어떤 설정이 어떤 리소스에 속하는지 구분하기 어렵습니다.

**explicit target** 기능을 사용하면 대상 테이블을 일반 `table` materialization으로 별도로 정의한 다음, materialized view 모델에서 이를 참조할 수 있습니다.

### Benefits \{#explicit-target-benefits\}

- **리소스 완전 분리**: 이제 각 리소스를 개별적으로 정의할 수 있어 가독성이 향상됩니다.
- **dbt와 CH 간 1:1 리소스 매핑**: 이제 dbt 도구를 사용해 리소스를 각각 관리하고 반복(iterate)할 수 있습니다.
- **다양한 구성 사용 가능**: 이제 각 리소스에 서로 다른 구성을 적용할 수 있습니다.
- **네이밍 규칙 유지 불필요**: 이제 모든 리소스는 `_mv`와 같은 MV용 커스텀 이름이 아니라, 사용자가 지정한 이름으로 생성됩니다.

### Limitations \{#explicit-target-limitations\}

- 대상 테이블 정의는 dbt 관점에서 자연스럽지 않습니다. 소스 테이블에서 읽어 오는 SQL이 아니므로 이 부분에서는 dbt의 검증을 사용할 수 없습니다. MV의 SQL은 계속해서 dbt 유틸리티를 사용해 검증되며, 대상 테이블 컬럼과의 호환성은 ClickHouse 수준에서 검증됩니다.
- **`ref()` 함수의 제약과 관련해 몇 가지 문제를 발견했습니다**: 모델 간 참조를 위해 `ref()`를 사용해야 하지만, 상류(upstream) 모델만 참조할 수 있고 하류(downstream) 모델은 참조할 수 없습니다. 이로 인해 이번 구현에서 몇 가지 문제가 발생합니다. dbt-core 리포지토리에 이슈를 생성했으며, 현재 이에 대해 [가능한 해결책을 논의 중입니다 (dbt-labs/dbt-core#12319)](https://github.com/dbt-labs/dbt-core/issues/12319):
  - `ref()`가 config 블록 내부에서 호출되면, 공유된 모델이 아니라 현재 모델을 반환합니다. 이 때문에 config() 섹션에서 이를 정의할 수 없으며, 이 의존성을 추가하기 위해 주석을 사용해야 합니다. dbt 문서에 정의된 [\"--depends_on:\" 접근 방식](https://docs.getdbt.com/reference/dbt-jinja-functions/ref#forcing-dependencies)과 동일한 패턴을 따르고 있습니다.
  - `ref()`는 대상 테이블이 먼저 생성되도록 강제해 준다는 점에서는 원하는 대로 동작하지만, 생성된 문서의 의존성 차트에서는 대상 테이블이 하류가 아닌 또 다른 상류 의존성으로 표시되어, 이해하기가 다소 어렵습니다.
  - `unit-test`는 대상 테이블에서 데이터를 읽지 않는 것이 목표일 때에도 대상 테이블에 대해 일부 데이터를 정의하도록 강제합니다. 해결 방법은 이 테이블에 대한 데이터를 비워 두는 것입니다.

### 사용 방법 \{#explicit-target-usage\}

**1단계: 대상 테이블을 일반 테이블 모델로 정의합니다**

모델 `events_daily.sql`:

```sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        partition_by='toYYYYMM(event_date)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0  -- Creates empty table with correct schema
```

제한 사항 섹션에서 언급한 우회 방법입니다. 여기서는 일부 dbt 검증 기능이 동작하지 않을 수 있지만, 스키마는 여전히 ClickHouse에서 검증됩니다.

**2단계: 대상 테이블을 가리키는 materialized view 정의**

예를 들어, 서로 다른 모델에서 아래와 같이 서로 다른 MV(materialized view)를 정의하되, 동일한 대상 테이블을 가리키도록 할 수도 있습니다. MV의 대상 테이블을 구성하는 새로운 `{{ materialization_target_table(ref('events_daily')) }}` 매크로 호출에 유의하십시오.

모델 `page_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'page_events') }}
GROUP BY event_date, event_type
```

모델 파일 `mobile_events_aggregator.sql`:

```sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'mobile_events') }}
GROUP BY event_date, event_type
```


### 구성 옵션 \{#explicit-target-configuration\}

명시적 대상 테이블을 사용하는 경우, 다음과 같은 구성을 적용할 수 있습니다:

**대상 테이블에서 (`materialized='table'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `mv_on_schema_change` | 테이블이 dbt에서 관리하는 MV에서 사용될 때 스키마 변경을 어떻게 처리할지 설정합니다. [증분 모델(incremental models)](https://docs.getdbt.com/docs/build/incremental-models#what-if-the-columns-of-my-incremental-model-change)의 `on_schema_change` 설정과 동일한 동작을 따릅니다.| **주의**: 어떤 MV도 이 테이블을 가리키지 않는 경우, `materialized='table'` 모델은 평소처럼 동작하므로 이 설정이 정의되어 있더라도 무시됩니다. 테이블이 MV의 대상인 경우, 이 테이블 내부의 데이터를 보호하기 위해 이 설정의 기본값은 `mv_on_schema_change='fail'`입니다. |
| `repopulate_from_mvs_on_full_refresh` | `--full-refresh` 시, 테이블의 SQL을 실행하는 대신, 이를 가리키는 모든 MV의 SQL을 사용해 INSERT-SELECT를 실행하여 테이블을 재구축합니다. | `False` |

**materialized view에서 (`materialized='materialized_view'`):**

| Option | Description | Default |
|--------|-------------|---------|
| `catchup` | MV가 생성될 때 과거 데이터를 백필(backfill)할지 여부입니다. | `True` |

:::note
일반적으로 MV에서만 `catchup`을 `True`로 설정하거나, 해당 MV의 대상 테이블에서만 `repopulate_from_mvs_on_full_refresh`를 `True`로 설정하는 편이 좋습니다. 둘 다 `True`로 설정하면 데이터가 중복될 수 있습니다.
:::

### 일반적인 작업 \{#explicit-target-common-operations\}

#### 명시적 타겟을 사용하는 전체 새로 고침 \{#explicit-target-full-refresh\}

`--full-refresh`를 사용할 때 명시적 타겟 테이블은 다시 생성됩니다(이 과정에서 수집이 진행 중이면 데이터가 손실될 수 있습니다). 이는 설정에 따라 서로 다르게 동작합니다:

**옵션 1: 기본 `--full-refresh` 동작. 모든 것이 다시 생성되지만, MV를 재생성하는 동안에는 타겟 테이블이 비어 있거나 일부만 로드된 상태가 됩니다.**

모든 것이 DROP된 후 다시 생성됩니다. MV의 SQL을 사용하여 데이터를 다시 삽입하려면 `catchup=True` 설정을 유지하십시오:

```sql
-- models/page_events_aggregator.sql
{{ config(
    materialized='materialized_view',
    catchup=True  -- this is the default value so you don't need to actully set it.
) }}
{{ materialization_target_table(ref('events_daily')) }}
...
```

**옵션 2: 타깃 테이블을 다시 생성하되, MV가 재생성되는 동안 빈 데이터가 조회되지 않도록 합니다.**

먼저 MV의 SQL을 수정해야 하는 경우, 해당 MV들에 `catchup=False`를 설정한 다음 MV들에 대해 `dbt run` 또는 `dbt run --full-refresh`를 실행합니다. 타깃 테이블에서 `--full-refresh`를 실행하기 전에 MV가 생성되어 있어야 합니다. 타깃 테이블은 ClickHouse에 있는 MV 정의를 사용하기 때문입니다.

타깃 테이블 모델에 `repopulate_from_mvs_on_full_refresh=True`를 설정합니다. `dbt run --full-refresh` 실행 시, 다음 작업이 수행됩니다:

1. 새로운 임시 테이블을 생성합니다.
2. 각 MV의 SQL을 사용하여 INSERT-SELECT를 실행합니다.
3. 테이블을 원자적으로 교체합니다.

이렇게 하면 MV가 재생성되는 동안에도 테이블을 조회하는 사용자는 빈 데이터를 보지 않게 됩니다.

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='SummingMergeTree()',
        order_by='(event_date, event_type)',
        repopulate_from_mvs_on_full_refresh=True
    )
}}
...
```


#### 대상 테이블 변경하기 \{#explicit-target-changing\}

`--full-refresh` 없이 구체화된 뷰(Materialized View)의 대상 테이블을 변경할 수 없습니다. `materialization_target_table()` 참조를 변경한 후 일반 `dbt run`을 실행하면, 대상이 변경되었다는 오류 메시지와 함께 빌드가 실패합니다.

대상을 변경하려면:

1. `materialization_target_table()` 호출을 수정합니다.
2. `dbt run --full-refresh -s your_mv_model`을 실행합니다.

### 암시적 대상 방식과 명시적 대상 방식의 동작 비교\{#explicit-target-behavior\}

| Operation | Implicit target | Explicit target |
| --- | --- | --- |
| First dbt run | 모든 리소스가 생성됨 | 모든 리소스가 생성됨 |
| Next dbt run |  **개별 리소스를 따로 관리할 수 없으며, 모든 작업이 동시에 수행됩니다:**<br /><br />**target table**: <br /> 변경 사항은 `on_schema_change` 설정으로 관리됩니다. 기본적으로 `ignore`로 설정되어 있어 새 컬럼은 처리되지 않습니다.<br /><br />**MVs**: `alter table modify query` 작업으로 모두 업데이트됩니다 | **변경 사항을 개별적으로 적용할 수 있습니다:<br /><br />target table**: <br />dbt에서 정의한 MVs의 target table인지 자동으로 감지합니다. 해당하는 경우 컬럼 변경은 기본적으로 `mv_on_schema_change` 설정의 `fail` 값으로 관리되어, 컬럼이 변경되면 실패합니다. 이 기본값은 보호 장치로 추가되었습니다<br /><br />**MVs**: SQL이 `alter table modify query` 작업으로 업데이트됩니다. |
| dbt run --full-refresh | **개별 리소스를 따로 관리할 수 없으며, 모든 작업이 동시에 수행됩니다:<br /><br />target table**: <br />target table이 비어 있는 상태로 다시 생성됩니다. 모든 MVs의 SQL을 함께 사용하여 백필(backfill)을 구성하기 위한 `catchup`을 사용할 수 있습니다. `catchup`은 기본적으로 `True`입니다<br /><br />**MVs**: 모두 다시 생성됩니다. | **변경 사항이 개별적으로 적용됩니다:<br /><br />target table:** 기존과 동일한 방식으로 다시 생성됩니다.<br /><br />**MVs**: drop 후 다시 생성됩니다. 초기 백필(backfill)을 위해 `catchup`을 사용할 수 있습니다. `catchup`은 기본적으로 `True`입니다. <br /><br />**참고: 이 과정 동안 target table은 MVs가 다시 생성될 때까지 비어 있거나 일부만 적재된 상태가 됩니다. 이를 방지하려면, 다음 섹션에서 target table을 점진적으로 갱신(iterate)하는 방법을 확인하십시오.**|

### 암시적 대상에서 명시적 대상으로 마이그레이션 \{#migration-implicit-to-explicit\}

암시적 대상 방식을 사용하는 기존 materialized view 모델이 있고 이를 명시적 대상 방식으로 마이그레이션하려면 다음 단계를 따르십시오:

**1. 대상 테이블 모델 생성**

현재 MV 대상 테이블과 동일한 스키마를 정의하는 `materialized='table'` 설정을 사용하는 새 모델 파일을 만듭니다. 빈 테이블을 생성하기 위해 `WHERE 0` 절을 사용합니다. 현재 암시적 materialized view 모델과 동일한 이름을 사용하십시오. 이제 이 모델을 사용하여 대상 테이블을 반복적으로 변경하며 발전시킬 수 있습니다.

```sql
-- models/events_daily.sql
{{
    config(
        materialized='table',
        engine='MergeTree()',
        order_by='(event_date, event_type)'
    )
}}

SELECT
    toDate(now()) AS event_date,
    '' AS event_type,
    toUInt64(0) AS total
WHERE 0
```

**2. MV 모델을 업데이트합니다**

MV SQL과 새 대상 테이블을 가리키는 `materialization_target_table()` 매크로 호출을 각각 포함하는 새 모델을 생성합니다. 이전에 `UNION ALL`을 사용하고 있었다면 해당 부분과 주석을 제거합니다.

모델 이름은 다음 명명 규칙을 따라야 합니다:

* MV가 하나만 정의된 경우 이름은 `<old_model_name>_mv`가 됩니다.
* 여러 개의 MV가 정의된 경우 각각의 이름은 `<old_model_name>_mv_<name_in_comments>`가 됩니다.

`my_model.sql`에서 (암시적 대상, UNION ALL을 사용하는 단일 모델) 변경 전:

```sql
--mv1:begin
select a, b, c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a, b, c from {{ source('raw', 'table_2') }}
--mv2:end
```

이후 (명시적 대상, 개별 모델 파일):

```sql
-- models/my_model_mv_mv1.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_1') }}
```

```sql
-- models/my_model_mv_mv2.sql
{{ config(materialized='materialized_view') }}
{{ materialization_target_table(ref('events_daily')) }}

select a, b, c from {{ source('raw', 'table_2') }}
```

**3. 필요에 따라 [명시적 대상](#explicit-target) 섹션의 지침을 따라 반복적으로 수정합니다.**


## 활성 수집 중 동작 \{#behavior-during-active-ingestion\}

ClickHouse의 구체화된 뷰(Materialized View)는 **insert 트리거**처럼 동작하므로, 해당 뷰가 존재하는 동안에만 데이터를 캡처합니다. materialized view가 삭제되었다가 다시 생성되는 경우(예: `--full-refresh` 중), 그 시간 창 동안 소스 테이블에 삽입된 행은 MV에서 처리되지 **않습니다**. 이를 MV가 「blind」 상태라고 합니다.

추가로, **catch-up** 과정(MV의 `catchup` 또는 대상 테이블의 `repopulate_from_mvs_on_full_refresh` 모두)은 MV의 SQL을 사용하여 `INSERT INTO ... SELECT`를 실행합니다. 이와 동시에 소스 테이블에 대한 insert가 발생하고 있다면, catch-up 쿼리에 MV가 이미 처리한(또는 생성 직후 처리하게 될) 행이 포함될 수 있으며, 이로 인해 대상 테이블에 **중복 데이터**가 생길 수 있습니다. 대상 테이블에 `ReplacingMergeTree`와 같은 중복 제거 엔진을 사용하면 이러한 위험을 완화할 수 있습니다.

다음 표는 소스 테이블에 insert가 활발히 발생하고 있을 때 각 작업의 안전성을 요약한 것입니다.

### 암시적 대상 작업 \{#ingestion-implicit-target\}

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. 대상 테이블 생성<br/>2. 데이터 삽입 (`catchup=True`인 경우)<br/>3. MV 생성 | ⚠️ **1단계와 3단계 사이에는 MV가 소스 변경을 감지하지 못합니다.** 이 구간 동안 소스에 삽입되는 행은 캡처되지 않습니다. |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 안전합니다. MV는 원자적으로 업데이트됩니다. |
| `dbt run --full-refresh` | 1. 백업 테이블 생성<br/>2. 데이터 삽입 (`catchup=True`인 경우)<br/>3. MV 삭제<br/>4. 테이블 교환<br/>5. MV 재생성 | ⚠️ **재생성 중에는 MV가 소스 변경을 감지하지 못합니다.** 3단계와 5단계 사이에 소스에 삽입된 데이터는 새 대상 테이블에 나타나지 않습니다. |

### 명시적 대상 작업 \{#ingestion-explicit-target\}

**materialized view 모델:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| First `dbt run` | 1. MV 생성 (`TO` 절 사용)<br/>2. catch-up 실행 (`catchup=True`인 경우) | ✅ MV가 먼저 생성되므로, 새로운 삽입이 즉시 캡처됩니다.<br/>⚠️ **catch-up 과정에서 데이터가 중복될 수 있습니다** — 백필 쿼리가 이미 MV에서 처리 중인 행과 겹칠 수 있습니다. 중복 제거 엔진(예: `ReplacingMergeTree`)을 사용하는 경우에는 안전합니다. |
| Subsequent `dbt run` | `ALTER TABLE ... MODIFY QUERY` | ✅ 안전합니다. MV는 원자적으로 업데이트됩니다. |
| `dbt run --full-refresh` on MVs | 1. MV 드롭 후 재생성<br/>2. catch-up 실행 (`catchup=True`인 경우) | ⚠️ **재생성 중에는 MV가 삽입을 인지하지 못합니다** (drop과 create 사이 구간).<br/>⚠️ 삽입이 동시에 일어나는 경우 **catch-up 과정에서 데이터가 중복될 수 있습니다**. |

**대상 테이블 모델:**

| Operation | Internal process | Safety while inserts are happening |
|-----------|------------------|------------------------------------|
| `dbt run` | `mv_on_schema_change` 설정에 따라 스키마 변경 적용 | ✅ 안전합니다. 데이터 이동이 없습니다. |
| `dbt run --full-refresh` (default) | 테이블을 재생성함 (비워 둠) | ⚠️ **대상 테이블은 MV가 백필을 완료할 때까지 비어 있습니다.** 새 테이블이 생성된 후에는 MV가 계속 해당 테이블에 삽입합니다. |
| `dbt run --full-refresh` with `repopulate_from_mvs_on_full_refresh=True` | 1. 백업 테이블 생성<br/>2. 각 MV의 SQL을 사용하여 데이터 삽입<br/>3. 테이블을 원자적으로 교환 | ⚠️ **재생성 중에는 MV가 삽입을 인지하지 못합니다.** 1단계와 3단계 사이에 삽입된 데이터는 새 테이블에 나타나지 않습니다. **이는 다음 버전에서 변경될 수 있습니다**|

:::tip 수집이 활성화된 프로덕션 환경에서의 권장 사항

- **가능하다면 dbt 작업 중에 수집을 중단하십시오**: 이렇게 하면 모든 작업이 안전해지고 데이터가 손실되지 않습니다.
- **가능하다면 중복 제거 엔진을 사용하십시오** (예: 대상 테이블에 `ReplacingMergeTree` 사용)하여 catch-up 겹침으로 인한 잠재적 중복을 처리합니다.
- **가능하다면 `ALTER TABLE ... MODIFY QUERY`를 선호하십시오** (`--full-refresh` 없이 일반 `dbt run`): 이 방법은 항상 안전합니다.
- dbt 작업 중 발생할 수 있는 **문제 구간을 인지**하십시오.
:::

## Refreshable Materialized Views \{#refreshable-materialized-views\}

[Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)는 ClickHouse에서 주기적으로 쿼리를 다시 실행하여 결과를 저장하는 특수한 유형의 materialized view(구체화 뷰)로, 다른 데이터베이스에서 materialized view가 동작하는 방식과 유사합니다. 이는 실시간 insert 트리거 대신 주기적인 스냅샷이나 집계를 원하는 시나리오에 유용합니다.

:::tip
Refreshable materialized views는 [암시적 대상](#implicit-target)과 [명시적 대상](#explicit-target) 방식 **모두**에 사용할 수 있습니다. `refreshable` 설정은 대상 테이블이 어떻게 관리되는지와는 독립적입니다.
:::

Refreshable materialized view를 사용하려면 MV 모델에 다음 옵션을 포함하는 `refreshable` 설정 객체를 추가합니다:

| Option                | Description                                                                                                                                                              | Required | Default Value |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------|
| refresh_interval      | 필수 interval 절입니다.                                                                                                                                                    | Yes      |               |
| randomize             | `RANDOMIZE FOR` 뒤에 위치하는 무작위화 절입니다.                                                                                                                           |          |               |
| append                | `True`로 설정하면 각 refresh 시 기존 행을 삭제하지 않고 테이블에 행을 삽입합니다. 이 INSERT는 일반적인 INSERT SELECT와 마찬가지로 원자적이지 않습니다.                             |          | False         |
| depends_on            | refreshable materialized view에 대한 종속성 목록입니다. 종속성은 `{schema}.{view_name}` 형식으로 제공해야 합니다.                                                           |          |               |
| depends_on_validation | `depends_on`에 제공된 종속성의 존재 여부를 검증할지 여부입니다. 어떤 종속성에 schema가 포함되어 있지 않으면 `default` schema를 기준으로 검증이 수행됩니다.                            |          | False         |

### 암시적 대상을 사용하는 예제 \{#refreshable-implicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        engine='MergeTree()',
        order_by='(event_date)',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}

SELECT
    toStartOfDay(event_time) AS event_date,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date
```


### 대상을 명시적으로 지정한 예시 \{#refreshable-explicit-example\}

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 1 HOUR",
            "append": False
        }
    )
}}
{{ materialization_target_table(ref('events_daily')) }}

SELECT
    toStartOfDay(event_time) AS event_date,
    event_type,
    count() AS total
FROM {{ source('raw', 'events') }}
GROUP BY event_date, event_type
```


### Limitations \{#refreshable-limitations\}

* 종속성이 있는 refreshable materialized view(MV)를 ClickHouse에서 생성할 때, 지정한 종속성이 생성 시점에 존재하지 않더라도 ClickHouse는
  오류를 발생시키지 않습니다. 대신 refreshable MV는 비활성 상태로 남아 있으며, 종속성이 충족될 때까지 업데이트 처리나 리프레시를 시작하지 않습니다.
  이는 설계된 동작이지만, 필요한 종속성이 제때 준비되지 않으면 데이터 사용 가능 시점이 지연될 수 있습니다.
  따라서 refreshable materialized view를 생성하기 전에 모든 종속성이 올바르게 정의되어 있고 실제로 존재하는지 반드시 확인해야 합니다.
* 현재로서는 MV와 그 종속성 간에 실제 「dbt linkage」가 없으므로, 생성 순서는 보장되지 않습니다.
* refreshable 기능은 동일한 target model을 가리키는 여러 MV가 있는 경우에는 테스트되지 않았습니다.