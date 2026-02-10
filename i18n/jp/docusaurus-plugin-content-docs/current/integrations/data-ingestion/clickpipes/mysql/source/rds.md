---
sidebar_label: 'Amazon RDS MySQL'
description: 'Amazon RDS MySQL を ClickPipes のソースとして設定するためのステップバイステップガイド'
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

このステップバイステップガイドでは、[MySQL ClickPipe](../index.md) を使用して、Amazon RDS MySQL から ClickHouse Cloud へデータをレプリケートするように構成する方法を説明します。MySQL CDC に関するよくある質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。

## バイナリログの保持を有効化する \{#enable-binlog-retention-rds\}

バイナリログは、MySQL サーバーインスタンス上で行われたデータ変更に関する情報を含むログファイル群であり、レプリケーションにはバイナリログファイルが必須です。RDS MySQL でバイナリログの保持を設定するには、[バイナリログを有効に](#enable-binlog-logging)し、[binlog の保持期間を延長](#binlog-retention-interval)する必要があります。

### 1. 自動バックアップでバイナリログを有効化する \{#enable-binlog-logging\}

自動バックアップ機能は、MySQL のバイナリログを有効にするか無効にするかを制御します。自動バックアップは、RDS コンソールでインスタンスの **Modify** > **Additional configuration** > **Backup** に移動し、**Enable automated backups** チェックボックスを（まだ選択していない場合は）選択することで設定できます。

<Image img={rds_backups} alt="RDS で自動バックアップを有効化する" size="lg" border/>

レプリケーションのユースケースに応じて、**Backup retention period** を十分に長い値に設定することを推奨します。

### 2. binlog の保持期間を延長する \{#binlog-retention-interval\}

:::warning
ClickPipes がレプリケーションの再開を試みた際に、設定されている binlog の保持期間の値によって必要な binlog ファイルが削除されている場合、ClickPipe はエラー状態となり、再同期が必要になります。
:::

デフォルトでは、Amazon RDS は可能な限り早くバイナリログを削除します（*lazy purging*）。障害発生時のシナリオにおいてもレプリケーション用のバイナリログファイルを利用できるようにするため、binlog の保持期間は少なくとも **72 時間** に延長することを推奨します。バイナリログの保持期間（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)）を設定するには、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) ストアドプロシージャを使用します。

[//]: # "注: ほとんどの CDC プロバイダーは、RDS における最大の保持期間（7 日/168 時間）を推奨しています。これはディスク使用量に影響するため、本書では控えめに 3 日/72 時間を最小値として推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定を行っていないか、間隔を短く設定しすぎている場合、バイナリログに欠落が生じ、ClickPipes がレプリケーションを再開できなくなる可能性があります。


## binlog 設定を構成する \{#binlog-settings\}

パラメータグループは、RDS コンソールで対象の MySQL インスタンスをクリックし、**Configuration** タブに移動すると確認できます。

:::tip
MySQL クラスターを使用している場合、以下のパラメータは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) パラメータグループにあります。
:::

<Image img={rds_config} alt="RDS でパラメータグループを確認できる場所" size="lg" border/>

<br/>

パラメータグループのリンクをクリックすると、その専用ページに移動します。右上に **Edit** ボタンが表示されているはずです。

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

次のパラメータを、以下のように設定する必要があります。

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog format を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog row metadata を FULL に設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog row image を FULL に設定" size="lg" border/>

<br/>

その後、右上の **Save Changes** をクリックします。変更を反映させるにはインスタンスの再起動が必要になる場合があります。これを確認する方法の 1 つは、RDS インスタンスの **Configuration** タブで、パラメータグループのリンクの横に `Pending reboot` と表示されているかどうかを確認することです。

## GTID モードを有効にする \{#gtid-mode\}

:::tip
MySQL ClickPipe は GTID モードなしのレプリケーションもサポートしています。ただし、パフォーマンス向上とトラブルシューティングの容易化のために、GTID モードを有効化することを推奨します。
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) は、MySQL でコミットされた各トランザクションに割り当てられる一意の ID です。これにより binlog レプリケーションが簡素化され、トラブルシューティングも容易になります。MySQL ClickPipe が GTID ベースのレプリケーションを利用できるよう、GTID モードを有効化することを**推奨**します。

GTID ベースのレプリケーションは、Amazon RDS for MySQL バージョン 5.7、8.0、および 8.4 でサポートされています。Aurora MySQL インスタンスで GTID モードを有効にするには、次の手順に従います。

1. RDS コンソールで、対象の MySQL インスタンスをクリックします。
2. **Configuration** タブをクリックします。
3. パラメーターグループのリンクをクリックします。
4. 右上の **Edit** ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の **Save Changes** をクリックします。
8. 変更を反映させるためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID enabled" size="lg" border/>

<br/>

:::tip
MySQL ClickPipe は GTID モードなしのレプリケーションもサポートしています。ただし、パフォーマンス向上とトラブルシューティングの容易化のために、GTID モードを有効化することを推奨します。
:::

## データベースユーザーを構成する \{#configure-database-user\}

管理者ユーザーとして RDS MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例では、`mysql` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストごとに、これらのコマンドを繰り返し実行してください：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスを設定する \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

Aurora MySQL インスタンスへのトラフィックを制限するには、[ドキュメントに記載されている固定 NAT IP](../../index.md#list-of-static-ips) を RDS セキュリティグループの **インバウンドルール** に追加します。

<Image img={security_group_in_rds_mysql} alt="RDS MySQL でセキュリティグループを確認できる場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集する" size="lg" border/>

### AWS PrivateLink によるプライベートアクセス \{#private-access-via-aws-privatelink\}

プライベートネットワーク経由で RDS インスタンスに接続するには、AWS PrivateLink を利用できます。接続を構成するには、[ClickPipes 用 AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従ってください。

## 次のステップ \{#next-steps\}

Amazon RDS MySQL インスタンスの binlog レプリケーションの設定と ClickHouse Cloud への安全な接続が完了したら、[最初の MySQL ClickPipe を作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDC（変更データキャプチャ）に関するよくある質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。