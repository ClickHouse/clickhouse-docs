---
slug: /faq/operations/delete-old-data
title: 'ClickHouse テーブルから古いレコードを削除できますか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouse テーブルから古いレコードを削除できるかどうかについて説明します'
doc_type: 'reference'
keywords: ['delete data', 'TTL', 'data retention', 'cleanup', 'data lifecycle']
---



# ClickHouseテーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

簡潔に答えると「はい」です。ClickHouseには、古いデータを削除してディスク容量を解放するための複数のメカニズムが用意されています。それぞれのメカニズムは異なるシナリオに対応しています。


## TTL {#ttl}

ClickHouseでは、特定の条件が満たされた際に値を自動的に削除できます。この条件は任意のカラムに基づく式として設定され、通常はタイムスタンプカラムに対する静的なオフセットとして指定されます。

このアプローチの主な利点は、外部システムによるトリガーが不要な点です。TTLを設定すれば、データの削除はバックグラウンドで自動的に実行されます。

:::note
TTLは、データを[/dev/null](https://en.wikipedia.org/wiki/Null_device)に移動するだけでなく、SSDからHDDへの移動など、異なるストレージシステム間でデータを移動する用途にも使用できます。
:::

詳細は[TTLの設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。


## DELETE FROM {#delete-from}

[DELETE FROM](/sql-reference/statements/delete.md)を使用すると、ClickHouseで標準的なDELETEクエリを実行できます。フィルタ句で対象となった行は削除済みとしてマークされ、以降の結果セットから除外されます。行のクリーンアップは非同期で行われます。

:::note
DELETE FROMはバージョン23.3以降で正式に利用可能です。それ以前のバージョンでは実験的機能であり、以下の設定で有効化する必要があります:

```sql
SET allow_experimental_lightweight_delete = true;
```

:::


## ALTER DELETE {#alter-delete}

ALTER DELETEは非同期バッチ操作を使用して行を削除します。DELETE FROMとは異なり、ALTER DELETEの実行後、バッチ操作が完了する前に実行されるクエリには、削除対象の行が含まれます。詳細については、[ALTER DELETE](/sql-reference/statements/alter/delete.md)のドキュメントを参照してください。

`ALTER DELETE`を使用すると、古いデータを柔軟に削除できます。定期的に実行する必要がある場合、主な欠点は、クエリを送信するための外部システムが必要になることです。また、ミューテーションは削除対象の行が1行のみの場合でも、パート全体を書き換えるため、パフォーマンス上の考慮事項があります。

これは、ClickHouseベースのシステムを[GDPR](https://gdpr-info.eu)準拠にするための最も一般的なアプローチです。

[ミューテーション](/sql-reference/statements/alter#mutations)の詳細については、こちらを参照してください。


## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION`は、パーティション全体を削除するコスト効率の良い方法を提供します。柔軟性はそれほど高くありませんが、テーブル作成時に適切なパーティショニングスキームを設定しておけば、最も一般的なケースをカバーできます。ミューテーションと同様に、定期的な使用には外部システムからの実行が必要です。

詳細は[パーティションの操作](/sql-reference/statements/alter/partition)を参照してください。


## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのは極端な方法ですが、状況によってはまさに必要な操作となる場合があります。

詳細は[テーブルのTRUNCATE](/sql-reference/statements/truncate.md)を参照してください。
