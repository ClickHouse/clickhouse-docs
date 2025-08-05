---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: '/integrations/rocketbi'
keywords:
- 'clickhouse'
- 'RocketBI'
- 'connect'
- 'integrate'
- 'ui'
description: 'RocketBI is a self-service business intelligence platform that helps
  you quickly analyze data, build drag-n-drop visualizations and collaborate with
  colleagues right on your web browser.'
title: 'GOAL: BUILD YOUR 1ST DASHBOARD'
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


# ゴール: 最初のダッシュボードを構築する

<CommunityMaintainedBadge/>

このガイドでは、Rocket.BIを使用してシンプルなダッシュボードをインストールして構築します。
これがダッシュボードです：

<Image size="md" img={rocketbi_01} alt="Sales metrics with charts and KPIsを示すRocket BIダッシュボード" border />
<br/>

[このリンクからダッシュボードをチェックできます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール {#install}

あらかじめ用意されたDockerイメージを使用してRocket.BIを起動します。

docker-compose.ymlと設定ファイルを取得します：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.envを編集し、ClickHouseサーバー情報を追加します。

次のコマンドを実行してRocket.BIを起動します: ``` docker-compose up -d . ```

ブラウザを開き、```localhost:5050```にアクセスし、このアカウントでログインします: ```hello@gmail.com/123456```

ソースからビルドしたり、詳細な設定を行ったりする場合は、こちらを確認できます: [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ダッシュボードの構築を始めましょう {#lets-build-the-dashboard}

ダッシュボードでは、レポートを見つけ、**+新規**をクリックして視覚化を開始します。

**無限のダッシュボード**を構築し、ダッシュボードに**無限のチャート**を描くことができます。

<Image size="md" img={rocketbi_02} alt="Rocket BIで新しいチャートを作成するプロセスを示すアニメーション" border />
<br/>

Youtubeでの高解像度チュートリアルを参照してください: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリックコントロールを作成する {#create-a-metrics-control}
タブフィルターで使用したいメトリックフィールドを選択します。集計設定を確認することを忘れないでください。

<Image size="md" img={rocketbi_03} alt="選択されたフィールドと集計設定を示すRocket BIメトリックコントロール設定パネル" border />
<br/>

フィルターの名前を変更し、ダッシュボードにコントロールを保存します。

<Image size="md" img={rocketbi_04} alt="ダッシュボードに保存する準備が整った名前変更済みフィルターを持つメトリックコントロール" border />

#### 日付タイプのコントロールを作成する {#create-a-date-type-control}
メイン日付カラムとして日付フィールドを選択します：

<Image size="md" img={rocketbi_05} alt="利用可能な日付カラムを示すRocket BIの日付フィールド選択インターフェイス" border />
<br/>

異なるルックアップ範囲を持つ重複バリアントを追加します。例えば、年、月次、日次の日付や曜日。

<Image size="md" img={rocketbi_06} alt="年、月、日などの異なる期間オプションを示す日時範囲設定" border />
<br/>

フィルターの名前を変更し、ダッシュボードにコントロールを保存します。

<Image size="md" img={rocketbi_07} alt="ダッシュボードに保存する準備が整った名前変更済みフィルターを持つ日付範囲コントロール" border />

### さあ、チャートを構築しましょう {#now-let-build-the-charts}

#### 円グラフ: 地域別売上メトリックス {#pie-chart-sales-metrics-by-regions}
新しいチャートを追加して、円グラフを選択します。

<Image size="md" img={rocketbi_08} alt="円グラフオプションが強調表示されたチャートタイプ選択パネル" border />
<br/>

まず、データセットから"Region"カラムをドラッグ＆ドロップしてレジェンドフィールドに追加します。

<Image size="md" img={rocketbi_09} alt="レジェンドフィールドにRegionカラムが追加されるドラッグ＆ドロップインターフェイス" border />
<br/>

次に、チャートコントロールタブに移動します。

<Image size="md" img={rocketbi_10} alt="視覚化設定オプションを示すチャートコントロールタブインターフェイス" border />
<br/>

メトリックコントロールを値フィールドにドラッグ＆ドロップします。

<Image size="md" img={rocketbi_11} alt="円グラフの値フィールドに追加されたメトリックコントロール" border />
<br/>

(メトリックコントロールをソートとして使用することもできます)

チャート設定に移動してさらなるカスタマイズを行います。

<Image size="md" img={rocketbi_12} alt="円グラフのカスタマイズオプションを示すチャート設定パネル" border />
<br/>

例えば、データラベルをパーセンテージに変更します。

<Image size="md" img={rocketbi_13} alt="円グラフにパーセンテージを表示するために変更されたデータラベル設定" border />
<br/>

チャートを保存してダッシュボードに追加します。

<Image size="md" img={rocketbi_14} alt="他のコントロールと共に新しく追加された円グラフを表示するダッシュボードビュー" border />

#### 時系列チャートで日付コントロールを使用する {#use-date-control-in-a-time-series-chart}
スタックカラムチャートを使用します。

<Image size="md" img={rocketbi_15} alt="時系列データを用いたスタックカラムチャート作成インターフェイス" border />
<br/>

チャートコントロールで、Y軸にメトリックコントロールを、X軸に日付範囲を使用します。

<Image size="md" img={rocketbi_16} alt="Y軸にメトリック、X軸に日付範囲を示すチャートコントロール設定" border />
<br/>

地域カラムをブレイクダウンに追加します。

<Image size="md" img={rocketbi_17} alt="スタックカラムチャートのブレイクダウン次元として地域カラムが追加される" border />
<br/>

KPIとして数字チャートを追加し、ダッシュボードをグレードアップします。

<Image size="md" img={rocketbi_18} alt="KPI数字チャート、円グラフ、時系列視覚化を含む完成されたダッシュボード" border />
<br/>

これで、あなたはRocket.BIで最初のダッシュボードを成功裏に構築しました。
