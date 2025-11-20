---
sidebar_label: '汎用 MongoDB'
description: '任意の MongoDB インスタンスを ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/mongodb/source/generic
title: '汎用 MongoDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---



# 汎用的な MongoDB ソースのセットアップガイド

:::info

MongoDB Atlas を使用している場合は、[こちら](./atlas) の専用ガイドを参照してください。

:::



## oplog保持期間の有効化 {#enable-oplog-retention}

レプリケーションには最低24時間のoplog保持期間が必要です。初期スナップショットが完了する前にoplogが切り詰められないように、oplog保持期間を72時間以上に設定することを推奨します。

現在のoplog保持期間は、MongoDBシェルで以下のコマンドを実行することで確認できます（このコマンドを実行するには`clusterMonitor`ロールが必要です）：

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

oplog保持期間を72時間に設定するには、レプリカセット内の各ノードで管理者ユーザーとして以下のコマンドを実行します：

```javascript
db.adminCommand({
  replSetResizeOplog: 1,
  minRetentionHours: 72
})
```

`replSetResizeOplog`コマンドとoplog保持期間の詳細については、[MongoDBドキュメント](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)を参照してください。


## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてMongoDBインスタンスに接続し、以下のコマンドを実行してMongoDB CDC ClickPipes用のユーザーを作成します:

```javascript
db.getSiblingDB("admin").createUser({
  user: "clickpipes_user",
  pwd: "some_secure_password",
  roles: ["readAnyDatabase", "clusterMonitor"]
})
```

:::note

`clickpipes_user`と`some_secure_password`を、使用するユーザー名とパスワードに置き換えてください。

:::


## 次のステップ {#whats-next}

これで[ClickPipeを作成](../index.md)して、MongoDBインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
MongoDBインスタンスのセットアップ時に使用した接続情報は、ClickPipe作成時に必要となるため、必ず控えておいてください。
