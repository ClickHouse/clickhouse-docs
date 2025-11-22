---
description: 'このエンジンにより、ClickHouse を RocksDB と統合できます'
sidebar_label: 'EmbeddedRocksDB'
sidebar_position: 50
slug: /engines/table-engines/integrations/embedded-rocksdb
title: 'EmbeddedRocksDB テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# EmbeddedRocksDB テーブルエンジン

<CloudNotSupportedBadge />

このエンジンは、ClickHouse を [RocksDB](http://rocksdb.org/) と統合するためのものです。



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

- `ttl` - 値の有効期間(Time To Live)。TTLは秒単位で指定します。TTLが0の場合、通常のRocksDBインスタンスが使用されます(TTLなし)。
- `rocksdb_dir` - 既存のRocksDBディレクトリへのパス、または新規作成するRocksDBの保存先パス。指定された`rocksdb_dir`でテーブルを開きます。
- `read_only` - `read_only`をtrueに設定すると、読み取り専用モードが使用されます。TTL付きストレージの場合、コンパクションは実行されず(手動・自動ともに)、期限切れエントリは削除されません。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key`は必須で、主キーには1つのカラムのみ指定できます。主キーは`rocksdb key`としてバイナリ形式でシリアライズされます。
- 主キー以外のカラムは、対応する順序で`rocksdb`の値としてバイナリ形式でシリアライズされます。
- キーに対する`equals`または`in`フィルタリングを使用したクエリは、`rocksdb`からの複数キー検索に最適化されます。

エンジン設定:

- `optimize_for_bulk_insert` – テーブルを一括挿入用に最適化します(挿入パイプラインはSSTファイルを作成し、memtableへの書き込みではなくrocksdbデータベースにインポートします); デフォルト値: `1`。
- `bulk_insert_block_size` - 一括挿入によって作成されるSSTファイルの最小サイズ(行数); デフォルト値: `1048449`。

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

RocksDBの統計情報を公開する`system.rocksdb`テーブルもあります:

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

設定ファイルを使用して、任意の[rocksdbオプション](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map)を変更できます:

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

デフォルトでは、簡易近似カウント最適化は無効になっており、`count()`クエリのパフォーマンスに影響を与える可能性があります。この最適化を有効にするには、`optimize_trivial_approximate_count_query = 1`を設定してください。また、この設定はEmbeddedRocksDBエンジンの`system.tables`にも影響します。設定を有効にすると、`total_rows`と`total_bytes`の近似値が表示されます。


## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

`EmbeddedRocksDB`に新しい行が挿入される際、キーが既に存在する場合は値が更新され、存在しない場合は新しいキーが作成されます。

例:

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は`DELETE`クエリまたは`TRUNCATE`を使用して削除できます。

```sql
DELETE FROM test WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE test DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE test;
```

### 更新 {#updates}

値は`ALTER TABLE`クエリを使用して更新できます。主キーは更新できません。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### 結合 {#joins}

EmbeddedRocksDBテーブルとの特別な`direct`結合がサポートされています。
このダイレクト結合はメモリ内にハッシュテーブルを形成することを回避し、
EmbeddedRocksDBから直接データにアクセスします。

大規模な結合では、ハッシュテーブルが作成されないため、ダイレクト結合によってメモリ使用量が大幅に削減される可能性があります。

ダイレクト結合を有効にするには:

```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm`が`direct, hash`に設定されている場合、可能な限りダイレクト結合が使用され、それ以外の場合はハッシュが使用されます。
:::

#### 例 {#example}

##### EmbeddedRocksDBテーブルの作成とデータ投入 {#create-and-populate-an-embeddedrocksdb-table}

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

##### テーブル`rdb`と結合するテーブルの作成とデータ投入 {#create-and-populate-a-table-to-join-with-table-rdb}

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

##### 結合アルゴリズムを`direct`に設定 {#set-the-join-algorithm-to-direct}

```sql
SET join_algorithm = 'direct'
```

##### INNER JOIN {#an-inner-join}

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

### 結合に関する詳細情報 {#more-information-on-joins}

- [`join_algorithm`設定](/operations/settings/settings.md#join_algorithm)
- [JOIN句](/sql-reference/statements/select/join.md)
