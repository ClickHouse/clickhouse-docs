---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI はセルフサービス型のビジネスインテリジェンスプラットフォームで、データをすばやく分析し、ドラッグ＆ドロップで可視化を作成し、Web ブラウザ上で同僚とコラボレーションできます。'
title: '目標: 最初のダッシュボードを作成する'
doc_type: 'guide'
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


# 目標: Rocket.BI で最初のダッシュボードを作成する

<CommunityMaintainedBadge/>

このガイドでは、Rocket.BI をインストールし、シンプルなダッシュボードを作成します。
こちらがダッシュボードです:

<Image size="md" img={rocketbi_01} alt="チャートと KPI を用いて売上指標を表示している Rocket BI ダッシュボード" border />
<br/>

[このリンクからダッシュボードを確認できます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)



## インストール {#install}

事前ビルド済みのDockerイメージを使用してRocketBIを起動します。

docker-compose.ymlと設定ファイルを取得します:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

.clickhouse.envを編集し、ClickHouseサーバーの情報を追加します。

次のコマンドを実行してRocketBIを起動します: `docker-compose up -d .`

ブラウザを開いて`localhost:5050`にアクセスし、次のアカウントでログインします: `hello@gmail.com/123456`

ソースからのビルドや詳細な設定については、[Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)を参照してください。


## ダッシュボードを構築しましょう {#lets-build-the-dashboard}

ダッシュボードでレポートを確認できます。**+New**をクリックして可視化を開始してください。

**無制限のダッシュボード**を構築し、1つのダッシュボード内に**無制限のチャート**を作成できます。

<Image
  size='md'
  img={rocketbi_02}
  alt='Rocket BIで新しいチャートを作成する手順を示すアニメーション'
  border
/>
<br />

高解像度のチュートリアルはYouTubeでご覧ください:[https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリクスコントロールを作成する {#create-a-metrics-control}

タブフィルターで使用するメトリクスフィールドを選択します。集計設定を必ず確認してください。

<Image
  size='md'
  img={rocketbi_03}
  alt='選択されたフィールドと集計設定を表示するRocket BIのメトリクスコントロール設定パネル'
  border
/>
<br />

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<Image
  size='md'
  img={rocketbi_04}
  alt='名前変更されたフィルターを持つメトリクスコントロール、ダッシュボードへの保存準備完了'
  border
/>

#### 日付タイプのコントロールを作成する {#create-a-date-type-control}

メイン日付カラムとして日付フィールドを選択します:

<Image
  size='md'
  img={rocketbi_05}
  alt='利用可能な日付カラムを表示するRocket BIの日付フィールド選択インターフェース'
  border
/>
<br />

異なる参照範囲で重複バリアントを追加します。例えば、年、月、日単位の日付、または曜日などです。

<Image
  size='md'
  img={rocketbi_06}
  alt='年、月、日などの異なる期間オプションを表示する日付範囲設定'
  border
/>
<br />

フィルターの名前を変更し、コントロールをダッシュボードに保存します。

<Image
  size='md'
  img={rocketbi_07}
  alt='名前変更されたフィルターを持つ日付範囲コントロール、ダッシュボードへの保存準備完了'
  border
/>

### それでは、チャートを構築しましょう {#now-let-build-the-charts}

#### 円グラフ:地域別の売上メトリクス {#pie-chart-sales-metrics-by-regions}

新しいチャートの追加を選択し、円グラフを選択します。

<Image
  size='md'
  img={rocketbi_08}
  alt='円グラフオプションがハイライトされたチャートタイプ選択パネル'
  border
/>
<br />

まず、データセットから「Region」カラムを凡例フィールドにドラッグ&ドロップします。

<Image
  size='md'
  img={rocketbi_09}
  alt='Regionカラムが凡例フィールドに追加される様子を示すドラッグ&ドロップインターフェース'
  border
/>
<br />

次に、チャートコントロールタブに切り替えます。

<Image
  size='md'
  img={rocketbi_10}
  alt='可視化設定オプションを表示するチャートコントロールタブインターフェース'
  border
/>
<br />

メトリクスコントロールを値フィールドにドラッグ&ドロップします。

<Image
  size='md'
  img={rocketbi_11}
  alt='円グラフの値フィールドに追加されるメトリクスコントロール'
  border
/>
<br />

(メトリクスコントロールをソートとして使用することもできます)

さらなるカスタマイズのためにチャート設定に移動します。

<Image
  size='md'
  img={rocketbi_12}
  alt='円グラフのカスタマイズオプションを表示するチャート設定パネル'
  border
/>
<br />

例えば、データラベルをパーセンテージに変更します。

<Image
  size='md'
  img={rocketbi_13}
  alt='円グラフにパーセンテージを表示するように変更されるデータラベル設定'
  border
/>
<br />

チャートを保存してダッシュボードに追加します。

<Image
  size='md'
  img={rocketbi_14}
  alt='新しく追加された円グラフと他のコントロールを表示するダッシュボードビュー'
  border
/>

#### 時系列チャートで日付コントロールを使用する {#use-date-control-in-a-time-series-chart}

積み上げ縦棒グラフを使用しましょう。

<Image
  size='md'
  img={rocketbi_15}
  alt='時系列データを使用した積み上げ縦棒グラフ作成インターフェース'
  border
/>
<br />

チャートコントロールで、メトリクスコントロールをY軸として、日付範囲をX軸として使用します。

<Image
  size='md'
  img={rocketbi_16}
  alt='Y軸にメトリクス、X軸に日付範囲を表示するチャートコントロール設定'
  border
/>
<br />

Regionカラムを内訳に追加します。

<Image
  size='md'
  img={rocketbi_17}
  alt='積み上げ縦棒グラフの内訳ディメンションとして追加されるRegionカラム'
  border
/>
<br />

KPIとして数値チャートを追加し、ダッシュボードを際立たせます。

<Image
  size='md'
  img={rocketbi_18}
  alt='KPI数値チャート、円グラフ、時系列可視化を含む完成したダッシュボード'
  border
/>
<br />

これで、rocket.BIで最初のダッシュボードの構築に成功しました。
