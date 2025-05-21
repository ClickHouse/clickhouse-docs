---
description: 'ALL句のドキュメント'
sidebar_label: 'ALL'
slug: /sql-reference/statements/select/all
title: 'ALL句'
---


# ALL句

テーブル内に複数の一致する行がある場合、`ALL`はそれらすべてを返します。 `SELECT ALL`は`DISTINCT`なしの`SELECT`と同じです。両方の`ALL`と`DISTINCT`が指定されると、例外がスローされます。

`ALL`は集約関数内に指定できますが、クエリの結果に実質的な影響はありません。

例えば：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

は次のものと同等です：

```sql
SELECT sum(number) FROM numbers(10);
```
