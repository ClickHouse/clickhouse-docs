---
'description': 'ローカルサーバーに存在するリソースに関する情報を含むシステムテーブルであり、各リソースに対して1行があります。'
'keywords':
- 'system table'
- 'resources'
'slug': '/operations/system-tables/resources'
'title': 'system.resources'
'doc_type': 'reference'
---


# system.resources

ローカルサーバーに存在する[リソース](/operations/workload-scheduling.md#workload_entity_storage)に関する情報を含みます。このテーブルには、各リソースの行が含まれています。

例:

```sql
SELECT *
FROM system.resources
FORMAT Vertical
```

```text
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

- `name` (`String`) - リソース名。
- `read_disks` (`Array(String)`) - このリソースを読み取り操作に使用するディスク名の配列。
- `write_disks` (`Array(String)`) - このリソースを書き込み操作に使用するディスク名の配列。
- `create_query` (`String`) - リソースの定義。
