---
sidebar_label: 'オーダリングキー'
description: 'カスタムのオーダリングキーを定義する方法。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: 'オーダリングキー'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

Ordering Key（別名 sorting key）は、ClickHouse のテーブルにおいて、データがディスク上でどのようにソートされ、どのようにインデックス付けされるかを定義します。Postgres からレプリケーションする際、ClickPipes はデフォルトで、Postgres のテーブルのプライマリキーを、対応する ClickHouse テーブルのオーダリングキーとして使用します。多くの場合、ClickHouse はすでに高速スキャン向けに最適化されているため、Postgres のプライマリキーだけで十分なオーダリングキーとなり、独自のオーダリングキーを定義する必要はありません。

[移行ガイド](/migrations/postgresql/data-modeling-techniques)に記載されているとおり、より大規模なユースケースでは、クエリを最適化するために、ClickHouse のオーダリングキーに Postgres のプライマリキーに加えて追加の列を含めることを推奨します。

CDC をデフォルト設定で使用する場合、Postgres のプライマリキーとは異なるオーダリングキーを選択すると、ClickHouse でデータ重複排除に関する問題が発生する可能性があります。これは、ClickHouse のオーダリングキーが二重の役割を持っているためです。すなわち、データのインデックス作成とソートを制御すると同時に、重複排除キーとしても機能します。この問題に対処する最も簡単な方法は、リフレッシュ可能なマテリアライズドビューを定義することです。

## 更新可能なマテリアライズドビューを使用する {#use-refreshable-materialized-views}

カスタムの並び替えキー（ORDER BY）を定義する簡単な方法のひとつは、[refreshable materialized views](/materialized-view/refreshable-materialized-view)（MV）を使用することです。これにより、一定間隔（例: 5 分ごとや 10 分ごと）で、任意の並び替えキーを用いてテーブル全体をコピーできます。

以下は、カスタム ORDER BY と必要な重複排除を備えた Refreshable MV の例です。

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```

## リフレッシュ可能なマテリアライズドビューを使わないカスタムオーダリングキー {#custom-ordering-keys-without-refreshable-materialized-views}

データ規模が大きく、リフレッシュ可能なマテリアライズドビューが利用できない場合に、大きなテーブルでカスタムオーダリングキーを定義し、重複排除に関連する問題を回避するためのいくつかの推奨事項を以下に示します。

### 行ごとに変化しないカラムをオーダリングキーに選択する {#choose-ordering-key-columns-that-dont-change-for-a-given-row}

ClickHouse のオーダリングキーに（Postgres のプライマリキー以外の）追加カラムを含める場合は、各行に対して値が変化しないカラムを選択することを推奨します。これにより、ReplacingMergeTree におけるデータ整合性や重複排除に関する問題を防止できます。

例えば、マルチテナントの SaaS アプリケーションでは、オーダリングキーとして (`tenant_id`, `id`) を使用するのは良い選択です。これらのカラムは各行を一意に識別し、他のカラムが変化しても、ある `id` に対する `tenant_id` は一定のままです。`id` による重複排除と (`tenant_id`, `id`) による重複排除が整合するため、`tenant_id` が変更された場合に発生しうるデータの[重複排除問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避するのに役立ちます。

### Postgres テーブルで Replica Identity をカスタムオーダリングキーに設定する {#set-replica-identity-on-postgres-tables-to-custom-ordering-key}

Postgres CDC を期待どおりに動作させるには、テーブルの `REPLICA IDENTITY` をオーダリングキーのカラムを含むように変更することが重要です。これは DELETE を正確に処理するために不可欠です。

`REPLICA IDENTITY` にオーダリングキーのカラムが含まれていない場合、Postgres CDC はプライマリキー以外のカラムの値を取得しません。これは Postgres のロジカルデコーディングの制限です。Postgres においてプライマリキー以外のすべてのオーダリングキーのカラムは NULL になります。その結果、重複排除に影響が生じ、行の以前のバージョンが、最新の削除済みバージョン（`_peerdb_is_deleted` が 1 に設定されている行）と正しく重複排除されない可能性があります。

前述の `owneruserid` と `id` の例では、プライマリキーにすでに `owneruserid` が含まれていない場合、(`owneruserid`, `id`) 上に `UNIQUE INDEX` を作成し、それをテーブルの `REPLICA IDENTITY` に設定する必要があります。これにより、Postgres CDC が正確なレプリケーションと重複排除に必要なカラム値を取得できるようになります。

以下は、events テーブルでの設定例です。オーダリングキーを変更したすべてのテーブルに、この設定を適用するようにしてください。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
