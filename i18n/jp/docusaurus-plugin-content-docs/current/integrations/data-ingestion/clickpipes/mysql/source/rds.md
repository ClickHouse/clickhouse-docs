---
sidebar_label: 'Amazon RDS MySQL'
description: 'ClickPipesのソースとしてAmazon RDS MySQLを設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/rds
title: 'RDS MySQLソース設定ガイド'
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


# RDS MySQLソース設定ガイド

これは、MySQL ClickPipeを介してデータをレプリケーションするために、RDS MySQLインスタンスを構成する方法についてのステップバイステップガイドです。
<br/>
:::info
MySQLに関するFAQもぜひ確認してください [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)。FAQページは積極的に更新されています。
:::

## バイナリログの保持を有効にする {#enable-binlog-retention-rds}
バイナリログは、MySQLサーバーインスタンスに対するデータ変更の情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。以下の2つの手順を実行する必要があります。

### 1. 自動バックアップを介してバイナリログを有効にする {#enable-binlog-logging-rds}
自動バックアップ機能は、MySQLのバイナリログがオンまたはオフになっているかを決定します。AWSコンソールで設定できます：

<Image img={rds_backups} alt="RDSでの自動バックアップの有効化" size="lg" border/>

レプリケーションのユースケースに応じて、バックアップ保持を合理的に長い値に設定することをお勧めします。

### 2. バイナリログ保持時間 {#binlog-retention-hours-rds}
Amazon RDS for MySQLは、変更を含むバイナリログファイルが保持される時間を設定する異なる方法を持っています。バイナリログファイルが削除される前にいくつかの変更が読み取られない場合、レプリケーションは継続できなくなります。バイナリログ保持時間のデフォルト値はNULLであり、これはバイナリログが保持されないことを意味します。

DBインスタンス上でバイナリログを保持する時間を指定するには、`mysql.rds_set_configuration`関数を使用して、レプリケーションが発生するのに十分な長さのバイナリログ保持期間を設定します。`24 hours`が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## パラメーターグループでのバイナリログ設定の構成 {#binlog-parameter-group-rds}

パラメーターグループは、RDSコンソールでMySQLインスタンスをクリックし、`設定`タブに移動することで見つけることができます。

<Image img={rds_config} alt="RDSでパラメーターグループを見つける場所" size="lg" border/>

パラメーターグループのリンクをクリックすると、そのページに移動します。右上にある`編集`ボタンが表示されます。

<Image img={edit_button} alt="パラメーターグループを編集" size="lg" border/>

次の設定を以下のように設定する必要があります：

1. `binlog_format`を`ROW`に設定します。

<Image img={binlog_format} alt="バイナリログフォーマットをROWに設定" size="lg" border/>

2. `binlog_row_metadata`を`FULL`に設定します。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータをFULLに設定" size="lg" border/>

3. `binlog_row_image`を`FULL`に設定します。

<Image img={binlog_row_image} alt="バイナリログ行画像をFULLに設定" size="lg" border/>

そして、右上の`変更を保存`をクリックします。変更を適用するにはインスタンスを再起動する必要があります。これを確認する方法は、RDSインスタンスの設定タブにおいて、パラメーターグループリンクの横に`再起動待機中`が表示されることです。

<br/>
:::tip
MySQLクラスターがある場合、上記のパラメーターは[DBクラスタ](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)のパラメーターグループで見つけられ、DBインスタンスグループではありません。
:::

## GTIDモードの有効化 {#gtid-mode-rds}
グローバルトランザクション識別子（GTID）は、MySQL内の各コミット済みトランザクションに割り当てられる一意のIDです。これにより、バイナリログのレプリケーションが簡素化され、トラブルシューティングが容易になります。

MySQLインスタンスがMySQL 5.7、8.0、または8.4の場合、GTIDモードを有効にすることをお勧めします。これにより、MySQL ClickPipeがGTIDレプリケーションを使用できるようになります。

MySQLインスタンスのGTIDモードを有効にするには、次の手順を実行します：
1. RDSコンソールでMySQLインスタンスをクリックします。
2. `設定`タブをクリックします。
3. パラメーターグループのリンクをクリックします。
4. 右上の`編集`ボタンをクリックします。
5. `enforce_gtid_consistency`を`ON`に設定します。
6. `gtid-mode`を`ON`に設定します。
7. 右上の`変更を保存`をクリックします。
8. 変更を適用するためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTIDが有効化されました" size="lg" border/>

<br/>
:::tip
MySQL ClickPipeはGTIDモードなしのレプリケーションもサポートしています。ただし、より良いパフォーマンスとトラブルシューティングの容易さのために、GTIDモードを有効にすることをお勧めします。
:::


## データベースユーザーの構成 {#configure-database-user-rds}

管理ユーザーとしてRDS MySQLインスタンスに接続し、次のコマンドを実行します：

1. ClickPipesのための専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は`mysql`データベースの権限を示しています。レプリケーションをしたい各データベースとホストに対してこれらのコマンドを繰り返します：

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

RDSインスタンスへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をRDSセキュリティグループの`インバウンドルール`に追加してください。

<Image img={security_group_in_rds_mysql} alt="RDS MySQLのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLinkを介したプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワーク経由でRDSインスタンスに接続するために、AWS PrivateLinkを使用できます。接続を設定するための[ClickPipes用AWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。
