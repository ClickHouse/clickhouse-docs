---
slug: /sql-reference/statements/create/dictionary/sources/null
title: 'Null Dictionary ソース'
sidebar_position: 14
sidebar_label: 'Null'
description: 'ClickHouse でテスト用に Null（空）の Dictionary ソースを構成します。'
doc_type: 'reference'
---

ダミー（空）の Dictionary を作成するために使用できる特別なソースです。
ダミー Dictionary は、テスト用途や、データノードとクエリノードを分離し分散テーブルを使用する構成で役立ちます。

```sql
CREATE DICTIONARY null_dict (
    id              UInt64,
    val             UInt8,
    default_val     UInt8 DEFAULT 123,
    nullable_val    Nullable(UInt8)
)
PRIMARY KEY id
SOURCE(NULL())
LAYOUT(FLAT())
LIFETIME(0);
```
