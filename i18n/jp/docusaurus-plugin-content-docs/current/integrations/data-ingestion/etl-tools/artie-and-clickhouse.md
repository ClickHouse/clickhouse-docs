---
sidebar_label: 'Artie'
sidebar_position: 12
keywords: ['clickhouse', 'Artie', '接続', '統合', 'CDC', 'etl', 'データ統合', 'リアルタイム', 'ストリーミング']
slug: /integrations/artie
description: 'Artie CDCストリーミングプラットフォームを使用して、データをClickHouseにストリーミング'
title: 'Artie を ClickHouse に接続'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import artie_signup from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_signup.png';
import artie_edit_pipeline from '@site/static/images/integrations/data-ingestion/etl-tools/artie/artie_edit_pipeline.png';
import analytics from '@site/static/images/integrations/data-ingestion/etl-tools/artie/analytics.png';
import monitor from '@site/static/images/integrations/data-ingestion/etl-tools/artie/monitor.png';
import schema_notification from '@site/static/images/integrations/data-ingestion/etl-tools/artie/schema_notification.png';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

<a href="https://www.artie.com/" target="_blank">Artie</a>は、本番データをClickHouseに複製し、顧客向けアナリティクス、運用ワークフロー、本番環境でのAgentic AIを実現する完全マネージド型のリアルタイムデータストリーミングプラットフォームです。

## 概要 \{#overview\}

Artie は AI 時代に向けた最新のデータインフラストラクチャレイヤーです。完全マネージド型のリアルタイムデータストリーミングプラットフォームとして、本番データをデータウェアハウスと継続的に同期します。

企業がリアルタイム AI ワークロード、運用分析、顧客向けデータプロダクトに向けてデータウェアハウスを活用するなか、高速で信頼性が高く、スケールを前提に設計されたインフラストラクチャの標準化が進んでいます。

Artie は、Netflix、DoorDash、Instacart が社内構築してきたようなストリーミングパイプラインと高度なオブザーバビリティを、10 人以上のエンジニア採用や 1～2 年にわたるプラットフォーム構築なしで提供します。Artie は、変更データの取得、マージ、バックフィル、オブザーバビリティを含むインジェストライフサイクル全体を自動化し、エンジニアリングによる保守を不要にしたうえで、数分でデプロイできます。

ClickUp、Substack、Alloy などの先進企業は、現在のパイプラインの課題を解決するだけでなく、AI 戦略の加速に合わせてデータスタックの将来性を確保するためにも Artie を活用しています。

<VerticalStepper headerLevel="h2">
  ## Artie アカウントを作成する \{#1-create-an-artie-account\}

  <a href="https://www.artie.com/contact" target="_blank">artie.com/contact</a> にアクセスし、フォームに入力してアクセスを申請してください。

  <Image img={artie_signup} size="md" border alt="Artie のサインアップページ" />

  ## ClickHouse の認証情報を確認する \{#2-find-your-clickhouse-credentials\}

  ClickHouse Cloud でサービスを作成したら、次の必須設定を確認してください。

  <ConnectionDetails />

  ## Artie で新しいパイプラインを作成する \{#3-create-a-new-pipeline-in-artie\}

  前の手順で収集した情報を使って Artie で新しいパイプラインを作成します。手順は次の 3 ステップです。

  1. **ソースを接続する** - ソースデータベース (Postgres、MySQL、Events API など) を設定します
  2. **複製するテーブルを選択する** - ClickHouse に同期するテーブルを選択します
  3. **宛先を接続する** - ClickHouse の認証情報を入力します

  <Image img={artie_edit_pipeline} size="lg" border alt="Artie のパイプライン編集インターフェイス" />
</VerticalStepper>

## お問い合わせ \{#contact-us\}

ご不明な点がある場合は、<a href="https://www.artie.com/docs/destinations/clickhouse" target="_blank">ClickHouse docs</a>をご参照いただくか、<a href="mailto:hi@artie.com">hi@artie.com</a>までお問い合わせください。

## 製品スクリーンショット \{#product-screenshots\}

アナリティクス ポータル

<Image img={analytics} size="md" border alt="アナリティクス ポータル" />

パイプラインおよびテーブルごとの監視

<Image img={monitor} size="md" border alt="内蔵の監視" />

毎日のスキーマ変更通知

<Image img={schema_notification} size="md" border alt="スキーマ変更通知" />