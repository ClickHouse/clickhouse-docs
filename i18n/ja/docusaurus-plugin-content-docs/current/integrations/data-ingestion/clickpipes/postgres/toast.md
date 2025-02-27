---
title: "ClickPipes for Postgres: TOASTカラムの処理"
description: PostgreSQLからClickHouseへのデータ複製時にTOASTカラムを扱う方法について学びます。
slug: /integrations/clickpipes/postgres/toast
---

PostgreSQLからClickHouseへのデータを複製する際には、TOAST (The Oversized-Attribute Storage Technique) カラムに関する制限と特別な考慮事項を理解することが重要です。このガイドでは、複製プロセスにおいてTOASTカラムを特定し、適切に処理する方法について説明します。

## PostgreSQLにおけるTOASTカラムとは？ {#what-are-toast-columns-in-postgresql}

TOAST (The Oversized-Attribute Storage Technique) は、PostgreSQLが大きなフィールド値を処理するためのメカニズムです。行が最大行サイズ（通常は2KBですが、PostgreSQLのバージョンや設定によって異なる場合があります）を超えると、PostgreSQLは自動的に大きなフィールド値を別のTOASTテーブルに移動し、メインテーブルにはポインタのみを保存します。

変更データキャプチャ (CDC) 中に、変更されていないTOASTカラムは複製ストリームに含まれないことに注意が必要です。これは、適切に処理されない場合、不完全なデータ複製につながる可能性があります。

最初のロード（スナップショット）時には、TOASTカラムを含め、すべてのカラム値がそのサイズに関係なく正しく複製されます。このガイドで説明する制限は、最初のロード後のCDCプロセスに主に影響します。

TOASTおよびそのPostgreSQLでの実装についての詳細は、こちらでご覧いただけます: https://www.postgresql.org/docs/current/storage-toast.html

## テーブル内のTOASTカラムの特定 {#identifying-toast-columns-in-a-table}

テーブルにTOASTカラムがあるかどうかを特定するには、以下のSQLクエリを使用できます。

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOASTされる可能性のあるカラムの名前とデータ型を返します。ただし、このクエリは、データ型とストレージ属性に基づいてTOASTストレージが適用されるカラムのみを識別することに注意が必要です。これらのカラムが実際にTOASTされたデータを含むかどうかを判断するには、これらのカラムの値がサイズを超えているかどうかを考慮する必要があります。データの実際のTOAST処理は、これらのカラムに保存されている特定の内容に依存します。

## TOASTカラムの正しい処理の確保 {#ensuring-proper-handling-of-toast-columns}

TOASTカラムが複製中に正しく処理されることを確保するためには、テーブルの `REPLICA IDENTITY` を `FULL` に設定する必要があります。これにより、PostgreSQLはUPDATEおよびDELETE操作のWALに完全な古い行を含め、すべてのカラム値（TOASTカラムを含む）が複製可能であることを保証します。

次のSQLコマンドを使用して `REPLICA IDENTITY` を `FULL` に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`を設定する際のパフォーマンスに関する考慮事項については、[こちらのブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## `REPLICA IDENTITY FULL`が設定されていない時の複製の動作 {#replication-behavior-when-replica-identity-full-is-not-set}

TOASTカラムを持つテーブルに `REPLICA IDENTITY FULL` が設定されていない場合、ClickHouseへの複製時に次の問題が発生することがあります。

1. INSERT操作の場合、すべてのカラム（TOASTカラムを含む）が正しく複製されます。

2. UPDATE操作の場合：
   - TOASTカラムが変更されていない場合、その値はClickHouseにNULLまたは空として表示されます。
   - TOASTカラムが変更された場合、正しく複製されます。

3. DELETE操作の場合、TOASTカラムの値はClickHouseにNULLまたは空として表示されます。

これらの動作により、PostgreSQLソースとClickHouse宛先との間でデータの不整合が生じる可能性があります。したがって、TOASTカラムを持つテーブルに対して `REPLICA IDENTITY FULL` を設定することが、正確かつ完全なデータ複製を確保するために重要です。

## 結論 {#conclusion}

TOASTカラムを適切に処理することは、PostgreSQLからClickHouseへの複製時にデータ整合性を維持するために不可欠です。TOASTカラムを特定し、適切な `REPLICA IDENTITY` を設定することにより、データが正確かつ完全に複製されることを確保できます。
