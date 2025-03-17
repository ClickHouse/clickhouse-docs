---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /integrations/rocketbi
keywords: [clickhouse, RocketBI, connect, integrate, ui]
description: RocketBIは、データを迅速に分析し、ドラッグ&ドロップで可視化を構築し、同僚とブラウザ上でコラボレーションできるセルフサービスのビジネスインテリジェンスプラットフォームです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# 目標: 最初のダッシュボードを構築する

このガイドでは、Rocket.BIを使用してシンプルなダッシュボードをインストールし、構築します。
これがダッシュボードです:

<img width="800" alt="Github RocketBI" src={rocketbi_01}/>
<br/>

[こちらのリンクからダッシュボードをチェックできます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール {#install}

事前に用意されたDockerイメージを使用してRocketBIを開始します。

docker-compose.ymlファイルと設定ファイルを取得します:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.envを編集し、ClickHouseサーバー情報を追加します。

以下のコマンドを実行してRocketBIを開始します: ``` docker-compose up -d . ```

ブラウザを開き、```localhost:5050```に移動し、次のアカウントでログインします: ```hello@gmail.com/123456```

ソースからビルドするか、詳細な設定については、[Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)を確認してください。

## ダッシュボードを構築しよう {#lets-build-the-dashboard}

ダッシュボードでは、レポートが表示され、**+New**をクリックして可視化を開始します。

**無制限のダッシュボード**を構築し、ダッシュボード内に**無制限のチャート**を描画できます。

<img width="800" alt="RocketBI create chart" src={rocketbi_02}/>
<br/>

Youtubeで高解像度のチュートリアルをご覧ください: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリックコントロールを作成する {#create-a-metrics-control}
タブフィルターで使用したいメトリックフィールドを選択します。集計設定を確認してください。

<img width="650" alt="RocketBI chart 6" src={rocketbi_03}/>
<br/>

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<img width="400" alt="Metrics Control" src={rocketbi_04}/>

#### 日付型コントロールを作成する {#create-a-date-type-control}
主日付カラムとして日付フィールドを選択します:

<img width="650" alt="RocketBI chart 4" src={rocketbi_05}/>
<br/>

異なるルックアップ範囲を持つ重複のバリエーションを追加します。例えば、年、月次、日次の日付、または曜日です。

<img width="650" alt="RocketBI chart 5" src={rocketbi_06}/>
<br/>

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<img width="200" alt="Date Range Control" src={rocketbi_07}/>

### さあ、チャートを構築しましょう {#now-let-build-the-charts}

#### 円グラフ: 地域別売上メトリック {#pie-chart-sales-metrics-by-regions}
新しいチャートを追加し、円グラフを選択します。

<img width="650" alt="Add Pie Chart" src={rocketbi_08}/>
<br/>

最初に、データセットから "Region" カラムをレジェンドフィールドにドラッグ＆ドロップします。

<img width="650" alt="Drag-n-drop Column to Chart" src={rocketbi_09}/>
<br/>

次に、チャートコントロールタブに切り替えます。

<img width="650" alt="Navigate to Chart Control in Visualization" src={rocketbi_10}/>
<br/>

メトリックコントロールを値フィールドにドラッグ＆ドロップします。

<img width="650" alt="Use Metrics Control in Chart" src={rocketbi_11}/>
<br/>

（メトリックコントロールをソートに使用することもできます）

チャート設定に移動してさらにカスタマイズします。

<img width="650" alt="Custom the Chart with Setting" src={rocketbi_12}/>
<br/>

例えば、データラベルをパーセンテージに変更します。

<img width="650" alt="Chart Customization Example" src={rocketbi_13}/>
<br/>

チャートを保存し、ダッシュボードに追加します。

<img width="650" alt="Overview Dashboard with Pie Chart" src={rocketbi_14}/>

#### 時系列チャートで日付コントロールを使用する {#use-date-control-in-a-time-series-chart}
スタックコラムチャートを使用します。

<img width="650" alt="Create a Time-series chart with Tab Control" src={rocketbi_15}/>
<br/>

チャートコントロールで、Y軸にメトリックコントロール、X軸に日付範囲を使用します。

<img width="650" alt="Use Date Range as Controller" src={rocketbi_16}/>
<br/>

地域カラムをブレイクダウンに追加します。

<img width="650" alt="Add Region into Breakdown" src={rocketbi_17}/>
<br/>

KPIsとして数値チャートを追加し、ダッシュボードを見栄え良くします。

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={rocketbi_18} />
<br/>

これで、rocket.BIを使用して最初のダッシュボードを成功裏に構築しました。
