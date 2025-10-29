---
'sidebar_label': 'Ordering keys'
'description': 'カスタム ordering keys を定義する方法。'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': 'Ordering Keys'
'doc_type': 'guide'
---

Ordering Keys (またはソーティングキー) は、ClickHouseにおけるテーブルのデータがディスク上でどのようにソートされ、インデックスされるかを定義します。Postgresからレプリケートする際、ClickPipesはテーブルのPostgres主キーをClickHouseの対応するテーブルのオーダリングキーとして設定します。ほとんどの場合、Postgres主キーは十分なオーダリングキーとして機能します。ClickHouseはすでに高速スキャンに最適化されており、カスタムオーダリングキーはしばしば必要ありません。

[マイグレーションガイド](/migrations/postgresql/data-modeling-techniques)に記載されているように、大規模なユースケースの場合、クエリを最適化するためにClickHouseのオーダリングキーにはPostgres主キーに加えて追加のカラムを含めるべきです。

デフォルトのCDCでは、Postgres主キーとは異なるオーダリングキーを選択すると、ClickHouseでのデータデデュプリケーションの問題を引き起こす可能性があります。これは、ClickHouseにおけるオーダリングキーが二重の役割を果たすために発生します。データのインデクシングとソートを制御し、同時にデデュプリケーションキーとして機能します。この問題に対処する最も簡単な方法は、リフレッシュ可能なマテリアライズドビューを定義することです。

## リフレッシュ可能なマテリアライズドビューの使用 {#use-refreshable-materialized-views}

カスタムオーダリングキー (ORDER BY) を定義する簡単な方法は、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view) (MVs) を使用することです。これにより、特定のオーダリングキーで定期的に (例えば、5分または10分ごとに) テーブル全体をコピーすることができます。

以下は、カスタムORDER BYと必要なデデュプリケーションを持つリフレッシュ可能なMVの例です。

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## リフレッシュ可能なマテリアライズドビューなしでのカスタムオーダリングキー {#custom-ordering-keys-without-refreshable-materialized-views}

リフレッシュ可能なマテリアライズドビューがデータのスケールのために機能しない場合、カスタムオーダリングキーを大きなテーブルで定義し、デデュプリケーションに関連する問題を克服するために従うべきいくつかの推奨事項を以下に示します。

### 特定の行に対して変更しないオーダリングキーのカラムを選択する {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouseのオーダリングキーに追加のカラム (Postgresの主キー以外) を含める場合、各行に対して変更しないカラムを選択することをお勧めします。これにより、ReplacingMergeTreeでのデータの整合性とデデュプリケーションの問題を防ぐことができます。

例えば、マルチテナントのSaaSアプリケーションでは、(`tenant_id`, `id`)をオーダリングキーとして使用するのが良い選択です。これらのカラムは各行を一意に特定し、他のカラムが変更されても`tenant_id`は一定です。idによるデデュプリケーションは(tenant_id, id)によるデデュプリケーションと整合するため、tenant_idが変更された場合に発生する可能性のあるデータ[デデュプリケーションの問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避するのに役立ちます。

### PostgresテーブルでのReplica Identityをカスタムオーダリングキーに設定する {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

Postgres CDCが期待通りに機能するためには、オーダリングキーのカラムを含むようにテーブルの`REPLICA IDENTITY`を変更することが重要です。これは、DELETEを正確に処理するために不可欠です。

`REPLICA IDENTITY`がオーダリングキーのカラムを含まない場合、Postgres CDCは主キー以外のカラムの値をキャプチャしません。これはPostgres論理デコーディングの制限です。Postgresの主キー以外のすべてのオーダリングキーのカラムはnullになります。これがデデュプリケーションに影響を与え、行の以前のバージョンが最新の削除されたバージョン (ここで`_peerdb_is_deleted`が1に設定されている) とデデュプリケートされない可能性があります。

`owneruserid`と`id`の例では、主キーがすでに`owneruserid`を含まない場合、(`owneruserid`, `id`)に対する`UNIQUE INDEX`を持つ必要があり、テーブルの`REPLICA IDENTITY`として設定してください。これにより、Postgres CDCが正確なレプリケーションとデデュプリケーションのために必要なカラムの値をキャプチャします。

以下は、イベントテーブルでこれを行う方法の例です。修正されたオーダリングキーを持つすべてのテーブルにこれを適用してください。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
