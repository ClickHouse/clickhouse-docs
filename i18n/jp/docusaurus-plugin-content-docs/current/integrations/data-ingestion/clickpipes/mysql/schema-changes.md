---
title: 'スキーマ変更の伝搬サポート'
slug: /integrations/clickpipes/mysql/schema-changes
description: 'ClickPipes がソーステーブルで検出可能なスキーマ変更の種類を説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

MySQL 向け ClickPipes は、ソーステーブルのスキーマ変更を検出し、場合によっては変更を自動的に宛先テーブルへ伝搬できます。各 DDL 操作の扱いは以下のとおりです。

[//]: # "TODO このページを、リネーム、データ型の変更、TRUNCATE 時の動作および互換性のないスキーマ変更への対処方法に関するガイダンスで拡張する。"

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | 自動的に伝搬されます。スキーマ変更以降にレプリケートされたすべての行で、新しい列に値が設定されます。                                                                         |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自動的に伝搬されます。スキーマ変更以降にレプリケートされたすべての行で、新しい列に値が設定されますが、テーブル全体を再読み込みしない限り、既存の行にはデフォルト値は反映されません。 |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 検出はされますが、**伝搬はされません**。スキーマ変更以降にレプリケートされたすべての行では、削除された列には `NULL` が設定されます。                                                                |