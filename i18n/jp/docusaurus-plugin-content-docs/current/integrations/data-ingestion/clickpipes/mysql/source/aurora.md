---
'sidebar_label': 'Amazon Aurora MySQL'
'description': 'ClickPipesのソースとしてAmazon Aurora MySQLを設定する手順についての詳細ガイド'
'slug': '/integrations/clickpipes/mysql/source/aurora'
'title': 'Aurora MySQLのソース設定ガイド'
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


# Aurora MySQL ソースセットアップガイド

これは MySQL ClickPipe を介してデータを複製するために、Aurora MySQL インスタンスを設定する手順を示すガイドです。
<br/>
:::info
MySQL の FAQ も [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md)でご確認いただくことをお勧めします。FAQ ページは積極的に更新されています。
:::

## バイナリログ保持の有効化 {#enable-binlog-retention-aurora}
バイナリログは、MySQL サーバーインスタンスに対するデータ変更に関する情報を含むログファイルのセットであり、複製にはバイナリログファイルが必要です。以下の 2 つのステップを実行する必要があります。

### 1. 自動バックアップによるバイナリログの有効化 {#enable-binlog-logging-aurora}
自動バックアップ機能は、MySQL のバイナリログがオンかオフかを決定します。AWS コンソールで設定できます。

<Image img={rds_backups} alt="Aurora における自動バックアップの有効化" size="lg" border/>

複製のユースケースに応じて、バックアップの保持期間を適切に長い値に設定することをお勧めします。

### 2. バイナリログ保持時間 {#binlog-retention-hours-aurora}
以下の手順を実行して、複製用のバイナリログの利用可能性を確保します：

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```
この設定が行われていない場合、Amazon RDS は可能な限り早くバイナリログを削除し、バイナリログにギャップが生じます。

## パラメータグループでのバイナリログ設定の構成 {#binlog-parameter-group-aurora}

RDS コンソールで MySQL インスタンスをクリックし、`Configurations` タブに移動すると、パラメータグループを見つけることができます。

<Image img={aurora_config} alt="RDS でのパラメータグループの見つけ方" size="lg" border/>

パラメータグループのリンクをクリックすると、そのページに移動します。右上に編集ボタンが表示されます。

<Image img={edit_button} alt="パラメータグループの編集" size="lg" border/>

以下の設定を次のように設定する必要があります：

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="バイナリログ形式を ROW に設定" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータ" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="バイナリログ行イメージ" size="lg" border/>

右上の `Save Changes` をクリックします。変更が反映されるにはインスタンスを再起動する必要がある場合があります。これを確認する方法は、RDS インスタンスの構成タブ内のパラメータグループリンクの横に `Pending reboot` と表示されることです。
<br/>
:::tip
MySQL クラスターがある場合、上記のパラメータは [DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) のパラメータグループにあり、DB インスタンスグループにはありません。
:::

## GTID モードの有効化 {#gtid-mode-aurora}
グローバルトランザクション識別子 (GTID) は、MySQL の各コミットされたトランザクションに割り当てられる一意の ID です。これによりバイナリログの複製が簡素化され、トラブルシューティングが容易になります。

MySQL インスタンスが MySQL 5.7、8.0、または 8.4 の場合は、MySQL ClickPipe が GTID 複製を使用できるように GTID モードを有効にすることをお勧めします。

MySQL インスタンスの GTID モードを有効にするための手順は次のとおりです：
1. RDS コンソールで MySQL インスタンスをクリックします。
2. `Configurations` タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上の `Edit` ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の `Save Changes` をクリックします。
8. 変更が反映されるためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID を有効にしました" size="lg" border/>

<br/>
:::info
MySQL ClickPipe は GTID モードなしでも複製をサポートしています。ただし、GTID モードを有効にすることでパフォーマンスが向上し、トラブルシューティングが容易になります。
:::

## データベースユーザーの構成 {#configure-database-user-aurora}

管理ユーザーとして Aurora MySQL インスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例では `mysql` データベースの権限を示しています。複製したい各データベースとホストに対してこれらのコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

Aurora インスタンスへのトラフィックを制限したい場合は、[ドキュメント化された静的 NAT IPs](../../index.md#list-of-static-ips)を Aurora セキュリティグループの `Inbound rules` に追加してください。以下のように表示されます：

<Image img={security_group_in_rds_mysql} alt="Aurora MySQL でのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink 経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して Aurora インスタンスに接続するには、AWS PrivateLink を使用できます。接続の設定については、[ClickPipes 用の AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)を参照してください。
