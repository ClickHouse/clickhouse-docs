---
slug: /sql-reference/statements/select/having
sidebar_label: HAVING
---

# HAVING句

[GROUP BY](../../../sql-reference/statements/select/group-by.md)によって生成された集約結果をフィルタリングすることを可能にします。これは[WHERE](../../../sql-reference/statements/select/where.md)句に似ていますが、違いは`WHERE`は集約前に実行されるのに対し、`HAVING`は集約後に実行される点です。

`HAVING`句では、`SELECT`句から返された集約結果をそのエイリアスで参照することができます。あるいは、`HAVING`句はクエリ結果に返されない追加の集約結果をフィルタリングすることも可能です。

## 制限事項 {#limitations}

集約が行われない場合、`HAVING`は使用できません。その代わりに`WHERE`を使用してください。
