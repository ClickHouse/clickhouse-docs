---
'sidebar_label': 'Amazon Aurora MySQL'
'description': 'ClickPipes のソースとして Amazon Aurora MySQL を設定する方法についてのステップバイステップガイド'
'slug': '/integrations/clickpipes/mysql/source/aurora'
'title': 'Aurora MySQL ソース設定ガイド'
'doc_type': 'guide'
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


# Aurora MySQL ソース設定ガイド

このステップバイステップガイドでは、Amazon Aurora MySQL を設定して、[MySQL ClickPipe](../index.md) を使用してデータを ClickHouse Cloud にレプリケートする方法を示します。MySQL CDC に関する一般的な質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。

## バイナリログの保持を有効にする {#enable-binlog-retention-aurora}

バイナリログは、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。Aurora MySQL でバイナリログの保持を設定するには、[バイナリロギングを有効にし](#enable-binlog-logging)、[binlogの保持期間を延長する](#binlog-retention-interval)必要があります。

### 1. 自動バックアップを介してバイナリロギングを有効にする {#enable-binlog-logging}

自動バックアップ機能は、MySQL に対してバイナリロギングがオンまたはオフになっているかどうかを決定します。自動バックアップは、RDS コンソールでインスタンスに対して設定でき、**変更** > **追加設定** > **バックアップ**に移動し、**自動バックアップを有効にする**チェックボックスを選択します（まだ選択されていない場合）。

<Image img={rds_backups} alt="Aurora で自動バックアップを有効にする" size="lg" border/>

レプリケーションユースケースに応じて、**バックアップ保持期間**を十分に長く設定することをお勧めします。

### 2. binlog の保持期間を延長する {#binlog-retention-interval}

:::warning
ClickPipes がレプリケーションを再開しようとしたときに、設定された binlog の保持値により必要な binlog ファイルが削除されている場合、ClickPipe はエラー状態に入り、再同期が必要になります。
:::

デフォルトでは、Aurora MySQL はバイナリログを可能な限り早く削除します（すなわち、_遅延削除_）。失敗シナリオでのレプリケーションのために、バイナリログファイルが利用可能であることを確保するために、少なくとも **72 時間**に binlog の保持期間を延長することをお勧めします。バイナリログの保持に関するインターバルを設定するには、[`binlog retention hours`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration-usage-notes.binlog-retention-hours)を使用して、[`mysql.rds_set_configuration`](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/mysql-stored-proc-configuring.html#mysql_rds_set_configuration)手続きを実行します：

[//]: # "注意: ほとんどの CDC プロバイダーは、Aurora RDS の最大保持期間（7日/168時間）を推奨しています。これはディスク使用量に影響を与えるため、最小で3日/72時間を保守的に推奨します。"

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 72);
```

この設定がされていないか、低いインターバルに設定されている場合、バイナリログにギャップが生じ、ClickPipes がレプリケーションを再開する能力が損なわれる可能性があります。

## binlog 設定を構成する {#binlog-settings}

RDS コンソールで MySQL インスタンスをクリックすると、パラメータグループを見つけることができ、その後、**設定**タブに移動します。

:::tip
MySQL クラスターを持っている場合は、以下のパラメータは DB インスタンスグループではなく、[DB クラスター](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html)パラメータグループにあります。
:::

<Image img={aurora_config} alt="Aurora でパラメータグループを見つける場所" size="lg" border/>

<br/>
パラメータグループのリンクをクリックすると、その専用ページに移動します。右上に **編集** ボタンが表示されるはずです。

<Image img={edit_button} alt="パラメータグループを編集" size="lg" border/>

<br/>
次のパラメータを以下のように設定する必要があります：

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog row metadata" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog row image" size="lg" border/>

<br/>
その後、右上の **変更を保存** をクリックします。変更を適用するためにはインスタンスを再起動する必要があるかもしれません。このことを知る方法は、Aurora インスタンスの **設定**タブでパラメータグループリンクの隣に `再起動待機中` と表示されることです。

## GTID モードを有効にする（推奨） {#gtid-mode}

:::tip
MySQL ClickPipe は、GTID モードなしでのレプリケーションもサポートしています。ただし、パフォーマンスの向上とトラブルシューティングの簡素化のために GTID モードを有効にすることをお勧めします。
:::

[グローバルトランザクション識別子 (GTID)](https://dev.mysql.com/doc/refman/8.0/en/replication-gtids.html)は、MySQL における各コミット済みトランザクションに割り当てられた一意の ID です。これにより binlog のレプリケーションが簡素化され、トラブルシューティングがより簡単になります。MySQL ClickPipe が GTID ベースのレプリケーションを使用できるようにするため、GTID モードの有効化を**推奨**します。

GTID ベースのレプリケーションは、Amazon Aurora MySQL v2 (MySQL 5.7) および v3 (MySQL 8.0)、さらに Aurora Serverless v2 をサポートしています。Aurora MySQL インスタンスに対して GTID モードを有効にするには、次の手順を実行します：

1. RDS コンソールで MySQL インスタンスをクリックします。
2. **設定** タブをクリックします。
3. パラメータグループのリンクをクリックします。
4. 右上の **編集** ボタンをクリックします。
5. `enforce_gtid_consistency` を `ON` に設定します。
6. `gtid-mode` を `ON` に設定します。
7. 右上の **変更を保存** をクリックします。
8. 変更を適用するためにインスタンスを再起動します。

<Image img={enable_gtid} alt="GTID 有効" size="lg" border/>

## データベースユーザーを構成する {#configure-database-user}

Aurora MySQL インスタンスに管理者ユーザーとして接続し、次のコマンドを実行します：

1. ClickPipes 用の専用ユーザーを作成します：

```sql
CREATE USER 'clickpipes_user'@'%' IDENTIFIED BY 'some-password';
```

2. スキーマ権限を付与します。以下の例は `mysql` データベースの権限を示しています。レプリケートしたい各データベースとホストのために、これらのコマンドを繰り返してください：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. ユーザーにレプリケーション権限を付与します：

```sql
GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
```

## ネットワークアクセスを構成する {#configure-network-access}

### IP ベースのアクセス制御 {#ip-based-access-control}

Aurora MySQL インスタンスへのトラフィックを制限するには、[文書化された静的 NAT IP アドレス](../../index.md#list-of-static-ips)を Aurora セキュリティグループの **受信ルール** に追加します。

<Image img={security_group_in_rds_mysql} alt="Aurora MySQL でセキュリティグループを見つける場所" size="lg" border/>

<Image img={edit_inbound_rules} alt="上記のセキュリティグループの受信ルールを編集" size="lg" border/>

### AWS PrivateLink 経由のプライベートアクセス {#private-access-via-aws-privatelink}

プライベートネットワークを介して Aurora MySQL インスタンスに接続するには、AWS PrivateLink を使用できます。[ClickPipes 用の AWS PrivateLink セットアップガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)に従って接続を設定します。

## 次は何ですか？ {#whats-next}

Amazon Aurora MySQL インスタンスが binlog レプリケーション用に設定され、ClickHouse Cloud への安全な接続ができるようになったので、[最初の MySQL ClickPipe を作成](/integrations/clickpipes/mysql/#create-your-clickpipe)できます。MySQL CDC に関する一般的な質問については、[MySQL FAQs ページ](/integrations/data-ingestion/clickpipes/mysql/faq.md)を参照してください。
