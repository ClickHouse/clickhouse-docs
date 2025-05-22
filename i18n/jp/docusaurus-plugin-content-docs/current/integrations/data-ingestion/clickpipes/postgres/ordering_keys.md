---
'sidebar_label': 'オーダリングキー'
'description': 'カスタムオーダリングキーの定義方法。'
'slug': '/integrations/clickpipes/postgres/ordering_keys'
'title': 'オーダリングキー'
---



Ordering Keys (a.k.a. sorting keys) は、ClickHouseのテーブルのデータがディスク上でどのようにソートされ、インデックスされるかを定義します。Postgresからレプリケーションを行う場合、ClickPipesはPostgresの主キーをClickHouse内の対応するテーブルのOrdering Keyとして設定します。ほとんどの場合、Postgresの主キーは十分なOrdering Keyとして機能します。ClickHouseはすでに高速なスキャン用に最適化されているため、カスタムOrdering Keyはしばしば必要ありません。

[移行ガイド](/migrations/postgresql/data-modeling-techniques)で説明されているように、大規模なユースケースでは、ClickHouseのOrdering KeyにはPostgresの主キーに加えて追加のカラムを含めて、クエリを最適化することをお勧めします。

デフォルトでCDCを使用している場合、Postgresの主キーとは異なるOrdering Keyを選択すると、ClickHouseでデータの重複除去の問題が発生する可能性があります。これは、ClickHouseのOrdering Keyが二重の役割を果たすために発生します。つまり、データのインデックスとソートを制御すると同時に、重複除去のキーとして機能します。この問題に対処する最も簡単な方法は、更新可能なMaterialized Viewを定義することです。

## 更新可能なMaterialized Viewの使用 {#use-refreshable-materialized-views}

カスタムOrdering Key（ORDER BY）を定義する簡単な方法は、[更新可能なMaterialized View](/materialized-view/refreshable-materialized-view)（MVs）を使用することです。これにより、希望するOrdering Keyを持つテーブル全体を定期的に（例：5分または10分ごとに）コピーできます。

以下は、カスタムORDER BYおよび必要な重複除去を備えた更新可能なMVの例です：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- 異なるOrdering Keyですが、Postgresの主キーにサフィックスが付いています
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- これが重複除去を行います
```

## 更新可能なMaterialized ViewなしのカスタムOrdering Key {#custom-ordering-keys-without-refreshable-materialized-views}

データのスケールのために更新可能なMaterialized Viewが機能しない場合、より大きなテーブルでカスタムOrdering Keyを定義し、重複除去に関連する問題を克服するためのいくつかの推奨事項を以下に示します。

### 特定の行で変更されないOrdering Keyカラムを選択する {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouseのOrdering KeyにPostgresの主キー以外の追加のカラムを含める場合は、各行で変更されないカラムを選択することをお勧めします。これにより、ReplacingMergeTreeでデータの整合性や重複除去の問題を防ぐのに役立ちます。

例えば、マルチテナントSaaSアプリケーションでは、(`tenant_id`, `id`)をOrdering Keyとして使用するのが良い選択です。これらのカラムは各行を一意に識別し、`tenant_id`は他のカラムが変更された場合でも`id`に対して一定です。idによる重複除去が(tenant_id, id)による重複除去と一致するため、tenant_idが変更された場合に発生する可能性のあるデータの[重複除去の問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避するのに役立ちます。

### PostgresテーブルのレプリカアイデンティティをカスタムOrdering Keyに設定する {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

PostgresのCDCが期待通りに機能するためには、テーブルの`REPLICA IDENTITY`をOrdering Keyカラムを含むように変更することが重要です。これはDELETE操作を正確に処理するために必要です。

`REPLICA IDENTITY`にOrdering Keyカラムが含まれない場合、PostgresのCDCは主キー以外のカラムの値をキャプチャしません - これはPostgresの論理デコーディングの制限です。Postgresの主キー以外のすべてのOrdering Keyカラムはnullになります。これにより、重複除去に影響を及ぼし、行の以前のバージョンが最新の削除されたバージョン（`_peerdb_is_deleted`が1に設定されている）と重複除去されない可能性があります。

`owneruserid`と`id`を用いた上記の例では、主キーがすでに`owneruserid`を含まない場合、(`owneruserid`, `id`)の上に`UNIQUE INDEX`を持ち、それをテーブルの`REPLICA IDENTITY`として設定する必要があります。これにより、PostgresのCDCは正確なレプリケーションと重複除去に必要なカラムの値をキャプチャします。

以下は、eventsテーブルでこれを行う方法の例です。変更されたOrdering Keyを持つすべてのテーブルに適用することを確認してください。

```sql
-- (owneruserid, id)の上にUNIQUE INDEXを作成する
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- このインデックスを使用してREPLICA IDENTITYを設定する
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
