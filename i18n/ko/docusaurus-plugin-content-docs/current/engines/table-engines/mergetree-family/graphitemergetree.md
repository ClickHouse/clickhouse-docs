---
description: 'Graphite 데이터를 간소화하고 집계/평균(롤업)하기 위해 설계된 엔진입니다.'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree 테이블 엔진'
doc_type: 'guide'
---

# GraphiteMergeTree 테이블 엔진 \{#graphitemergetree-table-engine\}

이 엔진은 [Graphite](http://graphite.readthedocs.io/en/latest/index.html) 데이터의 희소화(thinning)와 집계/평균화(rollup)를 위해 설계되었습니다. Graphite의 데이터 저장소로 ClickHouse를 사용하려는 개발자에게 유용할 수 있습니다.

rollup이 필요하지 않다면 Graphite 데이터를 저장하기 위해 어떤 ClickHouse 테이블 엔진이든 사용할 수 있지만, rollup이 필요하다면 `GraphiteMergeTree`를 사용하십시오. 이 엔진은 저장 공간 사용량을 줄이고 Graphite에서 실행되는 쿼리의 효율을 높입니다.

이 엔진은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)의 특성을 상속합니다.

## 테이블 생성 \{#creating-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    Path String,
    Time DateTime,
    Value Float64,
    Version <Numeric_type>
    ...
) ENGINE = GraphiteMergeTree(config_section)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명은 해당 문서를 참조하십시오.

Graphite 데이터용 테이블에는 다음 데이터에 대해 아래와 같은 컬럼이 있어야 합니다:

* 메트릭 이름(Graphite 센서). 데이터 타입: `String`.

* 메트릭을 측정한 시간. 데이터 타입: `DateTime`.

* 메트릭 값. 데이터 타입: `Float64`.

* 메트릭 버전. 데이터 타입: 임의의 숫자형(ClickHouse는 버전이 가장 높거나, 버전이 동일한 경우 가장 마지막에 기록된 행을 저장합니다. 다른 행은 데이터 파트 병합 중에 삭제됩니다).

이러한 컬럼의 이름은 롤업(rollup) 설정에서 지정해야 합니다.

**GraphiteMergeTree 파라미터**

* `config_section` — 롤업 규칙이 정의된 설정 파일의 섹션 이름입니다.

**쿼리 절**

`GraphiteMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절(clauses)](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)이 필요합니다.

<details markdown="1">
  <summary>더 이상 사용되지 않는 테이블 생성 방법</summary>

  :::note
  새로운 프로젝트에서는 이 방식을 사용하지 말고, 가능하다면 기존 프로젝트도 위에서 설명한 방식으로 전환하십시오.
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      EventDate Date,
      Path String,
      Time DateTime,
      Value Float64,
      Version <Numeric_type>
      ...
  ) ENGINE [=] GraphiteMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, config_section)
  ```

  `config_section`을 제외한 모든 파라미터는 `MergeTree`에서와 동일한 의미를 가집니다.

  * `config_section` — 롤업 규칙이 정의된 설정 파일의 섹션 이름입니다.
</details>

## 롤업 구성 \{#rollup-configuration\}

