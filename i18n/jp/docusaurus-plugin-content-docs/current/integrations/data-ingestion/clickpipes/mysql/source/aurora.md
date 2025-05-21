---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Step-by-step guide on how to set up Amazon Aurora MySQL as a source for ClickPipes'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQLソース設定ガイド'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import aurora_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';


# Aurora MySQLソース設定ガイド

これは、MySQL ClickPipeを介してデータをレプリケーションするために、Aurora MySQLインスタンスを構成する手順を示したガイドです。
<br/>
:::info
MySQLのFAQもこちらで確認することをお勧めします [here](/integrations/data-ingestion/clickpipes/mysql/faq.md)。FAQページは定期的に更新されています。
:::

## バイナリログ保持の有効化 {#enable-binlog-retention-aurora}
バイナリログは、MySQLサーバインスタンスで行われたデータの変更に関する情報を含む一連のログファイルであり、レプリケーションにはバイナリログファイルが必要です。以下の手順を両方遂行する必要があります。

### 1. 自動バックアップを介してバイナリログを有効化 {#enable-binlog-logging-aurora}
自動バックアップ機能は、MySQLのバイナリログがオンまたはオフになっているかを決定します。AWSコンソールで設定できます：

<Image img={rds_backups} alt="Auroraでの自動バックアップの有効化" size="lg" border/>

レプリケーションの使用ケースに応じて、バックアップ保持期間を適切に長い値に設定することをお勧めします。

### 2. バイナリログ保持期間 {#binlog-retention-hours-aurora}
以下の手順を呼び出して、レプリケーションのためにバイナリログの可用性を確保する必要があります：

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```
この設定が行われていない場合、Amazon RDSはバイナリログを可能な限り早く削除し、バイナリログにギャップが生じます。

## パラメーターグループでのバイナリログ設定の構成 {#binlog-parameter-group-aurora}

パラメーターグループは、RDSコンソールでMySQLインスタンスをクリックし、次に`Configurations`タブに移動すると見つけることができます。

<Image img={aurora_config} alt="RDSでのパラメーターグループの見つけ方" size="lg" border/>

パラメーターグループリンクをクリックすると、そのページに移動します。右上に「Edit」ボタンが表示されます。

<Image img={edit_button} alt="パラメーターグループの編集" size="lg" border/>

次の設定を次のように設定する必要があります：

1. `binlog_format`を`ROW`に設定。

<Image img={binlog_format} alt="バイナリログ形式をROWに設定" size="lg" border/>

2. `binlog_row_metadata`を`FULL`に設定。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータ" size="lg" border/>

3. `binlog_row_image`を`FULL`に設定。

<Image img={binlog_row_image} alt="バイナリログ行画像" size="lg" border/>

その後、右上の`Save Changes`をクリックします。変更を適用するにはインスタンスを再起動する必要がある場合があります。これを確認する方法は、RDSインスタンスのConfigurationsタブ内のパラメーターグループリンクの横に`Pending reboot`が表示されることです。
<br/>
:::tip
MySQLクラスタがある場合、上記のパラメータはDBインスタンスグループではなく、[DBクラスタ](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)パラメータグループに存在します。
:::

## GTIDモードの有効化 {#gtid-mode-aurora}
グローバルトランザクション識別子（GTID）は、MySQLでコミットされた各トランザクションに割り当てられる一意のIDです。これにより、バイナリログのレプリケーションが簡素化され、トラブルシューティングが容易になります。

MySQLインスタンスがMySQL 5.7、8.0、または8.4の場合、MySQL ClickPipeがGTIDレプリケーションを使用できるようにGTIDモードを有効にすることをお勧めします。

MySQLインスタンスでGTIDモードを有効にする方法は次のとおりです：
1. RDSコンソールでMySQLインスタンスをクリックします。
2. `Configurations`タブをクリックします。
3. パラメーターグループリンクをクリックします。
4. 右上隅の`Edit`ボタンをクリックします。
5. `enforce_gtid_consistency`を`ON`に設定します。
6. `gtid-mode`を`ON`に設定します。
7. 右上隅の`Save Changes`をクリックします。
8. 変更を適用するためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTIDが有効" size="lg" border/>

<br/>
:::info
MySQL ClickPipeはGTIDモードなしでのレプリケーションもサポートしています。ただし、パフォーマンス向上とトラブルシューティングの容易さのために、GTIDモードを有効にすることをお勧めします。
:::

## データベースユーザーの構成 {#configure-database-user-aurora}

管理者ユーザーとしてAurora MySQLインスタンスに接続し、次のコマンドを実行します：

1. ClickPipes専用のユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は、`mysql`データベースの権限を示しています。レプリケーションしたい各データベースとホストについて、これらのコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

Auroraインスタンスへのトラフィックを制限したい場合は、以下のようにAuroraセキュリティグループの`Inbound rules`に[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)を追加してください：

<Image img={security_group_in_rds_mysql} alt="Aurora MySQLでのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのためのインバウンドルールの編集" size="lg" border/>

### AWS PrivateLink経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介してAuroraインスタンスに接続するには、AWS PrivateLinkを使用できます。接続を設定するための[ClickPipes用AWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。
