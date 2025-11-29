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

# 辞書 {#dictionaries}

辞書は、さまざまな種類の参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouse は、クエリで使用できる辞書を扱うための特殊な関数をサポートしています。参照テーブルとの `JOIN` を使うよりも、関数と辞書を組み合わせて使用する方が簡単かつ効率的です。

ClickHouse は次の機能をサポートしています:

- [一連の関数](../../sql-reference/functions/ext-dict-functions.md)を備えた辞書。
- 特定の[一連の関数](../../sql-reference/functions/embedded-dict-functions.md)を持つ[組み込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouse の辞書の使い方を始める場合は、このトピックを扱ったチュートリアルがあります。[こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースには、ClickHouse テーブル、ローカルのテキストファイルまたは実行可能ファイル、HTTP(s) リソース、別の DBMS などを使用できます。詳細については、「[Dictionary Sources](#dictionary-sources)」を参照してください。

ClickHouse では次のことが可能です:

- 辞書を RAM に全体または一部保存します。
- 辞書を定期的に更新し、欠落している値を動的にロードします。言い換えると、辞書は動的にロード可能です。
- XML ファイルまたは [DDL クエリ](../../sql-reference/statements/create/dictionary.md)で辞書を作成できます。

辞書の設定は 1 つ以上の XML ファイルに配置できます。設定ファイルへのパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) パラメータで指定します。

辞書は、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 設定に応じて、サーバー起動時または初回利用時にロードできます。

[dictionaries](/operations/system-tables/dictionaries) システムテーブルには、サーバーで構成されている辞書に関する情報が含まれています。各辞書について、次の情報を確認できます:

- 辞書のステータス。
- 設定パラメータ。
- 辞書に割り当てられた RAM の使用量や、辞書が正常にロードされてからのクエリ数などのメトリクス。

<CloudDetails />

## DDL クエリによる辞書の作成 {#creating-a-dictionary-with-a-ddl-query}

辞書は [DDL クエリ](../../sql-reference/statements/create/dictionary.md) で作成でき、この方法が推奨されます。DDL で作成された辞書には次の利点があります。
- サーバーの設定ファイルに追加のレコードを追記する必要がありません。
- テーブルやビューと同様に、第一級オブジェクトとして辞書を扱うことができます。
- 辞書テーブル関数ではなく、慣れ親しんだ SELECT を用いてデータを直接読み取ることができます。SELECT 文で辞書に直接アクセスする場合、キャッシュ型の辞書はキャッシュされているデータのみを返し、非キャッシュ型の辞書は格納しているすべてのデータを返す点に注意してください。
- 辞書は簡単に名前を変更できます。

## 設定ファイルによる辞書の作成 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
設定ファイルによる辞書の作成は ClickHouse Cloud ではサポートされていません。DDL（上記参照）を使用し、ユーザー `default` で辞書を作成してください。
:::

辞書の設定ファイルは次の形式です。

```xml
<clickhouse>
    <comment>任意の要素。任意の内容を含めることができます。ClickHouseサーバーによって無視されます。</comment>

    <!--任意の要素。置換を含むファイル名-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- ディクショナリの設定 -->
        <!-- 設定ファイルには任意の数のディクショナリセクションを含めることができます。 -->
    </dictionary>

</clickhouse>
```

同じファイル内で任意の数の辞書を[設定](#configuring-a-dictionary)できます。

:::note
`SELECT` クエリで辞書を記述することで、小さな辞書の値を変換できます（[transform](../../sql-reference/functions/other-functions.md) 関数を参照）。この機能は辞書機能とは別物です。
:::

## ディクショナリの設定 {#configuring-a-dictionary}

<CloudDetails />

ディクショナリを XML ファイルで構成する場合、ディクショナリ設定は次のような構造になります。

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複合キー構成 -->
    </structure>

    <source>
      <!-- ソース構成 -->
    </source>

    <layout>
      <!-- メモリレイアウト構成 -->
    </layout>

    <lifetime>
      <!-- ディクショナリのメモリ内保持期間 -->
    </lifetime>
</dictionary>
```

対応する [DDL クエリ](../../sql-reference/statements/create/dictionary.md) の構造は次のとおりです。

```sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複合キーまたは単一キーの構成
SOURCE(...) -- ソースの構成
LAYOUT(...) -- メモリレイアウトの構成
LIFETIME(...) -- メモリ内のディクショナリのライフタイム
```

## メモリ内にディクショナリを保存する {#storing-dictionaries-in-memory}

メモリ上にディクショナリを保存する方法はいくつかあります。

最適な処理速度が得られるため、[flat](#flat)、[hashed](#hashed)、および [complex&#95;key&#95;hashed](#complex_key_hashed) を推奨します。

パフォーマンスが低下する可能性があり、最適なパラメータの選定も難しいため、キャッシュ方式は推奨されません。詳細は [cache](#cache) セクションを参照してください。

ディクショナリのパフォーマンスを改善する方法はいくつかあります。

* `GROUP BY` の後に、ディクショナリを扱う関数を呼び出します。
* 抽出する属性を単射としてマークします。異なるキーが異なる属性値に対応する場合、その属性は単射と呼ばれます。このため、`GROUP BY` でキーから属性値を取得する関数が使われている場合、この関数は自動的に `GROUP BY` の外に出されます。

ClickHouse は、ディクショナリに関連するエラーに対して例外をスローします。代表的なエラーは次のとおりです。

* アクセスしようとしているディクショナリをロードできない。
* `cached` ディクショナリへのクエリでエラーが発生した。

[system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで、ディクショナリの一覧とそのステータスを確認できます。

<CloudDetails />

設定は次のようになります。

```xml
<clickhouse>
    <dictionary>
        ...
        <layout>
            <layout_type>
                <!-- レイアウト設定 -->
            </layout_type>
        </layout>
        ...
    </dictionary>
</clickhouse>
```

対応する [DDL クエリ](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

レイアウトで `complex-key*` が指定されていない辞書はキーに [UInt64](../../sql-reference/data-types/int-uint.md) 型を持ち、`complex-key*` 辞書は複合キー（任意の型を組み合わせた複雑なキー）を持ちます。

XML 辞書における [UInt64](../../sql-reference/data-types/int-uint.md) キーは `<id>` タグで定義されます。

設定例（列 `key_column` の型が UInt64 の場合）:

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合（`complex`）キーを持つ XML 辞書は、`<key>` タグで定義されます。

複合キーの構成例（キーは [String](../../sql-reference/data-types/string.md) 型の要素を 1 つ持ちます）:

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

## メモリ内にディクショナリを格納する方法 {#ways-to-store-dictionaries-in-memory}

ディクショナリデータをメモリに格納するさまざまな方法には、CPU および RAM 使用量とのトレードオフがあります。どのレイアウトを使用するかを決定するための出発点として、ディクショナリに関する [ブログ記事](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse) の [Choosing a Layout](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 節に掲載されている意思決定ツリーが有用です。

* [flat](#flat)
* [hashed](#hashed)
* [sparse&#95;hashed](#sparse_hashed)
* [complex&#95;key&#95;hashed](#complex_key_hashed)
* [complex&#95;key&#95;sparse&#95;hashed](#complex_key_sparse_hashed)
* [hashed&#95;array](#hashed_array)
* [complex&#95;key&#95;hashed&#95;array](#complex_key_hashed_array)
* [range&#95;hashed](#range_hashed)
* [complex&#95;key&#95;range&#95;hashed](#complex_key_range_hashed)
* [cache](#cache)
* [complex&#95;key&#95;cache](#complex_key_cache)
* [ssd&#95;cache](#ssd_cache)
* [complex&#95;key&#95;ssd&#95;cache](#complex_key_ssd_cache)
* [direct](#direct)
* [complex&#95;key&#95;direct](#complex_key_direct)
* [ip&#95;trie](#ip_trie)

### flat {#flat}

ディクショナリはフラットな配列形式でメモリ内に完全に格納されます。ディクショナリはどの程度のメモリを使用するでしょうか。使用量は（メモリ空間上での）最大キーの大きさに比例します。

ディクショナリキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型であり、値（配列の要素数）は `max_array_size`（デフォルトでは 500,000）に制限されます。ディクショナリを作成する際に、これより大きなキーが検出された場合、ClickHouse は例外をスローし、そのディクショナリは作成されません。ディクショナリのフラット配列の初期サイズは、`initial_array_size` 設定（デフォルトでは 1024）によって制御されます。

すべての種類のソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）はすべて読み込まれます。

この方法は、利用可能なディクショナリ格納方法の中で最も高いパフォーマンスを提供します。

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

辞書はハッシュテーブル形式で、すべてメモリ上に格納されます。辞書には任意の識別子を持つ要素をいくつでも含めることができます。実際には、キーの数が数千万件に達することもあります。

辞書キーの型は [UInt64](../../sql-reference/data-types/int-uint.md) です。

あらゆる種類のソースがサポートされています。更新時には、ファイルまたはテーブルからのデータがすべて読み込まれます。

構成例:

```xml
<layout>
  <hashed />
</layout>
```

または

```sql
LAYOUT(HASHED())
```

設定例：

```xml
<layout>
  <hashed>
    <!-- shardsが1より大きい場合(デフォルトは`1`)、ディクショナリはデータを並列ロードします。
         1つのディクショナリに大量の要素がある場合に有用です。 -->
    <shards>10</shards>

    <!-- 並列キュー内のブロックのバックログサイズ。

         並列ロードのボトルネックはrehashであるため、スレッドがrehashを実行している間の
         停滞を回避するには、ある程度のバックログが必要です。

         10000はメモリと速度の適切なバランスです。
         10e10個の要素でも、スタベーションなしにすべての負荷を処理できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大ロードファクター。値が大きいほど、メモリはより効率的に
         利用されます(メモリの無駄が少ない)が、読み取り/パフォーマンスが
         低下する可能性があります。

         有効な値: [0.5, 0.99]
         デフォルト: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse&#95;hashed {#sparse_hashed}

`hashed` に似ていますが、より多くの CPU 資源を消費する代わりに、メモリ使用量を抑えます。

辞書キーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

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

この種の辞書では `shards` を使用することも可能です。`sparse_hashed` は `hashed` よりも遅いため、`shards` の使用は `hashed` の場合よりも `sparse_hashed` の場合のほうが重要です。

### complex&#95;key&#95;hashed {#complex_key_hashed}

このストレージタイプは複合[キー](#dictionary-key-and-fields)用です。`hashed` と同様です。

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

このストレージタイプは、複合 [キー](#dictionary-key-and-fields) を持つ辞書で使用します。[sparse&#95;hashed](#sparse_hashed) と類似しています。

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

辞書は全体がメモリ上に保持されます。各属性は配列として格納されます。キー属性は、値が属性配列内のインデックスとなるハッシュテーブルの形式で保存されます。辞書には、任意の識別子を持つ任意数の要素を含めることができます。実運用では、キーの数が数千万件に達することがあります。

辞書キーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

あらゆる種類のソースをサポートします。更新時には、（ファイルまたはテーブルからの）データ全体が読み込まれます。

設定例:

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するものです。[hashed&#95;array](#hashed_array)と同様です。

設定例：

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

辞書は、範囲とそれに対応する値の順序付き配列を持つハッシュテーブルの形式でメモリ内に保存されます。

辞書キーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。
このストレージ方式は `hashed` と同様に動作し、キーに加えて日付/時刻（任意の数値型）の範囲を使用することができます。

例: テーブルには、各広告主ごとの割引が次の形式で含まれています。

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲を対象としたサンプルを使用するには、[構造](#dictionary-key-and-fields)内で `range_min` と `range_max` 要素を定義します。これらの要素には `name` と `type` フィールドを含める必要があります（`type` が指定されていない場合、デフォルトの型である Date が使用されます）。`type` には任意の数値型（Date / DateTime / UInt64 / Int32 / その他）を指定できます。

:::note
`range_min` と `range_max` の値は `Int64` 型に収まる必要があります。
:::

例：

```xml
<layout>
    <range_hashed>
        <!-- 重複範囲の処理方法 (min/max)。デフォルト: min (range_min から range_max の最小値を持つ一致範囲を返す) -->
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

これらのディクショナリを使用するには、範囲を指定するための追加の引数を `dictGet` 関数に渡す必要があります。

```sql
dictGet('dict_name', 'attr_name', id, date)
```

クエリ例:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された `id` に対して、渡された日付を含む日付範囲に対応する値を返します。

アルゴリズムの詳細:

* `id` が見つからない場合、またはその `id` に対する範囲が見つからない場合、属性型のデフォルト値を返します。
* 範囲が重複していて `range_lookup_strategy=min` の場合、一致する範囲のうち `range_min` が最小のものを返し、さらに複数の範囲が見つかった場合は、その中から `range_max` が最小の範囲を返し、それでもなお複数の範囲がある場合（複数の範囲が同じ `range_min` と `range_max` を持つ場合）は、それらの中からランダムに 1 つの範囲を返します。
* 範囲が重複していて `range_lookup_strategy=max` の場合、一致する範囲のうち `range_min` が最大のものを返し、さらに複数の範囲が見つかった場合は、その中から `range_max` が最大の範囲を返し、それでもなお複数の範囲がある場合（複数の範囲が同じ `range_min` と `range_max` を持つ場合）は、それらの中からランダムに 1 つの範囲を返します。
* `range_max` が `NULL` の場合、その範囲は開区間です。`NULL` は取り得る最大値として扱われます。`range_min` については、開区間値として `1970-01-01` または `0` (-MAX&#95;INT) を使用できます。

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

重複する範囲と開区間を含む設定例：

```sql
CREATE TABLE discounts
(
    advertiser_id UInt64,
    discount_start_date Date,
    discount_end_date Nullable(Date),
    amount Float64
)
ENGINE = Memory;
```

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
│ 0.1 │ -- 一致する範囲は1つだけ: 2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 2つの範囲がマッチしており、range_min 2015-01-15 (0.2) は 2015-01-01 (0.1) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 2つの範囲がマッチしており、range_min 2015-01-04 (0.4) は 2015-01-01 (0.3) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 2つの範囲がマッチしており、range_min は同じで、2015-01-15 (0.5) は 2015-01-10 (0.6) より大きい
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
│ 0.1 │ -- 一致する範囲は1つだけ: 2015-01-01 - Null
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 1, toDate(&#39;2015-01-16&#39;)) res;
┌─res─┐
│ 0.1 │ -- 2つの範囲が一致しており、range&#95;min 2015-01-01 (0.1) は 2015-01-15 (0.2) より小さい
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 2, toDate(&#39;2015-01-06&#39;)) res;
┌─res─┐
│ 0.3 │ -- 2つの範囲が一致しており、range&#95;min 2015-01-01 (0.3) は 2015-01-04 (0.4) より小さい
└─────┘

select dictGet(&#39;discounts&#95;dict&#39;, &#39;amount&#39;, 3, toDate(&#39;2015-01-01&#39;)) res;
┌─res─┐
│ 0.6 │ -- 2つの範囲が一致しており、range&#95;min は等しく、2015-01-10 (0.6) は 2015-01-15 (0.5) より小さい
└─────┘

````

### complex_key_range_hashed {#complex_key_range_hashed}

ディクショナリは、範囲の順序付き配列とそれに対応する値を持つハッシュテーブルの形式でメモリに格納されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。

設定例：

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
````

### cache {#cache}

辞書は固定数のセルを持つキャッシュ内に格納されます。これらのセルには頻繁に使用される要素が含まれます。

辞書キーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

辞書を参照する際には、まずキャッシュが検索されます。各データブロックに対して、キャッシュに存在しない、または期限切れのすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)` を使ってソースから要求されます。受信したデータはその後キャッシュに書き込まれます。

辞書内にキーが見つからない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates` の設定で制御できます。

キャッシュ辞書では、キャッシュ内データの有効期限 [lifetime](#refreshing-dictionary-data-using-lifetime) を設定できます。あるセルにデータを読み込んでから `lifetime` を超える時間が経過している場合、そのセルの値は使用されず、キーは期限切れと見なされます。そのキーは次回使用が必要になったときに再要求されます。この動作は `allow_read_expired_keys` 設定で構成できます。

これは、辞書を保存するすべての方法の中で最も非効率的な方法です。キャッシュの速度は、適切な設定と使用シナリオに大きく依存します。キャッシュ型辞書は、ヒット率が十分に高い場合（推奨は 99% 以上）にのみ高い性能を発揮します。平均ヒット率は [system.dictionaries](../../operations/system-tables/dictionaries.md) テーブルで確認できます。

`allow_read_expired_keys` 設定が 1（デフォルトは 0）に設定されている場合、辞書は非同期更新をサポートできます。クライアントがキーを要求し、そのすべてがキャッシュ内に存在するが一部が期限切れである場合、辞書はクライアントに対して期限切れのキーを返し、ソースからそれらを非同期に要求します。

キャッシュ性能を向上させるには、`LIMIT` を伴うサブクエリを使用し、辞書を参照する関数はサブクエリの外側で呼び出してください。

すべての種類のソースがサポートされています。

設定例:

```xml
<layout>
    <cache>
        <!-- キャッシュのサイズ(セル数単位)。2の累乗に切り上げられます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 有効期限切れキーの読み取りを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 更新タスクをキューへプッシュする際の最大タイムアウト(ミリ秒単位)。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクの完了待機時の最大タイムアウト(ミリ秒単位)。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- キャッシュディクショナリ更新の最大スレッド数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

```sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分に大きなキャッシュサイズを設定します。セル数は実際に試しながら決定する必要があります。

1. ある値を設定する。
2. キャッシュが完全に埋まるまでクエリを実行する。
3. `system.dictionaries` テーブルを使用してメモリ使用量を確認する。
4. 目的のメモリ使用量に達するまでセル数を増減する。

:::note
ランダムリードを伴うクエリの処理が遅いため、ClickHouse をソースとして使用しないでください。
:::

### complex&#95;key&#95;cache {#complex_key_cache}

この種類のストレージは、複合[キー](#dictionary-key-and-fields)用に使用します。`cache` と同様です。

### ssd&#95;cache {#ssd_cache}

`cache` と同様ですが、データを SSD に、インデックスを RAM に保存します。更新キューに関連するすべてのキャッシュディクショナリ設定は、SSD キャッシュディクショナリにも適用できます。

ディクショナリキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

```xml
<layout>
    <ssd_cache>
        <!-- 基本読み取りブロックのサイズ(バイト単位)。SSDのページサイズと同じ値に設定することを推奨します。 -->
        <block_size>4096</block_size>
        <!-- キャッシュファイルの最大サイズ(バイト単位)。 -->
        <file_size>16777216</file_size>
        <!-- SSDから要素を読み取る際に使用するRAMバッファのサイズ(バイト単位)。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSDへフラッシュする前に要素を集約するためのRAMバッファのサイズ(バイト単位)。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルの保存先パス。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

または

```sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex&#95;key&#95;ssd&#95;cache {#complex_key_ssd_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)用に使用します。`ssd_cache` と同様です。

### direct {#direct}

このディクショナリはメモリ上には保持されず、リクエストの処理中にソースへ直接アクセスします。

ディクショナリキーは [UInt64](../../sql-reference/data-types/int-uint.md) 型です。

ローカルファイルを除くすべての種類の[ソース](#dictionary-sources)がサポートされています。

構成例:

```xml
<layout>
  <direct />
</layout>
```

または

```sql
LAYOUT(DIRECT())
```

### complex&#95;key&#95;direct {#complex_key_direct}

この種類のストレージは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。`direct` と同様です。

### ip&#95;trie {#ip_trie}

このディクショナリは、ネットワークプレフィックスによる IP アドレス検索向けに設計されています。IP アドレスの範囲を CIDR 表記で保持し、ある IP がどのプレフィックス（例: サブネットまたは ASN 範囲）に属するかを高速に判定できるため、ジオロケーションやネットワーク分類などの IP ベースの検索に最適です。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="ip_trie ディクショナリを用いた IP ベース検索" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

**例**

ClickHouse に、IP プレフィックスとその対応付けを保持するテーブルがあるとします。

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

このテーブル用に `ip_trie` 辞書を定義しましょう。`ip_trie` レイアウトでは複合キーが必要です。

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
        <!-- キー属性 `prefix` は dictGetString 経由で取得可能です。 -->
        <!-- このオプションを有効にするとメモリ使用量が増加します。 -->
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

キーは、許可された IP プレフィックスを含む `String` 型属性を 1 つだけ持つ必要があります。他の型はまだサポートされていません。

構文は次のとおりです。

```sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4 の場合は `UInt32`、IPv6 の場合は `FixedString(16)` を受け取ります。例：

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

他の型はまだサポートされていません。この関数は、この IP アドレスに対応するプレフィックスに対する属性を返します。プレフィックスが重複している場合、最も特定度の高いものが返されます。

データは完全に RAM に収まっている必要があります。

## LIFETIME を使用したディクショナリデータの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouse は `LIFETIME` タグ（秒単位で指定）に基づいて定期的にディクショナリを更新します。`LIFETIME` は、完全にダウンロードされるディクショナリに対する更新間隔であり、キャッシュ型ディクショナリに対する無効化間隔です。

更新中も、ディクショナリの古いバージョンに対してクエリを実行できます。ディクショナリの更新（初回のディクショナリ読み込み時を除く）はクエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは古いバージョンのディクショナリを使用して引き続き実行されます。ディクショナリの更新が成功すると、ディクショナリの古いバージョンはアトミックに置き換えられます。

設定例:

<CloudDetails />

```xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

または

```sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>`（`LIFETIME(0)`）を設定すると、ディクショナリは更新されません。

更新の時間間隔を指定でき、その範囲内から ClickHouse が一様分布に従うランダムな時刻を選択します。これは、多数のサーバーで更新を行う際に、ディクショナリのソースへの負荷を分散するために必要です。

設定例：

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

または

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>` と `<max>0</max>` の場合、ClickHouse はタイムアウトによるディクショナリの再読み込みを行いません。
この場合でも、ディクショナリ設定ファイルが変更されたり、`SYSTEM RELOAD DICTIONARY` コマンドが実行された場合には、ClickHouse はタイムアウトを待たずにディクショナリを再読み込みできます。

ディクショナリを更新する際、ClickHouse サーバーは [source](#dictionary-sources) の種類に応じて異なるロジックを適用します。

* テキストファイルソースの場合は、更新時刻を確認します。更新時刻が以前に記録された時刻と異なる場合、ディクショナリが更新されます。
* その他のソースからのディクショナリは、デフォルトで毎回更新されます。

その他のソース（ODBC、PostgreSQL、ClickHouse など）の場合、毎回ではなく、実際に変更があったときだけディクショナリを更新するクエリを設定できます。そのためには、次の手順に従います。

* ディクショナリのテーブルには、ソースデータが更新されるたびに必ず変化するフィールドが必要です。
* ソースの設定では、その変化するフィールドを取得するクエリを指定する必要があります。ClickHouse サーバーは、このクエリの結果を 1 行のレコードとして解釈し、このレコードが以前の状態と比べて変化していればディクショナリを更新します。[source](#dictionary-sources) の設定内の `<invalidate_query>` フィールドにクエリを指定します。

設定例：

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

または

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、`SSDComplexKeyCache` 辞書では、同期更新と非同期更新の両方がサポートされています。

また、`Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed` 辞書では、前回の更新以降に変更されたデータのみを要求することも可能です。辞書のソース構成の一部として `update_field` が指定されている場合、秒単位の前回更新時刻の値がデータリクエストに追加されます。ソースタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、ODBC）に応じて、外部ソースからデータをリクエストする前に `update_field` に対して異なるロジックが適用されます。

* ソースが HTTP の場合、`update_field` はクエリパラメータとして追加され、その値には最後の更新時刻が設定されます。
* ソースが Executable の場合、`update_field` は実行可能ファイルのスクリプト引数として追加され、その値には最後の更新時刻が設定されます。
* ソースが ClickHouse、MySQL、PostgreSQL、ODBC の場合、`update_field` が最後の更新時刻以上かどうかを比較する追加の `WHERE` 句が追加されます。
  * デフォルトでは、この `WHERE` 条件は SQL クエリの最上位レベルでチェックされます。代わりに、クエリ内の他の任意の `WHERE` 句で `{condition}` キーワードを使用して条件をチェックすることもできます。例:
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

`update_field` オプションが設定されている場合、追加オプションとして `update_lag` を設定できます。`update_lag` オプションの値は、更新されたデータを要求する前に前回の更新時刻から差し引かれます。

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

## 辞書ソース {#dictionary-sources}

<CloudDetails />

辞書は、さまざまなソースから ClickHouse に接続して利用できます。

辞書を XML ファイルで構成する場合、設定は次のようになります。

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- ソースの設定 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDL クエリ](../../sql-reference/statements/create/dictionary.md) の場合、上記の設定は次のようになります。

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソースの設定
...
```

`source` セクションでソースが設定されます。

ソースタイプ [Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse) では、
オプション設定が利用可能です。

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

ソース種別 (`source_type`):

* [ローカルファイル](#local-file)
* [実行ファイル](#executable-file)
* [実行ファイルプール](#executable-pool)
* [HTTP(S)](#https)
* DBMS
  * [ODBC](#odbc)
  * [MySQL](#mysql)
  * [ClickHouse](#clickhouse)
  * [MongoDB](#mongodb)
  * [Redis](#redis)
  * [Cassandra](#cassandra)
  * [PostgreSQL](#postgresql)

### ローカルファイル {#local-file}

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

設定項目:

* `path` – ファイルへの絶対パス。
* `format` – ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされます。

DDL コマンド（`CREATE DICTIONARY ...`）でソースが `FILE` の辞書を作成する場合、ClickHouse ノード上の任意のファイルへ DB ユーザーがアクセスできないようにするため、ソースファイルは `user_files` ディレクトリ内に配置する必要があります。

**関連項目**

* [Dictionary function](/sql-reference/table-functions/dictionary)

### Executable File {#executable-file}

実行可能ファイルの扱いは、[辞書をメモリにどのように格納するか](#storing-dictionaries-in-memory)によって異なります。辞書が `cache` および `complex_key_cache` を使用して格納されている場合、ClickHouse は必要なキーを実行可能ファイルの STDIN にリクエストを送信して問い合わせます。そうでない場合、ClickHouse は実行可能ファイルを起動し、その出力を辞書データとして扱います。

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

フィールドの設定：

* `command` — 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが `PATH` に含まれている場合）。
* `format` — ファイル形式。[Formats](/sql-reference/formats) で説明されているすべての形式がサポートされています。
* `command_termination_timeout` — 実行可能スクリプトには、メインの読み書きループを含める必要があります。辞書が破棄されるとパイプはクローズされ、子プロセスに SIGTERM シグナルを送信する前に、実行可能ファイルにはシャットダウンのための `command_termination_timeout` 秒が与えられます。`command_termination_timeout` は秒単位で指定します。デフォルト値は 10 です。省略可能なパラメータです。
* `command_read_timeout` - コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は 10000 です。省略可能なパラメータです。
* `command_write_timeout` - コマンドの stdin にデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は 10000 です。省略可能なパラメータです。
* `implicit_key` — 実行可能なソースファイルは値のみを返すことができ、要求されたキーとの対応関係は、結果の行の順序によって暗黙的に決定されます。デフォルト値は false です。
* `execute_direct` - `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user&#95;scripts フォルダ内から検索されます。追加のスクリプト引数は空白文字区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `0` です。省略可能なパラメータです。
* `send_chunk_header` - データチャンクを処理に送信する前に行数を送るかどうかを制御します。省略可能です。デフォルト値は `false` です。

この辞書ソースは XML 設定でのみ構成できます。実行可能ソースを持つ辞書を DDL 経由で作成することは無効化されています。そうでない場合、DB ユーザーが ClickHouse ノード上で任意のバイナリを実行できてしまうためです。

### Executable Pool {#executable-pool}

Executable pool を使用すると、プロセスプールからデータを読み込むことができます。このソースは、ソースからすべてのデータを読み込む必要がある辞書レイアウトでは動作しません。Executable pool は、辞書が `cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または `complex_key_direct` レイアウトを使用して[保存されている](#ways-to-store-dictionaries-in-memory)場合に動作します。

Executable pool は、指定されたコマンドでプロセスプールを起動し、それらが終了するまで実行し続けます。プログラムは、利用可能な間は STDIN からデータを読み込み、結果を STDOUT に出力する必要があります。また、STDIN 上の次のデータブロックを待機することもできます。ClickHouse はデータブロックの処理後に STDIN をクローズせず、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトはこのデータ処理方式に対応している必要があります。つまり、STDIN をポーリングし、早期に STDOUT にデータをフラッシュするようにしてください。

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

フィールドの設定：

* `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムのディレクトリが `PATH` に通っている場合）。
* `format` — ファイル形式。「[Formats](/sql-reference/formats)」で説明されているすべてのフォーマットがサポートされます。
* `pool_size` — プールサイズ。`pool_size` として 0 が指定された場合、プールサイズに制限はありません。デフォルト値は `16` です。
* `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含んでいる必要があります。辞書が破棄された後はパイプがクローズされ、実行可能ファイルにはシャットダウンのために `command_termination_timeout` 秒が与えられます。その時間が過ぎると、ClickHouse は子プロセスに SIGTERM シグナルを送信します。秒単位で指定します。デフォルト値は 10 です。オプションのパラメータです。
* `max_command_execution_time` — データブロックを処理するための、実行可能スクリプトコマンドの最大実行時間。秒単位で指定します。デフォルト値は 10 です。オプションのパラメータです。
* `command_read_timeout` - コマンドの stdout からデータを読み取るためのタイムアウト（ミリ秒）。デフォルト値は 10000 です。オプションのパラメータです。
* `command_write_timeout` - コマンドの stdin にデータを書き込むためのタイムアウト（ミリ秒）。デフォルト値は 10000 です。オプションのパラメータです。
* `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は、結果内の行の順序によって暗黙的に決定されます。デフォルト値は false です。オプションのパラメータです。
* `execute_direct` - `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](../../operations/server-configuration-parameters/settings.md#user_scripts_path) で指定された user&#95;scripts フォルダ内から検索されます。追加のスクリプト引数は空白区切りで指定できます。例: `script_name arg1 arg2`。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1` です。オプションのパラメータです。
* `send_chunk_header` - データチャンクを処理のために送信する前に、先に行数を送信するかどうかを制御します。オプションです。デフォルト値は `false` です。

この辞書ソースは XML 設定によってのみ構成できます。実行可能ソースを持つ辞書を DDL で作成することは無効化されています。そうしないと、DB ユーザーが ClickHouse ノード上で任意のバイナリを実行できてしまうためです。

### HTTP(S) {#https}

HTTP(S) サーバーとの動作は、[辞書がメモリ上にどのように保存されるか](#storing-dictionaries-in-memory) に依存します。辞書が `cache` および `complex_key_cache` を使って保存されている場合、ClickHouse は `POST` メソッドでリクエストを送信し、必要なキーを問い合わせます。

設定の例:

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

ClickHouse が HTTPS リソースにアクセスできるようにするには、サーバー構成で [OpenSSL を設定](../../operations/server-configuration-parameters/settings.md#openssl)する必要があります。

設定フィールド:

* `url` – 取得元の URL。
* `format` – ファイルフォーマット。「[Formats](/sql-reference/formats)」で説明されているすべてのフォーマットがサポートされています。
* `credentials` – Basic HTTP 認証。省略可能なパラメータです。
* `user` – 認証に必要なユーザー名。
* `password` – 認証に必要なパスワード。
* `headers` – HTTP リクエストで使用されるカスタム HTTP ヘッダーエントリの一覧。省略可能なパラメータです。
* `header` – 単一の HTTP ヘッダーエントリ。
* `name` – リクエストで送信されるヘッダーに使用される識別子名。
* `value` – 特定の識別子名に対して設定される値。

DDL コマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成する際、HTTP 辞書のリモートホストは、データベースユーザーが任意の HTTP サーバーへアクセスすることを防ぐために、設定ファイルの `remote_url_allow_hosts` セクションの内容と照合されます。

### DBMS {#dbms}

#### ODBC {#odbc}

ODBC ドライバーを持つ任意のデータベースに接続するために、この方法を使用できます。

設定例:

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

* `db` – データベース名。`<connection_string>` パラメータでデータベース名が設定されている場合は省略します。
* `table` – テーブル名および（存在する場合は）スキーマ名。
* `connection_string` – 接続文字列。
* `invalidate_query` – 辞書のステータスを確認するためのクエリ。任意のパラメータです。詳細は [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。
* `background_reconnect` – 接続失敗時にバックグラウンドでレプリカへ再接続します。任意のパラメータです。
* `query` – カスタムクエリ。任意のパラメータです。

:::note
`table` フィールドと `query` フィールドは同時に使用できません。また、`table` または `query` のいずれか一方のフィールドは必ず宣言する必要があります。
:::

ClickHouse は ODBC ドライバーから引用記号を受け取り、ドライバーへのクエリ内のすべての設定を引用するため、データベース内のテーブル名の大文字・小文字に合わせてテーブル名を設定する必要があります。

Oracle を使用している際にエンコーディングの問題が発生する場合は、該当する [FAQ](/knowledgebase/oracle-odbc) を参照してください。

##### ODBC Dictionary 機能における既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBC ドライバーを介してデータベースに接続する際、接続パラメータ `Servername` が置き換えられる可能性があります。この場合、`odbc.ini` の `USERNAME` と `PASSWORD` の値がリモートサーバーに送信され、漏えいするおそれがあります。
:::

**安全でない使用例**

PostgreSQL 用に unixODBC を設定してみます。`/etc/odbc.ini` の内容:

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

その後、たとえば次のようなクエリを実行すると

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBC ドライバーは、`odbc.ini` に記載された `USERNAME` と `PASSWORD` の値を `some-server.com` に送信します。

##### PostgreSQL への接続例 {#example-of-connecting-postgresql}

Ubuntu OS 上で。

unixODBC と PostgreSQL 用 ODBC ドライバーをインストールします:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（または、ClickHouse を実行するユーザーとしてサインインしている場合は `~/.odbc.ini`）の設定:

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

ClickHouse における辞書の設定：

```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- connection_string では以下のパラメータを指定できます: -->
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

`odbc.ini` を編集して、ドライバーを含むライブラリへのフルパス `DRIVER=/usr/local/lib/psqlodbcw.so` を指定する必要がある場合があります。

##### MS SQL Server への接続例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQL Server へ接続するための ODBC ドライバーのインストール：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーの構成:

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # TDS接続のテスト
    $ sqsh -S MSSQL -D database -U user -P password


    $ cat /etc/odbcinst.ini

    [FreeTDS]
    Description     = FreeTDS
    Driver          = /usr/lib/x86_64-linux-gnu/odbc/libtdsodbc.so
    Setup           = /usr/lib/x86_64-linux-gnu/odbc/libtdsS.so
    FileUsage       = 1
    UsageCount      = 5

    $ cat /etc/odbc.ini
    # $ cat ~/.odbc.ini # ClickHouseを実行するユーザーでログインしている場合

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (オプション) ODBC接続のテスト (isqlツールを使用する場合は[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストール)
    $ isql -v MSSQL "user" "password"
```

備考:

* 特定の SQL Server バージョンでサポートされている最も古い TDS バージョンを確認するには、製品ドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a) を確認してください

ClickHouse でディクショナリを設定するには:

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

設定例：

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

フィールドの設定:

* `port` – MySQL サーバーのポート。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `user` – MySQL ユーザー名。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `password` – MySQL ユーザーのパスワード。すべてのレプリカに対して指定することも、各レプリカごと（`<replica>` 内）に個別に指定することもできます。

* `replica` – レプリカ設定セクション。複数のセクションを定義できます。

  * `replica/host` – MySQL のホスト。
  * `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouse は優先度の順にレプリカを試行します。数値が小さいほど優先度が高くなります。

* `db` – データベース名。

* `table` – テーブル名。

* `where` – 抽出条件。条件の構文は、MySQL の `WHERE` 句と同じです。例: `id > 10 AND id < 20`。省略可能なパラメータです。

* `invalidate_query` – 辞書の状態を確認するためのクエリ。省略可能なパラメータです。詳細は [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。

* `fail_on_connection_loss` – 接続喪失時のサーバーの動作を制御する設定パラメータ。`true` の場合、クライアントとサーバー間の接続が失われるとすぐに例外がスローされます。`false` の場合、ClickHouse サーバーは例外をスローする前にクエリの実行を 3 回リトライします。リトライによりレスポンス時間が増加する点に注意してください。デフォルト値: `false`。

* `query` – カスタムクエリ。省略可能なパラメータです。

:::note
`table` および `where` フィールドは、`query` フィールドと同時に使用することはできません。また、`table` または `query` フィールドのいずれか一方は必ず指定する必要があります。
:::

:::note
明示的なパラメータ `secure` は存在しません。SSL 接続を確立する場合、セキュリティは必須となります。
:::

MySQL には、ソケットを介してローカルホスト上で接続できます。そのためには、`host` および `socket` を設定します。

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

フィールドの設定:

* `host` – ClickHouse のホスト。ローカルホストの場合、クエリはネットワーク通信なしで実行されます。フォールトトレランスを向上させるには、[Distributed](../../engines/table-engines/special/distributed.md) テーブルを作成し、以降の設定でそれを指定できます。
* `port` – ClickHouse サーバーのポート。
* `user` – ClickHouse ユーザー名。
* `password` – ClickHouse ユーザーのパスワード。
* `db` – データベース名。
* `table` – テーブル名。
* `where` – 選択条件。省略可能。
* `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。詳細は [LIFETIME を使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。
* `secure` - 接続に SSL を使用します。
* `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` または `where` フィールドは `query` フィールドと同時には使用できません。また、`table` フィールドか `query` フィールドのいずれか一方は必ず指定する必要があります。
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

設定フィールド:

* `host` – MongoDB ホスト。
* `port` – MongoDB サーバーのポート。
* `user` – MongoDB ユーザー名。
* `password` – MongoDB ユーザーのパスワード。
* `db` – データベース名。
* `collection` – コレクション名。
* `options` -  MongoDB 接続文字列オプション（省略可能なパラメータ）。

または

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定項目:

* `uri` - 接続先の URI。
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

フィールドの設定:

* `host` – Redis のホスト。
* `port` – Redis サーバーのポート番号。
* `storage_type` – キー操作に使用される Redis の内部ストレージ構造。`simple` はシンプルなソースおよびハッシュ化された単一キーソース向け、`hash_map` は 2 つのキーを持つハッシュ化されたソース向け。レンジソースおよび複雑なキーを持つキャッシュソースはサポートされません。省略可能で、指定しなかった場合のデフォルト値は `simple` です。
* `db_index` – Redis 論理データベースの数値インデックス。省略可能で、指定しなかった場合のデフォルト値は 0 です。

#### Cassandra {#cassandra}

設定例:

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

* `host` – Cassandra のホスト、またはホストをカンマ区切りで並べたリスト。
* `port` – Cassandra サーバーのポート。指定しない場合はデフォルトのポート 9042 が使用されます。
* `user` – Cassandra ユーザー名。
* `password` – Cassandra ユーザーのパスワード。
* `keyspace` – キースペース（データベース）の名前。
* `column_family` – カラムファミリー（テーブル）の名前。
* `allow_filtering` – クラスタリングキー列に対して潜在的に高コストな条件を許可するかどうかのフラグ。デフォルト値は 1。
* `partition_key_prefix` – Cassandra テーブルの主キーに含まれるパーティションキー列の数。複合キー辞書では必須です。辞書定義におけるキー列の順序は Cassandra と同一でなければなりません。デフォルト値は 1（最初のキー列がパーティションキーで、以降のキー列がクラスタリングキー）。
* `consistency` – コンシステンシレベル。指定可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One`。
* `where` – 任意の抽出条件。
* `max_threads` – 複数パーティションからデータをロードする複合キー辞書で使用するスレッド数の上限。
* `query` – カスタムクエリ。任意のパラメーター。

:::note
`column_family` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`column_family` フィールドまたは `query` フィールドのいずれか一方は必ず宣言する必要があります。
:::

#### PostgreSQL {#postgresql}

設定例:

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

フィールドの設定：

* `host` – PostgreSQL サーバー上のホスト。すべてのレプリカに対してまとめて指定することも、それぞれ個別に（`<replica>` 内で）指定することもできます。
* `port` – PostgreSQL サーバー上のポート。すべてのレプリカに対してまとめて指定することも、それぞれ個別に（`<replica>` 内で）指定することもできます。
* `user` – PostgreSQL ユーザー名。すべてのレプリカに対してまとめて指定することも、それぞれ個別に（`<replica>` 内で）指定することもできます。
* `password` – PostgreSQL ユーザーのパスワード。すべてのレプリカに対してまとめて指定することも、それぞれ個別に（`<replica>` 内で）指定することもできます。
* `replica` – レプリカの設定セクション。複数のセクションを指定できます。
  * `replica/host` – PostgreSQL ホスト。
  * `replica/port` – PostgreSQL ポート。
  * `replica/priority` – レプリカの優先度。接続を試行する際、ClickHouse は優先度の順にレプリカを走査します。数値が小さいほど優先度が高くなります。
* `db` – データベース名。
* `table` – テーブル名。
* `where` – 抽出条件。条件の構文は PostgreSQL の `WHERE` 句と同じです。例えば `id > 10 AND id < 20` のように指定します。任意のパラメータです。
* `invalidate_query` – 辞書の状態を確認するためのクエリです。任意のパラメータです。詳細は [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) セクションを参照してください。
* `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカへの再接続を行います。任意のパラメータです。
* `query` – カスタムクエリ。任意のパラメータです。

:::note
`table` フィールドまたは `where` フィールドは、`query` フィールドと同時には使用できません。また、`table` フィールドまたは `query` フィールドのいずれか一方は必ず宣言する必要があります。
:::

### Null {#null}

ダミー（空）辞書を作成するために使用できる特別なソースです。このような辞書は、テストや、Distributed テーブルを使用する環境でデータノードとクエリノードを分離した構成などで有用です。

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

## 辞書キーとフィールド {#dictionary-key-and-fields}

<CloudDetails />

`structure` 句は、クエリで使用できる辞書キーとフィールドを記述します。

XML による記述:

```xml
<dictionary>
    <structure>
        <id>
            <name>Id</name>
        </id>

        <attribute>
            <!-- 属性パラメータ -->
        </attribute>

        ...

    </structure>
</dictionary>
```

属性は次の要素で定義されます:

* `<id>` — キー列
* `<attribute>` — データ列。属性は複数定義できます。

DDL クエリ:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリ本文で指定します：

* `PRIMARY KEY` — 主キー列
* `AttrName AttrType` — データ列。属性は複数定義できます。

## キー {#key}

ClickHouse は次の種類のキーをサポートしています。

* 数値キー。`UInt64`。`&lt;id&gt;` タグ内、または `PRIMARY KEY` キーワードを使って定義します。
* 複合キー。異なる型の値の集合。`&lt;key&gt;` タグ内、または `PRIMARY KEY` キーワードを使って定義します。

XML 構造では `&lt;id&gt;` または `&lt;key&gt;` のどちらか一方のみを含めることができます。DDL クエリには `PRIMARY KEY` を 1 つだけ含めなければなりません。

:::note
キーを属性として記述してはいけません。
:::

### 数値キー {#numeric-key}

型: `UInt64`。

構成例:

```xml
<id>
    <name>ID</name>
</id>
```

設定フィールド：

* `name` – キー列の名前。

DDL クエリの場合：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

* `PRIMARY KEY` – キーを格納する列の名前。

### 複合キー {#composite-key}

キーは任意の型のフィールドを要素とする `tuple` として定義できます。この場合の[レイアウト](#storing-dictionaries-in-memory)は `complex_key_hashed` または `complex_key_cache` でなければなりません。

:::tip
複合キーは 1 つの要素だけで構成することもできます。これにより、例えば文字列をキーとして使用することが可能になります。
:::

キーの構造は `<key>` 要素内で設定します。キーのフィールドは、辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定します。例：

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

`dictGet*` 関数へのクエリでは、キーとしてタプルを渡します。例: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## 属性 {#attributes}

設定例：

```xml
<structure>
    ...
    <attribute>
        <name>名前</name>
        <type>ClickHouseのデータ型</type>
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

設定項目：

| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `type`                                               | ClickHouse のデータ型: [UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse は辞書からの値を指定されたデータ型にキャストしようとします。たとえば MySQL の場合、MySQL のソーステーブルではフィールドが `TEXT`、`VARCHAR`、`BLOB` である可能性がありますが、ClickHouse では `String` としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md) は現在、[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache) の各辞書でサポートされています。[IPTrie](#ip_trie) 辞書では `Nullable` 型はサポートされていません。 | Yes      |
| `null_value`                                         | 存在しない要素に対するデフォルト値。<br/>この例では空文字列です。[NULL](../syntax.md#null) 値は `Nullable` 型に対してのみ使用できます（前の行の型の説明を参照してください）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Yes      |
| `expression`                                         | ClickHouse が値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式はリモート SQL データベース内のカラム名にすることができます。そのため、リモートカラムのエイリアスを作成するために使用できます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、この属性には現在のキーに対する親キーの値が含まれます。[階層型辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | No       |
| `injective`                                          | `id -> attribute` 写像が[単射](https://en.wikipedia.org/wiki/Injective_function)かどうかを示すフラグ。<br/>`true` の場合、ClickHouse は単射である辞書へのリクエストを `GROUP BY` 句の後に自動的に配置できます。通常、これによりそのようなリクエストの回数を大幅に減らせます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       |
| `is_object_id`                                       | クエリが MongoDB ドキュメントに対して `ObjectID` を用いて実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。|

## 階層型辞書 {#hierarchical-dictionaries}

ClickHouse は、[数値キー](#numeric-key) を持つ階層型辞書をサポートしています。

次の階層構造を見てみましょう。

```text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (中央)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は、次の辞書テーブルとして表現できます。

| region&#95;id | parent&#95;region | region&#95;name |
| ------------- | ----------------- | --------------- |
| 1             | 0                 | Russia          |
| 2             | 1                 | Moscow          |
| 3             | 2                 | Center          |
| 4             | 0                 | Great Britain   |
| 5             | 4                 | London          |

このテーブルには、要素に最も近い親のキーを格納する `parent_region` 列があります。

ClickHouse は、外部辞書の属性に対して階層プロパティをサポートしています。このプロパティにより、先ほど説明したような階層辞書を構成できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 関数を使用すると、要素の親チェーンを取得できます。

この例では、辞書の構造は次のようになります。

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

## ポリゴン辞書 {#polygon-dictionaries}

この辞書は、ポイントインポリゴン（point-in-polygon）クエリ、いわば「逆ジオコーディング」のルックアップ向けに最適化されています。座標（緯度・経度）が与えられると、多数のポリゴン（国や地域の境界など）から、その点を内包するポリゴン／領域を効率的に特定します。位置座標を、それを含む領域へマッピングする用途に適しています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouse におけるポリゴン辞書" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

ポリゴン辞書設定の例:

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

ポリゴン辞書を設定する際、キーは次のいずれか 2 種類の型でなければなりません。

* 単純ポリゴン。これは点の配列です。
* MultiPolygon。これはポリゴンの配列です。各ポリゴンは 2 次元の点からなる二次元配列です。この配列の最初の要素がポリゴンの外周境界であり、それ以降の要素はその内部から除外される領域を指定します。

点は、その座標の配列またはタプルとして指定できます。現在の実装では、2 次元の点のみがサポートされています。

ユーザーは、ClickHouse がサポートするすべての形式で独自のデータをアップロードできます。

利用可能な [インメモリストレージ](#storing-dictionaries-in-memory) のタイプは 3 つあります。

* `POLYGON_SIMPLE`。これは単純な実装であり、各クエリごとにすべてのポリゴンを線形に走査し、追加のインデックスを使用せずに、それぞれについて包含判定を行います。

* `POLYGON_INDEX_EACH`。各ポリゴンごとに個別のインデックスを構築し、多くの場合においてそのポリゴンに属するかどうかを高速に判定できます（地理的な領域向けに最適化されています）。
  また、対象領域にはグリッドが重ね合わされ、検討対象となるポリゴンの数が大幅に絞り込まれます。
  このグリッドはセルを 16 個の等しい部分に再帰的に分割することで作成され、2 つのパラメータで設定されます。
  再帰の深さが `MAX_DEPTH` に達するか、セルと交差するポリゴン数が `MIN_INTERSECTIONS` 以下になった時点で分割が停止します。
  クエリに応答する際には、対応するセルが特定され、そのセルに格納されているポリゴンのインデックスに順次アクセスします。

* `POLYGON_INDEX_CELL`。この配置でも、上記と同様のグリッドが作成されます。同じオプションが利用可能です。各セルごとに、そのセルに入るポリゴン片すべてに対してインデックスが構築されるため、クエリに高速に応答できます。

* `POLYGON`。`POLYGON_INDEX_CELL` の同義語です。

辞書に対するクエリは、辞書を操作する標準の[関数](../../sql-reference/functions/ext-dict-functions.md)を使って実行されます。
重要な違いとして、ここではキーが「どのポリゴンに含まれるかを調べたい点」になります。

**例**

上で定義した辞書を使用した例:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

&#39;points&#39; テーブル内の各ポイントに対して最後のコマンドを実行すると、そのポイントを含む最小面積の多角形が求められ、要求された属性が出力されます。

**例**

SELECT クエリを使用してポリゴン辞書から列を読み取ることができます。そのためには、辞書設定または対応する DDL クエリで `store_polygon_key_column = 1` を有効化します。

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

## 正規表現ツリー・ディクショナリ {#regexp-tree-dictionary}

このディクショナリは、階層的な正規表現パターンに基づいてキーを値にマッピングします。キーの完全一致検索ではなく、正規表現パターンにマッチさせてユーザーエージェント文字列のような文字列を分類するといったパターンマッチによる検索に最適化されています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse の正規表現ツリー・ディクショナリ入門" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

### ClickHouse オープンソース版で正規表現ツリー・ディクショナリを使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

ClickHouse オープンソース版では、正規表現ツリー・ディクショナリは `YAMLRegExpTree` ソースを用いて定義し、そのソースに正規表現ツリーを含む YAML ファイルへのパスを指定します。

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

辞書ソース `YAMLRegExpTree` は、正規表現ツリーの構造を表します。例えば次のようになります。

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

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは次の構造を持ちます。

* **regexp**: ノードの正規表現。
* **attributes**: ユーザー定義の辞書属性のリスト。この例では、`name` と `version` の 2 つの属性があります。最初のノードは両方の属性を定義します。2 番目のノードは属性 `name` のみを定義します。属性 `version` は、2 番目のノードの子ノードによって提供されます。
  * 属性の値には、マッチした正規表現のキャプチャグループを参照する **後方参照** を含めることができます。この例では、最初のノードの属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` への後方参照 `\1` で構成されています。後方参照の番号は 1 から 9 までで、`$1` または `\1`（番号 1 の場合）のように記述します。クエリ実行時に、後方参照はマッチしたキャプチャグループで置き換えられます。
* **child nodes**: 正規表現ツリーノードの子のリストであり、それぞれが独自の attributes と（場合によっては）子ノードを持ちます。文字列のマッチングは深さ優先で行われます。文字列がある正規表現ノードにマッチした場合、辞書はそのノードの子ノードにもマッチするかどうかを確認します。その場合、最も深い位置でマッチしたノードの属性が割り当てられます。子ノードの属性は、親ノードと同名の属性を上書きします。YAML ファイル内での子ノード名は任意に指定でき、上記の例では `versions` となっています。

正規表現ツリー辞書には、`dictGet`、`dictGetOrDefault`、`dictGetAll` 関数のみを用いてアクセスできます。

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

この場合、まず最上位レイヤーの 2 番目のノードで、正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` と照合します。次に辞書は子ノードの検査を続け、その文字列が `3[12]/tclwebkit` にもマッチすることを検出します。その結果、属性 `name` の値は（最上位レイヤーで定義されている）`Android` となり、属性 `version` の値は（子ノードで定義されている）`12` となります。

強力な YAML 構成ファイルを用いることで、正規表現ツリーディクショナリをユーザーエージェント文字列パーサーとして利用できます。[uap-core](https://github.com/ua-parser/uap-core) をサポートしており、機能テスト [02504&#95;regexp&#95;dictionary&#95;ua&#95;parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) でその使い方を示しています。

#### 属性値の収集 {#collecting-attribute-values}

複数の正規表現にマッチした場合、葉ノードの値だけでなく、それらすべてから値を返せると便利な場合があります。このようなケースでは、専用の関数 [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) を利用できます。あるノードが型 `T` の属性値を持つ場合、`dictGetAll` は 0 個以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチ数には上限がありません。上限は `dictGetAll` の任意の第 4 引数として渡すことができます。配列には *トポロジカル順序* で値が格納されます。これは、子ノードが親ノードより前に来て、兄弟ノードは元の定義における順序に従うことを意味します。

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
# /var/lib/clickhouse/user_files/regexp_tree.yaml {#varlibclickhouseuser_filesregexp_treeyaml}
- regexp: 'clickhouse\.com'
  tag: 'ClickHouse'
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: 'ClickHouseドキュメント'
      topological_index: 0
      captured: '\1'
      parent: 'ClickHouse'

- regexp: '/docs(/|$)'
  tag: 'ドキュメント'
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

パターンマッチングの動作は、特定の辞書設定によって変更できます。

* `regexp_dict_flag_case_insensitive`: 大文字・小文字を区別しないマッチングを使用します（デフォルトは `false`）。個々の正規表現内で `(?i)` および `(?-i)` を使用して上書きできます。
* `regexp_dict_flag_dotall`: 「.」が改行文字にもマッチするようにします（デフォルトは `false`）。

### ClickHouse Cloud で正規表現ツリーディクショナリを使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースは ClickHouse オープンソース版では動作しますが、ClickHouse Cloud では動作しません。ClickHouse Cloud で regexp ツリーディクショナリを使用するには、まず ClickHouse オープンソース版でローカルに YAML ファイルから regexp ツリーディクショナリを作成し、その後 `dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用して、このディクショナリを CSV ファイルにエクスポートします。

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

ダンプされたファイルのスキーマは次のとおりです。

* `id UInt64`: RegexpTree ノードの ID。
* `parent_id UInt64`: ノードの親の ID。
* `regexp String`: 正規表現文字列。
* `keys Array(String)`: ユーザー定義属性の名前。
* `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloud で辞書を作成するには、まず以下のテーブル構造で `regexp_dictionary_source_table` テーブルを作成します。

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

次に、以下の方法でローカルの CSV を更新します。

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

詳しくは、[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files)の方法を参照してください。ソーステーブルを初期化した後、ソーステーブルごとに RegexpTree を作成できます。

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

## 組み込みディクショナリ {#embedded-dictionaries}

<SelfManaged />

ClickHouse には、geobase を扱うための組み込み機能があります。

これにより、次のことが可能になります:

- リージョンの ID から、希望する言語でその名前を取得できます。
- リージョンの ID から、都市、地域、連邦管区、国、大陸の ID を取得できます。
- あるリージョンが別のリージョンに含まれているかどうかを確認できます。
- 親リージョンのチェーンを取得できます。

すべての関数は「translocality」をサポートしており、リージョンの所属関係について、異なる見方を同時に扱うことができます。詳細は「web analytics ディクショナリを扱うための関数」のセクションを参照してください。

内部ディクショナリは、デフォルトのパッケージでは無効になっています。
有効化するには、サーバー設定ファイル内で `path_to_regions_hierarchy_file` と `path_to_regions_names_files` のパラメータのコメントを解除します。

geobase はテキストファイルから読み込まれます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータには `regions_hierarchy.txt` ファイル (デフォルトのリージョン階層) へのパスを指定する必要があり、その他のファイル (`regions_hierarchy_ua.txt`) も同じディレクトリに配置されていなければなりません。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルは自分で作成することもできます。ファイル形式は次のとおりです。

`regions_hierarchy*.txt`: TabSeparated (ヘッダーなし)、列:

- リージョン ID (`UInt32`)
- 親リージョン ID (`UInt32`)
- リージョンタイプ (`UInt8`): 1 - 大陸, 3 - 国, 4 - 連邦管区, 5 - 地域, 6 - 都市。その他のタイプには値がありません
- 人口 (`UInt32`) — 省略可能な列

`regions_names_*.txt`: TabSeparated (ヘッダーなし)、列:

- リージョン ID (`UInt32`)
- リージョン名 (`String`) — タブや改行は、エスケープされていても含めることはできません。

RAM 内での保存にはフラット配列が使用されます。このため、ID は 100 万を超えないようにする必要があります。

ディクショナリは、サーバーを再起動せずに更新できますが、利用可能なディクショナリの集合自体は更新されません。
更新のために、ファイルの更新時刻が確認されます。ファイルが変更されている場合、そのディクショナリが更新されます。
変更のチェック間隔は、`builtin_dictionaries_reload_interval` パラメータで設定します。
(初回利用時の読み込みを除く) ディクショナリの更新はクエリをブロックしません。更新中、クエリは古いバージョンのディクショナリを使用します。更新中にエラーが発生した場合、エラーはサーバーログに出力され、クエリは引き続き古いバージョンのディクショナリを使用します。

geobase を含むディクショナリは、定期的に更新することを推奨します。更新時には、新しいファイルを生成し、別の場所に書き出してください。すべての準備が整ったら、それらをサーバーが使用しているファイル名にリネームします。

OS 識別子および検索エンジンを扱うための関数も存在しますが、これらは使用しないでください。
