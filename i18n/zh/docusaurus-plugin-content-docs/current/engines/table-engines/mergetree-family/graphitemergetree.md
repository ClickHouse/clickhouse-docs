---
'description': '旨在对 Graphite 数据进行缩减和聚合/平均 (rollup)。'
'sidebar_label': 'GraphiteMergeTree'
'sidebar_position': 90
'slug': '/engines/table-engines/mergetree-family/graphitemergetree'
'title': 'GraphiteMergeTree'
---


# GraphiteMergeTree

此引擎旨在为 [Graphite](http://graphite.readthedocs.io/en/latest/index.html) 数据进行稀疏和聚合/平均（汇总）。对于希望将 ClickHouse 作为 Graphite 数据存储的开发人员而言，这可能会很有帮助。

如果您不需要汇总，可以使用任何 ClickHouse 表引擎来存储 Graphite 数据，但如果您需要汇总，请使用 `GraphiteMergeTree`。该引擎能够减少存储的体积，并提高来自 Graphite 的查询效率。

该引擎继承了 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 的属性。

## 创建表 {#creating-table}

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

请参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细描述。

Graphite 数据的表应具有以下列，以存储以下数据：

- 指标名称（Graphite 传感器）。数据类型： `String`。

- 测量指标的时间。数据类型： `DateTime`。

- 指标值。数据类型： `Float64`。

- 指标版本。数据类型：任何数字（ClickHouse 会在版本相同的情况下保存最新的行或最后写入的行。其他行将在数据分片合并期间被删除）。

这些列的名称应在汇总配置中设置。

**GraphiteMergeTree 参数**

- `config_section` — 配置文件中设置汇总规则的部分名称。

**查询子句**

在创建 `GraphiteMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法，如果可能，请将旧项目切换到上述描述的方法。
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

除 `config_section` 外，所有参数的含义与 `MergeTree` 中相同。

- `config_section` — 配置文件中设置汇总规则的部分名称。

</details>

## 汇总配置 {#rollup-configuration}

汇总的设置由服务器配置中的 [graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite) 参数定义。该参数的名称可以是任意的。您可以创建多个配置并将它们用于不同的表。

汇总配置结构：

      required-columns
      patterns

### 必需列 {#required-columns}

#### path_column_name {#path_column_name}

`path_column_name` — 存储指标名称（Graphite 传感器）的列名称。默认值： `Path`。

#### time_column_name {#time_column_name}

`time_column_name` — 存储测量该指标时间的列名称。默认值： `Time`。

#### value_column_name {#value_column_name}

`value_column_name` — 存储在 `time_column_name` 指定的时间时指标值的列名称。默认值： `Value`。

#### version_column_name {#version_column_name}

`version_column_name` — 存储指标版本的列名称。默认值： `Timestamp`。

### 模式 {#patterns}

`patterns` 部分的结构：

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
模式必须严格按顺序排列：

1. 没有 `function` 或 `retention` 的模式。
1. 既有 `function` 又有 `retention` 的模式。
1. 默认模式。
:::

在处理行时，ClickHouse 检查 `pattern` 部分中的规则。每个 `pattern`（包括 `default`）部分可以包含用于聚合的 `function` 参数、`retention` 参数或两者。如果指标名称与 `regexp` 匹配，则应用该 `pattern` 部分（或部分）的规则；否则，将使用 `default` 部分的规则。

`pattern` 和 `default` 部分的字段：

- `rule_type` - 规则类型。它仅适用于特定指标。引擎使用它来区分普通指标和带标签指标。可选参数。默认值： `all`。当性能不重要或仅使用一种指标类型（例如普通指标）时，不需要使用。如果定义了任何特殊类型，系统将创建两种不同的规则集。一个用于普通指标（root.branch.leaf），另一个用于带标签指标（root.branch.leaf;tag1=value1）。
默认规则在两个集合中都结束。
有效值：
    - `all`（默认）- 当省略 `rule_type` 时使用的通用规则。
    - `plain` - 用于普通指标的规则。字段 `regexp` 被处理为正则表达式。
    - `tagged` - 用于带标签指标的规则（指标以 `someName?tag1=value1&tag2=value2&tag3=value3` 的格式存储在数据库中）。正则表达式必须按标签名称排序，如果存在，第一个标签必须是 `__name__`。字段 `regexp` 被处理为正则表达式。
    - `tag_list` - 用于带标签指标的规则，是一种简单 DSL，通过 graphite 格式 `someName;tag1=value1;tag2=value2`， `someName` 或 `tag1=value1;tag2=value2` 来简化指标描述。字段 `regexp` 被转换为 `tagged` 规则。按标签名称排序不是必需的，将自动完成。标签的值（而不是名称）可以设置为正则表达式，例如 `env=(dev|staging)`。
- `regexp` – 指标名称的模式（正则表达式或 DSL）。
- `age` – 数据的最小年龄（单位：秒）。
- `precision`– 定义数据年龄的精确程度（单位：秒）。应为 86400（一天中的秒）的除数。
- `function` – 要应用于年龄在 `[age, age + precision]` 范围内的数据的聚合函数名称。接受的函数： min / max / any / avg。平均值的计算不精确，就像平均值的平均值。

### 没有规则类型的配置示例 {#configuration-example}

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

### 含有规则类型的配置示例 {#configuration-typed-example}

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
数据汇总是在合并过程中执行的。通常，对于旧分区，不会启动合并，因此需要使用 [optimize](../../../sql-reference/statements/optimize.md) 手动触发一次未计划的合并才能进行汇总。或使用其他工具，例如 [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)。
:::
