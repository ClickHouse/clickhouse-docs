---
slug: /engines/table-engines/mergetree-family/graphitemergetree
sidebar_position: 90
sidebar_label:  GraphiteMergeTree
title: "GraphiteMergeTree"
description: "Graphiteデータのスリム化と集約/平均化(ロールアップ)専用に設計されています。"
---


# GraphiteMergeTree

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html)データのスリム化と集約/平均化（ロールアップ）を目的に設計されています。ClickHouseをGraphiteのデータストアとして使用したい開発者に役立つかもしれません。

ロールアップが不要な場合は、任意のClickHouseテーブルエンジンを使用してGraphiteデータを格納できますが、ロールアップが必要な場合は`GraphiteMergeTree`を使用してください。このエンジンは、ストレージのボリュームを削減し、Graphiteからのクエリの効率を向上させます。

このエンジンは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)からプロパティを継承しています。

## テーブルの作成 {#creating-table}

``` sql
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

Graphiteデータのテーブルは、以下のデータを保存するために次のカラムを持つ必要があります。

- メトリック名（Graphiteセンサー）。データ型：`String`。

- メトリックを測定する時刻。データ型：`DateTime`。

- メトリックの値。データ型：`Float64`。

- メトリックのバージョン。データ型：任意の数値（ClickHouseは、バージョンが同じ場合は最新の行または最後に書き込まれた行を保存します。他の行はデータパーツのマージ中に削除されます）。

これらのカラムの名前は、ロールアップ設定で設定する必要があります。

**GraphiteMergeTreeパラメーター**

- `config_section` — ロールアップのルールが設定されている設定ファイルのセクション名。

**クエリ句**

`GraphiteMergeTree`テーブルを作成する場合、`MergeTree`テーブルを作成するときと同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨方法</summary>

:::note
新しいプロジェクトでこの方法を使用しないでください。可能であれば、古いプロジェクトを上記で説明された方法に切り替えてください。
:::

``` sql
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

`config_section`を除くすべてのパラメーターは、`MergeTree`と同じ意味を持ちます。

- `config_section` — ロールアップのルールが設定されている設定ファイルのセクション名。

</details>

## ロールアップ設定 {#rollup-configuration}

ロールアップの設定は、サーバー設定の[graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite)パラメーターによって定義されます。パラメーターの名前は任意です。複数の設定を作成し、異なるテーブルで使用できます。

ロールアップ設定の構造：

      required-columns
      patterns

### 必須カラム {#required-columns}

#### path_column_name {#path_column_name}

`path_column_name` — メトリック名（Graphiteセンサー）を格納するカラムの名前。デフォルト値：`Path`。

#### time_column_name {#time_column_name}
`time_column_name` — メトリックを測定する時刻を格納するカラムの名前。デフォルト値：`Time`。

#### value_column_name {#value_column_name}
`value_column_name` — `time_column_name`で設定された時におけるメトリックの値を格納するカラムの名前。デフォルト値：`Value`。

#### version_column_name {#version_column_name}
`version_column_name` — メトリックのバージョンを格納するカラムの名前。デフォルト値：`Timestamp`。

### パターン {#patterns}

`patterns`セクションの構造：

``` text
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
パターンは厳密に順序付けられなければなりません：

1. `function`または`retention`のないパターン。
1. `function`と`retention`の両方を持つパターン。
1. パターン`default`。
:::

行を処理する際、ClickHouseは`pattern`セクション内のルールを確認します。各`pattern`（`default`を含む）セクションは、集約のための`function`パラメーター、`retention`パラメーターの両方を含むことができます。メトリック名が`regexp`に一致する場合、その`pattern`セクション（またはセクション）のルールが適用されます。そうでない場合は、`default`セクションのルールが使用されます。

`pattern`および`default`セクションのフィールド：

- `rule_type` - ルールのタイプ。特定のメトリックのみに適用されます。エンジンは、通常メトリックとタグ付きメトリックを区別するために使用します。オプションのパラメーター。デフォルト値：`all`。
パフォーマンスが重要でない場合や、単一のメトリックタイプのみが使用される場合（例：通常メトリック）には不要です。デフォルトでは、1種類のルールセットのみが作成されます。そうでない場合、特別なタイプのいずれかが定義されている場合、通常メトリック（root.branch.leaf）用とタグ付きメトリック（root.branch.leaf;tag1=value1）の2つの異なるセットが作成されます。
デフォルトルールは、両方のセットに含まれます。
有効な値：
    - `all`（デフォルト） - `rule_type`が省略された場合に使用される汎用的なルール。
    - `plain` - 通常メトリック用のルール。フィールド`regexp`は正規表現として処理されます。
    - `tagged` - タグ付きメトリック用のルール（メトリックは`someName?tag1=value1&tag2=value2&tag3=value3`形式でDBに格納されます）。正規表現はタグ名でソートされる必要があり、最初のタグは存在する場合は`__name__`である必要があります。フィールド`regexp`は正規表現として処理されます。
    - `tag_list` - タグ付きメトリック用のルール、Graphite形式でのメトリック記述を容易にする単純なDSL `someName;tag1=value1;tag2=value2`、`someName`、または`tag1=value1;tag2=value2`。フィールド`regexp`は`tagged`ルールに変換されます。タグ名によるソートは不要で、自動的に行われます。タグの値（名前ではない）は正規表現として設定できます（例：`env=(dev|staging)`）。
- `regexp` – メトリック名のパターン（正規表現またはDSL）。
- `age` – データの最小年齢（秒単位）。
- `precision`– データの年齢を秒単位でどれだけ正確に定義するか。86400（1日の秒数）の約数であるべきです。
- `function` – `[age, age + precision]`の範囲内にあるデータに適用する集約関数の名前。受け入れられる関数：min / max / any / avg。平均は、平均の平均と同様におおよそ計算されます。

### ルールタイプなしの設定例 {#configuration-example}

``` xml
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

``` xml
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
データのロールアップはマージ中に行われます。通常、古いパーティションに対してはマージが開始されないため、ロールアップのためには[optimize](../../../sql-reference/statements/optimize.md)を使用してスケジュール外のマージをトリガーする必要があります。また、[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)などの追加ツールを使用することもできます。
:::
