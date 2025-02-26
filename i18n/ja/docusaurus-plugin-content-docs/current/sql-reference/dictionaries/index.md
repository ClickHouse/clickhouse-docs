---
slug: /sql-reference/dictionaries
sidebar_label: 辞書の定義
sidebar_position: 35
---

import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 辞書

辞書は、さまざまなタイプの参照リストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリで使用できる辞書操作のための特別な関数をサポートしています。辞書を使用することは、参照テーブルとの`JOIN`よりも簡単で効率的です。

ClickHouseは以下をサポートしています：

- [関数のセット](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数のセット](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouseでの辞書の使い始めに関するチュートリアルがありますので、ぜひ[こちら](tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースは、ClickHouseのテーブル、ローカルテキストファイルまたは実行可能ファイル、HTTP(S)リソース、または別のDBMSである可能性があります。詳細については、「[辞書ソース](#dictionary-sources)」を参照してください。

ClickHouseは：

- 辞書を完全または部分的にRAMに格納します。
- 定期的に辞書を更新し、欠落している値を動的にロードします。言い換えれば、辞書は動的にロードできます。
- XMLファイルまたは[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成できます。

辞書の構成は、1つ以上のXMLファイルに配置される場合があります。構成のパスは、[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定します。

辞書は、サーバーの起動時または初回使用時にロードできます。これは[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定によります。

[dictionaries](../../operations/system-tables/dictionaries.md#system_tables-dictionaries)システムテーブルには、サーバーで構成された辞書に関する情報が含まれています。各辞書の状態、構成パラメータ、辞書が成功裏にロードされてからのクエリ数や、辞書に割り当てられたRAMの量などのメトリクスを見つけることができます。

<CloudDetails />

## DDLクエリを使用した辞書の作成 {#creating-a-dictionary-with-a-ddl-query}

辞書は、[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成できます。これは推奨される方法です。なぜなら、DDLで作成された辞書は次の利点があります：
- サーバーの構成ファイルに追加のレコードが追加されません。
- 辞書は、テーブルやビューのようなファーストクラスのエンティティとして操作できます。
- データを直接読み取ることができ、辞書テーブル関数を使用するのではなく、親しみのあるSELECTを使用できます。
- 辞書は簡単に名前を変更できます。

## 設定ファイルを使用した辞書の作成 {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
設定ファイルを使用して辞書を作成することは、ClickHouse Cloudには適用されません。上記のDDLを使用して、このユーザー`default`として辞書を作成してください。
:::

辞書の設定ファイルは、次の形式を持っています：

``` xml
<clickhouse>
    <comment>任意の内容を含むオプションの要素。ClickHouseサーバーによって無視されます。</comment>

    <!--オプションの要素。置換を伴うファイル名-->
    <include_from>/etc/metrika.xml</include_from>

    <dictionary>
        <!-- 辞書の設定。 -->
        <!-- 構成ファイルには、辞書セクションの数は任意です。 -->
    </dictionary>

</clickhouse>
```

同じファイルで任意の数の辞書を[設定](#configuring-a-dictionary)できます。

:::note
小さな辞書の値を`SELECT`クエリで記述することで変換できます（[transform](../../sql-reference/functions/other-functions.md)関数を参照）。この機能は辞書には関連していません。
:::

## 辞書の構成 {#configuring-a-dictionary}

<CloudDetails />

XMLファイルを使用して辞書が構成される場合、その構成は次のような構造になります：

``` xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複雑なキーの設定 -->
    </structure>

    <source>
      <!-- ソースの設定 -->
    </source>

    <layout>
      <!-- メモリのレイアウト設定 -->
    </layout>

    <lifetime>
      <!-- メモリ内の辞書のライフタイム -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は次のような構造を持っています：

``` sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複雑または単一のキーの設定
SOURCE(...) -- ソースの設定
LAYOUT(...) -- メモリのレイアウト設定
LIFETIME(...) -- メモリ内の辞書のライフタイム
```

## メモリ内の辞書の保存 {#storing-dictionaries-in-memory}

辞書をメモリに保存するためのさまざまな方法があります。

最適な処理速度を提供するため、[flat](#flat)、[hashed](#hashed) および [complex_key_hashed](#complex_key_hashed)を推奨します。

キャッシングは、性能が悪化する可能性があるためお勧めしません。最適なパラメータの選択が困難になります。[cache](#cache)セクションで詳しく説明しています。

辞書のパフォーマンスを改善するための方法はいくつかあります：

- `GROUP BY`の後に辞書操作のための関数を呼び出します。
- 抽出する属性に注入的としてマークします。異なるキーに異なる属性値が対応する場合、その属性は注入的と呼ばれます。したがって、`GROUP BY`でキーによって属性値を取得する関数を使用すると、この関数は自動的に`GROUP BY`から外されます。

ClickHouseは、辞書のエラーに対して例外を生成します。エラーの例：

- アクセスしている辞書が読み込まれなかった。
- `cached`辞書のクエリ中にエラーが発生しました。

辞書とその状態のリストは、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

<CloudDetails />

構成は、次のようになります：

``` xml
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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md):

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

`complex-key*`という単語をレイアウトに含まない辞書は、[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`辞書は複合キー（複雑で任意の型を持つ）になります。

XML辞書の[UInt64](../../sql-reference/data-types/int-uint.md)キーは、`<id>`タグで定義されます。

構成例（カラムkey_columnはUInt64型）です：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合`complex`キーのXML辞書は、`<key>`タグで定義されます。

複合キーの構成例（キーは[String](../../sql-reference/data-types/string.md)型の1つの要素を持つ）：
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

## メモリ内の辞書の保存方法 {#ways-to-store-dictionaries-in-memory}

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

辞書は、フラットな配列の形式でメモリに完全に保存されます。辞書はどのくらいのメモリを使用しますか？その量は最大のキーのサイズ（使用する空間）に比例します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型で、値は`max_array_size`（デフォルトは500,000）に制限されます。辞書作成時により大きなキーが発見された場合、ClickHouseは例外をスローし、辞書を作成しません。辞書のフラット配列の初期サイズは、`initial_array_size`設定（デフォルトは1024）で制御されます。

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み込まれます。

この方法は、利用可能な辞書のストレージ方法の中で最高のパフォーマンスを提供します。

構成例：

``` xml
<layout>
  <flat>
    <initial_array_size>50000</initial_array_size>
    <max_array_size>5000000</max_array_size>
  </flat>
</layout>
```

または

``` sql
LAYOUT(FLAT(INITIAL_ARRAY_SIZE 50000 MAX_ARRAY_SIZE 5000000))
```

### hashed {#hashed}

辞書は、ハッシュテーブルの形式でメモリに完全に保存されます。辞書は、任意の識別子を持つ任意の数の要素を含むことができます。実際には、キーの数は数千万件に達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み込まれます。

構成例：

``` xml
<layout>
  <hashed />
</layout>
```

または

``` sql
LAYOUT(HASHED())
```

構成例：

``` xml
<layout>
  <hashed>
    <!-- シャード数が1より多い場合（デフォルトは`1`）、辞書は並行してデータをロードします。巨大な要素数を持つ辞書に便利です。 -->
    <shards>10</shards>

    <!-- 並行キュー内のブロックのバックログの最大サイズ。

         並行ロードのボトルネックは再ハッシュであるため、スレッドが再ハッシュを行っている間に停滞しないようにするには、バックログを保持する必要があります。

         10000は、メモリと速度の良いバランスです。10e10要素の場合でも、すべての負荷を飽和させずに処理できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷係数。大きい値を使用すると、メモリがより効率的に利用され（無駄が少ない）、読み取り/パフォーマンスが悪化する可能性があります。

         有効な値：[0.5, 0.99]
         デフォルト：0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

`hashed`に似ていますが、CPUの使用を増やすためにメモリを少なく使用します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

構成例：

``` xml
<layout>
  <sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </sparse_hashed>
</layout>
```

または

``` sql
LAYOUT(SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

このタイプの辞書にも`shards`を使用することができます。また、`sparse_hashed`よりも`hashed`にとっては重要です。この場合、`sparse_hashed`は遅くなります。

### complex_key_hashed {#complex_key_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。`hashed`と似ています。

構成例：

``` xml
<layout>
  <complex_key_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_hashed>
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### complex_key_sparse_hashed {#complex_key_sparse_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。[sparse_hashed](#sparse_hashed)に似ています。

構成例：

``` xml
<layout>
  <complex_key_sparse_hashed>
    <!-- <shards>1</shards> -->
    <!-- <shard_load_queue_backlog>10000</shard_load_queue_backlog> -->
    <!-- <max_load_factor>0.5</max_load_factor> -->
  </complex_key_sparse_hashed>
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_SPARSE_HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### hashed_array {#hashed_array}

辞書はメモリに完全に保存され、各属性は配列に保存されます。キー属性は、値が属性配列のインデックスであるハッシュテーブルの形式で保存されます。辞書は、任意の数の要素を持つことができ、実際には、キーの数は数千万件に達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）は完全に読み込まれます。

構成例：

``` xml
<layout>
  <hashed_array>
  </hashed_array>
</layout>
```

または

``` sql
LAYOUT(HASHED_ARRAY([SHARDS 1]))
```

### complex_key_hashed_array {#complex_key_hashed_array}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。[hashed_array](#hashed_array)に似ています。

構成例：

``` xml
<layout>
  <complex_key_hashed_array />
</layout>
```

または

``` sql
LAYOUT(COMPLEX_KEY_HASHED_ARRAY([SHARDS 1]))
```

### range_hashed {#range_hashed}

辞書は、範囲の配列とその対応する値の順序付きハッシュテーブルの形式でメモリに保存されます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。このストレージ方法は、`hashed`と同様に機能し、キーに加えて日時（任意の数値型）の範囲を使用することができます。

例：テーブルには、各広告主に対する割引が次の形式で含まれています：

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲のサンプルを使用するには、[structure](#dictionary-key-and-fields)内で`range_min`と`range_max`要素を定義します。これらの要素には、`name`および`type`要素を含める必要があります（`type`が指定されていない場合、デフォルト型が使用されます - Date）。`type`は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）であることができます。

:::note
`range_min`および`range_max`の値は、`Int64`型に収まる必要があります。
:::

例：

``` xml
<layout>
    <range_hashed>
        <!-- 重複範囲（min/max）の戦略。デフォルト：min（最小の範囲値に一致する範囲を返します） -->
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

``` sql
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

これらの辞書を操作するには、`dictGet`関数に追加の引数を渡す必要があります。これは選択される範囲です：

``` sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリ例：

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された`id`および渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細：

- `id`が見つからない場合、または`id`に対する範囲が見つからない場合は、属性型のデフォルト値を返します。
- 重複する範囲があり、`range_lookup_strategy=min`の場合は、最小の`range_min`を持つ一致する範囲を返します。複数の範囲が見つかった場合は、最小の`range_max`を持つ範囲を返します。さらに複数の範囲が見つかった場合（同じ`range_min`と`range_max`を持つ範囲が複数ある場合）は、それらの中からランダムな範囲を返します。
- 重複する範囲があり、`range_lookup_strategy=max`の場合は、最大の`range_min`を持つ一致する範囲を返します。複数の範囲が見つかった場合は、最大の`range_max`を持つ範囲を返します。さらに複数の範囲が見つかった場合（同じ`range_min`と`range_max`を持つ範囲が複数ある場合）は、それらの中からランダムな範囲を返します。
- `range_max`が`NULL`の場合、範囲はオープンです。`NULL`は最大の可能値と見なされます。`range_min`に対しては`1970-01-01`または`0`（-MAX_INT）をオープン値として使用できます。

構成例：

``` xml
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

``` sql
CREATE DICTIONARY somedict(
    Abcdef UInt64,
    StartTimeStamp UInt64,
    EndTimeStamp UInt64,
    XXXType String DEFAULT ''
)
PRIMARY KEY Abcdef
RANGE(MIN StartTimeStamp MAX EndTimeStamp)
```

オーバーラップ範囲とオープン範囲を持つ構成例：

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
│ 0.1 │ -- 一致する範囲は1つだけ：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.2 │ -- 一致する範囲が2つあり、range_min 2015-01-15 (0.2) は2015-01-01 (0.1) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 一致する範囲が2つあり、range_min 2015-01-04 (0.4) は2015-01-01 (0.3) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 一致する範囲が2つあり、range_minは同じだが、2015-01-15 (0.5) が2015-01-10 (0.6) より大きい
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
│ 0.1 │ -- 一致する範囲は1つだけ：2015-01-01 - Null
└─────┘

select dictGet('discounts_dict', 'amount', 1, toDate('2015-01-16')) res;
┌─res─┐
│ 0.1 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.1) は2015-01-15 (0.2) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.3) は2015-01-04 (0.4) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 一致する範囲が2つあり、range_minは同じだが、2015-01-10 (0.6) が2015-01-15 (0.5) より小さい
└─────┘
```

### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、範囲の配列とその対応する値の順序付きハッシュテーブルの形式でメモリに保存されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。

構成例：

``` sql
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

辞書は、固定数のセルを持つキャッシュに保存されます。これらのセルには、よく使用される要素が含まれています。

辞書のキーは、[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際、最初にキャッシュが検索されます。各データブロックについて、キャッシュ内で見つからないか、古くなったすべてのキーがソースから要求されます。受信データはキャッシュに書き込まれます。

キーが辞書に見つからない場合、更新タスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定で制御できます。

キャッシュ辞書の場合、キャッシュ内のデータの有効期限[ライフタイム](#refreshing-dictionary-data-using-lifetime)を設定できます。セル内にデータが読み込まれてから`lifetime`よりも多くの時間が経過した場合、セルの値は使用されず、キーが失効します。次に、そのキーが必要な時に再リクエストされます。 この動作は`allow_read_expired_keys`設定で構成できます。

これは辞書の保存方法の中で最も効果が薄いです。キャッシュの速度は、設定の正確さと使用シナリオに大きく依存します。キャッシュ型辞書は、ヒット率が十分に高い場合（推奨は99％以上）にのみ良好なパフォーマンスを発揮します。平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

設定`allow_read_expired_keys`が1に設定されている場合、デフォルトは0です。その場合、辞書は非同期更新をサポートできます。クライアントがキーをリクエストし、すべてのキーがキャッシュ内にあるが、一部が失効している場合、辞書はクライアントに失効したキーを返し、ソースから非同期でリクエストします。

キャッシュのパフォーマンスを向上させるために、`LIMIT`を持つサブクエリを使用し、辞書で関数を外部で呼び出してください。

すべてのソースタイプがサポートされています。

設定例：

``` xml
<layout>
    <cache>
        <!-- キャッシュのサイズ（セルの数）。2の累乗に切り上げられます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 失効したキーを読み取ることを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- キューに更新タスクをプッシュするための最大タイムアウト（ミリ秒単位）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクが完了するまでの最大待機タイムアウト（ミリ秒単位）。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- キャッシュ辞書の更新に関する最大スレッド数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

``` sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分なキャッシュサイズを設定してください。セルの数を選択するために実験が必要です：

1.  いくつかの値を設定します。
2.  キャッシュが完全に満たされるまでクエリを実行します。
3.  `system.dictionaries`テーブルを使用してメモリ消費を評価します。
4.  必要なメモリ消費に達するまで、セルの数を増減します。

:::note
ClickHouseをソースとして使用しないでください。ランダム読取りのクエリ処理が遅くなります。
:::

### complex_key_cache {#complex_key_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。`cache`に似ています。

### ssd_cache {#ssd_cache}

`cache`に似ていますが、データをSSDに保存し、インデックスはRAMに保存します。更新キューに関するすべてのキャッシュ辞書設定もSSDキャッシュ辞書に適用できます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

``` xml
<layout>
    <ssd_cache>
        <!-- 読み取りブロックのサイズ（バイト単位）。SSDのページサイズと等しくすることが推奨されます。 -->
        <block_size>4096</block_size>
        <!-- キャッシュファイルの最大サイズ（バイト単位）。 -->
        <file_size>16777216</file_size>
        <!-- SSDから要素を読み取るためのRAMバッファのサイズ（バイト単位）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSDにフラッシュする前に要素を集約するためのRAMバッファのサイズ（バイト単位）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルが保存されるパス。 -->
        <path>/var/lib/clickhouse/user_files/test_dict</path>
    </ssd_cache>
</layout>
```

または

``` sql
LAYOUT(SSD_CACHE(BLOCK_SIZE 4096 FILE_SIZE 16777216 READ_BUFFER_SIZE 1048576
    PATH '/var/lib/clickhouse/user_files/test_dict'))
```

### complex_key_ssd_cache {#complex_key_ssd_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。`ssd_cache`に似ています。

### direct {#direct}

辞書はメモリに保存されず、リクエスト処理中に直接ソースにアクセスします。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべての[ソース](#dictionary-sources)タイプがサポートされています。ただし、ローカルファイルは対象外です。

構成例：

``` xml
<layout>
  <direct />
</layout>
```

または

``` sql
LAYOUT(DIRECT())
```

### complex_key_direct {#complex_key_direct}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)で使用するためのものです。`direct`に似ています。

### ip_trie {#ip_trie}

このストレージタイプは、ネットワークプレフィックス（IPアドレス）をASNなどのメタデータにマッピングするためのものです。

**例**

ClickHouseに、IPプレフィックスとそのマッピングを含むテーブルがあるとします：

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

このテーブルに対して`ip_trie`辞書を定義しましょう。この`ip_trie`レイアウトは、複合キーが必要です：

``` xml
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
        <!-- キー属性 `prefix` はdictGetStringを介して取得できます。 -->
        <!-- このオプションはメモリ使用量を増加させます。 -->
        <access_to_key_from_attributes>true</access_to_key_from_attributes>
    </ip_trie>
</layout>
```

または

``` sql
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

キーは、許可されたIPプレフィックスを含む単一の`String`型属性のみで構成される必要があります。他のタイプは現時点ではサポートされていません。

構文は次の通りです：

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

この関数は、IPv4用には`UInt32`、IPv6用には`FixedString(16)`を取ります。たとえば：

``` sql
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

他のタイプは現時点ではサポートされていません。この関数は、このIPアドレスに対応するプレフィックスの属性を返します。重複するプレフィックスがある場合は、最も具体的なものが返されます。

データは完全にRAMに収まる必要があります。
## 有効期限を使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒で定義）に基づいて定期的に辞書を更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔であり、キャッシュされた辞書の無効化間隔です。

更新中、古いバージョンの辞書は引き続きクエリすることができます。辞書の更新（初めての使用時に辞書を読み込む場合を除く）は、クエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは古いバージョンの辞書を使用して続行することができます。辞書の更新が成功した場合、古いバージョンの辞書は原子的に置き換えられます。

設定の例：

<CloudDetails />

``` xml
<dictionary>
    ...
    <lifetime>300</lifetime>
    ...
</dictionary>
```

または

``` sql
CREATE DICTIONARY (...)
...
LIFETIME(300)
...
```

`<lifetime>0</lifetime>`（`LIFETIME(0)`）を設定すると、辞書は更新されなくなります。

更新のための時間間隔を設定すると、ClickHouseはこの範囲内の均一にランダムな時間を選択します。これは、大量のサーバーで更新を行う際に、辞書ソースへの負荷を分散させるために必要です。

設定の例：

``` xml
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

``` sql
LIFETIME(MIN 300 MAX 360)
```

もし`<min>0</min>`と`<max>0</max>`の場合、ClickHouseはタイムアウトによって辞書を再読み込みしません。この場合、辞書の設定ファイルが変更されたり、`SYSTEM RELOAD DICTIONARY`コマンドが実行されたりすると、ClickHouseは辞書を早期に再読み込みすることができます。

辞書の更新を行う際、ClickHouseサーバーは[ソース](#dictionary-sources)のタイプに応じて異なるロジックを適用します：

- テキストファイルの場合、変更時間をチェックします。もしその時間が以前に記録された時間と異なれば、辞書が更新されます。
- 他のソースからの辞書は、デフォルトで毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）では、本当に変更があった場合にのみ辞書を更新するクエリを設定できます。これには、次の手順に従ってください：

- 辞書テーブルには、ソースデータが更新されると常に変更されるフィールドが必要です。
- ソースの設定には、変更フィールドを取得するクエリを指定する必要があります。ClickHouseサーバーは、クエリ結果を行として解釈し、この行が前の状態に対して変更された場合、辞書が更新されます。<source>#dictionary-sources</source>の設定の`<invalidate_query>`フィールドに、クエリを指定してください。

設定の例：

``` xml
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

``` sql
...
SOURCE(ODBC(... invalidate_query 'SELECT update_time FROM dictionary_source where id = 1'))
...
```

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書では、同期的および非同期的な更新がサポートされています。

`Flat`、`Hashed`、`ComplexKeyHashed`辞書でも、前回の更新以降に変更されたデータのみをリクエストすることができます。辞書ソース設定の一部として`update_field`が指定されると、前回の更新時間の秒数がデータリクエストに追加されます。ソースタイプ（Executable、HTTP、MySQL、PostgreSQL、ClickHouseまたはODBC）に応じて、外部ソースから要求データを取得する前に`update_field`に異なるロジックが適用されます。

- ソースがHTTPの場合、`update_field`はクエリパラメータとして最後の更新時間をパラメータ値として追加されます。
- ソースがExecutableの場合、`update_field`は実行可能スクリプトの引数として最後の更新時間を引数値として追加されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合、`WHERE`の追加部分があり、`update_field`が最後の更新時間以上または等しいと比較されます。
    - デフォルトでは、この`WHERE`条件はSQLクエリの最上位レベルでチェックされます。あるいは、条件は任意の他の`WHERE`句内で`{condition}`キーワードを使用してチェックできます。例：
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

`update_field`オプションが設定されている場合、追加オプション`update_lag`を設定できます。`update_lag`オプションの値は、更新されたデータを要求する前に前回の更新時間から差し引かれます。

設定の例：

``` xml
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

``` sql
...
SOURCE(CLICKHOUSE(... update_field 'added_time' update_lag 15))
...
```

## 辞書ソース {#dictionary-sources}

<CloudDetails />

辞書は、さまざまなソースからClickHouseに接続することができます。

辞書がxmlファイルを使用して設定されている場合、設定は次のようになります。

``` xml
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

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の設定は次のようになります。

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソース設定
...
```

ソースは`source`セクションで設定されています。

[ローカルファイル](#local-file)、[実行ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)のソースタイプでは、オプションの設定が利用できます。

``` xml
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

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
SETTINGS(format_csv_allow_single_quotes = 0)
```

ソースの種類（`source_type`）：

- [ローカルファイル](#local-file)
- [実行ファイル](#executable-file)
- [実行プール](#executable-pool)
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

``` xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
</source>
```

または

``` sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
```

設定フィールド：

- `path` – ファイルへの絶対パス。
- `format` – ファイル形式。 [フォーマット](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。

`FILE`ソースから辞書がDDLコマンド（`CREATE DICTIONARY ...`）を介して作成されるとき、ソースファイルは`user_files`ディレクトリ内に配置される必要があります。これは、DBユーザーがClickHouseノード上で任意のファイルにアクセスするのを防ぐためです。

**次を参照**

- [辞書関数](../../sql-reference/table-functions/dictionary.md#dictionary-function)

### 実行ファイル {#executable-file}

実行ファイルの取り扱いは、[辞書がメモリに保存される方法](#storing-dictionaries-in-memory)に依存します。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは実行可能ファイルのSTDINにリクエストを送信して必要なキーを要求します。それ以外の場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

設定の例：

``` xml
<source>
    <executable>
        <command>cat /opt/dictionaries/os.tsv</command>
        <format>TabSeparated</format>
        <implicit_key>false</implicit_key>
    </executable>
</source>
```

設定フィールド：

- `command` — 実行ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`にある場合）。
- `format` — ファイル形式。 [フォーマット](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能スクリプトは主な読み書きループを含む必要があります。辞書が破棄された後、パイプは閉じられ、実行ファイルはClickHouseが子プロセスにSIGTERM信号を送信する前に終了するために`command_termination_timeout`秒の時間があります。`command_termination_timeout`は秒単位で指定されます。デフォルト値は10です。オプションパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み取る際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込む際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能なソースファイルは値のみを返すことができ、要求されたキーとの対応は暗黙的に決定されます。結果の行の順序によって決まります。デフォルト値はfalseです。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ユーザースクリプトパス](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダー内で検索されます。追加のスクリプト引数はホワイトスペース区切りで指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`0`です。オプションパラメータ。
- `send_chunk_header` - 処理のためにデータチャンクを送信する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効化されており、さもなくばDBユーザーはClickHouseノード上で任意のバイナリを実行できる可能性があります。

### 実行プール {#executable-pool}

実行プールは、プロセスのプールからデータを読み込むことを可能にします。このソースは、ソースからすべてのデータを読み込む必要がある辞書レイアウトで機能しません。実行プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`レイアウトを使用して[保存されている](#ways-to-store-dictionaries-in-memory)場合に機能します。

実行プールは、指定されたコマンドでプロセスのプールを生成し、終了するまでそれらを実行し続けます。プログラムは、利用可能な間、STDINからデータを読み取り、結果をSTDOUTに出力する必要があります。次のデータブロックをSTDINで待機することができます。ClickHouseはデータブロックの処理後にSTDINを閉じることはなく、必要に応じて別のデータチャンクをパイプします。実行可能スクリプトはこのデータ処理方式に対応する必要があり、STDINをポーリングしてデータを早期にSTDOUTにフラッシュする必要があります。

設定の例：

``` xml
<source>
    <executable_pool>
        <command>while read key; do printf "$key\tData for key $key\n"; done</command>
        <format>TabSeparated</format>
        <pool_size>10</pool_size>
        <max_command_execution_time>10</max_command_execution_time>
        <implicit_key>false</implicit_key>
    </executable_pool>
</source>
```

設定フィールド：

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムのディレクトリが`PATH`に書き込まれている場合）。
- `format` — ファイル形式。 [フォーマット](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `pool_size` — プールのサイズです。`pool_size`が0に設定された場合、プールサイズの制限はありません。デフォルト値は`16`です。
- `command_termination_timeout` — 実行可能スクリプトは主な読み書きループを含む必要があります。辞書が破棄された後、パイプは閉じられ、実行ファイルはClickHouseが子プロセスにSIGTERM信号を送信する前に終了するために`command_termination_timeout`秒の時間があります。秒単位で指定されます。デフォルト値は`10`です。オプションパラメータ。
- `max_command_execution_time` — データブロックの処理における実行可能スクリプトコマンドの最大実行時間。秒単位で指定されます。デフォルト値は`10`です。オプションパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み取る際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込む際のタイムアウト（ミリ秒単位）。デフォルト値は10000です。オプションパラメータ。
- `implicit_key` — 実行可能なソースファイルは値のみを返すことができ、要求されたキーとの対応は暗黙的に決定されます。結果の行の順序によって決まります。デフォルト値はfalseです。オプションパラメータ。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ユーザースクリプトパス](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定されたユーザースクリプトフォルダー内で検索されます。追加のスクリプト引数はホワイトスペース区切りで指定できます。例：`script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は`bin/sh -c`の引数として渡されます。デフォルト値は`1`です。オプションパラメータ。
- `send_chunk_header` - 処理のためにデータチャンクを送信する前に行数を送信するかどうかを制御します。オプションです。デフォルト値は`false`です。

この辞書ソースはXML設定を介してのみ構成できます。DDLを介して実行可能ソースを持つ辞書を作成することは無効化されており、さもなくばDBユーザーはClickHouseノード上で任意のバイナリを実行できる可能性があります。

### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリに保存される方法](#storing-dictionaries-in-memory)に依存します。辞書が`cache`および`complex_key_cache`を使用して保存されている場合、ClickHouseは`POST`メソッドを介して必要なキーをリクエストします。

設定の例：

``` xml
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

``` sql
SOURCE(HTTP(
    url 'http://[::1]/os.tsv'
    format 'TabSeparated'
    credentials(user 'user' password 'password')
    headers(header(name 'API-KEY' value 'key'))
))
```

ClickHouseがHTTPSリソースにアクセスするには、サーバー設定で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)を構成する必要があります。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。 [フォーマット](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `credentials` – 基本的なHTTP認証。オプションのパラメータです。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストに使用されるすべてのカスタムHTTPヘッダーエントリー。オプションのパラメータです。
- `header` – 単一のHTTPヘッダーエントリー。
- `name` – リクエストで送信されるヘッダーの識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成する際には、リモートホストのHTTP辞書はデータベースユーザーが任意のHTTPサーバーにアクセスできないようにするため、configの`remote_url_allow_hosts`セクションの内容と照合されます。

### DBMS {#dbms}

#### ODBC {#odbc}

ODBCドライバーがある任意のデータベースに接続するためにこの方法を使用できます。

設定の例：

``` xml
<source>
    <odbc>
        <db>DatabaseName</db>
        <table>SchemaName.TableName</table>
        <connection_string>DSN=some_parameters</connection_string>
        <invalidate_query>SQL_QUERY</invalidate_query>
        <query>SELECT id, value_1, value_2 FROM SchemaName.TableName</query>
    </odbc>
</source>
```

または

``` sql
SOURCE(ODBC(
    db 'DatabaseName'
    table 'SchemaName.TableName'
    connection_string 'DSN=some_parameters'
    invalidate_query 'SQL_QUERY'
    query 'SELECT id, value_1, value_2 FROM db_name.table_name'
))
```

設定フィールド：

- `db` – データベースの名前。`<connection_string>`パラメータでデータベース名が設定されている場合は省略します。
- `table` – テーブル名と存在する場合はスキーマ名。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。詳細は[有効期限を使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションに記載されています。
- `background_reconnect` – 接続に失敗した場合にバックグラウンドでレプリカに再接続します。オプションのパラメータです。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table`および`query`フィールドは一緒に使用できません。`table`または`query`のフィールドのいずれか一つを宣言する必要があります。
:::

ClickHouseはODBCドライバーから引用シンボルを受け取り、すべての設定をドライバへのクエリで引用します。そのため、テーブル名をデータベース内のテーブル名のケースに従って設定する必要があります。

Oracleを使用する際のエンコーディングの問題については、該当する[FAQ](/knowledgebase/oracle-odbc)項目を参照してください。

##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられる可能性があります。この場合、`odbc.ini`の`USERNAME`と`PASSWORD`の値がリモートサーバーに送信され、危険にさらされる可能性があります。
:::

**安全でない使用の例**

PostgreSQL用にunixODBCを構成します。`/etc/odbc.ini`の内容：

``` text
[gregtest]
Driver = /usr/lib/psqlodbca.so
Servername = localhost
PORT = 5432
DATABASE = test_db
#OPTION = 3
USERNAME = test
PASSWORD = test
```

その後、次のようなクエリを実行すると

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバーは`odbc.ini`から`USERNAME`と`PASSWORD`の値を`some-server.com`に送信します。

##### PostgreSQLに接続する例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCとPostgreSQL用ODBCドライバーをインストールします。

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`を設定します（または、ClickHouseを実行しているユーザーでサインインした場合は`~/.odbc.ini`）：

``` text
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

ClickHouseでの辞書設定：

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 接続文字列で以下のパラメータを指定できます： -->
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

``` sql
CREATE DICTIONARY table_name (
    id UInt64,
    some_column UInt64 DEFAULT 0
)
PRIMARY KEY id
SOURCE(ODBC(connection_string 'DSN=myconnection' table 'postgresql_table'))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 360)
```

ドライバーのライブラリへのフルパスを指定するために`odbc.ini`を編集する必要があるかもしれません。`DRIVER=/usr/local/lib/psqlodbcw.so`。

##### MS SQL Serverに接続する例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLに接続するためのODBCドライバーをインストールします。

``` bash
$ sudo apt-get install tdsodbc freetds-bin sqsh
```

ドライバーを設定します。

```bash
    $ cat /etc/freetds/freetds.conf
    ...

    [MSSQL]
    host = 192.168.56.101
    port = 1433
    tds version = 7.0
    client charset = UTF-8

    # TDS接続をテスト
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


    # （オプション）ODBC接続をテスト（isqlツールを使用するには[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストール）
    $ isql -v MSSQL "user" "password"
```

備考：
- 特定のSQL Serverバージョンによってサポートされる最も古いTDSバージョンを特定するには、製品のドキュメントを参照するか、[MS-TDS製品動作](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を参照してください。

ClickHouseの辞書設定：

``` xml
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

``` sql
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

設定の例：

``` xml
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

``` sql
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

- `port` – MySQLサーバーのポート。すべてのレプリカまたは各レプリカ個別に（`<replica>`内で）指定できます。

- `user` – MySQLユーザーの名前。すべてのレプリカまたは各レプリカ個別に（`<replica>`内で）指定できます。

- `password` – MySQLユーザーのパスワード。すべてのレプリカまたは各レプリカ個別に（`<replica>`内で）指定できます。

- `replica` – レプリカ設定のセクション。複数のセクションを持つことができます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先度。接続を試みるとき、ClickHouseは優先度の順にレプリカをトラバースします。番号が小さいほど優先度が高いです。

- `db` – データベースの名前。

- `table` – テーブルの名前。

- `where` – 選択基準。条件の構文はMySQLの`WHERE`句と同じで、例として`id > 10 AND id < 20`です。オプションのパラメータです。

- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。詳細は[有効期限を使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションに記載されています。

- `fail_on_connection_loss` – 接続損失時のサーバーの動作を制御する設定パラメータ。この設定が`true`の場合、クライアントとサーバー間の接続が失われた際にすぐに例外がスローされます。`false`の場合、ClickHouseサーバーは例外をスローする前にクエリを3回再試行します。再試行は反応時間を延長することに注意してください。デフォルト値：`false`。

- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用できません。`table`または`query`のフィールドのいずれか一つを宣言する必要があります。
:::

:::note
明示的な`secure`パラメータはありません。SSL接続の確立時にセキュリティは必須です。
:::

MySQLにはソケットを介してローカルホストで接続できます。そのためには、`host`と`socket`を設定します。

設定の例：

``` xml
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

``` sql
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

設定の例：

``` xml
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

``` sql
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

- `host` – ClickHouseホスト。ローカルホストであれば、クエリはネットワークアクティビティなしで処理されます。可用性を向上させるために、[分散](../../engines/table-engines/special/distributed.md)テーブルを作成し、その後の設定で入力することができます。
- `port` – ClickHouseサーバーのポート。
- `user` – ClickHouseユーザーの名前。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。省略することができます。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータです。詳細は[有効期限を使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)のセクションに記載されています。
- `secure` - SSL接続を使用します。
- `query` – カスタムクエリ。オプションのパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用できません。`table`または`query`のフィールドのいずれか一つを宣言する必要があります。
:::

#### MongoDB {#mongodb}

設定の例：

``` xml
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

``` xml
<source>
    <mongodb>
        <uri>mongodb://localhost:27017/test?ssl=true</uri>
        <collection>dictionary_source</collection>
    </mongodb>
</source>
```

または

``` sql
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

``` sql
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

設定の例：

``` xml
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

``` sql
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
``` html
- `storage_type` – 内部Redisストレージの構造で、キーを処理するために使用されます。`simple`はシンプルソースとハッシュ化された単一キーソース用、`hash_map`は2つのキーを持つハッシュ化ソース用です。範囲ソースおよび複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は`simple`です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。

#### Cassandra {#cassandra}

設定の例:

``` xml
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

- `host` – Cassandraホストまたはカンマ区切りのホストのリスト。
- `port` – Cassandraサーバーのポート。指定されていない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザーの名前。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリー（テーブル）の名前。
- `allow_filtering` – クラスタリングキーのカラムにおける高コストの条件を許可するかどうかのフラグ。デフォルト値は1。
- `partition_key_prefix` – Cassandraテーブルの主キーにおけるパーティションキーのカラム数。合成キー辞書に必要です。辞書定義でのキーの順序はCassandraと同じでなければなりません。デフォルト値は1（最初のキーカラムがパーティションキーで、他のキーカラムがクラスタリングキーです）。
- `consistency` – 一貫性レベル。可能な値: `One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は`One`です。
- `where` – オプションの選択基準。
- `max_threads` – 合成キー辞書から複数のパーティションからデータをロードするために使用する最大スレッド数。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`column_family`または`where`フィールドは`query`フィールドと一緒に使用できません。また、`column_family`または`query`フィールドのいずれか一方を宣言する必要があります。
:::

#### PostgreSQL {#postgresql}

設定の例:

``` xml
<source>
  <postgresql>
      <host>postgresql-hostname</host>
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

``` sql
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

- `host` – PostgreSQLサーバー上のホスト。すべてのレプリカに対して指定可能、またはそれぞれ個別に指定可能（`<replica>`内）。
- `port` – PostgreSQLサーバーのポート。すべてのレプリカに対して指定可能、またはそれぞれ個別に指定可能（`<replica>`内）。
- `user` – PostgreSQLユーザーの名前。すべてのレプリカに対して指定可能、またはそれぞれ個別に指定可能（`<replica>`内）。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカに対して指定可能、またはそれぞれ個別に指定可能（`<replica>`内）。
- `replica` – レプリカ構成のセクション。複数のセクションが存在可能:
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みる際、ClickHouseは優先度の順にレプリカを巡回します。数値が小さいほど優先度が高くなります。
- `db` – データベースの名前。
- `table` – テーブルの名前。
- `where` – 選択基準。条件の構文はPostgreSQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`。オプションのパラメータ。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションのパラメータ。詳細はセクション[Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime)で確認してください。
- `background_reconnect` – 接続失敗時にバックグラウンドでレプリカに再接続します。オプションのパラメータ。
- `query` – カスタムクエリ。オプションのパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用できません。また、`table`または`query`フィールドのいずれか一方を宣言する必要があります。
:::

### Null {#null}

ダミー（空の）辞書を作成するために使用できる特別なソース。このような辞書はテストや、分散テーブルを持つノードでデータとクエリノードが分離されているセットアップで役立ちます。

``` sql
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

## Dictionary Key and Fields {#dictionary-key-and-fields}

<CloudDetails />

`structure`句は辞書のキーおよびクエリに利用可能なフィールドを説明します。

XML定義:

``` xml
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

属性は以下の要素で説明されています:

- `<id>` — キーカラム
- `<attribute>` — データカラム: 複数の属性を含むことができます。

DDLクエリ:

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- attributes
)
PRIMARY KEY Id
...
```

属性はクエリ本体で説明されています:

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性が含まれることができます。

## Key {#key}

ClickHouseは以下のキータイプをサポートしています:

- 数値キー。`UInt64`。`<id>`タグで定義されるか、`PRIMARY KEY`キーワードを使用して定義されます。
- 複合キー。異なるタイプの値のセット。`<key>`タグまたは`PRIMARY KEY`キーワードで定義されます。

xml構造は`<id>`または`<key>`のいずれかを含むことができます。DDLクエリは単一の`PRIMARY KEY`を含まなければなりません。

:::note
キーを属性として記述してはいけません。
:::

### Numeric Key {#numeric-key}

タイプ: `UInt64`。

設定例:

``` xml
<id>
    <name>Id</name>
</id>
```

設定フィールド:

- `name` – キーのカラムの名前。

DDLクエリの場合:

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーのカラムの名前。

### Composite Key {#composite-key}

キーは任意のタイプのフィールドからなる`tuple`であることができます。この場合の[layout](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`でなければなりません。

:::tip
複合キーは単一要素で構成されることがあります。これにより、例えば文字列をキーとして使用することが可能です。
:::

キー構造は`<key>`要素で設定されます。キーのフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例:

``` xml
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

``` sql
CREATE DICTIONARY (
    field1 String,
    field2 String
    ...
)
PRIMARY KEY field1, field2
...
```

`dictGet*`関数へのクエリでは、キーとしてタプルが渡されます。例: `dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## Attributes {#attributes}

設定例:

``` xml
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

``` sql
CREATE DICTIONARY somename (
    Name ClickHouseDataType DEFAULT '' EXPRESSION rand64() HIERARCHICAL INJECTIVE IS_OBJECT_ID
)
```

設定フィールド:

| タグ                                                  | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 必須   |
|------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | はい   |
| `type`                                               | ClickHouseデータ型: [UInt8](../../sql-reference/data-types/int-uint.md), [UInt16](../../sql-reference/data-types/int-uint.md), [UInt32](../../sql-reference/data-types/int-uint.md), [UInt64](../../sql-reference/data-types/int-uint.md), [Int8](../../sql-reference/data-types/int-uint.md), [Int16](../../sql-reference/data-types/int-uint.md), [Int32](../../sql-reference/data-types/int-uint.md), [Int64](../../sql-reference/data-types/int-uint.md), [Float32](../../sql-reference/data-types/float.md), [Float64](../../sql-reference/data-types/float.md), [UUID](../../sql-reference/data-types/uuid.md), [Decimal32](../../sql-reference/data-types/decimal.md), [Decimal64](../../sql-reference/data-types/decimal.md), [Decimal128](../../sql-reference/data-types/decimal.md), [Decimal256](../../sql-reference/data-types/decimal.md),[Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md), [String](../../sql-reference/data-types/string.md), [Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは辞書から指定されたデータ型への値のキャストを試みます。たとえば、MySQLの場合、フィールドはMySQLソーステーブルで`TEXT`、`VARCHAR`、または`BLOB`かもしれませんが、ClickHouseでは`String`としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は現在、[Flat](#flat), [Hashed](#hashed), [ComplexKeyHashed](#complex_key_hashed), [Direct](#direct), [ComplexKeyDirect](#complex_key_direct), [RangeHashed](#range_hashed), Polygon, [Cache](#cache), [ComplexKeyCache](#complex_key_cache), [SSDCache](#ssd_cache), [SSDComplexKeyCache](#complex_key_ssd_cache)辞書でサポートされています。[IPTrie](#ip_trie)辞書では`Nullable`タイプはサポートされていません。 | はい   |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>例では、空の文字列です。[NULL](../syntax.md#null)値は`Nullable`タイプ（型の説明の前の行を参照）にのみ使用できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい   |
| `expression`                                         | ClickHouseが値の上で実行する[式](../../sql-reference/syntax.md#expressions)。<br/>式はリモートSQLデータベース内のカラム名であることができます。これにより、リモートカラムのエイリアスを作成するために使用できます。<br/><br/>デフォルト値: 式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | いいえ |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`の場合、属性は現在のキーの親キーの値を含みます。[階層辞書](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | いいえ |
| `injective`                                          | `id -> attribute`の写像が[単射](https://en.wikipedia.org/wiki/Injective_function)であるかを示すフラグ。<br/>`true`の場合、ClickHouseは`GROUP BY`句の後に自動的に辞書に対する注入要求を配置できます。通常、これによりそのような要求の量が大幅に削減されます。<br/><br/>デフォルト値: `false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | いいえ |
| `is_object_id`                                       | クエリが`ObjectID`でMongoDBドキュメントのために実行されるかどうかを示すフラグ。<br/><br/>デフォルト値: `false`。

## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouseは[数値キー](#numeric-key)を持つ階層辞書をサポートしています。

次の階層構造を見てみましょう:

``` text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (センター)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は以下の辞書テーブルとして表現できます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | センター      |
| 4          | 0              | イギリス      |
| 5          | 4              | ロンドン      |

このテーブルには要素の最寄りの親のキーを含む`parent_region`カラムがあります。

ClickHouseは外部辞書属性の階層プロパティをサポートしています。このプロパティは、上記のように階層辞書を設定することを可能にします。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得できます。

例として、この辞書の構造は以下のようになります：

``` xml
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

## Polygon dictionaries {#polygon-dictionaries}

ポリゴン辞書は、指定されたポイントを含むポリゴンを効率的に検索可能にします。
例えば、地理座標による都市エリアの定義です。

ポリゴン辞書設定の例:

<CloudDetails />

``` xml
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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md#create-dictionary-query):
``` sql
CREATE DICTIONARY polygon_dict_name (
    key Array(Array(Array(Array(Float64)))),
    name String,
    value UInt64
)
PRIMARY KEY key
LAYOUT(POLYGON(STORE_POLYGON_KEY_COLUMN 1))
...
```

ポリゴン辞書を設定する際、キーは以下の2つのタイプのいずれかでなければなりません:

- シンプルポリゴン。ポイントの配列です。
- マルチポリゴン。ポリゴンの配列です。各ポリゴンは2次元のポイントの配列です。この配列の最初の要素がポリゴンの外部境界で、続く要素がそこから除外する領域を指定します。

ポイントは配列またはその座標のタプルとして指定できます。現在の実装では、2次元ポイントのみがサポートされています。

ユーザーはClickHouseがサポートするすべてのフォーマットで独自のデータをアップロードできます。

利用可能なインメモリストレージの3つのタイプが存在します:

- `POLYGON_SIMPLE`。これは単純な実装で、各クエリに対してすべてのポリゴンを線形に通過し、追加インデックスを使用せずにそれぞれのメンバーシップを確認します。

- `POLYGON_INDEX_EACH`。各ポリゴンごとに別個のインデックスが構築され、ほとんどの場合においてメンバーシップを迅速に確認できます（地理的領域に最適化されています）。また、考慮される区域にグリッドが重ねられ、考慮されるポリゴンの数が大幅に絞り込まれます。このグリッドはセルを16等分に再帰的に分割して作成され、2つのパラメータで設定されます。分割は再帰の深さが`MAX_DEPTH`に達するか、セルが`MIN_INTERSECTIONS`ポリゴンを越えない場合に停止します。クエリに応じて、対応するセルがあり、その中に保存されたポリゴンのインデックスに交互にアクセスされます。

- `POLYGON_INDEX_CELL`。この配置でも上述のグリッドが作成されます。利用可能なものと同じオプションがあります。各シートセルには、それに該当するすべてのポリゴンをインデックス化したものが構築され、迅速にリクエストに応じることができます。

- `POLYGON`。これは`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書を扱うための標準の[関数](../../sql-reference/functions/ext-dict-functions.md)を用いて実行されます。
重要な違いは、ここでのキーがポリゴンを含むかを見つけたいポイントである点です。

**例**

上記に定義された辞書を使用する例:

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

最後のコマンドを実行すると、'points'テーブルの各ポイントに対して、そのポイントを含む最小面積のポリゴンが見つかり、リクエストされた属性が出力されます。

**例**

ポリゴン辞書からはSELECTクエリを介してカラムを読み取ることができます。辞書設定または対応するDDLクエリの中で`store_polygon_key_column = 1`をオンにするだけです。

クエリ:

``` sql
CREATE TABLE polygons_test_table
(
    key Array(Array(Array(Tuple(Float64, Float64)))),
    name String
) ENGINE = TinyLog;

INSERT INTO polygons_test_table VALUES ([[[(3, 1), (0, 1), (0, -1), (3, -1)]]], 'Value');

CREATE DICTIONARY polygons_test_dictionary
(
```
```sql
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

## 正規表現ツリー辞書 {#regexp-tree-dictionary}

正規表現ツリー辞書は、キーから属性へのマッピングを正規表現のツリーを使って表現する特別なタイプの辞書です。いくつかのユースケースがあります。例えば、[ユーザーエージェント](https://en.wikipedia.org/wiki/User_agent)文字列の解析などは、正規表現ツリー辞書を使用することでエレガントに表現できます。

### ClickHouseオープンソースでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、正規表現ツリーを含むYAMLファイルへのパスを提供するYAMLRegExpTreeソースを使用してClickHouseオープンソースで定義されます。

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

辞書ソース`YAMLRegExpTree`は、正規表現ツリーの構造を表します。例えば：

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

この設定は、正規表現ツリーのノードのリストで構成されています。各ノードは次の構造を持ちます：

- **regexp**: ノードの正規表現です。
- **attributes**: ユーザー定義の辞書属性のリストです。この例では、2つの属性があり、`name`と`version`です。最初のノードは両方の属性を定義し、2番目のノードは属性`name`のみを定義します。属性`version`は2番目のノードの子ノードから提供されます。
  - 属性の値には、**バックリファレンス**が含まれる場合があります。これは、マッチした正規表現のキャプチャグループを参照します。この例では、最初のノードの属性`version`の値は、正規表現のキャプチャグループ`(\d+[\.\d]*)`に対するバックリファレンス`\\1`で構成されています。バックリファレンス番号は1から9までで、`$1`または`\\1`（1の場合）として記述されます。バックリファレンスは、クエリ実行中にマッチしたキャプチャグループによって置き換えられます。
- **child nodes**: 各ノードは、独自の属性と（潜在的に）子ノードを持つ正規表現ツリーのノードの子供のリストです。文字列マッチングは深さ優先方式で進行します。文字列が正規表現ノードにマッチすると、辞書はそれがそれぞれのノードの子ノードにもマッチするかどうかをチェックします。それが当てはまる場合、最も深いマッチノードの属性が割り当てられます。子ノードの属性は、親のノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は、例えば、上の例の`versions`のように任意です。

正規表現ツリー辞書は、関数`dictGet`、`dictGetOrDefault`、および`dictGetAll`を使用してのみアクセスを許可します。

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

この場合、最初にトップレイヤーの2番目のノードで正規表現`\d+/tclwebkit(?:\d+[\.\d]*)`にマッチします。辞書は次に子ノードを見て、文字列が`3[12]/tclwebkit`にもマッチすることを確認します。その結果、属性`name`の値は`Android`（最初のレイヤーで定義されている）であり、属性`version`の値は`12`（子ノードで定義されています）になります。

強力なYAML構成ファイルを使用することで、正規表現ツリー辞書をユーザーエージェント文字列のパーサーとして使用することができます。私たちは[uap-core](https://github.com/ua-parser/uap-core)をサポートしており、その使用方法を機能テスト[02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh)で示しています。

#### 属性値の収集 {#collecting-attribute-values}

時には、マッチした複数の正規表現からの値を返すことが有用である場合があります。その場合、特殊な[`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall)関数を使用できます。ノードがタイプ`T`の属性値を持っていれば、`dictGetAll`はゼロ以上の値を含む`Array(T)`を返します。

デフォルトでは、キーごとに返されるマッチの数には上限がありません。`dictGetAll`のオプションの第四引数として上限を渡すことができます。配列は_トポロジー順_でポピュレートされます。これは、子ノードが親ノードの前に来て、兄弟ノードがソースの順序に従うことを意味します。

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

結果:

```text
┌─url────────────────────────────────────┬─dictGetAll('regexp_dict', ('tag', 'topological_index', 'captured', 'parent'), url, 2)─┐
│ clickhouse.com                         │ (['ClickHouse'],[1],[],[])                                                            │
│ clickhouse.com/docs/en                 │ (['ClickHouse Documentation','ClickHouse'],[0,1],['/en'],['ClickHouse'])              │
│ github.com/clickhouse/tree/master/docs │ (['Documentation','GitHub'],[2,3],[NULL],[])                                          │
└────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────┘
```

#### マッチモード {#matching-modes}

パターンマッチングの動作は、特定の辞書設定で変更できます：
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを使用します（デフォルトは`false`）。個々の式で`(?i)`と`(?-i)`を使用して上書きできます。
- `regexp_dict_flag_dotall`: `.`が改行文字にマッチすることを許可します（デフォルトは`false`）。

### ClickHouse Cloudでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記の`YAMLRegExpTree`ソースは、ClickHouseオープンソースでは動作しますが、ClickHouse Cloudでは動作しません。ClickHouse Cloudで正規表現ツリー辞書を使用するには、まずローカルのClickHouseオープンソースでYAMLファイルから正規表現ツリー辞書を作成し、次に辞書テーブル関数と[INTO OUTFILE](../statements/select/into-outfile.md)句を使用してこの辞書をCSVファイルにダンプします。

```sql
SELECT * FROM dictionary(regexp_dict) INTO OUTFILE('regexp_dict.csv')
```

CSVファイルの内容は次の通りです：

```text
1,0,"Linux/(\d+[\.\d]*).+tlinux","['version','name']","['\\1','TencentOS']"
2,0,"(\d+)/tclwebkit(\d+[\.\d]*)","['comment','version','name']","['test $1 and $2','$1','Android']"
3,2,"33/tclwebkit","['version']","['13']"
4,2,"3[12]/tclwebkit","['version']","['12']"
5,2,"3[12]/tclwebkit","['version']","['11']"
6,2,"3[12]/tclwebkit","['version']","['10']"
```

ダンプされたファイルのスキーマは次の通りです：

- `id UInt64`: RegexpTreeノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現の文字列。
- `keys Array(String)`: ユーザー定義属性の名前。
- `values Array(String)`: ユーザー定義属性の値。

ClickHouse Cloudで辞書を作成するには、まず下記のテーブル構造を持つテーブル`regexp_dictionary_source_table`を作成します。

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

次に、ローカルCSVを以下のように更新します。

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

[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files)に関する詳細もご覧ください。ソーステーブルを初期化したら、テーブルソースからRegexpTreeを作成できます：

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

## 埋め込み辞書 {#embedded-dictionaries}

<SelfManaged />

ClickHouseには、ジオベースと共に作業するための組み込み機能が含まれています。

これにより、次のことが可能になります：

- 地域のIDを使って、その言語での名前を取得。
- 地域のIDを使って、都市、地域、連邦地区、国、または大陸のIDを取得。
- 地域が他の地域に属しているかどうかを確認。
- 親地域のチェーンを取得。

すべての関数は「トランスローカリティ」をサポートしています。これは、地域の所有に関する異なる視点を同時に使用する能力です。詳細については、「Web解析辞書の作業用機能」セクションを参照してください。

内部辞書はデフォルトパッケージでは無効になっています。
これらを有効にするには、サーバー設定ファイルで`path_to_regions_hierarchy_file`および`path_to_regions_names_files`のパラメータのコメントを外します。

ジオベースはテキストファイルから読み込まれます。

`regions_hierarchy*.txt`ファイルを`path_to_regions_hierarchy_file`ディレクトリに配置してください。この設定パラメータは、`regions_hierarchy.txt`ファイルへのパス（デフォルトの地域階層）を含む必要があります。他のファイル（`regions_hierarchy_ua.txt`など）は同じディレクトリに格納する必要があります。

`regions_names_*.txt`ファイルは、`path_to_regions_names_files`ディレクトリに配置します。

これらのファイルを自分で作成することも可能です。ファイルフォーマットは次の通りです：

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 親地域ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 市；他のタイプには値がありません
- 人口 (`UInt32`) — オプションの列

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、カラム：

- 地域ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含むことはできません（エスケープされたものでも不可）。

RAMに格納するためにフラット配列が使用されます。このため、IDは100万を超えないようにしてください。

辞書はサーバーを再起動せずに更新できます。ただし、利用可能な辞書のセットは更新されません。
更新のため、ファイルの変更時刻がチェックされます。ファイルが変更された場合、辞書は更新されます。
変更を確認するインターバルは、`builtin_dictionaries_reload_interval`パラメータで設定されます。
辞書の更新（最初の使用時のロードを除く）は、クエリをブロックしません。更新中は、クエリは古い辞書のバージョンを使用します。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは古いバージョンの辞書を使用し続けます。

ジオベースでは、辞書を定期的に更新することをお勧めします。更新中は、新しいファイルを生成し、別の場所に書き込みます。準備が整ったら、それらをサーバーが使用するファイルにリネームします。

OS識別子や検索エンジンに関する関数もありますが、それらは使用すべきではありません。
```
