---
sidebar_label: 'Cloud SQL For MySQL '
description: 'Cloud SQL for MySQL を ClickPipes のソースとして設定するための手順ガイド'
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

このドキュメントは、MySQL ClickPipe を使用してデータをレプリケートするために、Cloud SQL for MySQL インスタンスを構成する手順をステップバイステップで説明したガイドです。



## バイナリログの保持を有効にする {#enable-binlog-retention-gcp}

バイナリログは、MySQLサーバーインスタンスに対して行われたデータ変更に関する情報を含むログファイルのセットです。バイナリログファイルはレプリケーションに必要です。

### PITRを使用したバイナリロギングの有効化{#enable-binlog-logging-gcp}

PITR機能は、Google CloudのMySQLでバイナリロギングのオン/オフを制御します。この設定は、Cloud SQLインスタンスを編集し、以下のセクションまでスクロールすることで、Cloudコンソールから行えます。

<Image img={gcp_pitr} alt='Cloud SQLでPITRを有効にする' size='lg' border />

レプリケーションのユースケースに応じて、十分に長い値を設定することを推奨します。

まだ設定されていない場合は、Cloud SQLを編集してデータベースフラグセクションで以下を設定してください:

1. `binlog_expire_logs_seconds`を`86400`以上の値(1日)に設定
2. `binlog_row_metadata`を`FULL`に設定
3. `binlog_row_image`を`FULL`に設定

これを行うには、インスタンス概要ページの右上にある`Edit`ボタンをクリックします。

<Image
  img={gcp_mysql_edit_button}
  alt='GCP MySQLの編集ボタン'
  size='lg'
  border
/>

次に、`Flags`セクションまでスクロールして、上記のフラグを追加します。

<Image
  img={gcp_mysql_flags}
  alt='GCPでbinlogフラグを設定'
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

Cloud SQLインスタンスへのトラフィックを制限したい場合は、[ドキュメント化された静的NAT IP](../../index.md#list-of-static-ips)をCloud SQL MySQLインスタンスの許可リストIPに追加してください。
これは、インスタンスを編集するか、Cloudコンソールのサイドバーにある`Connections`タブに移動することで実行できます。

<Image img={gcp_mysql_ip} alt='GCP MySQLにおけるIP許可リスト' size='lg' border />


## ルートCA証明書のダウンロードと使用 {#download-root-ca-certificate-gcp-mysql}

Cloud SQLインスタンスに接続するには、ルートCA証明書をダウンロードする必要があります。

1. Cloud ConsoleでCloud SQLインスタンスにアクセスします。
2. サイドバーの`Connections`をクリックします。
3. `Security`タブをクリックします。
4. `Manage server CA certificates`セクションで、下部の`DOWNLOAD CERTIFICATES`ボタンをクリックします。

<Image img={gcp_mysql_cert} alt='GCP MySQL証明書のダウンロード' size='lg' border />

5. ClickPipes UIで、新しいMySQL ClickPipeを作成する際に、ダウンロードした証明書をアップロードします。

<Image img={rootca} alt='GCP MySQL証明書の使用' size='lg' border />
