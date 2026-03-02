---
sidebar_label: 'Amazon RDS MariaDB'
description: 'ClickPipes のソースとして Amazon RDS MariaDB をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB ソースのセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS MariaDB ソース設定ガイド \{#rds-mariadb-source-setup-guide\}

これは、MySQL ClickPipe を介してデータをレプリケーションできるように、RDS MariaDB インスタンスを構成するためのステップバイステップガイドです。

<br/>

:::info
あわせて、MySQL の FAQ も[こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)からご確認いただくことを推奨します。FAQ ページは随時更新されています。
:::

## バイナリログの保持を有効にする \{#enable-binlog-retention-rds\}

バイナリログは、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報を含む、一連のログファイルです。バイナリログファイルはレプリケーションを行うために必要です。以下の 2 つの手順を両方とも実施する必要があります。

### 1. 自動バックアップでバイナリログを有効化する \{#enable-binlog-logging-rds\}

自動バックアップ機能は、MySQL のバイナリログを有効にするか無効にするかを制御します。これは AWS コンソールで設定できます:

<Image img={rds_backups} alt="RDS で自動バックアップを有効化する" size="lg" border/>

バックアップ保持期間は、レプリケーションのユースケースに応じて、十分に長い期間に設定することを推奨します。

### 2. Binlog 保持時間 \{#binlog-retention-hours-rds\}

Amazon RDS for MariaDB では、変更が含まれる binlog ファイルが保持される時間（binlog 保持期間）を設定する方法が異なります。binlog ファイルが削除される前に一部の変更が読み取られない場合、レプリケーションを継続できなくなります。binlog 保持時間のデフォルト値は NULL であり、これはバイナリログが保持されないことを意味します。

DB インスタンス上でバイナリログを保持する時間を指定するには、レプリケーションが行われるのに十分な長さの binlog 保持期間を指定して、mysql.rds&#95;set&#95;configuration 関数を使用します。`24 hours` が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## パラメータグループで binlog 設定を行う \{#binlog-parameter-group-rds\}

パラメータグループは、RDS コンソールで MariaDB インスタンスをクリックし、`Configurations` タブに移動すると見つけられます。

<Image img={rds_config} alt="RDS でパラメータグループを見つける場所" size="lg" border/>

パラメータグループのリンクをクリックすると、そのパラメータグループのページに移動します。右上に `Edit` ボタンが表示されます。

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

`binlog_format`、`binlog_row_metadata`、`binlog_row_image` の各設定を次のように設定する必要があります。

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog format を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog row metadata を FULL に設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog row image を FULL に設定" size="lg" border/>

次に、右上の `Save Changes` をクリックします。変更を反映させるにはインスタンスを再起動する必要がある場合があります。RDS インスタンスの Configurations タブでパラメータグループのリンクの横に `Pending reboot` と表示されている場合は、インスタンスの再起動が必要である目安になります。

<br/>

:::tip
MariaDB クラスターを使用している場合、上記のパラメータは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) パラメータグループ内にあります。
:::

## GTID モードの有効化 \{#gtid-mode-rds\}

Global Transaction Identifiers (GTID) は、MySQL/MariaDB でコミットされた各トランザクションに割り当てられる一意の ID です。これにより binlog レプリケーションが簡素化され、トラブルシューティングも行いやすくなります。MariaDB では GTID モードはデフォルトで有効になっているため、これを利用するために追加の操作を行う必要はありません。

## データベースユーザーを設定する \{#configure-database-user-rds\}

管理者ユーザーとして RDS MariaDB インスタンスに接続し、次のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例は `mysql` データベースに対する権限を示しています。レプリケーションを行いたい各データベースおよびホストごとに、これらのコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```


## ネットワークアクセスを設定する {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

RDS インスタンスへのトラフィックを制限する場合は、RDS セキュリティグループの `Inbound rules` に [ドキュメントで指定されている静的 NAT IP](../../index.md#list-of-static-ips) を追加してください。

<Image img={security_group_in_rds_mysql} alt="RDS でセキュリティグループを確認する場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループの Inbound rules を編集する" size="lg" border/>

### AWS PrivateLink を使用したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由で RDS インスタンスに接続するには、AWS PrivateLink を使用します。接続を構成するには、[ClickPipes 向け AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従ってください。