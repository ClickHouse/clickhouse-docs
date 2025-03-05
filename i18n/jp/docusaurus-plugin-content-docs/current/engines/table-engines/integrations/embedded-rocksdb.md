---
slug: /engines/table-engines/integrations/embedded-rocksdb
sidebar_position: 50
sidebar_label: EmbeddedRocksDB
title: "EmbeddedRocksDB エンジン"
description: "このエンジンは ClickHouse と RocksDB を統合できるようにします"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# EmbeddedRocksDB エンジン

<CloudNotSupportedBadge />

このエンジンは ClickHouse と [RocksDB](http://rocksdb.org/) を統合できるようにします。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = EmbeddedRocksDB([ttl, rocksdb_dir, read_only]) PRIMARY KEY(primary_key_name)
[ SETTINGS name=value, ... ]
```

エンジンのパラメータ：

- `ttl` - 値の有効期限。TTL は秒単位で受け付けます。TTL が 0 の場合、通常の RocksDB インスタンスが使用されます (TTLなし)。
- `rocksdb_dir` - 既存の RocksDB のディレクトリのパスまたは作成された RocksDB の出力先パス。指定された `rocksdb_dir` でテーブルを開きます。
- `read_only` - `read_only` が true に設定されている場合、読み取り専用モードが使用されます。TTL のあるストレージでは、圧縮はトリガーされず (手動または自動のいずれも)、期限切れのエントリは削除されません。
- `primary_key_name` - カラムリストの任意のカラム名。
- `primary key` は指定する必要があり、主キーにはカラムを 1 つしかサポートしていません。主キーはバイナリ形式で `rocksdb key` としてシリアライズされます。
- 主キー以外のカラムは、対応する順序で `rocksdb` 値としてバイナリ形式でシリアライズされます。
- `equals` または `in` フィルタリングを伴うクエリは `rocksdb` からのマルチキー検索に最適化されます。

エンジンの設定：

- `optimize_for_bulk_insert` - テーブルはバルク挿入のために最適化されています (挿入パイプラインは SST ファイルを作成し、memtables に書き込む代わりに rocksdb データベースにインポートします); デフォルト値: `1`。
- `bulk_insert_block_size` - バルク挿入によって作成される SST ファイルの最小サイズ (行数の観点から); デフォルト値: `1048449`。

例：

``` sql
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

`system.rocksdb` テーブルもあり、rocksdb の統計を公開しています：

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

任意の [rocksdb オプション](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) を設定を使用して変更することもできます：

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

デフォルトでは、非常に単純な近似カウントの最適化はオフになっています。これは `count()` クエリのパフォーマンスに影響を与える可能性があります。この最適化を有効にするには、`optimize_trivial_approximate_count_query = 1` を設定してください。また、この設定は EmbeddedRocksDB エンジンの `system.tables` に影響を与えます。この設定をオンにすると、`total_rows` および `total_bytes` の近似値が確認できます。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

新しい行が `EmbeddedRocksDB` に挿入されると、キーが既に存在する場合は値が更新され、それ以外の場合は新しいキーが作成されます。

例：

```sql
INSERT INTO test VALUES ('some key', 1, 'value', 3.2);
```

### 削除 {#deletes}

行は `DELETE` クエリまたは `TRUNCATE` を使用して削除できます。

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

値は `ALTER TABLE` クエリを使用して更新できます。主キーは更新できません。

```sql
ALTER TABLE test UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

### ジョイン {#joins}

EmbeddedRocksDB テーブルとの特別な `direct` ジョインがサポートされています。このダイレクトジョインはメモリ内でハッシュテーブルを構成することを避け、EmbeddedRocksDB からデータに直接アクセスします。

大規模なジョインの場合、ハッシュテーブルが作成されないため、メモリ使用量がはるかに少なくなることがあります。

ダイレクトジョインを有効にするには：
```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm` が `direct, hash` に設定されると、可能な場合はダイレクトジョインが使用され、それ以外はハッシュが使用されます。
:::

#### 例 {#example}

##### EmbeddedRocksDB テーブルを作成してデータを挿入する {#create-and-populate-an-embeddedrocksdb-table}
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
        toUInt32(sipHash64(number) % 10) as key,
        [key, key+1] as value,
        ('val2' || toString(key)) as value2
    FROM numbers_mt(10);
```

##### テーブル `rdb` と結合するために別のテーブルを作成してデータを挿入する {#create-and-populate-a-table-to-join-with-table-rdb}

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

##### ジョインアルゴリズムを `direct` に設定 {#set-the-join-algorithm-to-direct}

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

### ジョインに関する詳細情報 {#more-information-on-joins}
- [`join_algorithm` 設定](/operations/settings/settings.md#join_algorithm)
- [JOIN 句](/sql-reference/statements/select/join.md)
