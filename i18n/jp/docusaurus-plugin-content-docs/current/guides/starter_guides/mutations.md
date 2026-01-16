---
slug: /guides/developer/mutations
sidebar_label: 'データの更新と削除'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: 'ClickHouse データの更新と削除'
description: 'ClickHouse でデータの更新および削除操作を行う方法について説明します'
show_related_blogs: false
doc_type: 'guide'
---

# ミューテーションを使用した ClickHouse データの更新と削除 \\{#updating-and-deleting-clickhouse-data-with-mutations\\}

ClickHouse は大規模な分析ワークロード向けに最適化されていますが、状況によっては既存データを変更したり
削除したりすることも可能です。これらの操作は「ミューテーション (mutation)」と呼ばれ、`ALTER TABLE` コマンドを使って実行されます。

:::tip
頻繁に更新を行う必要がある場合は、ClickHouse の [deduplication](../developer/deduplication.md) の利用を検討してください。これを利用すると、
ミューテーションイベントを発生させることなく行の更新および／または削除が可能です。あるいは、[lightweight updates](/docs/sql-reference/statements/update)
や [lightweight deletes](/guides/developer/lightweight-delete) を使用してください。
:::

## データの更新 \\{#updating-data\\}

テーブル内の行を更新するには、`ALTER TABLE...UPDATE` コマンドを使用します。

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は、`<filter_expr>` の条件を満たす行に対してその列に設定される新しい値です。`<expression>` は、その列と同じデータ型であるか、`CAST` 演算子を使用して同じデータ型に変換可能である必要があります。`<filter_expr>` は、データの各行に対して `UInt8`（ゼロまたは非ゼロ）の値を返す必要があります。複数の `UPDATE <column>` ステートメントは、カンマで区切って 1 つの `ALTER TABLE` コマンドにまとめることができます。

**例**:

1. 次のようなミューテーションにより、ディクショナリルックアップを使って `visitor_ids` を新しいものに更新できます。

```sql
ALTER TABLE website.clicks
UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
WHERE visit_date < '2022-01-01'
```

2. 1 回のコマンドで複数の値を変更する方が、複数回のコマンド実行より効率的な場合があります。

```sql
ALTER TABLE website.clicks
UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
WHERE visit_date < '2022-01-01'
```

3. シャーディングされたテーブルに対しては、ミューテーションを `ON CLUSTER` で実行できます。

```sql
ALTER TABLE clicks ON CLUSTER main_cluster
UPDATE click_count = click_count / 2
WHERE visitor_id ILIKE '%robot%'
```

:::note
主キーまたはソートキーの一部になっている列を更新することはできません。
:::

## データの削除 \\{#deleting-data\\}

`ALTER TABLE` コマンドを使用して行を削除します。

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` は、各行のデータに対して UInt8 型の値を返す必要があります。

**例**

1. 列が特定の値の配列に含まれている行を削除する:

```sql
ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
```

2. このクエリでどのデータが削除されるか:

```sql
ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
```

:::note
テーブル内のすべてのデータを削除するには、`TRUNCATE TABLE [<database].]<table>` コマンドを使用する方が効率的です。このコマンドは `ON CLUSTER` とともに実行することもできます。
:::

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md) のドキュメントページを参照してください。

## 軽量削除 \\{#lightweight-deletes\\}

行を削除するもう 1 つの方法は、**軽量削除** と呼ばれる `DELETE FROM` 文を使用することです。削除された行には即座に削除フラグが付き、その後のすべてのクエリから自動的にフィルタリングされるため、パーツのマージ処理を待ったり `FINAL` キーワードを使用したりする必要はありません。データのクリーンアップはバックグラウンドで非同期的に行われます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

たとえば、次のクエリは、`Title` 列に `hello` という文字列が含まれている `hits` テーブルのすべての行を削除します。

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除についての注意点:

* この機能は `MergeTree` テーブルエンジンファミリーでのみ利用できます。
* 軽量削除はデフォルトで同期的に実行され、すべてのレプリカが削除処理を完了するまで待機します。この動作は [`lightweight_deletes_sync` 設定](/operations/settings/settings#lightweight_deletes_sync) によって制御されます。
