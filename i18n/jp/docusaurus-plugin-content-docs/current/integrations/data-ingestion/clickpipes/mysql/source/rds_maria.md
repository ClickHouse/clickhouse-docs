---
'sidebar_label': 'Amazon RDS MariaDB'
'description': 'Amazon RDS MariaDB を ClickPipes のソースとしてセットアップする方法のステップバイステップガイド'
'slug': '/integrations/clickpipes/mysql/source/rds_maria'
'title': 'RDS MariaDB ソースセットアップガイド'
'doc_type': 'guide'
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


# RDS MariaDB ソース設定ガイド

これは、MySQL ClickPipeを介してデータを複製するために、RDS MariaDB インスタンスを設定する手順を示したガイドです。
<br/>
:::info
MySQL の FAQ を [こちら](/integrations/data-ingestion/clickpipes/mysql/faq.md) で確認することをお勧めします。FAQ ページは定期的に更新されています。
:::

## バイナリログ保持の有効化 {#enable-binlog-retention-rds}
バイナリログは、MySQL サーバーインスタンスで行われたデータ変更に関する情報を含む一連のログファイルです。バイナリログファイルは、レプリケーションに必須です。以下の2つのステップは必ず実行してください。

### 1. 自動バックアップを介したバイナリログの有効化 {#enable-binlog-logging-rds}

自動バックアップ機能は、MySQL のバイナリログがオンまたはオフになっているかを決定します。これは AWS コンソールで設定できます。

<Image img={rds_backups} alt="RDS での自動バックアップの有効化" size="lg" border/>

レプリケーションのユースケースに応じて、バックアップ保持期間を合理的に長く設定することが推奨されます。

### 2. バイナリログ保持時間 {#binlog-retention-hours-rds}
Amazon RDS for MariaDB では、変更を含むバイナリログファイルの保持期間を設定する別の方法があります。バイナリログファイルが削除される前に一部の変更が読み取られないと、レプリケーションを続行できなくなります。バイナリログ保持時間のデフォルト値は NULL で、これはバイナリログが保持されないことを意味します。

DB インスタンス上のバイナリログを保持する時間を指定するには、mysql.rds_set_configuration 関数を使用し、レプリケーションが発生するのに十分なバイナリログ保持期間を設定します。`24 時間` が推奨される最小値です。

```text
mysql=> call mysql.rds_set_configuration('binlog retention hours', 24);
```

## パラメータグループでのバイナリログ設定の構成 {#binlog-parameter-group-rds}

パラメータグループは、RDS コンソールで MariaDB インスタンスをクリックし、`Configurations` タブに移動することで見つけることができます。

<Image img={rds_config} alt="RDS でのパラメータグループの見つけ方" size="lg" border/>

パラメータグループリンクをクリックすると、パラメータグループのリンクページに移動します。右上に「Edit」ボタンが表示されます。

<Image img={edit_button} alt="パラメータグループの編集" size="lg" border/>

`binlog_format`、`binlog_row_metadata`、`binlog_row_image` の設定は次のように行う必要があります。

1. `binlog_format` を `ROW` に設定します。

<Image img={binlog_format} alt="Binlog format to ROW" size="lg" border/>

2. `binlog_row_metadata` を `FULL` に設定します。

<Image img={binlog_row_metadata} alt="Binlog row metadata to FULL" size="lg" border/>

3. `binlog_row_image` を `FULL` に設定します。

<Image img={binlog_row_image} alt="Binlog row image to FULL" size="lg" border/>

次に、右上の `Save Changes` をクリックします。変更を適用するには、インスタンスを再起動する必要があります。「Pending reboot」と表示されている場合は、RDS インスタンスの Configurations タブで、インスタンスの再起動が必要であることを示しています。

<br/>
:::tip
MariaDB クラスタを使用している場合、上記のパラメータは [DB Cluster](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_WorkingWithParamGroups.CreatingCluster.html) パラメータグループに見つかり、DB インスタンスグループには見つかりません。
:::

## GTID モードの有効化 {#gtid-mode-rds}
グローバルトランザクション識別子 (GTID) は、MySQL/MariaDB の各コミットされたトランザクションに割り当てられるユニークな ID です。これにより、バイナリログのレプリケーションが簡素化され、トラブルシューティングが容易になります。MariaDB では、デフォルトで GTID モードが有効になっているため、特別な操作は必要ありません。

## データベースユーザーの構成 {#configure-database-user-rds}

管理ユーザーとして RDS MariaDB インスタンスに接続し、以下のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します：

```sql
CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
```

2. スキーマの権限を付与します。以下の例は `mysql` データベースの権限を示しています。レプリケートしたい各データベースおよびホストについて、同様のコマンドを繰り返します：

```sql
GRANT SELECT ON `mysql`.* TO 'clickpipes_user'@'host';
```

3. ユーザーにレプリケーション権限を付与します：
