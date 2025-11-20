---
title: 'スキーマ変更の伝播サポート'
slug: /integrations/clickpipes/mysql/schema-changes
description: 'ClickPipes がソーステーブルで検出可能なスキーマ変更タイプについて説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

MySQL 向け ClickPipes は、ソーステーブルのスキーマ変更を検出し、場合によってはその変更を自動的に宛先テーブルへ伝播できます。各種 DDL 操作の扱いは次のとおりです。

[//]: # "TODO このページを、リネーム、データ型の変更、truncate に対する動作、および非互換なスキーマ変更の扱いに関するガイダンスで拡張する。"

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 自動的に伝播されます。新しいカラムには、スキーマ変更以後にレプリケートされたすべての行で値が設定されます。                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自動的に伝播されます。新しいカラムには、スキーマ変更以後にレプリケートされたすべての行で値が設定されますが、既存の行には、テーブル全体を再読み込みしない限りデフォルト値は反映されません。 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 検出はされますが、**伝播はされません**。削除されたカラムには、スキーマ変更以後にレプリケートされたすべての行で `NULL` が設定されます。                                                                |