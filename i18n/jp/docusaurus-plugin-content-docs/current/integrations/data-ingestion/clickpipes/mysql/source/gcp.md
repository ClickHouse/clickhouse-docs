---
sidebar_label: 'Cloud SQL for MySQL'
description: 'ClickPipes用のCloud SQL for MySQLをソースとして設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQLソース設定ガイド'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQLソース設定ガイド

これは、MySQL ClickPipeを介してデータをレプリケーションするために、Cloud SQL for MySQLインスタンスを設定する方法についてのステップバイステップガイドです。

## バイナリログ保持の有効化 {#enable-binlog-retention-gcp}
バイナリログは、MySQLサーバーインスタンスで行われたデータ変更に関する情報を含むログファイルのセットであり、レプリケーションにはバイナリログファイルが必要です。

### PITRを介したバイナリログの有効化 {#enable-binlog-logging-gcp}
PITR機能は、Google Cloud上のMySQLに対するバイナリログがオンまたはオフになっているかを決定します。これはCloudコンソールで設定でき、Cloud SQLインスタンスを編集し、以下のセクションまでスクロールします。

<Image img={gcp_pitr} alt="Cloud SQLでのPITRの有効化" size="lg" border/>

レプリケーションのユースケースに応じて、適切に長い値に設定することが推奨されます。

まだ設定されていない場合は、Cloud SQLを編集してデータベースフラグのセクションに以下の設定を行ってください：
1. `binlog_expire_logs_seconds` を `86400` (1日) 以上の値に設定します。
2. `binlog_row_metadata` を `FULL` に設定します。
3. `binlog_row_image` を `FULL` に設定します。

これを行うには、インスタンス概要ページの右上隅にある `Edit` ボタンをクリックします。
<Image img={gcp_mysql_edit_button} alt="GCP MySQLの編集ボタン" size="lg" border/>

次に、`Flags` セクションまでスクロールし、上記のフラグを追加します。

<Image img={gcp_mysql_flags} alt="GCPでのbinlogフラグの設定" size="lg" border/>

## データベースユーザーの設定 {#configure-database-user-gcp}

Cloud SQL MySQLインスタンスにrootユーザーとして接続し、以下のコマンドを実行します：

1. ClickPipes専用のユーザーを作成します：

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例は `clickpipes` データベースの権限を示しています。レプリケートしたい各データベースおよびホストに対してこれらのコマンドを繰り返します：

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します：

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスの設定 {#configure-network-access-gcp-mysql}

Cloud SQLインスタンスへのトラフィックを制限したい場合は、[文書化された静的NAT IP](../../index.md#list-of-static-ips)をCloud SQL MySQLインスタンスの許可されたIPリストに追加してください。
これは、インスタンスを編集するか、Cloudコンソールのサイドバーの `Connections` タブに移動することで行えます。

<Image img={gcp_mysql_ip} alt="GCP MySQLでのIPの許可リスト" size="lg" border/>

## ルートCA証明書のダウンロードと使用 {#download-root-ca-certificate-gcp-mysql}
Cloud SQLインスタンスに接続するには、ルートCA証明書をダウンロードする必要があります。

1. CloudコンソールでCloud SQLインスタンスに移動します。
2. サイドバーの `Connections` をクリックします。
3. `Security` タブをクリックします。
4. `Manage server CA certificates` セクションで、下部にある `DOWNLOAD CERTIFICATES` ボタンをクリックします。

<Image img={gcp_mysql_cert} alt="GCP MySQL証明書のダウンロード" size="lg" border/>

5. ClickPipes UIで、新しいMySQL ClickPipeを作成する際にダウンロードした証明書をアップロードします。

<Image img={rootca} alt="GCP MySQL証明書の使用" size="lg" border/>
