---
'title': 'TOAST カラムの処理'
'description': 'PostgreSQL から ClickHouse にデータをレプリケートする際の TOAST カラムの扱い方を学びましょう。'
'slug': '/integrations/clickpipes/postgres/toast'
'doc_type': 'guide'
---

When replicating data from PostgreSQL to ClickHouse, it's important to understand the limitations and special considerations for TOAST (The Oversized-Attribute Storage Technique) columns. This guide will help you identify and properly handle TOAST columns in your replication process.

## What are TOAST columns in PostgreSQL? {#what-are-toast-columns-in-postgresql}

TOAST (The Oversized-Attribute Storage Technique)は、PostgreSQLの大きなフィールド値を処理するためのメカニズムです。行が最大行サイズ（通常は2KBですが、PostgreSQLのバージョンや設定に応じて異なることがあります）を超えると、PostgreSQLは自動的に大きなフィールド値を別のTOASTテーブルに移動し、メインテーブルにはポインタだけを保存します。

Change Data Capture (CDC)中は、変更されていないTOASTカラムはレプリケーションストリームに含まれないことに注意が必要です。これが適切に処理されないと、不完全なデータレプリケーションが発生する可能性があります。

初期ロード（スナップショット）中は、TOASTカラムを含むすべてのカラム値が、そのサイズに関係なく正しくレプリケートされます。このガイドで説明する制限は、初期ロード後の継続的なCDCプロセスに主に影響します。

TOASTおよびその実装についての詳細は、こちらで読むことができます: https://www.postgresql.org/docs/current/storage-toast.html

## Identifying TOAST columns in a table {#identifying-toast-columns-in-a-table}

TOASTカラムを持つテーブルを特定するには、以下のSQLクエリを使用できます：

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOASTされる可能性のあるカラムの名前とデータ型を返します。ただし、このクエリは、データ型とストレージ属性に基づいてTOASTストレージの対象となるカラムを特定するだけであることに注意が必要です。これらのカラムが実際にTOASTデータを含むかどうかを判断するには、これらのカラムの値がサイズを超えているかどうかを考慮する必要があります。データの実際のTOAST処理は、これらのカラムに保存されている特定の内容に依存します。

## Ensuring proper handling of TOAST columns {#ensuring-proper-handling-of-toast-columns}

TOASTカラムがレプリケーション中に正しく処理されるようにするには、テーブルの`REPLICA IDENTITY`を`FULL`に設定する必要があります。これにより、PostgreSQLはUPDATEおよびDELETE操作のためにWALに完全な古い行を含めるよう指示します。これにより、すべてのカラム値（TOASTカラムを含む）がレプリケーションに使用可能になります。

次のSQLコマンドを使用して`REPLICA IDENTITY`を`FULL`に設定できます：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`を設定する際のパフォーマンス考慮事項については、[このブログ投稿](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## Replication behavior when REPLICA IDENTITY FULL is not set {#replication-behavior-when-replica-identity-full-is-not-set}

TOASTカラムを持つテーブルに対して`REPLICA IDENTITY FULL`が設定されていない場合、ClickHouseへのレプリケーション時に次のような問題が発生する可能性があります：

1. INSERT操作に対しては、すべてのカラム（TOASTカラムを含む）が正しくレプリケートされます。

2. UPDATE操作に対しては：
   - TOASTカラムが変更されていない場合、その値はClickHouseでNULLまたは空として表示されます。
   - TOASTカラムが変更されている場合は、正しくレプリケートされます。

3. DELETE操作に対しては、TOASTカラムの値はClickHouseでNULLまたは空として表示されます。

これらの挙動は、PostgreSQLソースとClickHouse目的地間のデータ不整合を引き起こす可能性があります。したがって、TOASTカラムを持つテーブルに対して`REPLICA IDENTITY FULL`を設定することが、正確かつ完全なデータレプリケーションを確保するために重要です。

## Conclusion {#conclusion}

TOASTカラムを適切に処理することは、PostgreSQLからClickHouseへのレプリケーション時にデータ整合性を維持するために不可欠です。TOASTカラムを特定し、適切な`REPLICA IDENTITY`を設定することで、データが正確かつ完全にレプリケートされるようにできます。
