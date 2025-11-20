---
title: 'スキーマ変更の伝播サポート'
slug: /integrations/clickpipes/postgres/schema-changes
description: 'ソーステーブルに対して ClickPipes が検出可能なスキーマ変更の種類を説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

Postgres 用 ClickPipes はソーステーブルのスキーマ変更を検出でき、場合によってはその変更を自動的に宛先テーブルへ伝播できます。各 DDL 操作の扱いは以下のとおりです。

[//]: # "TODO このページを、リネーム、データ型変更、TRUNCATE 時の動作と、非互換なスキーマ変更への対処方法に関するガイダンスで拡充する。"

| Schema Change Type                                                                  | Behaviour                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| Adding a new column (`ALTER TABLE ADD COLUMN ...`)                                  | テーブルに対して insert/update/delete が行われると、自動的に伝播されます。新しい列は、スキーマ変更後にレプリケートされたすべての行で値が設定されます                                                   |
| Adding a new column with a default value (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | テーブルに対して insert/update/delete が行われると、自動的に伝播されます。新しい列は、スキーマ変更後にレプリケートされたすべての行で値が設定されますが、既存行については、テーブル全体を再読み込みしない限りデフォルト値は反映されません |
| Dropping an existing column (`ALTER TABLE DROP COLUMN ...`)                         | 検出はされますが、伝播は**されません**。削除された列は、スキーマ変更後にレプリケートされるすべての行で `NULL` が設定されます                                                                |

列の追加が伝播されるのは、バッチの同期が完了したタイミングであり、これは同期間隔に達したとき、または pull バッチサイズに達したときに発生する場合があります。同期の制御に関する詳細は[こちら](./controlling_sync.md)を参照してください。