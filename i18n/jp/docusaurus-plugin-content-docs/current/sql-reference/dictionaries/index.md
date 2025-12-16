---
description: 'ClickHouse における外部辞書機能の概要'
sidebar_label: '辞書の定義'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: '辞書'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Dictionaries {#dictionaries}

Dictionary は、さまざまな種類の参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouse は、クエリで使用できる Dictionary を操作するための専用関数をサポートしています。参照テーブルとの `JOIN` を使うよりも、Dictionary 関数を使う方が簡単で効率的です。

ClickHouse は次の種類の Dictionary をサポートしています:

- [一連の関数](../../sql-reference/functions/ext-dict-functions.md) を持つ Dictionaries。
- 特定の [一連の関数](../../sql-reference/functions/embedded-dict-functions.md) を持つ [Embedded dictionaries](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouse で Dictionary の利用を始める場合、このトピックを扱ったチュートリアルがあります。[こちら](tutorial.md) を参照してください。
:::

さまざまなデータソースから独自の Dictionary を作成できます。Dictionary のソースには、ClickHouse テーブル、ローカルテキストファイルまたは実行可能ファイル、HTTP(s) リソース、あるいは別の DBMS を使用できます。詳細については「[Dictionary Sources](#dictionary-sources)」を参照してください。

ClickHouse は次のことを行います:

- Dictionary を RAM に完全または部分的に格納します。
- Dictionary を定期的に更新し、欠落している値を動的にロードします。言い換えると、Dictionary は動的にロードできます。
- xml ファイルまたは [DDL queries](../../sql-reference/statements/create/dictionary.md) を使って Dictionary を作成できるようにします。

Dictionary の設定は 1 つ以上の xml ファイル内に配置できます。設定ファイルへのパスは [dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) パラメータで指定します。

Dictionary は、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 設定に応じて、サーバー起動時または初回使用時にロードできます。

[dictionaries](/operations/system-tables/dictionaries) システムテーブルには、サーバーで設定されている Dictionary に関する情報が含まれています。各 Dictionary について、次の情報を確認できます:

- Dictionary のステータス。
- 設定パラメータ。
- Dictionary に割り当てられた RAM の量や、Dictionary が正常にロードされてからのクエリ数といったメトリクス。

<CloudDetails />

## DDL クエリによる Dictionary の作成 {#creating-a-dictionary-with-a-ddl-query}

Dictionary は [DDL クエリ](../../sql-reference/statements/create/dictionary.md) で作成できます。この方法が推奨されます。DDL クエリで作成された Dictionary には次のような利点があります。

- サーバーの設定ファイルに追加のレコードを追記する必要がありません。
- Dictionary をテーブルやビューと同様に、第一級のエンティティとして扱うことができます。
- Dictionary テーブル関数ではなく、`SELECT` といった馴染みのある構文を使ってデータを直接読み取ることができます。`SELECT` 文を通じて Dictionary に直接アクセスする場合、キャッシュされる Dictionary はキャッシュ済みデータのみを返し、キャッシュされない Dictionary は保持している全データを返すことに注意してください。
- Dictionary の名前を容易に変更できます。

## 設定ファイルを使用して Dictionary を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
設定ファイルを使用して Dictionary を作成する方法は ClickHouse Cloud ではサポートされていません。DDL（上記参照）を使用し、`default` ユーザーとして Dictionary を作成してください。
:::

Dictionary の設定ファイルは次の形式です。

```xml
<clickhouse>
    <comment>An optional element with any content. Ignored by the ClickHouse server.</comment>

    <!--Optional element. File name with substitutions-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- Dictionary configuration. -->
        <!-- There can be any number of dictionary sections in a configuration file. -->
    </dictionary>

</clickhouse>
```

同じファイル内で、任意の数の Dictionary を[設定](#configuring-a-dictionary)できます。

:::note
`SELECT` クエリで記述することで、小規模な Dictionary の値を変換できます（[transform](../../sql-reference/functions/other-functions.md) 関数を参照）。この機能は Dictionary 機能とは無関係です。
:::

## Dictionary の設定 {#configuring-a-dictionary}

<CloudDetails />

Dictionary を XML ファイルで設定する場合、その設定は次のような構造になります。

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- Complex key configuration -->
    </structure>

    <source>
      <!-- Source configuration -->
    </source>

    <layout>
      <!-- Memory layout configuration -->
    </layout>

    <lifetime>
      <!-- Lifetime of dictionary in memory -->
    </lifetime>
</dictionary>
```

対応する [DDL クエリ](../../sql-reference/statements/create/dictionary.md) は次の構造です。

```sql
CREATE DICTIONARY dict_name
(
    ... -- attributes
)
PRIMARY KEY ... -- complex or single key configuration
SOURCE(...) -- Source configuration
LAYOUT(...) -- Memory layout configuration
LIFETIME(...) -- Lifetime of dictionary in memory
```

## メモリ内における Dictionary の保存 {#storing-dictionaries-in-memory}

Dictionary をメモリ内に保存する方法はいくつかあります。

最適な処理速度を実現できるため、[flat](#flat)、[hashed](#hashed)、および [complex&#95;key&#95;hashed](#complex_key_hashed) を推奨します。

キャッシュ方式は、性能が低下する可能性があることと、最適なパラメータ選定が難しいことから推奨されません。詳細は [cache](#cache) セクションを参照してください。

Dictionary のパフォーマンスを向上させる方法はいくつかあります。

* `GROUP BY` の後に、Dictionary を扱う関数を呼び出します。
* 取得する属性を「単射」としてマークします。属性は、異なるキーが異なる属性値に対応する場合に単射と呼ばれます。そのため、`GROUP BY` でキーから属性値を取得する関数を使用している場合、この関数は自動的に `GROUP BY` の外に取り出されます。

ClickHouse は Dictionary に関するエラーに対して例外をスローします。エラーの例は次のとおりです。

* 参照しようとしている Dictionary をロードできなかった。
* `cached` Dictionary へのクエリ中のエラー。

[system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで Dictionary の一覧とそのステータスを確認できます。

<CloudDetails />

設定は次のようになります。

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- layout settings -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

対応する [DDL クエリ](../../sql-reference/statements/create/dictionary.md)：

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

レイアウトに `complex-key*` を含まない辞書はキーとして [UInt64](../../sql-reference/data-types/int-uint.md) 型を持ち、`complex-key*` 辞書は複合キー（任意の型を含み得る複雑なキー）を持ちます。

XML 辞書における [UInt64](../../sql-reference/data-types/int-uint.md) キーは `<id>` タグで定義されます。

設定例（キーのカラム key&#95;column は UInt64 型）:

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合（`complex`）キーを持つ XML 辞書は `<key>` タグで定義します。

複合キーの設定例（キーが [String](../../sql-reference/data-types/string.md) 型の要素を 1 つだけ持つ場合）:

```xml
...
<structure>
    <key>
        <attribute>
            <name>country_code</name>
            <type>String</type>
        </attribute>
    </key>
...
```

## メモリ内に Dictionary を格納する方法 {#ways-to-store-dictionaries-in-memory}

Dictionary データをメモリ内に格納する方法には、それぞれ CPU および RAM の使用量に関するトレードオフがあります。どのレイアウトを使用するかを判断する際の出発点としては、Dictionary 関連の[ブログ記事](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)内の「[Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)」セクションに掲載されている決定木が有用です。

- [flat](#flat)
- [hashed](#hashed)
- [sparse_hashed](#sparse_hashed)
- [complex_key_hashed](#complex_key_hashed)
- [complex_key_sparse_hashed](#complex_key_sparse_hashed)
- [hashed_array](#hashed_array)
- [complex_key_hashed_array](#complex_key_hashed_array)
- [range_hashed](#range_hashed)
- [complex_key_range_hashed](#complex_key_range_hashed)
- [cache](#cache)
- [complex_key_cache](#complex_key_cache)
- [ssd_cache](#ssd_cache)
- [complex_key_ssd_cache](#complex_key_ssd_cache)
- [direct](#direct)
- [complex_key_direct](#complex_key_direct)
- [ip_trie](#ip_trie)

### flat {#flat}

Dictionary は、flat 配列の形式で完全にメモリ上に格納されます。Dictionary はどの程度のメモリを使用するのでしょうか？使用量は、（使用領域における）最大キー値のサイズに比例します。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型であり、値は `max_array_size`（デフォルト — 500,000）までに制限されます。Dictionary の作成時に、これより大きなキーが見つかった場合、ClickHouse は例外をスローし、Dictionary を作成しません。Dictionary の flat 配列の初期サイズは、`initial_array_size` 設定（デフォルト — 1024）で制御されます。

すべての種類のソースがサポートされます。更新時には、（ファイルまたはテーブルからの）データが全体として読み込まれます。

この方式は、Dictionary を格納するために利用可能なすべての方式の中で、最も高いパフォーマンスを提供します。

設定例:

```xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

または

```sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

### hashed {#hashed}

Dictionary はハッシュテーブルの形式で、完全にメモリ上に格納されます。Dictionary には、任意の識別子を持つ要素をいくつでも含めることができます。実際には、キーの数が数千万件に達することもあります。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

あらゆる種類のソースをサポートします。更新時には、データ（ファイルまたはテーブルから）は全体が読み込まれます。

設定例:

```xml
<layout>
  <hashed />
</layout>
```

または

```sql
LAYOUT(HASHED())
```

設定例:

```xml
<layout>
  <hashed>
    <!-- If shards greater then 1 (default is `1`) the dictionary will load
         data in parallel, useful if you have huge amount of elements in one
         dictionary. -->
    <shards>10</shards>

    <!-- Size of the backlog for blocks in parallel queue.

         Since the bottleneck in parallel loading is rehash, and so to avoid
         stalling because of thread is doing rehash, you need to have some
         backlog.

         10000 is good balance between memory and speed.
         Even for 10e10 elements and can handle all the load without starvation. -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- Maximum load factor of the hash table, with greater values, the memory
         is utilized more efficiently (less memory is wasted) but read/performance
         may deteriorate.

         Valid values: [0.5, 0.99]
         Default: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse&#95;hashed {#sparse_hashed}

`hashed` に似ていますが、メモリ消費量を抑える代わりに CPU 使用量が増加します。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

設定例:

```xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

または

```sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

この種類の Dictionary でも `shards` を使用できます。また、`sparse_hashed` は `hashed` よりも遅いため、`hashed` よりも `sparse_hashed` で `shards` を使うことのほうが重要になります。

### complex&#95;key&#95;hashed {#complex_key_hashed}

この種のストレージは、複合[キー](#dictionary-key-and-fields)と併せて使用します。`hashed` と同様です。

設定例:

```xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex&#95;key&#95;sparse&#95;hashed {#complex_key_sparse_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)用です。[sparse&#95;hashed](#sparse_hashed)と同様です。

設定例:

```xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed&#95;array {#hashed_array}

Dictionary は完全にメモリ内に格納されます。各 attribute は配列として格納されます。キーとなる attribute は、値が attributes 配列内のインデックスであるハッシュテーブルの形式で格納されます。Dictionary には、任意の識別子を持つ任意数の要素を含めることができます。実際には、キー数が数千万件に達することがあります。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

あらゆる種類のソースがサポートされます。更新時には、データ（ファイルまたはテーブルからのもの）は全体が一括で読み込まれます。

設定例：

```xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

または

```sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex&#95;key&#95;hashed&#95;array {#complex_key_hashed_array}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。[hashed&#95;array](#hashed_array)と同様です。

構成例:

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range&#95;hashed {#range_hashed}

Dictionary は、範囲とそれに対応する値の順序付き配列を持つハッシュテーブル形式でメモリ上に保持されます。

このストレージ方式は `hashed` と同様に動作し、キーに加えて日付/時刻（任意の数値型）の範囲も使用できます。

例: このテーブルには、各広告主ごとの割引が次の形式で格納されています。

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields) 内で `range_min` と `range_max` 要素を定義します。これらの要素には `name` と `type` の要素を含める必要があります（`type` が指定されていない場合、デフォルトの型である Date 型が使用されます）。`type` には任意の数値型（Date / DateTime / UInt64 / Int32 / その他）を指定できます。

:::note
`range_min` と `range_max` の値は `Int64` 型に収まる必要があります。
:::

例:

```xml
<layout>
    <range_hashed>
        <!-- Strategy for overlapping ranges (min/max). Default: min (return a matching range with the min(range_min -> range_max) value) -->
        <range_lookup_strategy>min</range_lookup_strategy>
    </range_hashed>
</layout>
<structure>
    <id>
        <name>advertiser_id</name>
    </id>
    <range_min>
        <name>discount_start_date</name>
        <type>Date</type>
    </range_min>
    <range_max>
        <name>discount_end_date</name>
        <type>Date</type>
    </range_max>
    ...
```

または

```sql
CREATE DICTIONARY discounts_dict (
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Date,
    amount Float64
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'discounts'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(RANGE_HASHED(range_lookup_strategy 'max'))
RANGE(MIN discount_start_date MAX discount_end_date)
```

これらのディクショナリを使用するには、`dictGet` 関数に、範囲を指定するための追加引数を渡す必要があります。

```sql
dictGet('dict_name', 'attr_name', id, date)
```

クエリ例:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された `id` と、渡された日付を含む日付範囲に対応する値を返します。

アルゴリズムの詳細は次のとおりです。

* `id` が見つからない場合、またはその `id` に対応する範囲が見つからない場合、属性の型のデフォルト値を返します。
* 範囲が重複していて `range_lookup_strategy=min` の場合、一致する範囲のうち `range_min` が最小のものを返し、さらに複数見つかった場合は `range_max` が最小のものを返し、それでも複数見つかった場合（複数の範囲が同じ `range_min` と `range_max` を持つ場合）は、それらの中からランダムな範囲を返します。
* 範囲が重複していて `range_lookup_strategy=max` の場合、一致する範囲のうち `range_min` が最大のものを返し、さらに複数見つかった場合は `range_max` が最大のものを返し、それでも複数見つかった場合（複数の範囲が同じ `range_min` と `range_max` を持つ場合）は、それらの中からランダムな範囲を返します。
* `range_max` が `NULL` の場合、その範囲は開区間です。`NULL` は取りうる最大値として扱われます。`range_min` については、開区間として `1970-01-01` か `0` (-MAX&#95;INT) を使用できます。

設定例:

```xml
<clickhouse>
    <dictionary>
        ...

        <layout>
            <range_hashed />
        </layout>

        <structure>
            <id>
                <name>Abcdef</name>
            </id>
            <range_min>
                <name>StartTimeStamp</name>
                <type>UInt64</type>
            </range_min>
            <range_max>
                <name>EndTimeStamp</name>
                <type>UInt64</type>
            </range_max>
            <attribute>
                <name>XXXType</name>
                <type>String</type>
                <null_value />
            </attribute>
        </structure>

    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

重複する範囲および端が開いている範囲を含む設定例：

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;

INSERT INTO discounts VALUES (1, '2015-01-01', Null, 0.1);
INSERT INTO discounts VALUES (1, '2015-01-15', Null, 0.2);
INSERT INTO discounts VALUES (2, '2015-01-01', '2015-01-15', 0.3);
INSERT INTO discounts VALUES (2, '2015-01-04', '2015-01-10', 0.4);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-15', 0.5);
INSERT INTO discounts VALUES (3, '1970-01-01', '2015-01-10', 0.6);

SELECT * FROM discounts ORDER BY advertiser_id, discount_start_date;
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│             1 │          2015-01-01 │              ᴺᵁᴸᴸ │    0.1 │
│             1 │          2015-01-15 │              ᴺᵁᴸᴸ │    0.2 │
│             2 │          2015-01-01 │        2015-01-15 │    0.3 │
│             2 │          2015-01-04 │        2015-01-10 │    0.4 │
│             3 │          1970-01-01 │        2015-01-15 │    0.5 │
│             3 │          1970-01-01 │        2015-01-10 │    0.6 │
└───────────────┴─────────────────────┴───────────────────┴────────┘

-- RANGE_LOOKUP_STRATEGY 'max'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'max'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- two ranges are matching, range_min 2015-01-15 (0.2) is bigger than 2015-01-01 (0.1)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- two ranges are matching, range_min 2015-01-04 (0.4) is bigger than 2015-01-01 (0.3)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- two ranges are matching, range_min are equal, 2015-01-15 (0.5) is bigger than 2015-01-10 (0.6)
└─────┘

DROP DICTIONARY discounts_dict;

-- RANGE_LOOKUP_STRATEGY 'min'

CREATE DICTIONARY discounts_dict
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
PRIMARY KEY advertiser_id
SOURCE(CLICKHOUSE(TABLE discounts))
LIFETIME(MIN 600 MAX 900)
LAYOUT(RANGE_HASHED(RANGE_LOOKUP_STRATEGY 'min'))
RANGE(MIN discount_start_date MAX discount_end_date);

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-14')) res;
┌─res─┐
│ 0.1 │ -- the only one range is matching: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- two ranges are matching, range_min 2015-01-01 (0.1) is less than 2015-01-15 (0.2)
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- two ranges are matching, range_min 2015-01-01 (0.3) is less than 2015-01-04 (0.4)
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- two ranges are matching, range_min are equal, 2015-01-10 (0.6) is less than 2015-01-15 (0.5)
└─────┘
```

### complex&#95;key&#95;range&#95;hashed {#complex_key_range_hashed}

Dictionary は、範囲とそれに対応する値の順序付き配列を持つハッシュテーブルの形式でメモリ上に保存されます（[range&#95;hashed](#range_hashed) を参照）。このストレージ形式は、複合 [キー](#dictionary-key-and-fields) と共に使用するためのものです。

設定例:

```sql
CREATE DICTIONARY range_dictionary
(
  CountryID UInt64,
  CountryKey String,
  StartDate Date,
  EndDate Date,
  Tax Float64 DEFAULT 0.2
)
PRIMARY KEY CountryID, CountryKey
SOURCE(CLICKHOUSE(TABLE 'date_table'))
LIFETIME(MIN 1 MAX 1000)
LAYOUT(COMPLEX_KEY_RANGE_HASHED())
RANGE(MIN StartDate MAX EndDate);
```

### cache {#cache}

Dictionary は、固定数のセルを持つキャッシュ内に保存されます。これらのセルには、頻繁に使用される要素が格納されます。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

Dictionary の検索時には、まずキャッシュが検索されます。各データブロックについて、キャッシュ内に見つからない、または古くなっているすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` を使用してソースから取得されます。受信したデータはキャッシュに書き込まれます。

キーが Dictionary に存在しない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` の各設定で制御できます。

キャッシュ型 Dictionary の場合、キャッシュ内データの有効期限である [lifetime](#refreshing-dictionary-data-using-lifetime) を設定できます。あるセルにデータが読み込まれてから `lifetime` で指定された時間より長く経過している場合、そのセルの値は使用されず、キーは期限切れと見なされます。このキーは、次回使用が必要になったときに再リクエストされます。この動作は、`allow_read_expired_keys` 設定で構成できます。

これは、Dictionary を格納する方法の中で最も効率が低い方法です。キャッシュの速度は、適切な設定と利用シナリオに強く依存します。キャッシュ型 Dictionary は、ヒット率が十分に高い場合（推奨 99% 以上）にのみ良好に動作します。平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで確認できます。

`allow_read_expired_keys` 設定が 1（デフォルトは 0）に設定されている場合、Dictionary は非同期更新をサポートできます。クライアントがキーを要求し、そのすべてがキャッシュ内にあるものの、一部が期限切れである場合、Dictionary はクライアントに期限切れのキーの値を返し、ソースからそれらを非同期でリクエストします。

キャッシュ性能を向上させるには、`LIMIT` を含むサブクエリを使用し、Dictionary を利用する関数を外側で呼び出してください。

すべての種類のソースがサポートされています。

設定例:

```xml
<layout>
    <cache>
        <!-- The size of the cache, in number of cells. Rounded up to a power of two. -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- Allows to read expired keys. -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- Max size of update queue. -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- Max timeout in milliseconds for push update task into queue. -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- Max wait timeout in milliseconds for update task to complete. -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- Max threads for cache dictionary update. -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分に大きなキャッシュサイズを設定します。セル数は実際に試しながら選定する必要があります。

1. ある値を設定する。
2. キャッシュが完全に埋まるまでクエリを実行する。
3. `system.dictionaries` テーブルを使ってメモリ使用量を評価する。
4. 必要なメモリ使用量に達するまで、セル数を増減させる。

:::note
ClickHouse をデータソースとして使用しないでください。ランダムリードを伴うクエリの処理が遅くなるためです。
:::

### complex_key_cache {#complex_key_cache}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用します。`cache` と同様です。

### ssd&#95;cache {#ssd_cache}

`cache` と同様ですが、データを SSD 上に、インデックスを RAM 上に保存します。更新キューに関連するすべてのキャッシュ Dictionary 設定は、SSD キャッシュ Dictionary にも適用できます。

Dictionary キーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

```xml
<layout>
    <ssd_cache>
        <!-- Size of elementary read block in bytes. Recommended to be equal to SSD's page size. -->
        <block_size>4096</block_size>
        <!-- Max cache file size in bytes. -->
        <file_size>16777216</file_size>
        <!-- Size of RAM buffer in bytes for reading elements from SSD. -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- Size of RAM buffer in bytes for aggregating elements before flushing to SSD. -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- Path where cache file will be stored. -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

または

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)向けに使用します。`ssd_cache` と同様のものです。

### direct {#direct}

Dictionary はメモリに常駐せず、リクエストの処理中にソースへ直接アクセスします。

Dictionary のキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

ローカルファイルを除く、すべての種類の [ソース](#dictionary-sources) がサポートされています。

設定例：

```xml
<layout>
  <direct />
</layout>
```

または

```sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用します。`direct` と同様です。

### ip&#95;trie {#ip_trie}

この Dictionary は、ネットワークプレフィックスによる IP アドレス検索向けに設計されています。CIDR 表記で IP 範囲を保持し、特定の IP がどのプレフィックス（例: サブネットや ASN の範囲）に属するかを高速に判別できるため、ジオロケーションやネットワーク分類といった IP ベースの検索に最適です。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="ip_trie Dictionary を使った IP ベースの検索" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**例**

ClickHouse に、IP プレフィックスとマッピングを格納したテーブルがあるとします。

```sql
CREATE TABLE my_ip_addresses (
    prefix String,
    asn UInt32,
    cca2 String
)
ENGINE = MergeTree
PRIMARY KEY prefix;
```

```sql
INSERT INTO my_ip_addresses VALUES
    ('202.79.32.0/20', 17501, 'NP'),
    ('2620:0:870::/48', 3856, 'US'),
    ('2a02:6b8:1::/48', 13238, 'RU'),
    ('2001:db8::/32', 65536, 'ZZ')
;
```

このテーブル用に `ip_trie` Dictionary を定義します。`ip_trie` レイアウトでは複合キーが必要です。

```xml
<structure>
    <key>
        <attribute>
            <name>prefix</name>
            <type>String</type>
        </attribute>
    </key>
    <attribute>
            <name>asn</name>
            <type>UInt32</type>
            <null_value />
    </attribute>
    <attribute>
            <name>cca2</name>
            <type>String</type>
            <null_value>??</null_value>
    </attribute>
    ...
</structure>
<layout>
    <ip_trie>
        <!-- Key attribute `prefix` can be retrieved via dictGetString. -->
        <!-- This option increases memory usage. -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

または

```sql
CREATE DICTIONARY my_ip_trie_dictionary (
    prefix String,
    asn UInt32,
    cca2 String DEFAULT '??'
)
PRIMARY KEY prefix
SOURCE(CLICKHOUSE(TABLE 'my_ip_addresses'))
LAYOUT(IP_TRIE)
LIFETIME(3600);
```

キーには、許可された IP プレフィックスを含む `String` 型の属性を 1 つだけ持つ必要があります。他の型はまだサポートされていません。

構文は次のとおりです。

```sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4 では `UInt32`、IPv6 では `FixedString(16)` のいずれかを受け取ります。例えば次のとおりです。

```sql
SELECT dictGet('my_ip_trie_dictionary', 'cca2', toIPv4('202.79.32.10')) AS result;

┌─result─┐
│ NP     │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', 'asn', IPv6StringToNum('2001:db8::1')) AS result;

┌─result─┐
│  65536 │
└────────┘


SELECT dictGet('my_ip_trie_dictionary', ('asn', 'cca2'), IPv6StringToNum('2001:db8::1')) AS result;

┌─result───────┐
│ (65536,'ZZ') │
└──────────────┘
```

他の型はまだサポートされていません。この関数は、この IP アドレスに対応するプレフィックスに対して設定された属性を返します。プレフィックスが重複している場合は、最も具体的なものが返されます。

データはすべて RAM に収まっている必要があります。

## LIFETIMEを使用したDictionaryデータの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは`LIFETIME`タグ（秒単位で定義）に基づいて辞書を定期的に更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔、およびキャッシュされた辞書の無効化間隔を指定します。

更新中でも、Dictionaryの旧バージョンに対してクエリを実行できます。Dictionaryの更新(初回ロード時を除く)はクエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに記録され、クエリはDictionaryの旧バージョンを使用して引き続き実行できます。Dictionaryの更新が成功すると、旧バージョンはアトミックに置き換えられます。

設定の例：

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

or

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>` (`LIFETIME(0)`) を設定すると、ディクショナリの更新が防止されます。

更新の時間間隔を設定でき、ClickHouseはこの範囲内で一様にランダムな時刻を選択します。これは、多数のサーバーで更新する際にDictionaryソースへの負荷を分散するために必要です。

設定の例：

```xml
<dictionary>
    ...
    <lifetime>
        <min>300</min>
        <max>360</max>
    </lifetime>
    ...
</dictionary>
```

or

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>` および `<max>0</max>` の場合、ClickHouseはタイムアウトによるDictionaryの再読み込みを行いません。
この場合、Dictionaryの設定ファイルが変更された場合、または `SYSTEM RELOAD DICTIONARY` コマンドが実行された場合に、ClickHouseはDictionaryを再読み込みします。

Dictionaryを更新する際、ClickHouseサーバーは[ソース](#dictionary-sources)の種類に応じて異なるロジックを適用します:

* テキストファイルの場合、更新時刻をチェックします。前回記録されていた時刻と異なる場合は、Dictionary が更新されます。
* 他のソース由来のディクショナリは、デフォルトでは常に更新されます。

その他のソース（ODBC、PostgreSQL、ClickHouseなど）の場合、辞書が実際に変更された場合にのみ更新するクエリを設定できます。毎回更新するのではなく、変更時のみ更新されます。これを行うには、次の手順に従ってください。

* Dictionary テーブルには、ソースデータが更新されるたびに必ず変化する列が必要です。
* source の設定では、変更されるフィールドを取得するクエリを指定する必要があります。ClickHouse サーバーはクエリの結果を行として解釈し、その行が前回の状態から変化している場合に Dictionary が更新されます。[source](#dictionary-sources) の設定内の `<invalidate_query>` フィールドでクエリを指定します。

設定の例：

```xml
<dictionary>
    ...
    <odbc>
      ...
      <invalidate_query>SELECT update_time FROM dictionary_source where id = 1</invalidate_query>
    </odbc>
    ...
</dictionary>
```

or

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`ディクショナリでは、同期更新と非同期更新の両方がサポートされています。

`Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` Dictionaryでは、前回の更新以降に変更されたデータのみをリクエストすることも可能です。Dictionaryソース設定の一部として `update_field` が指定されている場合、前回の更新時刻の値(秒単位)がデータリクエストに追加されます。ソースタイプ(Executable、HTTP、MySQL、PostgreSQL、ClickHouse、ODBC)に応じて、外部ソースからデータをリクエストする前に `update_field` に異なるロジックが適用されます。

* ソースが HTTP の場合、`update_field` はクエリパラメータとして追加され、その値として最後の更新時刻が設定されます。
* ソースが Executable の場合、`update_field` は最後の更新時刻を値とする引数として、実行可能スクリプトに追加されます。
* ソースが ClickHouse、MySQL、PostgreSQL、ODBC のいずれかである場合、`WHERE` 句に、`update_field` が最後の更新時刻以上であることを条件とする式が追加されます。
  * 既定では、この `WHERE` 条件は SQL クエリの最上位レベルで評価されます。`{condition}` キーワードを使用すると、クエリ内の別の任意の `WHERE` 句でこの条件を評価することもできます。例:
    ```sql
    ...
    SOURCE(CLICKHOUSE(...
        update_field 'added_time'
        QUERY '
            SELECT my_arr.1 AS x, my_arr.2 AS y, creation_time
            FROM (
                SELECT arrayZip(x_arr, y_arr) AS my_arr, creation_time
                FROM dictionary_source
                WHERE {condition}
            )'
    ))
    ...
    ```

`update_field` オプションが設定されている場合、追加オプションとして `update_lag` を設定できます。`update_lag` オプションの値は、更新されたデータをリクエストする前に、前回の更新時刻から差し引かれます。

設定例:

```xml
<dictionary>
    ...
        <clickhouse>
            ...
            <update_field>added_time</update_field>
            <update_lag>15</update_lag>
        </clickhouse>
    ...
</dictionary>
```

または

```sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```

## Dictionary のソース {#dictionary-sources}

<CloudDetails />

Dictionary は、さまざまなソースから ClickHouse と連携できます。

Dictionary を XML ファイルで構成する場合、設定は次のようになります。

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- Source configuration -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDL クエリ](../../sql-reference/statements/create/dictionary.md) を使用する場合、上記の設定は次のようになります。

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

ソースは `source` セクションで設定します。

ソース種別が [Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse) の場合は、
追加の設定オプションを利用できます。

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

または

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

ソースの種類 (`source_type`):

* [ローカルファイル](#local-file)
* [実行可能ファイル](#executable-file)
* [実行可能ファイルプール](#executable-pool)
* [HTTP(S)](#https)
* DBMS
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)
  * [YTsaurus](#ytsaurus)


### ローカル ファイル {#local-file}

設定例:

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

または

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

設定フィールド:

* `path` – ファイルへの絶対パス。
* `format` – ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされています。

DDL コマンド（`CREATE DICTIONARY ...`）でソースに `FILE` を指定した Dictionary を作成する場合、ClickHouse ノード上の任意のファイルへ DB ユーザーがアクセスするのを防ぐため、ソースファイルは `user_files` ディレクトリ内に配置する必要があります。

**関連項目**

* [Dictionary function](/sql-reference/table-functions/dictionary)

### 実行可能ファイル {#executable-file}

実行可能ファイルの扱いは、[Dictionary がメモリ上にどのように格納されているか](#storing-dictionaries-in-memory) に依存します。Dictionary が `cache` および `complex_key_cache` を使って格納されている場合、ClickHouse は必要なキーを取得するためのリクエストを実行可能ファイルの STDIN に送信します。そうでない場合、ClickHouse は実行可能ファイルを起動し、その出力を Dictionary データとして扱います。

設定例:

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

設定フィールド:

* `command` — 実行可能ファイルへの絶対パス、または（コマンドのディレクトリが `PATH` に含まれている場合は）ファイル名。
* `format` — ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされます。
* `command_termination_timeout` — 実行可能スクリプトにはメインの読み書きループを含める必要があります。Dictionary が破棄されるとパイプはクローズされ、実行可能ファイルには ClickHouse が子プロセスに SIGTERM シグナルを送信するまでにシャットダウンするための `command_termination_timeout` 秒が与えられます。`command_termination_timeout` は秒で指定します。デフォルト値は 10。オプションのパラメータです。
* `command_read_timeout` - コマンドの stdout からデータを読み取る際のタイムアウト（ミリ秒）。デフォルト値は 10000。オプションのパラメータです。
* `command_write_timeout` - コマンドの stdin にデータを書き込む際のタイムアウト（ミリ秒）。デフォルト値は 10000。オプションのパラメータです。
* `implicit_key` — 実行可能なソースは値のみを返すことができ、要求されたキーとの対応関係は、結果の行の順序によって暗黙的に決定されます。デフォルト値は false。
* `execute_direct` - `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user&#95;scripts フォルダ内から検索されます。追加のスクリプト引数は空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `0`。オプションのパラメータです。
* `send_chunk_header` - 処理プロセスにデータの chunk を送信する前に、その行数を先に送信するかどうかを制御します。オプション。デフォルト値は `false`。

この Dictionary ソースは XML 設定によってのみ構成できます。DDL を使用して executable ソースを持つ Dictionary を作成することは無効化されています。そうしないと、DB ユーザーが ClickHouse ノード上で任意のバイナリを実行できてしまうためです。

### Executable プール {#executable-pool}

Executable プールを使用すると、プロセスのプールからデータを読み込むことができます。このソースは、ソースからすべてのデータをロードする必要がある Dictionary レイアウトでは動作しません。Executable プールは、Dictionary が `cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または `complex_key_direct` レイアウトを使用して[メモリ内に保存されている](#ways-to-store-dictionaries-in-memory)場合に動作します。

Executable プールは、指定されたコマンドでプロセスのプールを起動し、それらが終了するまで実行し続けます。プログラムは、利用可能な間は STDIN からデータを読み込み、その結果を STDOUT に出力する必要があります。また、STDIN 上の次のデータブロックを待つことができます。ClickHouse は、データブロックの処理後に STDIN を閉じることはせず、必要に応じて別のデータチャンクをパイプします。実行されるスクリプトはこのようなデータ処理方法に対応している必要があり、STDIN をポーリングし、できるだけ早い段階でデータを STDOUT にフラッシュしなければなりません。

設定例:

```xml
<source>
    <executable_pool>
        <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10<max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

Setting fields:

* `command` — 実行可能ファイルへの絶対パス、または（プログラムディレクトリが `PATH` に設定されている場合は）ファイル名。
* `format` — ファイルフォーマット。「[Formats](/sql-reference/formats)」で説明されているすべてのフォーマットがサポートされます。
* `pool_size` — プールサイズ。`pool_size` として 0 が指定された場合、プールサイズに制限はありません。デフォルト値は `16` です。
* `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含んでいる必要があります。Dictionary が破棄された後、パイプがクローズされ、その時点からシャットダウンまでに `command_termination_timeout` 秒が与えられます。この時間が経過すると、ClickHouse は子プロセスに SIGTERM シグナルを送信します。秒数で指定します。デフォルト値は 10。オプションのパラメータです。
* `max_command_execution_time` — データブロックを処理するための、実行可能スクリプトのコマンド実行時間の最大値。秒数で指定します。デフォルト値は 10。オプションのパラメータです。
* `command_read_timeout` - command の stdout からデータを読み取るためのタイムアウト（ミリ秒）。デフォルト値は 10000。オプションのパラメータです。
* `command_write_timeout` - command の stdin にデータを書き込むためのタイムアウト（ミリ秒）。デフォルト値は 10000。オプションのパラメータです。
* `implicit_key` — 実行可能なソースファイルは値のみを返すことができ、要求されたキーとの対応関係は、結果における行の順序によって暗黙的に決定されます。デフォルト値は false。オプションのパラメータです。
* `execute_direct` - `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user&#95;scripts フォルダ内から検索されます。追加のスクリプト引数は空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1`。オプションのパラメータです。
* `send_chunk_header` - 処理対象の chunk を送信する前に行数を送信するかどうかを制御します。オプション。デフォルト値は `false` です。

この Dictionary のソースは XML 設定でのみ構成できます。実行可能ソースを持つ Dictionary を DDL で作成することはできません。そうしないと、DB ユーザーが ClickHouse ノード上で任意のバイナリを実行できてしまうためです。

### HTTP(S) {#https}

HTTP(S) サーバーとの連携は、[Dictionary がメモリ上にどのように保存されているか](#storing-dictionaries-in-memory) に依存します。Dictionary が `cache` および `complex_key_cache` を使って保存されている場合、ClickHouse は必要なキーを取得するために `POST` メソッドでリクエストを送信します。

設定例:

```xml
<source>
    <http>
        <url>http://[::1]/os.tsv</url>
        <format>TabSeparated</format>
        <credentials>
            <user>user</user>
            <password>password</password>
        </credentials>
        <headers>
            <header>
                <name>API-KEY</name>
                <value>key</value>
            </header>
        </headers>
    </http>
</source>
```

または

```sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

ClickHouse が HTTPS リソースにアクセスできるようにするには、サーバー構成で [OpenSSL を設定](../../operations/server-configuration-parameters/settings.md#openssl) する必要があります。

設定フィールド:

* `url` – ソース URL。
* `format` – ファイルフォーマット。「[Formats](/sql-reference/formats)」で説明されているすべてのフォーマットをサポートします。
* `credentials` – Basic HTTP 認証。任意のパラメータ。
* `user` – 認証に必要なユーザー名。
* `password` – 認証に必要なパスワード。
* `headers` – HTTP リクエストで使用されるすべてのカスタム HTTP ヘッダーエントリ。任意のパラメータ。
* `header` – 単一の HTTP ヘッダーエントリ。
* `name` – リクエスト送信時にヘッダーで使用される識別子名。
* `value` – 特定の識別子名に設定される値。

DDL コマンド（`CREATE DICTIONARY ...`）を使用して Dictionary を作成する際、HTTP Dictionary 用のリモートホストは、データベースユーザーが任意の HTTP サーバーへアクセスできないようにするため、設定ファイルの `remote_url_allow_hosts` セクションの内容と照合してチェックされます。

### DBMS（データベース管理システム） {#dbms}

#### ODBC {#odbc}

ODBC ドライバーを持つ任意のデータベースに接続するために、この方法を使用できます。

設定例：

```xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>ShemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM ShemaName.TableName</query>
    </odbc>
</source>
```

または

```sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

フィールドの設定:

* `db` – データベース名。データベース名が `<connection_string>` のパラメータで設定されている場合は省略します。
* `table` – テーブル名および、存在する場合はスキーマ名。
* `connection_string` – 接続文字列。
* `invalidate_query` – Dictionary のステータスを確認するためのクエリ。任意のパラメータです。[LIFETIME を使用した Dictionary データの更新](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。
* `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。任意のパラメータです。
* `query` – カスタムクエリ。任意のパラメータです。

:::note
`table` フィールドと `query` フィールドは同時には使用できません。また、`table` または `query` のどちらか一方のフィールドは必ず指定する必要があります。
:::

ClickHouse は ODBC ドライバーからクォート記号（引用符）を受け取り、ドライバーへのクエリ内ですべての設定値をクォートするため、データベース内のテーブル名の大文字・小文字の表記に合わせてテーブル名を設定する必要があります。

Oracle を使用している際にエンコーディングに問題が発生する場合は、対応する [FAQ](/knowledgebase/oracle-odbc) の項目を参照してください。

##### ODBC Dictionary 機能における既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBC ドライバーでデータベースに接続する際、接続パラメーター `Servername` は書き換えられる可能性があります。この場合、`odbc.ini` にある `USERNAME` と `PASSWORD` の値がリモートサーバーに送信され、漏えいするおそれがあります。
:::

**安全でない使用例**

PostgreSQL 用に unixODBC を設定してみましょう。`/etc/odbc.ini` の内容は次のとおりです。

```text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

その後、次のようなクエリを実行すると、

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC ドライバーは、`odbc.ini` 内の `USERNAME` と `PASSWORD` の値を `some-server.com` に送信します。

##### PostgreSQL への接続例 {#example-of-connecting-postgresql}

Ubuntu OS 上で。

unixODBC と PostgreSQL 用 ODBC ドライバーのインストール：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（または ClickHouse を実行するユーザーでサインインしている場合は `~/.odbc.ini`）の設定：

```text
    [DEFAULT]
    Driver = myconnection

    [myconnection]
    Description         = PostgreSQL connection to my_db
    Driver              = PostgreSQL Unicode
    Database            = my_db
    Servername          = 127.0.0.1
    UserName            = username
    Password            = password
    Port                = 5432
    Protocol            = 9.3
    ReadOnly            = No
    RowVersioning       = No
    ShowSystemTables    = No
    ConnSettings        =
```

ClickHouse における Dictionary の構成:

```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- You can specify the following parameters in connection_string: -->
                <!-- DSN=myconnection;UID=username;PWD=password;HOST=127.0.0.1;PORT=5432;DATABASE=my_db -->
                <connection_string>DSN=myconnection</connection_string>
                <table>postgresql_table</table>
            </odbc>
        </source>
        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>
        <layout>
            <hashed/>
        </layout>
        <structure>
            <id>
                <name>id</name>
            </id>
            <attribute>
                <name>some_column</name>
                <type>UInt64</type>
                <null_value>0</null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

ドライバーのライブラリへのフルパスを指定するために、`odbc.ini` を編集する必要がある場合があります（例: `DRIVER=/usr/local/lib/psqlodbcw.so`）。

##### MS SQL Server への接続例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQL Server に接続するための ODBC ドライバのインストール:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーの構成：

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # test TDS connection
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # if you signed in under a user that runs ClickHouse

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (optional) test ODBC connection (to use isql-tool install the [unixodbc](https://packages.debian.org/sid/unixodbc)-package)
    $ isql -v MSSQL "user" "password"
```

備考:

* 特定の SQL Server バージョンでサポートされる最も古い TDS バージョンを確認するには、製品ドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a) を確認してください。

ClickHouse における Dictionary の設定:

```xml
<clickhouse>
    <dictionary>
        <name>test</name>
        <source>
            <odbc>
                <table>dict</table>
                <connection_string>DSN=MSSQL;UID=test;PWD=test</connection_string>
            </odbc>
        </source>

        <lifetime>
            <min>300</min>
            <max>360</max>
        </lifetime>

        <layout>
            <flat />
        </layout>

        <structure>
            <id>
                <name>k</name>
            </id>
            <attribute>
                <name>s</name>
                <type>String</type>
                <null_value></null_value>
            </attribute>
        </structure>
    </dictionary>
</clickhouse>
```

または

```sql
CREATE DICTIONARY test (
    k UInt64,
    s String DEFAULT ''
)
PRIMARY KEY k
SOURCE(ODBC(table 'dict' connection_string 'DSN=MSSQL;UID=test;PWD=test'))
LAYOUT(FLAT())
LIFETIME(MIN 300 MAX 360)
```

#### MySQL {#mysql}

設定例:

```xml
<source>
  <mysql>
      <port>3306</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <replica>
          <host>example01-1</host>
          <priority>1</priority>
      </replica>
      <replica>
          <host>example01-2</host>
          <priority>1</priority>
      </replica>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

または

```sql
SOURCE(MYSQL(
    port 3306
    user 'clickhouse'
    password 'qwerty'
    replica(host 'example01-1' priority 1)
    replica(host 'example01-2' priority 1)
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド:

* `port` – MySQL サーバーのポート。すべてのレプリカに対してまとめて指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `user` – MySQL ユーザー名。すべてのレプリカに対してまとめて指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `password` – MySQL ユーザーのパスワード。すべてのレプリカに対してまとめて指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `replica` – レプリカ設定のセクションです。複数のセクションを定義できます。

  * `replica/host` – MySQL ホスト。
  * `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouse はレプリカを優先度順に走査します。数値が小さいほど優先度が高くなります。

* `db` – データベース名。

* `table` – テーブル名。

* `where` – 選択条件。条件の構文は MySQL の `WHERE` 句と同じです（例: `id > 10 AND id < 20`）。任意のパラメータです。

* `invalidate_query` – Dictionary のステータスを確認するためのクエリ。任意のパラメータです。詳細は [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) を参照してください。

* `fail_on_connection_loss` – 接続が失われた場合のサーバーの動作を制御する設定パラメータ。`true` の場合、クライアントとサーバー間の接続が失われると直ちに例外がスローされます。`false` の場合、ClickHouse サーバーは例外をスローする前に、そのクエリの実行を 3 回まで再試行します。再試行を行うとレスポンス時間が長くなることに注意してください。デフォルト値: `false`。

* `query` – カスタムクエリ。任意のパラメータです。

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず宣言する必要があります。
:::

:::note
明示的な `secure` パラメータは存在しません。SSL 接続を確立する場合は、セキュリティが必須となります。
:::

MySQL には、ローカルホスト上でソケット経由で接続できます。そのためには、`host` と `socket` を設定します。

設定例:

```xml
<source>
  <mysql>
      <host>localhost</host>
      <socket>/path/to/socket/file.sock</socket>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <fail_on_connection_loss>true</fail_on_connection_loss>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </mysql>
</source>
```

または

```sql
SOURCE(MYSQL(
    host 'localhost'
    socket '/path/to/socket/file.sock'
    user 'clickhouse'
    password 'qwerty'
    db 'db_name'
    table 'table_name'
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    fail_on_connection_loss 'true'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

#### ClickHouse {#clickhouse}

設定例:

```xml
<source>
    <clickhouse>
        <host>example01-01-1</host>
        <port>9000</port>
        <user>default</user>
        <password></password>
        <db>default</db>
        <table>ids</table>
        <where>id=10</where>
        <secure>1</secure>
        <query>SELECT id, value_1, value_2 FROM default.ids</query>
    </clickhouse>
</source>
```

または

```sql
SOURCE(CLICKHOUSE(
    host 'example01-01-1'
    port 9000
    user 'default'
    password ''
    db 'default'
    table 'ids'
    where 'id=10'
    secure 1
    query 'SELECT id, value_1, value_2 FROM default.ids'
));
```

Setting fields:

* `host` – ClickHouse のホスト。ローカルホストの場合、クエリはネットワーク処理なしで実行されます。耐障害性を向上させるには、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成し、後続の設定でそれを指定できます。
* `port` – ClickHouse サーバーのポート。
* `user` – ClickHouse ユーザー名。
* `password` – ClickHouse ユーザーのパスワード。
* `db` – データベース名。
* `table` – テーブル名。
* `where` – 抽出条件。省略可能です。
* `invalidate_query` – Dictionary のステータスを確認するためのクエリ。任意のパラメータです。詳細は [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。
* `secure` - 接続に SSL を使用するかどうかを指定します。
* `query` – カスタムクエリ。任意のパラメータです。

:::note
`table` または `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず指定する必要があります。
:::

#### MongoDB {#mongodb}

設定例:

```xml
<source>
    <mongodb>
        <host>localhost</host>
        <port>27017</port>
        <user></user>
        <password></password>
        <db>test</db>
        <collection>dictionary_source</collection>
        <options>ssl=true</options>
    </mongodb>
</source>
```

または

```xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

または

```sql
SOURCE(MONGODB(
    host 'localhost'
    port 27017
    user ''
    password ''
    db 'test'
    collection 'dictionary_source'
    options 'ssl=true'
))
```

設定項目:

* `host` – MongoDB ホスト。
* `port` – MongoDB サーバーのポート。
* `user` – MongoDB ユーザー名。
* `password` – MongoDB ユーザーのパスワード。
* `db` – データベース名。
* `collection` – コレクション名。
* `options` -  MongoDB 接続文字列オプション（オプションのパラメータ）。

または

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド:

* `uri` - 接続を確立するための URI。
* `collection` – コレクション名。

[エンジンの詳細情報](../../engines/table-engines/integrations/mongodb.md)

#### Redis {#redis}

設定例:

```xml
<source>
    <redis>
        <host>localhost</host>
        <port>6379</port>
        <storage_type>simple</storage_type>
        <db_index>0</db_index>
    </redis>
</source>
```

または

```sql
SOURCE(REDIS(
    host 'localhost'
    port 6379
    storage_type 'simple'
    db_index 0
))
```

設定フィールド:

* `host` – Redis のホスト名。
* `port` – Redis サーバーのポート番号。
* `storage_type` – キー操作に用いられる Redis の内部ストレージ構造。`simple` は単純なソースおよびハッシュ化された単一キーソース用、`hash_map` は 2 つのキーを持つハッシュ化されたソース用です。レンジ型ソースおよび複雑なキーを持つキャッシュソースはサポートされません。省略可能で、省略時のデフォルト値は `simple` です。
* `db_index` – Redis 論理データベースの数値インデックス。省略可能で、省略時のデフォルト値は 0 です。

#### Cassandra {#cassandra}

設定例：

```xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspase>database_name</keyspase>
        <column_family>table_name</column_family>
        <allow_filtering>1</allow_filtering>
        <partition_key_prefix>1</partition_key_prefix>
        <consistency>One</consistency>
        <where>"SomeColumn" = 42</where>
        <max_threads>8</max_threads>
        <query>SELECT id, value_1, value_2 FROM database_name.table_name</query>
    </cassandra>
</source>
```

設定フィールド:

* `host` – Cassandra のホスト、またはホストのカンマ区切りリスト。
* `port` – Cassandra サーバーのポート。指定されていない場合、デフォルトのポート 9042 が使用されます。
* `user` – Cassandra のユーザー名。
* `password` – Cassandra のユーザーのパスワード。
* `keyspace` – keyspace（データベース）の名前。
* `column_family` – column family（テーブル）の名前。
* `allow_filtering` – クラスタリングキーのカラムに対して、コストの高い条件を許可するかどうかのフラグ。デフォルト値は 1 です。
* `partition_key_prefix` – Cassandra テーブルの主キーにおけるパーティションキーのカラム数。複合キー Dictionary 用に必須です。Dictionary 定義内のキーのカラムの順序は Cassandra と同一でなければなりません。デフォルト値は 1 であり（最初のキーのカラムがパーティションキーで、それ以外のキーのカラムがクラスタリングキーになります）。
* `consistency` – consistency レベル。指定可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One` です。
* `where` – 任意の選択条件。
* `max_threads` – 複合キー Dictionary において、複数のパーティションからデータをロードする際に使用するスレッド数の最大値。
* `query` – カスタムクエリ。任意のパラメータです。

:::note
`column_family` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`column_family` フィールドか `query` フィールドのいずれか一方は必ず宣言する必要があります。
:::

#### PostgreSQL {#postgresql}

設定例：

```xml
<source>
  <postgresql>
      <host>postgresql-hostname</hoat>
      <port>5432</port>
      <user>clickhouse</user>
      <password>qwerty</password>
      <db>db_name</db>
      <table>table_name</table>
      <where>id=10</where>
      <invalidate_query>SQL_QUERY</invalidate_query>
      <query>SELECT id, value_1, value_2 FROM db_name.table_name</query>
  </postgresql>
</source>
```

または

```sql
SOURCE(POSTGRESQL(
    port 5432
    host 'postgresql-hostname'
    user 'postgres_user'
    password 'postgres_password'
    db 'db_name'
    table 'table_name'
    replica(host 'example01-1' port 5432 priority 1)
    replica(host 'example01-2' port 5432 priority 2)
    where 'id=10'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド:

* `host` – PostgreSQL サーバーのホスト。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` の内部）に個別に指定することもできます。
* `port` – PostgreSQL サーバーのポート。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` の内部）に個別に指定することもできます。
* `user` – PostgreSQL ユーザー名。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` の内部）に個別に指定することもできます。
* `password` – PostgreSQL ユーザーのパスワード。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` の内部）に個別に指定することもできます。
* `replica` – レプリカ設定のセクション。複数のセクションを定義できます:
  * `replica/host` – PostgreSQL ホスト。
  * `replica/port` – PostgreSQL ポート。
  * `replica/priority` – レプリカの優先度。接続を試行する際、ClickHouse は優先度の順にレプリカを走査します。数値が小さいほど優先度が高くなります。
* `db` – データベース名。
* `table` – テーブル名。
* `where` – 選択条件。条件の構文は PostgreSQL の `WHERE` 句と同じです。たとえば `id > 10 AND id < 20` のように指定します。省略可能なパラメータです。
* `invalidate_query` – Dictionary の状態を確認するためのクエリ。省略可能なパラメータです。詳しくはセクション [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) を参照してください。
* `background_reconnect` – 接続に失敗した場合にバックグラウンドでレプリカへの再接続を行います。省略可能なパラメータです。
* `query` – カスタムクエリ。省略可能なパラメータです。

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時に使用することはできません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず宣言する必要があります。
:::

### YTsaurus {#ytsaurus}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
これは実験的な機能であり、今後のリリースで後方互換性のない変更が行われる可能性があります。
YTsaurus を Dictionary ソースとして利用するには、設定 [`allow_experimental_ytsaurus_dictionary_source`](/operations/settings/settings#allow_experimental_ytsaurus_dictionary_source) を有効にします。
:::

設定例:

```xml
<source>
    <ytsaurus>
        <http_proxy_urls>http://localhost:8000</http_proxy_urls>
        <cypress_path>//tmp/test</cypress_path>
        <oauth_token>password</oauth_token>
        <check_table_schema>1</check_table_schema>
    </ytsaurus>
</source>
```

または

```sql
SOURCE(YTSAURUS(
    http_proxy_urls 'http://localhost:8000'
    cypress_path '//tmp/test'
    oauth_token 'password'
))
```

設定フィールド:

* `http_proxy_urls` – YTsaurus HTTP プロキシへの URL。
* `cypress_path` – テーブルのソースとなる Cypress パス。
* `oauth_token` – OAuth トークン。


### Null {#null}

ダミー（空）のディクショナリを作成するために使用できる特別なソースです。このようなディクショナリは、テスト用途や、データノードとクエリノードを分離し、ノード上に Distributed テーブルを持つ構成で役立ちます。

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```

## Dictionary のキーとフィールド {#dictionary-key-and-fields}

<CloudDetails />

`structure` 句では、クエリで使用可能な Dictionary のキーとフィールドを記述します。

XML の記述:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- Attribute parameters -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性は次の要素で記述されます：

* `<id>` — キーカラム
* `<attribute>` — データカラム（属性は複数定義できます）

DDL クエリ：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

属性はクエリ本体内で記述します:

* `PRIMARY KEY` — キーカラム
* `AttrName AttrType` — データカラム。属性は複数定義できます。

## キー {#key}

ClickHouse は次の種類のキーをサポートします。

- 数値キー。`UInt64`。`<id>` タグ内、または `PRIMARY KEY` キーワードを使って定義します。
- 複合キー。異なる型の値の集合です。`<key>` タグ内、または `PRIMARY KEY` キーワードを使って定義します。

XML 構造では `<id>` か `<key>` のいずれか一方のみを含めることができます。DDL クエリには `PRIMARY KEY` を 1 つだけ定義しなければなりません。

:::note
キーを属性として記述してはいけません。
:::

### 数値キー {#numeric-key}

型：`UInt64`。

設定例：

```xml
<id>
    <name>Id</name>
</id>
```

構成フィールド:

* `name` – キーを含むカラムの名前。

DDL クエリの場合:

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – 主キーとなるカラム名。

### 複合キー {#composite-key}

キーは任意の型のフィールドからなる `tuple` とできます。この場合に使用できる [layout](#storing-dictionaries-in-memory) は `complex_key_hashed` または `complex_key_cache` のいずれかです。

:::tip
複合キーは 1 つの要素だけで構成することもできます。これにより、例えば文字列をキーとして使用することが可能になります。
:::

キーの構造は `<key>` 要素で設定します。キーのフィールドは、dictionary の[属性](#dictionary-key-and-fields)と同じ形式で指定します。例:

```xml
<structure>
    <key>
        <attribute>
            <name>field1</name>
            <type>String</type>
        </attribute>
        <attribute>
            <name>field2</name>
            <type>UInt32</type>
        </attribute>
        ...
    </key>
...
```

または

```sql
CREATE DICTIONARY (
    field1 String,
    field2 UInt32
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*` 関数を使用したクエリでは、キーとしてタプルが渡されます。例: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## 属性 {#attributes}

設定例：

```xml
<structure>
    ...
    <attribute>
        <name>Name</name>
        <type>ClickHouseDataType</type>
        <null_value></null_value>
        <expression>rand64()</expression>
        <hierarchical>true</hierarchical>
        <injective>true</injective>
        <is_object_id>true</is_object_id>
    </attribute>
</structure>
```

または

```sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

設定項目:

| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | ClickHouse データ型: [UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse は Dictionary の値を指定されたデータ型にキャストしようとします。たとえば MySQL の場合、MySQL のソーステーブルではフィールドが `TEXT`、`VARCHAR`、`BLOB` のいずれかであっても、ClickHouse では `String` として取り込むことができます。<br/>[Nullable](../../sql-reference/data-types/nullable.md) は、現在 [Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache) Dictionary でサポートされています。[IPTrie](#ip_trie) Dictionary では `Nullable` 型はサポートされていません。 | Yes      |
| `null_value`                                         | 存在しない要素に対するデフォルト値。<br/>この例では空文字列です。[NULL](../syntax.md#null) 値は `Nullable` 型に対してのみ使用できます（上記の型の説明行を参照してください）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | ClickHouse が値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式にはリモート SQL データベースのカラム名を指定できます。これにより、リモートカラムのエイリアスを作成できます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、この属性には現在のキーに対する親キーの値が含まれます。[Hierarchical Dictionaries](#hierarchical-dictionaries) を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | `id -> attribute` の写像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true` の場合、ClickHouse は単射な Dictionary へのリクエストを `GROUP BY` 句の後に自動的に挿入できます。通常、これによりそのようなリクエストの数が大幅に削減されます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | クエリが `ObjectID` によって MongoDB ドキュメントに対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。 | No       |

## 階層型辞書 {#hierarchical-dictionaries}

ClickHouse は、[数値キー](#numeric-key) を持つ階層型辞書をサポートしています。

次の階層構造を見てみましょう。

```text
0 (Common parent)
│
├── 1 (Russia)
│   │
│   └── 2 (Moscow)
│       │
│       └── 3 (Center)
│
└── 4 (Great Britain)
    │
    └── 5 (London)
```

この階層は、次の Dictionary テーブルとして表現できます。

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

このテーブルには、要素に対する直近の親のキーを格納する `parent_region` カラムが含まれています。

ClickHouse は、外部 Dictionary 属性に対して階層的なプロパティをサポートします。このプロパティにより、上で説明したものと同様の階層 Dictionary を構成できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy) 関数を使用すると、要素の親チェーンを取得できます。

この例の場合、Dictionary の構造は次のようになります。

```xml
<dictionary>
    <structure>
        <id>
            <name>region_id</name>
        </id>

        <attribute>
            <name>parent_region</name>
            <type>UInt64</type>
            <null_value>0</null_value>
            <hierarchical>true</hierarchical>
        </attribute>

        <attribute>
            <name>region_name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

    </structure>
</dictionary>
```

## ポリゴン Dictionary {#polygon-dictionaries}

この Dictionary は point-in-polygon クエリ、つまり本質的には「逆ジオコーディング」ルックアップ向けに最適化されています。ある座標（緯度・経度）が与えられると、多数のポリゴン（国境や地域境界など）の集合の中から、その点を含むポリゴン／リージョンを効率的に特定します。位置座標を、それを内包するリージョンへマッピングする用途に適しています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse における Polygon Dictionary" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Polygon Dictionary の設定例:

<CloudDetails />

```xml
<dictionary>
    <structure>
        <key>
            <attribute>
                <name>key</name>
                <type>Array(Array(Array(Array(Float64))))</type>
            </attribute>
        </key>

        <attribute>
            <name>name</name>
            <type>String</type>
            <null_value></null_value>
        </attribute>

        <attribute>
            <name>value</name>
            <type>UInt64</type>
            <null_value>0</null_value>
        </attribute>
    </structure>

    <layout>
        <polygon>
            <store_polygon_key_column>1</store_polygon_key_column>
        </polygon>
    </layout>

    ...
</dictionary>
```

対応する [DDL クエリ](/sql-reference/statements/create/dictionary):

```sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

多角形 Dictionary を設定する場合、キーは次のいずれか 2 種類の型でなければなりません。

* 単一の多角形。これは点の配列です。
* MultiPolygon。これは多角形の配列です。各多角形は 2 次元の点の配列です。この配列の最初の要素は多角形の外周境界であり、後続の要素はそこから除外する領域を指定します。

点は座標の配列またはタプルとして指定できます。現在の実装では、2 次元の点のみがサポートされています。

ユーザーは、ClickHouse がサポートするすべての形式で独自のデータをアップロードできます。

利用可能な [インメモリストレージ](#storing-dictionaries-in-memory) のタイプは 3 種類あります。

* `POLYGON_SIMPLE`。これは素朴な実装で、各クエリに対してすべての多角形を線形走査し、追加の索引を使用せずにそれぞれに対して包含判定を行います。

* `POLYGON_INDEX_EACH`。多角形ごとに個別の索引が構築され、ほとんどの場合、高速に包含判定を行うことができます（地理的な領域向けに最適化されています）。
  また、対象領域にグリッドが重ね合わされ、検査対象となる多角形の数が大幅に絞り込まれます。
  このグリッドはセルを 16 個の等しい部分に再帰的に分割することで作成され、2 つのパラメータで設定されます。
  再帰の深さが `MAX_DEPTH` に達するか、セルと交差する多角形の数が `MIN_INTERSECTIONS` 以下になったときに分割が停止します。
  クエリに応答する際には、対応するセルが特定され、そのセル内に格納されている多角形に対する索引へ順次アクセスします。

* `POLYGON_INDEX_CELL`。この配置でも上記のグリッドが作成され、同じオプションが利用可能です。各グリッドセルごとに、そのセルに入る多角形の断片すべてに対する索引が構築され、高速にクエリへ応答できるようになります。

* `POLYGON`。`POLYGON_INDEX_CELL` の同義語です。

Dictionary に対するクエリは、Dictionary を操作するための標準的な[関数](../../sql-reference/functions/ext-dict-functions.md)を用いて実行されます。
重要な違いとして、ここではキーが「その点を包含する多角形を探索したい点」そのものになります。

**例**

上で定義した Dictionary を用いた動作例:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

「points」テーブル内の各ポイントに対して最後のコマンドを実行すると、そのポイントを含む最小面積のポリゴンが特定され、要求された属性が出力されます。

**例**

SELECT クエリでポリゴン Dictionary のカラムを読み取るには、Dictionary の設定または対応する DDL クエリで `store_polygon_key_column = 1` を有効にするだけです。

クエリ:

```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
)
PRIMARY KEY key
SOURCE(CLICKHOUSE(TABLE 'polygons_test_table'))
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
LIFETIME(0);

SELECT * FROM polygons_test_dictionary;
```

結果：

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```

## 正規表現ツリー Dictionary {#regexp-tree-dictionary}

この Dictionary を使用すると、階層的な正規表現パターンに基づいてキーを値にマッピングできます。これは、キーの完全一致ではなく、正規表現パターンのマッチングに基づく検索（例: 正規表現パターンとの照合によってユーザーエージェント文字列などを分類する）向けに最適化されています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse の regex tree dictionaries 入門" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### ClickHouse オープンソースで Regular Expression Tree Dictionary を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

ClickHouse オープンソースでは、正規表現ツリーを含む YAML ファイルへのパスを指定した `YAMLRegExpTree` ソースを使用して Regular Expression Tree Dictionary を定義します。

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
...
```

Dictionary のソース `YAMLRegExpTree` は、正規表現ツリーの構造を表します。例えば、次のとおりです。

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: 'TencentOS'
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: 'Android'
  versions:
    - regexp: '33/tclwebkit'
      version: '13'
    - regexp: '3[12]/tclwebkit'
      version: '12'
    - regexp: '30/tclwebkit'
      version: '11'
    - regexp: '29/tclwebkit'
      version: '10'
```

この構成は、正規表現ツリーのノードのリストで構成されます。各ノードは次の構造を持ちます。

* **regexp**: ノードの正規表現。
* **attributes**: ユーザー定義の Dictionary 属性のリスト。この例には 2 つの属性 `name` と `version` があります。最初のノードは両方の属性を定義します。2 番目のノードは属性 `name` のみを定義します。属性 `version` は 2 番目のノードの子ノードによって与えられます。
  * 属性の値には、マッチした正規表現のキャプチャグループを参照する **バックリファレンス** を含めることができます。この例では、最初のノードにおける属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` へのバックリファレンス `\1` から構成されています。バックリファレンス番号は 1 から 9 までで、`$1` または `\1`（番号 1 の場合）のように記述します。バックリファレンスは、クエリ実行時にマッチしたキャプチャグループで置き換えられます。
* **child nodes**: regexp ツリーノードの子のリストで、それぞれが独自の属性と（場合によっては）子ノードを持ちます。文字列のマッチングは深さ優先で行われます。文字列が regexp ノードにマッチした場合、Dictionary はそのノードの子ノードにもマッチするかどうかを確認します。マッチする場合は、最も深い位置でマッチしたノードの属性が割り当てられます。子ノードの属性は、同名の親ノードの属性を上書きします。YAML ファイル内での子ノード名は、前述の例の `versions` のように任意に指定できます。

正規表現ツリー Dictionary には、`dictGet`、`dictGetOrDefault`、`dictGetAll` 関数からのみアクセスできます。

例:

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

結果:

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

この場合、まず最上位レイヤーの第 2 ノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` にマッチさせます。その後 Dictionary はさらに子ノードを探索し、文字列が `3[12]/tclwebkit` にもマッチすることを検出します。結果として、属性 `name` の値は（第 1 レイヤーで定義されている）`Android` となり、属性 `version` の値は（子ノードで定義されている）`12` となります。

強力な YAML 設定ファイルを用いることで、regexp tree dictionaries をユーザーエージェント文字列パーサーとして使用できます。[uap-core](https://github.com/ua-parser/uap-core) をサポートしており、機能テスト [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) でその使用方法を示しています。

#### 属性値の収集 {#collecting-attribute-values}

場合によっては、葉ノードの値だけでなく、マッチした複数の正規表現から値を返せると便利なことがあります。このようなケースでは、専用の [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictGetAll) 関数を使用できます。あるノードが型 `T` の属性値を持つ場合、`dictGetAll` は 0 個以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチ数には上限がありません。上限は、`dictGetAll` に対するオプションの第 4 引数として指定できます。配列は *トポロジカル順* で埋められます。つまり、子ノードが親ノードより前に来て、兄弟ノードは元の定義内の順序に従います。

例:

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    tag String,
    topological_index Int64,
    captured Nullable(String),
    parent String
)
PRIMARY KEY(regexp)
SOURCE(YAMLRegExpTree(PATH '/var/lib/clickhouse/user_files/regexp_tree.yaml'))
LAYOUT(regexp_tree)
LIFETIME(0)
```

```yaml
# /var/lib/clickhouse/user_files/regexp_tree.yaml
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouse Documentation'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'Documentation'
  topological_index: 2

- regexp: 'github.com'
  tag: 'GitHub'
  topological_index: 3
  captured: 'NULL'
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

結果：

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### マッチングモード {#matching-modes}

パターンマッチングの動作は、特定の Dictionary の設定によって変更できます。

- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを行います（デフォルトは `false`）。個々の正規表現内で `(?i)` および `(?-i)` を用いて上書きできます。
- `regexp_dict_flag_dotall`: `.` が改行文字にもマッチするようにします（デフォルトは `false`）。

### ClickHouse Cloud で Regular Expression Tree Dictionary を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースは ClickHouse オープンソース版では動作しますが、ClickHouse Cloud では動作しません。ClickHouse で regexp tree dictionaries を使用するには、まず ClickHouse オープンソース版でローカルの YAML ファイルから regexp tree dictionary を作成し、その後 `dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用して、この dictionary を CSV ファイルに書き出します。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSV ファイルの内容は次のとおりです。

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプしたファイルのスキーマは次のとおりです:

* `id UInt64`: RegexpTree ノードの ID。
* `parent_id UInt64`: ノードの親の ID。
* `regexp String`: 正規表現文字列。
* `keys Array(String)`: ユーザー定義属性の名前。
* `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloud で Dictionary を作成するには、まず次のテーブル構造を持つ `regexp_dictionary_source_table` テーブルを作成します:

```sql
CREATE TABLE regexp_dictionary_source_table
(
    id UInt64,
    parent_id UInt64,
    regexp String,
    keys   Array(String),
    values Array(String)
) ENGINE=Memory;
```

次に、ローカルの CSV を次のように更新します。

```bash
clickhouse client \
    --host MY_HOST \
    --secure \
    --password MY_PASSWORD \
    --query "
    INSERT INTO regexp_dictionary_source_table
    SELECT * FROM input ('id UInt64, parent_id UInt64, regexp String, keys Array(String), values Array(String)')
    FORMAT CSV" < regexp_dict.csv
```

詳しくは [Insert Local Files](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルを初期化した後、テーブルソースごとに RegexpTree を作成できます。

```sql
CREATE DICTIONARY regexp_dict
(
    regexp String,
    name String,
    version String
PRIMARY KEY(regexp)
SOURCE(CLICKHOUSE(TABLE 'regexp_dictionary_source_table'))
LIFETIME(0)
LAYOUT(regexp_tree);
```

## Embedded Dictionaries {#embedded-dictionaries}

<SelfManaged />

ClickHouse には、ジオベースを扱うための組み込み機能が含まれています。

これにより、次のことが可能になります:

- リージョンの ID を使用して、任意の言語でその名前を取得する。
- リージョンの ID を使用して、都市、地域、連邦管区、国、または大陸の ID を取得する。
- あるリージョンが別のリージョンに属しているかどうかを確認する。
- 親リージョンのチェーンを取得する。

すべての関数は、「translocality」に対応しており、地域の帰属関係について異なる見方を同時に扱うことができます。詳細については、「web analytics dictionaries を扱うための関数」のセクションを参照してください。

内部 Dictionary は、デフォルトのパッケージでは無効になっています。
有効にするには、サーバー設定ファイル内の `path_to_regions_hierarchy_file` と `path_to_regions_names_files` のパラメータのコメントを解除します。

ジオベースはテキストファイルから読み込まれます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータには `regions_hierarchy.txt` ファイル (デフォルトのリージョン階層) へのパスを指定する必要があり、その他のファイル (`regions_hierarchy_ua.txt` など) も同じディレクトリ内に配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルを自分で作成することもできます。ファイル形式は次のとおりです:

`regions_hierarchy*.txt`: TabSeparated (ヘッダなし)、カラム:

- リージョン ID (`UInt32`)
- 親リージョン ID (`UInt32`)
- リージョンタイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦管区、5 - 地域、6 - 都市; それ以外の値は使用されません
- 人口 (`UInt32`) — 省略可能なカラム

`regions_names_*.txt`: TabSeparated (ヘッダなし)、カラム:

- リージョン ID (`UInt32`)
- リージョン名 (`String`) — タブや改行を含めることはできません。エスケープされていても不可です。

RAM に保存するためにフラットな配列が使用されます。このため、ID は 100 万を超えないようにする必要があります。

Dictionary は、サーバーを再起動せずに更新できます。ただし、利用可能な Dictionary の集合自体は更新されません。
更新の際には、ファイルの更新時刻がチェックされます。ファイルが変更されている場合、その Dictionary が更新されます。
変更のチェック間隔は `builtin_dictionaries_reload_interval` パラメータで設定します。
(初回利用時の読み込みを除く) Dictionary の更新はクエリをブロックしません。更新中、クエリは古いバージョンの Dictionary を使用します。更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは引き続き古いバージョンの Dictionary を使用します。

ジオベースを含む Dictionary は、定期的に更新することを推奨します。更新時には、新しいファイルを生成し、別の場所に書き出します。すべての準備が整ったら、それらをサーバーが使用するファイル名にリネームします。

OS 識別子や検索エンジンを扱うための関数も存在しますが、使用しないでください。