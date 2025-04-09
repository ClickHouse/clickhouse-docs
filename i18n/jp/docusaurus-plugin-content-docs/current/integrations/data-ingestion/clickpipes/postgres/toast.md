---
title: "ClickPipes for Postgres: TOASTカラムの取り扱い"
description: PostgreSQLからClickHouseにデータをレプリケーションする際のTOASTカラムの取り扱いについて学びます。
slug: /integrations/clickpipes/postgres/toast
---

PostgreSQLからClickHouseにデータをレプリケーションする際、TOAST（The Oversized-Attribute Storage Technique）カラムの制限や特別な考慮事項を理解することが重要です。このガイドでは、レプリケーションプロセスにおけるTOASTカラムの識別と適切な取り扱いについて説明します。

## PostgreSQLにおけるTOASTカラムとは？ {#what-are-toast-columns-in-postgresql}

TOAST（The Oversized-Attribute Storage Technique）は、PostgreSQLが大きなフィールド値を処理するためのメカニズムです。行が最大行サイズ（通常は2KBですが、PostgreSQLのバージョンや設定により異なる場合があります）を超えると、PostgreSQLは自動的に大きなフィールド値を別のTOASTテーブルに移動し、メインテーブルにはポインタのみを格納します。

Change Data Capture（CDC）の際には、変更されていないTOASTカラムはレプリケーションストリームに含まれないことに注意が必要です。これは、適切に処理しないと不完全なデータレプリケーションを引き起こす可能性があります。

初回ロード（スナップショット）時には、TOASTカラムを含むすべてのカラム値がそのサイズに関係なく正しくレプリケートされます。このガイドで説明される制限は、初回ロード後の継続的なCDCプロセスに主に影響します。

TOASTおよびその実装に関する詳細は、こちらをご覧ください: https://www.postgresql.org/docs/current/storage-toast.html

## テーブルのTOASTカラムの識別 {#identifying-toast-columns-in-a-table}

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

このクエリは、TOASTされる可能性のあるカラムの名前とデータ型を返します。ただし、このクエリはデータ型およびストレージ属性に基づいてTOASTストレージの対象となるカラムのみを識別することに注意してください。これらのカラムが実際にTOASTされたデータを含むかどうかを判断するには、これらのカラムの値がサイズを超えているかどうかを考慮する必要があります。データの実際のTOAST化は、これらのカラムに格納された具体的な内容に依存します。

## TOASTカラムの適切な取り扱いを確保する {#ensuring-proper-handling-of-toast-columns}

レプリケーション中にTOASTカラムが正しく処理されるようにするためには、テーブルの`REPLICA IDENTITY`を`FULL`に設定する必要があります。これにより、PostgreSQLはUPDATEおよびDELETE操作のためにWALに完全な古い行を含めることができるため、すべてのカラム値（TOASTカラムを含む）がレプリケーションに利用可能になります。

次のSQLコマンドを使用して`REPLICA IDENTITY`を`FULL`に設定できます。

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL`を設定する際のパフォーマンスに関する考察は、[このブログ記事](https://xata.io/blog/replica-identity-full-performance)を参照してください。

## `REPLICA IDENTITY FULL`が設定されていない場合のレプリケーションの挙動 {#replication-behavior-when-replica-identity-full-is-not-set}

TOASTカラムを持つテーブルに対して`REPLICA IDENTITY FULL`が設定されていない場合、ClickHouseへのレプリケーション時に以下の問題が発生する可能性があります。

1. INSERT操作の場合、すべてのカラム（TOASTカラムを含む）が正しくレプリケートされます。

2. UPDATE操作の場合:
   - TOASTカラムが変更されない場合、その値はClickHouseでNULLまたは空として表示されます。
   - TOASTカラムが変更された場合、正しくレプリケートされます。

3. DELETE操作の場合、TOASTカラムの値はClickHouseでNULLまたは空として表示されます。

これらの挙動は、PostgreSQLのソースとClickHouseの宛先の間にデータ不整合を引き起こす可能性があります。したがって、TOASTカラムを持つテーブルについては、正確かつ完全なデータレプリケーションを確保するために`REPLICA IDENTITY FULL`を設定することが重要です。

## 結論 {#conclusion}

TOASTカラムを適切に扱うことは、PostgreSQLからClickHouseにレプリケートする際のデータ整合性を維持するために不可欠です。TOASTカラムを識別し、適切な`REPLICA IDENTITY`を設定することで、データが正確かつ完全にレプリケートされることを保証できます。
