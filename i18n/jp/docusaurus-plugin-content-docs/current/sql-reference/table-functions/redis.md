---
'description': 'This table function allows integrating ClickHouse with Redis.'
'sidebar_label': 'Redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'redis'
---




# redis テーブル関数

このテーブル関数は、ClickHouse と [Redis](https://redis.io/) を統合することを可能にします。

## 構文 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 引数 {#arguments}

| 引数        | 説明                                                                                                   |
|-------------|--------------------------------------------------------------------------------------------------------|
| `host:port` | Redis サーバーのアドレス。ポートを無視することができ、デフォルトの Redis ポート 6379 が使用されます。                     |
| `key`       | カラムリスト内の任意のカラム名。                                                                          |
| `structure` | この関数から返される ClickHouse テーブルのスキーマ。                                                     |
| `db_index`  | Redis データベースのインデックス (0 から 15) の範囲。デフォルトは 0。                                          |
| `password`  | ユーザーのパスワード。デフォルトは空の文字列。                                                          |
| `pool_size` | Redis の最大接続プールサイズ。デフォルトは 16。                                                           |
| `primary`   | 指定する必要があります。主キーでは 1 つのカラムのみをサポートします。主キーは Redis キーとしてバイナリ形式でシリアライズされます。 |

- 主キー以外のカラムは、対応する順序で Redis 値としてバイナリ形式でシリアライズされます。
- キーが等しいかフィルタリングに使用されるクエリは、Redis からのマルチキー検索に最適化されます。フィルタリングキーがないクエリでは、全テーブルスキャンが発生し、これは重い操作です。

現時点では、`redis` テーブル関数に対して [名前付きコレクション](/operations/named-collections.md) はサポートされていません。

## 戻り値 {#returned_value}

キーを Redis キーとして持ち、他のカラムを Redis 値としてパッケージ化したテーブルオブジェクト。

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

## 関連項目 {#related}

- [`Redis` テーブルエンジン](/engines/table-engines/integrations/redis.md)
- [辞書ソースとしての Redis の使用](/sql-reference/dictionaries/index.md#redis)
