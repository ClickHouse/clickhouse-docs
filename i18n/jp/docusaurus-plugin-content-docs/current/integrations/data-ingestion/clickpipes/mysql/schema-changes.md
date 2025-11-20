---
title: 'スキーマ変更の伝搬サポート'
slug: /integrations/clickpipes/mysql/schema-changes
description: 'ClickPipes がソーステーブルで検出可能なスキーマ変更タイプについて説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

MySQL 用 ClickPipes は、ソーステーブルのスキーマ変更を検出し、場合によっては変更を自動的に宛先テーブルへ伝搬できます。各 DDL 操作の扱いは次のとおりです。

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 自動的に伝搬されます。新しいカラムは、スキーマ変更後にレプリケートされるすべての行に対して値が設定されます                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自動的に伝搬されます。新しいカラムは、スキーマ変更後にレプリケートされるすべての行に対して値が設定されますが、テーブル全体の再読み込みを行わない限り、既存の行にはデフォルト値は反映されません |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 検出されますが、**伝搬はされません**。スキーマ変更後にレプリケートされるすべての行では、削除されたカラムには `NULL` が設定されます                                                                |