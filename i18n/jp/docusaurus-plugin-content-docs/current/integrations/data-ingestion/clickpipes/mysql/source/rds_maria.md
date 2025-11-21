---
sidebar_label: 'Amazon RDS MariaDB'
description: 'ClickPipes のソースとして Amazon RDS MariaDB をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/rds_maria
title: 'RDS MariaDB ソースセットアップガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
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

このガイドでは、MySQL ClickPipe を通じてデータをレプリケートできるように、RDS MariaDB インスタンスを設定するための手順を段階的に説明します。
<br/>
:::info
あわせて、MySQL の FAQ も[こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)からご覧になることをお勧めします。FAQ ページは随時更新されています。
:::



## バイナリログの保持を有効にする {#enable-binlog-retention-rds}

バイナリログは、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルの集合です。バイナリログファイルはレプリケーションに必要です。以下の両方の手順に従う必要があります:

### 1. 自動バックアップによるバイナリログの有効化{#enable-binlog-logging-rds}

自動バックアップ機能により、MySQLのバイナリログの有効/無効が決定されます。AWSコンソールで設定できます:

<Image
  img={rds_backups}
  alt='RDSで自動バックアップを有効にする'
  size='lg'
  border
/>

レプリケーションのユースケースに応じて、バックアップ保持期間を適切に長い値に設定することを推奨します。

### 2. バイナリログ保持時間{#binlog-retention-hours-rds}

Amazon RDS for MariaDBには、バイナリログ保持期間を設定する独自の方法があります。これは、変更を含むバイナリログファイルが保持される時間の長さです。バイナリログファイルが削除される前に一部の変更が読み取られない場合、レプリケーションを継続できなくなります。バイナリログ保持時間のデフォルト値はNULLであり、これはバイナリログが保持されないことを意味します。

DBインスタンスでバイナリログを保持する時間数を指定するには、mysql.rds_set_configuration関数を使用し、レプリケーションが実行されるのに十分な長さのバイナリログ保持期間を設定します。`24時間`が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```


## パラメータグループでbinlog設定を構成する {#binlog-parameter-group-rds}

パラメータグループは、RDSコンソールでMariaDBインスタンスをクリックし、`Configurations`タブに移動すると確認できます。

<Image
  img={rds_config}
  alt='RDSでパラメータグループを確認する場所'
  size='lg'
  border
/>

パラメータグループのリンクをクリックすると、パラメータグループのページに移動します。右上に編集ボタンが表示されます:

<Image img={edit_button} alt='パラメータグループを編集' size='lg' border />

`binlog_format`、`binlog_row_metadata`、`binlog_row_image`の設定を以下のように構成する必要があります:

1. `binlog_format`を`ROW`に設定します。

<Image img={binlog_format} alt='Binlog formatをROWに設定' size='lg' border />

2. `binlog_row_metadata`を`FULL`に設定します

<Image
  img={binlog_row_metadata}
  alt='Binlog row metadataをFULLに設定'
  size='lg'
  border
/>

3. `binlog_row_image`を`FULL`に設定します

<Image img={binlog_row_image} alt='Binlog row imageをFULLに設定' size='lg' border />

次に、右上の`Save Changes`をクリックします。変更を有効にするには、インスタンスの再起動が必要になる場合があります。RDSインスタンスのConfigurationsタブでパラメータグループのリンクの横に`Pending reboot`と表示されている場合は、インスタンスの再起動が必要であることを示しています。

<br />
:::tip MariaDBクラスターをお使いの場合、上記のパラメータは[DBクラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)パラメータグループに存在し、DBインスタンスグループには存在しません。 :::


## GTIDモードの有効化 {#gtid-mode-rds}

グローバルトランザクション識別子（GTID）は、MySQL/MariaDBでコミットされた各トランザクションに割り当てられる一意のIDです。GTIDはbinlogレプリケーションを簡素化し、トラブルシューティングをより簡単にします。MariaDBはデフォルトでGTIDモードが有効になっているため、使用にあたってユーザー側の操作は不要です。


## データベースユーザーの設定 {#configure-database-user-rds}

管理者ユーザーとしてRDS MariaDBインスタンスに接続し、以下のコマンドを実行してください:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. スキーマ権限を付与します。以下の例は`mysql`データベースに対する権限を示しています。レプリケートする各データベースとホストに対してこれらのコマンドを繰り返してください:

   ```sql
   GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
   ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## ネットワークアクセスの設定 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

RDSインスタンスへのトラフィックを制限する場合は、RDSセキュリティグループの`Inbound rules`に[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)を追加してください。

<Image
  img={security_group_in_rds_mysql}
  alt='RDSでセキュリティグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='上記のセキュリティグループのインバウンドルールを編集'
  size='lg'
  border
/>

### AWS PrivateLinkを介したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由でRDSインスタンスに接続するには、AWS PrivateLinkを使用できます。接続を設定するには、[ClickPipes用のAWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。