롤업에 대한 설정은 서버 구성의 [graphite&#95;rollup](../../../operations/server-configuration-parameters/settings.md#graphite) 파라미터로 정의합니다. 파라미터 이름은 임의로 지정할 수 있습니다. 여러 개의 구성을 만들어 서로 다른 테이블에 사용할 수 있습니다.

롤업 구성 구조:

required-columns
patterns

### 필수 컬럼 \{#required-columns\}

#### `path_column_name` \{#path_column_name\}

`path_column_name` — 메트릭 이름(Graphite 센서)을 저장하는 컬럼 이름입니다. 기본값: `Path`.

#### `time_column_name` \{#time_column_name\}

`time_column_name` — 메트릭이 측정된 시간을 저장하는 컬럼 이름입니다. 기본값: `Time`.

#### `value_column_name` \{#value_column_name\}

`value_column_name` — `time_column_name`에 설정된 시점의 메트릭 값을 저장하는 컬럼 이름입니다. 기본값: `Value`.

#### `version_column_name` \{#version_column_name\}

`version_column_name` — 메트릭 버전을 저장하는 컬럼 이름입니다. 기본값: `Timestamp`.

### Patterns \{#patterns\}

`patterns` 섹션의 구조:

```text
pattern
    rule_type
    regexp
    function
pattern
    rule_type
    regexp
    age + precision
    ...
pattern
    rule_type
    regexp
    function
    age + precision
    ...
pattern
    ...
default
    function
    age + precision
    ...
```

:::important
패턴은 다음 순서를 엄격하게 지켜야 합니다:

1. `function` 또는 `retention`이 없는 패턴.
2. `function`과 `retention`이 모두 있는 패턴.
3. `default` 패턴.
   :::

행을 처리할 때 ClickHouse는 `pattern` 섹션의 규칙을 확인합니다. 각 `pattern` 섹션(`default` 포함)에는 집계를 위한 `function` 매개변수, `retention` 매개변수 또는 둘 다를 포함할 수 있습니다. 메트릭 이름이 `regexp`와 일치하면 해당 `pattern` 섹션(또는 여러 섹션)의 규칙이 적용되고, 그렇지 않으면 `default` 섹션의 규칙이 사용됩니다.

`pattern` 및 `default` 섹션의 필드:

* `rule_type` - 규칙의 유형입니다. 특정 메트릭에만 적용됩니다. 엔진은 이를 사용하여 일반 메트릭과 태그된 메트릭을 구분합니다. 선택적 매개변수입니다. 기본값: `all`.
  성능이 중요하지 않거나, 예를 들어 일반 메트릭처럼 단일 메트릭 유형만 사용하는 경우에는 설정하지 않아도 됩니다. 기본적으로 하나의 규칙 집합만 생성됩니다. 반면 특수 유형이 하나라도 정의되면 두 개의 서로 다른 집합이 생성됩니다. 하나는 일반 메트릭(root.branch.leaf)용이고, 다른 하나는 태그된 메트릭(root.branch.leaf;tag1=value1)용입니다.
  기본 규칙은 두 집합 모두에 포함됩니다.
  유효한 값:
  * `all` (기본값) - `rule_type`이 생략되었을 때 사용되는 범용 규칙입니다.
  * `plain` - 일반 메트릭용 규칙입니다. `regexp` 필드는 정규 표현식으로 처리됩니다.
  * `tagged` - 태그된 메트릭용 규칙입니다(메트릭은 DB에 `someName?tag1=value1&tag2=value2&tag3=value3` 형식으로 저장됨). 정규 표현식은 태그 이름순으로 정렬되어 있어야 하며, 존재하는 경우 첫 번째 태그는 `__name__`이어야 합니다. `regexp` 필드는 정규 표현식으로 처리됩니다.
  * `tag_list` - 태그된 메트릭용 규칙으로, graphite 형식 `someName;tag1=value1;tag2=value2`, `someName`, 또는 `tag1=value1;tag2=value2`에서 메트릭을 더 쉽게 기술하기 위한 단순 DSL입니다. `regexp` 필드는 `tagged` 규칙으로 변환됩니다. 태그 이름순 정렬은 필요 없으며 자동으로 수행됩니다. 태그의 이름이 아니라 값은 정규 표현식으로 설정할 수 있습니다(예: `env=(dev|staging)`).
* `regexp` – 메트릭 이름에 대한 패턴(정규 표현식 또는 DSL)입니다.
* `age` – 데이터의 최소 보관 기간(초 단위)입니다.
* `precision`– 데이터의 나이를 초 단위로 얼마나 세밀하게 구분할지 나타냅니다. 86400(하루의 초 수)의 약수여야 합니다.
* `function` – 나이가 `[age, age + precision]` 범위에 속하는 데이터에 적용할 집계 함수의 이름입니다. 사용 가능한 함수: min / max / any / avg. 평균(avg)은 평균들의 평균처럼, 다소 부정확하게 계산됩니다.

### 규칙 유형이 없는 구성 예시 \{#configuration-example\}

```xml
<graphite_rollup>
    <version_column_name>Version</version_column_name>
    <pattern>
        <regexp>click_cost</regexp>
        <function>any</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup>
```

### 규칙 유형별 구성 예시 \{#configuration-typed-example\}

```xml
<graphite_rollup>
    <version_column_name>Version</version_column_name>
    <pattern>
        <rule_type>plain</rule_type>
        <regexp>click_cost</regexp>
        <function>any</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tagged</rule_type>
        <regexp>^((.*)|.)min\?</regexp>
        <function>min</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tagged</rule_type>
        <regexp><![CDATA[^someName\?(.*&)*tag1=value1(&|$)]]></regexp>
        <function>min</function>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <pattern>
        <rule_type>tag_list</rule_type>
        <regexp>someName;tag2=value2</regexp>
        <retention>
            <age>0</age>
            <precision>5</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>60</precision>
        </retention>
    </pattern>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup>
```

:::note
데이터 롤업은 머지 작업 중에 수행됩니다. 일반적으로 오래된 파티션에 대해서는 머지가 수행되지 않으므로, 롤업을 위해서는 [optimize](../../../sql-reference/statements/optimize.md)를 사용하여 비정기 머지 작업을 수동으로 트리거해야 합니다. 또는 [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)와 같은 별도의 도구를 사용할 수도 있습니다.
:::
