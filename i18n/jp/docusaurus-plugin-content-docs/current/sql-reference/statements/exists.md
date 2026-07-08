---
description: 'EXISTS 句のドキュメント'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'EXISTS 句'
doc_type: 'reference'
---

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

単一の `UInt8` 型のカラムを返します。テーブルまたはデータベースが存在しない場合は値 `0` のみを、指定したデータベース内にテーブルが存在する場合は値 `1` のみを含みます。