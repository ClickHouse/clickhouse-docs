---
description: 'このエンジンは ClickHouse を RocksDB と統合します'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'EmbeddedRocksDB テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# EmbeddedRocksDB テーブルエンジン {#embeddedrocksdb-table-engine}

<CloudNotSupportedBadge />

このエンジンを使用すると、ClickHouse を [RocksDB](http://rocksdb.org/) と統合できます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

エンジンパラメータ:

* `ttl` - 値の有効期間（time to live）。TTL は秒単位で指定します。TTL が 0 の場合は、通常の RocksDB インスタンスが使用されます（TTL なし）。
* `rocksdb_dir` - 既存の RocksDB のディレクトリパス、または作成される RocksDB の出力先ディレクトリパスを指定します。指定された `rocksdb_dir` を用いてテーブルを開きます。
* `read_only` - `read_only` が true に設定されている場合、読み取り専用モードが使用されます。TTL 付きのストレージでは、コンパクション（手動・自動ともに）はトリガーされず、期限切れのエントリは削除されません。
* `primary_key_name` – カラムリスト内の任意のカラム名。
* `primary key` は必ず指定する必要があり、プライマリキーには 1 つのカラムのみを指定できます。プライマリキーはバイナリ形式で `rocksdb key` としてシリアライズされます。
* プライマリキー以外のカラムは、対応する順序でバイナリ形式の `rocksdb` value としてシリアライズされます。
* キーに対する `equals` または `in` フィルタリングを用いたクエリは、`rocksdb` からの複数キーのルックアップに最適化されます。

エンジン設定:

* `optimize_for_bulk_insert` – テーブルをバルクインサート向けに最適化します（INSERT パイプラインは memtable への書き込みではなく SST ファイルを作成して RocksDB データベースにインポートします）；デフォルト値: `1`。
* `bulk_insert_block_size` - バルクインサートで作成される SST ファイルの最小サイズ（行数ベース）；デフォルト値: `1048449`。

例:

```sql
CREATE TABLE test
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

## メトリクス {#metrics}

RocksDB の統計情報を提供する `system.rocksdb` というテーブルもあります。

```sql
SELECT
    name,
    value
FROM system.rocksdb

┌─name──────────────────────┬─value─┐
│ no.file.opens             │     1 │
│ number.block.decompressed │     1 │
└───────────────────────────┴───────┘
```

## 設定 {#configuration}

`config` を使用して、[rocksdb の任意のオプション](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) を変更することもできます。

```xml
<rocksdb>
    <options>
        <max_background_jobs>8</max_background_jobs>
    </options>
    <column_family_options>
        <num_levels>2</num_levels>
    </column_family_options>
    <tables>
        <table>
            <name>TABLE</name>
            <options>
                <max_background_jobs>8</max_background_jobs>
            </options>
            <column_family_options>
                <num_levels>2</num_levels>
            </column_family_options>
        </table>
    </tables>
</rocksdb>
```

デフォルトでは、簡易近似カウント最適化は無効になっており、`count()` クエリのパフォーマンスに影響する可能性があります。この最適化を有効にするには、
`optimize_trivial_approximate_count_query = 1` を設定します。また、この設定は EmbeddedRocksDB エンジンにおける `system.tables` にも影響し、
`total_rows` および `total_bytes` の近似値を表示するには、この設定を有効にしておく必要があります。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `EmbeddedRocksDB` に挿入されると、キーがすでに存在している場合は値が更新され、存在しない場合は新しいキーが作成されます。

例:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` クエリを使用して削除できます。

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
テーブル test の全データを削除;
```

### 更新 {#updates}

値は `ALTER TABLE` クエリを使用して更新できます。主キーは変更できません。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 結合 {#joins}

EmbeddedRocksDB テーブルでは、特殊な `direct` 結合がサポートされています。
この `direct` 結合ではメモリ内にハッシュテーブルを構築せず、
EmbeddedRocksDB からデータへ直接アクセスします。

大規模な結合では、ハッシュテーブルが作成されないため、
`direct` 結合を使用することでメモリ使用量が大幅に少なくなる場合があります。

`direct` 結合を有効にするには、次のようにします。

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm` が `direct, hash` に設定されている場合、可能なときは direct join が使用され、それ以外の場合は hash join が使用されます。
:::

#### 例 {#example}

##### EmbeddedRocksDB テーブルを作成してデータを投入する {#create-and-populate-an-embeddedrocksdb-table}

```sql
CREATE TABLE rdb
(
    `key` UInt32,
    `value` Array(UInt32),
    `value2` String
)
ENGINE = EmbeddedRocksDB
PRIMARY KEY key
```

```sql
INSERT INTO rdb
    SELECT
        toUInt32(sipHash64(number) % 10) AS key,
        [key, key+1] AS value,
        ('val2' || toString(key)) AS value2
    FROM numbers_mt(10);
```

##### `rdb` テーブルと結合するためのテーブルを作成し、データを投入する {#create-and-populate-a-table-to-join-with-table-rdb}

```sql
CREATE TABLE t2
(
    `k` UInt16
)
ENGINE = TinyLog
```

```sql
INSERT INTO t2 SELECT number AS k
FROM numbers_mt(10)
```

##### 結合アルゴリズムを `direct` に設定 {#set-the-join-algorithm-to-direct}

```sql
SET join_algorithm = 'direct'
```

##### INNER JOIN の例 {#an-inner-join}

```sql
SELECT *
FROM
(
    SELECT k AS key
    FROM t2
) AS t2
INNER JOIN rdb ON rdb.key = t2.key
ORDER BY key ASC
```

```response
┌─key─┬─rdb.key─┬─value──┬─value2─┐
│   0 │       0 │ [0,1]  │ val20  │
│   2 │       2 │ [2,3]  │ val22  │
│   3 │       3 │ [3,4]  │ val23  │
│   6 │       6 │ [6,7]  │ val26  │
│   7 │       7 │ [7,8]  │ val27  │
│   8 │       8 │ [8,9]  │ val28  │
│   9 │       9 │ [9,10] │ val29  │
└─────┴─────────┴────────┴────────┘
```

### JOIN の詳細情報 {#more-information-on-joins}

* [`join_algorithm` 設定](/operations/settings/settings.md#join_algorithm)
* [JOIN 句](/sql-reference/statements/select/join.md)
