---
sidebar_label: 'Amazon RDS MySQL'
description: 'Step-by-step guide on how to set up Amazon RDS MySQL as a source for
  ClickPipes'
slug: '/integrations/clickpipes/mysql/source/rds'
title: 'RDS MySQL source setup guide'
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


# RDS MySQL ソース設定ガイド

これは、RDS MySQL インスタンスを MySQL ClickPipe を介してデータを複製するように構成する手順です。
<br/>
:::info
MySQL FAQ を [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md) で確認することもお勧めします。FAQ ページはもりを積極的に更新されています。
:::

## バイナリログの保持を有効にする {#enable-binlog-retention-rds}
バイナリログは、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。以下のステップの両方を実行する必要があります。

### 1. 自動バックアップを介してバイナリログを有効にする {#enable-binlog-logging-rds}
自動バックアップ機能は、MySQL のバイナリログがオンまたはオフになっているかを決定します。AWS コンソールで設定できます。

<Image img={rds_backups} alt="RDS で自動バックアップを有効にする" size="lg" border/>

レプリケーションの使用ケースに応じて、バックアップの保持期間を適切に長い値に設定することをお勧めします。

### 2. バイナリログの保持時間 {#binlog-retention-hours-rds}
Amazon RDS for MySQL では、変更が含まれるバイナリログファイルが保持される時間を設定する方法が異なります。バイナリログファイルが削除される前に変更が読み取られない場合、レプリケーションは続行できなくなります。バイナリログの保持時間のデフォルト値は NULL であり、これはバイナリログが保持されていないことを意味します。

DB インスタンスのバイナリログを保持する時間を指定するには、mysql.rds_set_configuration 関数を使用し、レプリケーションが発生するために十分な長さのバイナリログ保持期間を設定します。`24 時間` が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## パラメータグループでバイナリログ設定を構成する {#binlog-parameter-group-rds}

パラメータグループは、RDS コンソールで MySQL インスタンスをクリックし、`Configurations` タブに移動すると見つけることができます。

<Image img={rds_config} alt="RDS でパラメータグループを見つける場所" size="lg" border/>

パラメータグループのリンクをクリックすると、そのページに移動します。右上に編集ボタンがあります。

<Image img={edit_button} alt="パラメータグループの編集" size="lg" border/>

次の設定を次のように設定する必要があります。

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="バイナリログ形式をROWに設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータをFULLに設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="バイナリログ行画像をFULLに設定" size="lg" border/>

右上の `Save Changes` をクリックします。変更が有効になるためにはインスタンスを再起動する必要がある場合があります。この場合、RDS インスタンスの構成タブにあるパラメータグループリンクの横に `Pending reboot` という表示が見られます。

<br/>
:::tip
MySQL クラスターを持っている場合、上記のパラメータは DB クラスター [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)のパラメータグループに存在し、DB インスタンスグループではありません。
:::

## GTID モードを有効にする {#gtid-mode-rds}
グローバルトランザクション ID (GTID) は、MySQL の各コミットされたトランザクションに割り当てられるユニーク ID です。GTID はバイナリログのレプリケーションを簡素化し、トラブルシューティングをより簡単にします。

MySQL インスタンスが MySQL 5.7、8.0 または 8.4 の場合、MySQL ClickPipe が GTID レプリケーションを使用できるように GTID モードを有効にすることをお勧めします。

MySQL インスタンスの GTID モードを有効にするには、以下の手順に従ってください。
1. RDS コンソールで MySQL インスタンスをクリックします。
2. `Configurations` タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上隅の `Edit` ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上隅の `Save Changes` をクリックします。
8. 変更を有効にするためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID が有効" size="lg" border/>

<br/>
:::tip
MySQL ClickPipe は GTID モードなしでのレプリケーションもサポートしています。ただし、GTID モードを有効にすることは、パフォーマンスの向上とトラブルシューティングの容易さのために推奨されます。
:::


## データベースユーザーを構成する {#configure-database-user-rds}

管理者ユーザーとして RDS MySQL インスタンスに接続し、以下のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します。

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は `mysql` データベースの権限を示しています。複製したい各データベースおよびホストについて、これらのコマンドを繰り返します。

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスを構成する {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

RDS インスタンスへのトラフィックを制限したい場合は、RDS セキュリティグループの `Inbound rules` に [文書化された静的 NAT IPs](../../index.md#list-of-static-ips) を追加してください。

<Image img={security_group_in_rds_mysql} alt="RDS MySQL でセキュリティグループを見つける場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink 経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して RDS インスタンスに接続するには、AWS PrivateLink を使用できます。接続を設定するには、私たちの [ClickPipes 用の AWS PrivateLink 設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) を参照してください。
