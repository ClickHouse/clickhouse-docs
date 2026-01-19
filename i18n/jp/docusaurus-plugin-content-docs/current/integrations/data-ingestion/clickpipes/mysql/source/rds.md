---
sidebar_label: 'Amazon RDS MySQL'
description: 'ClickPipes のソースとして Amazon RDS MySQL をセットアップするためのステップバイステップのガイド'
slug: /integrations/clickpipes/mysql/source/rds
title: 'RDS MySQL ソース設定ガイド'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'インジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import rds_backups from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/rds-backups.png';
import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import security_group_in_rds_mysql from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/rds/security-group-in-rds-mysql.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import rds_config from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/rds_config.png';
import binlog_format from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_format.png';
import binlog_row_image from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_image.png';
import binlog_row_metadata from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/binlog_row_metadata.png';
import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/parameter_group/edit_button.png';
import enable_gtid from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/enable_gtid.png';
import Image from '@theme/IdealImage';

# RDS MySQL ソース設定ガイド \{#rds-mysql-source-setup-guide\}

このステップバイステップガイドでは、[MySQL ClickPipe](../index.md) を使用して、Amazon RDS MySQL から ClickHouse Cloud へデータを複製するように設定する方法を説明します。MySQL における CDC（変更データキャプチャ）に関する一般的な質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。

## バイナリログの保持を有効にする \{#enable-binlog-retention-rds\}

バイナリログは、MySQL サーバーインスタンスで行われたデータ変更に関する情報を含むログファイル群であり、レプリケーションにはバイナリログファイルが必須です。RDS MySQL でバイナリログの保持を構成するには、[バイナリログを有効に](#enable-binlog-logging)し、[binlog の保持期間を延長](#binlog-retention-interval)する必要があります。

### 1. 自動バックアップを利用してバイナリログを有効にする \{#enable-binlog-logging\}

自動バックアップ機能は、MySQL においてバイナリログを有効にするかどうかを決定します。自動バックアップは、RDS コンソールで対象インスタンスに移動し、**Modify** &gt; **Additional configuration** &gt; **Backup** の順に選択し、**Enable automated backups** チェックボックスをオンにすることで（まだオンでない場合）構成できます。

<Image img={rds_backups} alt="RDS で自動バックアップを有効化する" size="lg" border />

レプリケーションのユースケースに応じて、**Backup retention period** は十分に長い値に設定することを推奨します。

### 2. binlog の保持期間を延長する \{#binlog-retention-interval\}

:::warning
ClickPipes がレプリケーションの再開を試みた際に、設定されている binlog の保持期間により必要な binlog ファイルがすでに削除されている場合、ClickPipe はエラー状態となり、再同期が必要になります。
:::

デフォルトでは、Amazon RDS は可能な限り早期にバイナリログを削除します（*lazy purging*）。障害シナリオにおいてもレプリケーション用のバイナリログファイルが利用可能であるよう、binlog の保持期間を少なくとも **72 時間** に延長することを推奨します。バイナリログの保持期間（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)）を設定するには、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) プロシージャを使用します。

[//]: # "注意: ほとんどの CDC プロバイダーは、RDS における最大保持期間（7 日/168 時間）を推奨しています。これはディスク使用量に影響するため、本書では保守的に最小 3 日/72 時間を推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定が行われていないか、保持間隔が短すぎる値に設定されていると、バイナリログに欠落が生じ、ClickPipes によるレプリケーションの再開ができなくなるおそれがあります。


## バイナリログ設定の構成 \{#binlog-settings\}

パラメーターグループは、RDS コンソールで MySQL インスタンスをクリックし、**Configuration** タブに移動すると表示されます。

:::tip
MySQL クラスターを使用している場合、以下のパラメーターは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)用のパラメーターグループにあります。
:::

<Image img={rds_config} alt="RDS でパラメーターグループを確認できる場所" size="lg" border/>

<br/>
パラメーターグループのリンクをクリックすると、そのページに移動します。右上に **Edit** ボタンが表示されているはずです。

<Image img={edit_button} alt="パラメーターグループの編集" size="lg" border/>

次のパラメーターを以下のように設定します。

1. `binlog_format` を `ROW` に設定

<Image img={binlog_format} alt="Binlog format を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定

<Image img={binlog_row_metadata} alt="Binlog row metadata を FULL に設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定

<Image img={binlog_row_image} alt="Binlog row image を FULL に設定" size="lg" border/>

<br/>
設定が完了したら、右上の **Save Changes** をクリックします。変更を反映するにはインスタンスを再起動する必要がある場合があります。RDS インスタンスの **Configuration** タブ内で、パラメーターグループリンクの横に `Pending reboot` と表示されている場合は、再起動が必要です。

## GTID モードを有効化する \{#gtid-mode\}

:::tip
MySQL ClickPipe は、GTID モードを使用しないレプリケーションにも対応しています。ただし、より高いパフォーマンスとトラブルシューティングの容易さのために、GTID モードを有効にすることを推奨します。
:::

[Global Transaction Identifiers (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) は、MySQL の各コミット済みトランザクションに割り当てられる一意の ID です。これにより binlog レプリケーションが簡素化され、トラブルシューティングも容易になります。MySQL ClickPipe が GTID ベースのレプリケーションを利用できるようにするため、GTID モードを有効にすることを**推奨**します。

GTID ベースのレプリケーションは、Amazon RDS for MySQL バージョン 5.7、8.0、8.4 でサポートされています。Aurora MySQL インスタンスで GTID モードを有効にするには、次の手順に従います。

1. RDS コンソールで、対象の MySQL インスタンスをクリックします。
2. **Configuration** タブをクリックします。
3. パラメーターグループのリンクをクリックします。
4. 右上の **Edit** ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の **Save Changes** をクリックします。
8. 変更を反映するためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID enabled" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe は、GTID モードを使用しないレプリケーションにも対応しています。ただし、より高いパフォーマンスとトラブルシューティングの容易さのために、GTID モードを有効にすることを推奨します。
:::

## データベースユーザーの設定 \{#configure-database-user\}

RDS MySQL インスタンスに管理者ユーザーとして接続し、以下のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します。

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例は `mysql` データベースに対する権限を示しています。複製したい各データベースおよびホストに対して、これらのコマンドを繰り返してください。

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

Aurora MySQL インスタンスへのトラフィックを制限するには、[ドキュメントに記載されている静的 NAT IP](../../index.md#list-of-static-ips) を RDS セキュリティグループの **インバウンドルール** に追加します。

<Image img={security_group_in_rds_mysql} alt="RDS MySQL でセキュリティグループを確認する場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集する" size="lg" border/>

### AWS PrivateLink によるプライベートアクセス \{#private-access-via-aws-privatelink\}

プライベートネットワーク経由で RDS インスタンスに接続するには、AWS PrivateLink を使用します。接続を設定するには、[ClickPipes 用 AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) に従ってください。

## 次のステップ \{#next-steps\}

Amazon RDS MySQL インスタンスの binlog レプリケーションが構成され、ClickHouse Cloud へのセキュアな接続も完了したら、[最初の MySQL ClickPipe を作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDC に関する一般的な質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。