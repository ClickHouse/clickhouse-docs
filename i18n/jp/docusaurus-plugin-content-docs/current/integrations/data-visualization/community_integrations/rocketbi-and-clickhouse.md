---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI はセルフサービス型のビジネスインテリジェンスプラットフォームで、Web ブラウザー上でデータをすばやく分析し、ドラッグ＆ドロップでビジュアライゼーションを作成し、同僚と共同で作業できます。'
title: '目標: はじめてのダッシュボードを作成'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import rocketbi_01 from '@site/static/images/integrations/data-visualization/rocketbi_01.gif';
import rocketbi_02 from '@site/static/images/integrations/data-visualization/rocketbi_02.gif';
import rocketbi_03 from '@site/static/images/integrations/data-visualization/rocketbi_03.png';
import rocketbi_04 from '@site/static/images/integrations/data-visualization/rocketbi_04.png';
import rocketbi_05 from '@site/static/images/integrations/data-visualization/rocketbi_05.png';
import rocketbi_06 from '@site/static/images/integrations/data-visualization/rocketbi_06.png';
import rocketbi_07 from '@site/static/images/integrations/data-visualization/rocketbi_07.png';
import rocketbi_08 from '@site/static/images/integrations/data-visualization/rocketbi_08.png';
import rocketbi_09 from '@site/static/images/integrations/data-visualization/rocketbi_09.png';
import rocketbi_10 from '@site/static/images/integrations/data-visualization/rocketbi_10.png';
import rocketbi_11 from '@site/static/images/integrations/data-visualization/rocketbi_11.png';
import rocketbi_12 from '@site/static/images/integrations/data-visualization/rocketbi_12.png';
import rocketbi_13 from '@site/static/images/integrations/data-visualization/rocketbi_13.png';
import rocketbi_14 from '@site/static/images/integrations/data-visualization/rocketbi_14.png';
import rocketbi_15 from '@site/static/images/integrations/data-visualization/rocketbi_15.png';
import rocketbi_16 from '@site/static/images/integrations/data-visualization/rocketbi_16.png';
import rocketbi_17 from '@site/static/images/integrations/data-visualization/rocketbi_17.png';
import rocketbi_18 from '@site/static/images/integrations/data-visualization/rocketbi_18.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 目標：Rocket.BI ではじめてのダッシュボードを作成する \{#goal-build-your-first-dashboard-with-rocketbi\}

<CommunityMaintainedBadge />

このガイドでは、Rocket.BI をインストールして、シンプルなダッシュボードを作成します。
以下がそのダッシュボードです。

<Image size="md" img={rocketbi_01} alt="売上メトリクス、チャート、KPI を表示する Rocket BI ダッシュボード" border />

<br />

