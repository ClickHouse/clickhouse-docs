---
title: 'Schema Changes Propagation Support'
slug: '/integrations/clickpipes/postgres/schema-changes'
description: 'Page describing schema change types detectable by ClickPipes in the
  source tables'
---



ClickPipes for Postgresは、ソーステーブルのスキーマ変更を検出できます。また、これらの変更の一部を対応するデスティネーションテーブルにも伝播することができます。それぞれのスキーマ変更の扱いは、以下に文書化されています。

| スキーマ変更タイプ                                                                  | 振る舞い                             |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 新しいカラムの追加 (`ALTER TABLE ADD COLUMN ...`)                                  | 自動的に伝播され、変更後のすべての行はすべてのカラムが埋められます                                                                         |
| デフォルト値を持つ新しいカラムの追加 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自動的に伝播され、変更後のすべての行はすべてのカラムが埋められますが、既存の行はテーブル全体を再読み込みしない限りDEFAULT値を表示しません |
| 既存のカラムの削除 (`ALTER TABLE DROP COLUMN ...`)                                 | 検出されますが、伝播はされません。変更後のすべての行は削除されたカラムに対してNULLを持ちます                                                                |
