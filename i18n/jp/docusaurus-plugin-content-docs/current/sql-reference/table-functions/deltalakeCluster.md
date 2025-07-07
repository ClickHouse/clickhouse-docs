---
'description': 'これはdeltaLakeテーブル機能の拡張機能です。'
'sidebar_label': 'デルタレイククラスタ'
'sidebar_position': 46
'slug': '/sql-reference/table-functions/deltalakeCluster'
'title': 'deltaLakeCluster'
---




# deltaLakeCluster テーブル関数

これは [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数への拡張です。

指定されたクラスターの多数のノードから、Amazon S3 にある [Delta Lake](https://github.com/delta-io/delta) テーブルのファイルを並行処理することを可能にします。イニシエーターはクラスター内のすべてのノードへの接続を作成し、各ファイルを動的に配信します。ワーカー ノードでは、イニシエーターに次の処理タスクを尋ね、それを処理します。すべてのタスクが完了するまでこれを繰り返します。

## 構文 {#syntax}

```sql
deltaLakeCluster(cluster_name, url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## 引数 {#arguments}

- `cluster_name` — リモートおよびローカル サーバーへのアドレスと接続パラメーターのセットを構築するために使用されるクラスターの名前。

- その他の引数の説明は、同等の [deltaLake](sql-reference/table-functions/deltalake.md) テーブル関数の引数の説明と一致します。

## 戻り値 {#returned_value}

指定された Delta Lake テーブルからクラスターのデータを読み取るための指定された構造を持つテーブル。

## 関連 {#related}

- [deltaLake エンジン](engines/table-engines/integrations/deltalake.md)
- [deltaLake テーブル関数](sql-reference/table-functions/deltalake.md)
