---
slug: /guides/developer/mutations
sidebar_label: データの更新と削除
sidebar_position: 1
keywords: [update, delete, mutation]
---


# ClickHouseデータの更新と削除

ClickHouseは高ボリュームの分析ワークロード向けに設計されていますが、特定の状況では既存のデータを修正または削除することが可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使用して実行されます。また、ClickHouseの軽量削除機能を使用して行を `DELETE` することもできます。

:::tip
頻繁な更新を行う必要がある場合は、ClickHouseの[重複排除](../developer/deduplication.md)を使用することを検討してください。これにより、ミューテーションイベントを生成せずに行を更新および/または削除できます。
:::

## データの更新 {#updating-data}

`ALTER TABLE...UPDATE` コマンドを使用して、テーブルの行を更新します：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は、`<filter_expr>` が満たされるカラムの新しい値です。`<expression>` はカラムと同じデータ型であるか、`CAST` 演算子を使用して同じデータ型に変換可能でなければなりません。`<filter_expr>` はデータの各行に対して `UInt8` (0または非0) の値を返す必要があります。複数の `UPDATE <column>` ステートメントをカンマで区切って1つの `ALTER TABLE` コマンドに結合できます。

**例**：

1. このようなミューテーションは、辞書参照を使用して `visitor_ids` を新しいものに置き換えることを許可します：

    ```sql
    ALTER TABLE website.clicks
    UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
    WHERE visit_date < '2022-01-01'
    ```

2. 一つのコマンドで複数の値を修正する方が、複数のコマンドよりも効率的である場合があります：

    ```sql
    ALTER TABLE website.clicks
    UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
    WHERE visit_date < '2022-01-01'
    ```

3. シャーディングされたテーブルに対して `ON CLUSTER` でミューテーションを実行できます：

    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster
    UPDATE click_count = click_count / 2
    WHERE visitor_id ILIKE '%robot%'
    ```

:::note
主キーやソートキーの一部であるカラムを更新することはできません。
:::

## データの削除 {#deleting-data}

`ALTER TABLE` コマンドを使用して行を削除します：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` はデータの各行に対して `UInt8` 値を返す必要があります。

**例**：

1. カラムが値の配列に含まれるすべてのレコードを削除します：
    ```sql
    ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
    ```

2. このクエリでは何を変更していますか？
    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
    ```

:::note
テーブル内のすべてのデータを削除するには、`TRUNCATE TABLE [<database>].<table>` コマンドを使用する方が効率的です。このコマンドも `ON CLUSTER` で実行できます。
:::

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md)のドキュメントページを参照してください。

## 軽量削除 {#lightweight-deletes}

行を削除する別のオプションは、`DELETE FROM` コマンドを使用することです。これは**軽量削除**と呼ばれます。削除された行はすぐに削除されたとしてマークされ、すべてのその後のクエリから自動的にフィルタリングされるため、パーツのマージを待つ必要や `FINAL` キーワードを使用する必要はありません。データのクリーンアップはバックグラウンドで非同期に行われます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例えば、次のクエリは `hits` テーブルのすべての行で、`Title` カラムが `hello` というテキストを含むものを削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関する注意点：
- この機能は、`MergeTree` テーブルエンジンファミリーでのみ利用可能です。
- 軽量削除はデフォルトで非同期です。`mutations_sync` を1に設定すると、1つのレプリカがステートメントを処理するまで待機し、`mutations_sync` を2に設定すると、すべてのレプリカが処理するまで待機します。
