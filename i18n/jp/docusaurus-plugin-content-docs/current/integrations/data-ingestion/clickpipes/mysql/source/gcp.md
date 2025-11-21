---
sidebar_label: 'Cloud SQL For MySQL'
description: 'Cloud SQL for MySQL を ClickPipes のソースとして設定するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQL ソース設定ガイド'
keywords: ['google cloud sql', 'mysql', 'clickpipes', 'pitr', 'root ca certificate']
doc_type: 'guide'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';


# Cloud SQL for MySQL ソースセットアップガイド

このガイドでは、MySQL ClickPipe を使用してデータをレプリケートできるように、Cloud SQL for MySQL インスタンスをステップバイステップで構成する方法を説明します。



## バイナリログ保持の有効化 {#enable-binlog-retention-gcp}

バイナリログは、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルのセットです。バイナリログファイルはレプリケーションに必要です。

### PITRによるバイナリログの有効化{#enable-binlog-logging-gcp}

PITR機能は、Google CloudのMySQLでバイナリログを有効にするか無効にするかを決定します。この設定は、Cloud SQLインスタンスを編集し、以下のセクションまでスクロールすることで、Cloudコンソールから行うことができます。

<Image img={gcp_pitr} alt='Cloud SQLでのPITRの有効化' size='lg' border />

レプリケーションのユースケースに応じて、適切に長い値を設定することを推奨します。

まだ設定されていない場合は、Cloud SQLを編集してデータベースフラグセクションで以下を設定してください:

1. `binlog_expire_logs_seconds` を `86400` (1日) 以上の値に設定
2. `binlog_row_metadata` を `FULL` に設定
3. `binlog_row_image` を `FULL` に設定

これを行うには、インスタンス概要ページの右上隅にある `Edit` ボタンをクリックします。

<Image
  img={gcp_mysql_edit_button}
  alt='GCP MySQLの編集ボタン'
  size='lg'
  border
/>

次に、`Flags` セクションまでスクロールし、上記のフラグを追加します。

<Image
  img={gcp_mysql_flags}
  alt='GCPでのbinlogフラグの設定'
  size='lg'
  border
/>


## データベースユーザーの設定 {#configure-database-user-gcp}

rootユーザーとしてCloud SQL MySQLインスタンスに接続し、以下のコマンドを実行します:

1. ClickPipes専用のユーザーを作成します:

   ```sql
   CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
   ```

2. スキーマ権限を付与します。以下の例は`clickpipes`データベースの権限を示しています。レプリケートする各データベースとホストに対してこれらのコマンドを繰り返します:

   ```sql
   GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
   ```

3. ユーザーにレプリケーション権限を付与します:

   ```sql
   GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
   GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
   ```


## ネットワークアクセスの設定 {#configure-network-access-gcp-mysql}

Cloud SQLインスタンスへのトラフィックを制限する場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)をCloud SQL MySQLインスタンスの許可リストに追加してください。
これは、インスタンスを編集するか、Cloudコンソールのサイドバーにある`Connections`タブから実行できます。

<Image img={gcp_mysql_ip} alt='GCP MySQLでのIP許可リスト設定' size='lg' border />


## ルートCA証明書のダウンロードと使用 {#download-root-ca-certificate-gcp-mysql}

Cloud SQLインスタンスに接続するには、ルートCA証明書をダウンロードする必要があります。

1. Cloud ConsoleでCloud SQLインスタンスに移動します。
2. サイドバーの`Connections`をクリックします。
3. `Security`タブをクリックします。
4. `Manage server CA certificates`セクションで、下部にある`DOWNLOAD CERTIFICATES`ボタンをクリックします。

<Image img={gcp_mysql_cert} alt='GCP MySQL証明書のダウンロード' size='lg' border />

5. ClickPipes UIで、新しいMySQL ClickPipeを作成する際に、ダウンロードした証明書をアップロードします。

<Image img={rootca} alt='GCP MySQL証明書の使用' size='lg' border />