[こちらのリンクからダッシュボードを確認できます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール \{#install\}

あらかじめ用意された Docker イメージを使用して RocketBI を起動します。

docker-compose.yml と設定ファイルを取得します。

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

`.clickhouse.env` を編集し、ClickHouse サーバーの情報を追加します。

`docker-compose up -d .` コマンドを実行して RocketBI を起動します。

ブラウザを開いて `localhost:5050` にアクセスし、このアカウントでログインします: `hello@gmail.com/123456`

ソースからビルドする場合や高度な設定を行う場合は、こちらを確認してください [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ダッシュボードを作成しましょう \{#lets-build-the-dashboard\}

ダッシュボードでは、レポートを確認し、**+New** をクリックしてビジュアライゼーションを開始できます。

1 つのダッシュボード内で**無制限のチャート**を作成できます。

<Image size="md" img={rocketbi_02} alt="Rocket BI で新しいチャートを作成する手順を示すアニメーション" border />

<br />

高解像度のチュートリアルは YouTube でご覧ください: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートのコントロールを作成する \{#build-the-chart-controls\}

#### メトリクスコントロールを作成する \{#create-a-metrics-control\}

[Tab] フィルタで、使用するメトリクスフィールドを選択します。集計設定を必ず確認してください。

<Image size="md" img={rocketbi_03} alt="選択したフィールドと集計設定が表示された Rocket BI のメトリクスコントロール設定パネル" border />

<br />

フィルタ名を変更し、[ダッシュボードに保存する] をクリックします

<Image size="md" img={rocketbi_04} alt="フィルタ名を変更し、ダッシュボードに保存する準備ができたメトリクスコントロール" border />

#### 日付型コントロールを作成する \{#create-a-date-type-control\}

メインの日付カラムとして Date フィールドを選択します。

<Image size="md" img={rocketbi_05} alt="利用可能な日付カラムが表示された Rocket BI の日付フィールド選択画面" border />

<br />

参照範囲の異なるバリアントを複製して追加します。たとえば、年次、月次、日次、曜日などです。

<Image size="md" img={rocketbi_06} alt="年、月、日などの期間オプションを示す日付範囲の設定画面" border />

<br />

フィルタ名を変更し、コントロールをダッシュボードに保存します

<Image size="md" img={rocketbi_07} alt="フィルタ名を変更した日付範囲コントロール。ダッシュボードに保存する準備ができた状態" border />

### それでは、チャートを作成しましょう \{#now-let-build-the-charts\}

#### 円グラフ: 地域別の売上メトリクス \{#pie-chart-sales-metrics-by-regions\}

「Adding new chart」を選択し、続けて「Pie Chart」を選択します

<Image size="md" img={rocketbi_08} alt="円グラフのオプションが強調表示されたチャートタイプ選択パネル" border />

<br />

まず、Dataset から「Region」カラムを Legend Field にドラッグ＆ドロップします

<Image size="md" img={rocketbi_09} alt="Region カラムが凡例フィールドに追加される様子を示すドラッグ＆ドロップ画面" border />

<br />

次に、Chart Control タブに切り替えます

<Image size="md" img={rocketbi_10} alt="ビジュアライゼーション設定オプションを示す Chart Control タブの画面" border />

<br />

Metrics Control を Value Field にドラッグ＆ドロップします

<Image size="md" img={rocketbi_11} alt="円グラフの値フィールドに Metrics Control が追加される様子" border />

<br />

(Metrics Control は Sorting として使うこともできます)

さらにカスタマイズするには、Chart Setting に移動します

<Image size="md" img={rocketbi_12} alt="円グラフのカスタマイズオプションを示す Chart Settings パネル" border />

<br />

たとえば、Data label を Percentage に変更します

<Image size="md" img={rocketbi_13} alt="円グラフ上に割合を表示するよう Data label の設定を変更している様子" border />

<br />

チャートを保存し、ダッシュボードに追加します

<Image size="md" img={rocketbi_14} alt="新しく追加した円グラフと他のコントロールが表示された ダッシュボード ビュー" border />

#### 日付コントロールを時系列チャートで使う \{#use-date-control-in-a-time-series-chart\}

積み上げ縦棒チャートを使用します

<Image size="md" img={rocketbi_15} alt="時系列データを使った積み上げ縦棒チャートの作成画面" border />

<br />

Chart Control で、Y 軸に Metrics Control、X 軸に Date Range を設定します

<Image size="md" img={rocketbi_16} alt="Y 軸に Metrics Control、X 軸に Date Range を設定した Chart Control の構成" border />

<br />

Breakdown に Region カラムを追加します

<Image size="md" img={rocketbi_17} alt="積み上げ縦棒チャートで Breakdown のディメンションとして Region カラムを追加している画面" border />

<br />

KPI として Number Chart を追加し、ダッシュボードを見栄えよく仕上げます

<Image size="md" img={rocketbi_18} alt="KPI の Number Chart、円グラフ、時系列ビジュアライゼーションを備えた完成済みのダッシュボード" border />

<br />

これで、rocket.BI ではじめてのダッシュボードを作成できました