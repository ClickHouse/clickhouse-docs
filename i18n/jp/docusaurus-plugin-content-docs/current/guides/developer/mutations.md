---
'slug': '/guides/developer/mutations'
'sidebar_label': 'データの更新と削除'
'sidebar_position': 1
'keywords':
- 'UPDATE'
- 'DELETE'
- 'mutations'
'title': 'ClickHouse データの更新と削除'
'description': 'ClickHouse での更新および削除操作の実行方法について説明します。'
'show_related_blogs': false
'doc_type': 'guide'
---


# ClickHouseデータの更新および削除

ClickHouseは高ボリュームの分析作業に特化していますが、特定の状況では既存のデータを変更または削除することも可能です。これらの操作は「ミューテーション」と呼ばれ、`ALTER TABLE` コマンドを使用して実行されます。

:::tip
頻繁に更新を行う必要がある場合は、ClickHouseの[重複排除](../developer/deduplication.md)を使用することを検討してください。これにより、ミューテーションイベントを生成することなく行を更新および／または削除できます。代わりに、[軽量更新](/docs/sql-reference/statements/update) や [軽量削除](/guides/developer/lightweight-delete)を使用してください。
:::

## データの更新 {#updating-data}

`ALTER TABLE...UPDATE` コマンドを使用して、テーブル内の行を更新します。

```sql
ALTER TABLE [<database>.]<table> UPDATE <column> = <expression> WHERE <filter_expr>
```

`<expression>` は `<filter_expr>` が満たされるカラムの新しい値です。`<expression>` はカラムと同じデータ型であるか、`CAST` 演算子を使用して同じデータ型に変換可能でなければなりません。`<filter_expr>` はデータの各行に対して `UInt8`（ゼロまたは非ゼロ）の値を返す必要があります。複数の `UPDATE <column>` ステートメントをカンマで区切って、単一の `ALTER TABLE` コマンドに結合することができます。

**例**:

1. このようなミューテーションにより、辞書を参照して `visitor_ids` を新しいものに置き換えることができます：

```sql
ALTER TABLE website.clicks
UPDATE visitor_id = getDict('visitors', 'new_visitor_id', visitor_id)
WHERE visit_date < '2022-01-01'
```

2. 1つのコマンドで複数の値を変更することは、複数のコマンドよりも効率的です：

```sql
ALTER TABLE website.clicks
UPDATE url = substring(url, position(url, '://') + 3), visitor_id = new_visit_id
WHERE visit_date < '2022-01-01'
```

3. シャードテーブルに対してミューテーションを `ON CLUSTER` で実行することができます：

```sql
ALTER TABLE clicks ON CLUSTER main_cluster
UPDATE click_count = click_count / 2
WHERE visitor_id ILIKE '%robot%'
```

:::note
主キーまたはソートキーの一部であるカラムを更新することはできません。
:::

## データの削除 {#deleting-data}

`ALTER TABLE` コマンドを使用して、行を削除します：

```sql
ALTER TABLE [<database>.]<table> DELETE WHERE <filter_expr>
```

`<filter_expr>` はデータの各行に対して UInt8 の値を返す必要があります。

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
テーブル内のすべてのデータを削除する場合、`TRUNCATE TABLE [<database].]<table>` コマンドを使用する方が効率的です。このコマンドも `ON CLUSTER` で実行できます。
:::

詳細については、[`DELETE` ステートメント](/sql-reference/statements/delete.md) のドキュメントページを参照してください。

## 軽量削除 {#lightweight-deletes}

行を削除する別のオプションは、`DELETE FROM` コマンドを使用することで、これは **軽量削除** と呼ばれます。削除された行は直ちに削除としてマークされ、すべての後続のクエリから自動的にフィルタリングされますので、パーツのマージを待ったり、`FINAL` キーワードを使用したりする必要はありません。データのクリーンアップはバックグラウンドで非同期に行われます。

```sql
DELETE FROM [db.]table [ON CLUSTER cluster] [WHERE expr]
```

例えば、次のクエリは `hits` テーブルから `Title` カラムに `hello` が含まれるすべての行を削除します：

```sql
DELETE FROM hits WHERE Title LIKE '%hello%';
```

軽量削除に関するいくつかの注意点：
- この機能は `MergeTree` テーブルエンジンファミリー専用です。
- 軽量削除はデフォルトで非同期です。`mutations_sync` を 1 に設定すると、1つのレプリカがステートメントを処理するのを待つことができ、`mutations_sync` を 2 に設定するとすべてのレプリカを待つことができます。
