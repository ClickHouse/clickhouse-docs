---
sidebar_label: '並び替えキー'
description: 'カスタム並び替えキーを定義する方法。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: '並び替えキー'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

並び替えキー（sorting key とも呼ばれます）は、ClickHouse のテーブルで、ディスク上のデータのソート順とインデックス方法を定義するものです。Postgres からレプリケーションする場合、ClickPipes はデフォルトで、対応する ClickHouse テーブルの並び替えキーとして Postgres テーブルの主キーを使用します。多くの場合、Postgres の主キーだけで並び替えキーとしては十分です。これは、ClickHouse 自体がすでに高速スキャン向けに最適化されており、カスタムの並び替えキーが不要なケースが多いためです。

[移行ガイド](/migrations/postgresql/data-modeling-techniques) で説明しているように、より大規模なユースケースでは、クエリを最適化するために、ClickHouse の並び替えキーに Postgres の主キーに加えて追加のカラムを含めることを推奨します。

CDC をデフォルト設定で使用している場合、Postgres の主キーとは異なる並び替えキーを選択すると、ClickHouse でのデータ重複排除に問題が生じる可能性があります。これは、ClickHouse における並び替えキーが二重の役割を担っているためです。すなわち、データのインデックス付けとソートを制御すると同時に、重複排除キーとしても機能しているためです。この問題に対処する最も簡単な方法は、リフレッシュ可能なマテリアライズドビューを定義することです。



## リフレッシュ可能なマテリアライズドビューの使用 {#use-refreshable-materialized-views}

カスタムの順序キー（ORDER BY）を定義する簡単な方法は、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)（MV）を使用することです。これにより、定期的に（例：5分または10分ごと）、指定した順序キーでテーブル全体をコピーできます。

以下は、カスタムORDER BYと重複排除を含むリフレッシュ可能なMVの例です：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- 異なる順序キーだが、PostgreSQLの主キーをサフィックスとして含む
AS
SELECT * FROM posts FINAL
WHERE _peerdb_is_deleted = 0; -- 重複排除を実行
```


## リフレッシュ可能なマテリアライズドビューを使用しないカスタムオーダリングキー {#custom-ordering-keys-without-refreshable-materialized-views}

データ規模の問題でリフレッシュ可能なマテリアライズドビューが機能しない場合、大規模なテーブルでカスタムオーダリングキーを定義し、重複排除に関連する問題を克服するための推奨事項をいくつか紹介します。

### 特定の行に対して変更されないオーダリングキー列を選択する {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouseのオーダリングキーに追加の列を含める場合(Postgresのプライマリキー以外)、各行に対して変更されない列を選択することを推奨します。これにより、ReplacingMergeTreeでのデータ整合性と重複排除の問題を防ぐことができます。

例えば、マルチテナントSaaSアプリケーションでは、オーダリングキーとして(`tenant_id`, `id`)を使用することが適切な選択です。これらの列は各行を一意に識別し、他の列が変更されても`tenant_id`は`id`に対して一定のままです。idによる重複排除が(tenant_id, id)による重複排除と一致するため、tenant_idが変更された場合に発生する可能性のあるデータの[重複排除の問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避できます。

### PostgresテーブルのReplica Identityをカスタムオーダリングキーに設定する {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

Postgres CDCが期待通りに機能するためには、テーブルの`REPLICA IDENTITY`を変更してオーダリングキー列を含めることが重要です。これはDELETE操作を正確に処理するために不可欠です。

`REPLICA IDENTITY`がオーダリングキー列を含まない場合、Postgres CDCはプライマリキー以外の列の値をキャプチャしません。これはPostgresの論理デコーディングの制限です。Postgresのプライマリキー以外のすべてのオーダリングキー列はnullになります。これは重複排除に影響し、行の以前のバージョンが最新の削除バージョン(`_peerdb_is_deleted`が1に設定されている)と重複排除されない可能性があることを意味します。

上記の`owneruserid`と`id`の例では、プライマリキーに`owneruserid`が既に含まれていない場合、(`owneruserid`, `id`)に対して`UNIQUE INDEX`を作成し、それをテーブルの`REPLICA IDENTITY`として設定する必要があります。これにより、Postgres CDCが正確なレプリケーションと重複排除に必要な列の値をキャプチャすることが保証されます。

以下は、eventsテーブルでこれを実行する方法の例です。変更されたオーダリングキーを持つすべてのテーブルにこれを適用してください。

```sql
-- (owneruserid, id)にUNIQUE INDEXを作成
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- このインデックスを使用するようにREPLICA IDENTITYを設定
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
