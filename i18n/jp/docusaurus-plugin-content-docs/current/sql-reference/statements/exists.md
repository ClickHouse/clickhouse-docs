---
description: 'EXISTSステートメントに関するドキュメント'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'EXISTSステートメント'
---


# EXISTSステートメント

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

指定されたデータベースにテーブルが存在しない場合は単一の `UInt8` 型のカラムが `0` の値を返し、テーブルが存在する場合は `1` の値を返します。
