---
sidebar_label: '順序キー'
description: 'カスタム順序キーの定義方法。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: '順序キー'
---

順序キー（別名：ソートキー）は、ClickHouseにおけるテーブルのデータがディスク上でどのようにソートされ、インデックスされるかを定義します。Postgresからレプリケーションする際、ClickPipesはPostgresのテーブルの主キーをClickHouse内の対応するテーブルの順序キーとして設定します。ほとんどの場合、Postgresの主キーは十分な順序キーとして機能します。ClickHouseはすでに高速なスキャンのために最適化されており、カスタム順序キーは通常、必要ありません。

[移行ガイド](/migrations/postgresql/data-modeling-techniques)で説明されているように、より大規模なユースケースでは、クエリを最適化するために、ClickHouseの順序キーにPostgresの主キー以外の追加カラムを含めるべきです。

デフォルトでは、CDCを使用している場合、Postgresの主キーとは異なる順序キーを選択すると、ClickHouseでデータの重複排除の問題が発生する可能性があります。これは、ClickHouseの順序キーが二重の役割を果たすためです。つまり、データのインデックス作成とソートを制御しながら、重複排除キーとして機能します。この問題に対処する最も簡単な方法は、リフレッシュ可能なマテリアライズドビューを定義することです。

## リフレッシュ可能なマテリアライズドビューの使用 {#use-refreshable-materialized-views}

カスタム順序キー（ORDER BY）を定義するための簡単な方法は、[リフレッシュ可能なマテリアライズドビュー](/materialized-view/refreshable-materialized-view)（MV）を使用することです。これにより、定期的に（例：5分または10分ごと）に望ましい順序キーでテーブル全体をコピーできます。

以下は、カスタムORDER BYと必要な重複排除を持つリフレッシュ可能なMVの例です：

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- 異なる順序キーだが、Postgresの主キーをサフィックスとして使用
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- これが重複排除を実行
```

## リフレッシュ可能なマテリアライズドビューなしのカスタム順序キー {#custom-ordering-keys-without-refreshable-materialized-views}

リフレッシュ可能なマテリアライズドビューがデータのスケールのために機能しない場合、より大規模なテーブルでカスタム順序キーを定義し、重複排除に関する問題を克服するためのいくつかの推奨事項を以下に示します。

### 行ごとに変更しない順序キーのカラムを選択する {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouseの順序キーに追加カラムを含める際は（Postgresの主キー以外）、各行で変更されないカラムを選択することをお勧めします。これにより、ReplacingMergeTreeでのデータの整合性と重複排除の問題を防ぐことができます。

たとえば、マルチテナントSaaSアプリケーションでは、（`tenant_id`、`id`）を順序キーとして使用することが良い選択です。これらのカラムは各行を一意に特定し、`tenant_id`は他のカラムが変更されても`id`に対して一定のままです。重複排除が`id`で行われることは、（`tenant_id`、`id`）での重複排除と整合しているため、`tenant_id`が変更される場合に生じる可能性のあるデータの[重複排除の問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避するのに役立ちます。

### PostgresテーブルのレプリカIDをカスタム順序キーに設定する {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

Postgres CDCが期待通りに機能するためには、順序キーのカラムを含むように`REPLICA IDENTITY`をテーブルで変更することが重要です。これは、DELETEを正確に処理するために不可欠です。

`REPLICA IDENTITY`が順序キーのカラムを含まない場合、Postgres CDCは主キー以外のカラムの値をキャプチャしません。これはPostgresの論理デコーディングの制限です。Postgresの主キー以外のすべての順序キーのカラムはnullになります。これが重複排除に影響を及ぼし、行の前のバージョンが最新の削除されたバージョン（`_peerdb_is_deleted`が1に設定されている）と重複排除されない可能性があります。

上記の`owneruserid`と`id`の例において、主キーにすでに`owneruserid`が含まれていない場合は、(`owneruserid`, `id`)の上に`UNIQUE INDEX`を作成し、それをテーブルの`REPLICA IDENTITY`として設定する必要があります。これにより、Postgres CDCが正確なレプリケーションと重複排除のために必要なカラムの値をキャプチャできるようになります。

以下は、イベントテーブルでこれを実行する方法の例です。変更された順序キーを持つすべてのテーブルにこれを適用してください。

```sql
-- (owneruserid, id) に対して UNIQUE INDEX を作成
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- このインデックスを使用するように REPLICA IDENTITY を設定
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
