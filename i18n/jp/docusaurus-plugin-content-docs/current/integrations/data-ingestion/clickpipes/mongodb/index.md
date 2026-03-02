---
sidebar_label: 'MongoDB から ClickHouse へのデータのインジェスト'
description: 'MongoDB を ClickHouse Cloud とシームレスに接続する方法を説明します。'
slug: /integrations/clickpipes/mongodb
title: 'MongoDB から ClickHouse へのデータのインジェスト（CDC（変更データキャプチャ）を使用）'
doc_type: 'guide'
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


# MongoDB から ClickHouse へのデータ取り込み（CDC を使用） \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
ClickPipes を使用して MongoDB から ClickHouse Cloud へデータを取り込む機能は、パブリックベータ版です。
:::

:::note
ClickHouse Cloud のコンソールおよびドキュメントでは、MongoDB に対して「table」と「collection」を同じ意味で使用します。
:::

ClickPipes を使用して、MongoDB データベースから ClickHouse Cloud にデータを取り込むことができます。送信元の MongoDB データベースは、オンプレミス環境にホストされていても、MongoDB Atlas などのサービスを利用してクラウド上にホストされていても構いません。

## 前提条件 \{#prerequisites\}

開始する前に、まず MongoDB データベースがレプリケーション用に正しく構成されていることを確認する必要があります。構成手順は MongoDB のデプロイ方法によって異なるため、以下の該当するガイドに従ってください。

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [汎用的な MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

ソースとなる MongoDB データベースのセットアップが完了したら、ClickPipe の作成に進むことができます。

## ClickPipe を作成する \{#create-your-clickpipe\}

ClickHouse Cloud アカウントにログインしていることを確認してください。まだアカウントをお持ちでない場合は、[こちら](https://cloud.clickhouse.com/)からサインアップできます。

1. ClickHouse Cloud コンソールで、対象の ClickHouse Cloud Service に移動します。

<Image img={cp_service} alt="ClickPipes サービス" size="lg" border/>

2. 左側メニューから `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートを選択" size="lg" border/>

3. `MongoDB CDC` タイルを選択します。

<Image img={mongodb_tile} alt="MongoDB を選択" size="lg" border/>

### ソース MongoDB データベース接続の追加 \{#add-your-source-mongodb-database-connection\}

4. 事前準備の手順で設定したソース MongoDB データベースの接続情報を入力します。

   :::info
   接続情報の入力を始める前に、ファイアウォールルールで ClickPipes の IP アドレスをホワイトリストに登録していることを確認してください。次のページで [ClickPipes の IP アドレス一覧](../index.md#list-of-static-ips) を確認できます。
   詳細については、[このページの冒頭](#prerequisites) にリンクされているソース MongoDB セットアップガイドを参照してください。
   :::

   <Image img={mongodb_connection_details} alt="接続情報を入力" size="lg" border/>

#### （オプション）SSH トンネリングを設定する \{#optional-set-up-ssh-tunneling\}

ソースの MongoDB データベースがインターネットから直接アクセスできない場合は、SSH トンネリングの詳細を指定できます。

1. "Use SSH Tunnelling" トグルを有効にします。
2. SSH 接続情報を入力します。

   <Image img={ssh_tunnel} alt="SSH トンネリング" size="lg" border/>

3. 鍵ベース認証を使用するには、"Revoke and generate key pair" をクリックして新しいキーペアを生成し、生成された公開鍵を SSH サーバー上の `~/.ssh/authorized_keys` にコピーします。
4. "Verify Connection" をクリックして接続を確認します。

:::note
SSH バスティオンホストに対するファイアウォールルールで [ClickPipes IP addresses](../clickpipes#list-of-static-ips) を必ずホワイトリストに追加し、ClickPipes が SSH トンネルを確立できるようにしてください。
:::

接続情報の入力が完了したら、`Next` をクリックします。

#### 詳細設定を構成する \{#advanced-settings\}

必要に応じて詳細設定を構成できます。各設定の簡単な説明は以下のとおりです。

- **Sync interval**: ClickPipes がソースデータベースの変更をポーリングする間隔です。この値は宛先の ClickHouse サービスへの影響があり、コストを重視するユーザーには、この値を高め（`3600` 以上）に設定しておくことを推奨します。
- **Pull batch size**: 1 回のバッチで取得する行の数です。これはベストエフォートの設定であり、常にこの値どおりになるとは限りません。
- **Snapshot number of tables in parallel**: 初回スナップショット時に並列で取得するテーブル数です。多数のテーブルがあり、並列で取得するテーブル数を制御したい場合に有用です。

### テーブルを構成する \{#configure-the-tables\}

5. ここでは、ClickPipe の送信先データベースを選択できます。既存のデータベースを選択するか、新しいデータベースを作成することができます。

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. ソースの MongoDB データベースからレプリケーション対象とするテーブルを選択できます。テーブルを選択する際、送信先の ClickHouse データベース内でテーブル名を変更することもできます。

### 権限を確認し、ClickPipe を開始する \{#review-permissions-and-start-the-clickpipe\}

7. 権限のドロップダウンメニューから「Full access」ロールを選択し、「Complete Setup」をクリックします。

   <Image img={ch_permissions} alt="権限を確認する" size="lg" border/>

## 次のステップ \{#whats-next\}

MongoDB から ClickHouse Cloud へのデータをレプリケートするための ClickPipe のセットアップが完了したら、最適なパフォーマンスを得られるよう、データのクエリおよびモデリングをどのように行うかに注力できます。

## 注意事項 \{#caveats\}

このコネクタを使用する際の注意点は以下のとおりです。

- MongoDB バージョン 5.1.0 以上が必要です。
- CDC（変更データキャプチャ）のために MongoDB のネイティブな Change Streams API を使用しており、MongoDB の oplog に依存してリアルタイムの変更を取得します。
- MongoDB からのドキュメントは、デフォルトでは ClickHouse では JSON 型としてレプリケートされます。これにより柔軟なスキーマ管理が可能になり、ClickHouse の豊富な JSON 演算子セットをクエリや分析に利用できます。JSON データのクエリ方法については[こちら](https://clickhouse.com/docs/sql-reference/data-types/newjson)を参照してください。
- セルフサービスでの PrivateLink 構成は現在利用できません。AWS 上で PrivateLink が必要な場合は、db-integrations-support@clickhouse.com までご連絡いただくか、サポートチケットを作成してください。弊社にて有効化できるよう調整いたします。