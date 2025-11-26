---
sidebar_label: '汎用 MongoDB'
description: '任意の MongoDB インスタンスを ClickPipes のソースとして構成する'
slug: /integrations/clickpipes/mongodb/source/generic
title: '汎用 MongoDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
---



# 汎用的な MongoDB ソースセットアップガイド

:::info

MongoDB Atlas を使用している場合は、[こちら](./atlas)の専用ガイドを参照してください。

:::



## oplog の保持を有効にする

レプリケーションのためには、oplog を最低 24 時間保持する必要があります。初回スナップショットが完了する前に oplog が切り捨てられないようにするため、oplog の保持期間は 72 時間以上に設定することを推奨します。

現在の oplog の保持期間は、MongoDB シェルで次のコマンドを実行して確認できます（このコマンドを実行するには `clusterMonitor` ロールが必要です）:

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

oplog の保持期間を 72 時間に設定するには、レプリカセット内の各ノードで、管理者ユーザーとして次のコマンドを実行します。

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

`replSetResizeOplog` コマンドおよび oplog の保持に関する詳細は、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)を参照してください。


## データベースユーザーを設定する

管理者ユーザーとして MongoDB インスタンスに接続し、MongoDB CDC ClickPipes 用のユーザーを作成するために次のコマンドを実行します：

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

必ず `clickpipes_user` と `some_secure_password` を、ご希望のユーザー名とパスワードに置き換えてください。

:::


## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、MongoDB インスタンスから ClickHouse Cloud へデータを取り込み始めることができます。
ClickPipe の作成プロセスで必要になるため、MongoDB インスタンスのセットアップ時に使用した接続情報は必ず控えておいてください。
