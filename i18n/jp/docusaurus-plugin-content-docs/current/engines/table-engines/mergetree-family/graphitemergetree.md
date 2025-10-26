---
'description': 'Graphite データを薄くし、集約/平均化 (ロールアップ) するために設計されています。'
'sidebar_label': 'GraphiteMergeTree'
'sidebar_position': 90
'slug': '/engines/table-engines/mergetree-family/graphitemergetree'
'title': 'GraphiteMergeTree'
'doc_type': 'guide'
---


# GraphiteMergeTree

このエンジンは、[Graphite](http://graphite.readthedocs.io/en/latest/index.html) データのスリム化および集約（ロールアップ）用に設計されています。ClickHouseをGraphiteのデータストアとして利用したい開発者にとって役立つかもしれません。

ロールアップが必要ない場合は任意のClickHouseテーブルエンジンを使用してGraphiteデータを保存できますが、ロールアップが必要な場合は`GraphiteMergeTree`を使用してください。このエンジンは、ストレージの容量を削減し、Graphiteからのクエリの効率を向上させます。

このエンジンは、[MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) のプロパティを継承しています。

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

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

Graphiteデータのテーブルには、以下のデータを持つ次のカラムが必要です。

- メトリック名（Graphiteセンサー）。データ型: `String`。

- メトリック測定時刻。データ型: `DateTime`。

- メトリックの値。データ型: `Float64`。

- メトリックのバージョン。データ型: 数値（ClickHouseは、バージョンが同じであれば最新のバージョンまたは最後に書き込まれた行を保存します。他の行はデータパーツのマージ時に削除されます）。

これらのカラムの名前は、ロールアップ設定で設定する必要があります。

**GraphiteMergeTreeパラメータ**

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクション名。

**クエリ句**

`GraphiteMergeTree` テーブルを作成する際には、`MergeTree` テーブルと同様の[句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用しないでください。可能であれば、古いプロジェクトを上記の方法に切り替えてください。
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

- `config_section` — ロールアップのルールが設定されている設定ファイル内のセクション名。

</details>

## ロールアップ設定 {#rollup-configuration}

ロールアップの設定は、サーバー設定の[graphite_rollup](../../../operations/server-configuration-parameters/settings.md#graphite)パラメータによって定義されます。このパラメータの名前は任意です。複数の設定を作成し、異なるテーブルで使用できます。

ロールアップ設定の構造:

      required-columns
      patterns

### 必要なカラム {#required-columns}

#### `path_column_name` {#path_column_name}

`path_column_name` — メトリック名（Graphiteセンサー）を格納するカラムの名前。デフォルト値: `Path`。

#### `time_column_name` {#time_column_name}

`time_column_name` — メトリック測定時刻を格納するカラムの名前。デフォルト値: `Time`。

#### `value_column_name` {#value_column_name}

`value_column_name` — `time_column_name`で設定されたときのメトリックの値を格納するカラムの名前。デフォルト値: `Value`。

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
パターンは厳密に順序を守る必要があります:

1. `function` や `retention` のないパターン。
2. `function` と `retention` の両方を持つパターン。
3. パターン `default`。
:::

行を処理する際、ClickHouseは`pattern`セクション内のルールを確認します。各 `pattern`（デフォルトを含む）セクションには、集約のための`function`パラメータ、`retention`パラメータ、またはその両方を含めることができます。メトリック名が`regexp`に一致する場合は、`pattern`セクション（またはセクション）のルールが適用されます。そうでない場合は、`default`セクションのルールが使用されます。

`pattern`および`default`セクションのフィールド:

- `rule_type` - ルールのタイプ。特定のメトリックにのみ適用されます。エンジンはそれを使用して通常のメトリックとタグ付けされたメトリックを区別します。オプションのパラメータ。デフォルト値: `all`。
パフォーマンスが重要でない場合や単一のメトリックタイプが使用されている場合、たとえば通常のメトリックの場合は必要ありません。デフォルトでは、1つのタイプのルールセットのみが作成されます。それ以外の場合、特定のタイプが定義されている場合は、通常のメトリック用（root.branch.leaf）とタグ付けされたメトリック用（root.branch.leaf;tag1=value1）の2つの異なるセットが作成されます。
デフォルトのルールは両方のセットに含まれます。
有効な値:
  - `all`（デフォルト） - `rule_type`が省略された場合に使用される汎用ルール。
  - `plain` - 通常のメトリック用のルール。フィールド`regexp`は正規表現として処理されます。
  - `tagged` - タグ付けされたメトリック用のルール（メトリックは`someName?tag1=value1&tag2=value2&tag3=value3`形式でDBに保存されます）。正規表現はタグ名順にソートされ、最初のタグは存在する場合`__name__`でなければなりません。フィールド`regexp`は正規表現として処理されます。
  - `tag_list` - タグ付けされたメトリック用のルール、Graphite形式のメトリック記述を簡単にするためのシンプルなDSL `someName;tag1=value1;tag2=value2`、`someName`、または `tag1=value1;tag2=value2`。フィールド`regexp`は`tagged`ルールに変換されます。タグ名によるソートは不要であり、自動的に行われます。タグの値（名前ではなく）は正規表現として設定することができます。例: `env=(dev|staging)`。
- `regexp` – メトリック名のパターン（通常またはDSL）。
- `age` – データの最小年齢（秒単位）。
- `precision` – データの年齢を秒単位でどれほど正確に定義するか。86400（1日の秒数）の約数である必要があります。
- `function` – `[age, age + precision]`の範囲内に年齢があるデータに適用される集約関数の名前。受け入れられる関数: min / max / any / avg。平均は、平均の平均として不正確に計算されます。

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
データのロールアップはマージ中に行われます。通常、古いパーティションではマージが開始されないため、ロールアップのためには[optimize](../../../sql-reference/statements/optimize.md)を使用して予定外のマージをトリガーする必要があります。または、[graphite-ch-optimizer](https://github.com/innogames/graphite-ch-optimizer)などの追加ツールを利用します。
:::
