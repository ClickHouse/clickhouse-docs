---
'description': 'このエンジンは ClickHouse と Redis の統合を可能にします。'
'sidebar_label': 'Redis'
'sidebar_position': 175
'slug': '/engines/table-engines/integrations/redis'
'title': 'Redis'
'doc_type': 'guide'
---


# Redis

このエンジンは、ClickHouse を [Redis](https://redis.io/) と統合することを可能にします。Redis は kv モデルを使用するため、`where k=xx` や `where k in (xx, xx)` のようにポイントクエリでのみクエリを実行することを強く推奨します。

## Creating a table {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = Redis({host:port[, db_index[, password[, pool_size]]] | named_collection[, option=value [,..]] })
PRIMARY KEY(primary_key_name);
```

**Engine Parameters**

- `host:port` — Redis サーバーのアドレスで、ポートは無視してもよく、デフォルトの Redis ポート 6379 が使用されます。
- `db_index` — Redis データベースインデックスは 0 から 15 の範囲で、デフォルトは 0 です。
- `password` — ユーザーパスワードで、デフォルトは空文字列です。
- `pool_size` — Redis 最大接続プールサイズで、デフォルトは 16 です。
- `primary_key_name` - カラムリスト内の任意のカラム名です。

:::note Serialization
`PRIMARY KEY` は 1 つのカラムのみをサポートします。主キーは、Redis キーとしてバイナリ形式でシリアライズされます。主キー以外のカラムは、対応する順序で Redis 値としてバイナリ形式でシリアライズされます。
:::

引数は、[named collections](/operations/named-collections.md) を使用しても渡すことができます。この場合、`host` と `port` は別々に指定する必要があります。このアプローチは、運用環境で推奨されます。この時点で、named collections を使用して Redis に渡すすべてのパラメータは必須です。

:::note Filtering
`key equals` または `in filtering` のクエリは、Redis からのマルチキー検索に最適化されます。フィルタリングキーなしのクエリは、フルテーブルスキャンを実行することになり、これは重い操作です。
:::

## Usage example {#usage-example}

プレーン引数を使用して `Redis` エンジンで ClickHouse にテーブルを作成します：

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis('redis1:6379') PRIMARY KEY(key);
```

または [named collections](/operations/named-collections.md) を使用して：

```xml
<named_collections>
    <redis_creds>
        <host>localhost</host>
        <port>6379</port>
        <password>****</password>
        <pool_size>16</pool_size>
        <db_index>s0</db_index>
    </redis_creds>
</named_collections>
```

```sql
CREATE TABLE redis_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = Redis(redis_creds) PRIMARY KEY(key);
```

挿入：

```sql
INSERT INTO redis_table VALUES('1', 1, '1', 1.0), ('2', 2, '2', 2.0);
```

クエリ：

```sql
SELECT COUNT(*) FROM redis_table;
```

```text
┌─count()─┐
│       2 │
└─────────┘
```

```sql
SELECT * FROM redis_table WHERE key='1';
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 1   │  1 │ 1  │  1 │
└─────┴────┴────┴────┘
```

```sql
SELECT * FROM redis_table WHERE v1=2;
```

```text
┌─key─┬─v1─┬─v2─┬─v3─┐
│ 2   │  2 │ 2  │  2 │
└─────┴────┴────┴────┘
```

更新：

主キーは更新できないことに注意してください。

```sql
ALTER TABLE redis_table UPDATE v1=2 WHERE key='1';
```

削除：

```sql
ALTER TABLE redis_table DELETE WHERE key='1';
```

トランケート：

Redis データベースを非同期でフラッシュします。また、`Truncate` は SYNC モードをサポートしています。

```sql
TRUNCATE TABLE redis_table SYNC;
```

結合：

他のテーブルと結合します。

```sql
SELECT * FROM redis_table JOIN merge_tree_table ON merge_tree_table.key=redis_table.key;
```

## Limitations {#limitations}

Redis エンジンは `where k > xx` などのスキャンクエリもサポートしていますが、いくつかの制限があります：
1. スキャンクエリは、非常に稀なケースとして再ハッシュ時に重複したキーを生成する可能性があります。詳細は [Redis Scan](https://github.com/redis/redis/blob/e4d183afd33e0b2e6e8d1c79a832f678a04a7886/src/dict.c#L1186-L1269) を参照してください。
2. スキャン中にキーが作成されたり削除されたりする可能性があるため、結果のデータセットは有効な時間のポイントを表すことができません。
