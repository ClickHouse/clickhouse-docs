---
'description': 'Apache Arrow Flight サーバーを通じて公開されたデータに対してクエリを実行することを可能にします。'
'sidebar_label': 'arrowFlight'
'sidebar_position': 186
'slug': '/sql-reference/table-functions/arrowflight'
'title': 'arrowFlight'
'doc_type': 'reference'
---


# arrowFlight テーブル関数

Apache Arrow Flight サーバー経由で公開されているデータに対してクエリを実行することができます。

**構文**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**引数**

* `host:port` — Arrow Flight サーバーのアドレス。 [String](../../sql-reference/data-types/string.md).
* `dataset_name` — Arrow Flight サーバーで利用可能なデータセットまたはディスクリプターの名前。 [String](../../sql-reference/data-types/string.md).
* `username` - 基本的な HTTP スタイルの認証に使用するユーザー名。
* `password` - 基本的な HTTP スタイルの認証に使用するパスワード。
`username` と `password` が指定されていない場合は、認証が使用されていないことを意味します（これは Arrow Flight サーバーがそれを許可している場合のみ機能します）。

**返される値**

* リモートデータセットを表すテーブルオブジェクト。スキーマは Arrow Flight のレスポンスから推論されます。

**例**

クエリ:

```sql
SELECT * FROM arrowFlight('127.0.0.1:9005', 'sample_dataset') ORDER BY id;
```

結果:

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

**参照**

* [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md) テーブルエンジン
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
