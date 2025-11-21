---
sidebar_label: 'Amazon DocumentDB'
description: 'ClickPipes のソースとして Amazon DocumentDB をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Amazon DocumentDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', 'data ingestion', 'real-time sync']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Amazon DocumentDB ソース設定ガイド



## サポートされているDocumentDBバージョン {#supported-documentdb-versions}

ClickPipesはDocumentDBバージョン5.0をサポートしています。


## 変更ストリームログの保持期間を設定する {#configure-change-stream-log-retention}

デフォルトでは、Amazon DocumentDBの変更ストリームログの保持期間は3時間ですが、DocumentDB内の既存データ量によっては初期ロードにそれ以上の時間がかかる場合があります。初期スナップショットが完了する前にログが切り捨てられないよう、変更ストリームログの保持期間を72時間以上に設定することを推奨します。

### AWSコンソールで変更ストリームログの保持期間を更新する {#update-change-stream-log-retention-via-aws-console}

1. 左パネルの`Parameter groups`をクリックし、DocumentDBクラスタで使用されているパラメータグループを見つけます(デフォルトのパラメータグループを使用している場合は、変更するために先に新しいパラメータグループを作成する必要があります)。

   <Image
     img={docdb_select_parameter_group}
     alt='パラメータグループを選択'
     size='lg'
     border
   />

2. `change_stream_log_retention_duration`を検索し、選択して`259200`(72時間)に編集します

   <Image
     img={docdb_modify_parameter_group}
     alt='パラメータグループを変更'
     size='lg'
     border
   />

3. `Apply Changes`をクリックして、変更したパラメータグループをDocumentDBクラスタに即座に適用します。パラメータグループのステータスが`applying`に遷移し、変更が適用されると`in-sync`になることを確認してください。
   <Image
     img={docdb_apply_parameter_group}
     alt='パラメータグループを適用'
     size='lg'
     border
   />

<Image
  img={docdb_parameter_group_status}
  alt='パラメータグループのステータス'
  size='lg'
  border
/>

### AWS CLIで変更ストリームログの保持期間を更新する {#update-change-stream-log-retention-via-aws-cli}

または、AWS CLIを使用して設定することもできます。

現在の変更ストリームログの保持期間を確認するには:

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

変更ストリームログの保持期間を72時間に設定するには:

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてDocumentDBクラスターに接続し、以下のコマンドを実行してMongoDB CDC ClickPipes用のデータベースユーザーを作成してください:

```javascript
db.getSiblingDB("admin").createUser({
  user: "clickpipes_user",
  pwd: "some_secure_password",
  roles: ["readAnyDatabase", "clusterMonitor"]
})
```

:::note
`clickpipes_user`と`some_secure_password`は、任意のユーザー名とパスワードに置き換えてください。
:::


## 次のステップ {#whats-next}

[ClickPipeを作成](../index.md)して、DocumentDBインスタンスからClickHouse Cloudへのデータ取り込みを開始できます。
DocumentDBクラスターのセットアップ時に使用した接続情報は、ClickPipeの作成時に必要となるため、必ず控えておいてください。
