---
'description': 'Graphite 데이터를 축소하고 집계/평균화(롤업)하기 위해 설계되었습니다.'
'sidebar_label': 'GraphiteMergeTree'
'sidebar_position': 90
'slug': '/engines/table-engines/mergetree-family/graphitemergetree'
'title': 'GraphiteMergeTree 테이블 엔진'
'doc_type': 'guide'
---


# GraphiteMergeTree 테이블 엔진

이 엔진은 [Graphite](http://graphite.readthedocs.io/en/latest/index.html) 데이터를 축소 및 집계/평균(롤업)하기 위해 설계되었습니다. ClickHouse를 Graphite의 데이터 저장소로 사용하려는 개발자에게 유용할 수 있습니다.

롤업이 필요하지 않다면 Graphite 데이터를 저장하기 위해 ClickHouse의 어떤 테이블 엔진을 사용할 수 있지만, 롤업이 필요하다면 `GraphiteMergeTree`를 사용해야 합니다. 이 엔진은 저장 용량을 줄이고 Graphite에서의 쿼리 효율성을 높입니다.

이 엔진은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)로부터 속성을 상속받습니다.

## 테이블 생성 {#creating-table}

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

[CREATE TABLE](/sql-reference/statements/create/table) 쿼리에 대한 자세한 설명을 참조하십시오.

Graphite 데이터의 테이블은 다음과 같은 데이터에 대해 다음과 같은 컬럼을 가져야 합니다:

- 메트릭 이름 (Graphite 센서). 데이터 유형: `String`.

- 메트릭 측정 시간. 데이터 유형: `DateTime`.

- 메트릭 값. 데이터 유형: `Float64`.

- 메트릭 버전. 데이터 유형: 숫자(ClickHouse는 버전이 동일할 경우 가장 높은 버전 또는 마지막으로 기록된 행을 저장하며, 다른 행은 데이터 파트의 병합 중 삭제됩니다).

이 컬럼의 이름은 롤업 구성에서 설정되어야 합니다.

**GraphiteMergeTree 매개변수**

- `config_section` — 롤업 규칙이 설정된 구성 파일의 섹션 이름.

**쿼리 절**

`GraphiteMergeTree` 테이블을 생성할 때는 `MergeTree` 테이블을 생성할 때와 동일한 [절](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)이 필요합니다.

<details markdown="1">

<summary>테이블 생성에 대한 더 이상 사용되지 않는 방법</summary>

:::note
이 방법은 새로운 프로젝트에서 사용하지 마시고, 가능하다면 이전 프로젝트를 위에 설명된 방법으로 전환하십시오.
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

`config_section`을 제외한 모든 매개변수는 `MergeTree`에서와 동일한 의미를 가집니다.

- `config_section` — 롤업 규칙이 설정된 구성 파일의 섹션 이름.

</details>

## 롤업 구성 {#rollup-configuration}

롤업에 대한 설정은 서버 구성에서 [graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite) 매개변수에 의해 정의됩니다. 매개변수의 이름은 임의로 설정할 수 있습니다. 여러 가지 구성을 생성하고 이를 서로 다른 테이블에 사용할 수 있습니다.

롤업 구성 구조:

      required-columns
      patterns

### 필수 컬럼 {#required-columns}

#### `path_column_name` {#path_column_name}

`path_column_name` — 메트릭 이름 (Graphite 센서)을 저장하는 컬럼의 이름. 기본값: `Path`.

#### `time_column_name` {#time_column_name}

`time_column_name` — 메트릭 측정 시간을 저장하는 컬럼의 이름. 기본값: `Time`.

#### `value_column_name` {#value_column_name}

`value_column_name` — `time_column_name`에 설정된 시간에 메트릭 값을 저장하는 컬럼의 이름. 기본값: `Value`.

#### `version_column_name` {#version_column_name}

`version_column_name` — 메트릭 버전을 저장하는 컬럼의 이름. 기본값: `Timestamp`.

