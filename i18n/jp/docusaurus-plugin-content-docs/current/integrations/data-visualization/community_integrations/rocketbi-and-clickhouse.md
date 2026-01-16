---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI はセルフサービス型のビジネスインテリジェンスプラットフォームで、データをすばやく分析し、ドラッグ＆ドロップでビジュアライゼーションを作成し、Web ブラウザ上で同僚とコラボレーションできます。'
title: '目標: 初めてのダッシュボードを作成する'
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

# 目標: Rocket.BI で最初のダッシュボードを構築する \{#goal-build-your-first-dashboard-with-rocketbi\}

<CommunityMaintainedBadge/>

このガイドでは、Rocket.BI をインストールして、シンプルなダッシュボードを作成します。
次のようなダッシュボードです:

<Image size="md" img={rocketbi_01} alt="チャートとKPIで売上指標を表示する Rocket BI のダッシュボード" border />

<br/>

[こちらのリンクからダッシュボードを確認できます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール \\{#install\\}

あらかじめ用意されている Docker イメージで RocketBI を起動します。

docker-compose.yml と設定ファイルを取得してください:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

`.clickhouse.env` を編集し、ClickHouse サーバー情報を追加します。

次のコマンドを実行して RocketBI を起動します：`docker-compose up -d .`

ブラウザを開き、`localhost:5050` にアクセスし、以下のアカウントでログインします：`hello@gmail.com/123456`

ソースコードからのビルドや高度な設定については、[Rocket.BI README](https://github.com/datainsider-co/rocket-bi/blob/main/README.md) を参照してください。


## ダッシュボードを作成しましょう \\{#lets-build-the-dashboard\\}

Dashboard では、作成したレポートを確認でき、**+New** をクリックして可視化を開始します。

ダッシュボードは**無制限に作成**でき、各ダッシュボード内で**無制限のチャート**を作成できます。

<Image size="md" img={rocketbi_02} alt="Rocket BI で新しいチャートを作成する手順を示すアニメーション" border />
<br/>

高解像度のチュートリアルは YouTube で確認できます: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャート用コントロールを作成する \\{#build-the-chart-controls\\}

#### メトリクスコントロールを作成する \\{#create-a-metrics-control\\}

Tab filter で、使用したいメトリクスフィールドを選択します。集計設定を必ず確認してください。

<Image size="md" img={rocketbi_03} alt="Rocket BI のメトリクスコントロール設定パネル。選択されたフィールドと集計設定が表示されている" border />

<br/>

フィルター名を変更し、コントロールをダッシュボードに保存します。

<Image size="md" img={rocketbi_04} alt="名前を変更したフィルターを持ち、ダッシュボードに保存可能な状態のメトリクスコントロール" border />

#### 日付タイプのコントロールを作成する \\{#create-a-date-type-control\\}

Date フィールドの中から、メインの Date 列を選択します:

<Image size="md" img={rocketbi_05} alt="Rocket BI の日付フィールド選択インターフェース。利用可能な日付列が表示されている" border />

<br/>

異なる参照期間を持つバリアントを複数追加します。たとえば、Year、Monthly、Daily date、または Day of Week などです。

<Image size="md" img={rocketbi_06} alt="年・月・日など、異なる期間オプションを設定する日付範囲設定画面" border />

<br/>

フィルター名を変更し、コントロールをダッシュボードに保存します。

<Image size="md" img={rocketbi_07} alt="名前を変更したフィルターを持ち、ダッシュボードに保存可能な状態の日付範囲コントロール" border />

### それでは、チャートを作成しましょう \\{#now-let-build-the-charts\\}

#### 円グラフ: 地域別の売上メトリクス \\{#pie-chart-sales-metrics-by-regions\\}

新しいチャートの追加を選択し、Pie Chart を選択します。

<Image size="md" img={rocketbi_08} alt="チャートタイプ選択パネル。円グラフオプションがハイライトされている" border />

<br/>

まず、データセットから "Region" 列を Legend フィールドへドラッグ & ドロップします。

<Image size="md" img={rocketbi_09} alt="Region 列をレジェンドフィールドに追加しているドラッグ & ドロップのインターフェース" border />

<br/>

次に、Chart Control タブに切り替えます。

<Image size="md" img={rocketbi_10} alt="可視化の設定オプションが表示された Chart control タブのインターフェース" border />

<br/>

Metrics Control を Value フィールドへドラッグ & ドロップします。

<Image size="md" img={rocketbi_11} alt="円グラフの value フィールドに追加されるメトリクスコントロール" border />

<br/>

（Metrics Control はソートにも利用できます）

さらにカスタマイズするために Chart Setting を開きます。

<Image size="md" img={rocketbi_12} alt="円グラフのカスタマイズオプションが表示されたチャート設定パネル" border />

<br/>

たとえば、Data label を Percentage に変更します。

<Image size="md" img={rocketbi_13} alt="円グラフ上のデータラベルをパーセンテージ表示に変更している設定画面" border />

<br/>

チャートを保存し、ダッシュボードに追加します。

<Image size="md" img={rocketbi_14} alt="新しく追加された円グラフと他のコントロールが表示されたダッシュボード画面" border />

#### 時系列チャートで日付コントロールを使用する \\{#use-date-control-in-a-time-series-chart\\}

Stacked Column Chart を使ってみましょう。

<Image size="md" img={rocketbi_15} alt="時系列データを使用した積み上げ縦棒グラフの作成インターフェース" border />

<br/>

Chart Control で、Y-axis に Metrics Control、X-axis に Date Range を設定します。

<Image size="md" img={rocketbi_16} alt="Y 軸にメトリクス、X 軸に日付範囲を設定したチャートコントロール構成画面" border />

<br/>

Breakdown に Region 列を追加します。

<Image size="md" img={rocketbi_17} alt="積み上げ縦棒グラフで Breakdown 次元として追加される Region 列" border />

<br/>

Number Chart を追加して KPI を表示し、ダッシュボードをより見やすくします。

<Image size="md" img={rocketbi_18} alt="KPI のナンバーチャート、円グラフ、時系列可視化が配置された完成済みダッシュボード" border />

<br/>

これで、rocket.BI を使った最初のダッシュボードが完成しました。