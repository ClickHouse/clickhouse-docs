---
description: '特定のテーブルに対するフィルターと、この行ポリシーを使用すべきロールおよび/またはユーザーのリストを含むシステムテーブル。'
keywords: ['system table', 'row_policies']
slug: /operations/system-tables/row_policies
title: 'system.row_policies'
---


# system.row_policies

特定のテーブルに対するフィルターと、この行ポリシーを使用すべきロールおよび/またはユーザーのリストを含みます。

カラム:
- `name` ([String](../../sql-reference/data-types/string.md)) — 行ポリシーの名前。

- `short_name` ([String](../../sql-reference/data-types/string.md)) — 行ポリシーの短い名前。行ポリシーの名前は複合で、例えば: myfilter ON mydb.mytable。ここで「myfilter ON mydb.mytable」が行ポリシーの名前で、「myfilter」が短い名前です。

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。ポリシーがデータベースのものである場合は空。

- `id` ([UUID](../../sql-reference/data-types/uuid.md)) — 行ポリシーID。

- `storage` ([String](../../sql-reference/data-types/string.md)) — 行ポリシーが保存されているディレクトリの名前。

- `select_filter` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 行をフィルタリングするために使用される条件。

- `is_restrictive` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 行ポリシーが行へのアクセスを制限しているかどうかを示します。詳細は [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)。値:
  - `0` — 行ポリシーは `AS PERMISSIVE` 句で定義されています。
  - `1` — 行ポリシーは `AS RESTRICTIVE` 句で定義されています。

- `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 行ポリシーがすべてのロールおよび/またはユーザーに設定されていることを示します。

- `apply_to_list` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 行ポリシーが適用されるロールおよび/またはユーザーのリスト。

- `apply_to_except` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 行ポリシーは、リストされたロールおよび/またはユーザーを除きすべてのロールおよび/またはユーザーに適用されます。

## See Also {#see-also}

- [SHOW POLICIES](/sql-reference/statements/show#show-policies)