### 패턴 {#patterns}

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
패턴은 엄격히 정렬되어야 합니다:

1. `function` 또는 `retention` 없이 패턴.
1. `function`와 `retention` 모두 있는 패턴.
1. 패턴 `default`.
:::

행을 처리할 때, ClickHouse는 `pattern` 섹션의 규칙을 검사합니다. 각 `pattern`(및 `default`) 섹션은 집계를 위한 `function` 매개변수, `retention` 매개변수 또는 둘 다를 포함할 수 있습니다. 메트릭 이름이 `regexp`와 일치하면 `pattern` 섹션(또는 섹션)에서 규칙이 적용되며, 그렇지 않으면 `default` 섹션의 규칙이 사용됩니다.

`pattern` 및 `default` 섹션의 필드:

- `rule_type` - 규칙의 유형. 특정 메트릭에만 적용됩니다. 엔진은 이를 사용하여 일반 메트릭과 태그가 있는 메트릭을 구분합니다. 선택적 매개변수. 기본값: `all`. 성능이 중요하지 않거나 단일 메트릭 유형만 사용될 경우 불필요합니다. 기본적으로 하나의 규칙 집합만 생성됩니다. 그렇지 않고 특별한 유형이 정의된 경우, 두 개의 서로 다른 집합이 생성됩니다. 하나는 일반 메트릭(루트.브랜치.잎)이고, 다른 하나는 태그가 있는 메트릭(루트.브랜치.잎;tag1=value1)입니다. 기본 규칙은 두 집합 모두에서 끝납니다.
유효한 값:
  - `all` (기본값) - `rule_type`이 생략된 경우 사용되는 범용 규칙.
  - `plain` - 일반 메트릭에 대한 규칙. 필드 `regexp`은 정규 표현식으로 처리됩니다.
  - `tagged` - 태그가 있는 메트릭에 대한 규칙(메트릭은 `someName?tag1=value1&tag2=value2&tag3=value3` 형식으로 DB에 저장됨). 정규 표현식은 태그 이름으로 정렬되어야 하며, 첫 번째 태그는 존재하는 경우 `__name__`여야 합니다. 필드 `regexp`은 정규 표현식으로 처리됩니다.
  - `tag_list` - 태그가 있는 메트릭에 대한 규칙, Graphite 형식의 메트릭 설명을 쉽게 하기 위한 간단한 DSL로 `someName;tag1=value1;tag2=value2`, `someName`, 또는 `tag1=value1;tag2=value2` 형식으로 사용할 수 있습니다. 필드 `regexp`은 `tagged` 규칙으로 변환됩니다. 태그 이름별로 정렬할 필요는 없으며, 자동으로 수행됩니다. 태그의 값(이름이 아닌)은 정규 표현식으로 설정할 수 있습니다. 예: `env=(dev|staging)`.
- `regexp` – 메트릭 이름에 대한 패턴(정규식 또는 DSL).
- `age` – 데이터의 최소 연령(초 단위).
- `precision`– 데이터의 연령을 몇 초 단위로 정밀하게 정의할지를 결정합니다. 86400(하루의 초)로 나누어 떨어져야 합니다.
- `function` – `[age, age + precision]` 범위에 포함된 데이터에 적용할 집계 함수의 이름. 허용되는 함수: min / max / any / avg. 평균은 부정확하게 계산되며, 평균의 평균과 같이 측정됩니다.

### 규칙 유형이 없는 구성 예제 {#configuration-example}

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

### 규칙 유형이 있는 구성 예제 {#configuration-typed-example}

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
데이터 롤업은 병합 중에 수행됩니다. 일반적으로 오래된 파티션에 대해서는 병합이 시작되지 않으므로, 롤업을 위해 [optimize](../../../sql-reference/statements/optimize.md)를 사용하여 예정에 없는 병합을 트리거해야 합니다. 또는 [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)와 같은 추가 도구를 사용할 수 있습니다.
:::
