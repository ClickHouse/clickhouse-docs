---
sidebar_label: 'Amazon Aurora MySQL'
description: 'ClickPipes のソースとして Amazon Aurora MySQL をセットアップするためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL ソース設定ガイド'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog retention', 'gtid mode', 'aws']
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/aurora_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Aurora MySQL ソース設定ガイド

このステップバイステップガイドでは、[MySQL ClickPipe](../index.md) を使用して Amazon Aurora MySQL を設定し、データを ClickHouse Cloud にレプリケートする方法を説明します。MySQL CDC に関するよくある質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。



## バイナリログ保持の有効化 {#enable-binlog-retention-aurora}

バイナリログは、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。Aurora MySQLでバイナリログ保持を設定するには、[バイナリロギングを有効化](#enable-binlog-logging)し、[バイナリログ保持期間を延長](#binlog-retention-interval)する必要があります。

### 1. 自動バックアップによるバイナリロギングの有効化 {#enable-binlog-logging}

自動バックアップ機能により、MySQLのバイナリロギングのオン/オフが決定されます。自動バックアップは、RDSコンソールで**変更** > **追加設定** > **バックアップ**に移動し、**自動バックアップを有効にする**チェックボックスを選択する(まだ選択されていない場合)ことで、インスタンスに対して設定できます。

<Image
  img={rds_backups}
  alt='Auroraでの自動バックアップの有効化'
  size='lg'
  border
/>

レプリケーションのユースケースに応じて、**バックアップ保持期間**を十分に長い値に設定することを推奨します。

### 2. バイナリログ保持期間の延長 {#binlog-retention-interval}

:::warning
ClickPipesがレプリケーションを再開しようとした際に、設定されたバイナリログ保持値により必要なバイナリログファイルが削除されている場合、ClickPipeはエラー状態になり、再同期が必要になります。
:::

デフォルトでは、Aurora MySQLはバイナリログを可能な限り早く削除します(すなわち、_遅延削除_)。障害シナリオ下でレプリケーション用のバイナリログファイルの可用性を確保するため、バイナリログ保持期間を少なくとも**72時間**に延長することを推奨します。バイナリログ保持期間([`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours))を設定するには、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration)プロシージャを使用します:

[//]: # "NOTE Most CDC providers recommend the maximum retention period for Aurora RDS (7 days/168 hours). Since this has an impact on disk usage, we conservatively recommend a mininum of 3 days/72 hours."

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定が行われていない場合、または短い期間に設定されている場合、バイナリログにギャップが生じ、ClickPipesのレプリケーション再開能力が損なわれる可能性があります。


## binlog設定の構成 {#binlog-settings}

パラメータグループは、RDSコンソールでMySQLインスタンスをクリックし、**Configuration**タブに移動すると確認できます。

:::tip
MySQLクラスターを使用している場合、以下のパラメータはDBインスタンスグループではなく、[DBクラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)パラメータグループに含まれています。
:::

<Image
  img={aurora_config}
  alt='Auroraでパラメータグループを確認する場所'
  size='lg'
  border
/>

<br />
パラメータグループのリンクをクリックすると、専用ページに移動します。右上に**Edit**ボタンが表示されます。

<Image img={edit_button} alt='パラメータグループの編集' size='lg' border />

<br />
以下のパラメータを次のように設定する必要があります:

1. `binlog_format`を`ROW`に設定します。

<Image img={binlog_format} alt='BinlogフォーマットをROWに設定' size='lg' border />

2. `binlog_row_metadata`を`FULL`に設定します。

<Image img={binlog_row_metadata} alt='Binlog行メタデータ' size='lg' border />

3. `binlog_row_image`を`FULL`に設定します。

<Image img={binlog_row_image} alt='Binlog行イメージ' size='lg' border />

<br />
次に、右上の**Save Changes**をクリックします。変更を有効にするには、インスタンスの再起動が必要な場合があります。再起動が必要かどうかは、Auroraインスタンスの**Configuration**タブでパラメータグループリンクの横に`Pending reboot`と表示されているかで確認できます。


## GTIDモードの有効化（推奨） {#gtid-mode}

:::tip
MySQL ClickPipeはGTIDモードなしでのレプリケーションもサポートしていますが、パフォーマンスの向上とトラブルシューティングの容易化のため、GTIDモードの有効化を推奨します。
:::

[Global Transaction Identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)は、MySQLでコミットされた各トランザクションに割り当てられる一意のIDです。GTIDはbinlogレプリケーションを簡素化し、トラブルシューティングをより容易にします。MySQL ClickPipeがGTIDベースのレプリケーションを使用できるよう、GTIDモードの有効化を**推奨**します。

GTIDベースのレプリケーションは、Amazon Aurora MySQL v2（MySQL 5.7）およびv3（MySQL 8.0）、ならびにAurora Serverless v2でサポートされています。Aurora MySQLインスタンスでGTIDモードを有効化するには、以下の手順に従ってください：

1. RDSコンソールで、MySQLインスタンスをクリックします。
2. **Configuration**タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上の**Edit**ボタンをクリックします。
5. `enforce_gtid_consistency`を`ON`に設定します。
6. `gtid-mode`を`ON`に設定します。
7. 右上の**Save Changes**をクリックします。
8. 変更を有効にするため、インスタンスを再起動します。

<Image img={enable_gtid} alt='GTID有効化' size='lg' border />


## データベースユーザーの設定 {#configure-database-user}

管理者ユーザーとしてAurora MySQLインスタンスに接続し、以下のコマンドを実行してください:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
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

Aurora MySQLインスタンスへのトラフィックを制限するには、Auroraセキュリティグループの**インバウンドルール**に[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)を追加します。

<Image
  img={security_group_in_rds_mysql}
  alt='Aurora MySQLでセキュリティグループを見つける場所'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='上記のセキュリティグループのインバウンドルールを編集'
  size='lg'
  border
/>

### AWS PrivateLinkによるプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由でAurora MySQLインスタンスに接続するには、AWS PrivateLinkを使用します。接続を設定するには、[ClickPipes用AWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。


## 次のステップ {#whats-next}

Amazon Aurora MySQLインスタンスのbinlogレプリケーション設定とClickHouse Cloudへの安全な接続が完了しました。これで[最初のMySQL ClickPipeを作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDCに関するよくある質問については、[MySQL FAQページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。
