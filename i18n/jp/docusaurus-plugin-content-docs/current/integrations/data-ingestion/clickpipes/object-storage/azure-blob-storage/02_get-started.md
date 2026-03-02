---
sidebar_label: 'はじめに'
description: '初めての Azure Blob Storage (ABS) ClickPipe を作成するためのステップバイステップガイドです。'
slug: /integrations/clickpipes/object-storage/azure-blob-storage/get-started
sidebar_position: 1
title: '初めての Azure Blob Storage ClickPipe を作成する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import navigateToDatasources from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/01-navigate-to-datasources.png'
import createClickpipe from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/02-create-clickpipe.png'
import selectBlobStorage from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/03-select-blob-storage.png'
import configurationDetails from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/04-configuration-details.png'
import chooseDataFormat from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/05-choose-data-format.png'
import parseInformation from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/06-parse-information.png'
import permissions from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/07-permissions.png'

**前提条件**

このガイドに従うには、次が必要です。

* Azure Blob Storage アカウント
* [Azure 接続文字列](/integrations/azure-data-factory/table-function#acquiring-azure-blob-storage-access-keys)
* コンテナー名
* 稼働中の ClickHouse Cloud サービス

<VerticalStepper headerLevel="h2">
  ## データソースに移動する \{#navigate-to-data-sources\}

  サービスのホームページから、左側のメニューで **Data sources** をクリックします。
  **ClickPipes** ドロップダウンを展開し、**Create ClickPipe** をクリックします。

  <Image img={navigateToDatasources} alt="データソースへ移動" size="md" />

  <Image img={createClickpipe} alt="ClickPipe を作成" size="md" />

  ## データソースを選択する \{#select-data-source\}

  データタイプとして **Azure Blob Storage** を選択します。

  <Image img={selectBlobStorage} alt="Azure Blob Storage を選択" size="md" />

  ## ClickPipe 接続を設定する \{#setup-connection\}

  1. ClickPipe にわかりやすい名前を付けます。
  2. 認証方法のドロップダウンから **Connection String** を選択します。
  3. **Connection string** フィールドに Azure 接続文字列を貼り付けます。
  4. コンテナー名を入力します。
  5. Azure Blob Storage のファイルパスを入力します。複数ファイルを取り込みたい場合はワイルドカードを使用します。

  必要に応じて、継続的インジェストを有効にします。詳しくは [&quot;Continuous Ingestion&quot;](/integrations/clickpipes/object-storage/abs/overview#continuous-ingestion) を参照してください。

  最後に **Incoming data** をクリックします。

  <Image img={configurationDetails} alt="設定の詳細" size="md" />

  ## データ形式を選択する \{#select-data-format\}

  1. ファイルタイプを選択します。
  2. ファイル圧縮形式を選択します（`detect automatically`, `none`, `gzip`, `brotli`, `xz`, `zstd` のいずれか）。
  3. カンマ区切り形式で使用される区切り文字など、追加のフォーマット固有の設定を行います。
  4. **Parse information** をクリックします。

  <Image img={chooseDataFormat} alt="データ形式を選択" size="md" />

  ## テーブル、スキーマ、設定を構成する \{#configure-table-schema\}

  ここでは、新しいテーブルを作成するか、受信データを保存する既存テーブルを選択する必要があります。

  1. 新しいテーブルにデータをアップロードするか、既存テーブルにアップロードするかを選択します。
  2. 使用するデータベースを選択し、新規テーブルの場合はテーブル名も指定します。
  3. ソートキーを 1 つ以上選択します。
  4. カラム名、カラム型、デフォルト値、NULL 許容に関して、ソースファイルから宛先テーブルへのマッピングを定義します。
  5. 最後に、使用するエンジンタイプ、パーティションの式、プライマリキーなどの高度な設定を指定します。

  <Image img={parseInformation} alt="情報を解析" size="md" />

  テーブル、スキーマ、設定の構成が完了したら、**Details and settings** をクリックします。

  ## 権限を構成する \{#configure-permissions\}

  ClickPipes は、データ書き込み専用のデータベースユーザーを作成します。
  このユーザーに割り当てるロールを選択できます。
  宛先テーブルから materialized view や Dictionary にアクセスする場合は、&quot;Full access&quot; を選択してください。

  <Image img={permissions} alt="権限を構成" size="md" />

  ## セットアップを完了する \{#complete-setup\}

  **Create ClickPipe** をクリックしてセットアップを完了します。

  これで、ステータスが **provisioning** の ClickPipe が表示されるはずです。
  しばらくすると、ステータスは **provisioning** から **completed** に変わります。
</VerticalStepper>
