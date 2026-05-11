---
sidebar_label: 'はじめに'
description: '初めての BigQuery ClickPipe を作成するためのステップバイステップガイド'
slug: /integrations/clickpipes/bigquery/get-started
title: '初めての BigQuery ClickPipe の作成'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step3.png';
import cp_step4 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step4.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step5.png';
import Image from '@theme/IdealImage';


# 最初の BigQuery ClickPipe の作成 \{#creating-your-first-bigquery-clickpipe\}

<IntroClickPipe/>

## 前提条件 \{#pre-requisites\}

* GCP プロジェクトで [service accounts](https://docs.cloud.google.com/iam/docs/service-account-overview) および [IAM roles](https://docs.cloud.google.com/iam/docs/roles-overview) を管理する権限を持っている必要があります。権限がない場合は管理者に依頼してください。[公式ドキュメント](https://docs.cloud.google.com/iam/docs/service-accounts-create) に従い、必要最小限の [permissions](./01_overview.md#permissions) を付与した専用の service account を作成することを推奨します。

* 初期ロード処理には、ステージング用としてユーザーが用意した Google Cloud Storage (GCS) バケットが必要です。[公式ドキュメント](https://docs.cloud.google.com/storage/docs/creating-buckets) に従い、ClickPipe 専用のバケットを作成することを推奨します。将来的には、中間バケットは ClickPipes によって提供および管理される予定です。

<VerticalStepper type="numbered" headerLevel="h2">

## データソースの選択 \{#1-select-the-data-source\}

**1.** ClickHouse Cloud のメインナビゲーションメニューから **Data sources** を選択し、**Create ClickPipe** をクリックします。

    <Image img={cp_step0} alt="インポートの選択" size="lg" border/>

**2.** **BigQuery** タイルをクリックします。

    <Image img={cp_step1} alt="BigQuery タイルの選択" size="lg" border/>

## ClickPipe 接続のセットアップ \{#2-setup-your-clickpipe-connection\}

新しい ClickPipe をセットアップするには、BigQuery データウェアハウスへの接続方法と認証情報、さらにステージング用 GCS バケットの詳細を指定する必要があります。

**1.** ClickPipes 用に作成した service account の `.json` キーをアップロードします。service account に必要最小限の [permissions](./01_overview.md#permissions) が付与されていることを確認してください。

    <Image img={cp_step2} alt="service account キーのアップロード" size="lg" border/>    

**2.** **Replication method** を選択します。Private Preview では、サポートされるオプションは [**Initial load only**](./01_overview.md#initial-load) のみです。

**3.** 初期ロード中にデータをステージングするための GCS バケットへのパスを指定します。

**4.** **Next** をクリックして検証します。

## ClickPipe の設定 \{#3-configure-your-clickpipe\}

BigQuery データセットのサイズや、同期したいテーブルの合計サイズによっては、ClickPipe のデフォルトのインジェスト設定を調整する必要がある場合があります。

## テーブルの設定 \{#4-configure-tables\}

**1.** BigQuery のテーブルをレプリケーションする ClickHouse データベースを選択します。既存のデータベースを選択することも、新規に作成することもできます。

**2.** レプリケーションするテーブルと、必要に応じてカラムを選択します。ここには、指定した service account がアクセスできる dataset のみが表示されます。

    <Image img={cp_step3} alt="権限" size="lg" border/>

**3.** 選択した各テーブルに対して、**Advanced settings** > **Use a custom sorting key** からカスタムのソートキーを必ず定義します。将来的には、ソートキーは上流データベースの既存のクラスタリングキーまたはパーティショニングキーに基づいて自動的に推論される予定です。

    :::warning
    ClickHouse でのクエリパフォーマンスを最適化するため、レプリケーションされるテーブルには必ず [sorting key](../../../../best-practices/choosing_a_primary_key.md) を定義する必要があります。定義しない場合、ソートキーは `tuple()` に設定され、プライマリ索引が作成されないため、そのテーブルに対するすべてのクエリで ClickHouse がフルテーブルスキャンを実行することになります。
    :::

    <Image img={cp_step4} alt="権限" size="lg" border/>

## 権限の設定 \{#6-configure-permissions\}

最後に、内部 ClickPipes ユーザーの権限を設定します。

**Permissions:** ClickPipes は、宛先テーブルにデータを書き込む専用ユーザーを作成します。この内部ユーザーには、カスタムロールまたはあらかじめ定義されたロールのいずれかを選択できます:
- `Full access`: クラスタへのフルアクセスを許可します。宛先テーブルで materialized views や Dictionary を使用する場合に必要です。
- `Only destination`: 宛先テーブルへの挿入権限のみを許可します。

## セットアップの完了 \{#7-complete-setup\}

**Create ClickPipe** をクリックしてセットアップを完了します。Overview ページにリダイレクトされ、初期ロードの進行状況を確認し、BigQuery ClickPipes の詳細を参照できます。

<Image img={cp_step5} alt="権限" size="lg" border/>

</VerticalStepper>