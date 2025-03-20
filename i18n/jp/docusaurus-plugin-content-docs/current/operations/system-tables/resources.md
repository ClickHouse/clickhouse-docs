---
description: "ローカルサーバーに存在するリソースに関する情報を含むシステムテーブルで、各リソースごとに1行があります。"
slug: /operations/system-tables/resources
title: "system.system.resources"
keywords: ["システムテーブル", "リソース"]
---

ローカルサーバーに存在する[リソース](/operations/workload-scheduling.md#workload_entity_storage)に関する情報を含みます。このテーブルには、各リソースごとに1行が含まれています。

例:

``` sql
SELECT *
FROM system.resources
FORMAT Vertical
```

``` text
Row 1:
──────
name:         io_read
read_disks:   ['s3']
write_disks:  []
create_query: CREATE RESOURCE io_read (READ DISK s3)

Row 2:
──────
name:         io_write
read_disks:   []
write_disks:  ['s3']
create_query: CREATE RESOURCE io_write (WRITE DISK s3)
```

カラム:

- `name` （`String`） - リソース名。
- `read_disks` （`Array(String)`） - このリソースを使用する読み取り操作に利用されるディスク名の配列。
- `write_disks` （`Array(String)`） - このリソースを使用する書き込み操作に利用されるディスク名の配列。
- `create_query` （`String`） - リソースの定義。
