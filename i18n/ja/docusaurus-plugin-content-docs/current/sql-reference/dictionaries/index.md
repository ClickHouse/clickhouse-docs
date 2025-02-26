---
slug: /sql-reference/dictionaries
sidebar_label: 辞書の定義
sidebar_position: 35
---

import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import CloudDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/sql-reference/dictionaries/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 辞書

辞書とは、様々なタイプのリファレンスリストに便利なマッピング（`key -> attributes`）です。

ClickHouseは、クエリ内で使用できる辞書操作用の特別な関数をサポートしています。辞書を使用する方が、リファレンステーブルとの`JOIN`よりも簡単で効率的です。

ClickHouseは以下をサポートしています：

- 一連の[関数](../../sql-reference/functions/ext-dict-functions.md)を持つ辞書。
- 特定の[関数](../../sql-reference/functions/ym-dict-functions.md)を持つ[埋め込み辞書](#embedded-dictionaries)。

:::tip チュートリアル
ClickHouseの辞書の使い始めとしてのチュートリアルがあります。[こちら](/tutorial.md)をご覧ください。
:::

さまざまなデータソースから独自の辞書を追加できます。辞書のソースはClickHouseテーブル、ローカルのテキストまたは実行可能ファイル、HTTP(s)リソース、または他のDBMSである場合があります。詳細については、"[辞書ソース](#dictionary-sources)"を参照してください。

ClickHouseは以下の機能を持っています：

- 辞書をRAMに完全または部分的に格納します。
- 辞書を定期的に更新し、欠落している値を動的にロードします。言い換えれば、辞書は動的にロードできます。
- XMLファイルまたは[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して辞書を作成できるようにします。

辞書の構成は、1つ以上のXMLファイルに配置できます。構成へのパスは[dictionaries_config](../../operations/server-configuration-parameters/settings.md#dictionaries_config)パラメータで指定されます。

辞書は、[dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)設定に応じて、サーバーの起動時または初回使用時に読み込まれます。

[dictionaries](../../operations/system-tables/dictionaries.md#system_tables-dictionaries)システムテーブルには、サーバーに設定された辞書に関する情報が含まれています。それぞれの辞書について、以下の情報が確認できます：

- 辞書のステータス。
- 構成パラメータ。
- 辞書が正常に読み込まれてからのクエリ数や、辞書に割り当てられたRAMの量などのメトリクス。

<CloudDetails />
## DDLクエリで辞書を作成する {#creating-a-dictionary-with-a-ddl-query}

辞書は[DDLクエリ](../../sql-reference/statements/create/dictionary.md)を使用して作成でき、これは推奨される方法です。なぜなら、DDLで作成された辞書では：
- サーバー構成ファイルに追加のレコードが加わることはありません。
- 辞書はテーブルやビューのような一級のエンティティとして扱うことができます。
- データは、辞書テーブル関数ではなく、馴染みのあるSELECTを使用して直接読み取ることができます。
- 辞書は簡単に名前を変更できます。

## 構成ファイルで辞書を作成する {#creating-a-dictionary-with-a-configuration-file}

<CloudNotSupportedBadge/>

:::note
構成ファイルで辞書を作成することはClickHouse Cloudには適用されません。DDLを使用し（上記参照）、ユーザー`default`として辞書を作成してください。
:::

辞書の構成ファイルは以下の形式です：

``` xml
<clickhouse>
    <comment>任意の内容を含むオプション要素。ClickHouseサーバーによって無視されます。</comment>

    <!--オプション要素。置換を伴うファイル名-->
    <include_from>/etc/metrika.xml</include_from>

    <dictionary>
        <!-- 辞書の構成。 -->
        <!-- 構成ファイル内には任意の数の辞書セクションを含めることができます。 -->
    </dictionary>

</clickhouse>
```

同じファイル内に任意の数の辞書を[構成](#configuring-a-dictionary)できます。

:::note
小さな辞書の値を変換するには、`SELECT`クエリでそれを記述することができます（[transform](../../sql-reference/functions/other-functions.md)関数参照）。この機能は辞書に関連していません。
:::

## 辞書の構成 {#configuring-a-dictionary}

<CloudDetails />

XMLファイルを使用して辞書が構成されている場合、辞書の構成は以下の構造を持ちます：

``` xml
<dictionary>
    <name>dict_name</name>

    <structure>
      <!-- 複雑なキー構成 -->
    </structure>

    <source>
      <!-- ソース構成 -->
    </source>

    <layout>
      <!-- メモリレイアウト構成 -->
    </layout>

    <lifetime>
      <!-- メモリ内の辞書のライフタイム -->
    </lifetime>
</dictionary>
```

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)は以下の構造を持ちます：

``` sql
CREATE DICTIONARY dict_name
(
    ... -- 属性
)
PRIMARY KEY ... -- 複雑または単一のキー構成
SOURCE(...) -- ソース構成
LAYOUT(...) -- メモリレイアウト構成
LIFETIME(...) -- メモリ内の辞書のライフタイム
```
## メモリに辞書を格納する {#storing-dictionaries-in-memory}

辞書をメモリに格納する方法はいくつかあります。

最適な処理速度を提供するため、[flat](#flat)、[hashed](#hashed)、および[complex_key_hashed](#complex_key_hashed)の使用を推奨します。

キャッシュの使用は推奨されません。パフォーマンスが悪くなる可能性があり、最適なパラメータの選択が困難になるためです。詳細は[cache](#cache)セクションで説明します。

辞書のパフォーマンスを向上させる方法はいくつかあります：

- `GROUP BY`の後に辞書操作関数を呼び出します。
- 抽出用の属性を注入可能としてマークします。異なるキーが異なる属性値に対応する場合、その属性は注入可能と呼ばれます。したがって、`GROUP BY`でキーによって属性値を取得する関数が使用されると、この関数は自動的に`GROUP BY`から取り除かれます。

ClickHouseは辞書に関するエラーについて例外を生成します。エラーの例：

- アクセスしようとした辞書がロードできませんでした。
- `cached`辞書のクエリエラー。

辞書とそのステータスの一覧は、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

<CloudDetails />

構成は以下のようになります：

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

対応する[DDLクエリ](../../sql-reference/statements/create/dictionary.md)：

``` sql
CREATE DICTIONARY (...)
...
LAYOUT(LAYOUT_TYPE(param value)) -- レイアウト設定
...
```

`complex-key*`という語を含まないレイアウトの辞書は[UInt64](../../sql-reference/data-types/int-uint.md)型のキーを持ち、`complex-key*`辞書は複合キー（複雑で任意の型）を持ちます。

XML辞書内の[UInt64](../../sql-reference/data-types/int-uint.md)キーは`<id>`タグで定義されます。

構成例（カラムkey_columnはUInt64型）：
```xml
...
<structure>
    <id>
        <name>key_column</name>
    </id>
...
```

複合的な`complex`キーのXML辞書は`<key>`タグで定義されます。

構成例（キーが[String](../../sql-reference/data-types/string.md)タイプの要素を1つ持つ複合キー）：
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

辞書は完全にフラット配列の形でメモリに格納されます。辞書はどのくらいのメモリを使用しますか？使用される空間に比例して、最大キーのサイズに依存します。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型で、値は`max_array_size`（デフォルトは500,000）に制限されます。辞書作成時により大きなキーが発見された場合、ClickHouseは例外をスローし、辞書を作成しません。辞書フラット配列の初期サイズは`initial_array_size`設定により制御されます（デフォルトは1024）。 

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）全体が読み込まれます。

この方法は、利用可能なすべての辞書ストレージ方法の中で最高のパフォーマンスを提供します。

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

辞書は完全にハッシュテーブルの形でメモリに格納されます。辞書は任意の数の要素を任意の識別子で持つことができます。実際には、キーの数は数千万アイテムに達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）全体が読み込まれます。

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
    <!-- シャードが1より大きい場合（デフォルトは`1`）、辞書は
         並行してデータを読み込みます。これは、1つの
         辞書にいっぱいの要素がある場合に便利です。 -->
    <shards>10</shards>

    <!-- 並行キュー内のブロックのバックログの最大サイズ。

         並行読み込みのボトルネックは再ハッシュであるため、スレッドが再ハッシュを行っている際に停止を避けるために、バックログを持つ必要があります。

         10000はメモリと速度のうまいバランスです。
         10e10要素でも、全ての負荷を処理し、スタベーションなしに動作できます。 -->
    <shard_load_queue_backlog>10000</shard_load_queue_backlog>

    <!-- ハッシュテーブルの最大負荷係数。値が増えると、メモリがより効率的に利用され（メモリの無駄が少なくなる）、ただし読み取り/パフォーマンスが低下する可能性があります。

         有効な値: [0.5, 0.99]
         デフォルト: 0.5 -->
    <max_load_factor>0.5</max_load_factor>
  </hashed>
</layout>
```

または

``` sql
LAYOUT(HASHED([SHARDS 1] [SHARD_LOAD_QUEUE_BACKLOG 10000] [MAX_LOAD_FACTOR 0.5]))
```

### sparse_hashed {#sparse_hashed}

`hashed`と似ていますが、より多くのCPU使用量を犠牲にして、メモリをより少なく使用します。

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

このタイプの辞書については`shards`を使用することも可能であり、`hashed`よりも`shard`が重要です。なぜなら、`sparse_hashed`は遅いからです。

### complex_key_hashed {#complex_key_hashed}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。`hashed`と似ています。

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。[sparse_hashed](#sparse_hashed)に似ています。

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

辞書は完全にメモリに格納されます。各属性は配列に格納され、キー属性はハッシュテーブルの形で格納され、値は属性配列のインデックスです。辞書は任意の数の要素を任意の識別子で持つことができます。実際には、キーの数は数千万アイテムに達することがあります。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべてのソースタイプがサポートされています。更新時には、データ（ファイルまたはテーブルから）全体が読み込まれます。

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。[hashed_array](#hashed_array)に似ています。

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

辞書は、範囲の配列とそれに対応する値の順序付きハッシュテーブルの形でメモリに格納されます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。このストレージメソッドは、ハッシュと同じように機能し、キーに加えて日付/時間（任意の数値型）の範囲の使用も許可されます。

例：広告主ごとの割引を含んだテーブルは以下のようになります：

``` text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲用のサンプルを使用するには、[structure](#dictionary-key-and-fields)に`range_min`と`range_max`要素を定義します。これらの要素には、`name`と`type`の要素（`type`が指定されない場合はデフォルトの型が使用される - Date）が含まれる必要があります。`type`は任意の数値型（Date / DateTime / UInt64 / Int32 / その他）にすることができます。

:::note
`range_min`と`range_max`の値は、`Int64`型に収まる必要があります。
:::

例：

``` xml
<layout>
    <range_hashed>
        <!-- オーバーラップする範囲に対する戦略（min/max）。デフォルト：min（最小の(range_min -> range_max)値を持つ一致する範囲を返します） -->
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

これらの辞書を操作するには、`dictGet`関数に範囲が選択される追加の引数を渡す必要があります：

``` sql
dictGet('dict_name', 'attr_name', id, date)
```
クエリ例：

``` sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された`id`および渡された日付を含む日付範囲の値を返します。

アルゴリズムの詳細：

- `id`が見つからない場合や、`id`に対する範囲が見つからない場合、属性の型のデフォルト値を返します。
- オーバーラップする範囲があり、`range_lookup_strategy=min`の場合、最小の`range_min`を持つ一致する範囲を返します。見つかった範囲が複数ある場合は、最小の`range_max`を持つ範囲を返します。再び複数の範囲が見つかった場合（複数の範囲が同じ`range_min`および`range_max`を持っていた場合）は、ランダムにそのうちの一つが返されます。
- オーバーラップする範囲があり、`range_lookup_strategy=max`の場合、最大の`range_min`を持つ一致する範囲を返します。見つかった範囲が複数ある場合は、最大の`range_max`を持つ範囲を返します。再び複数の範囲が見つかった場合は（複数の範囲が同じ`range_min`および`range_max`を持っていた場合）、ランダムにそのうちの一つが返されます。
- `range_max`が`NULL`の場合、範囲はオープンです。`NULL`は最大の可能な値として扱われます。`range_min`には、`1970-01-01`や`0`（-MAX_INT）をオープン値として使用することができます。

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

オーバーラッピング範囲およびオープン範囲を持つ構成例：

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
│ 0.2 │ -- 一致する範囲が2つあり、range_min 2015-01-15 (0.2) は 2015-01-01 (0.1) より大きい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.4 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.3) は 2015-01-04 (0.4) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.5 │ -- 一致する範囲が2つあり、range_min は等しく、2015-01-15 (0.5) は 2015-01-10 (0.6) より大きい
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
│ 0.1 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.1) は 2015-01-15 (0.2) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 2, toDate('2015-01-06')) res;
┌─res─┐
│ 0.3 │ -- 一致する範囲が2つあり、range_min 2015-01-01 (0.3) は 2015-01-04 (0.4) より小さい
└─────┘

select dictGet('discounts_dict', 'amount', 3, toDate('2015-01-01')) res;
┌─res─┐
│ 0.6 │ -- 一致する範囲が2つあり、range_min は等しく、2015-01-10 (0.6) は 2015-01-15 (0.5) より小さい
└─────┘
```

### complex_key_range_hashed {#complex_key_range_hashed}

辞書は、オーダーされた範囲の配列とそれに対応する値を持つハッシュテーブルの形でメモリに格納されます（[range_hashed](#range_hashed)を参照）。このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。

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

辞書は、固定数のセルを持つキャッシュに格納されます。これらのセルには、頻繁に使用される要素が含まれます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

辞書を検索する際には、最初にキャッシュが検索されます。データの各ブロックについて、キャッシュ内に見つからない、または古くなったすべてのキーがソースから要求されます。このデータは、`SELECT attrs... FROM db.table WHERE id IN (k1, k2, ...)`を介して要求されます。受け取ったデータは、その後キャッシュに書き込まれます。

辞書内にキーが見つからない場合、更新キャッシュタスクが作成され、更新キューに追加されます。更新キューのプロパティは、`max_update_queue_size`、`update_queue_push_timeout_milliseconds`、`query_wait_timeout_milliseconds`、`max_threads_for_updates`設定を使用して制御できます。

キャッシュ辞書に対しては、キャッシュ内のデータの有効期限[lifetime](#refreshing-dictionary-data-using-lifetime)を設定できます。セル内のデータがロードされてから`lifetime`よりも長い時間が経過すると、そのセルの値は使用されず、キーは期限切れになります。次回使用する必要があるときに、そのキーが再要求されます。この動作は、`allow_read_expired_keys`設定で構成できます。

これは、すべての辞書ストレージ方法の中で最も効果がありません。キャッシュの速度は、正確な設定および使用シナリオに強く依存します。キャッシュタイプの辞書は、ヒット率が十分に高い（推奨99％以上）の場合にのみ良好なパフォーマンスを発揮します。キャッシュの平均ヒット率は、[system.dictionaries](../../operations/system-tables/dictionaries.md)テーブルで確認できます。

`allow_read_expired_keys`設定が1に設定されている場合、デフォルトは0です。辞書は非同期更新をサポートできます。クライアントがキーを要求し、すべてのキーがキャッシュにあり、一部が期限切れの場合、辞書は期限切れのキーをクライアントに返し、ソースから非同期的にそれらを要求します。

キャッシュのパフォーマンスを改善するには、`LIMIT`付きのサブクエリを使用し、外部から辞書関数を呼び出してください。

すべてのソースタイプがサポートされています。

設定の例：

``` xml
<layout>
    <cache>
        <!-- セルの数によるキャッシュのサイズ。2の累乗に丸められます。 -->
        <size_in_cells>1000000000</size_in_cells>
        <!-- 期限切れのキーの読み取りを許可します。 -->
        <allow_read_expired_keys>0</allow_read_expired_keys>
        <!-- 更新キューの最大サイズ。 -->
        <max_update_queue_size>100000</max_update_queue_size>
        <!-- 更新タスクをキューにプッシュする際の最大タイムアウト（ミリ秒）。 -->
        <update_queue_push_timeout_milliseconds>10</update_queue_push_timeout_milliseconds>
        <!-- 更新タスクの完了を待機する際の最大タイムアウト（ミリ秒）。 -->
        <query_wait_timeout_milliseconds>60000</query_wait_timeout_milliseconds>
        <!-- キャッシュ辞書更新のための最大スレッド数。 -->
        <max_threads_for_updates>4</max_threads_for_updates>
    </cache>
</layout>
```

または

``` sql
LAYOUT(CACHE(SIZE_IN_CELLS 1000000000))
```

十分に大きなキャッシュサイズを設定してください。セルの数を選択するには実験が必要です：

1. いくつかの値を設定します。
2. キャッシュが完全に満杯になるまでクエリを実行します。
3. `system.dictionaries`テーブルを使用してメモリ消費を評価します。
4. 必要なメモリ消費が得られるまで、セルの数を増減します。

:::note
ClickHouseをソースとして使用しないでください。ランダム読み取りのクエリ処理が遅くなります。
:::

### complex_key_cache {#complex_key_cache}

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。`cache`に似ています。

### ssd_cache {#ssd_cache}

`cache`と似ていますが、データをSSDに保存し、インデックスはRAMに保管します。更新キューに関連するすべてのキャッシュ辞書設定もSSDキャッシュ辞書に適用できます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

``` xml
<layout>
    <ssd_cache>
        <!-- 物理読み込みブロックのサイズ（バイト単位）。SSDのページサイズに等しいことが推奨されます。 -->
        <block_size>4096</block_size>
        <!-- 最大キャッシュファイルサイズ（バイト単位）。 -->
        <file_size>16777216</file_size>
        <!-- SSDから要素を読み込む際のRAMバッファサイズ（バイト単位）。 -->
        <read_buffer_size>131072</read_buffer_size>
        <!-- SSDにフラッシュする前に要素を集約するためのRAMバッファサイズ（バイト単位）。 -->
        <write_buffer_size>1048576</write_buffer_size>
        <!-- キャッシュファイルの格納パス。 -->
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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。`ssd_cache`に似ています。

### direct {#direct}

辞書はメモリに格納されず、リクエストの処理中にソースに直接行きます。

辞書のキーは[UInt64](../../sql-reference/data-types/int-uint.md)型です。

すべての[ソース](#dictionary-sources)タイプがサポートされており、ローカルファイルは除外されます。

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

このストレージタイプは、複合[キー](#dictionary-key-and-fields)での使用向けです。`direct`に似ています。

### ip_trie {#ip_trie}

このストレージタイプは、ネットワークプレフィックス（IPアドレス）をASNなどのメタデータにマッピングするためのものです。

**例**

ClickHouseに以下のIPプレフィックスとマッピングを含むテーブルがあると仮定します：

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

このテーブルのために`ip_trie`辞書を定義しましょう。`ip_trie`レイアウトには複合キーが必要です：

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
        <!-- キー属性`prefix`はdictGetStringを介して取得できます。 -->
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

キーは一つの`String`型属性を持つ必要があり、許可されているIPプレフィックスが含まれなければなりません。他の型は現在サポートされていません。

構文は次のとおりです：

``` sql
dictGetT('dict_name', 'attr_name', ip)
```

関数はIPv4の場合は`UInt32`、IPv6の場合は`FixedString(16)`を取ります。例えば：

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

他の型はサポートされていません。関数は、このIPアドレスに対応するプレフィックスの属性を返します。プレフィックスが重複する場合は、最も特定のものが返されます。

データは完全にRAMに収まる必要があります。
## LIFETIMEを使用した辞書データの更新 {#refreshing-dictionary-data-using-lifetime}

ClickHouseは、`LIFETIME`タグ（秒単位で定義）に基づいて定期的に辞書を更新します。`LIFETIME`は、完全にダウンロードされた辞書の更新間隔及びキャッシュされた辞書の無効化間隔です。

更新中、辞書の古いバージョンは引き続きクエリできます。辞書の更新（最初の使用のために辞書を読み込む場合を除く）はクエリをブロックしません。更新中にエラーが発生した場合、エラーはサーバーログに書き込まれ、クエリは辞書の古いバージョンを使用して続行できます。辞書の更新が成功した場合、辞書の古いバージョンは原子的に置き換えられます。

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

`<lifetime>0</lifetime>`（`LIFETIME(0)`）を設定すると、辞書の更新が停止します。

更新のための時間間隔を設定すると、ClickHouseはこの範囲内で均等にランダムな時間を選択します。これは、多数のサーバでの更新時に辞書ソースへの負荷を分散するために必要です。

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

`<min>0</min>`および`<max>0</max>`の場合、ClickHouseはタイムアウトにより辞書を再読み込みしません。この場合、辞書の設定ファイルが変更された場合や、`SYSTEM RELOAD DICTIONARY`コマンドが実行された場合、ClickHouseは辞書を早期に再読み込みできます。

辞書を更新する際、ClickHouseサーバは[ソース](#dictionary-sources)の種類に応じて異なるロジックを適用します：

- テキストファイルの場合は、変更時刻をチェックします。もしその時刻が以前に記録された時刻と異なれば、辞書が更新されます。
- その他のソースからの辞書は、デフォルトでは毎回更新されます。

他のソース（ODBC、PostgreSQL、ClickHouseなど）の場合、辞書が本当に変更された場合にのみ更新されるクエリを設定できます。これを行うには、次の手順に従います：

- 辞書テーブルには、ソースデータが更新されるたびに常に変更されるフィールドが必要です。
- ソースの設定には、変更フィールドを取得するクエリを指定する必要があります。ClickHouseサーバはクエリの結果を行として解釈し、この行が以前の状態に対して変更されている場合、辞書は更新されます。クエリを[ソース](#dictionary-sources)の設定の`<invalidate_query>`フィールドに指定します。

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

`Cache`、`ComplexKeyCache`、`SSDCache`、および`SSDComplexKeyCache`辞書では、同期および非同期の更新がサポートされています。

`Flat`、`Hashed`、`ComplexKeyHashed`辞書については、前回の更新後に変更されたデータのみをリクエストすることも可能です。辞書ソース設定の一部として`update_field`を指定した場合、更新されたデータをリクエストに追加する際に前回の更新時刻の値が秒単位で追加されます。ソースの種類に応じて（Executable、HTTP、MySQL、PostgreSQL、ClickHouse、またはODBC）、外部ソースからデータをリクエストする前に`update_field`に異なるロジックが適用されます。

- ソースがHTTPの場合、`update_field`は、リクエストパラメータとして最後の更新時刻をパラメータ値に追加されます。
- ソースがExecutableの場合、`update_field`は、最後の更新時刻を引数値として実行可能なスクリプトの引数として追加されます。
- ソースがClickHouse、MySQL、PostgreSQL、ODBCの場合には、`WHERE`の追加部分があり、`update_field`は最後の更新時刻に対して大なりまたは等しい比較を行います。
    - デフォルトでは、この`WHERE`条件はSQLクエリの最上位レベルでチェックされます。代わりに、クエリ内の他の`WHERE`句内で`{condition}`キーワードを使用して条件をチェックできます。例：
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

`update_field`オプションが設定されている場合、追加オプション`update_lag`も設定できます。`update_lag`オプションの値は、更新されたデータをリクエストする前に前回の更新時刻から減算されます。

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

辞書は、さまざまなソースからClickHouseに接続できます。

辞書がxmlファイルを使用して構成されている場合、構成は次のようになります。

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

[DDLクエリ](../../sql-reference/statements/create/dictionary.md)の場合、上記の構成は次のようになります。

``` sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソース設定
...
```

ソースは`source`セクションで構成されます。

ソースタイプ[ローカルファイル](#local-file)、[実行可能ファイル](#executable-file)、[HTTP(s)](#https)、[ClickHouse](#clickhouse)のオプション設定は次のようにあります：

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
- `format` – ファイル形式。[Formats](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。

ソースが`FILE`の辞書をDDLコマンド（`CREATE DICTIONARY ...`）で作成する際、ソースファイルは`user_files`ディレクトリ内に存在する必要があります。これにより、DBユーザーがClickHouseノード上の任意のファイルにアクセスするのを防ぎます。

**関連項目**

- [辞書関数](../../sql-reference/table-functions/dictionary.md#dictionary-function)
### 実行可能ファイル {#executable-file}

実行可能ファイルとの作業は、[辞書がメモリにどのように保存されているか](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`または`complex_key_cache`を使用して保存されている場合、ClickHouseは必要なキーを実行可能ファイルのSTDINにリクエストを送信することで要求します。それ以外の場合、ClickHouseは実行可能ファイルを起動し、その出力を辞書データとして扱います。

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

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが`PATH`に存在する場合）。
- `format` — ファイル形式。[Formats](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒間シャットダウンする時間が与えられます。その後、ClickHouseは子プロセスにSIGTERM信号を送ります。`command_termination_timeout`は秒単位で指定されます。デフォルト値は10。オプションパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み込むためのタイムアウト（ミリ秒単位）。デフォルト値10000。オプションパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値10000。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、リクエストされたキーとの対応は暗黙的に—結果の行の順序によって決定されます。デフォルト値はfalse。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定したuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例： `script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は引数として`bin/sh -c`に渡されます。デフォルト値は`0`。オプションパラメータ。
- `send_chunk_header` - データの塊を処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`。

この辞書ソースはXML構成を通じてのみ設定できます。DDLを介して実行可能ソースを使用して辞書を作成することは無効化されており、そうでない場合、DBユーザーはClickHouseノードで任意のバイナリを実行できることになります。
### 実行可能プール {#executable-pool}

実行可能プールは、プロセスプールからデータを読み込むことを可能にします。このソースは、ソースからすべてのデータを読み込む必要のある辞書レイアウトとは互換性がありません。実行可能プールは、辞書が`cache`、`complex_key_cache`、`ssd_cache`、`complex_key_ssd_cache`、`direct`、または`complex_key_direct`のレイアウトを使用して[保存されている](#ways-to-store-dictionaries-in-memory)場合にのみ動作します。

実行可能プールは、指定されたコマンドでプロセスのプールを生成し、プロセスが終了するまで実行を維持します。プログラムは、STDINからデータが利用可能な間はそのデータを読み取り、結果をSTDOUTに出力する必要があります。次のデータブロックをSTDINで待機できます。ClickHouseはデータブロックの処理後にSTDINを閉じることはありませんが、必要に応じて別のデータの塊をパイプします。実行可能スクリプトは、このデータ処理の方法に対応できるように準備する必要があります。STDINをポーリングし、データを早期にSTDOUTにフラッシュする必要があります。

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

- `command` — 実行可能ファイルへの絶対パス、またはファイル名（プログラムディレクトリが`PATH`に書かれている場合）。
- `format` — ファイル形式。[Formats](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `pool_size` — プールのサイズ。`pool_size`に0が指定された場合、プールサイズの制限はありません。デフォルト値は`16`。
- `command_termination_timeout` — 実行可能スクリプトはメインの読み書きループを含む必要があります。辞書が破棄された後、パイプが閉じられ、実行可能ファイルは`command_termination_timeout`秒間シャットダウンする時間が与えられます。その後、ClickHouseは子プロセスにSIGTERM信号を送ります。指定は秒単位。デフォルト値は10。オプションパラメータ。
- `max_command_execution_time` — データブロック処理のための実行可能スクリプトコマンド実行時間の最大値。指定は秒単位。デフォルト値は10。オプションパラメータ。
- `command_read_timeout` - コマンドのstdoutからデータを読み取るためのタイムアウト（ミリ秒単位）。デフォルト値10000。オプションパラメータ。
- `command_write_timeout` - コマンドのstdinにデータを書き込むためのタイムアウト（ミリ秒単位）。デフォルト値10000。オプションパラメータ。
- `implicit_key` — 実行可能ソースファイルは値のみを返すことができ、リクエストされたキーとの対応は暗黙的に—結果の行の順序によって決定されます。デフォルト値はfalse。オプションパラメータ。
- `execute_direct` - `execute_direct` = `1`の場合、`command`は[ user_scripts_path](../../operations/server-configuration-parameters/settings.md#user_scripts_path)で指定したuser_scriptsフォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます。例： `script_name arg1 arg2`。`execute_direct` = `0`の場合、`command`は引数として`bin/sh -c`に渡されます。デフォルト値は`1`。オプションパラメータ。
- `send_chunk_header` - データを処理する前に行数を送信するかどうかを制御します。オプション。デフォルト値は`false`。

この辞書ソースはXML構成を通じてのみ設定できます。DDLを介して実行可能ソースを使用して辞書を作成することは無効化されており、そうでない場合、DBユーザーはClickHouseノードで任意のバイナリを実行できることになります。
### HTTP(S) {#https}

HTTP(S)サーバーとの作業は、[辞書がメモリにどのように保存されているか](#storing-dictionaries-in-memory)によって異なります。辞書が`cache`や`complex_key_cache`を使用して保存されている場合、ClickHouseは`POST`メソッドでリクエストを送信することで必要なキーをリクエストします。

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

ClickHouseがHTTPSリソースにアクセスするためには、サーバー設定で[openSSL](../../operations/server-configuration-parameters/settings.md#openssl)の設定が必要です。

設定フィールド：

- `url` – ソースURL。
- `format` – ファイル形式。[Formats](../../interfaces/formats.md#formats)で説明されているすべての形式がサポートされています。
- `credentials` – 基本HTTP認証。オプションパラメータ。
- `user` – 認証に必要なユーザー名。
- `password` – 認証に必要なパスワード。
- `headers` – HTTPリクエストで使用されるすべてのカスタムHTTPヘッダーエントリ。オプションパラメータ。
- `header` – 単一のHTTPヘッダーエントリ。
- `name` – リクエスト時に送信されるヘッダーの識別子名。
- `value` – 特定の識別子名に設定される値。

DDLコマンド（`CREATE DICTIONARY ...`）を使用して辞書を作成する際、HTTP辞書のためのリモートホストは、コンフィグの`remote_url_allow_hosts`セクションの内容に対して確認されます。これにより、データベースユーザーが任意のHTTPサーバーにアクセスするのを防ぎます。
### DBMS {#dbms}
#### ODBC {#odbc}

ODBCドライバーを持つ任意のデータベースに接続するためにこの方法を使用できます。

設定の例：

``` xml
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

- `db` – データベース名。`<connection_string>`パラメータでデータベース名が設定されている場合は省略します。
- `table` – テーブル名およびスキーマ名（ある場合）。
- `connection_string` – 接続文字列。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)で詳細を確認できます。
- `background_reconnect` – 接続失敗時にバックグラウンドでレプリカに再接続します。オプションパラメータ。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`および`query`フィールドは一緒に使用できません。また、`table`または`query`フィールドのいずれか一つは宣言されている必要があります。
:::

ClickHouseはODBCドライバーから引用記号を受信し、すべての設定をクエリ内で引用するため、テーブル名はデータベース内のテーブル名のケースに応じて設定する必要があります。

Oracleを使用する際にエンコーディングの問題がある場合は、対応する[FAQ](/knowledgebase/oracle-odbc)をご覧ください。
##### ODBC辞書機能の既知の脆弱性 {#known-vulnerability-of-the-odbc-dictionary-functionality}

:::note
ODBCドライバーを介してデータベースに接続する際、接続パラメータ`Servername`が置き換えられる可能性があります。この場合、`odbc.ini`の`USERNAME`および`PASSWORD`の値がリモートサーバーに送信され、危険にさらされる可能性があります。
:::

**不正使用の例**

PostgreSQL用にunixODBCを構成しましょう。 `/etc/odbc.ini`の内容：

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

その後、次のようなクエリを実行すると、

``` sql
SELECT * FROM odbc('DSN=gregtest;Servername=some-server.com', 'test_db');
```

ODBCドライバーは`odbc.ini`から`USERNAME`および`PASSWORD`の値を`some-server.com`に送信します。
##### PostgreSQLへの接続の例 {#example-of-connecting-postgresql}

Ubuntu OS。

unixODBCとPostgreSQL用のODBCドライバーをインストールします。

``` bash
$ sudo apt-get install -y unixodbc odbcinst odbc-postgresql
```

`/etc/odbc.ini`（またはClickHouseを実行するユーザーの下でサインインしている場合は`~/.odbc.ini`）を構成します：

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

ClickHouseの辞書設定：

``` xml
<clickhouse>
    <dictionary>
        <name>table_name</name>
        <source>
            <odbc>
                <!-- 以下のパラメータをconnection_stringで指定できます： -->
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

`odbc.ini`を編集して、ドライバーのライブラリへのフルパスを指定する必要がある場合があります。`DRIVER=/usr/local/lib/psqlodbcw.so`。
##### MS SQL Serverへの接続の例 {#example-of-connecting-ms-sql-server}

Ubuntu OS。

MS SQLへの接続用のODBCドライバーをインストールします。

``` bash
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
    # $ cat ~/.odbc.ini # ClickHouseを実行するユーザーの下でサインインしている場合

    [MSSQL]
    Description     = FreeTDS
    Driver          = FreeTDS
    Servername      = MSSQL
    Database        = test
    UID             = test
    PWD             = test
    Port            = 1433


    # (オプション) ODBC接続テスト（isqlツールを使用するには[unixodbc](https://packages.debian.org/sid/unixodbc)パッケージをインストール）
    $ isql -v MSSQL "user" "password"
```

備考：
- 特定のSQL Serverバージョンがサポートする最も早いTDSバージョンを特定するには、製品ドキュメントを参照するか、[MS-TDS Product Behavior](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-tds/135d0ebe-5c4c-4a94-99bf-1811eccb9f4a)を確認してください。

ClickHouseの辞書を設定します：

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

- `port` – MySQLサーバのポート。すべてのレプリカに対して、または各レプリカごとに設定できます（`<replica>`内で）。

- `user` – MySQLユーザーの名前。すべてのレプリカに対して、または各レプリカごとに設定できます（`<replica>`内で）。

- `password` – MySQLユーザーのパスワード。すべてのレプリカに対して、または各レプリカごとに設定できます（`<replica>`内で）。

- `replica` – レプリカ設定セクション。複数のセクションを指定できます。

        - `replica/host` – MySQLホスト。
        - `replica/priority` – レプリカの優先順位。接続を試みる際、ClickHouseは優先順位の順にレプリカをたどります。数字が低いほど優先順位が高くなります。

- `db` – データベース名。

- `table` – テーブル名。

- `where` – 選択基準。同様の条件の構文はMySQLでの`WHERE`句と同じです。例：`id > 10 AND id < 20`。オプションパラメータ。

- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)で詳細を確認できます。

- `fail_on_connection_loss` – 接続損失時のサーバーの動作を制御する設定パラメータ。`true`の場合、クライアントとサーバーの間の接続が失われた場合、すぐに例外がスローされます。`false`の場合、ClickHouseサーバーは例外がスローされる前にクエリを3回再実行しようとします。再試行により応答時間が延びることに注意してください。デフォルト値：`false`。

- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用できません。また、`table`または`query`フィールドのいずれかは宣言されている必要があります。
:::

:::note
明示的なパラメータ`secure`はありません。SSL接続を確立する際にはセキュリティが必須です。
:::

MySQLにはローカルホスト経由でソケットで接続することができます。これを行うには、`host`と`socket`を設定します。

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

- `host` – ClickHouseホスト。ローカルホストであれば、クエリはネットワークアクティビティなしに処理されます。障害耐性を高めるために、[分散テーブル](../../engines/table-engines/special/distributed.md)を作成し、後続の構成でそれを設定できます。
- `port` – ClickHouseサーバのポート。
- `user` – ClickHouseユーザー名。
- `password` – ClickHouseユーザーのパスワード。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択基準。省略可能です。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。オプションパラメータ。[LIFETIMEを使用した辞書データの更新](#refreshing-dictionary-data-using-lifetime)で詳細を確認できます。
- `secure` - 接続にSSLを使用します。
- `query` – カスタムクエリ。オプションパラメータ。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用できません。また、`table`または`query`フィールドのいずれかは宣言されている必要があります。
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
- `port` – MongoDBサーバのポート。
- `user` – MongoDBユーザー名。
- `password` – MongoDBユーザーのパスワード。
- `db` – データベース名。
- `collection` – コレクション名。
- `options` - MongoDB接続文字列オプション（オプションパラメータ）。

または

``` sql
SOURCE(MONGODB(
    uri 'mongodb://localhost:27017/clickhouse'
    collection 'dictionary_source'
))
```

設定フィールド：

- `uri` - 接続を確立するためのURI。
- `collection` – コレクション名。

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
- `port` – Redisサーバのポート。
- `storage_type` – キーとの操作に使用される内部Redisストレージの構造。 `simple`はシンプルなソースとハッシュ化された単一キーソース用、`hash_map`は2つのキーを持つハッシュ化されたソース用。範囲ソースや複雑なキーを持つキャッシュソースはサポートされていません。省略可能で、デフォルト値は`simple`です。
- `db_index` – Redis論理データベースの特定の数値インデックス。省略可能で、デフォルト値は0です。

#### Cassandra {#cassandra}

設定の例：

``` xml
<source>
    <cassandra>
        <host>localhost</host>
        <port>9042</port>
        <user>username</user>
        <password>qwerty123</password>
        <keyspace>database_name</keyspace>
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

- `host` – Cassandraホストまたはカンマ区切りのホストリスト。
- `port` – Cassandraサーバのポート。指定しない場合、デフォルトポート9042が使用されます。
- `user` – Cassandraユーザー名。
- `password` – Cassandraユーザーのパスワード。
- `keyspace` – キースペース（データベース）の名前。
- `column_family` – カラムファミリ（テーブル）の名前。
- `allow_filtering` – クラスタリングキーのカラムに対して高コストの条件を許可するフラグ。デフォルト値は1です。
- `partition_key_prefix` – Cassandraテーブルの主キーにあるパーティションキーのカラム数。構成キー辞書に必須です。辞書定義内のキー列の順序はCassandraと同じでなければなりません。デフォルト値は1（最初のキー列がパーティションキーで、他のキー列がクラスタリングキー）です。
- `consistency` – 一貫性レベル。可能な値：`One`, `Two`, `Three`, `All`, `EachQuorum`, `Quorum`, `LocalQuorum`, `LocalOne`, `Serial`, `LocalSerial`。デフォルト値は`One`です。
- `where` – 任意の選択基準。
- `max_threads` – 構成キー辞書から複数のパーティションにデータを読み込むために使用する最大スレッド数。
- `query` – カスタムクエリ。任意のパラメータ。

:::note
`column_family`または`where`フィールドは`query`フィールドと一緒に使用することはできません。また、`column_family`または`query`フィールドのいずれかを宣言する必要があります。
:::

#### PostgreSQL {#postgresql}

設定の例：

``` xml
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

設定フィールド：

- `host` – PostgreSQLサーバのホスト。すべてのレプリカに対して指定できますし、それぞれ個別に指定することもできます（`<replica>`内）。
- `port` – PostgreSQLサーバのポート。すべてのレプリカに対して指定できますし、それぞれ個別に指定することもできます（`<replica>`内）。
- `user` – PostgreSQLユーザー名。すべてのレプリカに対して指定できますし、それぞれ個別に指定することもできます（`<replica>`内）。
- `password` – PostgreSQLユーザーのパスワード。すべてのレプリカに対して指定できますし、それぞれ個別に指定することもできます（`<replica>`内）。
- `replica` – レプリカ構成のセクション。複数のセクションが存在する可能性があります：
    - `replica/host` – PostgreSQLホスト。
    - `replica/port` – PostgreSQLポート。
    - `replica/priority` – レプリカの優先度。接続を試みるとき、ClickHouseは優先度の順にレプリカをたどります。数値が低いほど、優先度が高くなります。
- `db` – データベース名。
- `table` – テーブル名。
- `where` – 選択基準。条件の構文はPostgreSQLの`WHERE`句と同じです。例えば、`id > 10 AND id < 20`。任意のパラメータです。
- `invalidate_query` – 辞書の状態を確認するためのクエリ。任意のパラメータです。詳細はセクション [Refreshing dictionary data using LIFETIME](#refreshing-dictionary-data-using-lifetime) を参照してください。
- `background_reconnect` – 接続が失敗した場合にバックグラウンドでレプリカに再接続します。任意のパラメータです。
- `query` – カスタムクエリ。任意のパラメータです。

:::note
`table`または`where`フィールドは`query`フィールドと一緒に使用することはできません。また、`table`または`query`フィールドのいずれかを宣言する必要があります。
:::

### Null {#null}

ダミー（空）の辞書を作成するために使用できる特別なソース。このような辞書はテストや、分散テーブルを持つノードでデータとクエリノードが分離されているセットアップに役立ちます。

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

`structure`句は、辞書キーとクエリで利用可能なフィールドを記述します。

XML記述：

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

属性は以下の要素で記述されます：

- `<id>` — キーカラム
- `<attribute>` — データカラム：複数の属性が存在することがあります。

DDLクエリ：

``` sql
CREATE DICTIONARY dict_name (
    Id UInt64,
    -- 属性
)
PRIMARY KEY Id
...
```

属性はクエリ本文で説明します：

- `PRIMARY KEY` — キーカラム
- `AttrName AttrType` — データカラム。複数の属性が存在することがあります。

## Key {#key}

ClickHouseは以下の種類のキーをサポートしています：

- 数値キー。 `UInt64`。 `<id>`タグで定義されるか、`PRIMARY KEY`キーワードを使用します。
- 複合キー。異なる型の値のセット。 `<key>`タグまたは`PRIMARY KEY`キーワードで定義されます。

XML構造には`<id>`または`<key>`のいずれかが含まれることができます。DDLクエリには単一の`PRIMARY KEY`が含まれる必要があります。

:::note
キーを属性として記述するべきではありません。
:::
### Numeric Key {#numeric-key}

タイプ： `UInt64`。

構成例：

``` xml
<id>
    <name>Id</name>
</id>
```

構成フィールド：

- `name` – キーを持つカラムの名前。

DDLクエリ：

``` sql
CREATE DICTIONARY (
    Id UInt64,
    ...
)
PRIMARY KEY Id
...
```

- `PRIMARY KEY` – キーを持つカラムの名前。

### Composite Key {#composite-key}

キーは任意のタイプのフィールドからなる`tuple`にすることができます。この場合、[layout](#storing-dictionaries-in-memory)は`complex_key_hashed`または`complex_key_cache`でなければなりません。

:::tip
複合キーは単一の要素から構成されることができます。これにより、文字列をキーとして使用することが可能になります。
:::

キーの構造は`<key>`要素で設定されます。キーのフィールドは辞書の[属性](#dictionary-key-and-fields)と同じ形式で指定されます。例：

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

`dictGet*`関数のクエリには、タプルがキーとして渡されます。例：`dictGetString('dict_name', 'attr_name', tuple('string for field1', num_for_field2))`。

## Attributes {#attributes}

構成例：

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

構成フィールド：

| タグ                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 必須 |
|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------|
| `name`                                               | カラム名。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | はい   |
| `type`                                               | ClickHouseのデータ型：[UInt8](../../sql-reference/data-types/int-uint.md)、[UInt16](../../sql-reference/data-types/int-uint.md)、[UInt32](../../sql-reference/data-types/int-uint.md)、[UInt64](../../sql-reference/data-types/int-uint.md)、[Int8](../../sql-reference/data-types/int-uint.md)、[Int16](../../sql-reference/data-types/int-uint.md)、[Int32](../../sql-reference/data-types/int-uint.md)、[Int64](../../sql-reference/data-types/int-uint.md)、[Float32](../../sql-reference/data-types/float.md)、[Float64](../../sql-reference/data-types/float.md)、[UUID](../../sql-reference/data-types/uuid.md)、[Decimal32](../../sql-reference/data-types/decimal.md)、[Decimal64](../../sql-reference/data-types/decimal.md)、[Decimal128](../../sql-reference/data-types/decimal.md)、[Decimal256](../../sql-reference/data-types/decimal.md)、[Date](../../sql-reference/data-types/date.md)、[Date32](../../sql-reference/data-types/date32.md)、[DateTime](../../sql-reference/data-types/datetime.md)、[DateTime64](../../sql-reference/data-types/datetime64.md)、[String](../../sql-reference/data-types/string.md)、[Array](../../sql-reference/data-types/array.md)。<br/>ClickHouseは、辞書から指定されたデータ型に値をキャストしようとします。例えば、MySQLではフィールドはソーステーブルの中で`TEXT`、`VARCHAR`、または`BLOB`であるかもしれませんが、ClickHouseでは`String`としてアップロードできます。<br/>[Nullable](../../sql-reference/data-types/nullable.md)は、現在、[Flat](#flat)、[Hashed](#hashed)、[ComplexKeyHashed](#complex_key_hashed)、[Direct](#direct)、[ComplexKeyDirect](#complex_key_direct)、[RangeHashed](#range_hashed)、Polygon、[Cache](#cache)、[ComplexKeyCache](#complex_key_cache)、[SSDCache](#ssd_cache)、[SSDComplexKeyCache](#complex_key_ssd_cache)辞書でサポートされています。[IPTrie](#ip_trie)辞書では`Nullable`タイプはサポートされていません。 | はい   |
| `null_value`                                         | 存在しない要素のデフォルト値。<br/>この例では空の文字列です。[NULL](../syntax.md#null)値は、`Nullable`タイプ（前の行のタイプの説明を参照）にのみ使用できます。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | はい   |
| `expression`                                         | ClickHouseが値に対して実行する[式](../../sql-reference/syntax.md#expressions)。<br/>この式は、リモートSQLデータベース内のカラム名である可能性があります。したがって、リモートカラムのエイリアスを作成するために使用できます。<br/><br/>デフォルト値：式なし。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | いいえ   |
| <a name="hierarchical-dict-attr"></a> `hierarchical` | `true`の場合、属性は現在のキーの親キーの値を含んでいます。 [Hierarchical Dictionaries](#hierarchical-dictionaries)を参照してください。<br/><br/>デフォルト値：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | いいえ   |
| `injective`                                          | `id -> attribute`画像が[単射](https://en.wikipedia.org/wiki/Injective_function)かどうかを示すフラグ。<br/>`true`の場合、ClickHouseは注入のある辞書への要求の後に自動的に`GROUP BY`句を配置できます。通常、これはそのような要求の数を大幅に削減します。<br/><br/>デフォルト値：`false`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | いいえ   |
| `is_object_id`                                       | MongoDBドキュメントの`ObjectID`に対してクエリが実行されるかどうかを示すフラグ。<br/><br/>デフォルト値：`false`。 

## Hierarchical Dictionaries {#hierarchical-dictionaries}

ClickHouseは[数値キー](#numeric-key)を持つ階層辞書をサポートしています。

以下の階層構造を見てください：

``` text
0 (共通の親)
│
├── 1 (ロシア)
│   │
│   └── 2 (モスクワ)
│       │
│       └── 3 (中心)
│
└── 4 (イギリス)
    │
    └── 5 (ロンドン)
```

この階層は以下のような辞書テーブルとして表すことができます。

| region_id | parent_region | region_name  |
|------------|----------------|---------------|
| 1          | 0              | ロシア        |
| 2          | 1              | モスクワ      |
| 3          | 2              | 中心          |
| 4          | 0              | イギリス      |
| 5          | 4              | ロンドン      |

このテーブルには要素の最近傍親のキーを含む`parent_region`カラムがあります。

ClickHouseは外部辞書属性に階層属性をサポートします。この属性を使用することで、上述したように階層辞書を構成することができます。

[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)関数を使用すると、要素の親チェーンを取得できます。

私たちの例では、辞書の構造は以下のようになる可能性があります：

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
## ポリゴン辞書 {#polygon-dictionaries}

ポリゴン辞書を使用すると、指定されたポイントを含むポリゴンを効率的に検索できます。  
例えば、地理座標を使用して都市の区域を定義することができます。

ポリゴン辞書の構成の例：

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

対応する [DDL-クエリ](../../sql-reference/statements/create/dictionary.md#create-dictionary-query):
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

ポリゴン辞書を構成する際、キーは2種類の型のいずれかでなければなりません：

- 単純なポリゴン。これはポイントの配列です。
- MultiPolygon。これはポリゴンの配列です。各ポリゴンは2次元のポイントの配列で、最初の要素がポリゴンの外境界を指定し、以降の要素は除外すべき領域を指定します。

ポイントは、座標の配列またはタプルとして指定できます。現在の実装では、2次元ポイントのみがサポートされています。

ユーザーは、ClickHouseがサポートするすべての形式で独自のデータをアップロードできます。

利用可能な [インメモリストレージ](#storing-dictionaries-in-memory)の種類は3つあります：

- `POLYGON_SIMPLE`。これは単純な実装で、各クエリに対してすべてのポリゴンを線形に走査し、追加のインデックスを使用せずにメンバーシップをチェックします。

- `POLYGON_INDEX_EACH`。各ポリゴンに対して別々のインデックスが構築されるため、ほとんどの場合において迅速に所属を確認できます（地理的地域に最適化）。また、考慮中のエリアにグリッドが重ねられ、考慮されるポリゴンの数が大幅に絞り込まれます。グリッドはセルを16等分にすることによって再帰的に生成され、2つのパラメータで設定されます。再帰の深さが `MAX_DEPTH` に達するか、セルが `MIN_INTERSECTIONS` のポリゴンを超えない場合に分割が停止します。クエリに応じて、対応するセルがあり、そのセル内に保存されているポリゴンのインデックスに交互にアクセスします。

- `POLYGON_INDEX_CELL`。この配置も、上記のグリッドを作成します。同じオプションが利用可能です。各シートセルに対して、その中に入るすべてのポリゴンのパーツにインデックスが構築され、リクエストに迅速に応答することができます。

- `POLYGON`。`POLYGON_INDEX_CELL`の同義語です。

辞書クエリは、辞書に関する標準の [関数](../../sql-reference/functions/ext-dict-functions.md) を使用して実行されます。重要な違いは、ここでのキーは、ポリゴンを見つけるためのポイントであるということです。

**例**

上記で定義された辞書での作業の例：

``` sql
CREATE TABLE points (
    x Float64,
    y Float64
)
...
SELECT tuple(x, y) AS key, dictGet(dict_name, 'name', key), dictGet(dict_name, 'value', key) FROM points ORDER BY x, y;
```

最後のコマンドを実行した結果、'points' テーブルの各ポイントに対して、そのポイントを含む最小の面積のポリゴンが見つかり、要求された属性が出力されます。

**例**

ポリゴン辞書から列をSELECTクエリで読み取ることができます。辞書の構成または対応するDDLクエリで `store_polygon_key_column = 1` をオンにするだけで可能です。

クエリ：

``` sql
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

``` text
┌─key─────────────────────────────┬─name──┐
│ [[[(3,1),(0,1),(0,-1),(3,-1)]]] │ Value │
└─────────────────────────────────┴───────┘
```

## 正規表現ツリー辞書 {#regexp-tree-dictionary}

正規表現ツリー辞書は、キーから属性へのマッピングを正規表現の木で表現する特別な種類の辞書です。ユーザーエージェントの文字列を解析する等のいくつかのユースケースは、正規表現ツリー辞書を使用することで優雅に表現できます。

### ClickHouseオープンソースでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-open-source}

正規表現ツリー辞書は、正規表現ツリーを含むYAMLファイルのパスを提供するYAMLRegExpTreeソースを使用してClickHouseオープンソースに定義されます。

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

辞書ソース `YAMLRegExpTree` は正規表現ツリーの構造を表します。例えば：

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

この構成は、正規表現ツリーのノードのリストで構成されています。各ノードには以下の構造があります：

- **regexp**: ノードの正規表現。
- **attributes**: ユーザー定義の辞書属性のリスト。この例では、`name` と `version` の2つの属性があります。最初のノードはこの両方の属性を定義しています。2番目のノードは属性 `name` のみを定義し、属性 `version` は2番目のノードの子ノードによって提供されます。
  - 属性の値には、マッチした正規表現のキャプチャグループを参照する **バックリファレンス** が含まれている場合があります。この例では、最初のノードの属性 `version` の値は、正規表現のキャプチャグループ `(\d+[\.\d]*)` に対するバックリファレンス `\1` から構成されています。バックリファレンス番号は1から9までで、`$1` または `\1` のように書かれます（数字1の場合）。バックリファレンスはクエリ実行時にマッチしたキャプチャグループに置き換えられます。
- **子ノード**: 正規表現ツリーノードの子ノードのリストで、それぞれが独自の属性と（必要に応じて）子ノードを持ちます。文字列マッチングは深さ優先方式で進行します。文字列が正規表現ノードに一致する場合、辞書はそのノードの子ノードにも一致するかどうかを確認します。そうであれば、最も深い一致ノードの属性が割り当てられます。子ノードの属性は、親ノードの同名の属性を上書きします。YAMLファイル内の子ノードの名前は任意に設定できます。たとえば、上記の例の `versions` です。

正規表現ツリー辞書は、`dictGet`、`dictGetOrDefault`、および `dictGetAll` 関数を使用してのみアクセスできます。

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

この場合、まずトップレイヤーの2番目のノードで正規表現 `\d+/tclwebkit(?:\d+[\.\d]*)` に一致します。辞書は次に子ノードを調べ、文字列が `3[12]/tclwebkit` にも一致することを発見します。その結果、属性 `name` の値は `Android`（第一レイヤーで定義された）であり、属性 `version` の値は `12`（子ノードで定義された）です。

強力なYAML構成ファイルを使用することで、正規表現ツリー辞書をユーザーエージェント文字列のパーサーとして利用できます。私たちは [uap-core](https://github.com/ua-parser/uap-core) をサポートし、機能テスト [02504_regexp_dictionary_ua_parser](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/02504_regexp_dictionary_ua_parser.sh) での使用方法を示します。

#### 属性値の収集 {#collecting-attribute-values}

時々、葉ノードの値だけでなく、複数の正規表現に一致する値を返すことが便利です。このような場合、特化した [`dictGetAll`](../../sql-reference/functions/ext-dict-functions.md#dictgetall) 関数を使用できます。ノードが属性値の型 `T` を持っている場合、`dictGetAll` はゼロ以上の値を含む `Array(T)` を返します。

デフォルトでは、キーごとに返される一致数は制限されていません。制限を含む場合はオプションの第4引数を `dictGetAll` に渡すことができます。配列は _トポロジカルオーダー_ で構成され、つまり子ノードが親ノードの前に置かれ、兄弟ノードはソースにおける順序に従います。

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
- `regexp_dict_flag_case_insensitive`: 大文字と小文字を区別しないマッチングを使用します（デフォルトは `false`）。個別の表現では `(?i)` および `(?-i)` でオーバーライドできます。
- `regexp_dict_flag_dotall`: `.` が改行文字に一致することを許可します（デフォルトは `false`）。

### ClickHouse Cloudでの正規表現ツリー辞書の使用 {#use-regular-expression-tree-dictionary-in-clickhouse-cloud}

上記で使用した `YAMLRegExpTree` ソースは、ClickHouseオープンソースでは機能しますが、ClickHouse Cloudでは機能しません。ClickHouse Cloudで正規表現ツリー辞書を使用するには、まずオープンソースのClickHouse内でYAMLファイルから正規表現ツリー辞書を作成し、`dictionary` テーブル関数と [INTO OUTFILE](../statements/select/into-outfile.md) 句を使用してこの辞書をCSVファイルにダンプします。

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

ダンプファイルのスキーマは次のとおりです：

- `id UInt64`: 正規表現ツリーのノードのID。
- `parent_id UInt64`: ノードの親のID。
- `regexp String`: 正規表現文字列。
- `keys Array(String)`: ユーザー定義の属性の名前。
- `values Array(String)`: ユーザー定義の属性の値。

ClickHouse Cloudで辞書を作成するには、まず次のテーブル構造を持つ `regexp_dictionary_source_table` を作成します：

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

それから、ローカルCSVを以下のように更新します：

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

詳細については、[ローカルファイルの挿入](/integrations/data-ingestion/insert-local-files) を参照してください。ソーステーブルを初期化したら、テーブルソースから正規表現ツリーを作成できます：

``` sql
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

ClickHouseには、ジオベースと連携して作業するためのビルトイン機能があります。

これにより、次の操作が可能となります：

- 地域のIDを使用して、希望の言語での名前を取得する。
- 地域のIDを使用して、市、エリア、連邦地区、国、または大陸のIDを取得する。
- ある地域が別の地域の一部であるかをチェックする。
- 親地域のチェーンを取得する。

すべての関数は「トランスローカリティ」をサポートしており、地域の所有権に関する異なる観点を同時に使用できる能力を持っています。詳細については、「Web分析辞書での作業に関する関数」セクションを参照してください。

内部辞書は、デフォルトパッケージでは無効になっています。これを有効にするには、サーバーの設定ファイル内の `path_to_regions_hierarchy_file` および `path_to_regions_names_files` のパラメータのコメントを外してください。

ジオベースはテキストファイルからロードされます。

`regions_hierarchy*.txt` ファイルを `path_to_regions_hierarchy_file` ディレクトリに配置します。この設定パラメータには、`regions_hierarchy.txt` ファイル（デフォルトの地域階層）へのパスを含める必要があり、他のファイル（`regions_hierarchy_ua.txt`）は同じディレクトリに配置する必要があります。

`regions_names_*.txt` ファイルを `path_to_regions_names_files` ディレクトリに配置します。

これらのファイルを自分で作成することもできます。ファイル形式は以下の通りです：

`regions_hierarchy*.txt`: タブ区切り（ヘッダーなし）、列：

- 地域ID (`UInt32`)
- 親地域ID (`UInt32`)
- 地域タイプ (`UInt8`): 1 - 大陸、3 - 国、4 - 連邦地区、5 - 地域、6 - 市; 他のタイプは値を持ちません
- 人口 (`UInt32`) — オプションの列

`regions_names_*.txt`: タブ区切り（ヘッダーなし）、列：

- 地域ID (`UInt32`)
- 地域名 (`String`) — タブや改行を含むことはできません（たとえエスケープされたものであっても）。

RAMに保存するためにフラット配列が使用されます。このため、IDは100万を超えない必要があります。

辞書はサーバーを再起動せずに更新できます。ただし、利用可能な辞書のセットは更新されません。更新の場合、ファイルの最終更新時刻が確認されます。ファイルが変更されている場合、辞書が更新されます。変更を確認する間隔は `builtin_dictionaries_reload_interval` パラメータで設定されています。辞書の更新（最初の使用時のロードを除く）はクエリをブロックしません。更新中、クエリは古い辞書のバージョンを使用します。更新中にエラーが発生した場合、そのエラーはサーバーログに書き込まれ、クエリは古いバージョンの辞書を引き続き使用します。

ジオベースの辞書は定期的に更新することをお勧めします。更新中は新しいファイルを生成し、それを別の場所に書き込みます。すべてが準備できたら、それらをサーバーが使用するファイルにリネームします。

OS識別子や検索エンジンに関する関数もありますが、それらは使用すべきではありません。
