---
slug: /sql-reference/statements/create/dictionary/layouts/range-hashed
title: 'range_hashed Dictionary レイアウトタイプ'
sidebar_label: 'range_hashed'
sidebar_position: 5
description: '順序付きの日付/時刻範囲を扱うハッシュテーブルを使用して、Dictionary をメモリ内に格納します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## range_hashed \{#range_hashed\}

Dictionary はメモリ上に、範囲の順序付き配列とそれに対応する値を持つハッシュテーブル形式で格納されます。

このストレージ方式は hashed と同様に機能し、キーに加えて日付/時刻（任意の数値型）の範囲を使用できます。

例: テーブルには、各広告主向けの割引が次の形式で含まれています:

```text
┌─advertiser_id─┬─discount_start_date─┬─discount_end_date─┬─amount─┐
│           123 │          2015-01-16 │        2015-01-31 │   0.25 │
│           123 │          2015-01-01 │        2015-01-15 │   0.15 │
│           456 │          2015-01-01 │        2015-01-15 │   0.05 │
└───────────────┴─────────────────────┴───────────────────┴────────┘
```

日付範囲用のサンプルを使用するには、[structure](../attributes.md#composite-key) 内で `range_min` と `range_max` 要素を定義します。これらの要素には `name` と `type` 要素を含める必要があります（`type` が指定されていない場合、デフォルトの型は Date になります）。`type` には任意の数値型（Date / DateTime / UInt64 / Int32 / その他）を指定できます。

:::note
`range_min` と `range_max` の値は `Int64` 型に収まる必要があります。
:::

例：

<Tabs>
  <TabItem value="ddl" label="DDL" default>
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
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <layout>
        <range_hashed>
            <!-- 重複する範囲に対する戦略（min/max）。デフォルト: min（一致した範囲のうち、range_min -> range_max が最小のものを返す） -->
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
  </TabItem>
</Tabs>

<br />

これらの Dictionary を使用するには、`dictGet` 関数に対して、範囲を選択するための追加の引数を渡す必要があります。

```sql
dictGet('dict_name', 'attr_name', id, date)
```

クエリの例：

```sql
SELECT dictGet('discounts_dict', 'amount', 1, '2022-10-20'::Date);
```

この関数は、指定された `id` および渡された日付を含む日付範囲に対応する値を返します。

アルゴリズムの詳細:

* `id` が見つからない場合、またはその `id` に対する範囲が見つからない場合、属性型のデフォルト値を返します。
* 範囲が重複していて `range_lookup_strategy=min` の場合、一致する範囲のうち `range_min` が最小のものを返します。複数の範囲が見つかった場合は、その中から `range_max` が最小の範囲を返します。さらに複数の範囲が見つかり（複数の範囲が同じ `range_min` と `range_max` を持つ場合）、その中からランダムに 1 つの範囲を返します。
* 範囲が重複していて `range_lookup_strategy=max` の場合、一致する範囲のうち `range_min` が最大のものを返します。複数の範囲が見つかった場合は、その中から `range_max` が最大の範囲を返します。さらに複数の範囲が見つかり（複数の範囲が同じ `range_min` と `range_max` を持つ場合）、その中からランダムに 1 つの範囲を返します。
* `range_max` が `NULL` の場合、その範囲は上限が開いた範囲になります。`NULL` は取りうる最大値として扱われます。`range_min` については、下限が開いた値として `1970-01-01` または `0` (-MAX&#95;INT) を使用できます。

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
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
  </TabItem>

  <TabItem value="xml" label="Configuration file">
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
  </TabItem>
</Tabs>

<br />

重複する範囲および開いた範囲を含む構成例:

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

## complex_key_range_hashed \{#complex_key_range_hashed\}

Dictionary は、範囲とその対応する値の順序付き配列を持つハッシュテーブルの形式でメモリ上に格納されます（[range&#95;hashed](#range_hashed) を参照）。この種類のストレージ形式は、複合 [キー](../attributes.md#composite-key) で使用します。

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
