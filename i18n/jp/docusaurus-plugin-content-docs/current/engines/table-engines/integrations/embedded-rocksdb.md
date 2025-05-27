---
'description': 'This engine allows integrating ClickHouse with RocksDB'
'sidebar_label': 'EmbeddedRocksDB'
'sidebar_position': 50
'slug': '/engines/table-engines/integrations/embedded-rocksdb'
'title': 'EmbeddedRocksDB Engine'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# EmbeddedRocksDB エンジン

<CloudNotSupportedBadge />

このエンジンは、ClickHouse を [RocksDB](http://rocksdb.org/) と統合することを可能にします。

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

- `ttl` - 値の有効期限。TTLは秒単位で受け付けられます。TTLが 0 の場合、通常の RocksDB インスタンスが使用されます (TTL なし)。
- `rocksdb_dir` - 既存の RocksDB のディレクトリのパスまたは作成された RocksDB の宛先パス。指定された `rocksdb_dir` でテーブルを開きます。
- `read_only` - `read_only` が true に設定されている場合、読み取り専用モードが使用されます。TTL を持つストレージの場合、コンパクションはトリガーされず (手動または自動のどちらも)、期限切れのエントリは削除されません。
- `primary_key_name` – カラムリスト内の任意のカラム名。
- `primary key` は指定する必要があり、主キーには 1 つのカラムのみがサポートされています。主キーは `rocksdb key` としてバイナリでシリアライズされます。
- 主キー以外のカラムは、対応する順序で `rocksdb` 値としてバイナリでシリアライズされます。
- キー `equals` または `in` フィルタリングを持つクエリは、`rocksdb` からのマルチキーのルックアップに最適化されます。

エンジン設定:

- `optimize_for_bulk_insert` – テーブルはバルク挿入用に最適化されています (挿入パイプラインは SST ファイルを作成し、メムテーブルへの書き込みの代わりに rocksdb データベースにインポートします); デフォルト値: `1`。
- `bulk_insert_block_size` - バルク挿入によって作成される SST ファイルの最小サイズ (行数単位); デフォルト値: `1048449`。

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

`system.rocksdb` テーブルもあり、rocksdb の統計情報を公開しています:

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

任意の [rocksdb オプション](https://github.com/facebook/rocksdb/wiki/Option-String-and-Option-Map) を設定を使用して変更することもできます:

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

デフォルトでは、単純な近似カウントの最適化はオフになっており、これが `count()` クエリのパフォーマンスに影響を与える可能性があります。この最適化を有効にするには、`optimize_trivial_approximate_count_query = 1` を設定します。また、この設定は EmbeddedRocksDB エンジンの `system.tables` にも影響し、`total_rows` および `total_bytes` の近似値を表示するには設定をオンにしてください。

## サポートされる操作 {#supported-operations}

### 挿入 {#inserts}

`EmbeddedRocksDB` に新しい行が挿入されるとき、キーがすでに存在する場合、その値が更新され、存在しない場合は新しいキーが作成されます。

例:

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

EmbeddedRocksDB テーブルとの特別な `direct` ジョインがサポートされています。
この直接ジョインは、メモリ上でハッシュテーブルを形成せず、EmbeddedRocksDB から直接データにアクセスします。

大規模なジョインでは、ハッシュテーブルが作成されないため、メモリ使用量が大幅に低下する場合があります。

直接ジョインを有効にするには:
```sql
SET join_algorithm = 'direct, hash'
```

:::tip
`join_algorithm` が `direct, hash` に設定されている場合、可能な場合は直接ジョインが使用され、それ以外の場合はハッシュジョインが使用されます。
:::

#### 例 {#example}

##### EmbeddedRocksDB テーブルの作成とデータの挿入 {#create-and-populate-an-embeddedrocksdb-table}
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

##### `rdb` テーブルと結合するためのテーブルの作成とデータの挿入 {#create-and-populate-a-table-to-join-with-table-rdb}

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

### ジョインに関するさらなる情報 {#more-information-on-joins}
- [`join_algorithm` 設定](/operations/settings/settings.md#join_algorithm)
- [JOIN 句](/sql-reference/statements/select/join.md)
