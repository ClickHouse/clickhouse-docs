---
sidebar_label: 'Cloud SQL for MySQL'
description: 'Cloud SQL for MySQL を ClickPipes のソースとして構成するためのステップバイステップガイド'
slug: /integrations/clickpipes/mysql/source/gcp
title: 'Cloud SQL for MySQL ソースのセットアップガイド'
keywords: ['Google Cloud SQL', 'MySQL', 'ClickPipes', 'PITR', 'ルート CA 証明書']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import gcp_pitr from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-pitr.png';
import gcp_mysql_flags from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-flags.png';
import gcp_mysql_ip from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-ip.png';
import gcp_mysql_edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-edit-button.png';
import gcp_mysql_cert from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/gcp-mysql-cert.png';
import rootca from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/source/gcp/rootca.png';
import Image from '@theme/IdealImage';

# Cloud SQL for MySQL ソースセットアップガイド {#cloud-sql-for-mysql-source-setup-guide}

このガイドでは、MySQL ClickPipe を介してデータをレプリケートできるように Cloud SQL for MySQL インスタンスを構成する手順を、順を追って説明します。

## バイナリログの保持を有効化する {#enable-binlog-retention-gcp}

バイナリログは、MySQL サーバーインスタンスに対して行われたデータ変更に関する情報を含む一連のログファイルであり、レプリケーションにはバイナリログファイルが必要です。

### PITR を利用してバイナリログを有効化する {#enable-binlog-logging-gcp}

PITR 機能は、Google Cloud 上の MySQL でバイナリログを有効にするか無効にするかを制御します。Cloud コンソールで Cloud SQL インスタンスを編集し、下記のセクションまでスクロールすることで設定できます。

<Image img={gcp_pitr} alt="Cloud SQL で PITR を有効化する" size="lg" border/>

レプリケーションのユースケースに応じて、値を十分に長い期間となるよう設定することを推奨します。

まだ設定していない場合は、Cloud SQL を編集し、「データベース フラグ」セクションで次を必ず設定してください：

1. `binlog_expire_logs_seconds` を `86400`（1 日）以上の値に設定する。
2. `binlog_row_metadata` を `FULL` に設定する。
3. `binlog_row_image` を `FULL` に設定する。

これを行うには、インスタンス概要ページ右上の `Edit` ボタンをクリックします。

<Image img={gcp_mysql_edit_button} alt="GCP MySQL の Edit ボタン" size="lg" border/>

その後、`Flags` セクションまでスクロールし、上記のフラグを追加します。

<Image img={gcp_mysql_flags} alt="GCP で binlog フラグを設定する" size="lg" border/>

## データベースユーザーの設定 {#configure-database-user-gcp}

root ユーザーとして Cloud SQL の MySQL インスタンスに接続し、次のコマンドを実行します。

1. ClickPipes 用の専用ユーザーを作成します。

    ```sql
    CREATE USER 'clickpipes_user'@'host' IDENTIFIED BY 'some-password';
    ```

2. スキーマ権限を付与します。次の例は、`clickpipes` データベースに対する権限を示しています。複製したい各データベースおよびホストごとに、これらのコマンドを繰り返してください。

    ```sql
    GRANT SELECT ON `clickpipes`.* TO 'clickpipes_user'@'host';
    ```

3. ユーザーにレプリケーション権限を付与します。

    ```sql
    GRANT REPLICATION CLIENT ON *.* TO 'clickpipes_user'@'%';
    GRANT REPLICATION SLAVE ON *.* TO 'clickpipes_user'@'%';
    ```

## ネットワークアクセスを構成する {#configure-network-access-gcp-mysql}

Cloud SQL インスタンスへのトラフィックを制限したい場合は、[ドキュメントで説明されている静的 NAT IP](../../index.md#list-of-static-ips) を Cloud SQL MySQL インスタンスの許可リストに追加してください。
これは、インスタンスを編集するか、Cloud コンソールのサイドバーにある `Connections` タブから実行できます。

<Image img={gcp_mysql_ip} alt="GCP MySQL における IP 許可リスト設定" size="lg" border/>

## ルート CA 証明書のダウンロードと使用 {#download-root-ca-certificate-gcp-mysql}

Cloud SQL インスタンスに接続するには、ルート CA 証明書をダウンロードする必要があります。

1. Google Cloud コンソールで Cloud SQL インスタンスを開きます。
2. サイドバーで `Connections` をクリックします。
3. `Security` タブをクリックします。
4. `Manage server CA certificates` セクションで、画面下部にある `DOWNLOAD CERTIFICATES` ボタンをクリックします。

<Image img={gcp_mysql_cert} alt="GCP MySQL 証明書のダウンロード" size="lg" border/>

5. ClickPipes の UI で新しい MySQL ClickPipe を作成する際に、ダウンロードした証明書をアップロードします。

<Image img={rootca} alt="GCP MySQL 証明書の使用" size="lg" border/>