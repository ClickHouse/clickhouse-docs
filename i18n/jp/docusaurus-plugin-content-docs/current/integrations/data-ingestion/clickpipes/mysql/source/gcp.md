---
'sidebar_label': 'Cloud SQL For MySQL'
'description': 'ClickPipes のソースとして Cloud SQL for MySQL をセットアップする手順ガイド'
'slug': '/integrations/clickpipes/mysql/source/gcp'
'title': 'Cloud SQL for MySQL ソースセットアップガイド'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQL ソース設定ガイド

これは、MySQL ClickPipeを介してデータの複製を行うためにあなたのCloud SQL for MySQLインスタンスを構成する手順を示したガイドです。

## バイナリログの保持を有効にする {#enable-binlog-retention-gcp}
バイナリログは、MySQLサーバーインスタンスに対して行われたデータの変更に関する情報を含むログファイルの集合であり、複製にはバイナリログファイルが必要です。

### PITRを介してバイナリログを有効にする {#enable-binlog-logging-gcp}
PITR機能は、Google CloudのMySQLに対してバイナリログのオンまたはオフを決定します。これはCloudコンソールで設定でき、Cloud SQLインスタンスを編集して下のセクションまでスクロールします。

<Image img={gcp_pitr} alt="Cloud SQLでのPITRの有効化" size="lg" border/>

複製のユースケースに応じて、適切に長い値に設定することが推奨されます。

まだ設定されていない場合は、Cloud SQLを編集してデータベースフラグセクションに次の設定を行ってください：
1. `binlog_expire_logs_seconds`を`86400`（1日）以上の値に設定します。
2. `binlog_row_metadata`を`FULL`に設定します。
3. `binlog_row_image`を`FULL`に設定します。

これを行うには、インスタンスの概要ページの右上隅にある`Edit`ボタンをクリックします。
<Image img={gcp_mysql_edit_button} alt="GCP MySQLの編集ボタン" size="lg" border/>

その後、`Flags`セクションまでスクロールして、上記のフラグを追加します。

<Image img={gcp_mysql_flags} alt="GCPでのbinlogフラグの設定" size="lg" border/>

## データベースユーザーの構成 {#configure-database-user-gcp}

Cloud SQL MySQLインスタンスにrootユーザーとして接続し、次のコマンドを実行します：

1. ClickPipes用の専用ユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。以下の例は`clickpipes`データベースの権限を示しています。複製したい各データベースとホストに対してこれらのコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーに複製権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの構成 {#configure-network-access-gcp-mysql}

Cloud SQLインスタンスへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をCloud SQL MySQLインスタンスの許可されたIPに追加してください。
これはインスタンスを編集するか、Cloud Consoleのサイドバーの`Connections`タブに移動することで行えます。

<Image img={gcp_mysql_ip} alt="GCP MySQLでのIPのホワイトリスト" size="lg" border/>

## ルートCA証明書のダウンロードと使用 {#download-root-ca-certificate-gcp-mysql}
Cloud SQLインスタンスに接続するには、ルートCA証明書をダウンロードする必要があります。

1. Cloud ConsoleのCloud SQLインスタンスに移動します。
2. サイドバーの`Connections`をクリックします。
3. `Security`タブをクリックします。
4. `Manage server CA certificates`セクションで、下部にある`DOWNLOAD CERTIFICATES`ボタンをクリックします。

<Image img={gcp_mysql_cert} alt="GCP MySQL証明書のダウンロード" size="lg" border/>

5. ClickPipes UIで、新しいMySQL ClickPipeを作成するときに、ダウンロードした証明書をアップロードします。

<Image img={rootca} alt="GCP MySQL証明書の使用" size="lg" border/>
