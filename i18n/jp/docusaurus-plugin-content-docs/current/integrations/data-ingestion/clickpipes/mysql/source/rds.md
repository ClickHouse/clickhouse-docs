---
'sidebar_label': 'Amazon RDS MySQL'
'description': 'Amazon RDS MySQL を ClickPipes のソースとして設定するためのステップバイステップガイド'
'slug': '/integrations/clickpipes/mysql/source/rds'
'title': 'RDS MySQL ソース設定ガイド'
'doc_type': 'guide'
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

このステップバイステップのガイドでは、Amazon RDS MySQLを構成してClickHouse Cloudにデータをレプリケートする方法を示します。MySQL CDCに関する一般的な質問については、[MySQL FAQsページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。

## バイナリログの保持を有効にする {#enable-binlog-retention-rds}

バイナリログは、MySQLサーバーインスタンスで行われたデータ変更に関する情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。RDS MySQLでバイナリログの保持を構成するには、[バイナリロギングを有効にする](#enable-binlog-logging)必要があり、[バイナリログ保持間隔を増加させる](#binlog-retention-interval)必要があります。

### 1. 自動バックアップを通じてバイナリロギングを有効にする {#enable-binlog-logging}

自動バックアップ機能は、MySQLのバイナリロギングがオンかオフかを決定します。RDSコンソールでインスタンスの設定を、**変更** > **追加設定** > **バックアップ**に移動し、**自動バックアップを有効にする**のチェックボックスを選択することで構成できます（まだ選択されていない場合）。

<Image img={rds_backups} alt="RDSでの自動バックアップの有効化" size="lg" border/>

レプリケーションのユースケースに応じて、**バックアップ保持期間**を合理的に長い値に設定することをお勧めします。

### 2. バイナリログ保持間隔を増加させる {#binlog-retention-interval}

:::warning
ClickPipesがレプリケーションを再開しようとしたときに、設定されたバイナリログ保持値によって必要なバイナリログファイルが消去されている場合、ClickPipeはエラー状態に入り、再同期が必要です。
:::

デフォルトでは、Amazon RDSはバイナリログをできるだけ早く消去します（つまり、_遅延消去_）。障害シナリオでレプリケーションのためにバイナリログファイルの可用性を確保するために、バイナリログ保持間隔を少なくとも**72時間**に増加させることをお勧めします。バイナリログ保持の間隔を設定するには、[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)を使用して、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration)プロシージャを実行します。

[//]: # "注意 多くのCDCプロバイダーはRDSの最大保持期間（7日/168時間）を推奨しています。これによりディスク使用量に影響があるため、少なくとも3日/72時間を保守的に推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定が行われていない、または低い間隔に設定されている場合、バイナリログにギャップが生じ、ClickPipesがレプリケーションを再開する能力に影響を与える可能性があります。

## バイナリログ設定を構成する {#binlog-settings}

パラメータグループは、RDSコンソールでMySQLインスタンスをクリックし、**設定**タブに移動することで見つけることができます。

:::tip
MySQLクラスターを持っている場合、以下のパラメータはDBインスタンスグループの代わりに[DBクラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)パラメータグループで見つけることができます。
:::

<Image img={rds_config} alt="RDSでのパラメータグループの見つけ方" size="lg" border/>

<br/>
パラメータグループリンクをクリックすると、その専用ページに移動します。右上に**変更を編集**ボタンが表示されます。

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

以下のパラメータを次のように設定する必要があります：

1. `binlog_format`を`ROW`に設定します。

<Image img={binlog_format} alt="バイナリログ形式をROWに設定" size="lg" border/>

2. `binlog_row_metadata`を`FULL`に設定します。

<Image img={binlog_row_metadata} alt="バイナリログ行メタデータをFULLに設定" size="lg" border/>

3. `binlog_row_image`を`FULL`に設定します。

<Image img={binlog_row_image} alt="バイナリログ行イメージをFULLに設定" size="lg" border/>

<br/>
その後、右上隅の**変更を保存**をクリックします。変更を有効にするためにインスタンスを再起動する必要がある場合があります。この確認方法は、RDSインスタンスの**設定**タブ内のパラメータグループリンクの隣に`再起動待ち`と表示されることです。

## GTIDモードを有効にする {#gtid-mode}

:::tip
MySQL ClickPipeはGTIDモードなしでのレプリケーションもサポートしています。ただし、GTIDモードを有効にすることが推奨されており、より良いパフォーマンスとトラブルシューティングの容易さを提供します。
:::

[グローバルトランザクション識別子（GTID）](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)は、MySQLでコミットされた各トランザクションに割り当てられた一意のIDです。これにより、バイナリログのレプリケーションが簡素化され、トラブルシューティングがより簡単になります。GTIDベースのレプリケーションが使用できるよう、GTIDモードを有効にすることを**お勧めします**。

GTIDベースのレプリケーションは、Amazon RDS for MySQLのバージョン5.7、8.0、および8.4でサポートされています。Aurora MySQLインスタンスでGTIDモードを有効にするには、次の手順を実行してください：

1. RDSコンソールでMySQLインスタンスをクリックします。
2. **設定**タブをクリックします。
3. パラメータグループリンクをクリックします。
4. 右上隅の**変更を編集**ボタンをクリックします。
5. `enforce_gtid_consistency`を`ON`に設定します。
6. `gtid-mode`を`ON`に設定します。
7. 右上隅の**変更を保存**をクリックします。
8. 変更を有効にするためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTIDが有効になっています" size="lg" border/>

<br/>
:::tip
MySQL ClickPipeはGTIDモードなしでのレプリケーションもサポートしています。ただし、GTIDモードを有効にすることが推奨されており、より良いパフォーマンスとトラブルシューティングの容易さを提供します。
:::

## データベースユーザーを構成する {#configure-database-user}

管理者ユーザーとしてRDS MySQLインスタンスに接続し、以下のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. スキーマ権限を付与します。以下の例は`mysql`データベースに対する権限を示しています。レプリケートしたい各データベースとホストに対してこれらのコマンドを繰り返します：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. ユーザーにレプリケーション権限を付与します：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## ネットワークアクセスを構成する {#configure-network-access}

### IPベースのアクセス制御 {#ip-based-access-control}

Aurora MySQLインスタンスへのトラフィックを制限するために、[記載された静的NAT IPアドレス](../../index.md#list-of-static-ips)をRDSセキュリティグループの**インバウンドルール**に追加します。

<Image img={security_group_in_rds_mysql} alt="RDS MySQLでのセキュリティグループの見つけ方" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループのインバウンドルールを編集" size="lg" border/>

### AWS PrivateLink経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを通じてRDSインスタンスに接続するには、AWS PrivateLinkを使用します。[ClickPipes用のAWS PrivateLink設定ガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従って接続を設定してください。

## 次のステップ {#next-steps}

Amazon RDS MySQLインスタンスがバイナリログレプリケーション用に構成され、ClickHouse Cloudに安全に接続されるようになったので、[最初のMySQL ClickPipeを作成する](/integrations/clickpipes/mysql/#create-your-clickpipe)ことができます。MySQL CDCに関する一般的な質問については、[MySQL FAQsページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。
