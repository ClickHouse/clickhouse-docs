---
'description': 'ClickHouseにおける外部辞書機能の概要'
'sidebar_label': '辞書の定義'
'sidebar_position': 35
'slug': '/sql-reference/dictionaries'
'title': '辞書'
'doc_type': 'Reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# 辞書

辞書は、さまざまな種類の参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリで使用できる辞書を操作するための特別な関数をサポートしています。参照テーブルとの`JOIN`を使用するより、関数を使用して辞書を使用する方が簡単で効率的です。

ClickHouseは以下をサポートします：

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/embedded-dict-functions.md)を持つ[埋め込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouseの辞書を始めるためのチュートリアルがあります。詳細は[こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースは、ClickHouseのテーブル、ローカルのテキストまたは実行可能ファイル、HTTP(s)リソース、または別のDBMSである可能性があります。詳細については、 "[辞書ソース](#dictionary-sources)"を参照してください。

ClickHouseは：

- 辞書をRAMに完全または部分的に格納します。
- 定期的に辞書を更新し、欠落した値を動的にロードします。言い換えれば、辞書は動的にロード可能です。
- xmlファイルや[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成できます。

辞書の設定は1つまたは複数のxmlファイルに配置できます。設定のパスは[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定されます。

辞書は、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定に応じて、サーバー起動時または最初の使用時にロードできます。

[dictionaries](/operations/system-tables/dictionaries)システムテーブルには、サーバーに設定された辞書に関する情報が含まれています。各辞書について、そこで次の情報を見つけることができます：

- 辞書のステータス。
- 構成パラメータ。
- 辞書に割り当てられたRAMの量や、辞書が正常にロードされてからのクエリの数などのメトリクス。

<CloudDetails />
## DDLクエリを使用して辞書を作成する {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成でき、これは推奨される方法です。なぜならDDLで作成された辞書の場合：

- サーバー設定ファイルに追加のレコードが追加されません。
- 辞書はテーブルやビューのようにファーストクラスのエンティティとして操作できます。
- データは辞書テーブル関数を使用するのではなく、お馴染みのSELECTを使用して直接読み取ることができます。SELECT文を介して直接辞書にアクセスする場合、キャッシュされた辞書はキャッシュデータのみを返し、非キャッシュ辞書はそれが保持するすべてのデータを返します。
- 辞書は簡単に名前を変更できます。

## 設定ファイルを使用して辞書を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
設定ファイルを使用して辞書を作成することはClickHouse Cloudには適用できません。上記のDDLを使用して、ユーザー`default`として辞書を作成してください。
:::

辞書の設定ファイルは、次の形式を持っています：

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
`SELECT`クエリで辞書を説明することにより、小さな辞書の値を変換できます（[transform](../../sql-reference/functions/other-functions.md)関数を参照）。この機能は辞書に関連していません。
:::
## 辞書を構成する {#configuring-a-dictionary}

<CloudDetails />

辞書がxmlファイルを使用して構成される場合、辞書の構成は次の構造を持っています：

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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の構造は次のとおりです：

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
## メモリに辞書を格納する {#storing-dictionaries-in-memory}

メモリに辞書を格納するさまざまな方法があります。

[flat](#flat)、[hashed](#hashed)、および[complex_key_hashed](#complex_key_hashed)を推奨します。これらは最適な処理速度を提供します。

パフォーマンスが悪い可能性があるため、キャッシングは推奨されません。また、最適なパラメータを選択するのが難しくなります。詳細は[キャッシュ](#cache)セクションを参照してください。

辞書のパフォーマンスを向上させる方法はいくつかあります：

- `GROUP BY`の後に辞書を操作する関数を呼び出します。
- 抽出する属性を注入的にマークします。異なるキーが異なる属性値に対応する場合、属性は注入的と呼ばれます。したがって、`GROUP BY`がキーによって属性値を取得する関数を使用する場合、この関数は自動的に`GROUP BY`から取り除かれます。

ClickHouseは、辞書に関するエラーに対して例外を生成します。エラーの例：

- アクセスされた辞書がロードできませんでした。
- `cached`辞書のクエリ中にエラーが発生しました。

[dictionary](../../operations/system-tables/dictionaries.md)システムテーブルで辞書とそのステータスのリストを表示できます。

<CloudDetails />

構成はこのようになります：

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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)：

```sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- layout settings
...
```

レイアウトに`complex-key*`の単語が含まれていない辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`辞書は複合キー（複雑、任意の型）を持ちます。

XML辞書の[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されます。

構成例（カラムkey_columnはUInt64型を持つ）：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合`complex`キーXML辞書は`<key>`タグで定義されています。

複合キーの構成例（キーは[String](../../sql-reference/data-types/string.md)型の要素を1つ持ちます）：
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
## メモリに辞書を格納する方法 {#ways-to-store-dictionaries-in-memory}

メモリ内の辞書データを格納するさまざまな方法は、CPUとRAM使用のトレードオフに関連しています。辞書関連の[ブログ記事](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)の「レイアウトの選択」段落に掲載されている決定木は、どのレイアウトを使用するかを決定するための良い出発点です。

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

辞書は、フラット配列の形式で完全にメモリに格納されます。辞書はどれだけのメモリを使用しますか？その量は、最大キーのサイズ（使用されるスペースに比例）に従います。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型を持ち、値は`max_array_size`（デフォルトは500,000）に制限されます。辞書を作成中により大きなキーが発見された場合、ClickHouseは例外をスローし、辞書を作成しません。辞書のフラット配列の初期サイズは`initial_array_size`設定で制御されます（デフォルトは1024）。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）が完全に読み込まれます。

この方法は辞書の格納方式の中で最も優れたパフォーマンスを提供します。

構成例：

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

辞書は完全にメモリに格納され、ハッシュテーブルの形式になります。辞書は、識別子の異なる任意の数の要素を含むことができます。実際には、キーの数は数千万件に達することがあります。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）が完全に読み込まれます。

構成例：

```xml
<layout>
  <hashed />
</layout>
```

または

```sql
LAYOUT(HASHED())
```

構成例：

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

`hashed`と似ていますが、より少ないメモリを使用し、CPU使用量が増えます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

構成例：

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

このタイプの辞書には`shards`を使用することもできますが、再度`sparse_hashed`は`hashed`よりも重要です。なぜなら`sparse_hashed`は遅いためです。
### complex_key_hashed {#complex_key_hashed}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用するためのものです。`hashed`に似ています。

構成例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用するためのものです。[sparse_hashed](#sparse_hashed)に似ています。

構成例：

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

辞書は完全にメモリに格納されます。各属性は配列に格納されます。キー属性は、属性配列内のインデックスとして値を持つハッシュテーブルの形式で格納されます。辞書は、識別子の異なる任意の数の要素を含むことができます。実際には、キーの数は数千万件に達することがあります。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのタイプのソースがサポートされています。更新時には、データ（ファイルまたはテーブルから）が完全に読み込まれます。

構成例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用するためのものです。[hashed_array](#hashed_array)に似ています。

構成例：

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

辞書は、範囲とそれに対応する値の順序付き配列の形式のハッシュテーブルに格納されます。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型を持っています。このストレージ方法は、hashedと同様に機能し、キーに加えて日付/時間（任意の数値型）の範囲を使用することができます。

例：テーブルは、各広告主の割引を次のフォーマットで含みます：

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するためには、[structure](#dictionary-key-and-fields)内に`range_min`および`range_max`要素を定義します。これらの要素は、`name`および`type`を含む必要があります（`type`が指定されていない場合は、デフォルトタイプが使用されます - Date）。`type`は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）を使用できます。

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

これらの辞書を操作するには、`dictGet`関数に追加の引数を渡す必要があり、範囲が選択されます：

```sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリの例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された`id`と渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細：

- `id`が見つからないか、`id`に対する範囲が見つからない場合、属性の型のデフォルト値を返します。
- 範囲が重複していて`range_lookup_strategy=min`の場合、最小の`range_min`を持つ一致する範囲を返します。複数の範囲が見つかった場合は、最小の`range_max`を持つ範囲を返します。また再度複数の範囲が見つかった場合（複数の範囲が同じ`range_min`および`range_max`を持っている場合、その中からランダムな範囲を返します。
- 範囲が重複していて`range_lookup_strategy=max`の場合、最大の`range_min`を持つ一致する範囲を返します。複数の範囲が見つかった場合は、最大の`range_max`を持つ範囲を返します。また再度複数の範囲が見つかった場合（複数の範囲が同じ`range_min`および`range_max`を持っている場合、その中からランダムな範囲を返します。
- `range_max`が`NULL`の場合、その範囲はオープンです。`NULL`は最大の可能な値として扱われます。`range_min`については、`1970-01-01`または`0`（-MAX_INT）がオープン値として使用できます。

構成例：

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

重複範囲およびオープン範囲の構成例：

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

辞書は、範囲とそれに対応する値の順序付き配列の形式のハッシュテーブルに格納され、複合[キー](#dictionary-key-and-fields)と一緒に使用されます。

構成例：

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

辞書は固定数のセルを持つキャッシュに格納されています。これらのセルには、頻繁に使用される要素が含まれています。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際は、最初にキャッシュが検索されます。データの各ブロックについて、キャッシュに見つからないか、古いすべてのキーが、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を使用してソースからリクエストされます。取得したデータはキャッシュに書き込まれます。

辞書にキーが見つからない場合、キャッシュの更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定を使用して制御できます。

キャッシュ辞書の場合、キャッシュ内のデータの有効期限[lifetime](#refreshing-dictionary-data-using-lifetime)を設定できます。セル内のデータがロードされてから`lifetime`よりも時間が経過すると、セルの値は使用されず、キーが期限切れになります。次回そのキーを使用する必要があるときに再リクエストされます。この動作は、`allow_read_expired_keys`設定を使用して構成できます。

これは、辞書を格納する方法の中で最も効果的でありません。キャッシュの速度は、正しい設定と使用シナリオに大きく依存します。キャッシュタイプの辞書は、ヒット率が十分に高い場合にのみ良好なパフォーマンスを発揮します（推奨99％以上）。[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで平均ヒット率を確認できます。

設定`allow_read_expired_keys`が1に設定されている場合、デフォルト値は0です。そうすると、辞書は非同期更新をサポートします。クライアントがキーを要求し、キャッシュ内にすべてのキーがあるが一部が期限切れの場合、辞書は期限切れのキーをクライアントに返し、それらを非同期でソースからリクエストします。

キャッシュのパフォーマンスを向上させるには、`LIMIT`のあるサブクエリを使用し、辞書を外部で呼び出します。

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

十分に大きなキャッシュサイズを設定してください。セルの数を選択するために実験が必要です：

1.  値を設定します。
2.  キャッシュが完全にいっぱいになるまでクエリを実行します。
3.  `system.dictionaries`テーブルを使用してメモリ消費を評価します。
4.  要求されるメモリ消費に達するまでセルの数を増減します。

:::note
ClickHouseをソースとして使用しないでください。なぜなら、ランダムリードでクエリを処理するのが遅いためです。
:::
### complex_key_cache {#complex_key_cache}

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用されます。`cache`に似ています。
### ssd_cache {#ssd_cache}

`cache`に似ていますが、データをSSDに格納し、インデックスはRAMに保存します。更新キューに関連するキャッシュ辞書のすべての設定もSSDキャッシュ辞書に適用できます。

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用されます。`ssd_cache`に似ています。
### direct {#direct}

辞書はメモリに格納されず、リクエスト処理中にソースに直接アクセスします。

辞書キーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべての[ソース](#dictionary-sources)タイプがサポートされており、ローカルファイルは除外されます。

構成例：

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

このタイプのストレージは、複合[キー](#dictionary-key-and-fields)と一緒に使用されます。`direct`に似ています。
### ip_trie {#ip_trie}

この辞書は、ネットワークプレフィックスによるIPアドレスの検索に対応しています。CIDR表記でIP範囲を保持し、特定のプレフィックス（例：サブネットまたはASN範囲）を持つIPがどれに属するかを迅速に判断できるため、ジオロケーションやネットワーク分類などのIPベースの検索に最適です。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/4dxMAqltygk?si=rrQrneBReK6lLfza" title="ip_trie辞書によるIPベースの検索" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

**例**

ClickHouseに含まれるIPプレフィックスとマッピングを持つテーブルがあるとします：

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

このテーブルに対して`ip_trie`辞書を定義しましょう。`ip_trie`レイアウトは複合キーを要求します。

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

キーは、許可されたIPプレフィックスを含む`String`型属性を1つだけ持つ必要があります。他の型はまだサポートされていません。

構文は次のとおりです：

```sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4の場合は`UInt32`、IPv6の場合は`FixedString(16)`を取ります。例えば：

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

他の型はまだサポートされていません。この関数は、このIPアドレスに対応するプレフィックスの属性を返します。重複するプレフィックスがある場合は、最も特定のものが返されます。

データは完全にRAMに収まる必要があります。
## 有効期限を使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒単位で定義）に基づいて、定期的に辞書を更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔とキャッシュされた辞書の無効化間隔です。

更新中は、旧バージョンの辞書もクエリを実行できます。辞書の更新（辞書の最初の使用のためにロードする場合を除く）は、クエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは旧バージョンの辞書を使用し続けます。辞書の更新が成功すると、古い辞書のバージョンは原子的に置き換えられます。

設定例：

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

設定`<lifetime>0</lifetime>`（`LIFETIME(0)`）は、辞書の更新を防ぎます。

更新のための時間間隔を設定でき、ClickHouseはこの範囲内で均等にランダムな時間を選択します。これは、多数のサーバーでの更新時に辞書ソースの負荷を分散するために必要です。

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

`<min>0</min>`および`<max>0</max>`の場合、ClickHouseはタイムアウトによって辞書の再読み込みを行いません。この場合、ClickHouseは辞書設定ファイルが変更された場合や、`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合に辞書を早期に再読み込みできます。

辞書の更新時、ClickHouseサーバーは[ソース](#dictionary-sources)のタイプによって異なるロジックを適用します：

- テキストファイルの場合、変更時間をチェックします。変更された時間が以前に記録された時間と異なる場合、辞書は更新されます。
- その他のソースからの辞書は、デフォルトで毎回更新されます。

その他のソース（ODBC、PostgreSQL、ClickHouseなど）については、辞書が実際に変更された場合のみ更新するクエリを設定できます。これを実現するには、次の手順を踏んでください：

- 辞書テーブルには、ソースデータが更新されるたびに必ず変更されるフィールドが必要です。
- ソースの設定には、変更フィールドを取得するクエリを指定する必要があります。ClickHouseサーバーは、クエリ結果を行として解釈し、この行が以前の状態と比較して変更されている場合、辞書が更新されます。`<invalidate_query>`フィールドにクエリを指定します。

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

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`の辞書では、同期および非同期更新の両方がサポートされています。

`Flat`、`Hashed`、`HashedArray`、`ComplexKeyHashed`の辞書も、前回の更新後に変更されたデータのみを要求できます。辞書ソースの設定の一部として`update_field`が指定されている場合、前回の更新時間の値が要求データに追加されます。ソースのタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC）によって、`update_field`の異なるロジックが適用されます。

- ソースがHTTPの場合、`update_field`は最後の更新時間をパラメータ値として持つクエリパラメータとして追加されます。
- ソースがExecutableの場合、`update_field`は最後の更新時間を引数値として持つ実行可能スクリプトの引数として追加されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、`update_field`が最後の更新時間以上であることと比較する`WHERE`の追加部分があります。
  - デフォルトでは、この`WHERE`条件はSQLクエリの最上部でチェックされます。あるいは、`{condition}`キーワードを使用して、クエリ内の他の`WHERE`句で条件をチェックすることもできます。例：
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

`update_field`オプションが設定されている場合、追加オプション`update_lag`を設定できます。`update_lag`オプションの値は、更新されたデータを要求する前に前回の更新時間から減算されます。

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
## 辞書ソース {#dictionary-sources}

<CloudDetails />

辞書は、多くの異なるソースからClickHouseに接続できます。

辞書がxmlファイルを使用して設定されている場合、構成は次のようになります：

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

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の構成は次のように見えます：

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Source configuration
...
```

ソースは`source`セクションで設定されます。

[Local file](#local-file)、[Executable file](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)のソースタイプには、オプション設定が利用できます：

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

ソースタイプ（`source_type`）：

- [Local file](#local-file)
- [Executable File](#executable-file)
- [Executable Pool](#executable-pool)
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

- `path` – ファイルへの絶対パス。
- `format` – ファイル形式。[Formats](/sql-reference/formats)で説明されているすべての形式がサポートされています。

ソースが`FILE`の辞書がDDLコマンドで作成されるとき（`CREATE DICTIONARY ...`）、ソースファイルは`user_files`ディレクトリ内にある必要があります。これにより、DBユーザーがClickHouseノード上の任意のファイルにアクセスするのを防ぎます。

**関連情報**

- [辞書関数](/sql-reference/table-functions/dictionary)
### 実行可能ファイル {#executable-file}

実行可能ファイルとの作業は、[メモリに辞書がどのように保存されるか](#storing-dictionaries-in-memory)に依存します。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは実行可能ファイルのSTDINにリクエストを送信することによって必要なキーを要求します。さもなければ、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

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

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`にある場合）。
- `format` — ファイル形式。[Formats](/sql-reference/formats)で説明されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能スクリプトは、主な読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒内にシャットダウンする必要があります。デフォルト値は10。オプションのパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るタイムアウト（ミリ秒単位）。デフォルト値10000。オプションのパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込むタイムアウト（ミリ秒単位）。デフォルト値10000。オプションのパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーへの対応は結果の行の順序によって暗黙的に決定されます。デフォルト値はfalse。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダ内で検索されます。追加のスクリプト引数はスペース区切りを使用して指定できます。例：`script_name arg1 arg2`。 `execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`。オプションのパラメータ。
- `send_chunk_header` - データのチャンクを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`。

この辞書ソースはXML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書の作成は無効になっています。そうしないと、DBユーザーはClickHouseノードで任意のバイナリを実行できるようになります。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスのプールからデータをロードすることを可能にします。このソースは、ソースからすべてのデータをロードする必要がある辞書レイアウトと一緒に機能しません。実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して保存されている場合に機能します。

実行可能プールは、指定されたコマンドでプロセスのプールを生成し、終了するまでそれらを実行し続けます。プログラムは、STDINからデータを読み取り、結果をSTDOUTに出力する必要があります。次のデータブロックをSTDINで待機できます。ClickHouseは、データブロックの処理後にSTDINを閉じることはありませんが、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトは、このデータ処理の方法に対応できなければなりません — STDINをポーリングし、早期にSTDOUTにデータを書き込む必要があります。

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

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムディレクトリが`PATH`に記載されている場合）。
- `format` — ファイル形式。すべての形式が"[Formats](/sql-reference/formats)"のいずれかがサポートされています。
- `pool_size` — プールのサイズ。`pool_size`に0が指定された場合、プールサイズの制限はありません。デフォルト値は`16`。
- `command_termination_timeout` — 実行可能スクリプトは主な読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒内にシャットダウンする必要があります。指定は秒単位です。デフォルト値は10。オプションのパラメータ。
- `max_command_execution_time` — データブロックを処理するための最大実行可能スクリプトコマンド実行時間。指定は秒単位です。デフォルト値は10。オプションのパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るタイムアウト（ミリ秒単位）。デフォルト値10000。オプションのパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込むタイムアウト（ミリ秒単位）。デフォルト値10000。オプションのパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、要求されたキーへの対応は結果の行の順序によって暗黙的に決定されます。デフォルト値はfalse。オプションのパラメータ。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダ内で検索されます。追加のスクリプト引数はスペース区切りを使用して指定できます。例：`script_name arg1 arg2`。 `execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`。オプションのパラメータ。
- `send_chunk_header` - データを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`。

この辞書ソースはXML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書の作成は無効になっています。そうしないと、DBユーザーはClickHouseノード上で任意のバイナリを実行できる可能性があります。

### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリに保存されている方法](#storing-dictionaries-in-memory)に依存します。辞書が `cache` および `complex_key_cache` を使用して保存されている場合、ClickHouseは `POST` メソッドを介してリクエストを送信することにより、必要なキーを要求します。

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

ClickHouseがHTTPSリソースにアクセスするには、サーバー構成で[openSSLを設定](../../operations/server-configuration-parameters/settings.md#openssl)する必要があります。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。[「フォーマット」](/sql-reference/formats)に記載されているすべての形式がサポートされています。
- `credentials` – 基本HTTP認証。オプションのパラメータ。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリ。オプションのパラメータ。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエストで送信されるヘッダーの識別子名。
- `value` – 特定の識別子名に設定された値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成する際、HTTP辞書のリモートホストは、データベースユーザーが任意のHTTPサーバーにアクセスするのを防ぐために、設定の `remote_url_allow_hosts` セクションの内容と照合されます。

### DBMS {#dbms}
#### ODBC {#odbc}

ODBCドライバーを持つ任意のデータベースに接続するために、この方法を使用できます。

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

- `db` – データベースの名前。`<connection_string>` パラメータでデータベース名が設定されている場合は省略できます。
- `table` – テーブル名（存在する場合はスキーマ名）。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションのパラメータ。 [LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を読む。
- `background_reconnect` – 接続に失敗した場合にレプリカにバックグラウンドで再接続します。オプションのパラメータ。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table` と `query` フィールドは一緒に使用できません。`table` または `query` フィールドのいずれか一方は宣言する必要があります。
:::

ClickHouseはODBCドライバーから引用符を受け取り、ドライバーへのクエリ内のすべての設定を引用符で囲むため、テーブル名はデータベースのテーブル名のケースに合わせて設定する必要があります。

Oracleを使用する場合にエンコーディングに問題がある場合は、対応する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。

##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する場合、接続パラメータ `Servername` を置き換えることができます。この場合、`odbc.ini` の `USERNAME` および `PASSWORD` の値がリモートサーバーに送信され、危険にさらされる可能性があります。
:::

**安全でない使用の例**

PostgreSQL用にunixODBCを構成します。 `/etc/odbc.ini`の内容：

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

ODBCドライバーは `odbc.ini` の `USERNAME` および `PASSWORD` の値を `some-server.com` に送信します。

##### PostgreSQLへの接続の例 {#example-of-connecting-postgresql}

Ubuntu OS。

PostgreSQL用のunixODBCおよびODBCドライバーをインストールします：

```bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`を構成します（ClickHouseを実行しているユーザーでサインインしている場合は `~/.odbc.ini`）：

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

ClickHouseの辞書構成：

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

ODBCドライバーを指定するために、`odbc.ini`を編集して、ドライバーのライブラリへのフルパスを指定する必要があるかもしれません `DRIVER=/usr/local/lib/psqlodbcw.so`。

##### MS SQL Serverへの接続の例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLへの接続用のODBCドライバーをインストールします：

```bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーを構成します：

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
- 特定のSQL Serverバージョンでサポートされる最も古いTDSバージョンを特定するには、製品ドキュメントを参照するか、[MS-TDS製品動作](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を確認してください。

ClickHouseの辞書を構成します：

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

- `port` – MySQLサーバーのポート。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。

- `user` – MySQLユーザー名。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。

- `password` – MySQLユーザーのパスワード。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。

- `replica` – レプリカ構成のセクション。複数のセクションが存在する可能性があります。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカをたどります。数字が小さいほど優先度が高いです。

- `db` – データベースの名前。

- `table` – テーブルの名前。

- `where` – 選択基準。条件の構文はMySQLの `WHERE` 句と同じで、例えば、 `id > 10 AND id < 20` などです。オプションのパラメータ。

- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションのパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を読む。

- `fail_on_connection_loss` – 接続ロス時のサーバーの動作を制御する構成パラメータ。 `true` の場合、クライアントとサーバー間の接続が失われるとすぐに例外がスローされます。 `false` の場合、ClickHouseサーバーは例外がスローされる前に3回クエリの実行を再試行します。再試行は応答時間が長くなることに注意してください。デフォルト値： `false`。

- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table` または `where` フィールドは `query` フィールドと共に使用できません。 `table` または `query` フィールドのいずれか一方は宣言する必要があります。
:::

:::note
明示的な `secure` パラメータはありません。SSL接続を確立する際にはセキュリティが必須です。
:::

MySQLにはローカルホストを介してソケットで接続可能です。そのためには、 `host` および `socket` を設定します。

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

- `host` – ClickHouseホスト。ローカルホストの場合、クエリはネットワークアクティビティなしで処理されます。耐障害性を改善するために、[分散テーブル](../../engines/table-engines/special/distributed.md)を作成し、その後の構成にそれを入力することができます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。省略可能です。
- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションのパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を読む。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table` または `where` フィールドは `query` フィールドと共に使用できません。 `table` または `query` フィールドのいずれか一方は宣言する必要があります。
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

[エンジンに関する詳細情報](../../engines/table-engines/integrations/mongodb.md)

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
- `storage_type` – キーとの作業に使用される内部Redisストレージの構造。 `simple` は単純なソースおよびハッシュされた単一キーソース用、 `hash_map` は二つのキーを持つハッシュされたソース用です。範囲ソースおよび複雑なキーのキャッシュソースはサポートされていません。省略可能で、デフォルト値は `simple` です。
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
- `port` – Cassandraサーバーのポート。指定されていない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリー（テーブル）の名前。
- `allow_filtering` – クラスタリングキー列に対する潜在的に高コストな条件を許可するフラグ。デフォルト値は1。
- `partition_key_prefix` – Cassandraテーブルの主キー内のパーティションキー列の数。合成キー辞書には必須です。辞書定義内のキー列の順序はCassandraにおける順序と同じでなければなりません。デフォルト値は1（最初のキー列がパーティションキーで、他のキー列がクラスタリングキーです）。
- `consistency` – 一貫性レベル。可能な値： `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は `One` です。
- `where` – オプションの選択基準。
- `max_threads` – 合成キー辞書から複数のパーティションのデータをロードするために使用する最大スレッド数。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`column_family` または `where` フィールドは `query` フィールドと共に使用できません。`column_family` または `query` フィールドのいずれか一方は宣言する必要があります。
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

- `host` – PostgreSQLサーバーのホスト。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。
- `port` – PostgreSQLサーバーのポート。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。
- `user` – PostgreSQLユーザーの名前。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカまたは個々の各レプリカ（ `<replica>` 内）に指定できます。
- `replica` – レプリカ構成のセクション。複数のセクションが存在する可能性があります：
  - `replica/host` – PostgreSQLホスト。
  - `replica/port` – PostgreSQLポート。
  - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカをたどります。数字が小さいほど優先度が高いです。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの `WHERE` 句と同じです。例えば、 `id > 10 AND id < 20` などです。オプションのパラメータ。
- `invalidate_query` – 辞書のステータスを確認するためのクエリ。オプションのパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションで詳細を読む。
- `background_reconnect` – 接続に失敗した場合にレプリカにバックグラウンドで再接続します。オプションのパラメータ。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table` または `where` フィールドは `query` フィールドと共に使用できません。`table` または `query` フィールドのいずれか一方は宣言する必要があります。
:::

### Null {#null}

ダミー（空）辞書を作成するために使用できる特別なソース。このような辞書はテストや、分散テーブルのノードでデータとクエリノードが分離されているセットアップで便利です。

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

`structure`句は、辞書のキーとクエリで利用可能なフィールドを説明します。

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

属性は次の要素で説明されています：

- `<id>` — キーカラム
- `<attribute>` — データカラム：属性の数は複数である可能性があります。

DDLクエリ：

```sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

属性はクエリ本文で説明されています：

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。属性の数は複数である可能性があります。

## キー {#key}

ClickHouseは次のタイプのキーをサポートしています：

- 数値キー。`UInt64`。 `<id>`タグまたは `PRIMARY KEY` キーワードで定義されます。
- 複合キー。異なるタイプの値のセット。 `<key>`タグまたは `PRIMARY KEY` キーワードで定義されます。

xml構造は `<id>` または `<key>` のいずれかを含むことができます。DDLクエリは単一の `PRIMARY KEY` を含む必要があります。

:::note
キーを属性として記述してはいけません。
:::

### 数値キー {#numeric-key}

タイプ： `UInt64`。

構成例：

```xml
<id>
    <name>Id</name>
</id>
```

構成フィールド：

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

キーは任意のフィールドタイプの `tuple` であることができます。この場合、[レイアウト](#storing-dictionaries-in-memory)は `complex_key_hashed` または `complex_key_cache` である必要があります。

:::tip
複合キーは単一の要素から構成されることがあります。これにより、例えば文字列をキーとして使用することが可能になります。
:::

キー構造は `<key>` 要素で設定されます。キーフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例：

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

`dictGet*`関数へのクエリでは、キーとしてタプルが渡されます。例： `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## 属性 {#attributes}

構成例：

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

構成フィールド：

| タグ                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 必須 |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | はい      |
| `type`                                               | ClickHouseデータ型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書から指定されたデータ型に値を変換しようとします。たとえば、MySQLの場合、フィールドはMySQLソーステーブルの `TEXT`、 `VARCHAR`、または `BLOB`ですが、ClickHouseでは `String` としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は現在[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)辞書でサポートされています。[IPTrie](#ip_trie)辞書では `Nullable` タイプはサポートされていません。    | はい      |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>例では、空の文字列です。 [NULL](../syntax.md#null) 値は `Nullable` タイプのみ（前の行のタイプの説明を参照）で使用できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | はい      |
| `expression`                                         | [式](../../sql-reference/syntax.md#expressions)がClickHouseで値に対して実行されます。<br/>式はリモートSQLデータベース内のカラム名になることがあります。このようにして、リモートカラムのエイリアスを作成することができます。<br/><br/>デフォルト値：式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | いいえ      |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true` の場合、属性は現在のキーの親キーの値を含みます。[階層的辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値： `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | いいえ      |
| `injective`                                          | `id -> attribute` の写像が[1対1](https://en.wikipedia.org/wiki/Injective_function)であるかどうかを示すフラグ。<br/>`true` の場合、ClickHouseは通常、これはそのようなリクエストの数を大幅に削減しますので、 `GROUP BY` 句の後に辞書への要求を自動的に配置できます。<br/><br/>デフォルト値： `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | いいえ      |
| `is_object_id`                                       | クエリが `ObjectID` によるMongoDB文書に対して実行されるかどうかを示すフラグ。<br/><br/>デフォルト値： `false`。
## 階層辞書 {#hierarchical-dictionaries}

ClickHouseは、[数値キー](#numeric-key)を持つ階層辞書をサポートしています。

以下の階層構造を見てみましょう：

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

この階層は、次の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア       |
| 2          | 1              | モスクワ     |
| 3          | 2              | センター     |
| 4          | 0              | イギリス     |
| 5          | 4              | ロンドン     |

このテーブルには、要素の最近の親のキーを含むカラム `parent_region` が含まれています。

ClickHouseは、外部辞書属性に対する階層的プロパティをサポートしています。このプロパティを使用すると、上記のように階層辞書を設定できます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy) 関数は、要素の親チェーンを取得することを可能にします。

私たちの例では、辞書の構造は以下のようになります：

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

この辞書は、ポイントインポリゴンクエリのために最適化されており、実質的に「逆ジオコーディング」ルックアップを行います。座標（緯度/経度）が与えられると、それを含むポリゴン/地域（国や地域の境界など、多くのポリゴンからのセット）を効率的に見つけます。この機能は、位置座標をそれを含む地域にマッピングするのに適しています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/FyRsriQp46E?si=Kf8CXoPKEpGQlC-Y" title="ClickHouseのポリゴン辞書" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ポリゴン辞書の設定の例：

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

対応する[DDL-クエリ](/sql-reference/statements/create/dictionary):
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

- 単純なポリゴン。これはポイントの配列です。
- マルチポリゴン。これはポリゴンの配列です。各ポリゴンはポイントの2次元配列です。この配列の最初の要素はポリゴンの外境界であり、以降の要素はそれから除外される領域を指定します。

ポイントは、座標の配列またはタプルとして指定できます。現在の実装では、2次元ポイントのみがサポートされています。

ユーザーは、ClickHouseがサポートするすべての形式で独自のデータをアップロードできます。

利用可能な3つのタイプの[インメモリストレージ](#storing-dictionaries-in-memory)があります：

- `POLYGON_SIMPLE`。これは単純な実装であり、各クエリごとにすべてのポリゴンを線形に通過し、追加のインデックスを使用せずにそれぞれの会員をチェックします。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して別々のインデックスが構築され、ほとんどの場合迅速に属しているかどうかを確認できます（地理的地域に最適化されています）。また、考慮中の領域にグリッドが重ねられ、考慮すべきポリゴンの数が大幅に絞り込まれます。グリッドは、セルを16等分に再帰的に分割することによって作成され、2つのパラメータで設定されます。分割は、再帰の深さが `MAX_DEPTH` に達するか、セルが `MIN_INTERSECTIONS` ポリゴンを越えない場合に停止します。クエリに応じて、対応するセルが存在し、その中に保存されているポリゴンのインデックスが交互にアクセスされます。

- `POLYGON_INDEX_CELL`。この配置も、上記に記載されたグリッドを生成します。同じオプションが利用可能です。各シートセルに対して、その中に落ちているすべてのポリゴンのパーツに対してインデックスが構築され、リクエストに迅速に応答できます。

- `POLYGON`。`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書で作業するための標準の[関数](../../sql-reference/functions/ext-dict-functions.md)を使用して実行されます。重要な違いは、ここでのキーは、ポリゴンを見つけようとするポイントになることです。

**例**

上記で定義された辞書を使用した例：

```sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

'points' テーブルの各ポイントに対して最後のコマンドを実行した結果、最小面積ポリゴンが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書から列をSELECTクエリを介して読み取ることができ、辞書設定または対応するDDLクエリの `store_polygon_key_column = 1` をオンにするだけです。

クエリ：

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
## 正規表現ツリー辞書 {#regexp-tree-dictionary}

この辞書は、階層的な正規表現パターンに基づいてキーを値にマッピングします。これは、正確なキーのマッチングではなく、パターンマッチルックアップ（例：ユーザーエージェント文字列の分類）に最適化されています。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/ESlAhUJMoz8?si=sY2OVm-zcuxlDRaX" title="ClickHouse regexツリー辞書の紹介" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
### ClickHouseオープンソースで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、YAMLファイル内の正規表現ツリーを含むパスが提供されているYAMLRegExpTreeソースを使用してClickHouseオープンソースで定義されています。

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

辞書ソース `YAMLRegExpTree` は、regexpツリーの構造を表します。例えば：

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

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは以下の構造を持っています：

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、2つの属性：`name` と `version` が存在します。最初のノードは両方の属性を定義します。2番目のノードは属性 `name` のみを定義します。属性 `version` は、2番目のノードの子ノードによって提供されます。
  - 属性の値には、マッチした正規表現のキャプチャグループを参照する**バックリファレンス**を含めることができます。この例では、最初のノードの属性 `version` の値は、正規表現内のキャプチャグループ `(\d+[\.\d]*)` に対するバックリファレンス `\1` で構成されています。バックリファレンスの番号は1から9までで、`$1` または `\1`（番号1の場合）として書かれます。バックリファレンスは、クエリ実行中に一致したキャプチャグループで置き換えられます。
- **子ノード**: regexpツリーノードの子のリストであり、それぞれは独自の属性と（潜在的に）子ノードを持ちます。文字列マッチングは深さ優先の方式で進行します。文字列がregexpノードと一致すると、辞書はそのノードの子ノードにも一致するかどうかを確認します。その場合、最も深く一致するノードの属性が割り当てられます。子ノードの属性は、親ノードの同名属性を上書きします。YAMLファイル内の子ノードの名前は任意で、上記の例では `versions` です。

Regexpツリ辞書へのアクセスは、`dictGet`、`dictGetOrDefault`、および `dictGetAll` 関数を使用することでのみ許可されます。

例：

```sql
SELECT dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024');
```

結果：

```text
┌─dictGet('regexp_dict', ('name', 'version'), '31/tclwebkit1024')─┐
│ ('Android','12')                                                │
└─────────────────────────────────────────────────────────────────┘
```

この場合、最初に上層の2番目のノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` に一致します。辞書はさらに子ノードに進み、文字列が `3[12]/tclwebkit` にも一致することを見つけます。その結果、属性 `name` の値は `Android`（最初の層で定義されている）となり、属性 `version` の値は `12`（子ノードで定義されている）になります。

強力なYAML設定ファイルを使用することで、regexpツリ辞書をユーザーエージェント文字列パーサーとして利用できます。私は[uap-core](https://github.com/ua-parser/uap-core)をサポートし、機能テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) での使用方法を示します。
#### 属性値の収集 {#collecting-attribute-values}

時には、単一の葉ノードの値だけでなく、マッチした複数の正規表現から値を返すことが便利な場合があります。このような場合、専用の[`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall)関数を使用できます。ノードが属性値の型 `T` を持つ場合、`dictGetAll` は零またはそれ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返される一致の数に制限はありません。制限は、`dictGetAll` のオプションの第4引数として渡すことができます。配列は _トポロジカルオーダー_ でポピュレートされ、子ノードは親ノードの前に来て、兄弟ノードはソースの順序に従います。

例：

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
#### 一致モード {#matching-modes}

パターンマッチングの動作は、特定の辞書設定によって変更できます：
- `regexp_dict_flag_case_insensitive`: ケースインセンシティブマッチングを使用します（デフォルトは `false`）。個々の表現では `(?i)` と `(?-i)` で上書き可能です。
- `regexp_dict_flag_dotall`: '.'が改行文字と一致することを許可します（デフォルトは `false`）。
### ClickHouse Cloudで正規表現ツリー辞書を使用する {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上述の `YAMLRegExpTree` ソースはClickHouseオープンソースで動作しますが、ClickHouse Cloudでは動作しません。ClickHouseでregexpツリ辞書を使用するには、まずClickHouseオープンソースでYAMLファイルからregexpツリ辞書を作成し、その辞書を `dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してCSVファイルにダンプしてください。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSVファイルの内容は以下の通りです：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプされたファイルのスキーマは：

- `id UInt64`: RegexpTreeノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義属性の名前。
- `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloudで辞書を作成するには、まず以下のテーブル構造で `regexp_dictionary_source_table` テーブルを作成します：

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

次に、ローカルCSVを以下のように更新します：

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

詳細については、[ローカルファイルの挿入](https://clickhouse.com/docs/ja/engines/table-engines/others/insert-local-files)を参照してください。ソーステーブルを初期化したら、テーブルソースからRegexpTreeを作成できます：

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

ClickHouseには、ジオベースと連携するためのビルトイン機能があります。

これにより、次のことが可能になります：

- 地域のIDを使用して、その名前を希望の言語で取得する。
- 地域のIDを使用して、都市、地域、連邦地区、国、または大陸のIDを取得する。
- 地域が別の地域の一部であるか確認する。
- 親地域のチェーンを取得する。

すべての関数は「トランスローカリティ」をサポートしており、地域所有権に関する異なる視点を同時に使用する能力があります。詳細については、「WEB分析辞書と作業するための関数」のセクションを参照してください。

内部辞書は、デフォルトパッケージでは無効になっています。
それらを有効にするには、サーバー構成ファイルで `path_to_regions_hierarchy_file` および `path_to_regions_names_files` のパラメータのコメントを解除します。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置してください。この構成パラメータには、`regions_hierarchy.txt` ファイル（デフォルトの地域階層）のパスを含める必要があり、他のファイル（`regions_hierarchy_ua.txt`）も同じディレクトリに配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに置いてください。

これらのファイルを自分で作成することもできます。ファイル形式は次のとおりです：

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 親地域ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 市；他のタイプには値がありません
- 人口 (`UInt32`) — オプションのカラム

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含むことはできません（エスケープされたものも含みません）。

RAMに保存するためにフラットな配列が使用されます。この理由から、IDは100万を超えてはいけません。

辞書はサーバーを再起動せずに更新できます。ただし、利用可能な辞書のセットは更新されません。
更新のためにファイルの変更時間がチェックされます。ファイルが変更された場合、辞書が更新されます。
変更を確認する間隔は、`builtin_dictionaries_reload_interval` パラメータで設定されています。
辞書の更新（初回使用時のロードを除く）はクエリをブロックしません。更新中は、旧バージョンの辞書を使用するクエリが実行されます。更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは旧バージョンの辞書を使用し続けます。

私たちは、ジオベースを持つ辞書の定期的な更新をお勧めします。更新中は新しいファイルを生成し、それらを別の場所に書き込んでください。すべてが準備完了したら、それらをサーバーによって使用されるファイルに名前を変更してください。

OS識別子や検索エンジンで作業するための関数もありますが、それらは使用するべきではありません。
