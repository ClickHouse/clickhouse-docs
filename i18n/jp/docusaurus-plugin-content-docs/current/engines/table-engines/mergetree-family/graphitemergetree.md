---
description: 'Graphite データの間引きおよび集約・平均化（ロールアップ）のために設計されたテーブルエンジン。'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree テーブルエンジン'
doc_type: 'guide'
---



# GraphiteMergeTree テーブルエンジン

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html) データの間引きおよび集約／平均化（ロールアップ）のために設計されています。Graphite のデータストアとして ClickHouse を使用したい開発者にとって有用です。

ロールアップを必要としない場合は、Graphite データの保存にどの ClickHouse テーブルエンジンも使用できますが、ロールアップが必要な場合は `GraphiteMergeTree` を使用してください。このエンジンはストレージ容量を削減し、Graphite から発行されるクエリの効率を向上させます。

このエンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) の特性を継承します。



## テーブルの作成 {#creating-table}

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

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細については、こちらを参照してください。

Graphiteデータ用のテーブルには、以下のデータに対応する次のカラムが必要です:

- メトリック名(Graphiteセンサー)。データ型: `String`。

- メトリックの測定時刻。データ型: `DateTime`。

- メトリックの値。データ型: `Float64`。

- メトリックのバージョン。データ型: 任意の数値型(ClickHouseは最も高いバージョンの行を保存し、バージョンが同じ場合は最後に書き込まれた行を保存します。その他の行はデータパートのマージ時に削除されます)。

これらのカラムの名前は、ロールアップ設定で指定する必要があります。

**GraphiteMergeTreeパラメータ**

- `config_section` — ロールアップルールが設定されている設定ファイル内のセクション名。

**クエリ句**

`GraphiteMergeTree`テーブルを作成する際は、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば既存のプロジェクトも上記の方法に切り替えてください。
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

`config_section`を除くすべてのパラメータは、`MergeTree`と同じ意味を持ちます。

- `config_section` — ロールアップルールが設定されている設定ファイル内のセクション名。

</details>


## ロールアップ設定 {#rollup-configuration}

ロールアップの設定は、サーバー設定の[graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite)パラメータで定義されます。パラメータ名は任意に設定できます。複数の設定を作成し、異なるテーブルで使用することができます。

ロールアップ設定の構造:

      required-columns
      patterns

### 必須カラム {#required-columns}

#### `path_column_name` {#path_column_name}

`path_column_name` — メトリック名(Graphiteセンサー)を格納するカラムの名前。デフォルト値: `Path`。

#### `time_column_name` {#time_column_name}

`time_column_name` — メトリックの測定時刻を格納するカラムの名前。デフォルト値: `Time`。

#### `value_column_name` {#value_column_name}

`value_column_name` — `time_column_name`で設定された時刻におけるメトリックの値を格納するカラムの名前。デフォルト値: `Value`。

#### `version_column_name` {#version_column_name}

`version_column_name` — メトリックのバージョンを格納するカラムの名前。デフォルト値: `Timestamp`。

### パターン {#patterns}

`patterns`セクションの構造:

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
パターンは厳密に順序付けする必要があります:

1. `function`または`retention`を持たないパターン。
1. `function`と`retention`の両方を持つパターン。
1. `default`パターン。
   :::

行を処理する際、ClickHouseは`pattern`セクション内のルールをチェックします。各`pattern`セクション(`default`を含む)には、集約用の`function`パラメータ、`retention`パラメータ、またはその両方を含めることができます。メトリック名が`regexp`に一致する場合、`pattern`セクション(または複数のセクション)のルールが適用されます。それ以外の場合は、`default`セクションのルールが使用されます。

`pattern`および`default`セクションのフィールド:

- `rule_type` - ルールのタイプ。特定のメトリックにのみ適用されます。エンジンはこれを使用してプレーンメトリックとタグ付きメトリックを分離します。オプションパラメータ。デフォルト値: `all`。
  パフォーマンスが重要でない場合、またはプレーンメトリックなど1つのメトリックタイプのみを使用する場合は不要です。デフォルトでは、1つのタイプのルールセットのみが作成されます。特殊なタイプが定義されている場合は、2つの異なるセットが作成されます。1つはプレーンメトリック(root.branch.leaf)用、もう1つはタグ付きメトリック(root.branch.leaf;tag1=value1)用です。
  デフォルトルールは両方のセットに含まれます。
  有効な値:
  - `all`(デフォルト) - 汎用ルール。`rule_type`が省略された場合に使用されます。
  - `plain` - プレーンメトリック用のルール。`regexp`フィールドは正規表現として処理されます。
  - `tagged` - タグ付きメトリック用のルール(メトリックはデータベースに`someName?tag1=value1&tag2=value2&tag3=value3`の形式で格納されます)。正規表現はタグ名でソートされている必要があり、存在する場合は最初のタグが`__name__`である必要があります。`regexp`フィールドは正規表現として処理されます。
  - `tag_list` - タグ付きメトリック用のルール。graphite形式`someName;tag1=value1;tag2=value2`、`someName`、または`tag1=value1;tag2=value2`でメトリックをより簡単に記述するためのシンプルなDSL。`regexp`フィールドは`tagged`ルールに変換されます。タグ名によるソートは不要で、自動的に行われます。タグの値(名前ではない)は正規表現として設定できます。例: `env=(dev|staging)`。
- `regexp` – メトリック名のパターン(正規表現またはDSL)。
- `age` – データの最小経過時間(秒単位)。
- `precision`– データの経過時間を秒単位でどの程度正確に定義するか。86400(1日の秒数)の約数である必要があります。
- `function` – 経過時間が`[age, age + precision]`の範囲内にあるデータに適用する集約関数の名前。使用可能な関数: min / max / any / avg。平均は、平均の平均のように不正確に計算されます。

### ルールタイプを使用しない設定例 {#configuration-example}


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

### ルールタイプを使用した設定例 {#configuration-typed-example}

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
データのロールアップはマージ時に実行されます。通常、古いパーティションに対してはマージが開始されないため、ロールアップを実行するには[optimize](../../../sql-reference/statements/optimize.md)を使用して手動でマージをトリガーする必要があります。または、[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)などの追加ツールを使用することもできます。
:::
