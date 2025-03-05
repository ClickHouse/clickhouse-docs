---
slug: /faq/operations/delete-old-data
title: ClickHouseのテーブルから古いレコードを削除することは可能ですか？
toc_hidden: true
toc_priority: 20
---


# ClickHouseのテーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い回答は「はい」です」。ClickHouseには古いデータを削除してディスクスペースを解放する複数のメカニズムがあります。各メカニズムは異なるシナリオに対して設計されています。

## TTL {#ttl}

ClickHouseでは、特定の条件が発生したときに自動的に値を削除することができます。この条件は、通常は任意のタイムスタンプカラムに対する静的オフセットに基づく式として構成されます。

このアプローチの主な利点は、TTLが設定されると、データの削除はバックグラウンドで自動的に行われるため、外部システムをトリガーする必要がないことです。

:::note
TTLは、データを[/dev/null](https://en.wikipedia.org/wiki/Null_device)に移動するだけでなく、SSDからHDDなどの異なるストレージシステム間で移動するためにも使用できます。
:::

[TTLの構成に関する詳細はこちら](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## DELETE FROM {#delete-from}
[DELETE FROM](/sql-reference/statements/delete.md)は、ClickHouseで標準のDELETEクエリを実行することを可能にします。フィルター句でターゲットにされた行は削除としてマークされ、今後の結果セットから除外されます。行のクリーンアップは非同期で行われます。

:::note
DELETE FROMは、バージョン23.3以降で一般的に利用可能です。古いバージョンでは、実験的であり、以下のように有効にする必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETEは非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの後に実行され、バッチ操作が完了する前に実行されるクエリは、削除対象の行を含みます。詳細については、[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`は古いデータを柔軟に削除するために発行できます。定期的に行う必要がある場合、主な欠点はクエリを送信するための外部システムが必要なことです。また、単一の行を削除する場合でも、突然変異により完全なパーツが再書き込みされるため、パフォーマンス上の考慮事項もあります。

これは、ClickHouseに基づくシステムを[GDPR](https://gdpr-info.eu)に準拠させるための最も一般的なアプローチです。

[突然変異に関する詳細はこちら](/sql-reference/statements/alter#mutations)。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。柔軟性は高くなく、テーブル作成時に適切なパーティショニングスキームが構成される必要がありますが、ほとんどの一般的なケースをカバーします。通常の使用のためには、外部システムから実行する必要があります。

[パーティションの操作に関する詳細はこちら](/sql-reference/statements/alter/partition)。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり過激ですが、場合によってはそれが必要なこともあります。

[テーブルの切り捨てに関する詳細はこちら](/sql-reference/statements/truncate.md)。
