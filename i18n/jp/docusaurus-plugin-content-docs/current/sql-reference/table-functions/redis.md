---
'description': 'このテーブル関数は、ClickHouseをRedisと統合することを可能にします。'
'sidebar_label': 'redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'redis'
'doc_type': 'reference'
---


# redis テーブル関数

このテーブル関数は、ClickHouseと [Redis](https://redis.io/) を統合することを可能にします。

## 構文 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 引数 {#arguments}

| 引数        | 説明                                                                                                           |
|-------------|----------------------------------------------------------------------------------------------------------------|
| `host:port` | Redis サーバーアドレス。ポートは無視でき、デフォルトの Redis ポート 6379 が使用されます。                             |
| `key`       | カラムリスト内の任意のカラム名。                                                                                   |
| `structure` | この関数から返される ClickHouse テーブルのスキーマ。                                                               |
| `db_index`  | Redis データベースインデックスは 0 から 15 まで。デフォルトは 0。                                                  |
| `password`  | ユーザーパスワード。デフォルトは空文字列。                                                                       |
| `pool_size` | Redis の最大接続プールサイズ。デフォルトは 16。                                                                   |
| `primary`   | 必須で、主キーには1つのカラムのみをサポートします。主キーはバイナリとしてシリアライズされ、Redis キーとして使用されます。 |

- 主キー以外のカラムは、対応する順序で Redis 値としてバイナリにシリアライズされます。
- キーが等しいまたはフィルタリングに関与するクエリは、Redis からの複数キーの検索に最適化されます。フィルタリングキーのないクエリでは、フルテーブルスキャンが実行され、これは重い操作となります。

現在、`redis` テーブル関数では [Named collections](/operations/named-collections.md) はサポートされていません。

## 戻り値 {#returned_value}

キーが Redis キーで、その他のカラムが一緒にパッケージ化された Redis 値を持つテーブルオブジェクト。

## 使用例 {#usage-example}

Redis から読み取る:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redis に挿入する:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

## 関連 {#related}

- [`Redis` テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [Redisを辞書ソースとして使用する](/sql-reference/dictionaries/index.md#redis)
