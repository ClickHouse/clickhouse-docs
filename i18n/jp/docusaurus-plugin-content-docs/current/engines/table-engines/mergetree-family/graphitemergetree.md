---
description: 'Graphiteデータのスリムと集約/平均化（ロールアップ）用に設計されています。'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree'
---


# GraphiteMergeTree

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html)データのスリムと集約/平均化（ロールアップ）用に設計されています。ClickHouseをGraphiteのデータストアとして使用したい開発者にとって役立つかもしれません。

ロールアップが必要ない場合は、任意のClickHouseテーブルエンジンを使用してGraphiteデータを保存できますが、ロールアップが必要な場合は`GraphiteMergeTree`を使用してください。このエンジンは、ストレージの容量を削減し、Graphiteからのクエリの効率を向上させます。

このエンジンは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)からプロパティを継承しています。

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

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

Graphiteデータ用のテーブルは、以下のデータのために次のカラムを持つ必要があります。

- メトリック名（Graphiteセンサー）。データ型: `String`。

- メトリックの測定時間。データ型: `DateTime`。

- メトリックの値。データ型: `Float64`。

- メトリックのバージョン。データ型: 任意の数値（ClickHouseは、バージョンが同じである場合は、最も高いバージョンまたは最後に書き込まれた行を保存します。その他の行はデータパーツのマージ中に削除されます）。

これらのカラムの名前はロールアップ設定で設定する必要があります。

**GraphiteMergeTreeパラメータ**

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクションの名前。

**クエリ句**

`GraphiteMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する場合と同様に、同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこのメソッドを使用せず、可能であれば古いプロジェクトを上記のメソッドに切り替えてください。
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

`config_section`を除くすべてのパラメータは、`MergeTree`の意味と同じです。

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクションの名前。

</details>

## ロールアップ設定 {#rollup-configuration}

ロールアップの設定は、サーバー設定の[graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite)パラメータによって定義されます。このパラメータの名前は任意です。複数の設定を作成し、異なるテーブルで使用できます。

ロールアップ設定構造:

      required-columns
      patterns

### 必要なカラム {#required-columns}

#### path_column_name {#path_column_name}

`path_column_name` — メトリック名（Graphiteセンサー）を格納するカラムの名前。デフォルト値: `Path`。

#### time_column_name {#time_column_name}

`time_column_name` — メトリックの測定時間を格納するカラムの名前。デフォルト値: `Time`。

#### value_column_name {#value_column_name}

`value_column_name` — `time_column_name`に設定された時間におけるメトリックの値を格納するカラムの名前。デフォルト値: `Value`。

#### version_column_name {#version_column_name}

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
パターンは厳密に順序付けられている必要があります：

1. `function`または`retention`のないパターン。
1. `function`と`retention`の両方を持つパターン。
1. `default`パターン。
:::

行を処理する際、ClickHouseは`pattern`セクション内のルールをチェックします。各`pattern`（`default`を含む）セクションには、集約のための`function`パラメータ、`retention`パラメータ、またはその両方を含めることができます。メトリック名が`regexp`に一致する場合、`pattern`セクション（またはセクション）のルールが適用されます。そうでない場合は、`default`セクションのルールが使用されます。

`pattern`および`default`セクションのフィールド：

- `rule_type` - ルールのタイプ。特定のメトリックのみに適用されます。エンジンは、それを使用してプレーンメトリックとタグ付きメトリックを区別します。オプションのパラメータ。デフォルト値: `all`。
パフォーマンスが重要でない場合や、プレーンメトリックのみが使用される場合、例えばプレーンメトリックの場合は不要です。デフォルトでは、1つのタイプのルールセットのみが作成されます。そうでない場合、特別なタイプのいずれかが定義されていると、2つの異なるセットが作成されます。1つはプレーンメトリック用（root.branch.leaf）で、もう1つはタグ付きメトリック用（root.branch.leaf;tag1=value1）。
デフォルトのルールは両方のセットに含まれます。
有効な値：
    - `all`（デフォルト） - `rule_type`が省略されたときに使用される汎用ルール。
    - `plain` - プレーンメトリック用のルール。フィールド`regexp`は正規表現として処理されます。
    - `tagged` - タグ付きメトリック用のルール（メトリックは`someName?tag1=value1&tag2=value2&tag3=value3`の形式でDBに格納されます）。正規表現はタグの名前でソートされる必要があり、最初のタグは`__name__`である必要があります（存在する場合）。フィールド`regexp`は正規表現として処理されます。
    - `tag_list` - タグ付きメトリック用のルール、Graphite形式でのメトリック記述を簡単にするためのDSL `someName;tag1=value1;tag2=value2`、`someName`、または`tag1=value1;tag2=value2`。フィールド`regexp`は`tagged`ルールに変換されます。タグの名前でソートする必要はなく、自動的に行われます。タグの値（名前ではなく）は正規表現として設定できます（例: `env=(dev|staging)`）。
- `regexp` – メトリック名のパターン（正規表現またはDSL）。
- `age` – データの最小年齢（秒単位）。
- `precision`– データの年齢を定義する精度（秒単位）。86400（1日の秒数）で割り切れる数値にすべきです。
- `function` – `[age, age + precision]`の範囲内にあるデータに適用する集約関数の名前。受け入れられる関数: min / max / any / avg。平均は不正確に計算され、複数の平均の平均のようになります。

### ルールタイプなしの設定例 {#configuration-example}

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

### ルールタイプありの設定例 {#configuration-typed-example}

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
データのロールアップはマージ中に行われます。通常、古いパーティションではマージが開始されないため、ロールアップのためには、[optimize](../../../sql-reference/statements/optimize.md)を使用して、未スケジュールのマージをトリガーする必要があります。また、例えば[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)のような追加ツールを使用することもできます。
:::
