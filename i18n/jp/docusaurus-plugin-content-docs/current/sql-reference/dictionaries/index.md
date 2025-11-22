---
description: 'ClickHouseにおける外部ディクショナリ機能の概要'
sidebar_label: 'ディクショナリの定義'
sidebar_position: 35
slug: /sql-reference/dictionaries
title: 'ディクショナリ'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# ディクショナリ

ディクショナリは、さまざまな種類の参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouse は、クエリ内で使用できるディクショナリ操作用の専用関数をサポートしています。参照テーブルとの `JOIN` を行うよりも、ディクショナリと関数を組み合わせて使用する方が簡単かつ効率的です。

ClickHouse では、次の種類のディクショナリをサポートしています。

- [関数群](../../sql-reference/functions/ext-dict-functions.md) を備えたディクショナリ
- 特定の [関数群](../../sql-reference/functions/embedded-dict-functions.md) を備えた [組み込みディクショナリ](#embedded-dictionaries)

:::tip Tutorial
ClickHouse のディクショナリの利用を始める場合は、このトピックを扱ったチュートリアルがあります。[こちら](tutorial.md) を参照してください。
:::

さまざまなデータソースから独自のディクショナリを追加できます。ディクショナリのソースには、ClickHouse テーブル、ローカルのテキストまたは実行可能ファイル、HTTP(s) リソース、他の DBMS などを使用できます。詳細については「[Dictionary Sources](#dictionary-sources)」を参照してください。

ClickHouse は次のことを行います。

- ディクショナリを RAM 内に全体または一部格納します。
- ディクショナリを定期的に更新し、欠落している値を動的にロードします。つまり、ディクショナリは動的にロードできます。
- xml ファイルまたは [DDL クエリ](../../sql-reference/statements/create/dictionary.md) を使用してディクショナリを作成できます。

ディクショナリの設定は、1 つ以上の xml ファイルに記述できます。設定ファイルへのパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config) パラメータで指定します。

ディクショナリは、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 設定に応じて、サーバー起動時または初回使用時にロードされます。

[dictionaries](/operations/system-tables/dictionaries) システムテーブルには、サーバー上で構成されているディクショナリに関する情報が含まれます。各ディクショナリについて、次の情報を確認できます。

- ディクショナリのステータス
- 設定パラメータ
- ディクショナリに割り当てられた RAM の量や、ディクショナリが正常にロードされてからのクエリ数などのメトリクス

<CloudDetails />



## DDLクエリによるディクショナリの作成 {#creating-a-dictionary-with-a-ddl-query}

ディクショナリは[DDLクエリ](../../sql-reference/statements/create/dictionary.md)で作成できます。これが推奨される方法です。DDLで作成されたディクショナリには以下の利点があります:

- サーバー設定ファイルに追加のレコードが追加されません。
- ディクショナリは、テーブルやビューと同様にファーストクラスエンティティとして扱うことができます。
- ディクショナリテーブル関数ではなく、使い慣れたSELECTを使用してデータを直接読み取ることができます。なお、SELECT文を介してディクショナリに直接アクセスする場合、キャッシュされたディクショナリはキャッシュされたデータのみを返し、キャッシュされていないディクショナリは保存されているすべてのデータを返します。
- ディクショナリは簡単に名前を変更できます。


## 設定ファイルを使用した辞書の作成 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge />

:::note
設定ファイルを使用した辞書の作成は、ClickHouse Cloudには適用されません。DDL(上記を参照)を使用し、`default`ユーザーとして辞書を作成してください。
:::

辞書設定ファイルの形式は以下の通りです:

```xml
<clickhouse>
    <comment>任意の内容を持つオプション要素。ClickHouseサーバーによって無視されます。</comment>

    <!--オプション要素。置換を含むファイル名-->
    <include_from>/etc/metrika.xml</include_from>


    <dictionary>
        <!-- 辞書の設定。 -->
        <!-- 設定ファイル内には任意の数の辞書セクションを含めることができます。 -->
    </dictionary>

</clickhouse>
```

同じファイル内に任意の数の辞書を[設定](#configuring-a-dictionary)することができます。

:::note
小規模な辞書の値変換は、`SELECT`クエリ内で記述することで実現できます([transform](../../sql-reference/functions/other-functions.md)関数を参照)。この機能は辞書機能とは関係ありません。
:::


## ディクショナリの設定 {#configuring-a-dictionary}

<CloudDetails />

ディクショナリをXMLファイルで設定する場合、ディクショナリの設定は以下の構造になります:

```xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複合キーの設定 -->
    </structure>

    <source>
      <!-- ソースの設定 -->
    </source>

    <layout>
      <!-- メモリレイアウトの設定 -->
    </layout>

    <lifetime>
      <!-- メモリ内のディクショナリの有効期間 -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は以下の構造になります:

```sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複合キーまたは単一キーの設定
SOURCE(...) -- ソースの設定
LAYOUT(...) -- メモリレイアウトの設定
LIFETIME(...) -- メモリ内のディクショナリの有効期間
```


## ディクショナリのメモリ内保存 {#storing-dictionaries-in-memory}

ディクショナリをメモリに保存する方法は複数あります。

最適な処理速度を提供する[flat](#flat)、[hashed](#hashed)、[complex_key_hashed](#complex_key_hashed)を推奨します。

キャッシングは、パフォーマンスが低下する可能性があり、最適なパラメータの選択が困難であるため推奨されません。詳細は[cache](#cache)のセクションをご覧ください。

ディクショナリのパフォーマンスを向上させる方法がいくつかあります:

- `GROUP BY`の後にディクショナリを操作する関数を呼び出す。
- 抽出する属性を単射としてマークする。異なるキーが異なる属性値に対応する場合、その属性は単射と呼ばれます。したがって、`GROUP BY`がキーによって属性値を取得する関数を使用する場合、この関数は自動的に`GROUP BY`から除外されます。

ClickHouseはディクショナリのエラーに対して例外を生成します。エラーの例:

- アクセスしようとしたディクショナリを読み込めませんでした。
- `cached`ディクショナリのクエリ実行時のエラー。

ディクショナリのリストとそのステータスは[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

<CloudDetails />

設定は次のようになります:

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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md):

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

レイアウトに`complex-key*`という語を含まないディクショナリは[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`ディクショナリは複合キー(任意の型を持つ複雑なキー)を持ちます。

XMLディクショナリの[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されます。

設定例(列key_columnはUInt64型):

```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合`complex`キーのXMLディクショナリは`<key>`タグで定義されます。

複合キーの設定例(キーは[String](../../sql-reference/data-types/string.md)型の要素を1つ持つ):

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


## ディクショナリをメモリに格納する方法 {#ways-to-store-dictionaries-in-memory}

ディクショナリデータをメモリに格納する様々な方法は、CPUとRAM使用量のトレードオフに関連しています。ディクショナリ関連の[ブログ記事](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)の[レイアウトの選択](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)の段落で公開されている決定木は、どのレイアウトを使用するかを決定する際の良い出発点となります。

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

ディクショナリは、フラット配列の形式で完全にメモリに格納されます。ディクショナリはどれだけのメモリを使用するでしょうか？その量は、最大キーのサイズ（使用される領域）に比例します。

ディクショナリキーは[UInt64](../../sql-reference/data-types/int-uint.md)型であり、値は`max_array_size`（デフォルトは500,000）に制限されます。ディクショナリの作成時にこれより大きなキーが検出された場合、ClickHouseは例外をスローし、ディクショナリを作成しません。ディクショナリのフラット配列の初期サイズは、`initial_array_size`設定（デフォルトは1024）によって制御されます。

All types of sources are supported. When updating, data (from a file または from a table) is read in it entirety.

この方法は、ディクショナリを格納するすべての利用可能な方法の中で最高のパフォーマンスを提供します。

設定例：

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

ディクショナリは、ハッシュテーブルの形式で完全にメモリに格納されます。ディクショナリは、任意の識別子を持つ任意の数の要素を含むことができます。実際には、キーの数は数千万のアイテムに達することがあります。

ディクショナリキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）が全体として読み込まれます。

設定例：

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
    <!-- shardsが1より大きい場合（デフォルトは`1`）、ディクショナリはデータを並列にロードします。
         1つのディクショナリに膨大な数の要素がある場合に有用です。 -->
    <shards>10</shards>

    <!-- 並列キュー内のブロックのバックログのサイズ。

         並列ロードのボトルネックはリハッシュであり、スレッドがリハッシュを実行しているために
         停滞するのを避けるために、いくらかのバックログが必要です。

         10000はメモリと速度の間の良いバランスです。
         10e10要素でも、飢餓状態なしにすべての負荷を処理できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷率。値が大きいほど、メモリはより効率的に利用されます
         （無駄なメモリが少なくなります）が、読み取り/パフォーマンスが低下する可能性があります。

         有効な値：[0.5, 0.99]
         デフォルト：0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

```sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

`hashed`と似ていますが、CPU使用量を増やす代わりにメモリ使用量を削減します。

ディクショナリキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

設定例：


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

この辞書タイプでも`shards`を使用できます。`sparse_hashed`は`hashed`よりも低速であるため、`hashed`よりも`sparse_hashed`において重要性が高くなります。

### complex_key_hashed {#complex_key_hashed}

このストレージタイプは複合[キー](#dictionary-key-and-fields)で使用します。`hashed`と同様です。

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

### complex_key_sparse_hashed {#complex_key_sparse_hashed}

このストレージタイプは複合[キー](#dictionary-key-and-fields)で使用します。[sparse_hashed](#sparse_hashed)と同様です。

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

### hashed_array {#hashed_array}

辞書は完全にメモリに格納されます。各属性は配列に格納されます。キー属性はハッシュテーブルの形式で格納され、値は属性配列内のインデックスです。辞書は任意の識別子を持つ任意の数の要素を含むことができます。実際には、キーの数は数千万項目に達することがあります。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ(ファイルまたはテーブルから)が全体として読み込まれます。

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

### complex_key_hashed_array {#complex_key_hashed_array}

このストレージタイプは複合[キー](#dictionary-key-and-fields)で使用します。[hashed_array](#hashed_array)と同様です。

設定例:

```xml
<layout>
  <complex_key_hashed_array />
</layout>
```

または

```sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range_hashed {#range_hashed}

辞書は、範囲の順序付き配列とそれに対応する値を持つハッシュテーブルの形式でメモリに格納されます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。
このストレージ方式はhashedと同じように動作し、キーに加えて日付/時刻(任意の数値型)の範囲を使用できます。

例: テーブルには各広告主の割引が次の形式で含まれています:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```


日付範囲に対してサンプルを利用するには、[structure](#dictionary-key-and-fields) 内で `range_min` および `range_max` 要素を定義します。これらの要素には `name` と `type` 要素を含める必要があります（`type` が指定されていない場合、デフォルトの型として Date 型が使用されます）。`type` には任意の数値型（Date / DateTime / UInt64 / Int32 など）を指定できます。

:::note
`range_min` と `range_max` の値は `Int64` 型に収まる必要があります。
:::

例:

```xml
<layout>
    <range_hashed>
        <!-- 重複範囲の処理戦略 (min/max)。デフォルト: min (range_min -> range_max の最小値を持つ一致範囲を返す) -->
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

これらのディクショナリを扱うには、範囲を指定する追加の引数を `dictGet` 関数に渡す必要があります。

```sql
dictGet('dict_name', 'attr_name', id, date)
```

クエリの例:

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された `id` と、指定した日付を含む日付範囲に対応する値を返します。

アルゴリズムの詳細:

* `id` が見つからない場合、またはその `id` に対する範囲が見つからない場合、属性の型のデフォルト値を返します。
* 範囲が重なっていて `range_lookup_strategy=min` の場合、一致する範囲のうち `range_min` が最小のものを返し、複数の範囲が見つかった場合は `range_max` が最小の範囲を返し、それでも複数の範囲が見つかった場合（複数の範囲で `range_min` と `range_max` が同じ場合）は、その中からランダムな範囲を返します。
* 範囲が重なっていて `range_lookup_strategy=max` の場合、一致する範囲のうち `range_min` が最大のものを返し、複数の範囲が見つかった場合は `range_max` が最大の範囲を返し、それでも複数の範囲が見つかった場合（複数の範囲で `range_min` と `range_max` が同じ場合）は、その中からランダムな範囲を返します。
* `range_max` が `NULL` の場合、その範囲は上限が開いた範囲となります。`NULL` は取り得る最大の値として扱われます。`range_min` については、下限が開いた範囲の値として `1970-01-01` または `0` (-MAX&#95;INT) を使用できます。

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

重複する範囲および開区間を含む設定例：

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
│ 0.2 │ -- 2つの範囲が一致し、range_min 2015-01-15 (0.2) は 2015-01-01 (0.1) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 2つの範囲が一致し、range_min 2015-01-04 (0.4) は 2015-01-01 (0.3) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 2つの範囲が一致し、range_min は等しく、2015-01-15 (0.5) は 2015-01-10 (0.6) より大きい
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



select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 2つの範囲が一致、range_min 2015-01-01 (0.1) が 2015-01-15 (0.2) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 2つの範囲が一致、range_min 2015-01-01 (0.3) が 2015-01-04 (0.4) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 2つの範囲が一致、range_minは等しく、2015-01-10 (0.6) が 2015-01-15 (0.5) より小さい
└─────┘

````

### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、範囲の順序付き配列とそれに対応する値を持つハッシュテーブルの形式でメモリに格納されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用を目的としています。

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
````

### cache {#cache}

辞書は、固定数のセルを持つキャッシュに格納されます。これらのセルには、頻繁に使用される要素が含まれます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際、まずキャッシュが検索されます。各データブロックに対して、キャッシュに見つからないか古くなっているすべてのキーは、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を使用してソースから要求されます。受信したデータはその後キャッシュに書き込まれます。

辞書にキーが見つからない場合、キャッシュ更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`の設定で制御できます。

キャッシュ辞書では、キャッシュ内のデータの有効期限[lifetime](#refreshing-dictionary-data-using-lifetime)を設定できます。セルにデータをロードしてから`lifetime`より長い時間が経過した場合、そのセルの値は使用されず、キーは期限切れになります。キーは次に使用する必要があるときに再要求されます。この動作は`allow_read_expired_keys`設定で構成できます。

これは辞書を格納するすべての方法の中で最も効率が低い方法です。キャッシュの速度は、正しい設定と使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合（推奨99%以上）にのみ良好なパフォーマンスを発揮します。平均ヒット率は[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

`allow_read_expired_keys`設定が1に設定されている場合（デフォルトは0）、辞書は非同期更新をサポートできます。クライアントがキーを要求し、それらすべてがキャッシュにあるが一部が期限切れの場合、辞書はクライアントに期限切れのキーを返し、ソースから非同期的にそれらを要求します。

キャッシュのパフォーマンスを向上させるには、`LIMIT`を使用したサブクエリを使用し、辞書を使用する関数を外部で呼び出します。

すべてのタイプのソースがサポートされています。

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

十分に大きなキャッシュサイズを設定してください。セル数の選択には実験が必要です:

1.  任意の値を設定します。
2.  キャッシュが完全に満杯になるまでクエリを実行します。
3.  `system.dictionaries`テーブルを使用してメモリ消費量を評価します。
4.  必要なメモリ消費量に達するまで、セル数を増減します。

:::note
ClickHouseをソースとして使用しないでください。ランダム読み取りを伴うクエリの処理が遅いためです。
:::

### complex_key_cache {#complex_key_cache}

このストレージタイプは複合[キー](#dictionary-key-and-fields)での使用を目的としています。`cache`と同様です。

### ssd_cache {#ssd_cache}

`cache`と同様ですが、データをSSDに、インデックスをRAMに格納します。更新キューに関連するすべてのキャッシュディクショナリ設定は、SSDキャッシュディクショナリにも適用できます。

ディクショナリキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

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

このストレージタイプは複合[キー](#dictionary-key-and-fields)での使用を目的としています。`ssd_cache`と同様です。

### direct {#direct}

ディクショナリはメモリに保存されず、リクエストの処理中に直接ソースにアクセスします。

ディクショナリキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

ローカルファイルを除く、すべてのタイプの[ソース](#dictionary-sources)がサポートされています。

設定例:

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

このストレージタイプは複合[キー](#dictionary-key-and-fields)での使用を目的としています。`direct`と同様です。

### ip_trie {#ip_trie}

このディクショナリは、ネットワークプレフィックスによるIPアドレス検索用に設計されています。IP範囲をCIDR表記で保存し、特定のIPがどのプレフィックス(サブネットやASN範囲など)に該当するかを高速に判定できるため、ジオロケーションやネットワーク分類などのIPベースの検索に最適です。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza'
  title='ip_trieディクショナリを使用したIPベースの検索'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

**例**

IPプレフィックスとマッピングを含むClickHouseのテーブルがあるとします:

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

このテーブルに対して `ip_trie` 辞書を定義します。`ip_trie` レイアウトでは複合キーが必要です。

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
        <!-- キー属性 `prefix` は dictGetString 経由で取得できます。 -->
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

キーは、許可された IP プレフィックスを含む `String` 型の属性を 1 つだけ持つ必要があります。その他の型はまだサポートされていません。

構文は次のとおりです。

```sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4 には `UInt32`、IPv6 には `FixedString(16)` のいずれかを引数として受け取ります。例えば:

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

他の型はまだサポートされていません。この関数は、この IP アドレスに対応するプレフィックスの属性を返します。プレフィックスが重複している場合は、最も限定的なものが返されます。

データは完全に RAM に収まっている必要があります。


## LIFETIMEを使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは`LIFETIME`タグ(秒単位で定義)に基づいて辞書を定期的に更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔であり、キャッシュされた辞書の無効化間隔です。

更新中でも、辞書の古いバージョンに対してクエリを実行できます。辞書の更新(初回読み込み時を除く)はクエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに記録され、クエリは辞書の古いバージョンを使用して継続できます。辞書の更新が成功すると、古いバージョンの辞書はアトミックに置き換えられます。

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

`<lifetime>0</lifetime>`(`LIFETIME(0)`)を設定すると、辞書の更新が無効になります。

更新の時間間隔を設定でき、ClickHouseはこの範囲内で一様にランダムな時間を選択します。これは、多数のサーバーで更新する際に辞書ソースへの負荷を分散するために必要です。

設定例:

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

`<min>0</min>`と`<max>0</max>`の場合、ClickHouseはタイムアウトによる辞書の再読み込みを行いません。
この場合、辞書設定ファイルが変更されたか、`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合に、ClickHouseは辞書を早期に再読み込みできます。

辞書を更新する際、ClickHouseサーバーは[ソース](#dictionary-sources)のタイプに応じて異なるロジックを適用します:

- テキストファイルの場合、変更時刻を確認します。時刻が以前に記録された時刻と異なる場合、辞書が更新されます。
- 他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース(ODBC、PostgreSQL、ClickHouseなど)の場合、毎回ではなく実際に変更された場合にのみ辞書を更新するクエリを設定できます。これを行うには、次の手順に従います:

- 辞書テーブルには、ソースデータが更新されたときに常に変更されるフィールドが必要です。
- ソースの設定では、変更されるフィールドを取得するクエリを指定する必要があります。ClickHouseサーバーはクエリ結果を行として解釈し、この行が以前の状態と比較して変更されている場合、辞書が更新されます。[ソース](#dictionary-sources)の設定で`<invalidate_query>`フィールドにクエリを指定します。

設定例:

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

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書では、同期更新と非同期更新の両方がサポートされています。

`Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed`辞書では、前回の更新後に変更されたデータのみをリクエストすることも可能です。辞書ソース設定の一部として`update_field`が指定されている場合、前回の更新時刻の値(秒単位)がデータリクエストに追加されます。ソースタイプ(Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC)に応じて、外部ソースからデータをリクエストする前に`update_field`に異なるロジックが適用されます。


* ソースが HTTP の場合、`update_field` はクエリパラメータとして付与され、その値として直近の更新時刻が渡されます。
* ソースが Executable の場合、`update_field` は実行スクリプトの引数として付与され、その値として直近の更新時刻が渡されます。
* ソースが ClickHouse、MySQL、PostgreSQL、ODBC の場合、`update_field` を直近の更新時刻以上かどうかで比較する条件が `WHERE` 句に追加されます。
  * 既定では、この `WHERE` 句の条件は SQL クエリの最上位レベルで評価されます。代わりに、クエリ内の任意の別の `WHERE` 句で `{condition}` キーワードを使用してこの条件を評価することもできます。例:
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

`update_field` オプションが設定されている場合、追加オプションとして `update_lag` を設定できます。`update_lag` オプションの値は、更新データを要求する前に前回の更新時刻から差し引かれます。

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

辞書は、さまざまなソースからClickHouseに接続できます。

辞書をXMLファイルで設定する場合、設定は次のようになります:

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- ソース設定 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の設定は次のようになります:

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソース設定
...
```

ソースは`source`セクションで設定します。

ソースタイプ[ローカルファイル](#local-file)、[実行可能ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)
では、オプション設定が利用可能です:

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

ソースのタイプ(`source_type`):

- [ローカルファイル](#local-file)
- [実行可能ファイル](#executable-file)
- [実行可能プール](#executable-pool)
- [HTTP(S)](#https)
- DBMS
  - [ODBC](#odbc)
  - [MySQL](#mysql)
  - [ClickHouse](#clickhouse)
  - [MongoDB](#mongodb)
  - [Redis](#redis)
  - [Cassandra](#cassandra)
  - [PostgreSQL](#postgresql)

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

設定フィールド:

- `path` – ファイルへの絶対パス。
- `format` – ファイル形式。[Formats](/sql-reference/formats)に記載されているすべての形式がサポートされています。

ソース`FILE`を持つ辞書をDDLコマンド(`CREATE DICTIONARY ...`)で作成する場合、データベースユーザーがClickHouseノード上の任意のファイルにアクセスすることを防ぐため、ソースファイルは`user_files`ディレクトリに配置する必要があります。

**関連項目**

- [辞書関数](/sql-reference/table-functions/dictionary)

### 実行可能ファイル {#executable-file}

実行可能ファイルの動作は、[辞書がメモリにどのように格納されるか](#storing-dictionaries-in-memory)に依存します。辞書が`cache`または`complex_key_cache`を使用して格納されている場合、ClickHouseは実行可能ファイルのSTDINにリクエストを送信することで必要なキーを要求します。それ以外の場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

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


- `command` — 実行可能ファイルへの絶対パス、またはファイル名(コマンドのディレクトリが`PATH`に含まれている場合)。
- `format` — ファイル形式。[Formats](/sql-reference/formats)に記載されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。ディクショナリが破棄された後、パイプが閉じられ、ClickHouseが子プロセスにSIGTERMシグナルを送信する前に、実行可能ファイルには`command_termination_timeout`秒のシャットダウン時間が与えられます。`command_termination_timeout`は秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `command_read_timeout` - コマンドの標準出力からデータを読み取る際のタイムアウト(ミリ秒単位)。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドの標準入力にデータを書き込む際のタイムアウト(ミリ秒単位)。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応関係は結果内の行の順序によって暗黙的に決定されます。デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例:`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`です。オプションパラメータ。
- `send_chunk_header` - 処理するデータのチャンクを送信する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`です。

このディクショナリソースはXML設定を介してのみ設定できます。DDLを介した実行可能ソースを持つディクショナリの作成は無効化されています。これは、データベースユーザーがClickHouseノード上で任意のバイナリを実行できてしまうことを防ぐためです。

### Executable Pool {#executable-pool}

Executable poolはプロセスのプールからデータを読み込むことを可能にします。このソースは、ソースからすべてのデータを読み込む必要があるディクショナリレイアウトでは動作しません。Executable poolは、ディクショナリが`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して[格納](#ways-to-store-dictionaries-in-memory)されている場合に動作します。

Executable poolは指定されたコマンドでプロセスのプールを生成し、それらが終了するまで実行し続けます。プログラムは利用可能な間はSTDINからデータを読み取り、結果をSTDOUTに出力する必要があります。STDINで次のデータブロックを待機することができます。ClickHouseはデータブロックの処理後にSTDINを閉じず、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトはこのデータ処理方法に対応できる必要があります。つまり、STDINをポーリングし、データを早期にSTDOUTにフラッシュする必要があります。

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

設定フィールド:


- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムディレクトリが`PATH`に記述されている場合）。
- `format` — ファイル形式。「[Formats](/sql-reference/formats)」に記載されているすべての形式がサポートされています。
- `pool_size` — プールのサイズ。`pool_size`に0を指定した場合、プールサイズの制限はありません。デフォルト値は`16`です。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。ディクショナリが破棄された後、パイプが閉じられ、ClickHouseが子プロセスにSIGTERMシグナルを送信する前に、実行可能ファイルには`command_termination_timeout`秒間のシャットダウン時間が与えられます。秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `max_command_execution_time` — データブロックを処理するための実行可能スクリプトコマンドの最大実行時間。秒単位で指定します。デフォルト値は10です。オプションパラメータ。
- `command_read_timeout` - コマンドの標準出力からデータを読み取る際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドの標準入力にデータを書き込む際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は暗黙的に（結果内の行の順序によって）決定されます。デフォルト値はfalseです。オプションパラメータ。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションパラメータ。
- `send_chunk_header` - 処理するデータのチャンクを送信する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`です。

このディクショナリソースはXML設定を介してのみ設定できます。DDLを介した実行可能ソースを持つディクショナリの作成は無効になっています。これは、データベースユーザーがClickHouseノード上で任意のバイナリを実行できてしまうことを防ぐためです。

### HTTP(S) {#https}

HTTP(S)サーバーとの連携は、[ディクショナリがメモリにどのように格納されるか](#storing-dictionaries-in-memory)に依存します。ディクショナリが`cache`および`complex_key_cache`を使用して格納されている場合、ClickHouseは`POST`メソッドでリクエストを送信することにより必要なキーを要求します。

設定例：

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

ClickHouseがHTTPSリソースにアクセスするには、サーバー設定で[openSSLを設定](../../operations/server-configuration-parameters/settings.md#openssl)する必要があります。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。「[Formats](/sql-reference/formats)」に記載されているすべての形式がサポートされています。
- `credentials` – 基本HTTP認証。オプションパラメータ。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリ。オプションパラメータ。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエストで送信されるヘッダーに使用される識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用してディクショナリを作成する場合、HTTPディクショナリのリモートホストは、データベースユーザーが任意のHTTPサーバーにアクセスすることを防ぐために、設定の`remote_url_allow_hosts`セクションの内容と照合されます。

### DBMS {#dbms}

#### ODBC {#odbc}

この方法を使用して、ODBCドライバーを持つあらゆるデータベースに接続できます。

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

設定フィールド:

- `db` – データベース名。`<connection_string>`パラメータでデータベース名が設定されている場合は省略します。
- `table` – テーブル名、およびスキーマが存在する場合はスキーマ名。
- `connection_string` – 接続文字列。
- `invalidate_query` – ディクショナリのステータスを確認するためのクエリ。オプションパラメータ。詳細は[LIFETIMEを使用したディクショナリデータの更新](#refreshing-dictionary-data-using-lifetime)のセクションを参照してください。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。オプションパラメータ。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`フィールドと`query`フィールドは同時に使用できません。`table`または`query`のいずれか一方を宣言する必要があります。
:::

ClickHouseはODBCドライバから引用符記号を受け取り、ドライバへのクエリ内のすべての設定を引用符で囲むため、データベース内のテーブル名の大文字小文字に応じてテーブル名を設定する必要があります。

Oracleを使用する際にエンコーディングに関する問題が発生した場合は、対応する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。

##### ODBCディクショナリ機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられる可能性があります。この場合、`odbc.ini`の`USERNAME`と`PASSWORD`の値がリモートサーバーに送信され、漏洩する可能性があります。
:::

**安全でない使用例**

PostgreSQL用にunixODBCを設定します。`/etc/odbc.ini`の内容:

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

次のようなクエリを実行すると

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバは`odbc.ini`の`USERNAME`と`PASSWORD`の値を`some-server.com`に送信します。

##### PostgreSQLへの接続例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCとPostgreSQL用のODBCドライバをインストールします:

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`を設定します(ClickHouseを実行するユーザーでサインインしている場合は`~/.odbc.ini`):

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

ClickHouseでのディクショナリ設定:


```xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- connection_stringには以下のパラメータを指定できます: -->
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

ドライバライブラリへの完全なパスを指定するために、`odbc.ini`を編集する必要がある場合があります(例: `DRIVER=/usr/local/lib/psqlodbcw.so`)。

##### MS SQL Serverへの接続例 {#example-of-connecting-ms-sql-server}

Ubuntu OS環境での例です。

MS SQLに接続するためのODBCドライバのインストール:

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバの設定:

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
    # $ cat ~/.odbc.ini # ClickHouseを実行するユーザーでサインインしている場合

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (オプション) ODBC接続のテスト (isqlツールを使用するには[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストールしてください)
    $ isql -v MSSQL "user" "password"
```

注意事項:

- 特定のSQL Serverバージョンでサポートされている最も古いTDSバージョンを確認するには、製品ドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を参照してください

ClickHouseでのディクショナリの設定:

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

#### Mysql {#mysql}

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

- `port` – MySQLサーバーのポート番号。すべてのレプリカに対して指定することも、各レプリカごとに個別に(`<replica>`内で)指定することもできます。

- `user` – MySQLユーザー名。すべてのレプリカに対して指定することも、各レプリカごとに個別に(`<replica>`内で)指定することもできます。

- `password` – MySQLユーザーのパスワード。すべてのレプリカに対して指定することも、各レプリカごとに個別に(`<replica>`内で)指定することもできます。

- `replica` – レプリカ設定のセクション。複数のセクションを指定できます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度順にレプリカを走査します。数値が小さいほど優先度が高くなります。

- `db` – データベース名。

- `table` – テーブル名。

- `where` – 選択条件。条件の構文はMySQLの`WHERE`句と同じです(例:`id > 10 AND id < 20`)。省略可能なパラメータ。

- `invalidate_query` – ディクショナリのステータスを確認するためのクエリ。省略可能なパラメータ。詳細は[LIFETIMEを使用したディクショナリデータの更新](#refreshing-dictionary-data-using-lifetime)のセクションを参照してください。

- `fail_on_connection_loss` – 接続喪失時のサーバーの動作を制御する設定パラメータ。`true`の場合、クライアントとサーバー間の接続が失われると即座に例外がスローされます。`false`の場合、ClickHouseサーバーは例外をスローする前にクエリの実行を3回再試行します。再試行により応答時間が増加することに注意してください。デフォルト値:`false`。

- `query` – カスタムクエリ。省略可能なパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと同時に使用できません。また、`table`または`query`フィールドのいずれか一方を宣言する必要があります。
:::

:::note
明示的な`secure`パラメータはありません。SSL接続を確立する際、セキュリティは必須です。
:::

MySQLはソケット経由でローカルホストに接続できます。これを行うには、`host`と`socket`を設定します。

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

設定フィールド:

- `host` – ClickHouseホスト。ローカルホストの場合、クエリはネットワーク通信なしで処理されます。耐障害性を向上させるには、[Distributed](../../engines/table-engines/special/distributed.md)テーブルを作成し、後続の設定で指定できます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザー名。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択条件。省略可能。
- `invalidate_query` – ディクショナリのステータスを確認するクエリ。オプションパラメータ。詳細は[LIFETIMEを使用したディクショナリデータの更新](#refreshing-dictionary-data-using-lifetime)セクションを参照してください。
- `secure` - 接続にSSLを使用。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと同時に使用できません。また、`table`または`query`フィールドのいずれかを宣言する必要があります。
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

- `host` – MongoDBホスト。
- `port` – MongoDBサーバーのポート。
- `user` – MongoDBユーザー名。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベース名。
- `collection` – コレクション名。
- `options` - MongoDB接続文字列オプション(オプションパラメータ)。

または

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド:

- `uri` - 接続を確立するためのURI。
- `collection` – コレクション名。

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


- `host` – Redisホスト。
- `port` – Redisサーバーのポート。
- `storage_type` – キーを扱うための内部Redisストレージの構造。`simple`はシンプルなソースおよびハッシュ化された単一キーソース用、`hash_map`は2つのキーを持つハッシュ化されたソース用です。範囲ソースおよび複合キーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は`simple`です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。

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

- `host` – Cassandraホストまたはカンマ区切りのホストリスト。
- `port` – Cassandraサーバーのポート。指定されていない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース(データベース)の名前。
- `column_family` – カラムファミリー(テーブル)の名前。
- `allow_filtering` – クラスタリングキー列に対する潜在的に高コストな条件を許可するかどうかのフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルのプライマリキーにおけるパーティションキー列の数。複合キーディクショナリに必要です。ディクショナリ定義におけるキー列の順序はCassandraと同じでなければなりません。デフォルト値は1です(最初のキー列がパーティションキーで、他のキー列がクラスタリングキーです)。
- `consistency` – 整合性レベル。指定可能な値: `One`、`Two`、`Three`、`All`、`EachQuorum`、`Quorum`、`LocalQuorum`、`LocalOne`、`Serial`、`LocalSerial`。デフォルト値は`One`です。
- `where` – オプションの選択条件。
- `max_threads` – 複合キーディクショナリにおいて複数のパーティションからデータをロードする際に使用するスレッドの最大数。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`column_family`または`where`フィールドは`query`フィールドと一緒に使用できません。また、`column_family`または`query`フィールドのいずれか一方を宣言する必要があります。
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

設定フィールド:


- `host` – PostgreSQLサーバーのホスト。すべてのレプリカに対して指定するか、各レプリカごとに個別に(`<replica>`内で)指定できます。
- `port` – PostgreSQLサーバーのポート。すべてのレプリカに対して指定するか、各レプリカごとに個別に(`<replica>`内で)指定できます。
- `user` – PostgreSQLユーザーの名前。すべてのレプリカに対して指定するか、各レプリカごとに個別に(`<replica>`内で)指定できます。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカに対して指定するか、各レプリカごとに個別に(`<replica>`内で)指定できます。
- `replica` – レプリカ設定のセクション。複数のセクションを指定できます:
  - `replica/host` – PostgreSQLホスト。
  - `replica/port` – PostgreSQLポート。
  - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度順にレプリカを走査します。数値が小さいほど優先度が高くなります。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択条件。条件の構文はPostgreSQLの`WHERE`句と同じです。例:`id > 10 AND id < 20`。オプションパラメータ。
- `invalidate_query` – ディクショナリのステータスを確認するためのクエリ。オプションパラメータ。詳細は[LIFETIMEを使用したディクショナリデータの更新](#refreshing-dictionary-data-using-lifetime)のセクションを参照してください。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。オプションパラメータ。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと同時に使用できません。また、`table`または`query`フィールドのいずれか一方を宣言する必要があります。
:::

### Null {#null}

ダミー(空)のディクショナリを作成するために使用できる特殊なソース。このようなディクショナリは、テストや、Distributedテーブルを持つノードでデータノードとクエリノードが分離されたセットアップで有用です。

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


## ディクショナリのキーとフィールド {#dictionary-key-and-fields}

<CloudDetails />

`structure`句は、クエリで利用可能なディクショナリのキーとフィールドを定義します。

XML記述:

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

属性は以下の要素で記述されます:

- `<id>` — キーカラム
- `<attribute>` — データカラム: 複数の属性を指定できます。

DDLクエリ:

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリ本体で記述されます:

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性を指定できます。


## キー {#key}

ClickHouseは以下のタイプのキーをサポートしています：

- 数値キー。`UInt64`型。`<id>`タグまたは`PRIMARY KEY`キーワードを使用して定義します。
- 複合キー。異なる型の値のセット。`<key>`タグまたは`PRIMARY KEY`キーワードで定義します。

XML構造には`<id>`または`<key>`のいずれかを含めることができます。DDLクエリには単一の`PRIMARY KEY`を含める必要があります。

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

設定フィールド：

- `name` – キーを含むカラムの名前。

DDLクエリの場合：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを含むカラムの名前。

### 複合キー {#composite-key}

キーは任意の型のフィールドから成る`tuple`にすることができます。この場合、[レイアウト](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`である必要があります。

:::tip
複合キーは単一の要素で構成することができます。これにより、例えば文字列をキーとして使用することが可能になります。
:::

キー構造は`<key>`要素で設定します。キーフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定します。例：

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

`dictGet*`関数へのクエリでは、タプルがキーとして渡されます。例：`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。


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

設定フィールド：


| Tag                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | 列名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Yes      |
| `type`                                               | ClickHouse のデータ型: [UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouse は、ディクショナリから指定されたデータ型への値のキャストを試みます。たとえば MySQL の場合、MySQL のソーステーブルではフィールドは `TEXT`、`VARCHAR`、`BLOB` のいずれかであっても、ClickHouse では `String` として取り込むことができます。<br/>[Nullable](../../sql-reference/data-types/nullable.md) は現在、[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache) ディクショナリでサポートされています。[IPTrie](#ip_trie) ディクショナリでは `Nullable` 型はサポートされていません。 | Yes      |
| `null_value`                                         | 存在しない要素に対するデフォルト値。<br/>この例では空文字列です。[NULL](../syntax.md#null) 値は `Nullable` 型に対してのみ使用できます（前述の型の説明行を参照してください）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes      |
| `expression`                                         | ClickHouse が値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式にはリモート SQL データベースの列名を指定できます。これを利用して、リモート列のエイリアスを作成できます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | No       |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、この属性には現在のキーの親キーの値が含まれます。[Hierarchical Dictionaries](#hierarchical-dictionaries) を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | No       |
| `injective`                                          | `id -> attribute` の写像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true` の場合、ClickHouse は `GROUP BY` 句の後に行われるディクショナリへの問い合わせを自動的に挿入できます。通常、これによりそのような問い合わせの回数を大幅に削減できます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | No       |
| `is_object_id`                                       | クエリが MongoDB ドキュメントに対して `ObjectID` で実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。 |



## 階層型ディクショナリ {#hierarchical-dictionaries}

ClickHouseは[数値キー](#numeric-key)を持つ階層型ディクショナリをサポートしています。

以下の階層構造を見てください:

```text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (中心部)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は以下のディクショナリテーブルとして表現できます。

| region_id | parent_region | region_name   |
| --------- | ------------- | ------------- |
| 1         | 0             | ロシア        |
| 2         | 1             | モスクワ        |
| 3         | 2             | 中心部        |
| 4         | 0             | イギリス |
| 5         | 4             | ロンドン        |

このテーブルには、各要素の直近の親のキーを格納する`parent_region`カラムが含まれています。

ClickHouseは外部ディクショナリ属性の階層プロパティをサポートしています。このプロパティを使用することで、上記のような階層型ディクショナリを設定できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得できます。

この例では、ディクショナリの構造は以下のようになります:

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

この辞書は、ポイント・イン・ポリゴンクエリ、すなわち「逆ジオコーディング」検索に最適化されています。座標（緯度/経度）が与えられると、その点を含むポリゴン/地域（国や地域の境界など、多数のポリゴンのセットから）を効率的に特定します。位置座標をそれを含む地域にマッピングする用途に適しています。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y'
  title='ClickHouseのポリゴン辞書'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

ポリゴン辞書の設定例：

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

対応する[DDLクエリ](/sql-reference/statements/create/dictionary)：

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

ポリゴン辞書を設定する際、キーは次の2つのタイプのいずれかである必要があります：

- 単純なポリゴン。点の配列です。
- マルチポリゴン。ポリゴンの配列です。各ポリゴンは点の二次元配列です。この配列の最初の要素はポリゴンの外側の境界であり、後続の要素はそこから除外される領域を指定します。

点は、座標の配列またはタプルとして指定できます。現在の実装では、二次元の点のみがサポートされています。

ユーザーは、ClickHouseがサポートするすべての形式で独自のデータをアップロードできます。

利用可能な[インメモリストレージ](#storing-dictionaries-in-memory)には3つのタイプがあります：

- `POLYGON_SIMPLE`。これは単純な実装で、各クエリに対してすべてのポリゴンを線形に走査し、追加のインデックスを使用せずに各ポリゴンの包含をチェックします。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して個別のインデックスが構築され、ほとんどの場合に包含を迅速にチェックできます（地理的地域に最適化されています）。
  また、検討対象の領域にグリッドが重ね合わされ、検討対象のポリゴン数が大幅に絞り込まれます。
  グリッドは、セルを再帰的に16等分することで作成され、2つのパラメータで設定されます。
  再帰の深さが`MAX_DEPTH`に達するか、セルが`MIN_INTERSECTIONS`個以下のポリゴンと交差する場合に分割が停止します。
  クエリに応答するために、対応するセルが存在し、そこに格納されているポリゴンのインデックスに交互にアクセスします。

- `POLYGON_INDEX_CELL`。この配置も上記のグリッドを作成します。同じオプションが利用可能です。各リーフセルに対して、そこに含まれるすべてのポリゴンの断片にインデックスが構築され、リクエストに迅速に応答できます。

- `POLYGON`。`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書を操作するための標準的な[関数](../../sql-reference/functions/ext-dict-functions.md)を使用して実行されます。
重要な違いは、ここではキーがそれを含むポリゴンを検索したい点になることです。

**例**

上記で定義された辞書を使用する例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

最後のコマンドを実行した結果、'points'テーブルの各点について、その点を含む最小面積のポリゴンが検索され、要求された属性が出力されます。

**例**

SELECTクエリを介してポリゴン辞書から列を読み取ることができます。辞書の設定または対応するDDLクエリで`store_polygon_key_column = 1`を有効にするだけです。

クエリ：


```sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], '値');

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
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ 値 │
└─────────────────────────────────┴───────┘
```


## 正規表現ツリー辞書 {#regexp-tree-dictionary}

この辞書は、階層的な正規表現パターンに基づいてキーを値にマッピングします。完全一致のキー検索ではなく、パターンマッチ検索(例:ユーザーエージェント文字列を正規表現パターンでマッチさせて分類する)に最適化されています。

<iframe
  width='1024'
  height='576'
  src='https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX'
  title='ClickHouse正規表現ツリー辞書の紹介'
  frameborder='0'
  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  referrerpolicy='strict-origin-when-cross-origin'
  allowfullscreen
></iframe>

### ClickHouseオープンソースで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、ClickHouseオープンソースにおいて、正規表現ツリーを含むYAMLファイルへのパスを指定するYAMLRegExpTreeソースを使用して定義します。

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

辞書ソース`YAMLRegExpTree`は正規表現ツリーの構造を表します。例:

```yaml
- regexp: 'Linux/(\d+[\.\d]*).+tlinux'
  name: "TencentOS"
  version: '\1'

- regexp: '\d+/tclwebkit(?:\d+[\.\d]*)'
  name: "Android"
  versions:
    - regexp: "33/tclwebkit"
      version: "13"
    - regexp: "3[12]/tclwebkit"
      version: "12"
    - regexp: "30/tclwebkit"
      version: "11"
    - regexp: "29/tclwebkit"
      version: "10"
```

この設定は正規表現ツリーノードのリストで構成されます。各ノードは以下の構造を持ちます:

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、`name`と`version`の2つの属性があります。最初のノードは両方の属性を定義しています。2番目のノードは`name`属性のみを定義しています。`version`属性は2番目のノードの子ノードによって提供されます。
  - 属性の値には、マッチした正規表現のキャプチャグループを参照する**後方参照**を含めることができます。例では、最初のノードの`version`属性の値は、正規表現内のキャプチャグループ`(\d+[\.\d]*)`への後方参照`\1`で構成されています。後方参照番号は1から9の範囲で、`$1`または`\1`(番号1の場合)と記述します。後方参照はクエリ実行時にマッチしたキャプチャグループに置き換えられます。
- **child nodes**: 正規表現ツリーノードの子ノードのリスト。各子ノードは独自の属性と(場合によっては)子ノードを持ちます。文字列マッチングは深さ優先で進行します。文字列が正規表現ノードにマッチした場合、辞書はそのノードの子ノードにもマッチするかどうかをチェックします。マッチする場合、最も深くマッチしたノードの属性が割り当てられます。子ノードの属性は、親ノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は任意です。例えば上記の例の`versions`などです。

正規表現ツリー辞書は、`dictGet`、`dictGetOrDefault`、`dictGetAll`関数を使用したアクセスのみを許可します。

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

この場合、まず最上層の2番目のノードで正規表現`\d+/tclwebkit(?:\d+[\.\d]*)`にマッチします。次に辞書は子ノードを調べ続け、文字列が`3[12]/tclwebkit`にもマッチすることを発見します。その結果、`name`属性の値は`Android`(最初の層で定義)となり、`version`属性の値は`12`(子ノードで定義)となります。


強力なYAML設定ファイルを使用することで、正規表現ツリー辞書をユーザーエージェント文字列パーサーとして利用できます。[uap-core](https://github.com/ua-parser/uap-core)をサポートしており、機能テスト[02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)でその使用方法を示しています

#### 属性値の収集 {#collecting-attribute-values}

リーフノードの値だけでなく、マッチした複数の正規表現から値を返すことが有用な場合があります。このような場合、専用の[`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall)関数を使用できます。ノードが型`T`の属性値を持つ場合、`dictGetAll`は0個以上の値を含む`Array(T)`を返します。

デフォルトでは、キーごとに返されるマッチ数は無制限です。`dictGetAll`のオプションの第4引数として上限を指定できます。配列は_トポロジカル順序_で格納されます。これは、子ノードが親ノードより前に配置され、兄弟ノードはソース内の順序に従うことを意味します。

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
  tag: "ClickHouse"
  topological_index: 1
  paths:
    - regexp: 'clickhouse\.com/docs(.*)'
      tag: "ClickHouse Documentation"
      topological_index: 0
      captured: '\1'
      parent: "ClickHouse"

- regexp: "/docs(/|$)"
  tag: "Documentation"
  topological_index: 2

- regexp: "github.com"
  tag: "GitHub"
  topological_index: 3
  captured: "NULL"
```

```sql
CREATE TABLE urls (url String) ENGINE=MergeTree ORDER BY url;
INSERT INTO urls VALUES ('clickhouse.com'), ('clickhouse.com/docs/en'), ('github.com/clickhouse/tree/master/docs');
SELECT url, dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2) FROM urls;
```

結果:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### マッチングモード {#matching-modes}

パターンマッチングの動作は、特定のディクショナリ設定で変更できます:

- `regexp_dict_flag_case_insensitive`: 大文字小文字を区別しないマッチングを使用します(デフォルトは`false`)。個別の式で`(?i)`と`(?-i)`を使用してオーバーライドできます。
- `regexp_dict_flag_dotall`: '.'が改行文字にマッチすることを許可します(デフォルトは`false`)。

### ClickHouse Cloudで正規表現ツリーディクショナリを使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した`YAMLRegExpTree`ソースはClickHouse Open Sourceでは動作しますが、ClickHouse Cloudでは動作しません。ClickHouse Cloudで正規表現ツリーディクショナリを使用するには、まずClickHouse Open SourceでローカルにYAMLファイルから正規表現ツリーディクショナリを作成し、次に`dictionary`テーブル関数と[INTO OUTFILE](../statements/select/into-outfile.md)句を使用してこのディクショナリをCSVファイルにダンプします。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSVファイルの内容は次のとおりです:

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプされたファイルのスキーマは次のとおりです:

- `id UInt64`: RegexpTreeノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義属性の名前。
- `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloudでディクショナリを作成するには、まず以下のテーブル構造で`regexp_dictionary_source_table`テーブルを作成します:

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

次に、以下のコマンドでローカルCSVを更新します:

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

詳細については、[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files)を参照してください。ソーステーブルを初期化した後、テーブルソースからRegexpTreeを作成できます:


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


## 組み込み辞書 {#embedded-dictionaries}

<SelfManaged />

ClickHouseには、ジオベースを操作するための組み込み機能が含まれています。

これにより、以下のことが可能になります:

- 地域のIDを使用して、希望する言語でその名前を取得する。
- 地域のIDを使用して、都市、地区、連邦管区、国、または大陸のIDを取得する。
- ある地域が別の地域の一部であるかどうかを確認する。
- 親地域のチェーンを取得する。

すべての関数は「translocality」をサポートしており、地域の所有権に関する異なる視点を同時に使用できます。詳細については、「ウェブ解析辞書を操作するための関数」のセクションを参照してください。

内部辞書はデフォルトパッケージでは無効になっています。
これらを有効にするには、サーバー設定ファイルで`path_to_regions_hierarchy_file`と`path_to_regions_names_files`のパラメータのコメントを解除してください。

ジオベースはテキストファイルから読み込まれます。

`regions_hierarchy*.txt`ファイルを`path_to_regions_hierarchy_file`ディレクトリに配置してください。この設定パラメータには`regions_hierarchy.txt`ファイル(デフォルトの地域階層)へのパスを含める必要があり、その他のファイル(`regions_hierarchy_ua.txt`)は同じディレクトリに配置する必要があります。

`regions_names_*.txt`ファイルを`path_to_regions_names_files`ディレクトリに配置してください。

これらのファイルは自分で作成することもできます。ファイル形式は以下の通りです:

`regions_hierarchy*.txt`: TabSeparated(ヘッダーなし)、カラム:

- 地域ID(`UInt32`)
- 親地域ID(`UInt32`)
- 地域タイプ(`UInt8`): 1 - 大陸、3 - 国、4 - 連邦管区、5 - 地域、6 - 都市; その他のタイプには値がありません
- 人口(`UInt32`) — オプションのカラム

`regions_names_*.txt`: TabSeparated(ヘッダーなし)、カラム:

- 地域ID(`UInt32`)
- 地域名(`String`) — エスケープされたものであっても、タブや改行を含めることはできません。

RAMへの格納にはフラット配列が使用されます。このため、IDは100万を超えないようにする必要があります。

辞書はサーバーを再起動することなく更新できます。ただし、利用可能な辞書のセットは更新されません。
更新時には、ファイルの変更時刻がチェックされます。ファイルが変更されている場合、辞書が更新されます。
変更をチェックする間隔は`builtin_dictionaries_reload_interval`パラメータで設定されます。
辞書の更新(初回使用時の読み込みを除く)はクエリをブロックしません。更新中、クエリは辞書の古いバージョンを使用します。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは辞書の古いバージョンを使用し続けます。

ジオベースを使用して辞書を定期的に更新することを推奨します。更新時には、新しいファイルを生成し、別の場所に書き込んでください。すべての準備が整ったら、サーバーが使用するファイルにリネームしてください。

OS識別子や検索エンジンを操作するための関数もありますが、これらは使用すべきではありません。
