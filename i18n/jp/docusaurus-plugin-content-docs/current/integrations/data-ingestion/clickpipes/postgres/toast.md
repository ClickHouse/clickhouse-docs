---
title: 'TOAST カラムの処理'
description: 'PostgreSQL から ClickHouse へデータをレプリケーションする際の TOAST カラムの処理方法を学びましょう。'
slug: /integrations/clickpipes/postgres/toast
---
```

When replicating data from PostgreSQL to ClickHouse, it's important to understand the limitations and special considerations for TOAST (The Oversized-Attribute Storage Technique) columns. This guide will help you identify and properly handle TOAST columns in your replication process.

## PostgreSQL における TOAST カラムとは何か？ {#what-are-toast-columns-in-postgresql}

TOAST (The Oversized-Attribute Storage Technique) は、PostgreSQL における大きなフィールド値を処理するためのメカニズムです。行が最大行サイズ (通常は 2KB ですが、PostgreSQL のバージョンや設定によって異なる場合があります) を超えると、PostgreSQL は自動的に大きなフィールド値を別の TOAST テーブルに移動し、主テーブルにはポインタのみを保存します。

重要な点は、Change Data Capture (CDC) 中に、変更されていない TOAST カラムはレプリケーションストリームに含まれないことです。これにより、適切に処理しないと不完全なデータレプリケーションが発生する可能性があります。

初回ロード (スナップショット) 中は、TOAST カラムを含むすべてのカラム値がそのサイズに関係なく正しくレプリケートされます。このガイドで説明する制限は、初回ロード後の継続的な CDC プロセスに主に影響します。

TOAST とその実装に関する詳細は、こちらでご覧いただけます: https://www.postgresql.org/docs/current/storage-toast.html

## テーブルにおける TOAST カラムの特定 {#identifying-toast-columns-in-a-table}

テーブルに TOAST カラムがあるかどうかを特定するには、以下の SQL クエリを使用できます。

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOAST される可能性のあるカラムの名前とデータ型を返します。ただし、このクエリはデータ型とストレージ属性に基づいて TOAST ストレージに適格なカラムのみを特定するものであることに注意してください。これらのカラムが実際に TOAST されたデータを含むかどうかを判断するには、これらのカラムに格納されている値がサイズを超えているかどうかを考慮する必要があります。データの実際の TOAST 化は、これらのカラムに格納されている特定の内容に依存します。

## TOAST カラムの適切な処理を確保する {#ensuring-proper-handling-of-toast-columns}

TOAST カラムがレプリケーション中に正しく処理されるようにするには、テーブルの `REPLICA IDENTITY` を `FULL` に設定する必要があります。これにより、PostgreSQL は UPDATE および DELETE 操作用の WAL に完全な古い行を含めるため、すべてのカラム値 (TOAST カラムを含む) がレプリケーションに利用可能になります。

次の SQL コマンドを使用して `REPLICA IDENTITY` を `FULL` に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` を設定する際のパフォーマンスについては、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## `REPLICA IDENTITY FULL` が設定されていない場合のレプリケーション動作 {#replication-behavior-when-replica-identity-full-is-not-set}

TOAST カラムを持つテーブルに対して `REPLICA IDENTITY FULL` が設定されていない場合、ClickHouse にレプリケーションする際に以下の問題が発生する可能性があります：

1. INSERT 操作の場合、すべてのカラム (TOAST カラムを含む) が正しくレプリケートされます。

2. UPDATE 操作の場合：
   - TOAST カラムが変更されていない場合、その値は ClickHouse で NULL または空として表示されます。
   - TOAST カラムが変更された場合、その値は正しくレプリケートされます。

3. DELETE 操作の場合、TOAST カラムの値は ClickHouse で NULL または空として表示されます。

これらの動作は、PostgreSQL ソースと ClickHouse 先のデータの不整合を引き起こす可能性があります。したがって、TOAST カラムを含むテーブルについては、正確で完全なデータレプリケーションを保証するために `REPLICA IDENTITY FULL` を設定することが重要です。

## 結論 {#conclusion}

TOAST カラムを適切に処理することは、PostgreSQL から ClickHouse へレプリケーションする際にデータの整合性を維持するために欠かせません。TOAST カラムを特定し、適切な `REPLICA IDENTITY` を設定することで、データが正確かつ完全にレプリケートされることを保証できます。
