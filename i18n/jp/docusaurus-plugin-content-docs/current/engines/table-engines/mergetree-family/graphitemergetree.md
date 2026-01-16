---
description: 'Graphite データの間引きおよび集約・平均（ロールアップ）のために設計されています。'
sidebar_label: 'GraphiteMergeTree'
sidebar_position: 90
slug: /engines/table-engines/mergetree-family/graphitemergetree
title: 'GraphiteMergeTree テーブルエンジン'
doc_type: 'guide'
---

# GraphiteMergeTree テーブルエンジン \\{#graphitemergetree-table-engine\\}

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html) データの間引きおよび集約・平均化（ロールアップ）のために設計されています。Graphite のデータストアとして ClickHouse を使用したい開発者に役立ちます。

ロールアップが不要な場合は任意の ClickHouse テーブルエンジンで Graphite データを保存できますが、ロールアップが必要な場合は `GraphiteMergeTree` を使用してください。このエンジンはストレージ容量を削減し、Graphite からのクエリの効率を向上させます。

このエンジンは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) の特性を継承します。

## テーブルの作成 \\{#creating-table\\}

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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

Graphite データ用のテーブルには、以下のデータを格納するために次の列が必要です。

* メトリクス名（Graphite センサー）。データ型: `String`。

* メトリクスを計測した時刻。データ型: `DateTime`。

* メトリクスの値。データ型: `Float64`。

* メトリクスのバージョン。データ型: 任意の数値型（ClickHouse は、バージョンが最大の行、もしくはバージョンが同一の場合は最後に書き込まれた行を保持します。他の行はデータパーツのマージ時に削除されます）。

これらの列名は rollup の設定で指定する必要があります。

**GraphiteMergeTree のパラメータ**

* `config_section` — 設定ファイル内のセクション名。このセクションに rollup のルールを設定します。

**クエリ句**

`GraphiteMergeTree` テーブルを作成する場合は、`MergeTree` テーブルを作成する場合と同様に、同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) が必須です。

<details markdown="1">
  <summary>テーブル作成の非推奨メソッド</summary>

  :::note
  新規プロジェクトではこのメソッドを使用しないでください。可能であれば、既存プロジェクトも上記で説明したメソッドへ移行してください。
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

  `config_section` を除くすべてのパラメータは、`MergeTree` における意味と同じです。

  * `config_section` — 設定ファイル内のセクション名。このセクションに rollup のルールを設定します。
</details>

## ロールアップ設定 \\{#rollup-configuration\\}

ロールアップの設定は、サーバー設定内の [graphite&#95;rollup](../../../operations/server-configuration-parameters/settings.md#graphite) パラメータによって定義されます。パラメータ名は任意の名前を付けることができます。複数の設定を作成し、異なるテーブルに対して使い分けることができます。

ロールアップ設定の構造:

required-columns
patterns

### 必須カラム \\{#required-columns\\}

#### `path_column_name` \\{#path&#95;column&#95;name\\}

`path_column_name` — メトリック名（Graphite センサー）を保存するカラム名。デフォルト値: `Path`。

#### `time_column_name` \\{#time&#95;column&#95;name\\}

`time_column_name` — メトリックを計測した時刻を保存するカラム名。デフォルト値: `Time`。

#### `value_column_name` \\{#value&#95;column&#95;name\\}

`value_column_name` — `time_column_name` で指定された時刻におけるメトリック値を保存するカラム名。デフォルト値: `Value`。

#### `version_column_name` \\{#version&#95;column&#95;name\\}

`version_column_name` — メトリックのバージョンを保存するカラム名。デフォルト値: `Timestamp`。

### パターン \\{#patterns\\}

`patterns` セクションの構造:

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
パターンは次の厳密な順序で並べる必要があります:

1. `function` と `retention` のいずれも指定しないパターン。
2. `function` と `retention` の両方を指定するパターン。
3. パターン `default`。
   :::

行を処理する際、ClickHouse は `pattern` セクション内のルールをチェックします。各 `pattern`（`default` を含む）セクションには、集約用の `function` パラメータ、`retention` パラメータ、またはその両方を含めることができます。メトリクス名が `regexp` にマッチする場合、その `pattern` セクション（または複数セクション）のルールが適用され、それ以外の場合は `default` セクションのルールが適用されます。

`pattern` および `default` セクションのフィールド:

* `rule_type` - ルールの種別。特定の種類のメトリクスにのみ適用されます。エンジンはこれを使用してプレーンメトリクスとタグ付きメトリクスを分離します。省略可能なパラメータです。デフォルト値: `all`。
  パフォーマンスが重要でない場合、またはプレーンメトリクスなど 1 種類のメトリクスのみを使用する場合は不要です。デフォルトでは 1 種類のルールセットのみが作成されます。そうでなく、いずれかの特別なタイプが定義されている場合は、2 つの異なるセットが作成されます。1 つはプレーンメトリクス（root.branch.leaf）用、もう 1 つはタグ付きメトリクス（root.branch.leaf;tag1=value1）用です。
  デフォルトルールは両方のセットに含まれます。
  有効な値:
  * `all` (デフォルト) - `rule_type` が省略された場合に使用される汎用ルール。
  * `plain` - プレーンメトリクス用のルール。フィールド `regexp` は正規表現として処理されます。
  * `tagged` - タグ付きメトリクス用のルール（メトリクスは DB に `someName?tag1=value1&tag2=value2&tag3=value3` 形式で保存されます）。正規表現はタグ名でソートされている必要があり、存在する場合は最初のタグが `__name__` でなければなりません。フィールド `regexp` は正規表現として処理されます。
  * `tag_list` - タグ付きメトリクス用のルールで、graphite 形式 `someName;tag1=value1;tag2=value2`、`someName`、または `tag1=value1;tag2=value2` によるメトリクス記述を簡素化するための DSL です。フィールド `regexp` は `tagged` ルールに変換されます。タグ名でのソートは不要で、自動的に行われます。タグの値（名前ではなく）は正規表現として指定できます（例: `env=(dev|staging)`）。
* `regexp` – メトリクス名に対するパターン（正規表現または DSL）。
* `age` – データの最小経過時間（秒）。
* `precision`– データの経過時間を秒単位でどの程度の精度で定義するか。86400（1 日の秒数）を割り切れる値である必要があります。
* `function` – 経過時間が `[age, age + precision]` の範囲に入るデータに適用する集約関数の名前。使用可能な関数: min / max / any / avg。平均は、平均値同士の平均を取るのと同様に、厳密ではない平均として計算されます。

### ルールタイプなしの設定例 \\{#configuration-example\\}

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

### ルールタイプ別の設定例 \\{#configuration-typed-example\\}

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
データのロールアップはマージ処理の際に実行されます。通常、古いパーティションではマージが開始されないため、ロールアップを行うには [optimize](../../../sql-reference/statements/optimize.md) を使用して予定外のマージをトリガーする必要があります。あるいは、[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer) などの追加ツールを使用します。
:::
