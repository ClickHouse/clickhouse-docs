---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /integrations/rocketbi
keywords: [clickhouse, RocketBI, connect, integrate, ui]
description: RocketBIは、迅速にデータを分析し、ドラッグ＆ドロップのビジュアライゼーションを構築し、同僚とブラウザ上でコラボレーションできるセルフサービスのビジネスインテリジェンスプラットフォームです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# 目標: 最初のダッシュボードを構築する

このガイドでは、Rocket.BIを使用してシンプルなダッシュボードをインストールし、構築します。
これがダッシュボードです：

<img width="800" alt="Github RocketBI" src={require('./images/rocketbi_01.gif').default}/>
<br/>

[こちらのリンクからダッシュボードを確認できます。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## インストール {#install}

事前に構築されたDockerイメージでRocketBIを開始します。

docker-compose.ymlと設定ファイルを取得します：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.envを編集し、ClickHouseサーバーの情報を追加します。

次のコマンドを実行してRocketBIを開始します： ``` docker-compose up -d . ```

ブラウザを開いて、 ```localhost:5050```に移動し、以下のアカウントでログインします： ```hello@gmail.com/123456```

ソースから構築するか、詳細な設定を行いたい場合は、[Rocket.BIのリードミー](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)を確認してください。

## ダッシュボードを構築しましょう {#lets-build-the-dashboard}

ダッシュボードでは、報告書を見つけ、**+新しい**をクリックしてビジュアライゼーションを開始します。

**無限のダッシュボード**を構築し、ダッシュボード内に**無限のチャート**を描画できます。

<img width="800" alt="RocketBI create chart" src={require('./images/rocketbi_02.gif').default}/>
<br/>

YouTubeでの高解像度のチュートリアルはこちら： [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### チャートコントロールを構築する {#build-the-chart-controls}

#### メトリックコントロールを作成する {#create-a-metrics-control}
タブフィルターで使用したいメトリックフィールドを選択します。集計設定を確認することを忘れないでください。

<img width="650" alt="RocketBI chart 6" src={require('./images/rocketbi_03.png').default}/>
<br/>

フィルターの名前を変更し、ダッシュボードにコントロールを保存します。

<img width="400" alt="Metrics Control" src={require('./images/rocketbi_04.png').default}/>


#### 日付タイプコントロールを作成する {#create-a-date-type-control}
主な日付カラムとして日付フィールドを選択します：

<img width="650" alt="RocketBI chart 4" src={require('./images/rocketbi_05.png').default}/>
<br/>

異なる参照範囲を持つ複製バリアントを追加します。例えば、年、月次、日次の日付や曜日などです。

<img width="650" alt="RocketBI chart 5" src={require('./images/rocketbi_06.png').default}/>
<br/>

フィルターの名前を変更し、ダッシュボードにコントロールを保存します。

<img width="200" alt="Date Range Control" src={require('./images/rocketbi_07.png').default}/>

### さて、チャートを構築しましょう {#now-let-build-the-charts}

#### 円グラフ: 地域別販売メトリック {#pie-chart-sales-metrics-by-regions}
新しいチャートを追加することを選択し、次に円グラフを選択します。

<img width="650" alt="Add Pie Chart" src={require('./images/rocketbi_08.png').default}/>
<br/>

まず、データセットから「地域」カラムをレジェンドフィールドにドラッグ＆ドロップします。

<img width="650" alt="Drag-n-drop Column to Chart" src={require('./images/rocketbi_09.png').default}/>
<br/>

次に、チャートコントロールタブに切り替えます。

<img width="650" alt="Navigate to Chart Control in Visualization" src={require('./images/rocketbi_10.png').default}/>
<br/>

メトリックコントロールを値フィールドにドラッグ＆ドロップします。

<img width="650" alt="Use Metrics Control in Chart" src={require('./images/rocketbi_11.png').default}/>
<br/>

（メトリックコントロールをソートとして使用することもできます）

さらなるカスタマイズのためにチャート設定に移動します。

<img width="650" alt="Custom the Chart with Setting" src={require('./images/rocketbi_12.png').default}/>
<br/>

例えば、データラベルをパーセンテージに変更します。

<img width="650" alt="Chart Customization Example" src={require('./images/rocketbi_13.png').default}/>
<br/>

チャートを保存してダッシュボードに追加します。

<img width="650" alt="Overview Dashboard with Pie Chart" src={require('./images/rocketbi_14.png').default}/>

#### 時系列チャートでの日付コントロールの使用 {#use-date-control-in-a-time-series-chart}
スタックカラムチャートを使用します。

<img width="650" alt="Create a Time-series chart with Tab Control" src={require('./images/rocketbi_15.png').default}/>
<br/>

チャートコントロールで、Y軸としてメトリックコントロール、X軸として日付範囲を使用します。

<img width="650" alt="Use Date Range as Controller" src={require('./images/rocketbi_16.png').default}/>
<br/>

地域カラムをブレイクダウンに追加します。

<img width="650" alt="Add Region into Breakdown" src={require('./images/rocketbi_17.png').default}/>
<br/>

KPIとして数字チャートを追加してダッシュボードを明るくします。

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={require('./images/rocketbi_18.png').default} />
<br/>

これで、Rocket.BIを使って最初のダッシュボードを成功裏に構築しました。
