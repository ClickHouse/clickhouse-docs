---
description: 'Apache Arrow Flight サーバーで公開されているデータに対してクエリを実行できるようにします。'
sidebar_label: 'arrowFlight'
sidebar_position: 186
slug: /sql-reference/table-functions/arrowflight
title: 'arrowFlight'
doc_type: 'reference'
---

# arrowFlight テーブル関数

[Apache Arrow Flight](../../interfaces/arrowflight.md) サーバーで公開されているデータに対してクエリを実行できます。

**構文**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**引数**

* `host:port` — Arrow Flight サーバーのアドレス。[String](../../sql-reference/data-types/string.md)。
* `dataset_name` — Arrow Flight サーバーで利用可能なデータセットまたはディスクリプターの名前。[String](../../sql-reference/data-types/string.md)。
* `username` - HTTP Basic 認証で使用するユーザー名。
* `password` - HTTP Basic 認証で使用するパスワード。
  `username` と `password` が指定されていない場合、認証は使用されません
  （この場合、Arrow Flight サーバー側で認証なしの接続が許可されている必要があります）。

**戻り値**

* リモートデータセットを表すテーブルオブジェクト。スキーマは Arrow Flight のレスポンスから推論されます。

**例**

クエリ:

```sql
SELECT * FROM arrowFlight('127.0.0.1:9005', 'sample_dataset') ORDER BY id;
```

結果：

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

**関連項目**

* [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md) テーブルエンジン
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
