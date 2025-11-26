---
description: '专为对 Graphite 数据进行降采样和聚合/平均（rollup）而设计。'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree 表引擎'
doc_type: 'guide'
---



# GraphiteMergeTree 表引擎

该引擎用于对 [Graphite](http://graphite.readthedocs.io/en/latest/index.html) 数据进行稀疏化和聚合/平均（rollup）处理。它对希望使用 ClickHouse 作为 Graphite 数据存储的开发者非常有用。

如果不需要 rollup，可以使用任意 ClickHouse 表引擎来存储 Graphite 数据；但如果需要 rollup，请使用 `GraphiteMergeTree`。该引擎可以减少存储占用并提高针对 Graphite 的查询效率。

该引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 的属性。



## 创建表

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

参阅 [CREATE TABLE](/sql-reference/statements/create/table) 查询的详细说明。

用于 Graphite 数据的表应包含以下列，对应如下数据：

* 指标名称（Graphite 指标名）。数据类型：`String`。

* 指标的测量时间。数据类型：`DateTime`。

* 指标的值。数据类型：`Float64`。

* 指标的版本。数据类型：任意数值类型（ClickHouse 会保留具有最高版本号的行，或者在版本号相同时保留最后写入的行。其他行会在数据分片合并时被删除）。

这些列的名称应在 rollup 配置中指定。

**GraphiteMergeTree 参数**

* `config_section` — 配置文件中定义 rollup 规则的节名称。

**查询子句**

在创建 `GraphiteMergeTree` 表时，需要与创建 `MergeTree` 表时相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

<details markdown="1">
  <summary>已弃用的建表方法</summary>

  :::note
  不要在新项目中使用此方法，并在可能的情况下，将旧项目切换到上面描述的方法。
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

  除 `config_section` 以外，所有参数的含义都与 `MergeTree` 中相同。

  * `config_section` — 配置文件中定义 rollup 规则的节名称。
</details>


## Rollup 配置

Rollup 的配置由服务器配置中的 [graphite&#95;rollup](../../../operations/server-configuration-parameters/settings.md#graphite) 参数定义。该参数的名称可以任意。你可以创建多个配置，并将它们用于不同的表。

Rollup 配置结构：

required-columns
patterns

### 必需列

#### `path_column_name`

`path_column_name` — 存储指标名称（Graphite 指标）的列名。默认值：`Path`。

#### `time_column_name`

`time_column_name` — 存储该指标采集时间的列名。默认值：`Time`。

#### `value_column_name`

`value_column_name` — 存储在 `time_column_name` 中指定时间点的指标值的列名。默认值：`Value`。

#### `version_column_name`

`version_column_name` — 存储指标版本的列名。默认值：`Timestamp`。

### 模式（Patterns）

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
模式必须严格按以下顺序排列：

1. 不带 `function` 或 `retention` 的模式。
2. 同时带有 `function` 和 `retention` 的模式。
3. `default` 模式。
   :::

在处理一行数据时，ClickHouse 会检查 `pattern` 部分中的规则。每个 `pattern`（包括 `default`）部分都可以包含用于聚合的 `function` 参数、`retention` 参数，或两者兼有。如果指标名称匹配 `regexp`，则应用该 `pattern` 部分（或多个部分）中的规则；否则，使用 `default` 部分中的规则。

`pattern` 和 `default` 部分的字段：

* `rule_type` - 规则类型。只应用于特定类型的指标。引擎使用它来区分普通指标和带标签的指标。可选参数。默认值：`all`。
  当对性能没有严苛要求，或者只使用一种指标类型（例如普通指标）时，该字段不是必需的。默认情况下，只创建一套规则。否则，一旦定义了任一特殊类型，就会创建两套不同的规则：一套用于普通指标（root.branch.leaf），一套用于带标签指标（root.branch.leaf;tag1=value1）。\
  默认规则最终会进入这两套规则中。\
  合法取值：
  * `all`（默认）- 通用规则，在省略 `rule_type` 时使用。
  * `plain` - 用于普通指标的规则。字段 `regexp` 按正则表达式处理。
  * `tagged` - 用于带标签指标的规则（在数据库中以 `someName?tag1=value1&tag2=value2&tag3=value3` 形式存储）。正则表达式中的标签必须按标签名排序，如果存在，第一个标签必须是 `__name__`。字段 `regexp` 按正则表达式处理。
  * `tag_list` - 用于带标签指标的规则，一种用于简化以 Graphite 格式描述指标的简单 DSL，例如 `someName;tag1=value1;tag2=value2`、`someName` 或 `tag1=value1;tag2=value2`。字段 `regexp` 会被转换成一个 `tagged` 规则。标签名排序不是必须的，会自动完成。标签的值（而不是名称）可以是正则表达式，例如 `env=(dev|staging)`。
* `regexp` – 指标名称的匹配模式（正则或 DSL）。
* `age` – 数据的最小年龄（秒）。
* `precision` – 以秒为单位定义数据年龄的精度。应当是 86400（一天的秒数）的约数。
* `function` – 要应用于其年龄落在 `[age, age + precision]` 区间内数据的聚合函数名称。可用函数：min / max / any / avg。平均值的计算是近似的，即“平均的平均值”。

### 没有规则类型的配置示例


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

### 不同规则类型的配置示例

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
数据汇总是在合并过程中完成的。通常不会对旧分区启动合并操作，因此要进行汇总，需要使用 [optimize](../../../sql-reference/statements/optimize.md) 触发一次未计划的合并。也可以使用其他工具，例如 [graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)。
:::
