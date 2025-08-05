---
title: 'TOASTカラムの処理'
description: 'PostgreSQLからClickHouseへデータをレプリケートする際にTOASTカラムの処理方法を学びます。'
slug: '/integrations/clickpipes/postgres/toast'
---



When replicating data from PostgreSQL to ClickHouse, it's important to understand the limitations and special considerations for TOAST (The Oversized-Attribute Storage Technique) columns. This guide will help you identify and properly handle TOAST columns in your replication process.

## What are TOAST columns in PostgreSQL? {#what-are-toast-columns-in-postgresql}

TOAST (The Oversized-Attribute Storage Technique)は、PostgreSQLにおける大きなフィールド値を処理するためのメカニズムです。行が最大行サイズ（通常は2KBですが、PostgreSQLのバージョンと正確な設定に応じて異なる場合があります）を超えると、PostgreSQLは自動的に大きなフィールド値を別のTOASTテーブルに移動し、主テーブルにはポインタのみを保存します。

重要なのは、Change Data Capture（CDC）中に、変更されていないTOASTカラムはレプリケーションストリームに含まれないことです。これにより、適切に処理されないと不完全なデータレプリケーションが発生する可能性があります。

初回のロード（スナップショット）中は、TOASTカラムを含むすべてのカラム値が、そのサイズに関係なく正しくレプリケートされます。本ガイドで説明する制限は、初回のロード後の継続的なCDCプロセスに主に影響を及ぼします。

TOASTおよびその実装に関する詳細は、こちらで読むことができます: https://www.postgresql.org/docs/current/storage-toast.html

## Identifying TOAST columns in a table {#identifying-toast-columns-in-a-table}

テーブルにTOASTカラムがあるかどうかを識別するには、次のSQLクエリを使用できます。

```sql
SELECT a.attname, pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'your_table_name'
  AND a.attlen = -1
  AND a.attstorage != 'p'
  AND a.attnum > 0;
```

このクエリは、TOASTされる可能性のあるカラムの名前とデータタイプを返します。ただし、このクエリは、データタイプとストレージ属性に基づいてTOASTストレージの対象となるカラムのみを識別することに注意することが重要です。これらのカラムが実際にTOASTされたデータを含むかどうかを判断するには、これらのカラムの値がサイズを超えているかどうかを考慮する必要があります。データの実際のTOASTは、これらのカラムに格納されている具体的な内容によります。

## Ensuring proper handling of TOAST columns {#ensuring-proper-handling-of-toast-columns}

レプリケーション中にTOASTカラムが正しく処理されることを保証するために、テーブルの`REPLICA IDENTITY`を`FULL`に設定する必要があります。これにより、PostgreSQLはUPDATEおよびDELETE操作のためにWALに古い行全体を含めるようになりますので、すべてのカラム値（TOASTカラムを含む）がレプリケーションに利用可能になります。

次のSQLコマンドを使用して、`REPLICA IDENTITY`を`FULL`に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`を設定する際のパフォーマンス考慮については、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## Replication behavior when REPLICA IDENTITY FULL is not set {#replication-behavior-when-replica-identity-full-is-not-set}

`REPLICA IDENTITY FULL`が設定されていないTOASTカラムを持つテーブルの場合、ClickHouseへのレプリケーション中に次のような問題が発生する可能性があります。

1. INSERT操作の場合、すべてのカラム（TOASTカラムを含む）が正しくレプリケートされます。

2. UPDATE操作の場合:
   - TOASTカラムが変更されていない場合、その値はClickHouseでNULLまたは空として表示されます。
   - TOASTカラムが変更された場合、正しくレプリケートされます。

3. DELETE操作の場合、TOASTカラムの値はClickHouseでNULLまたは空として表示されます。

これらの動作は、PostgreSQLのソースとClickHouseのデスティネーション間でデータの不整合を引き起こす可能性があります。したがって、TOASTカラムを持つテーブルに対して`REPLICA IDENTITY FULL`を設定することが、正確で完全なデータレプリケーションを保障するために重要です。

## Conclusion {#conclusion}

TOASTカラムを適切に処理することは、PostgreSQLからClickHouseへのレプリケーション時にデータの整合性を維持するために不可欠です。TOASTカラムを識別し、適切な`REPLICA IDENTITY`を設定することで、データが正確かつ完全にレプリケートされることを確認できます。
