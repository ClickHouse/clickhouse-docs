---
slug: /faq/operations/delete-old-data
title: 'ClickHouseのテーブルから古いレコードを削除することは可能ですか？'
toc_hidden: true
toc_priority: 20
description: 'このページは、ClickHouseのテーブルから古いレコードを削除することが可能かどうかについての質問に答えます'
---


# ClickHouseのテーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い答えは「はい」です」。ClickHouseには、古いデータを削除することでディスクスペースを解放するための複数のメカニズムがあります。それぞれのメカニズムは異なるシナリオに向けられています。

## TTL {#ttl}

ClickHouseは、特定の条件が発生したときに自動的に値を削除することを許可します。この条件は、通常は任意のタイムスタンプカラムに対する静的オフセットに基づいた式として構成されます。

このアプローチの主要な利点は、TTLが設定されると、データの削除が自動的にバックグラウンドで発生するため、外部システムをトリガーする必要がないことです。

:::note
TTLは、データを [/dev/null](https://en.wikipedia.org/wiki/Null_device) に移動するだけでなく、SSDからHDDなど異なるストレージシステム間で移動するためにも使用できます。
:::

[TTLの構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)に関する詳細です。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md)を使用すると、ClickHouseで標準のDELETEクエリを実行できます。フィルター句でターゲットにした行は削除としてマークされ、今後の結果セットから削除されます。行のクリーンアップは非同期的に行われます。

:::note
DELETE FROMは、バージョン23.3以降で一般的に利用可能です。古いバージョンでは、これは実験的で、次のように有効にする必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETEは、非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの後に実行されたクエリとバッチ操作が完了する前のクエリには、削除対象の行が含まれます。詳しい情報は[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`は古いデータを柔軟に削除するために発行できます。これを定期的に行う必要がある場合、主な欠点はクエリを送信するための外部システムが必要であることです。また、単一の行だけを削除する場合でも、マイナスも全パーツを再書き込みするため、パフォーマンスに関する考慮事項もあります。

これは、ClickHouseベースのシステムを[GDPR](https://gdpr-info.eu)準拠にするための最も一般的なアプローチです。

[変更](/sql-reference/statements/alter#mutations)に関する詳細です。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、パーティション全体を削除するための費用対効果の高い方法を提供します。それはそれほど柔軟ではなく、テーブル作成時に適切なパーティショニングスキームを構成する必要がありますが、ほとんどの一般的なケースをカバーしています。変更は、一般的な使用のために外部システムから実行する必要があります。

[パーティションの操作](/sql-reference/statements/alter/partition)に関する詳細です。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除することはかなり過激ですが、場合によっては正にそれが必要なことかもしれません。

[テーブルの切り詰め](/sql-reference/statements/truncate.md)に関する詳細です。
