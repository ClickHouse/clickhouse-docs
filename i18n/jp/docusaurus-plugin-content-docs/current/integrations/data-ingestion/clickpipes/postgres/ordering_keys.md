---
sidebar_label: 'オーダリングキー'
description: 'カスタムのオーダリングキーを定義する方法。'
slug: /integrations/clickpipes/postgres/ordering_keys
title: 'Ordering Keys'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'CDC', 'データインジェスト', 'リアルタイム同期']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Ordering Keys（別名: ソートキー）は、ClickHouse のテーブルのデータがディスク上でどのようにソートされ、どのように索引付けされるかを定義します。Postgres からレプリケーションを行う場合、ClickPipes はデフォルトで、ClickHouse 側の対応するテーブルに対して、Postgres テーブルのプライマリキーをオーダリングキーとして使用します。多くの場合、ClickHouse はすでに高速スキャンに最適化されており、カスタムのオーダリングキーを定義する必要はなく、Postgres のプライマリキーだけで十分なオーダリングキーとして機能します。

[移行ガイド](/migrations/postgresql/data-modeling-techniques) で説明しているように、より大規模なユースケースでは、クエリを最適化するために、ClickHouse のオーダリングキーに Postgres のプライマリキーに加えて追加のカラムを含める必要があります。

CDC（変更データキャプチャ）を利用する構成では、Postgres のプライマリキーとは異なるオーダリングキーを選択すると、ClickHouse で重複排除の問題が発生する可能性があります。これは、ClickHouse のオーダリングキーが二重の役割を持つために起こります。すなわち、オーダリングキーはデータの索引付けとソートを制御すると同時に、重複排除キーとしても機能します。この問題に対処する最も簡単な方法は、リフレッシャブルmaterialized view を定義することです。

## リフレッシャブルmaterialized viewを使用する \{#use-refreshable-materialized-views\}

カスタムの ORDER BY キー（ソートキー）を定義する簡単な方法は、[refreshable materialized views](/materialized-view/refreshable-materialized-view) (MV) を使用することです。これにより、任意の ORDER BY キーでテーブル全体を、定期的に（例: 5 分ごとや 10 分ごとに）コピーできます。

以下は、カスタム ORDER BY と必要な重複排除を行う Refreshable MV の例です。

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```


## リフレッシャブルmaterialized view を使用しない場合のカスタムソートキー \{#custom-ordering-keys-without-refreshable-materialized-views\}

データ量が多すぎてリフレッシャブルmaterialized view を利用できない場合には、より大きなテーブルに対してカスタムソートキーを定義し、重複排除に関する問題を回避するために、次のようないくつかの推奨事項を検討してください。

### 各行について変化しないオーダリングキーのカラムを選択する \{#choose-ordering-key-columns-that-dont-change-for-a-given-row\}

ClickHouse 用のオーダリングキーに（Postgres のプライマリキー以外の）追加カラムを含める場合は、各行について変化しないカラムを選択することを推奨します。これは、ReplacingMergeTree におけるデータ整合性や重複排除の問題を防ぐのに役立ちます。

たとえば、マルチテナントの SaaS アプリケーションでは、オーダリングキーとして (`tenant_id`, `id`) を使用するのは良い選択です。これらのカラムは各行を一意に識別し、他のカラムが変化しても、同じ `id` に対して `tenant_id` は不変です。`id` による重複排除が (`tenant_id`, `id`) による重複排除と一致するため、もし `tenant_id` が変更されると発生しうるデータの[重複排除の問題](https://docs.peerdb.io/mirror/ordering-key-different)を回避するのに役立ちます。

### Postgres テーブルの REPLICA IDENTITY をカスタム順序キーに設定する \{#set-replica-identity-on-postgres-tables-to-custom-ordering-key\}

Postgres CDC を期待どおりに動作させるには、テーブルの `REPLICA IDENTITY` を変更し、順序キーのカラムを含めることが重要です。これは DELETE を正確に処理するために不可欠です。

`REPLICA IDENTITY` に順序キーのカラムが含まれていない場合、Postgres CDC はプライマリキー以外のカラムの値を取得しません。これは Postgres のロジカルデコーディングにおける制約です。Postgres では、プライマリキー以外のすべての順序キーのカラムは NULL になります。これは重複排除に影響し、行の以前のバージョンが、最新の削除済みバージョン（`_peerdb_is_deleted` が 1 に設定されているもの）と正しく重複排除されない可能性があります。

上記の `owneruserid` と `id` の例では、プライマリキーに既に `owneruserid` が含まれていない場合、(`owneruserid`, `id`) に対して `UNIQUE INDEX` を作成し、それをテーブルの `REPLICA IDENTITY` として設定する必要があります。これにより、Postgres CDC が正確なレプリケーションおよび重複排除に必要なカラム値を取得できるようになります。

以下は、events テーブルでこれを行う方法の例です。順序キーを変更したすべてのテーブルに対して、この設定を適用するようにしてください。

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
