---
sidebar_label: 'Amazon Aurora MySQL'
description: 'ClickPipes のソースとして Amazon Aurora MySQL を設定するためのステップバイステップのガイド'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL ソース設定ガイド'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog 保持期間', 'GTID モード', 'aws']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# Aurora MySQL ソース設定ガイド \{#aurora-mysql-source-setup-guide\}

このステップバイステップガイドでは、[MySQL ClickPipe](../index.md) を使用して Amazon Aurora MySQL を構成し、データを ClickHouse Cloud にレプリケートする方法を説明します。MySQL の CDC に関するよくある質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。

## バイナリログの保持を有効にする \{#enable-binlog-retention-aurora\}

バイナリログは、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報を含む複数のログファイルからなるものであり、レプリケーションにはバイナリログファイルが必須です。Aurora MySQL でバイナリログの保持を設定するには、[バイナリログを有効にし](#enable-binlog-logging)、[binlog の保持間隔を延長](#binlog-retention-interval)する必要があります。

### 1. 自動バックアップによるバイナリログの有効化 \{#enable-binlog-logging\}

自動バックアップ機能によって、MySQL のバイナリログを有効にするかどうかが決まります。自動バックアップは、RDS コンソールで対象インスタンスの **Modify** > **Additional configuration** > **Backup** に移動し、**Enable automated backups** チェックボックスを有効にすることで設定できます（まだ有効になっていない場合）。

<Image img={rds_backups} alt="Aurora で自動バックアップを有効化する" size="lg" border/>

レプリケーションのユースケースに応じて、**Backup retention period** を十分に長めの値に設定することを推奨します。

### 2. binlog の保持期間を延長する \{#binlog-retention-interval\}

:::warning
ClickPipes がレプリケーションの再開を試みた際に、設定された binlog の保持期間により必要な binlog ファイルが削除されている場合、ClickPipe はエラー状態に遷移し、再同期が必要になります。
:::

デフォルトでは、Aurora MySQL は可能な限り早くバイナリログを削除します（*遅延パージ*）。障害発生時のシナリオにおいてもレプリケーションに必要なバイナリログファイルを利用可能な状態にしておくため、binlog の保持期間を少なくとも **72 時間** に延長することを推奨します。バイナリログの保持期間（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)）を設定するには、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) プロシージャを使用してください。

[//]: # "注: ほとんどの CDC（変更データキャプチャ）プロバイダは、Aurora RDS の最大保持期間（7 日/168 時間）を推奨しています。これはディスク使用量に影響するため、本ガイドでは控えめに 3 日/72 時間を下限として推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定が行われていないか、または間隔が短く設定されている場合、バイナリログにギャップが生じ、ClickPipes がレプリケーションを再開できなくなるおそれがあります。


## binlog 設定を行う \{#binlog-settings\}

パラメータグループは、RDS コンソールで対象の MySQL インスタンスをクリックし、**Configuration** タブに移動すると見つけられます。

:::tip
MySQL クラスターを使用している場合、以下のパラメータは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)のパラメータグループにあります。
:::

<Image img={aurora_config} alt="Aurora でパラメータグループを確認できる場所" size="lg" border/>

<br/>

パラメータグループのリンクをクリックすると、その専用ページに移動します。右上に **Edit** ボタンが表示されているはずです。

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

<br/>

次のパラメータを、下記のように設定します。

1. `binlog_format` を `ROW` に設定。

<Image img={binlog_format} alt="Binlog format を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定。

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定。

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>

設定後、右上隅の **Save Changes** をクリックします。変更を反映させるにはインスタンスの再起動が必要な場合があります。再起動が必要かどうかは、Aurora インスタンスの **Configuration** タブで、パラメータグループのリンクの横に `Pending reboot` が表示されているかどうかで確認できます。

## GTID モードを有効化する（推奨） \{#gtid-mode\}

:::tip
MySQL ClickPipe は、GTID モードを使用しないレプリケーションにも対応しています。ただし、パフォーマンス向上とトラブルシューティングの容易化のため、GTID モードを有効化することを推奨します。
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) は、MySQL でコミットされた各トランザクションに割り当てられる一意の ID です。これによりバイナリログ（binlog）レプリケーションが簡素化され、トラブルシューティングもしやすくなります。MySQL ClickPipe が GTID ベースのレプリケーションを利用できるように、GTID モードを有効化することを**推奨**します。

GTID ベースのレプリケーションは、Amazon Aurora MySQL v2（MySQL 5.7）および v3（MySQL 8.0）、さらに Aurora Serverless v2 でサポートされています。Aurora MySQL インスタンスで GTID モードを有効化するには、次の手順に従います。

1. RDS コンソールで、対象の MySQL インスタンスをクリックします。
2. **Configuration** タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上の **Edit** ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の **Save Changes** をクリックします。
8. 変更を反映するためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID 有効化済み" size="lg" border/>

## データベースユーザーの設定 \{#configure-database-user\}

管理者権限を持つユーザーで Aurora MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 専用のユーザーを作成します:

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例では、`mysql` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストごとに、これらのコマンドを繰り返し実行してください:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスを設定する \{#configure-network-access\}

### IP ベースのアクセス制御 \{#ip-based-access-control\}

Aurora MySQL インスタンスへのトラフィックを制限するには、[ドキュメントで定義されている固定 NAT IP](../../index.md#list-of-static-ips) を Aurora セキュリティグループの **インバウンドルール** に追加します。

<Image img={security_group_in_rds_mysql} alt="Aurora MySQL でセキュリティグループを確認できる場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink を使用したプライベートアクセス \{#private-access-via-aws-privatelink\}

プライベートネットワーク経由で Aurora MySQL インスタンスに接続するには、AWS PrivateLink を使用します。接続を構成するには、[ClickPipes 向け AWS PrivateLink 設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) に従ってください。

## 次のステップ \{#whats-next\}

Amazon Aurora MySQL インスタンスを binlog レプリケーション用に構成し、ClickHouse Cloud へセキュアに接続できるようになったら、[最初の MySQL ClickPipe を作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDC に関するよくある質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。