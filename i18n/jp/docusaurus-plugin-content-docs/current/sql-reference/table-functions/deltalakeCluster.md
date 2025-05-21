description: 'これは deltaLake テーブル関数への拡張です。'
sidebar_label: 'deltaLakeCluster'
sidebar_position: 46
slug: /sql-reference/table-functions/deltalakeCluster
title: 'deltaLakeCluster'
```


# deltaLakeCluster テーブル関数

これは[deltaLake](sql-reference/table-functions/deltalake.md)テーブル関数への拡張です。

指定されたクラスタ内の多数のノードから、Amazon S3 の[Delta Lake](https://github.com/delta-io/delta)テーブルのファイルを並行して処理することを可能にします。発起者は、クラスタ内のすべてのノードへの接続を作成し、各ファイルを動的に配布します。ワーカーノードでは、次の処理タスクについて発起者に尋ね、それを処理します。これをすべてのタスクが終了するまで繰り返します。

**構文**

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

**引数**

- `cluster_name` — リモートおよびローカルサーバーへのアドレスと接続パラメータのセットを構築するために使用されるクラスタの名前。

- その他の引数の説明は、同等の[deltaLake](sql-reference/table-functions/deltalake.md)テーブル関数の引数の説明と一致します。

**返される値**

指定された Delta Lake テーブルからクラスタ内のデータを読み取るための指定された構造のテーブル。

**関連項目**

- [deltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLake テーブル関数](sql-reference/table-functions/deltalake.md)
