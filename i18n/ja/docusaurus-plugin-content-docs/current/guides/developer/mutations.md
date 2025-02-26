---
slug: /guides/developer/mutations
sidebar_label: データの更新と削除
sidebar_position: 1
keywords: [更新, 削除, ミューテーション]
---

# ClickHouseデータの更新と削除

ClickHouseは高トラフィックの分析ワークロードに特化していますが、特定の状況で既存のデータを変更または削除することが可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使用して実行されます。ClickHouseの軽量削除機能を使用して行を `DELETE` することもできます。

:::tip
頻繁に更新を行う必要がある場合は、ClickHouseの[重複排除](../developer/deduplication.md)を使用することを検討してください。これにより、ミューテーションイベントを生成せずに行を更新および/または削除できます。
:::

## データの更新 {#updating-data}

`ALTER TABLE...UPDATE` コマンドを使用してテーブル内の行を更新します：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は、`<filter_expr>` が満たされるカラムに対する新しい値です。`<expression>` はカラムと同じデータ型であるか、`CAST` 演算子を使用して同じデータ型に変換可能でなければなりません。`<filter_expr>` は各データ行に対して `UInt8`（ゼロまたはゼロでない）値を返す必要があります。複数の `UPDATE <column>` ステートメントをカンマで区切って1つの `ALTER TABLE` コマンドに組み合わせることができます。

**例**:

1. 次のようなミューテーションは、辞書ルックアップを使用して `visitor_ids` を新しいものに置き換えることを許可します：

     ```sql
     ALTER TABLE website.clicks
     UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
     WHERE visit_date < '2022-01-01'
     ```

2. 1つのコマンドで複数の値を修正することは、複数のコマンドよりも効率的です：

     ```sql
     ALTER TABLE website.clicks
     UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
     WHERE visit_date < '2022-01-01'
     ```

3. ミューテーションは、シャーディングされたテーブルに対して `ON CLUSTER` 実行することができます：

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

`<filter_expr>` はデータ行の各行に対して UInt8 値を返す必要があります。

**例**:

1. カラムが値の配列に含まれているレコードを削除します：
    ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2. このクエリは何を変更しますか？
    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
テーブル内のすべてのデータを削除するには、`TRUNCATE TABLE [<database>.]<table>` コマンドを使用する方が効率的です。このコマンドも `ON CLUSTER` で実行できます。
:::

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md)のドキュメントページを参照してください。

## 軽量削除 {#lightweight-deletes}

行を削除するためのもう1つのオプションは、`DELETE FROM` コマンドを使用することです。これは**軽量削除**と呼ばれます。削除された行はすぐに削除されたとマークされ、すべてのその後のクエリから自動的にフィルタリングされるため、パーツのマージを待つ必要がなく、`FINAL` キーワードを使用する必要もありません。データのクリーンアップはバックグラウンドで非同期に行われます。

``` sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例えば、以下のクエリは `Title` カラムに `hello` というテキストが含まれる `hits` テーブルのすべての行を削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関するいくつかの注意点：
- この機能は `MergeTree` テーブルエンジンファミリーのみで利用可能です。
- 軽量削除はデフォルトで非同期です。ステートメントが1つのレプリカによって処理されるのを待つには、`mutations_sync` を1に設定し、すべてのレプリカを待つには `mutations_sync` を2に設定します。
