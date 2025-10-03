---
slug: '/faq/operations/delete-old-data'
title: 'ClickHouseテーブルから古いレコードを削除することは可能ですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouseテーブルから古いレコードを削除することが可能かどうかについて説明します。'
---




# 古いレコードを ClickHouse テーブルから削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い答えは「はい」です。ClickHouse には、古いデータを削除してディスクスペースを解放する複数のメカニズムがあります。それぞれのメカニズムは異なるシナリオを対象としています。

## TTL {#ttl}

ClickHouse は、特定の条件が発生したときに自動的に値を削除することを許可します。この条件は、通常は任意のタイムスタンプカラムに対して静的オフセットとして設定された式に基づいて構成されます。

このアプローチの主な利点は、TTL が構成された後、データの削除がバックグラウンドで自動的に行われるため、トリガー用の外部システムを必要としないことです。

:::note
TTL は、データを [/dev/null](https://en.wikipedia.org/wiki/Null_device) に移動するだけでなく、SSD から HDD などの異なるストレージシステム間で移動するためにも使用できます。
:::

[TTL の構成に関する詳細](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) は、ClickHouse で標準の DELETE クエリを実行できるようにします。フィルター句で指定された行は削除されたとしてマークされ、将来の結果セットから削除されます。行のクリーンアップは非同期で行われます。

:::note
DELETE FROM は、バージョン 23.3 以降から一般的に利用可能です。古いバージョンでは、実験的であり、次のように有効にする必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETE は、非同期のバッチ操作を使用して行を削除します。DELETE FROM とは異なり、ALTER DELETE の後、およびバッチ操作が完了する前に実行されたクエリには、削除対象の行が含まれます。詳細については、[ALTER DELETE](/sql-reference/statements/alter/delete.md) ドキュメントを参照してください。

`ALTER DELETE` は、古いデータを柔軟に削除するために発行できます。定期的に削除する必要がある場合、主な欠点はクエリを送信するために外部システムを持つ必要があることです。また、単一の行を削除するだけでも、変更によって完全なパーツが再書き込みされるため、パフォーマンス上の考慮点もあります。

これは、ClickHouse ベースのシステムを [GDPR](https://gdpr-info.eu) 準拠にするための最も一般的なアプローチです。

[変更](/sql-reference/statements/alter#mutations) に関する詳細。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` は、全体のパーティションを削除するコスト効率の良い方法を提供します。それほど柔軟ではなく、テーブル作成時に適切なパーティショニングスキームを設定する必要がありますが、一般的なケースのほとんどをカバーしています。定期的な使用のためには、外部システムから実行する必要があります。

[パーティションの操作に関する詳細](/sql-reference/statements/alter/partition)。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり過激ですが、場合によっては正にそれが必要な場合があります。

[テーブルのトランケートに関する詳細](/sql-reference/statements/truncate.md)。
