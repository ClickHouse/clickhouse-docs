---
sidebar_label: 'Amazon DocumentDB'
description: 'Amazon DocumentDB を ClickPipes のソースとして設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mongodb/source/documentdb
title: 'Amazon DocumentDB ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'documentdb', 'cdc', 'データインジェスト', 'リアルタイム同期']
---

import docdb_select_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-select-parameter-group.png'
import docdb_modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-modify-parameter-group.png'
import docdb_apply_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-apply-parameter-group.png'
import docdb_parameter_group_status from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/docdb-parameter-group-status.png'
import Image from '@theme/IdealImage';


# Amazon DocumentDB ソースセットアップガイド



## サポートされている DocumentDB バージョン {#supported-documentdb-versions}

ClickPipes は DocumentDB バージョン 5.0 に対応しています。



## 変更ストリームログの保持期間を設定する

デフォルトでは、Amazon DocumentDB の変更ストリームログの保持期間は 3 時間ですが、初期ロードには DocumentDB に既に存在するデータ量に応じて、それよりもはるかに長い時間がかかる可能性があります。初回スナップショットが完了する前にログが切り捨てられないよう、変更ストリームログの保持期間を 72 時間以上に設定することを推奨します。

### AWS コンソールから変更ストリームログの保持期間を更新する

1. 左ペインで `Parameter groups` をクリックし、DocumentDB クラスターで使用されているパラメーターグループを探します（デフォルトのパラメーターグループを使用している場合は、変更するために先に新しいパラメーターグループを作成する必要があります）。

<Image img={docdb_select_parameter_group} alt="パラメーターグループを選択" size="lg" border />

2. `change_stream_log_retention_duration` を検索し、それを選択して `259200`（72 時間）に編集します。

<Image img={docdb_modify_parameter_group} alt="パラメーターグループを変更" size="lg" border />

3. `Apply Changes` をクリックして、変更したパラメーターグループを直ちに DocumentDB クラスターに適用します。パラメーターグループのステータスが `applying` に変わり、その後、変更が適用されると `in-sync` になることを確認できます。

<Image img={docdb_apply_parameter_group} alt="パラメーターグループを適用" size="lg" border />

<Image img={docdb_parameter_group_status} alt="パラメーターグループのステータス" size="lg" border />

### AWS CLI から変更ストリームログの保持期間を更新する

また、AWS CLI からこの設定を行うこともできます。

現在の変更ストリームログの保持期間を確認するには：

```shell
aws docdb describe-db-cluster-parameters --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --query "Parameters[?ParameterName=='change_stream_log_retention_duration'].{Name:ParameterName,Value:ParameterValue}"
```

変更ストリームのログ保持期間を72時間に設定するには、次のようにします。

```shell
aws docdb modify-db-cluster-parameter-group --db-cluster-parameter-group-name <PARAMETER_GROUP_NAME> --parameters "ParameterName=change_stream_log_retention_duration,ParameterValue=259200,ApplyMethod=immediate"
```


## データベースユーザーを設定する

管理者ユーザーとして DocumentDB クラスターに接続し、MongoDB CDC ClickPipes 向けのデータベースユーザーを作成するために次のコマンドを実行します。

```javascript
db.getSiblingDB("admin").createUser({
    user: "clickpipes_user",
    pwd: "some_secure_password",
    roles: ["readAnyDatabase", "clusterMonitor"],
})
```

:::note
必ず `clickpipes_user` と `some_secure_password` を希望するユーザー名とパスワードに置き換えてください。
:::


## 次のステップ {#whats-next}

これで、[ClickPipe を作成](../index.md)し、DocumentDB インスタンスから ClickHouse Cloud へデータの取り込みを開始できます。
ClickPipe を作成する際に必要になるため、DocumentDB クラスターのセットアップ時に使用した接続情報を必ず控えておいてください。
