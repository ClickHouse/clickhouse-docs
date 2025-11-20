---
title: 'スキーマ変更の伝播サポート'
slug: /integrations/clickpipes/postgres/schema-changes
description: 'ClickPipes がソーステーブルで検出可能なスキーマ変更タイプを説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

Postgres 向け ClickPipes はソーステーブルのスキーマ変更を検出し、場合によってはその変更を自動的に宛先テーブルへ伝播できます。各 DDL 操作の扱いは以下のとおりです。

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | テーブルで insert/update/delete が発生すると自動的に伝播されます。新しい列は、スキーマ変更後にレプリケートされたすべての行について値が設定されます                                                   |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | テーブルで insert/update/delete が発生すると自動的に伝播されます。新しい列は、スキーマ変更後にレプリケートされたすべての行について値が設定されますが、既存の行にはテーブル全体をフルリフレッシュしない限りデフォルト値は反映されません |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 検出はされますが、**伝播はされません**。削除された列は、スキーマ変更後にレプリケートされたすべての行で `NULL` が設定されます                                                                |

列の追加はバッチの同期処理の終了時に伝播される点に注意してください。これは、同期間隔またはプルバッチサイズに到達した後に発生する可能性があります。同期の制御方法の詳細は[こちら](./controlling_sync.md)をご覧ください。