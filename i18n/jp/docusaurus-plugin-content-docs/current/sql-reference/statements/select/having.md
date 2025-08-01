---
description: 'HAVING句のドキュメント'
sidebar_label: 'HAVING'
slug: '/sql-reference/statements/select/having'
title: 'HAVING Clause'
---




# HAVING 句

集約結果をフィルタリングすることを可能にします。[GROUP BY](/sql-reference/statements/select/group-by) により生成された結果を操作します。これは [WHERE](../../../sql-reference/statements/select/where.md) 句に似ていますが、違いは `WHERE` が集約前に実行されるのに対し、`HAVING` は集約後に実行される点です。

`HAVING` 句では、`SELECT` 句の集約結果をエイリアスで参照することができます。あるいは、`HAVING` 句を使って、クエリ結果に返されない追加の集約結果をフィルタリングすることもできます。

## 制限事項 {#limitations}

集約が行われていない場合は `HAVING` を使用できません。代わりに `WHERE` を使用してください。
