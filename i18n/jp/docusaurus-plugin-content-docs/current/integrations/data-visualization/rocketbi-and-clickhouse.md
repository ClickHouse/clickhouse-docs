---
'sidebar_label': 'Rocket BI'
'sidebar_position': 131
'slug': '/integrations/rocketbi'
'keywords':
- 'clickhouse'
- 'RocketBI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'RocketBI は、データを迅速に分析し、ドラッグアンドドロップの視覚化を構築し、同僚とブラウザ上で共同作業を行うためのセルフサービスビジネスインテリジェンスプラットフォームです。'
'title': '目標: あなたの最初の DASHBOARD を構築する'
'doc_type': 'guide'
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


# 目標: 最初のダッシュボードを作成する

<CommunityMaintainedBadge/>

このガイドでは、Rocket.BIを使用してシンプルなダッシュボードをインストールし、構築します。
これがダッシュボードです：

<Image size="md" img={rocketbi_01} alt="Rocket BI ダッシュボード 販売指標のチャートとKPIを示す" border />
<br/>

[こちらのリンクからダッシュボードを確認できます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール {#install}

予め構築されたDockerイメージを使用してRocketBIを起動します。

docker-compose.ymlと設定ファイルを取得します:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.envを編集し、clickhouseサーバーの情報を追加します。

次のコマンドを実行してRocketBIを起動します: ``` docker-compose up -d . ```

ブラウザを開き、```localhost:5050```に移動し、このアカウントでログインします: ```hello@gmail.com/123456```

ソースから構築する場合や高度な設定については、[Rocket.BIのREADME](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)で確認してください。

## ダッシュボードを作成しましょう {#lets-build-the-dashboard}

ダッシュボードにはレポートが表示されます。**+新規**をクリックして視覚化を開始します。

**無制限のダッシュボード**を作成でき、ダッシュボードに**無制限のチャート**を描くことができます。

<Image size="md" img={rocketbi_02} alt="Rocket BIで新しいチャートを作成するプロセスを示すアニメーション" border />
<br/>

高解像度のチュートリアルはYouTubeでご覧ください: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリクスコントロールを作成する {#create-a-metrics-control}
タブフィルターで、使用するメトリクスフィールドを選択します。集計設定に注意を払い続けてください。

<Image size="md" img={rocketbi_03} alt="選択されたフィールドと集計設定を示すRocket BIのメトリクスコントロール設定パネル" border />
<br/>

フィルターに名前を付け、ダッシュボードにコントロールを保存します。

<Image size="md" img={rocketbi_04} alt="名前を変更したフィルターがダッシュボードに保存する準備が整ったメトリクスコントロール" border />

#### 日付タイプコントロールを作成する {#create-a-date-type-control}
主日付カラムとして日付フィールドを選択します。

<Image size="md" img={rocketbi_05} alt="利用可能な日付カラムを示すRocket BIの日付フィールド選択インターフェース" border />
<br/>

異なる検索範囲での重複バリエーションを追加します。例えば、年、月別、日別、または曜日などです。

<Image size="md" img={rocketbi_06} alt="年、月、日などの異なる期間オプションを示す日付範囲設定" border />
<br/>

フィルターに名前を付け、ダッシュボードにコントロールを保存します。

<Image size="md" img={rocketbi_07} alt="名前を変更したフィルターがダッシュボードに保存する準備が整った日付範囲コントロール" border />

### では、チャートを作成しましょう {#now-let-build-the-charts}

#### 円グラフ: 地域別の販売指標 {#pie-chart-sales-metrics-by-regions}
新しいチャートを追加を選択し、円グラフを選択します。

<Image size="md" img={rocketbi_08} alt="円グラフオプションがハイライトされたチャートタイプ選択パネル" border />
<br/>

まず、データセットから「地域」カラムをレジェンドフィールドにドラッグ＆ドロップします。

<Image size="md" img={rocketbi_09} alt="レジェンドフィールドに地域カラムを追加しているドラッグ＆ドロップインターフェース" border />
<br/>

次に、チャートコントロールタブに切り替えます。

<Image size="md" img={rocketbi_10} alt="視覚化設定オプションを示すチャートコントロールタブインターフェース" border />
<br/>

メトリクスコントロールを値フィールドにドラッグ＆ドロップします。

<Image size="md" img={rocketbi_11} alt="円グラフの値フィールドにメトリクスコントロールを追加している様子" border />
<br/>

(メトリクスコントロールをソートとしても使用できます)

さらにカスタマイズのためにチャート設定に移動します。

<Image size="md" img={rocketbi_12} alt="円グラフのカスタマイズオプションを示すチャート設定パネル" border />
<br/>

例えば、データラベルをパーセンテージに変更します。

<Image size="md" img={rocketbi_13} alt="円グラフにパーセンテージを表示するようにデータラベル設定が変更されている" border />
<br/>

チャートを保存し、ダッシュボードに追加します。

<Image size="md" img={rocketbi_14} alt="新しく追加された円グラフと他のコントロールを含むダッシュボードビュー" border />

#### 時系列チャートで日付コントロールを使用する {#use-date-control-in-a-time-series-chart}
積み上げ棒グラフを使用します。

<Image size="md" img={rocketbi_15} alt="時系列データのある積み上げ棒グラフ作成インターフェース" border />
<br/>

チャートコントロールで、Y軸にメトリクスコントロール、X軸に日付範囲を使用します。

<Image size="md" img={rocketbi_16} alt="Y軸にメトリクス、X軸に日付範囲を示すチャートコントロール設定" border />
<br/>

地域カラムをブレークダウンに追加します。

<Image size="md" img={rocketbi_17} alt="積み上げ棒グラフのブレークダウン次元として地域カラムを追加している様子" border />
<br/>

KPIとして数値チャートを追加し、ダッシュボードを輝かせます。

<Image size="md" img={rocketbi_18} alt="KPI数値チャート、円グラフ、時系列視覚化を持つ完成したダッシュボード" border />
<br/>

これで、あなたはRocket.BIで最初のダッシュボードを成功裏に構築しました。
