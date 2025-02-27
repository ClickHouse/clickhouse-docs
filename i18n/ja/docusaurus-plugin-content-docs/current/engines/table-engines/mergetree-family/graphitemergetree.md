---
slug: /engines/table-engines/mergetree-family/graphitemergetree
sidebar_position: 90
sidebar_label:  GraphiteMergeTree
title: "GraphiteMergeTree"
description: "Graphiteデータのスリムと集約/平均化（ロールアップ）用に設計されています。"
---

# GraphiteMergeTree

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html)データのスリムと集約/平均化（ロールアップ）用に設計されています。ClickHouseをGraphiteのデータストアとして使用したい開発者に役立つかもしれません。

ロールアップが不要な場合は、任意のClickHouseテーブルエンジンを使用してGraphiteデータを保存できますが、ロールアップが必要な場合は`GraphiteMergeTree`を使用してください。このエンジンは、ストレージのボリュームを減らし、Graphiteからのクエリの効率を向上させます。

このエンジンは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)のプロパティを継承します。

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

[CREATE TABLE](../../../sql-reference/statements/create/table.md#create-table-query)クエリの詳細な説明を参照してください。

Graphiteデータ用のテーブルは、次のデータに対して次のカラムを持つ必要があります：

- メトリック名（Graphiteセンサー）。データ型：`String`。

- メトリック測定の時間。データ型：`DateTime`。

- メトリックの値。データ型：`Float64`。

- メトリックのバージョン。データ型：任意の数値（ClickHouseは、バージョンが同じの場合には、最高バージョンまたは最後に書き込まれた行を保存します。他の行はデータパーツのマージ中に削除されます）。

これらのカラムの名前は、ロールアップ設定で設定する必要があります。

**GraphiteMergeTreeパラメータ**

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクション名。

**クエリ句**

`GraphiteMergeTree`テーブルを作成する際には、`MergeTree`テーブルを作成する際に必要な同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

<details markdown="1">

<summary>テーブルを作成するための廃止された方法</summary>

:::note
この方法を新しいプロジェクトで使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
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

`config_section`を除くすべてのパラメータは、`MergeTree`における意味と同じです。

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクション名。

</details>

## ロールアップ設定 {#rollup-configuration}

ロールアップの設定は、サーバー設定内の[graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite)パラメータによって定義されます。パラメータの名前は任意にすることができます。複数の設定を作成し、異なるテーブルに使用することができます。

ロールアップ設定の構造：

      required-columns
      patterns

### 必要なカラム {#required-columns}

#### path_column_name {#path_column_name}

`path_column_name` — メトリック名（Graphiteセンサー）を格納するカラムの名前。デフォルト値：`Path`。

#### time_column_name {#time_column_name}
`time_column_name` — メトリック測定の時間を格納するカラムの名前。デフォルト値：`Time`。

#### value_column_name {#value_column_name}
`value_column_name` — `time_column_name`で設定された時間におけるメトリックの値を格納するカラムの名前。デフォルト値：`Value`。

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

:::重要
パターンは厳密に順序付けされる必要があります：

1. `function`または`retention`なしのパターン。
1. `function`と`retention`の両方を持つパターン。
1. パターン`default`。
:::

行を処理する際、ClickHouseは`pattern`セクションのルールをチェックします。各`pattern`（`default`を含む）セクションには、集約のための`function`パラメータ、`retention`パラメータのいずれかまたは両方が含まれることがあります。メトリック名が`regexp`に一致する場合、その`pattern`セクション（またはセクション）のルールが適用されます。そうでない場合は、`default`セクションのルールが使用されます。

`pattern`および`default`セクションのフィールド：

- `rule_type` - ルールのタイプ。特定のメトリックスのみに適用されます。エンジンはそれを使用してプレインメトリックスとタグ付きメトリックスを区別します。オプションのパラメータ。デフォルト値：`all`。
パフォーマンスが重要でない場合や、単一のメトリックスタイプ（例：プレインメトリックス）のみが使用される場合には不要です。デフォルトでは、1つのルールセットのみが作成されます。特別なタイプが定義されている場合は、2つの異なるセットが作成されます。1つはプレインメトリックス（root.branch.leaf）のため、もう1つはタグ付きメトリックス（root.branch.leaf;tag1=value1）です。
デフォルトルールは、両方のセットで終了します。
有効な値：
    - `all`（デフォルト） - `rule_type`が省略された場合に使用される汎用ルール。
    - `plain` - プレインメトリックスのためのルール。`regexp`フィールドは正規表現として処理されます。
    - `tagged` - タグ付きメトリックスのためのルール（メトリックスはDBに`someName?tag1=value1&tag2=value2&tag3=value3`形式で保存されます）。正規表現はタグの名前でソートされ、最初のタグは、存在する場合は`__name__`でなければなりません。`regexp`フィールドは正規表現として処理されます。
    - `tag_list` - タグ付きメトリックスのためのルール、Graphite形式でのメトリック記述を簡素化するためのDSL `someName;tag1=value1;tag2=value2`、`someName`、または`tag1=value1;tag2=value2`。`regexp`フィールドは`tagged`ルールに変換されます。タグの名前でのソートは不要で、自動的に行われます。タグの値（名前ではなく）は正規表現として設定できます。例えば、`env=(dev|staging)`。
- `regexp` – メトリック名のパターン（正規またはDSL）。
- `age` – データの最小経過時間（秒）。
- `precision`– データの経過時間の正確さ（秒）。86400（1日の秒数）の除数である必要があります。
- `function` – データの経過時間が`[age, age + precision]`の範囲内にあるときに適用する集約関数の名前。受け入れられる関数：min / max / any / avg。平均はおおよそ計算され、平均の平均のように扱われます。

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
データのロールアップはマージ中に行われます。通常、古いパーティションではマージが開始されないため、ロールアップを行うには、[optimize](../../../sql-reference/statements/optimize.md)を使用して未定スケジュールのマージを手動でトリガーする必要があります。または、追加のツールを使用してください。例えば、[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)です。
:::
