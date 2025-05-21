---
slug: /guides/developer/mutations
sidebar_label: 'データの更新と削除'
sidebar_position: 1
keywords: ['update', 'delete', 'mutation']
title: 'ClickHouse データの更新と削除'
description: 'ClickHouse での更新および削除操作の実行方法について説明します'
---


# ClickHouse データの更新と削除

ClickHouse は高ボリュームの分析ワークロード向けに設計されていますが、特定の状況下では既存のデータを変更または削除することも可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使用して実行されます。また、ClickHouse の軽量削除機能を使用して行を `DELETE` することもできます。

:::tip
頻繁に更新を行う必要がある場合は、ClickHouse の [重複排除](../developer/deduplication.md) を使用することを検討してください。これにより、ミューテーションイベントを生成せずに行を更新および/または削除できます。
:::

## データの更新 {#updating-data}

`ALTER TABLE...UPDATE` コマンドを使用して、テーブル内の行を更新します：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は、`<filter_expr>` が満たされるカラムの新しい値です。`<expression>` はカラムと同じデータ型であるか、`CAST` 演算子を使用して同じデータ型に変換可能である必要があります。`<filter_expr>` は、データの各行に対して `UInt8`（ゼロまたは非ゼロ）値を返す必要があります。複数の `UPDATE <column>` ステートメントは、カンマで区切って単一の `ALTER TABLE` コマンドに結合できます。

**例**:

 1. このようなミューテーションは、辞書参照を使用して `visitor_ids` を新しいものに置き換えることを許可します：

     ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2. 1 回のコマンドで複数の値を変更する方が、複数のコマンドよりも効率的です：

     ```sql
     ALTER TABLE website.clicks
     UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
     WHERE visit_date < '2022-01-01'
     ```

3. ミューテーションはシャーディングされたテーブルに対して `ON CLUSTER` で実行可能です：

     ```sql
     ALTER TABLE clicks ON CLUSTER main_cluster
     UPDATE click_count = click_count / 2
     WHERE visitor_id ILIKE '%robot%'
     ```

:::note
主キーまたはソートキーの一部であるカラムを更新することはできません。
:::

## データの削除 {#deleting-data}

`ALTER TABLE` コマンドを使用して行を削除します：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` は、データの各行に対して UInt8 値を返す必要があります。

**例**

1. カラムが値の配列に含まれているレコードを削除します：
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

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md) ドキュメントページをご覧ください。

## 軽量削除 {#lightweight-deletes}

行を削除するもう一つのオプションは、**軽量削除**と呼ばれる `DELETE FROM` コマンドを使用することです。削除された行は即座に削除済みとしてマークされ、すべての後続のクエリから自動的にフィルターされるため、パーツのマージを待つ必要もなく、`FINAL` キーワードを使用する必要もありません。データのクリーニングはバックグラウンドで非同期に行われます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

たとえば、以下のクエリは、`Title` カラムに `hello` というテキストが含まれる `hits` テーブルからすべての行を削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関するいくつかの注意点：
- この機能は `MergeTree` テーブルエンジンファミリーでのみ利用可能です。
- 軽量削除はデフォルトでは非同期です。`mutations_sync` を 1 に設定すると、1 つのレプリカがステートメントを処理するまで待機し、`mutations_sync` を 2 に設定すると、すべてのレプリカを待機します。
