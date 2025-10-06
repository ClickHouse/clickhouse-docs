---
'slug': '/faq/operations/delete-old-data'
'title': '古いレコードを ClickHouse テーブルから削除することは可能ですか？'
'toc_hidden': true
'toc_priority': 20
'description': 'このページでは、古いレコードを ClickHouse テーブルから削除することが可能かどうかの質問に回答します。'
'doc_type': 'reference'
---


# 古いレコードをClickHouseテーブルから削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

短い答えは「はい」です」。ClickHouseは古いデータを削除することによってディスクスペースを解放する複数のメカニズムを持っています。各メカニズムは異なるシナリオに対して設計されています。

## TTL {#ttl}

ClickHouseは、特定の条件が発生した時に自動的に値を削除することを許可します。この条件は、通常は任意のタイムスタンプカラムの静的オフセットに基づく式として構成されます。

このアプローチの主な利点は、TTLが設定されるとデータの削除がバックグラウンドで自動的に行われるため、外部システムをトリガーとして使用する必要がないことです。

:::note
TTLはデータを[/dev/null](https://en.wikipedia.org/wiki/Null_device)に移動するだけでなく、SSDからHDDなど異なるストレージシステム間で移動するためにも使用できます。
:::

[TTLの構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)についての詳細。

## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md)は、ClickHouseで標準のDELETEクエリを実行することを可能にします。フィルター句でターゲットにされた行は削除されたとマークされ、将来の結果セットからは削除されます。行のクリーンアップは非同期的に行われます。

:::note
DELETE FROMはバージョン23.3以降で一般的に利用可能です。古いバージョンでは、これは実験的であり、次のように有効にする必要があります：
```sql
SET allow_experimental_lightweight_delete = true;
```
:::

## ALTER DELETE {#alter-delete}

ALTER DELETEは、非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの後に実行されたクエリは、バッチ操作の完了前に削除対象の行を含みます。詳細は[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`は古いデータを柔軟に削除するために発行できます。定期的に行う必要がある場合の主な欠点は、クエリを送信するために外部システムが必要になることです。また、単一の行を削除する場合でも、変異によって完全なパーツが書き換えられるため、パフォーマンスの考慮事項もあります。

これはClickHouseに基づくシステムが[GDPR](https://gdpr-info.eu)に準拠するための最も一般的なアプローチです。

[変異](https://sql-reference/statements/alter#mutations)の詳細について。

## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、全体のパーティションを削除するためのコスト効率の良い方法を提供します。これはそれほど柔軟ではなく、テーブル作成時に適切なパーティショニングスキームが構成される必要がありますが、ほとんどの一般的なケースをカバーしています。変異は定期的に使用するために外部システムから実行する必要があります。

[パーティションの操作](https://sql-reference/statements/alter/partition)についての詳細。

## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり過激ですが、場合によっては正に必要なことかもしれません。

[テーブルのトランケーション](https://sql-reference/statements/truncate.md)の詳細について。
