---
description: 'システム内のすべてのマスキングポリシーに関する情報を保持するシステムテーブル。'
keywords: ['system table', 'masking_policies']
slug: /operations/system-tables/masking_policies
title: 'system.masking_policies'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

# system.masking_policies \{#systemmasking_policies\}

定義されているすべてのマスキングポリシーに関する情報を保持します。

カラム:

* `name` ([String](/sql-reference/data-types/string.md)) — マスキングポリシーの名前。完全名の形式は `short_name ON database.table` です。
* `short_name` ([String](/sql-reference/data-types/string.md)) — マスキングポリシーの短縮名。たとえば、完全名が `mask_email ON mydb.mytable` の場合、短縮名は `mask_email` です。
* `database` ([String](/sql-reference/data-types/string.md)) — データベース名。
* `table` ([String](/sql-reference/data-types/string.md)) — テーブル名。
* `id` ([UUID](/sql-reference/data-types/uuid.md)) — マスキングポリシーの ID。
* `storage` ([String](/sql-reference/data-types/string.md)) — マスキングポリシーが保存されているディレクトリ名。
* `update_assignments` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — データをどのようにマスクするかを定義する UPDATE の代入指定。例: `email = '***masked***', phone = '***-***-****'`。
* `where_condition` ([Nullable(String)](/sql-reference/data-types/nullable.md)) — マスキングを適用する条件を指定する任意の WHERE 句。
* `priority` ([Int64](/sql-reference/data-types/int-uint.md)) — 複数のマスキングポリシーを適用する際の優先度。値が高いポリシーが先に適用されます。デフォルトは 0 です。
* `apply_to_all` ([UInt8](/sql-reference/data-types/int-uint.md)) — マスキングポリシーがすべてのロールおよび／またはユーザーに適用されるかどうかを示します。true の場合は 1、それ以外は 0 です。
* `apply_to_list` ([Array(String)](/sql-reference/data-types/array.md)) — マスキングポリシーが適用されるロールおよび／またはユーザーの一覧。
* `apply_to_except` ([Array(String)](/sql-reference/data-types/array.md)) — 一覧に含まれるロールおよび／またはユーザーを除く、すべてのロールおよび／またはユーザーにマスキングポリシーが適用されます。`apply_to_all` が 1 の場合にのみ設定されます。