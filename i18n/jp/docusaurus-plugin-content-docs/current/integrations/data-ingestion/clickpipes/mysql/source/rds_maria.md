---
sidebar_label: 'Amazon RDS MariaDB'
description: 'ClickPipesのソースとしてAmazon RDS MariaDBを設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB ソース設定ガイド'
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


# RDS MariaDB ソース設定ガイド

これは、RDS MariaDB インスタンスを MySQL ClickPipe 経由でデータをレプリケーションするために構成する手順のガイドです。
<br/>
:::info
MySQL の FAQ を [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)で確認することをお勧めします。FAQ ページは現在も更新されています。
:::

## バイナリログ保持の有効化 {#enable-binlog-retention-rds}
バイナリログは、MySQL サーバインスタンスに対するデータ変更に関する情報を含むログファイルのセットです。レプリケーションにはバイナリログファイルが必要です。以下の両方の手順を実行する必要があります。

### 1. 自動バックアップを介してバイナリログを有効にする {#enable-binlog-logging-rds}

自動バックアップ機能は、MySQL に対するバイナリログがオンまたはオフになっているかを決定します。AWS コンソールで設定できます：

<Image img={rds_backups} alt="RDSにおける自動バックアップの有効化" size="lg" border/>

レプリケーションのユースケースに応じて、バックアップの保持期間を合理的に長く設定することをお勧めします。

### 2. バイナリログ保持時間 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB では、バイナリログの保持時間を設定する方法が異なります。これは、変更を含むバイナリログファイルが保持される時間のことです。バイナリログファイルが削除される前に、変更が読み取られない場合、レプリケーションは継続できません。バイナリログの保持時間のデフォルト値は NULL で、これはバイナリログが保持されないことを意味します。

DB インスタンス上でバイナリログを保持する時間を指定するには、mysql.rds_set_configuration 関数を使用して、レプリケーションが発生するのに十分なバイナリログの保持期間を指定します。 `24時間` が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## パラメータグループ内のバイナリログ設定を構成する {#binlog-parameter-group-rds}

パラメータグループは、RDS コンソールで MariaDB インスタンスをクリックし、`Configurations` タブに移動すると見つかります。

<Image img={rds_config} alt="RDS内のパラメータグループの見つけ方" size="lg" border/>

パラメータグループのリンクをクリックすると、パラメータグループのリンクページに移動します。右上に Edit ボタンが表示されます：

<Image img={edit_button} alt="パラメータグループの編集" size="lg" border/>

`binlog_format`, `binlog_row_metadata`、および `binlog_row_image` を以下のように設定する必要があります：

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog形式をROWに設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog行メタデータをFULLに設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog行イメージをFULLに設定" size="lg" border/>

次に、右上の `Save Changes` をクリックします。変更を有効にするためにインスタンスを再起動する必要があるかもしれません。RDS インスタンスの Configurations タブで、パラメータグループのリンクの横に `Pending reboot` が表示されている場合は、インスタンスを再起動する必要があることを良い兆候とみなしてください。

<br/>
:::tip
MariaDB クラスターがある場合、上記のパラメータは [DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) のパラメータグループで見つかり、DB インスタンスグループにはありません。
:::

## GTIDモードの有効化 {#gtid-mode-rds}
グローバルトランザクションID (GTID) は、MySQL/MariaDB の各コミット済みトランザクションに割り当てられる一意のIDです。これにより、バイナリログのレプリケーションを簡素化し、トラブルシューティングがより簡単になります。MariaDB はデフォルトで GTID モードを有効にしているため、使用するためにユーザーアクションは必要ありません。

## データベースユーザーの構成 {#configure-database-user-rds}

管理ユーザーとして RDS MariaDB インスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマの権限を付与します。以下の例は `mysql` データベースに対する権限を示しています。レプリケートしたい各データベースとホストについて、このコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

RDS インスタンスへのトラフィックを制限したい場合は、RDS セキュリティグループの `Inbound rules` に [文書化された静的 NAT IP](../../index.md#list-of-static-ips) を追加してください。

<Image img={security_group_in_rds_mysql} alt="RDS内のセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループに対する受信ルールの編集" size="lg" border/>

### AWS PrivateLinkを通じたプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して RDS インスタンスに接続するには、AWS PrivateLink を使用します。接続の設定については、[ClickPipesのためのAWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。
