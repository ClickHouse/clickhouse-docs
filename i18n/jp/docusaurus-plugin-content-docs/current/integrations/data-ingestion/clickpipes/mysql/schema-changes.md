---
'title': 'スキーマ変更の伝播サポート'
'slug': '/integrations/clickpipes/mysql/schema-changes'
'description': 'ページは、ソーステーブル内でClickPipesによって検出可能なスキーマ変更タイプを説明します'
'doc_type': 'reference'
---

ClickPipes for MySQL は、ソーステーブルのスキーマ変更を検出でき、場合によっては自動的に変更を宛先テーブルに伝播させることができます。各 DDL 操作の処理方法は以下の通りに記載されています。

[//]: # "TODO Extend this page with behavior on rename, data type changes, and truncate + guidance on how to handle incompatible schema changes."

| スキーマ変更タイプ                                                                   | 挙動                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------- |
| 新しいカラムの追加 (`ALTER TABLE ADD COLUMN ...`)                                   | 自動的に伝播されます。新しいカラムは、スキーマ変更後に複製されたすべての行に対して populated されます。                                                                         |
| デフォルト値付きの新しいカラムの追加 (`ALTER TABLE ADD COLUMN ... DEFAULT ...`) | 自動的に伝播されます。新しいカラムは、スキーマ変更後に複製されたすべての行に対して populated されますが、既存の行は全体テーブルのリフレッシュなしにはデフォルト値を表示しません。|
| 既存のカラムの削除 (`ALTER TABLE DROP COLUMN ...`)                                  | 検出されますが、**伝播されません**。削除されたカラムは、スキーマ変更後に複製されたすべての行に対して `NULL` に populated されます。                                                                |
