---
slug: /faq/operations/delete-old-data
title: 'ClickHouse テーブルから古いレコードを削除できますか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouse テーブルから古いレコードを削除できるかどうかについて説明します'
doc_type: 'reference'
keywords: ['データ削除', 'TTL', 'データ保持', 'クリーンアップ', 'データライフサイクル']
---



# ClickHouse テーブルから古いレコードを削除することは可能ですか？ {#is-it-possible-to-delete-old-records-from-a-clickhouse-table}

簡潔に言えば「はい」です。ClickHouse には、古いデータを削除してディスク容量を解放するための複数の仕組みがあります。それぞれ異なるシナリオに対応しています。



## TTL {#ttl}

ClickHouse では、特定の条件が満たされたときに値を自動的に削除できます。この条件は任意のカラム（通常はタイムスタンプカラムに対する静的なオフセット）に基づく式として設定します。

このアプローチの主な利点は、TTL を一度設定すれば外部システムからのトリガーを必要とせず、データの削除がバックグラウンドで自動的に行われることです。

:::note
TTL は、データを [/dev/null](https://en.wikipedia.org/wiki/Null_device) に移動するだけでなく、SSD から HDD など、異なるストレージシステム間でデータを移動するためにも使用できます。
:::

詳細は、[TTL の設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)を参照してください。



## DELETE FROM

[DELETE FROM](/sql-reference/statements/delete.md) を使用すると、ClickHouse で標準的な DELETE クエリを実行できます。フィルター句で対象となった行は削除済みとしてマークされ、今後の結果セットには含まれません。行のクリーンアップは非同期に行われます。

:::note
DELETE FROM はバージョン 23.3 以降で一般提供されています。それ以前のバージョンでは実験的機能であり、次の設定で有効にする必要があります。

```sql
SET allow_experimental_lightweight_delete = true;
```

:::


## ALTER DELETE {#alter-delete}

ALTER DELETE は、非同期バッチ処理を使用して行を削除します。`DELETE FROM` と異なり、ALTER DELETE の実行後からバッチ処理の完了までの間に実行されたクエリには、削除対象の行も含まれたままになります。詳細については [ALTER DELETE](/sql-reference/statements/alter/delete.md) のドキュメントを参照してください。

`ALTER DELETE` は、古いデータを柔軟に削除するために発行できます。これを定期的に行う必要がある場合の主な欠点は、クエリを定期的に送信する外部システムが必要になることです。また、削除する行が 1 行だけであっても mutation はパーツ全体を書き換えるため、パフォーマンス面での考慮も必要です。

これは、ClickHouse ベースのシステムを [GDPR](https://gdpr-info.eu) に準拠させるために最も一般的に用いられる手法です。

[mutation](/sql-reference/statements/alter#mutations) の詳細についてはこちらを参照してください。



## DROP PARTITION {#drop-partition}

`ALTER TABLE ... DROP PARTITION` は、パーティション全体を削除するためのコスト効率の高い方法です。柔軟性はそれほど高くなく、テーブル作成時に適切なパーティション方式を設定しておく必要がありますが、一般的なケースのほとんどはカバーできます。通常運用では、ミューテーションと同様に外部システムから実行する必要があります。

[パーティションの操作](/sql-reference/statements/alter/partition)の詳細を参照してください。



## TRUNCATE {#truncate}

テーブルからすべてのデータを削除するのはかなり極端な操作ですが、状況によってはまさにそれが必要になる場合もあります。

詳細については、[テーブルの TRUNCATE](/sql-reference/statements/truncate.md) を参照してください。
