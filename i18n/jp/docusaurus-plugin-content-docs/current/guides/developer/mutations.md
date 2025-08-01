---
slug: '/guides/developer/mutations'
sidebar_label: 'データの更新と削除'
sidebar_position: 1
keywords:
- 'update'
- 'delete'
- 'mutation'
title: 'ClickHouseデータの更新と削除'
description: 'ClickHouseでの更新および削除操作の方法について説明します'
---




# ClickHouseデータの更新と削除

ClickHouseは高ボリュームの分析ワークロード向けに設計されていますが、特定の状況で既存のデータを変更または削除することも可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使用して実行されます。また、ClickHouseの軽量削除機能を使用して行を `DELETE` することもできます。

:::tip
頻繁に更新を行う必要がある場合は、[重複排除](../developer/deduplication.md)機能を使用することを検討してください。この機能により、ミューテーションイベントを生成することなく、行を更新および/または削除できます。
:::

## データの更新 {#updating-data}

テーブルの行を更新するには、`ALTER TABLE...UPDATE` コマンドを使用します：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は `<filter_expr>` が満たされるカラムの新しい値です。`<expression>` はカラムと同じデータ型である必要があるか、または `CAST` 演算子を使用して同じデータ型に変換可能である必要があります。`<filter_expr>` はデータの各行に対して `UInt8`（ゼロまたは非ゼロ）の値を返す必要があります。複数の `UPDATE <column>` ステートメントは、カンマで区切って単一の `ALTER TABLE` コマンドに結合できます。

**例**：

1. このようなミューテーションでは、辞書lookupを使用して `visitor_ids` を新しいものに置き換えて更新できます：

     ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2. 1つのコマンドで複数の値を変更することは、複数のコマンドを使用するよりも効率的です：

     ```sql
     ALTER TABLE website.clicks
     UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
     WHERE visit_date < '2022-01-01'
     ```

3. ミューテーションはシャード化されたテーブルに対して `ON CLUSTER` で実行できます：

     ```sql
     ALTER TABLE clicks ON CLUSTER main_cluster
     UPDATE click_count = click_count / 2
     WHERE visitor_id ILIKE '%robot%'
     ```

:::note
主キーまたはソートキーの一部であるカラムの更新はできません。
:::

## データの削除 {#deleting-data}

行を削除するには、`ALTER TABLE` コマンドを使用します：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` はデータの各行に対して `UInt8` 値を返す必要があります。

**例**

1. 列が値の配列に含まれるレコードを削除します：
    ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2. このクエリは何を変更しますか？
    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
テーブル内のデータをすべて削除するには、`TRUNCATE TABLE [<database>.]<table>` コマンドを使用する方が効率的です。このコマンドも `ON CLUSTER` で実行できます。
:::

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md)のドキュメントページを参照してください。

## 軽量削除 {#lightweight-deletes}

行を削除するもう1つのオプションは、**軽量削除**と呼ばれる `DELETE FROM` コマンドを使用することです。削除された行は即座に削除済みとしてマークされ、その後のすべてのクエリから自動的にフィルタリングされるため、パーツのマージを待つ必要はなく、`FINAL` キーワードを使用する必要もありません。データのクリーンアップはバックグラウンドで非同期的に行われます。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

たとえば、次のクエリは `Title` 列に `hello` というテキストが含まれる `hits` テーブルのすべての行を削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関するいくつかの注意点：
- この機能は、`MergeTree` テーブルエンジンファミリーにのみ利用可能です。
- 軽量削除はデフォルトで非同期です。`mutations_sync` を 1 に設定すると、1つのレプリカがステートメントを処理するのを待機し、`mutations_sync` を 2 に設定すると、すべてのレプリカを待機します。
