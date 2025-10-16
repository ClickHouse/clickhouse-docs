---
'sidebar_label': '汎用MongoDB'
'description': '任意のMongoDBインスタンスをClickPipesのソースとして設定する'
'slug': '/integrations/clickpipes/mongodb/source/generic'
'title': '汎用MongoDBソース設定ガイド'
'doc_type': 'guide'
---


# 一般的な MongoDB ソース設定ガイド

:::info

MongoDB Atlas を使用している場合は、特定のガイドを [こちら](./atlas) を参照してください。

:::

## oplog 保持の有効化 {#enable-oplog-retention}

レプリケーションには最低 24 時間の oplog 保持が必要です。初回スナップショットが完了する前に oplog が切り捨てられないように、oplog 保持を 72 時間以上に設定することをお勧めします。

現在の oplog 保持を確認するには、MongoDB シェルで次のコマンドを実行します（このコマンドを実行するには `clusterMonitor` 権限が必要です）:

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

oplog 保持を 72 時間に設定するには、レプリカセット内の各ノードで管理者ユーザーとして次のコマンドを実行します:

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

`replSetResizeOplog` コマンドと oplog 保持に関する詳細は、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)を参照してください。

## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとして MongoDB インスタンスに接続し、MongoDB CDC ClickPipes 用のユーザーを作成するために次のコマンドを実行します:

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

`clickpipes_user` と `some_secure_password` を希望するユーザー名とパスワードに置き換えることを確認してください。

:::

## 次は何をしますか？ {#whats-next}

これで [ClickPipe を作成](../index.md)し、MongoDB インスタンスから ClickHouse Cloud へのデータの取り込みを開始できます。MongoDB インスタンスの設定時に使用した接続詳細をメモしておくことを忘れないでください。それらは ClickPipe 作成プロセス中に必要になります。
