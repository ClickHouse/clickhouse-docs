---
sidebar_label: 'Amazon RDS MariaDB'
description: 'ClickPipes のソースとして Amazon RDS MariaDB を設定する手順ガイド'
slug: '/integrations/clickpipes/mysql/source/rds_maria'
title: 'RDS MariaDB ソースセットアップガイド'
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


# RDS MariaDB ソースセットアップガイド

これは、MySQL ClickPipe を介してデータを複製するために RDS MariaDB インスタンスを構成する方法のステップバイステップガイドです。
<br/>
:::info
MySQL FAQ の確認もお勧めします [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)。FAQ ページは定期的に更新されています。
:::

## バイナリログの保持を有効にする {#enable-binlog-retention-rds}
バイナリログは、MySQL サーバーインスタンスに対して行われたデータの変更に関する情報を含むログファイルのセットです。複製にはバイナリログファイルが必要です。以下の両方のステップを実行する必要があります:

### 1. 自動バックアップ経由でバイナリログを有効にする {#enable-binlog-logging-rds}

自動バックアップ機能は、MySQL のバイナリログがオンまたはオフになっているかどうかを決定します。AWS コンソールで設定できます:

<Image img={rds_backups} alt="RDS での自動バックアップの有効化" size="lg" border/>

複製の使用ケースに応じて、バックアップの保持期間を適切な長さに設定することが推奨されます。

### 2. バイナリログ保持時間 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB では、バイナリログの保持期間を設定するための異なる方法があり、これは変更を含むバイナリログファイルが保持される時間のことを指します。バイナリログファイルが削除される前に変更が読み取られない場合、複製は続行できなくなります。バイナリログ保持時間のデフォルト値は NULL で、これはバイナリログが保持されていないことを意味します。

DB インスタンスでバイナリログの保持時間を指定するには、mysql.rds_set_configuration 関数を使用し、複製が行われるのに十分なバイナリログ保持期間を指定します。推奨される最小値は「24 時間」です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## パラメータグループでのバイナリログ設定の構成 {#binlog-parameter-group-rds}

パラメータグループは、RDS コンソールで MariaDB インスタンスをクリックし、`Configurations` タブに移動することで見つけることができます。

<Image img={rds_config} alt="RDS でのパラメータグループの見つけ方" size="lg" border/>

パラメータグループリンクをクリックすると、パラメータグループリンクページに移動します。右上に「Edit」ボタンが表示されます:

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

設定は以下の通りにする必要があります:

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="バイナリログフォーマットを ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータを FULL に設定" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="バイナリログ行画像を FULL に設定" size="lg" border/>

次に、右上の「Save Changes」をクリックします。変更を有効にするにはインスタンスを再起動する必要がある場合があります。RDS インスタンスの Configurations タブのパラメータグループリンクの横に「Pending reboot」と表示されている場合は、インスタンスの再起動が必要であることを示す良いサインです。

<br/>
:::tip
MariaDB クラスターがある場合、上記のパラメータは [DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) パラメータグループに見つかり、DB インスタンスグループには見つかりません。
:::

## GTID モードを有効にする {#gtid-mode-rds}
グローバルトランザクション識別子 (GTID) は、MySQL/MariaDB でコミットされた各トランザクションに割り当てられる一意の ID です。これにより、バイナリログの複製が簡素化され、トラブルシューティングが容易になります。MariaDB では、GTID モードがデフォルトで有効になっているため、使用するためのユーザーアクションは必要ありません。

## データベースユーザーの構成 {#configure-database-user-rds}

管理者ユーザーとして RDS MariaDB インスタンスに接続し、次のコマンドを実行します:

1. ClickPipes 用の専用ユーザーを作成します:

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は `mysql` データベースの権限を示しています。複製したい各データベースとホストに対してこれらのコマンドを繰り返します:

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーに複製権限を付与します:

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

RDS インスタンスへのトラフィックを制限したい場合は、RDS セキュリティグループの `Inbound rules` に [文書化された静的 NAT IP](../../index.md#list-of-static-ips) を追加してください。

<Image img={security_group_in_rds_mysql} alt="RDS でのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記セキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink 経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して RDS インスタンスに接続するには、AWS PrivateLink を使用できます。接続の設定については、[ClickPipes 用の AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) を参照してください。
