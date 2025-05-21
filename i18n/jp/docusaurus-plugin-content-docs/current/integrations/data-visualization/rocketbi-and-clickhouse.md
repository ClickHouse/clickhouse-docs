---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI は、データを迅速に分析し、ドラッグアンドドロップで視覚化を構築し、Webブラウザー上で同僚と共同作業を行うのに役立つセルフサービスのビジネスインテリジェンスプラットフォームです。'
title: '目標：最初のダッシュボードを構築する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 目標：最初のダッシュボードを構築する

<CommunityMaintainedBadge/>

このガイドでは、Rocket.BIを使用してシンプルなダッシュボードをインストールして構築します。
これはダッシュボードです：

<Image size="md" img={rocketbi_01} alt="Rocket BI ダッシュボードの販売指標を示すチャートとKPI" border />
<br/>

[このリンクからダッシュボードをチェックすることができます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール {#install}

あらかじめ用意されたDockerイメージでRocketBIを起動します。

docker-compose.ymlおよび設定ファイルを取得します：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.envを編集し、ClickHouseサーバーの情報を追加します。

次のコマンドを実行してRocketBIを起動します： ``` docker-compose up -d . ```

ブラウザーを開き、```localhost:5050``` にアクセスし、次のアカウントでログインします： ```hello@gmail.com/123456```

ソースから構築するか、詳細な設定を行うには、こちらを確認してください [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## ダッシュボードを構築しよう {#lets-build-the-dashboard}

ダッシュボードでは、レポートを見つけて、**+新規**をクリックして視覚化を開始します。

**無制限のダッシュボード**を構築し、ダッシュボードに**無制限のチャート**を描画できます。

<Image size="md" img={rocketbi_02} alt="Rocket BIで新しいチャートを作成するプロセスを示すアニメーション" border />
<br/>

高解像度のチュートリアルはYouTubeで： [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリックコントロールを作成する {#create-a-metrics-control}
タブフィルターで、使用したいメトリックフィールドを選択します。集計設定を確認してください。

<Image size="md" img={rocketbi_03} alt="選択されたフィールドと集計設定を示すRocket BIのメトリックコントロール設定パネル" border />
<br/>

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<Image size="md" img={rocketbi_04} alt="ダッシュボードに保存する準備が整った名前変更されたフィルターを持つメトリックコントロール" border />


#### 日付タイプのコントロールを作成する {#create-a-date-type-control}
メインの日付列として日付フィールドを選択します：

<Image size="md" img={rocketbi_05} alt="利用可能な日付カラムを示すRocket BIの日付フィールド選択インターフェース" border />
<br/>

異なる検索範囲を持つ重複バリアントを追加します。たとえば、年、月次、日次のデータや曜日などです。

<Image size="md" img={rocketbi_06} alt="年、月、日などの異なる時間期間オプションを示す日付範囲設定" border />
<br/>

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<Image size="md" img={rocketbi_07} alt="ダッシュボードに保存する準備が整った名前変更されたフィルターを持つ日付範囲コントロール" border />

### さて、チャートを作成しましょう {#now-let-build-the-charts}

#### 円グラフ：地域別販売指標 {#pie-chart-sales-metrics-by-regions}
新しいチャートを追加するを選択し、次に円グラフを選択します。

<Image size="md" img={rocketbi_08} alt="円グラフオプションが強調表示されたチャートタイプ選択パネル" border />
<br/>

最初に、データセットから「地域」カラムをレジェンドフィールドにドラッグ＆ドロップします。

<Image size="md" img={rocketbi_09} alt="地域カラムがレジェンドフィールドに追加されるドラッグ＆ドロップインターフェース" border />
<br/>

次に、チャートコントロールタブに切り替えます。

<Image size="md" img={rocketbi_10} alt="視覚化設定オプションを示すチャートコントロールタブインターフェース" border />
<br/>

メトリックコントロールを値フィールドにドラッグ＆ドロップします。

<Image size="md" img={rocketbi_11} alt="円グラフの値フィールドに追加されたメトリックコントロール" border />
<br/>

（メトリックコントロールをソートに使用することもできます）

さらなるカスタマイズのためにチャート設定に移動します。

<Image size="md" img={rocketbi_12} alt="円グラフのカスタマイズオプションを示すチャート設定パネル" border />
<br/>

たとえば、データラベルをパーセンテージに変更します。

<Image size="md" img={rocketbi_13} alt="円グラフにパーセンテージを表示するためにデータラベル設定が変更される" border />
<br/>

チャートを保存してダッシュボードに追加します。

<Image size="md" img={rocketbi_14} alt="他のコントロールが含まれる新しく追加された円グラフを示すダッシュボードビュー" border />

#### 時系列チャートで日付コントロールを使用する {#use-date-control-in-a-time-series-chart}
スタックドカラムチャートを使用します。

<Image size="md" img={rocketbi_15} alt="時系列データを使用したスタックドカラムチャート作成インターフェース" border />
<br/>

チャートコントロールで、Y軸にメトリックコントロールを、X軸に日付範囲を使用します。

<Image size="md" img={rocketbi_16} alt="Y軸にメトリック、X軸に日付範囲を示すチャートコントロール設定" border />
<br/>

地域カラムをブレイクダウンに追加します。

<Image size="md" img={rocketbi_17} alt="スタックドカラムチャートにおけるブレイクダウン次元として地域カラムが追加される" border />
<br/>

KPIとして数字チャートを追加し、ダッシュボードをブラッシュアップします。

<Image size="md" img={rocketbi_18} alt="KPI数字チャート、円グラフ、時系列視覚化を含む完成したダッシュボード" border />
<br/>

これで、Rocket.BIを使用して最初のダッシュボードを成功裏に構築しました。
