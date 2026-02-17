---
title: 'TOASTカラムの処理'
description: 'PostgreSQL から ClickHouse へデータをレプリケートする際の TOAST カラムの扱い方を説明します。'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

PostgreSQL から ClickHouse にデータをレプリケートする際には、TOAST（The Oversized-Attribute Storage Technique）カラムに関する制約や特有の注意点を理解しておくことが重要です。このガイドでは、レプリケーション処理において TOAST カラムを特定し、適切に扱う方法を説明します。

## PostgreSQL における TOAST カラムとは？ \{#what-are-toast-columns-in-postgresql\}

TOAST (The Oversized-Attribute Storage Technique) は、大きなフィールド値を扱うための PostgreSQL の仕組みです。1 行が最大行サイズ（通常は 2KB ですが、PostgreSQL のバージョンや具体的な設定によって異なる場合があります）を超えると、PostgreSQL は大きなフィールド値を自動的に別の TOAST テーブルに移動し、メインテーブルにはポインタだけを格納します。

CDC（変更データキャプチャ）の処理中には、変更されていない TOAST カラムはレプリケーションストリームに含まれない点に注意が必要です。これに適切に対処しないと、データレプリケーションが不完全になる可能性があります。

初期ロード（スナップショット）の際には、TOAST カラムを含むすべてのカラム値が、そのサイズに関係なく正しくレプリケートされます。本ガイドで説明する制限事項は、主に初期ロード後の継続的な CDC プロセスに影響します。

PostgreSQL における TOAST とその実装の詳細については、次を参照してください: https://www.postgresql.org/docs/current/storage-toast.html

## テーブル内の TOAST カラムの特定 \{#identifying-toast-columns-in-a-table\}

テーブルに TOAST カラムが含まれているかどうかを確認するには、次の SQL クエリを使用できます。

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOAST 化される可能性のあるカラム名とデータ型を返します。ただし、このクエリはデータ型とストレージ属性に基づいて、TOAST ストレージの対象となり得るカラムを特定するだけである点に注意してください。これらのカラムに実際に TOAST 化されたデータが含まれているかどうかを判断するには、これらのカラム内の値が所定のサイズ閾値を超えているかどうかを考慮する必要があります。実際に TOAST 化が行われるかどうかは、これらのカラムに格納されている具体的な内容に依存します。


## TOASTカラムを正しく処理するための設定 \{#ensuring-proper-handling-of-toast-columns\}

レプリケーション時に TOAST カラムが正しく処理されるようにするには、テーブルの `REPLICA IDENTITY` を `FULL` に設定する必要があります。これにより、PostgreSQL は UPDATE および DELETE 操作の際に WAL に古い行全体を含めるようになり、すべてのカラム値（TOAST カラムを含む）をレプリケーションで利用できるようになります。

次の SQL コマンドを使用して、`REPLICA IDENTITY` を `FULL` に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` を設定する際のパフォーマンス上の考慮事項については、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。


## REPLICA IDENTITY FULL が設定されていない場合のレプリケーション動作 \{#replication-behavior-when-replica-identity-full-is-not-set\}

TOAST カラムを含むテーブルに対して `REPLICA IDENTITY FULL` が設定されていない場合、ClickHouse へのレプリケーション時に次の問題が発生する可能性があります。

1. INSERT 操作では、すべてのカラム（TOAST カラムを含む）が正しくレプリケーションされます。

2. UPDATE 操作では:
   - TOAST カラムが変更されていない場合、その値は ClickHouse では NULL もしくは空値として表現されます。
   - TOAST カラムが変更された場合は、正しくレプリケーションされます。

3. DELETE 操作では、TOAST カラムの値は ClickHouse では NULL もしくは空値として表現されます。

これらの動作により、PostgreSQL 側のソースと ClickHouse 側のデスティネーションとの間でデータ不整合が発生する可能性があります。そのため、TOAST カラムを含むテーブルには `REPLICA IDENTITY FULL` を設定し、正確かつ完全なデータレプリケーションを確保することが重要です。

## まとめ \{#conclusion\}

PostgreSQL から ClickHouse へのレプリケーション時にデータの整合性を維持するためには、TOAST カラムを適切に扱うことが不可欠です。TOAST カラムを特定し、適切な `REPLICA IDENTITY` を設定することで、データを正確かつ完全な形で複製できます。