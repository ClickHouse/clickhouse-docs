---
slug: /faq/operations/delete-old-data
title: ClickHouseのテーブルから古いレコードを削除することは可能ですか？
toc_hidden: true
toc_priority: 20
---


# ClickHouseのテーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い答えは「はい」です。ClickHouseには古いデータを削除することでディスクスペースを解放するための複数のメカニズムがあります。各メカニズムは異なるシナリオに向けられています。

## 有効期限 (TTL) {#ttl}

ClickHouseは、特定の条件が発生したときに自動的に値をドロップすることを許可します。この条件は、通常は任意のタイムスタンプカラムの静的オフセットに基づく式として構成されます。

このアプローチの重要な利点は、TTLが構成されると、外部システムをトリガする必要がなく、データの削除がバックグラウンドで自動的に発生することです。

:::note
TTLは、データを[/dev/null](https://en.wikipedia.org/wiki/Null_device)に移動するだけでなく、SSDからHDDなど異なるストレージシステム間で移動するためにも使用できます。
:::

[TTLの構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)についての詳細。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md)は、ClickHouseで標準的なDELETEクエリを実行することを可能にします。フィルター句で対象となる行は削除されたとしてマークされ、今後の結果セットから除外されます。行のクリーンアップは非同期で行われます。

:::note
DELETE FROMは、バージョン23.3以降で一般提供されます。古いバージョンでは、実験的であり、以下のように有効化する必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETEは、非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの後に実行され、バッチ操作が完了する前のクエリには削除対象の行が含まれます。詳細については、[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`を発行することで、柔軟に古いデータを削除できます。定期的に行う必要がある場合、主な欠点はクエリを送信するための外部システムが必要なことです。また、単一の行を削除するだけの場合でも、変異により完全なパーツが再書き換えられるため、パフォーマンスに関する考慮事項もあります。

これが、ClickHouseを基盤としたシステムを[GDPR](https://gdpr-info.eu)-準拠にするための一般的なアプローチです。

[変異についての詳細](../../sql-reference/statements/alter/index.md#alter-mutations)。

## パーティションの削除 {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、パーティション全体を削除するためのコスト効率の良い方法を提供します。柔軟性はあまりなく、テーブル作成時に適切なパーティショニングスキームが構成される必要がありますが、それでも最も一般的なケースをカバーします。一般的な使用のためには、変異も外部システムから実行する必要があります。

[パーティションの操作に関する詳細](../../sql-reference/statements/alter/partition.md#alter_drop-partition)。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり過激ですが、場合によってはちょうど必要なことかもしれません。

[テーブルの切り捨てについての詳細](/sql-reference/statements/truncate.md)。
