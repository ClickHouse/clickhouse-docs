---
'description': 'ClickHouse での外部辞書機能の概要'
'sidebar_label': 'ディクショナリの定義'
'sidebar_position': 35
'slug': '/sql-reference/dictionaries'
'title': 'Dictionaries'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/docs/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Dictionaries

辞書とは、さまざまなリファレンスリストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリで使用できる辞書を操作するための特別な関数をサポートしています。リファレンステーブルとの`JOIN`を使用するよりも、関数と一緒に辞書を使用する方が簡単で効率的です。

ClickHouseは次のことをサポートしています：

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込まれた辞書](#embedded-dictionaries) 。

:::tip チュートリアル
ClickHouseの辞書に関する基本を学ぶためのチュートリアルがあります。 [こちら](tutorial.md)を参照してください。
:::

さまざまなデータソースから自分自身の辞書を追加できます。辞書のソースは、ClickHouseテーブル、ローカルのテキストファイルまたは実行可能ファイル、HTTP(s)リソース、または別のDBMSである可能性があります。詳細については、「[辞書のソース](#dictionary-sources)」を参照してください。

ClickHouse：

- 辞書を完全または部分的にRAMに保存します。
- 定期的に辞書を更新し、動的に欠落している値をロードします。言い換えれば、辞書は動的にロードできます。
- xmlファイルまたは[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成できます。

辞書の構成は、1つまたは複数のxmlファイルに格納されます。構成のパスは[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定されます。

辞書は、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定に応じて、サーバーの起動時または初回利用時にロードできます。

[dictionaries](/operations/system-tables/dictionaries)システムテーブルには、サーバーで構成された辞書に関する情報が含まれています。各辞書について次の情報が見られます：

- 辞書の状態
- 構成パラメータ
- 辞書が正常にロードされて以来のクエリ数や辞書に割り当てられたRAMの量などのメトリック

<CloudDetails />
## DDLクエリによる辞書の作成 {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDLクエリ](../../sql-reference/statements/create/dictionary.md)で作成でき、これは推奨される方法です。DDLで作成した辞書の場合：
- サーバーの構成ファイルに追加のレコードは追加されません。
- 辞書はテーブルやビューのようにファーストクラスのエンティティとして操作できます。
- データは辞書テーブル関数ではなく、慣れ親しんだSELECTを使用して直接読み取ることができます。
- 辞書は簡単に名前を変更できます。
## 設定ファイルによる辞書の作成 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
設定ファイルで辞書を作成することはClickHouse Cloudには適用されません。DDLを使用し（上記参照）、ユーザー`default`として辞書を作成してください。
:::

辞書の設定ファイルは次のフォーマットです：

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

同じファイル内で任意の数の辞書を[構成](#configuring-a-dictionary)できます。

:::note
小さな辞書の値を変換するには、`SELECT`クエリでその辞書を説明できます（[transform](../../sql-reference/functions/other-functions.md)関数を参照）。この機能は辞書に関連していません。
:::
## 辞書の構成 {#configuring-a-dictionary}

<CloudDetails />

xmlファイルを使用して辞書が構成されている場合、辞書の構成は次の構造を持ちます：

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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は次の構造を持ちます：

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
## メモリに辞書を保存する {#storing-dictionaries-in-memory}

辞書をメモリに保存する方法はさまざまです。

[flat](#flat)、[hashed](#hashed)、および[complex_key_hashed](#complex_key_hashed)を推奨します。これらは最適な処理速度を提供します。

キャッシュは、パフォーマンスが悪化する可能性があるため、推奨されません。詳細は、[cache](#cache)セクションを参照してください。

辞書のパフォーマンスを向上させるために、次の方法があります：

- `GROUP BY`の後に辞書を操作するための関数を呼び出す。
- 抽出する属性にinjectiveとしてマークを付ける。異なるキーに異なる属性値が対応する場合、その属性はinjectiveと呼ばれます。したがって、`GROUP BY`がキーによって属性値を取得する関数を使用すると、この関数は自動的に`GROUP BY`から除外されます。

ClickHouseは、辞書に関するエラーに対して例外を生成します。エラーの例：

- アクセス先の辞書をロードできませんでした。
- `cached`辞書に対するクエリでエラーが発生しました。

辞書のリストとそのステータスは、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

<CloudDetails />

構成は次のようになります：

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

レイアウトに`complex-key*`という単語が含まれない辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持っています。`complex-key*`辞書は複合キー（複雑で、任意の型）を持っています。

XML辞書の[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されています。

構成の例（カラム`key_column`はUInt64型です）：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合`complex`キーのXML辞書は`<key>`タグで定義されています。

構成の例（キーは[String](../../sql-reference/data-types/string.md)型の1つの要素を持っています）：
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
## メモリに辞書を保存する方法 {#ways-to-store-dictionaries-in-memory}

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

辞書は、フラットな配列の形式でメモリに完全に保存されます。辞書はどのくらいのメモリを使用するでしょうか？その量は、最大キーのサイズに比例します（使用するスペースで）。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型であり、値は`max_array_size`（デフォルトは500,000）まで制限されています。辞書を作成する際により大きなキーが発見された場合、ClickHouseは例外をスローし、辞書は作成されません。辞書のフラット配列の初期サイズは、`initial_array_size`設定によって制御されます（デフォルトは1024）。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）がすべて読み込まれます。

このメソッドは、利用可能な辞書の保存方法の中で最も優れたパフォーマンスを提供します。

構成の例：

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

辞書は、ハッシュテーブルの形式でメモリに完全に保存されています。辞書は、識別子の数に制限なく要素を含むことができます。実際には、キーの数は数千万に達することがあります。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）がすべて読み込まれます。

構成の例：

```xml
<layout>
  <hashed />
</layout>
```

または

```sql
LAYOUT(HASHED())
```

構成の例：

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
### sparse_hashed {#sparse_hashed}

`hashed`に似ていますが、CPU使用量を増加させる代わりにメモリを少なく使用します。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

構成の例：

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

このタイプの辞書には`shards`を使用することも可能であり、`sparse_hashed`にとっては、`hashed`よりも重要です。なぜなら、`sparse_hashed`は遅いためです。
### complex_key_hashed {#complex_key_hashed}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。`hashed`に似ています。

構成の例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。[sparse_hashed](#sparse_hashed)に似ています。

構成の例：

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

辞書は完全にメモリに保存されており、各属性は配列に保存されています。キー属性は、属性配列内のインデックスであるハッシュテーブルの形式で保存されます。辞書は、識別子の数に制限なく要素を含むことができます。実際には、キーの数は数千万に達することがあります。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）がすべて読み込まれます。

構成の例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。[hashed_array](#hashed_array)に似ています。

構成の例：

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

辞書は、範囲と対応する値のソートされた配列の形式のハッシュテーブルでメモリに保存されます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。このストレージ方法は、ハッシュされたものと同様の動作をし、キーに加えて日付/時間（任意の数値型）の範囲を使用できます。

例：テーブルには、各広告主に対する割引が次の形式で含まれています：

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields)内で`range_min`と`range_max`の要素を定義します。これらの要素は、要素`name`と`type`を含む必要があります（`type`が指定されていない場合、デフォルト型が使用されます - Date）。`type`は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）にすることができます。

:::note
`range_min`と`range_max`の値は`Int64`型に収まる必要があります。
:::

例：

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

これらの辞書を操作するには、`dictGet`関数に範囲が選択されるために、追加の引数を渡す必要があります：

```sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリの例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定した`id`および渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細：

- `id`が見つからない場合や、`id`に対する範囲が見つからない場合、属性の型のデフォルト値が返されます。
- 重複する範囲があり、`range_lookup_strategy=min`の場合、最小の`range_min`を持つ一致する範囲を返します。見つかった範囲が複数ある場合、最小の`range_max`を持つ範囲を返します。再度、複数の範囲が見つかった場合（いくつかの範囲が同じ`range_min`と`range_max`を持っている場合）、それらのランダムな範囲が返されます。
- 重複する範囲があり、`range_lookup_strategy=max`の場合、最大の`range_min`を持つ一致する範囲を返します。見つかった範囲が複数ある場合、最大の`range_max`を持つ範囲を返します。再度、複数の範囲が見つかった場合（いくつかの範囲が同じ`range_min`と`range_max`を持っている場合）、それらのランダムな範囲が返されます。
- `range_max`が`NULL`の場合、範囲はオープンです。`NULL`は最大の値と見なされます。`range_min`には、`1970-01-01`または`0`（-MAX_INT）がオープン値として使用されます。

構成の例：

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

重複する範囲とオープン範囲を持つ構成の例：

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
### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、範囲とその対応する値のソートされた配列を持つハッシュテーブルの形式でメモリに保存されます（[range_hashed](#range_hashed)を参照）。このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。

構成の例：

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

辞書は固定数のセルを持つキャッシュに保存されます。これらのセルには頻繁に使用される要素が含まれます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際、まずキャッシュが検索されます。データブロックごとに、キャッシュに存在しないか、古くなったすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を介してソースから要求されます。受信したデータはキャッシュに書き込まれます。

辞書にキーが見つからない場合、キャッシュを更新するタスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定で制御できます。

キャッシュ辞書の場合、キャッシュ内のデータの有効期限を設定できます[有効期限](#refreshing-dictionary-data-using-lifetime)設定が適用されます。有効期限が経過したセルの値は使用されず、キーは期限切れになります。次回使用する必要がある際には、そのキーが再リクエストされます。この動作は、`allow_read_expired_keys`設定で構成できます。

これは、辞書を保存するすべての方法の中で最も効果的でない方法です。キャッシュの速度は正しい設定や使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合にのみ適切に機能します（推奨は99％以上）。キャッシュの平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

設定`allow_read_expired_keys`が1に設定されている場合（デフォルトは0）。その場合、辞書は非同期更新をサポートできます。クライアントがキーを要求し、すべてのキーがキャッシュ内にあるが、一部が期限切れの場合、辞書は期限切れのキーをクライアントに返し、非同期にソースから取得します。

キャッシュのパフォーマンスを向上させるには、`LIMIT`を使用したサブクエリを使用し、辞書関数を外部から呼び出します。

すべてのタイプのソースがサポートされています。

設定の例：

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

十分なキャッシュサイズを設定してください。セルの数を選択するには実験が必要です：

1.  いくつかの値を設定します。
2.  クエリを実行して、キャッシュが完全に満杯になるまで続けます。
3.  `system.dictionaries`テーブルを使用してメモリ消費を評価します。
4.  必要なメモリ消費が達成されるまで、セルの数を増減します。

:::note
ClickHouseをソースとして使用しないでください。ランダムリードによるクエリ処理が遅くなります。
:::
### complex_key_cache {#complex_key_cache}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。`cache`に似ています。
### ssd_cache {#ssd_cache}

キャッシュと似ていますが、データはSSDに保存され、インデックスはRAMに保存されます。更新キューに関連するすべてのキャッシュ辞書設定は、SSDキャッシュ辞書にも適用できます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。`ssd_cache`に似ています。
### direct {#direct}

辞書はメモリに保存されず、リクエスト処理中に直接ソースにアクセスされます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプの[ソース](#dictionary-sources)がサポートされていますが、ローカルファイルはサポートされていません。

構成の例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)で使用されます。`direct`に似ています。
### ip_trie {#ip_trie}

このタイプのストレージは、ネットワークプレフィックス（IPアドレス）をASNなどのメタデータにマッピングするために使用されます。

**例**

ClickHouseにIPプレフィックスとマッピングが含まれるテーブルがあるとします：

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

このテーブルのために`ip_trie`辞書を定義します。`ip_trie`レイアウトは複合キーを必要とします：

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

キーは、許可されているIPプレフィックスを含む`String`型属性を1つだけ持つ必要があります。他の型はまだサポートされていません。

構文は次の通りです：

```sql
dictGetT('dict_name', 'attr_name', ip)
```

関数はIPv4用に`UInt32`またはIPv6用に`FixedString(16)`を取ります。例：

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

他の型はまだサポートされていません。この関数は、このIPアドレスに対応するプレフィックスの属性を返します。重複するプレフィックスがある場合、最も特定的なものが返されます。

データは完全にRAMに収まる必要があります。
## 有効期限を使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒で定義）に基づいて定期的に辞書を更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔およびキャッシュ辞書の無効化間隔です。

更新中、古いバージョンの辞書をクエリすることができます。辞書の更新（辞書を初めて使用するためにロードする際を除く）は、クエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに記録され、クエリは古いバージョンの辞書を使用し続けることができます。辞書の更新が成功した場合、古いバージョンの辞書は原子的に置き換えられます。

設定の例：

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

`<lifetime>0</lifetime>` (`LIFETIME(0)`)を設定すると、辞書の更新は防止されます。

更新のための時間間隔を設定でき、ClickHouseはこの範囲内で均等にランダムな時間を選択します。これは、多くのサーバーで更新時に辞書ソースへの負荷を分散するために必要です。

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

または

```sql
LIFETIME(MIN 300 MAX 360)
```

`<min>0</min>`および`<max>0</max>`の場合、ClickHouseはタイムアウトによって辞書を再ロードしません。
この場合、ClickHouseは、辞書構成ファイルが変更された場合、または`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合に辞書を早期に再ロードする可能性があります。

辞書を更新する際、ClickHouseサーバーは、[ソース](#dictionary-sources)のタイプに応じて異なるロジックを適用します：

- テキストファイルの場合、変更時間を確認します。以前に記録された時間と異なる場合、辞書が更新されます。
- 他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）については、辞書が実際に変更された場合にのみ更新するクエリを設定できます。これを行うには、以下の手順に従います：

- 辞書テーブルには、ソースデータが更新されると常に変更されるフィールドが必要です。
- ソースの設定では、変更するフィールドを取得するクエリを指定する必要があります。ClickHouseサーバーは、このクエリの結果を行として解釈し、この行が以前の状態と対照して変更されている場合、辞書が更新されます。クエリは、[source](#dictionary-sources)の設定内の`<invalidate_query>`フィールドで指定します。

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

または

```sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書には、同期更新と非同期更新が両方ともサポートされています。

また、`Flat`、`Hashed`、`ComplexKeyHashed`辞書は、前回の更新以降に変更されたデータのみを要求することができます。辞書ソースの構成の一部として`update_field`が指定されている場合、リクエストに以前の更新時刻の値（秒）が追加されます。ソースタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC）に応じて、`update_field`に異なるロジックが適用されます。

- ソースがHTTPの場合、`update_field`はクエリパラメータとして追加され、最後の更新時刻がパラメータの値として設定されます。
- ソースがExecutableの場合、`update_field`は実行可能スクリプトの引数として追加され、最後の更新時刻が引数の値として設定されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、`WHERE`の追加部分で、`update_field`が以前の更新時刻以上であるかどうかが比較されます。
    - デフォルトでは、この`WHERE`条件はSQLクエリの最高レベルでチェックされます。代わりに、条件はクエリ内の他の`WHERE`句でチェックできます。例：
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

`update_field`オプションが設定されている場合、追加のオプション`update_lag`を設定できます。`update_lag`オプションの値は、更新データをリクエストする前に以前の更新時刻から引かれます。

設定の例：

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
## 辞書のソース {#dictionary-sources}

<CloudDetails />

辞書は、さまざまなソースからClickHouseに接続できます。

辞書がxmlファイルを使用して構成されている場合、構成は次のようになります：

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

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の構成は次のようになります：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

ソースは`source`セクションで構成されます。

ソースタイプ[ローカルファイル](#local-file)、[実行可能ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)の場合、オプションの設定が利用可能です：

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

ソースのタイプ（`source_type`）：

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

設定の例：

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

設定フィールド：

- `path` – ファイルの絶対パス。
- `format` – ファイルフォーマット。[Formats](/sql-reference/formats)で説明されているすべてのフォーマットがサポートされています。

ソースが`FILE`の辞書をDDLコマンド（`CREATE DICTIONARY ...`）を介して作成する場合、ソースファイルは`user_files`ディレクトリ内に配置する必要があります。これは、DBユーザーがClickHouseノード上の任意のファイルにアクセスできないようにするためです。

**参照**

- [辞書関数](/sql-reference/table-functions/dictionary)
### 実行可能ファイル {#executable-file}

実行可能ファイルと作業することは、[メモリに辞書を保存する方法](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは実行可能ファイルのSTDINに必要なキーを要求します。そうでない場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

設定の例：

```xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

設定フィールド：

- `command` — 実行可能ファイルの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`にある場合）。
- `format` — ファイルフォーマット。すべてのフォーマットが[Formats](/sql-reference/formats)で説明されています。
- `command_termination_timeout` — 実行可能スクリプトは、メインの読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルはClickHouseが子プロセスにSIGTERM信号を送信する前に、`command_termination_timeout`秒でシャットダウンする時間を持ちます。`command_termination_timeout`は秒で指定されます。デフォルト値は10です。オプションです。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションです。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションです。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は結果の行の順序によって暗黙的に決まります。デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダ内で検索されます。追加のスクリプト引数は、ホワイトスペースで区切って指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`です。オプションパラメータです。
- `send_chunk_header` - データチャンクを処理するために送信する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML構成を介してのみ設定できます。DDLを介して実行可能ソースで辞書を作成することは無効です。それ以外の場合、DBユーザーはClickHouseノードで任意のバイナリを実行できます。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスのプールからデータをロードできます。このソースは、ソースからすべてのデータをロードする必要がある辞書レイアウトでは動作しません。実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用する場合に機能します。

実行可能プールは、指定されたコマンドでプロセスのプールを生成し、それを終了するまで実行します。プログラムは、STDINからデータを読み取り、それが利用可能な間、結果をSTDOUTに出力する必要があります。次のデータブロックをSTDINで待機することができます。ClickHouseは、データブロックを処理した後にSTDINを閉じず、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトはこのデータ処理方法に対応する準備が必要です — STDINをポーリングし、早くSTDOUTにデータをフラッシュする必要があります。

設定の例：

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

設定フィールド：

- `command` — 実行可能ファイルの絶対パス、またはファイル名（プログラムディレクトリが`PATH`に書かれている場合）。
- `format` — ファイルフォーマット。すべてのフォーマットが[Formats](/sql-reference/formats)で説明されています。
- `pool_size` — プールのサイズ。`pool_size`に0が指定されると、プールサイズの制限はありません。デフォルト値は`16`です。
- `command_termination_timeout` — 実行可能スクリプトは、メインの読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルはClickHouseが子プロセスにSIGTERM信号を送信する前に、`command_termination_timeout`秒でシャットダウンする時間を持ちます。秒で指定します。デフォルト値は10です。オプションパラメータです。
- `max_command_execution_time` — データブロックの処理のための最大実行可能スクリプトコマンド実行時間。秒で指定します。デフォルト値は10です。オプションパラメータです。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータです。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応は結果の行の順序によって暗黙的に決まります。デフォルト値はfalseです。オプションパラメータです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダ内で検索されます。追加のスクリプト引数はホワイトスペースで区切って指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションパラメータです。
- `send_chunk_header` - データチャンクを処理するために送信する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML構成を介してのみ設定できます。DDLを介して実行可能ソースで辞書を作成することは無効です。それ以外の場合、DBユーザーはClickHouseノードで任意のバイナリを実行できます。
### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[メモリに辞書を保存する方法](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは`POST`メソッドを介してリクエストを送信することで、必要なキーを要求します。

設定の例：

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

ClickHouseがHTTPSリソースにアクセスできるようにするには、サーバー構成で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)を構成する必要があります。

設定フィールド：

- `url` – ソースのURL。
- `format` – ファイルフォーマット。すべてのフォーマットが[Formats](/sql-reference/formats)で説明されています。
- `credentials` – 基本的なHTTP認証。オプションのパラメータです。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるカスタムHTTPヘッダーのすべてのエントリ。オプションのパラメータです。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエストで送信されるヘッダーに使用される識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンドを使用して辞書を作成する際（`CREATE DICTIONARY ...`）、HTTP辞書のリモートホストは、データベースユーザーが任意のHTTPサーバーにアクセスしないようにするために、設定の`remote_url_allow_hosts`セクションの内容と照合されます。
### DBMS {#dbms}
#### ODBC {#odbc}

このメソッドを使用して、ODBCドライバを持つ任意のデータベースに接続できます。

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

設定フィールド：

- `db` – データベースの名前。データベース名が `<connection_string>` パラメータに設定されている場合は省略します。
- `table` – テーブルとスキーマの名前（存在する場合）。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳しく読みます。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。オプションのパラメータです。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` と `query` フィールドは一緒に使用できません。また、`table` または `query` のいずれか一方のフィールドを宣言する必要があります。
:::

ClickHouseはODBCドライバから引用記号を受け取り、ドライバへのクエリ内のすべての設定を引用符で囲むため、テーブル名はデータベース内のテーブル名のケースに合わせて設定する必要があります。

Oracleを使用している際にエンコーディングに問題がある場合は、対応する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。
##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバを介してデータベースに接続する際、接続パラメータ `Servername` を置き換えることができます。この場合、`odbc.ini` の `USERNAME` と `PASSWORD` の値がリモートサーバーに送信され、漏洩する可能性があります。
:::

**安全でない使用例**

PostgreSQL用にunixODBCを設定しましょう。`/etc/odbc.ini`の内容：

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

その後、次のようなクエリを作成すると

```sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバは`odbc.ini`から`USERNAME`と`PASSWORD`の値を`some-server.com`に送信します。
##### PostgreSQLへの接続例 {#example-of-connecting-postgresql}

Ubuntu OSです。

PostgreSQL用のODBCドライバとunixODBCのインストール：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（またはClickHouseを実行しているユーザーとしてサインインしている場合、`~/.odbc.ini`）を設定します：

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

ClickHouseにおける辞書の設定：

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

`DRIVER=/usr/local/lib/psqlodbcw.so`のようにドライバのライブラリのフルパスを指定するために`odbc.ini`を編集する必要があるかもしれません。
##### MS SQL Serverへの接続例 {#example-of-connecting-ms-sql-server}

Ubuntu OSです。

MS SQLに接続するためのODBCドライバのインストール：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバの設定：

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

備考：
- 特定のSQL Serverバージョンがサポートする最も古いTDSバージョンを確認するには、製品のドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を見てください。

ClickHouseにおける辞書の設定：

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

設定フィールド：

- `port` – MySQLサーバーのポート。すべてのレプリカに対して指定することも、各レプリカ（`<replica>`内）ごとに指定することもできます。

- `user` – MySQLユーザーの名前。すべてのレプリカに対して指定することも、各レプリカごとに指定することもできます。

- `password` – MySQLユーザーのパスワード。すべてのレプリカに対して指定することも、各レプリカごとに指定することもできます。

- `replica` – レプリカ設定のセクション。複数のセクションが存在する可能性があります。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカを辿ります。数字が小さいほど優先度が高くなります。

- `db` – データベースの名前。

- `table` – テーブルの名前。

- `where` – 選択基準。条件の構文はMySQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`。オプションのパラメータです。

- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳しく読みます。

- `fail_on_connection_loss` – 接続中断時のサーバーの動作を制御する設定パラメータ。`true`の場合、クライアントとサーバー間の接続が失われた時点で例外が即座にスローされます。`false`の場合、ClickHouseサーバーは例外をスローする前に3回クエリの実行を再試行します。再試行により応答時間が増加することに注意してください。デフォルト値：`false`。

- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` または `where` フィールドは`query` フィールドと一緒に使用できません。そして、`table` または `query` のいずれか一方のフィールドを宣言する必要があります。
:::

:::note
`secure`という明示的なパラメータはありません。SSL接続を確立する際にはセキュリティが必要です。
:::

MySQLはソケットを介してローカルホストに接続できます。そのためには、`host` と `socket` を設定します。

設定例：

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

設定例：

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

設定フィールド：

- `host` – ClickHouseホスト。ローカルホストの場合、ネットワークアクティビティなしでクエリが処理されます。障害耐性を向上させるために、[Distributed](../../engines/table-engines/special/distributed.md)テーブルを作成し、後の設定に入力することができます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。省略可能です。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳しく読みます。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` または `where` フィールドは`query` フィールドと一緒に使用できません。そして、`table` または `query` のいずれか一方のフィールドを宣言する必要があります。
:::
#### MongoDB {#mongodb}

設定例：

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

設定フィールド：

- `host` – MongoDBホスト。
- `port` – MongoDBサーバーのポート。
- `user` – MongoDBユーザーの名前。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベースの名前。
- `collection` – コレクションの名前。
- `options` - MongoDB接続文字列オプション（オプションのパラメータ）。

または

```sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド：

- `uri` - 接続を確立するためのURI。
- `collection` – コレクションの名前。

[エンジンに関する詳細](../../engines/table-engines/integrations/mongodb.md)
#### Redis {#redis}

設定例：

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

設定フィールド：

- `host` – Redisホスト。
- `port` – Redisサーバーのポート。
- `storage_type` – キーで作業するために使用する内部Redisストレージの構造。`simple`は単純なソースと単一キーのハッシュソース用、`hash_map`は二つのキーを持つハッシュソース用です。範囲ソースや複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は`simple`です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。
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

設定フィールド：

- `host` – Cassandraホストまたはカンマ区切りのホストのリスト。
- `port` – Cassandraサーバーのポート。指定しない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリー（テーブル）の名前。
- `allow_filtering` – クラスタリングキー列に対する潜在的に高コストな条件を許可するフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルの主キーにおけるパーティションキー列の数。構成キー辞書に必要です。辞書定義におけるキー列の順序はCassandraと同じでなければなりません。デフォルト値は1（最初のキー列がパーティションキーであり、他のキー列がクラスタリングキー）です。
- `consistency` – 一貫性レベル。可能な値：`One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は`One`です。
- `where` – 選択基準（オプション）。
- `max_threads` – 構成キー辞書の複数のパーティションからデータをロードするために使用するスレッドの最大数。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`column_family` または `where` フィールドは`query` フィールドと一緒に使用できません。そして、`column_family` または `query` のいずれか一方のフィールドを宣言する必要があります。
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

設定フィールド：

- `host` – PostgreSQLサーバーのホスト。すべてのレプリカに対して指定することも、各レプリカ（`<replica>`内）ごとに指定することもできます。
- `port` – PostgreSQLサーバーのポート。すべてのレプリカに対して指定することも、各レプリカ（`<replica>`内）ごとに指定することもできます。
- `user` – PostgreSQLユーザーの名前。すべてのレプリカに対して指定することも、各レプリカ（`<replica>`内）ごとに指定することもできます。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカに対して指定することも、各レプリカ（`<replica>`内）ごとに指定することもできます。
- `replica` – レプリカ設定のセクション。複数のセクションが存在する可能性があります：
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカを辿ります。数字が小さいほど優先度が高くなります。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`。オプションのパラメータです。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳しく読みます。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。オプションのパラメータ。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table` または `where` フィールドは`query` フィールドと一緒に使用できません。そして、`table` または `query` のいずれか一方のフィールドを宣言する必要があります。
:::
### Null {#null}

ダミー（空の）辞書を作成するために使用できる特別なソースです。そのような辞書はテストに役立つことや、分散テーブルを持つノードにおいてデータとクエリノードが分離されているセットアップで役立ちます。

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

`structure`句は、辞書のキーと利用可能なフィールドを説明します。

XML記述：

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

属性は要素内で記述されています：

- `<id>` — キーカラム
- `<attribute>` — データカラム：複数の属性が存在する可能性があります。

DDLクエリ：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

属性はクエリ本文内に記述されています：

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性が存在する可能性があります。
## キー {#key}

ClickHouseは以下のタイプのキーをサポートしています：

- 数値キー。`UInt64`。`<id>`タグまたは`PRIMARY KEY`キーワードで定義されます。
- 複合キー。異なるタイプの値のセット。`<key>`タグまたは`PRIMARY KEY`キーワードで定義されます。

XML構造は`<id>`または`<key>`のいずれかを含むことができます。DDLクエリには単一の`PRIMARY KEY`を含める必要があります。

:::note
キーを属性として記述してはいけません。
:::
### 数値キー {#numeric-key}

タイプ：`UInt64`。

設定例：

```xml
<id>
    <name>Id</name>
</id>
```

設定フィールド：

- `name` – キーを持つカラムの名前。

DDLクエリ：

```sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを持つカラムの名前。
### 複合キー {#composite-key}

キーは任意のフィールドタイプからなる`tuple`にすることができます。この場合、[レイアウト](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`でなければなりません。

:::tip
複合キーは単一の要素で構成されることがあります。これにより、キーとして文字列を使用できるようになります。
:::

キー構造は`<key>`要素で設定されます。キーのフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例：

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
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*`関数へのクエリでは、キーとしてタプルが渡されます。例：`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。
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

| タグ                                                  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 必須 |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | はい  |
| `type`                                               | ClickHouseデータ型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書から指定されたデータ型に値をキャストしようとします。例えば、MySQLの場合、フィールドはMySQLソーステーブルで`TEXT`、`VARCHAR`、または`BLOB`である可能性がありますが、ClickHouseでは`String`としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は現在、[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)辞書をサポートしています。[IPTrie](#ip_trie)辞書では`Nullable`タイプはサポートされていません。 | はい  |
| `null_value`                                         | 非存在要素のデフォルト値。<br/>例では空の文字列です。[NULL](../syntax.md#null)値は`Nullable`型（前の行の型説明を参照）のみで使用できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい  |
| `expression`                                         | ClickHouseが値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>この式はリモートSQLデータベース内のカラム名である場合があります。これにより、リモートカラムのエイリアスを作成することができます。<br/><br/>デフォルト値：式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | いいえ |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`の場合、この属性は現在のキーの親キーの値を含みます。[階層辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | いいえ |
| `injective`                                          | `id -> attribute`マッピングが[単射](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true`の場合、ClickHouseは通常、リクエストの後に`GROUP BY`句を自動的に挿入することができます。通常、これによりそのようなリクエストの数が大幅に削減されます。<br/><br/>デフォルト値：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | いいえ |
| `is_object_id`                                       | クエリが`ObjectID`でMongoDBドキュメントに対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値：`false`。
## 階層辞書 {#hierarchical-dictionaries}

ClickHouseは[numéricキー](#numeric-key)を持つ階層辞書をサポートしています。

以下の階層構造を見てください：

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

この階層は以下の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | 中央          |
| 4          | 0              | グレートブリテン |
| 5          | 4              | ロンドン      |

このテーブルには、要素の近くの親のキーを保持するカラム`parent_region`があります。

ClickHouseは、外部辞書属性に階層プロパティをサポートしています。このプロパティにより、上記に述べたように階層辞書を設定できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得できます。

私たちの例では、辞書の構造は次のようになります：

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

ポリゴン辞書を使用すると、指定されたポイントを含むポリゴンを効率的に検索できます。
例えば、地理的座標によって都市のエリアを定義する場合などです。

ポリゴン辞書の構成例:

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

対応する [DDL-query](/sql-reference/statements/create/dictionary):
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

ポリゴン辞書を構成する際、キーは以下の2つのタイプのいずれかでなければなりません:

- 単純なポリゴン。これはポイントの配列です。
- MultiPolygon。これはポリゴンの配列です。各ポリゴンはポイントの二次元配列です。この配列の最初の要素はポリゴンの外側の境界であり、次の要素は除外する領域を指定します。

ポイントは配列または座標のタプルとして指定できます。現在の実装では、二次元ポイントのみがサポートされています。

ユーザーは、ClickHouseがサポートする全てのフォーマットで独自のデータをアップロードすることができます。

利用可能な3つの[in-memory storage](#storing-dictionaries-in-memory)のタイプがあります:

- `POLYGON_SIMPLE`。これはナイーブな実装であり、各クエリに対してすべてのポリゴンを線形に処理し、追加のインデックスを使用せずに各ポリゴンに対してメンバーシップがチェックされます。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して個別のインデックスが構築され、ほとんどのケースでそのポリゴンが属しているかを迅速に確認できるようになります（地理的地域用に最適化されています）。
また、考慮されるエリアにグリッドが重ねられ、検討されるポリゴンの数が大幅に絞り込まれます。
グリッドは、セルを16等分に再帰的に分割することによって作成され、2つのパラメータで構成されます。
分割は、再帰の深さが `MAX_DEPTH` に達するか、セルが `MIN_INTERSECTIONS` のポリゴンを超えないときに停止します。
クエリに応じて対応するセルが存在し、そのセルに格納されているポリゴンのインデックスに交互にアクセスされます。

- `POLYGON_INDEX_CELL`。この配置も上記のグリッドを作成します。同じオプションが利用可能です。各シートセルに対して、その中に入るすべてのポリゴンのパーツに基づいてインデックスが構築され、リクエストに迅速に応じることができます。

- `POLYGON`。`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書と共に作業するための標準の [functions](../../sql-reference/functions/ext-dict-functions.md) を使用して実行されます。
重要な違いは、ここでのキーは対応するポリゴンを見つけたいポイントになります。

**例**

上記で定義された辞書を使用する例:

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

'points' テーブルの各ポイントに対して最後のコマンドを実行した結果、該当ポイントを含む最小面積のポリゴンが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書から列をSELECTクエリを通じて読み込むことができます。これは、辞書の構成または対応するDDL-query内で `store_polygon_key_column = 1` をオンにするだけです。

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

結果:

```text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```
## 正規表現ツリーディクショナリ {#regexp-tree-dictionary}

正規表現ツリーディクショナリは、キーから属性へのマッピングを正規表現のツリーを使用して表現する特別なタイプの辞書です。例えば、[ユーザーエージェント](https://en.wikipedia.org/wiki/User_agent) ストリングの解析など、正規表現ツリーディクショナリを使って優雅に表現できるユースケースがあります。
### ClickHouseオープンソースで正規表現ツリーディクショナリを使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリーディクショナリは、正規表現ツリーを含むYAMLファイルへのパスを提供するYAMLRegExpTreeソースを使用してClickHouseオープンソースで定義されます。

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

辞書ソース `YAMLRegExpTree` は、正規表現ツリーの構造を表現します。例えば:

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

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは次の構造を持ちます:

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、`name` と `version` の2つの属性があります。最初のノードは両方の属性を定義します。2番目のノードは属性 `name` のみを定義します。属性 `version` は2番目のノードの子ノードによって提供されます。
  - 属性の値は、マッチした正規表現のキャプチャグループを参照する **バックリファレンス** を含むことがあります。この場合、最初のノードでの属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` に対するバックリファレンス `\1` で構成されます。バックリファレンスの番号は1から9までで、`$1` または `\1`（番号1の場合）として書かれます。バックリファレンスは、クエリ実行中に一致したキャプチャグループによって置き換えられます。
- **child nodes**: 正規表現ツリーノードの子ノードのリストで、それぞれ独自の属性と（潜在的に）子ノードを持ちます。文字列の一致は深さ優先で進行します。文字列が正規表現ノードに一致する場合、辞書はそれがノードの子ノードにも一致しているかを確認します。そうであれば、最も深い一致したノードの属性が割り当てられます。子ノードの属性は親ノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は任意であり、上記の例の `versions` などがこれに当たります。

Regexpツリーディクショナリは、`dictGet`、`dictGetOrDefault`、`dictGetAll` の関数を使用してのみアクセスを許可します。

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

この場合、最初に最上位層の第二ノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` に一致します。辞書は子ノードに進み、この文字列が `3[12]/tclwebkit` にも一致することを見つけます。その結果、属性 `name` の値が `Android`（第一層で定義されている）になり、属性 `version` の値が `12`（子ノードで定義されている）になります。

強力なYAML構成ファイルを使用すれば、正規表現ツリーディクショナリをユーザーエージェントストリングのパーサーとして使用できます。私たちは [uap-core](https://github.com/ua-parser/uap-core) をサポートし、機能テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) での使用方法を示します。
#### 属性値の収集 {#collecting-attribute-values}

時には、一つのリーフノードの値だけでなく、マッチした複数の正規表現からの値を返すことが有益な場合があります。この場合、専門的な [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 関数を使用できます。ノードに属性値タイプ `T` がある場合、`dictGetAll`はゼロ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返されるマッチの数に制限はありません。制限は、`dictGetAll` にオプションの4番目の引数として渡すことができます。この配列は _トポロジカル順序_ で埋められます。つまり、子ノードが親ノードの前に来て、兄弟ノードはソースの順序に従います。

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

結果:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```
#### マッチングモード {#matching-modes}

パターンマッチングの動作は、特定の辞書設定で修正可能です:
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチを使用します（デフォルトは `false` です）。個別の式で `(?i)` と `(?-i)` でオーバーライド可能です。
- `regexp_dict_flag_dotall`: '.' に改行文字が一致することを許可します（デフォルトは `false` です）。
### ClickHouse Cloudで正規表現ツリーディクショナリを使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記の `YAMLRegExpTree` ソースはClickHouseオープンソースで機能しますが、ClickHouse Cloudでは機能しません。ClickHouseで正規表現ツリー辞書を使用するには、まずClickHouseオープンソースでYAMLファイルから正規表現ツリーディクショナリを作成し、その後、`dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してこの辞書をCSVファイルにダンプします。

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

ダンプされたファイルのスキーマは次の通りです:

- `id UInt64`: RegexpTreeノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義属性の名前。
- `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloudで辞書を作成するには、まず以下のテーブル構造を持つ `regexp_dictionary_source_table` を作成します:

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

その後、ローカルCSVを次のように更新します:

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

詳細については、[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルが初期化された後、テーブルソースを介してRegexpTreeを作成できます:

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

ClickHouseには、ジオベースを操作するための組み込み機能があります。

これにより、次のことが可能になります:

- 地域のIDを使用して希望する言語でその名前を取得します。
- 地域のIDを使用して都市、地域、連邦地区、国、または大陸のIDを取得します。
- 地域が他の地域の一部であるかどうかを確認します。
- 親地域のチェーンを取得します。

すべての関数は「トランスローカリティ」をサポートしており、地域の所有権に関する異なる視点を同時に使用する能力を提供します。詳細については、「Web分析辞書に関する関数」のセクションを参照してください。

内部辞書はデフォルトパッケージで無効になっています。
有効にするには、サーバーの構成ファイルで `path_to_regions_hierarchy_file` および `path_to_regions_names_files` パラメータのコメントを解除します。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに置きます。この構成パラメータには、`regions_hierarchy.txt` ファイルへのパス（デフォルトの地域階層）が含まれている必要があり、他のファイル（`regions_hierarchy_ua.txt`など）は同じディレクトリに配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに置きます。

これらのファイルを自分で作成することもできます。ファイルフォーマットは次の通りです:

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、カラム:

- 地域ID（`UInt32`）
- 親地域ID（`UInt32`）
- 地域タイプ（`UInt8`）：1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 都市；他のタイプには値がありません
- 人口（`UInt32`） — オプションのカラム

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、カラム:

- 地域ID（`UInt32`）
- 地域名（`String`） — タブや改行を含むことができません（エスケープされているものを含む）。

RAMに保存するためにフラット配列が使用されます。このため、IDは100万を超えてはなりません。

辞書はサーバーを再起動せずに更新できます。ただし、利用可能な辞書のセットは更新されません。
更新時には、ファイルの修正時間がチェックされます。ファイルが変更された場合は、辞書が更新されます。
変更をチェックする間隔は、`builtin_dictionaries_reload_interval` パラメータで構成されます。
辞書の更新（初回使用時にロードする以外）はクエリをブロックしません。更新中、クエリは古い辞書バージョンを使用します。更新中にエラーが発生した場合、そのエラーはサーバーログに記録され、クエリは古いバージョンの辞書を使用し続けます。

ジオベースの辞書は定期的に更新することをお勧めします。更新中に新しいファイルを生成し、それらを別の場所に書き込みます。すべてが準備完了したら、サーバーが使用しているファイルにリネームします。

OS識別子や検索エンジンに関する関数もありますが、これらは使用しないべきです。
