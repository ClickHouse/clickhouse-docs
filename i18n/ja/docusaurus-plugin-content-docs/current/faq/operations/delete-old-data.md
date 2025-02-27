---
slug: /faq/operations/delete-old-data
title: ClickHouseテーブルから古いレコードを削除することは可能ですか？
toc_hidden: true
toc_priority: 20
---

# ClickHouseテーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い答えは「はい」です」。ClickHouseは古いデータを削除することでディスクスペースを解放するための複数のメカニズムを提供しています。各メカニズムは異なるシナリオに対して目的とされています。

## 有効期限 (TTL) {#ttl}

ClickHouseは、特定の条件が発生したときに自動的に値を削除することを許可します。この条件は、通常は任意のタイムスタンプカラムに対する静的オフセットとして構成された式に基づいて設定されます。

このアプローチの主な利点は、TTLが設定されると、データの削除が自動的にバックグラウンドで行われるため、外部システムをトリガーする必要がないことです。

:::note
TTLは、データを[/dev/null](https://en.wikipedia.org/wiki/Null_device)に移動するだけでなく、SSDからHDDなど異なるストレージシステム間で移動するためにも使用できます。
:::

[TTLの設定についての詳細はこちら](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md) は、ClickHouseで標準のDELETEクエリを実行可能にします。フィルター句でターゲットにされた行は削除済みとしてマークされ、今後の結果セットから削除されます。行のクリーンアップは非同期で行われます。

:::note
DELETE FROMは一般的にはバージョン23.3以降で利用可能です。古いバージョンでは実験的であり、次のように有効化する必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETEは、非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの後に実行されたクエリは、削除対象の行を含む結果となります。詳細については、[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`は、古いデータを柔軟に削除するために使用できます。定期的に行う必要がある場合の主な欠点は、クエリを送信するために外部システムを必要とすることです。また、1行だけ削除する場合でも、変異が全パーツを再書き込みするため、いくつかのパフォーマンスの考慮が必要です。

これは、ClickHouseに基づいたシステムを[GDPR](https://gdpr-info.eu)準拠にするための最も一般的なアプローチです。

[変異についての詳細はこちら](../../sql-reference/statements/alter/index.md#alter-mutations)。

## パーティションを削除 {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。これはあまり柔軟ではなく、テーブル作成時に適切なパーティショニングスキームが設定される必要がありますが、ほとんどの一般的なケースをカバーします。定期的に使用するためには、外部システムから実行する必要があります。

[パーティションの操作についての詳細はこちら](../../sql-reference/statements/alter/partition.md#alter_drop-partition)。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり過激ですが、場合によっては正に必要な操作かもしれません。

[テーブルのトランケートについての詳細はこちら](/sql-reference/statements/truncate.md)。
