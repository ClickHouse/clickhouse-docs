---
title: 'TOAST 列の扱い方'
description: 'PostgreSQL から ClickHouse へデータをレプリケートする際の TOAST 列の扱い方を学びます。'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

PostgreSQL から ClickHouse へデータをレプリケートする場合、TOAST（The Oversized-Attribute Storage Technique）列に関する制限事項および特有の考慮事項を理解しておくことが重要です。本ガイドでは、レプリケーション処理において TOAST 列を特定し、適切に扱う方法を解説します。

## PostgreSQL における TOAST カラムとは何ですか？ {#what-are-toast-columns-in-postgresql}

TOAST（The Oversized-Attribute Storage Technique）は、大きなフィールド値を扱うための PostgreSQL の仕組みです。1 行のサイズが最大行サイズ（通常は 2KB 程度ですが、PostgreSQL のバージョンや設定によって異なる場合があります）を超えると、PostgreSQL は大きなフィールド値を自動的に別の TOAST テーブルに移動し、メインテーブル内にはポインタのみを保持します。

CDC（変更データキャプチャ）の実行中、変更されていない TOAST カラムはレプリケーションストリームに含まれないことに注意が必要です。これに適切に対処しないと、不完全なデータレプリケーションにつながる可能性があります。

初回ロード（スナップショット）の際には、TOAST カラムを含むすべてのカラム値が、そのサイズに関係なく正しくレプリケーションされます。このガイドで説明している制限は、主に初回ロード後の継続的な CDC 処理に影響します。

TOAST とその PostgreSQL における実装の詳細については、こちらを参照してください: https://www.postgresql.org/docs/current/storage-toast.html

## テーブル内の TOAST 列を特定する {#identifying-toast-columns-in-a-table}

テーブルに TOAST 列が含まれているかどうかを確認するには、以下の SQL クエリを使用できます。

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOAST 化される可能性のある列の名前とデータ型を返します。ただし、このクエリはデータ型とストレージ属性に基づいて、TOAST ストレージの対象となりうる列だけを特定している点に注意が必要です。これらの列に実際に TOAST 化されたデータが含まれているかどうかを判断するには、これらの列の値が所定のサイズを超えているかどうかを確認する必要があります。実際にデータが TOAST 化されるかどうかは、これらの列に保存されている具体的な内容に依存します。

## TOAST 列が正しく処理されるようにする {#ensuring-proper-handling-of-toast-columns}

レプリケーション中に TOAST 列が正しく処理されるようにするには、テーブルの `REPLICA IDENTITY` を `FULL` に設定する必要があります。これにより、PostgreSQL は UPDATE および DELETE 操作の際に古い行全体を WAL に含めるようになり、すべての列の値（TOAST 列を含む）がレプリケーションで利用可能であることが保証されます。

次の SQL コマンドを使用して、`REPLICA IDENTITY` を `FULL` に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` を設定する際のパフォーマンス上の考慮点については、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## REPLICA IDENTITY FULL が設定されていない場合のレプリケーション動作 {#replication-behavior-when-replica-identity-full-is-not-set}

TOAST カラムを持つテーブルに対して `REPLICA IDENTITY FULL` が設定されていない場合、ClickHouse へのレプリケーション時に次のような問題が発生する可能性があります。

1. INSERT 操作では、すべてのカラム（TOAST カラムを含む）が正しくレプリケートされます。

2. UPDATE 操作では:
   - TOAST カラムが変更されていない場合、その値は ClickHouse 上では NULL または空値として扱われます。
   - TOAST カラムが変更された場合、その値は正しくレプリケートされます。

3. DELETE 操作では、TOAST カラムの値は ClickHouse 上では NULL または空値として扱われます。

これらの動作が原因で、PostgreSQL のソースと ClickHouse のレプリケーション先との間でデータ不整合が発生する可能性があります。したがって、TOAST カラムを持つテーブルには、正確かつ完全なデータレプリケーションを行うために `REPLICA IDENTITY FULL` を設定することが重要です。

## まとめ {#conclusion}

PostgreSQL から ClickHouse へのレプリケーション時にデータの整合性を維持するには、TOAST 列を適切に扱うことが不可欠です。TOAST 列を特定し、適切な `REPLICA IDENTITY` を設定することで、データを正確かつ完全にレプリケーションできるようになります。
