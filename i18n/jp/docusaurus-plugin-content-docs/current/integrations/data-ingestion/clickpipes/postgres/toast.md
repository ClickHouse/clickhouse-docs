---
title: 'TOAST カラムの扱い方'
description: 'PostgreSQL から ClickHouse へのデータレプリケーション時における TOAST カラムの扱い方を学びます。'
slug: /integrations/clickpipes/postgres/toast
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

PostgreSQL から ClickHouse へデータをレプリケーションする際には、TOAST (The Oversized-Attribute Storage Technique) カラムに関する制限事項と特別な考慮点を理解しておくことが重要です。本ガイドでは、レプリケーション処理において TOAST カラムを特定し、適切に扱う方法を説明します。



## PostgreSQLのTOASTカラムとは？ {#what-are-toast-columns-in-postgresql}

TOAST（The Oversized-Attribute Storage Technique）は、PostgreSQLで大きなフィールド値を扱うための仕組みです。行が最大行サイズ（通常は2KBですが、PostgreSQLのバージョンや設定によって異なります）を超えると、PostgreSQLは自動的に大きなフィールド値を別のTOASTテーブルに移動し、メインテーブルにはポインタのみを保存します。

変更データキャプチャ（CDC）では、変更されていないTOASTカラムはレプリケーションストリームに含まれない点に注意が必要です。適切に処理しないと、データレプリケーションが不完全になる可能性があります。

初期ロード（スナップショット）時には、TOASTカラムを含むすべてのカラム値がサイズに関係なく正しくレプリケートされます。本ガイドで説明する制限は、主に初期ロード後の継続的なCDCプロセスに影響します。

TOASTとそのPostgreSQLでの実装の詳細については、以下を参照してください：https://www.postgresql.org/docs/current/storage-toast.html


## テーブル内のTOASTカラムの特定 {#identifying-toast-columns-in-a-table}

テーブルにTOASTカラムが存在するかどうかを特定するには、以下のSQLクエリを使用します：

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOAST化される可能性のあるカラムの名前とデータ型を返します。ただし、このクエリはデータ型とストレージ属性に基づいてTOASTストレージの対象となるカラムを識別するのみであることに注意してください。これらのカラムに実際にTOAST化されたデータが含まれているかどうかを判断するには、カラム内の値がサイズ制限を超えているかどうかを確認する必要があります。データが実際にTOAST化されるかどうかは、これらのカラムに格納されている具体的な内容に依存します。


## TOAST列の適切な処理の確保 {#ensuring-proper-handling-of-toast-columns}

レプリケーション中にTOAST列が正しく処理されるようにするには、テーブルの`REPLICA IDENTITY`を`FULL`に設定する必要があります。これにより、PostgreSQLはUPDATEおよびDELETE操作時にWALに完全な古い行を含めるようになり、すべての列の値(TOAST列を含む)がレプリケーションで利用可能になることが保証されます。

次のSQLコマンドを使用して、`REPLICA IDENTITY`を`FULL`に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`を設定する際のパフォーマンスに関する考慮事項については、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。


## REPLICA IDENTITY FULLが設定されていない場合のレプリケーション動作 {#replication-behavior-when-replica-identity-full-is-not-set}

TOASTカラムを持つテーブルに`REPLICA IDENTITY FULL`が設定されていない場合、ClickHouseへのレプリケーション時に以下の問題が発生する可能性があります：

1. INSERT操作の場合、すべてのカラム（TOASTカラムを含む）は正しくレプリケートされます。

2. UPDATE操作の場合：
   - TOASTカラムが変更されていない場合、その値はClickHouseでNULLまたは空として表示されます。
   - TOASTカラムが変更されている場合、正しくレプリケートされます。

3. DELETE操作の場合、TOASTカラムの値はClickHouseでNULLまたは空として表示されます。

これらの動作により、PostgreSQLのソースとClickHouseの宛先の間でデータの不整合が発生する可能性があります。したがって、正確かつ完全なデータレプリケーションを確保するために、TOASTカラムを持つテーブルには`REPLICA IDENTITY FULL`を設定することが重要です。


## まとめ {#conclusion}

PostgreSQLからClickHouseへレプリケーションを行う際、データ整合性を維持するにはTOASTカラムの適切な処理が不可欠です。TOASTカラムを特定し、適切な`REPLICA IDENTITY`を設定することで、データが正確かつ完全にレプリケートされることを保証できます。
