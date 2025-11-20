---
slug: /guides/developer/mutations
sidebar_label: 'データの更新と削除'
sidebar_position: 1
keywords: ['UPDATE', 'DELETE', 'mutations']
title: 'ClickHouse データの更新と削除'
description: 'ClickHouse でデータの更新および削除を行う方法を説明します'
show_related_blogs: false
doc_type: 'guide'
---



# ミューテーションによる ClickHouse データの更新と削除

ClickHouse は大規模な分析ワークロード向けに最適化されていますが、状況によっては既存のデータを変更したり
削除したりすることも可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使って実行されます。

:::tip
頻繁に更新を行う必要がある場合は、ミューテーションイベントを発生させることなく行の更新および／または削除を行える ClickHouse の [deduplication](../developer/deduplication.md) の利用を検討してください。あるいは、[lightweight updates](/docs/sql-reference/statements/update)
や [lightweight deletes](/guides/developer/lightweight-delete) の使用を検討してください。
:::



## データの更新 {#updating-data}

テーブル内の行を更新するには、`ALTER TABLE...UPDATE`コマンドを使用します：

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>`は、`<filter_expr>`の条件を満たす列の新しい値です。`<expression>`は、列と同じデータ型であるか、`CAST`演算子を使用して同じデータ型に変換可能である必要があります。`<filter_expr>`は、データの各行に対して`UInt8`型（ゼロまたは非ゼロ）の値を返す必要があります。複数の`UPDATE <column>`ステートメントは、カンマで区切って単一の`ALTER TABLE`コマンドにまとめることができます。

**例**：

1.  次のようなミューテーションでは、辞書ルックアップを使用して`visitor_ids`を新しい値に置き換えることができます：

    ```sql
    ALTER TABLE website.clicks
    UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
    WHERE visit_date < '2022-01-01'
    ```

2.  1つのコマンドで複数の値を変更する方が、複数のコマンドを実行するよりも効率的です：

    ```sql
    ALTER TABLE website.clicks
    UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
    WHERE visit_date < '2022-01-01'
    ```

3.  シャード化されたテーブルに対しては、`ON CLUSTER`を指定してミューテーションを実行できます：

    ```sql
    ALTER TABLE clicks ON CLUSTER main_cluster
    UPDATE click_count = click_count / 2
    WHERE visitor_id ILIKE '%robot%'
    ```

:::note
プライマリキーまたはソートキーの一部である列を更新することはできません。
:::


## データの削除 {#deleting-data}

行を削除するには`ALTER TABLE`コマンドを使用します：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>`は各データ行に対してUInt8値を返す必要があります。

**例**

1. カラムの値が配列内に含まれるレコードを削除する：

   ```sql
   ALTER TABLE website.clicks DELETE WHERE visitor_id in (253, 1002, 4277)
   ```

2. このクエリは何を変更しますか？
   ```sql
   ALTER TABLE clicks ON CLUSTER main_cluster DELETE WHERE visit_date < '2022-01-02 15:00:00' AND page_id = '573'
   ```

:::note
テーブル内のすべてのデータを削除する場合は、`TRUNCATE TABLE [<database].]<table>`コマンドを使用する方が効率的です。このコマンドは`ON CLUSTER`でも実行できます。
:::

詳細については、[`DELETE`ステートメント](/sql-reference/statements/delete.md)のドキュメントページを参照してください。


## 軽量削除 {#lightweight-deletes}

行を削除するもう一つの方法として、`DELETE FROM`コマンドを使用する方法があります。これは**軽量削除**と呼ばれます。削除された行は即座に削除済みとしてマークされ、以降のすべてのクエリから自動的にフィルタリングされるため、パートのマージを待つ必要も`FINAL`キーワードを使用する必要もありません。データのクリーンアップはバックグラウンドで非同期に実行されます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例えば、次のクエリは`hits`テーブルから`Title`列に`hello`というテキストを含むすべての行を削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関する注意点：

- この機能は`MergeTree`テーブルエンジンファミリーでのみ利用可能です。
- 軽量削除はデフォルトで同期的に動作し、すべてのレプリカが削除を処理するまで待機します。この動作は[`lightweight_deletes_sync`設定](/operations/settings/settings#lightweight_deletes_sync)によって制御されます。
