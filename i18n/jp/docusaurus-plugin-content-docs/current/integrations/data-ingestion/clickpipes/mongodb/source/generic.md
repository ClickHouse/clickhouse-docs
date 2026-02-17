---
sidebar_label: '汎用 MongoDB'
description: '任意の MongoDB インスタンスを ClickPipes のソースとして設定する'
slug: /integrations/clickpipes/mongodb/source/generic
title: '汎用 MongoDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 汎用的な MongoDB ソース設定ガイド \{#generic-mongodb-source-setup-guide\}

:::info

MongoDB Atlas を使用している場合は、[こちら](./atlas)の専用ガイドを参照してください。

:::

## oplog 保持を有効化する \{#enable-oplog-retention\}

レプリケーションには、最小 24 時間の oplog 保持が必要です。初回スナップショットが完了する前に oplog が切り捨てられないようにするため、oplog の保持期間は 72 時間以上に設定することを推奨しています。

MongoDB シェルで次のコマンドを実行することで、現在の oplog 保持期間を確認できます（このコマンドを実行するには `clusterMonitor` ロールが必要です）。

```javascript
db.getSiblingDB("admin").serverStatus().oplogTruncation.oplogMinRetentionHours
```

oplog の保持期間を 72 時間に設定するには、レプリカセット内の各ノードで、管理者権限を持つ USER として次のコマンドを実行します。

```javascript
db.adminCommand({
    "replSetResizeOplog" : 1,
    "minRetentionHours": 72
})
```

`replSetResizeOplog` コマンドと oplog の保持に関する詳細については、[MongoDB ドキュメント](https://www.mongodb.com/docs/manual/reference/command/replSetResizeOplog/)を参照してください。


## データベースユーザーの設定 \{#configure-database-user\}

管理者ユーザーで MongoDB インスタンスに接続し、MongoDB CDC ClickPipes 用のユーザーを作成するために次のコマンドを実行します。

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note

`clickpipes_user` と `some_secure_password` は、必ず希望するユーザー名とパスワードに置き換えてください。

:::


## 次のステップ \{#whats-next\}

これで [ClickPipe を作成](../index.md)し、MongoDB インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
MongoDB インスタンスのセットアップ時に使用した接続情報は、ClickPipe の作成プロセスでも必要になるため、必ず控えておいてください。