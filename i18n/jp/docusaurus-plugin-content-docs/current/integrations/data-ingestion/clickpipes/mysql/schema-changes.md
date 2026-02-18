---
title: 'スキーマ変更の伝播サポート'
slug: /integrations/clickpipes/mysql/schema-changes
description: 'ClickPipes がソーステーブルで検出可能なスキーマ変更の種類を説明するページ'
doc_type: 'reference'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

MySQL 向け ClickPipes は、ソーステーブルでのスキーマ変更を検出し、場合によってはその変更を自動的に宛先テーブルへ伝播できます。各 DDL 操作の扱い方は以下のとおりです。

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| スキーマ変更の種類                                                                  | 動作                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------ |
| 新しいカラムの追加（`ALTER TABLE ADD COLUMN ...`）                                  | 自動的に伝播されます。新しいカラムは、スキーマ変更後に複製されたすべての行について値が設定されます                                                                         |
| デフォルト値付きの新しいカラムの追加（`ALTER TABLE ADD COLUMN ... DEFAULT ...`）   | 自動的に伝播されます。新しいカラムは、スキーマ変更後に複製されたすべての行について値が設定されますが、既存の行については、テーブル全体の再読み込みを行わない限りデフォルト値は反映されません |
| 既存カラムの削除（`ALTER TABLE DROP COLUMN ...`）                                   | 検出はされますが、**伝播はされません**。削除されたカラムは、スキーマ変更後に複製されたすべての行で `NULL` に設定されます                                                                |

### MySQL 5.x の制約 \{#mysql-5-limitations\}

[8.0.1](https://dev.mysql.com/blog-archive/more-metadata-is-written-into-binary-log/) より古い MySQL バージョンでは、binlog に完全なカラムメタデータ（`binlog_row_metadata=FULL`）が含まれていないため、ClickPipes はカラムを位置（序数）で追跡します。これは次のことを意味します。

- **末尾へのカラム追加**（`ALTER TABLE ADD COLUMN ...`）はサポートされています。
- **カラム位置をずらすあらゆる DDL** は、序数位置をもはや確実に対応付けできないため、パイプがエラーを発生させます。これには次が含まれます。
  - `ALTER TABLE DROP COLUMN ...`
  - `ALTER TABLE ADD COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE MODIFY COLUMN ... AFTER ...` / `FIRST`
  - `ALTER TABLE CHANGE COLUMN ... AFTER ...` / `FIRST`

このエラーが発生した場合は、パイプを再同期する必要があります。