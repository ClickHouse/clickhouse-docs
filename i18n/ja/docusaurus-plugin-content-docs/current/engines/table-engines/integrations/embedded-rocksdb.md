---
slug: /engines/table-engines/integrations/embedded-rocksdb
sidebar_position: 50
sidebar_label: EmbeddedRocksDB
title: "EmbeddedRocksDB エンジン"
description: "このエンジンは ClickHouse と RocksDB を統合することを可能にします"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# EmbeddedRocksDB エンジン

<CloudNotSupportedBadge />

このエンジンは ClickHouse と [RocksDB](http://rocksdb.org/) を統合することを可能にします。

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

エンジンパラメータ：

- `ttl` - 値の有効期限。TTLは秒単位で受け付けられます。TTLが0の場合、通常のRocksDBインスタンスが使用されます（TTLなし）。
- `rocksdb_dir` - 既存のRocksDBディレクトリへのパスまたは作成されたRocksDBの宛先パス。指定された`rocksdb_dir`でテーブルを開きます。
- `read_only` - `read_only`がtrueに設定されている場合、読み取り専用モードが使用されます。TTLを持つストレージでは、コンパクションはトリガーされず（手動でも自動でも）、期限切れのエントリは削除されません。
- `primary_key_name` – カラムリストの任意のカラム名。
- `primary key` は必ず指定する必要があり、主キーでは1つのカラムのみがサポートされます。主キーは`rocksdb key`としてバイナリ形式でシリアライズされます。
- 主キー以外のカラムは、対応する順序で`rocksdb`値としてバイナリ形式でシリアライズされます。
- キーに`equals`または`in`フィルタリングを用いたクエリは、`rocksdb`からのマルチキー検索に最適化されます。

エンジン設定：

- `optimize_for_bulk_insert` – テーブルはバルク挿入用に最適化されています（挿入パイプラインは SST ファイルを作成し、memtables への書き込みの代わりに rocksdb データベースにインポートします）；デフォルト値：`1`。
- `bulk_insert_block_size` - バルク挿入によって作成される SST ファイルの最小サイズ（行数の観点から）；デフォルト値：`1048449`。

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

`system.rocksdb` テーブルもあり、rocksdb の統計情報を公開しています：

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

設定を使用して、任意の [rocksdb オプション](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) を変更することもできます：

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

デフォルトでは、単純な近似カウントの最適化は無効になっており、これが `count()` クエリのパフォーマンスに影響を与える可能性があります。これを有効にするには、`optimize_trivial_approximate_count_query = 1` を設定します。また、この設定は EmbeddedRocksDB エンジンの `system.tables` にも影響し、`total_rows` および `total_bytes` の近似値を見るために設定をオンにする必要があります。

## サポートされている操作 {#supported-operations}

### 挿入 {#inserts}

`EmbeddedRocksDB` に新しい行を挿入する際、キーが既に存在する場合、値は更新されます。そうでなければ、新しいキーが作成されます。

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

### 結合 {#joins}

EmbeddedRocksDB テーブルとの特別な `direct` 結合がサポートされています。この直接結合はメモリ内にハッシュテーブルを形成することを避け、EmbeddedRocksDB からデータに直接アクセスします。

大規模な結合の際には、直接結合を使用することでメモリ使用量が大幅に削減される場合があります。なぜなら、ハッシュテーブルが作成されないからです。

直接結合を有効にするには：
```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm` が `direct, hash` に設定されているとき、可能な場合は直接結合が使用され、それ以外はハッシュを使用します。
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

##### テーブル `rdb` と結合するためのテーブルを作成してデータを挿入する {#create-and-populate-a-table-to-join-with-table-rdb}

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

##### 結合アルゴリズムを `direct` に設定する {#set-the-join-algorithm-to-direct}

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
- [`join_algorithm` 設定](/operations/settings/settings.md#join_algorithm)
- [JOIN 句](/sql-reference/statements/select/join.md)
