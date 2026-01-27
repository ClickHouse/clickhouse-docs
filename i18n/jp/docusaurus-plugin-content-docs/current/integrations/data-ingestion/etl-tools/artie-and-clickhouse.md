---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', '接続', '連携', 'cdc', 'etl', 'データ連携', 'リアルタイム', 'ストリーミング']
slug: /integrations/artie
description: 'Artie の CDC ストリーミングプラットフォームを使用して、ClickHouse にデータをストリーミングで取り込む'
title: 'Artie を ClickHouse に接続する'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# Artie を ClickHouse に接続する \{#connect-artie-to-clickhouse\}

<a href="https://www.artie.com/" target="_blank">Artie</a> は、本番環境のデータを ClickHouse にレプリケーションし、顧客向け分析、運用ワークフロー、そして本番環境での Agentic AI を実現する、完全マネージド型のリアルタイムデータストリーミングプラットフォームです。

## 概要 \{#overview\}

Artie は AI 時代のための最新のデータ基盤レイヤーであり、本番データをデータウェアハウスと継続的に同期し続ける、フルマネージドなリアルタイムデータストリーミングプラットフォームです。

企業がリアルタイム AI ワークロード、オペレーショナルアナリティクス、顧客向けデータプロダクトのためにウェアハウスを活用する中で、高速で信頼性が高く、スケールするインフラストラクチャへの標準化が進んでいます。

私たちは、Netflix、DoorDash、Instacart が社内で構築したようなストリーミングパイプラインと高いオブザーバビリティを、10 名以上のエンジニアを採用して 1～2 年かけてプラットフォーム開発を行うことなく提供します。Artie は、変更キャプチャ、マージ、バックフィル、オブザーバビリティといったインジェストライフサイクル全体を自動化し、エンジニアによる保守は不要で、数分でデプロイできます。

ClickUp、Substack、Alloy のようなリーダー企業は、今日のパイプラインの課題を解決するだけでなく、AI 戦略の加速に合わせてデータスタックを将来にわたって通用するものにするために Artie を利用しています。

<VerticalStepper headerLevel="h2">

## Artie アカウントを作成する \{#1-create-an-artie-account\}

<a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> にアクセスし、フォームに入力してアクセスをリクエストしてください。

<Image img={artie_signup} size="md" border alt="Artie のサインアップページ" />

## ClickHouse の認証情報を確認する \{#2-find-your-clickhouse-credentials\}

ClickHouse Cloud でサービスを作成した後、次の必須設定を確認します。

<ConnectionDetails />

## Artie で新しいパイプラインを作成する \{#3-create-a-new-pipeline-in-artie\}

前の手順で収集した情報をもとに Artie にアクセスし、次の 3 ステップで新しいパイプラインを作成します。

1. **ソースに接続する** - ソースデータベース（Postgres、MySQL、Events API など）を設定します
2. **レプリケートしたいテーブルを選択する** - ClickHouse に同期するテーブルを選択します
3. **宛先に接続する** - ClickHouse の認証情報を入力します

<Image img={artie_edit_pipeline} size="lg" border alt="Artie の Edit Pipeline インターフェース" />

</VerticalStepper>

## お問い合わせ \{#contact-us\}

ご不明な点がある場合は、<a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse ドキュメント</a>を参照するか、<a href="mailto:hi@artie.com">hi@artie.com</a> までお問い合わせください。

## 製品スクリーンショット \{#product-screenshots\}

Analytics ポータル

<Image img={analytics} size="md" border alt="Analytics ポータル"/>

パイプラインおよびテーブルごとのモニター

<Image img={monitor} size="md" border alt="組み込みのモニタリング"/>

日次のスキーマ変更通知

<Image img={schema_notification} size="md" border alt="スキーマ通知"/>