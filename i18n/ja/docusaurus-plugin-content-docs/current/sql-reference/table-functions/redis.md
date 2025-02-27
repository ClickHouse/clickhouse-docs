---
slug: /sql-reference/table-functions/redis
sidebar_position: 170
sidebar_label: redis
---

# redis

このテーブル関数は、ClickHouseを[Redis](https://redis.io/)と統合することを可能にします。

**構文**

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

**引数**

- `host:port` — Redisサーバーアドレス。ポートを無視することができ、デフォルトのRedisポート6379が使用されます。

- `key` — カラムリスト内の任意のカラム名。

- `structure` — この関数から返されるClickHouseテーブルのスキーマ。

- `db_index` — Redisのdbインデックスで、範囲は0から15、デフォルトは0。

- `password` — ユーザーパスワード、デフォルトは空文字列。

- `pool_size` — Redisの最大接続プールサイズ、デフォルトは16。

- `primary` は必ず指定する必要があり、主キーでは1つのカラムのみをサポートします。主キーはRedisキーとしてバイナリ形式でシリアライズされます。

- 主キー以外のカラムは、対応する順序でRedis値としてバイナリ形式でシリアライズされます。

- キーが等しいまたはフィルタリングに含まれるクエリは、Redisからのマルチキーのルックアップに最適化されます。フィルタリングキーのないクエリは、フルテーブルスキャンが発生し、これは重い操作になります。

現在のところ、`redis`テーブル関数には[名付きコレクション](/operations/named-collections.md)はサポートされていません。

**返される値**

キーをRedisキー、他のカラムをRedis値としてパッケージ化したテーブルオブジェクト。

## 使用例 {#usage-example}

Redisから読む:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redisに挿入する:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

**関連項目**

- [`Redis`テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [Redisを辞書ソースとして使用する](/sql-reference/dictionaries/index.md#redis)
