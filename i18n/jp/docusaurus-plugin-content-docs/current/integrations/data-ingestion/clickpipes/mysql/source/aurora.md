---
sidebar_label: 'Amazon Aurora MySQL'
description: 'Amazon Aurora MySQL を ClickPipes のソースとして設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/aurora
title: 'Aurora MySQL ソースのセットアップガイド'
doc_type: 'guide'
keywords: ['aurora mysql', 'clickpipes', 'binlog 保持期間', 'gtid モード', 'aws']
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


# Aurora MySQL ソースセットアップガイド

このガイドでは、[MySQL ClickPipe](../index.md) を使用して Amazon Aurora MySQL を構成し、データを ClickHouse Cloud にレプリケートする手順をステップバイステップで説明します。MySQL の CDC（変更データキャプチャ）に関する一般的な質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md) を参照してください。



## バイナリログの保持を有効にする

バイナリログは、MySQL サーバーインスタンスで行われたデータ変更に関する情報を含む一連のログファイルであり、レプリケーションにはバイナリログファイルが必要です。Aurora MySQL でバイナリログの保持を構成するには、[バイナリログを有効に](#enable-binlog-logging)し、[binlog の保持期間を延長](#binlog-retention-interval)する必要があります。

### 1. 自動バックアップ経由でバイナリログを有効にする

自動バックアップ機能は、MySQL のバイナリログを有効にするかどうかを決定します。RDS コンソールでインスタンスの自動バックアップを構成するには、**Modify** &gt; **Additional configuration** &gt; **Backup** に移動し、（まだ選択されていない場合は）**Enable automated backups** チェックボックスを選択します。

<Image img={rds_backups} alt="Aurora で自動バックアップを有効化する" size="lg" border />

レプリケーションのユースケースに応じて、**Backup retention period** を十分に長い値に設定することを推奨します。

### 2. binlog の保持期間を延長する

:::warning
ClickPipes がレプリケーションの再開を試みた際に、設定されている binlog の保持期間によって必要な binlog ファイルが削除されていると、ClickPipe はエラー状態となり、再同期が必要になります。
:::

デフォルトでは、Aurora MySQL は可能な限り早くバイナリログを削除します（*lazy purging*）。障害シナリオにおいてもレプリケーション用のバイナリログファイルを確保できるよう、binlog の保持期間は少なくとも **72 時間** に延長することを推奨します。バイナリログの保持期間（[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)）を設定するには、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration) ストアドプロシージャを使用します。

[//]: # "NOTE ほとんどの CDC プロバイダーは、Aurora RDS に対して最大の保持期間（7 日間 / 168 時間）を推奨しています。これはディスク使用量に影響を与えるため、本ドキュメントでは保守的に、最小 3 日間 / 72 時間を推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定が行われていない場合、または間隔が短すぎる場合、バイナリログに欠落が生じ、ClickPipes がレプリケーションを再開できなくなるおそれがあります。


## binlog 設定の構成 {#binlog-settings}

パラメーターグループは、RDS コンソールで対象の MySQL インスタンスをクリックし、**Configuration** タブを開くと確認できます。

:::tip
MySQL クラスターを使用している場合、以下のパラメーターは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)のパラメーターグループにあります。
:::

<Image img={aurora_config} alt="Aurora でパラメーターグループを確認できる場所" size="lg" border/>

<br/>
パラメーターグループのリンクをクリックすると、その専用ページに移動します。右上に **Edit** ボタンが表示されているはずです。

<Image img={edit_button} alt="パラメーターグループの編集" size="lg" border/>

<br/>
次のパラメーターを、以下の値に設定します。

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog format を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>
設定後、右上の **Save Changes** をクリックします。変更を反映するためにインスタンスの再起動が必要になる場合があります。Aurora インスタンスの **Configuration** タブで、パラメーターグループのリンクの横に `Pending reboot` と表示されているかどうかを確認すると判断できます。



## GTID モードを有効化する（推奨） {#gtid-mode}

:::tip
MySQL ClickPipe は、GTID モードを使用しないレプリケーションもサポートしています。ただし、パフォーマンス向上とトラブルシューティングの容易化のため、GTID モードを有効にすることを推奨します。
:::

[Global Transaction Identifiers (GTIDs)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html) は、MySQL でコミットされた各トランザクションに割り当てられる一意の ID です。これによりバイナリログ（binlog）レプリケーションが簡素化され、トラブルシューティングも容易になります。MySQL ClickPipe が GTID ベースのレプリケーションを利用できるようにするため、GTID モードを有効にすることを**推奨**します。

GTID ベースのレプリケーションは、Amazon Aurora MySQL v2（MySQL 5.7）および v3（MySQL 8.0）、さらに Aurora Serverless v2 でもサポートされています。Aurora MySQL インスタンスで GTID モードを有効にするには、次の手順に従います。

1. RDS コンソールで、対象の MySQL インスタンスをクリックします。
2. **Configuration** タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上の **Edit** ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の **Save Changes** をクリックします。
8. 変更を反映させるためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID が有効化された状態" size="lg" border/>



## データベースユーザーを設定する {#configure-database-user}

管理者権限を持つユーザーとして Aurora MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例では、`mysql` データベースに対する権限を示しています。レプリケーション対象とする各データベースおよびホストに対して、これらのコマンドを繰り返し実行します。

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```



## ネットワークアクセスの構成 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

Aurora MySQL インスタンスへのトラフィックを制限するには、[ドキュメントに記載されている静的 NAT IP アドレス](../../index.md#list-of-static-ips) を Aurora セキュリティグループの **インバウンドルール** に追加します。

<Image img={security_group_in_rds_mysql} alt="Aurora MySQL でセキュリティグループを確認する場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集する画面" size="lg" border/>

### AWS PrivateLink 経由のプライベートアクセス {#private-access-via-aws-privatelink}

Aurora MySQL インスタンスにプライベートネットワーク経由で接続するには、AWS PrivateLink を使用します。接続を構成するには、[ClickPipes 向け AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) に従ってください。



## 次のステップ {#whats-next}

Amazon Aurora MySQL インスタンスを binlog レプリケーション向けに構成し、ClickHouse Cloud への安全な接続設定も完了したので、[最初の MySQL ClickPipe を作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDC に関するよくある質問については、[MySQL FAQ ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。