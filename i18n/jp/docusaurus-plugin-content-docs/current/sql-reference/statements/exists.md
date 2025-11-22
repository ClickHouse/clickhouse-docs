---
description: 'EXISTS 文のドキュメント'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'EXISTS 文'
doc_type: 'reference'
---

# EXISTS 句

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

単一の `UInt8` 型カラムを返します。指定したデータベース内にテーブルやデータベースが存在しない場合は値 `0` を、テーブルが存在する場合は値 `1` を含みます。
