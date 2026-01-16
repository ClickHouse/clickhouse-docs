---
sidebar_label: 'MongoDB から ClickHouse へのデータインジェスト'
description: 'MongoDB を ClickHouse Cloud にシームレスに接続する方法を説明します。'
slug: /integrations/clickpipes/mongodb
title: 'MongoDB から ClickHouse へデータをインジェスト（CDC を使用）'
doc_type: 'ガイド'
keywords: ['clickpipes', 'mongodb', 'cdc', 'データインジェスト', 'リアルタイム同期']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'

# MongoDB から ClickHouse へのデータ取り込み（CDC の使用） \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes を使用して MongoDB から ClickHouse Cloud へデータを取り込む機能は、現在パブリックベータ段階です。
:::

:::note
ClickHouse Cloud のコンソールおよびドキュメントでは、MongoDB に対して「table」と「collection」は同義語として使用されます。
:::

ClickPipes を使用すると、MongoDB データベースから ClickHouse Cloud にデータを取り込むことができます。ソースとなる MongoDB データベースは、オンプレミス環境でホストすることも、MongoDB Atlas のようなサービスを利用してクラウド上にホストすることもできます。

## 前提条件 \\{#prerequisites\\}

作業を開始する前に、MongoDB データベースがレプリケーション用に正しく構成されていることを確認する必要があります。構成手順は MongoDB のデプロイ方法によって異なるため、以下の該当するガイドに従ってください。

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [一般的な MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

ソース MongoDB データベースのセットアップが完了したら、ClickPipe の作成に進みます。

## ClickPipe を作成する \\{#create-your-clickpipe\\}

ClickHouse Cloud アカウントにログインしていることを確認してください。まだアカウントがない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud Service に移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側メニューの `Data Sources` ボタンを選択し、"Set up a ClickPipe" をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `MongoDB CDC` タイルを選択します。

<Image img={mongodb_tile} alt="MongoDB を選択" size="lg" border/>

### ソース MongoDB データベース接続を追加する \\{#add-your-source-mongodb-database-connection\\}

4. 事前準備のステップで設定したソース MongoDB データベースの接続情報を入力します。

   :::info
   接続情報の入力を開始する前に、ファイアウォールルールで ClickPipes の IP アドレスをホワイトリストに登録していることを確認してください。次のページで [ClickPipes の IP アドレス一覧](../index.md#list-of-static-ips) を確認できます。
   詳細については、[このページの先頭](#prerequisites)にリンクされているソース MongoDB セットアップガイドを参照してください。
   :::

   <Image img={mongodb_connection_details} alt="接続情報を入力" size="lg" border/>

#### （オプション）SSH トンネリングを設定する \\{#optional-set-up-ssh-tunneling\\}

ソース MongoDB データベースがインターネットから直接アクセスできない場合は、SSH トンネリングの詳細を指定できます。

1. "Use SSH Tunnelling" トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. キーベース認証を使用するには、"Revoke and generate key pair" をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバーの `~/.ssh/authorized_keys` にコピーします。
4. "Verify Connection" をクリックして接続を確認します。

:::note
ClickPipes が SSH トンネルを確立できるように、SSH バスティオンホストのファイアウォールルールで [ClickPipes の IP アドレス](../clickpipes#list-of-static-ips) を必ずホワイトリストに登録してください。
:::

接続情報の入力が完了したら、`Next` をクリックします。

#### 詳細設定を構成する \\{#advanced-settings\\}

必要に応じて詳細設定を構成できます。各設定の概要は次のとおりです。

- **Sync interval**: ClickPipes がソースデータベースの変更をポーリングする間隔です。これは宛先の ClickHouse サービスにも影響します。コストを重視するユーザーには、この値を高め（`3600` 以上）に保つことを推奨します。
- **Pull batch size**: 1 回のバッチでフェッチする行数です。これはベストエフォートの設定であり、すべての場合で厳密に守られるとは限りません。
- **Snapshot number of tables in parallel**: 初期スナップショット時に並列でフェッチするテーブル数です。多数のテーブルがある場合に、並列でフェッチするテーブル数を制御したいときに有用です。

### テーブルを構成する \\{#configure-the-tables\\}

5. ここで ClickPipe の宛先データベースを選択できます。既存のデータベースを選択することも、新規に作成することもできます。

   <Image img={select_destination_db} alt="宛先データベースを選択" size="lg" border/>

6. ソース MongoDB データベースからレプリケートしたいテーブルを選択できます。テーブルを選択する際、宛先の ClickHouse データベースでテーブル名を変更することもできます。

### 権限を確認して ClickPipe を開始する \\{#review-permissions-and-start-the-clickpipe\\}

7. 権限のドロップダウンから "Full access" ロールを選択し、"Complete Setup" をクリックします。

   <Image img={ch_permissions} alt="権限を確認" size="lg" border/>

## 次のステップ \\{#whats-next\\}

MongoDB から ClickHouse Cloud へデータをレプリケートする ClickPipe のセットアップが完了したら、最適なパフォーマンスを得るために、データのクエリ方法とモデリング方法に集中できます。

## 注意事項 \\{#caveats\\}

このコネクタを使用する際の注意事項は次のとおりです。

- MongoDB のバージョン 5.1.0 以上が必要です。
- CDC には MongoDB のネイティブの Change Streams API を使用しており、MongoDB の oplog に依存してリアルタイムの変更を取得します。
- MongoDB からのドキュメントは、デフォルトでは ClickHouse では JSON 型としてレプリケートされます。これにより柔軟なスキーマ管理が可能になり、ClickHouse の豊富な JSON 演算子をクエリや分析に利用できます。JSON データのクエリ方法については[こちら](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
- ユーザー自身で行う PrivateLink の構成は現在利用できません。AWS 上で PrivateLink が必要な場合は、db-integrations-support@clickhouse.com までご連絡いただくか、サポートチケットを作成してください。有効化に向けて個別に対応します。