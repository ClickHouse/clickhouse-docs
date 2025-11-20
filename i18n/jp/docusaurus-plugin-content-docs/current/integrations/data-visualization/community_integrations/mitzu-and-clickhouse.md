---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzuは、ノーコードのウェアハウスネイティブなプロダクト分析アプリケーションです。'
title: 'MitzuとClickHouseの接続'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import mitzu_01 from '@site/static/images/integrations/data-visualization/mitzu_01.png';
import mitzu_02 from '@site/static/images/integrations/data-visualization/mitzu_02.png';
import mitzu_03 from '@site/static/images/integrations/data-visualization/mitzu_03.png';
import mitzu_04 from '@site/static/images/integrations/data-visualization/mitzu_04.png';
import mitzu_05 from '@site/static/images/integrations/data-visualization/mitzu_05.png';
import mitzu_06 from '@site/static/images/integrations/data-visualization/mitzu_06.png';
import mitzu_07 from '@site/static/images/integrations/data-visualization/mitzu_07.png';
import mitzu_08 from '@site/static/images/integrations/data-visualization/mitzu_08.png';
import mitzu_09 from '@site/static/images/integrations/data-visualization/mitzu_09.png';
import mitzu_10 from '@site/static/images/integrations/data-visualization/mitzu_10.png';
import mitzu_11 from '@site/static/images/integrations/data-visualization/mitzu_11.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# MitzuをClickHouseに接続する

<CommunityMaintainedBadge/>

Mitzuは、ノーコードでウェアハウスネイティブなプロダクト分析アプリケーションです。Amplitude、Mixpanel、PostHogなどのツールと同様に、MitzuはSQLやPythonの専門知識がなくてもプロダクトの利用データを分析できます。

ただし、これらのプラットフォームとは異なり、Mitzuは企業のプロダクト利用データを複製しません。代わりに、企業の既存のデータウェアハウスまたはデータレイク上で直接ネイティブSQLクエリを生成します。



## 目標 {#goal}

このガイドでは、以下について説明します:

- ウェアハウスネイティブなプロダクト分析
- MitzuとClickHouseの統合方法

:::tip サンプルデータセット
Mitzuで使用するデータセットをお持ちでない場合は、NYC Taxi Dataをご利用いただけます。
このデータセットはClickHouse Cloudで利用可能です。また、[こちらの手順](/getting-started/example-datasets/nyc-taxi)に従って読み込むこともできます。
:::

このガイドは、Mitzuの使用方法に関する簡単な概要です。詳細については、[Mitzuのドキュメント](https://docs.mitzu.io/)を参照してください。


## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)にアクセスしてサインアップします。

<Image
  size='lg'
  img={mitzu_01}
  alt='メールアドレスとパスワードフィールドがあるMitzuサインインページ'
  border
/>


## 3. ワークスペースを設定する {#3-configure-your-workspace}

組織を作成した後、左サイドバーの `Set up your workspace` オンボーディングガイドに従います。次に、`Connect Mitzu with your data warehouse` リンクをクリックしてください。

<Image
  size='lg'
  img={mitzu_02}
  alt='オンボーディング手順が表示されたMitzuワークスペース設定ページ'
  border
/>


## 4. MitzuをClickHouseに接続する {#4-connect-mitzu-to-clickhouse}

まず、接続タイプとしてClickHouseを選択し、接続の詳細を設定します。次に、`Test connection & Save`ボタンをクリックして設定を保存します。

<Image
  size='lg'
  img={mitzu_03}
  alt='ClickHouse用のMitzu接続設定ページと設定フォーム'
  border
/>


## 5. イベントテーブルの設定 {#5-configure-event-tables}

接続が保存されたら、`Event tables`タブを選択し、`Add table`ボタンをクリックします。モーダルで、データベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`Configure table`ボタンをクリックします。これにより、各テーブルのキー列を設定できるモーダルウィンドウが開きます。

<Image
  size='lg'
  img={mitzu_04}
  alt='データベーステーブルを表示するMitzuのテーブル選択インターフェース'
  border
/>
<br />

> ClickHouseセットアップでプロダクト分析を実行するには、テーブルからいくつかのキー列を指定する必要があります。
>
> 以下の列が必要です：
>
> - **User id** - ユーザーの一意識別子の列。
> - **Event time** - イベントのタイムスタンプ列。
> - オプション[**Event name**] - テーブルに複数のイベントタイプが含まれる場合、この列でイベントをセグメント化します。

<Image
  size='lg'
  img={mitzu_05}
  alt='列マッピングオプションを表示するMitzuのイベントカタログ設定'
  border
/>
<br />
すべてのテーブルが設定されたら、`Save & update event catalog`ボタンをクリックすると、Mitzuは上記で定義されたテーブルからすべてのイベントとそのプロパティを検出します。この手順は、データセットのサイズに応じて数分かかる場合があります。


## 4. セグメンテーションクエリの実行 {#4-run-segmentation-queries}

Mitzuでのユーザーセグメンテーションは、Amplitude、Mixpanel、PostHogと同じくらい簡単です。

Exploreページの左側にはイベント選択エリアがあり、上部では時間範囲を設定できます。

<Image
  size='lg'
  img={mitzu_06}
  alt='イベント選択と時間設定を備えたMitzuセグメンテーションクエリインターフェース'
  border
/>

<br />

:::tip フィルタとブレークダウン
フィルタリングは想定通りに行えます。プロパティ(ClickHouseカラム)を選択し、ドロップダウンからフィルタリングする値を選択してください。
ブレークダウンには、任意のイベントプロパティまたはユーザープロパティを選択できます(ユーザープロパティの統合方法については以下を参照)。
:::


## 5. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルのステップを最大9つまで選択します。ユーザーがファネルを完了できる期間を設定してください。
SQLコードを一切書くことなく、コンバージョン率のインサイトを即座に取得できます。

<Image
  size='lg'
  img={mitzu_07}
  alt='ステップ間のコンバージョン率を表示するMitzuファネル分析画面'
  border
/>

<br />

:::tip トレンドの可視化
`Funnel trends`を選択すると、ファネルのトレンドを時系列で可視化できます。
:::


## 6. リテンション分析クエリの実行 {#6-run-retention-queries}

リテンション率の計算のために最大2つのステップを選択します。繰り返しウィンドウのリテンションウィンドウを選択してください。
SQLコードを一行も書くことなく、即座にコンバージョン率のインサイトを取得できます。

<Image
  size='lg'
  img={mitzu_08}
  alt='コホートリテンション率を表示するMitzuリテンション分析'
  border
/>

<br />

:::tip コホートリテンション
`Weekly cohort retention`を選択すると、リテンション率の経時的な変化を可視化できます。
:::


## 7. ジャーニークエリの実行 {#7-run-journey-queries}

ファネルに最大9つのステップを選択します。ユーザーがジャーニーを完了できる時間枠を選択します。Mitzuジャーニーチャートは、選択したイベントを通じてユーザーが辿るすべての経路を視覚的にマッピングします。

<Image
  size='lg'
  img={mitzu_09}
  alt='イベント間のユーザー経路フローを示すMitzuジャーニー可視化'
  border
/>
<br />

:::tip ステップの内訳
セグメント`Break down`のプロパティを選択することで、同じステップ内のユーザーを区別できます。
:::

<br />


## 8. 収益クエリの実行 {#8-run-revenue-queries}

収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRおよびサブスクリプション数を計算できます。

<Image
  size='lg'
  img={mitzu_10}
  alt='MRRメトリクスを表示するMitzu収益分析ダッシュボード'
  border
/>


## 9. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、Exploreページで選択した設定からネイティブSQLコードを生成します。

<Image
  size='lg'
  img={mitzu_11}
  alt='ネイティブClickHouseクエリを表示するMitzu SQLコード生成ビュー'
  border
/>

<br />

:::tip BIツールで作業を継続
Mitzu UIで制限に遭遇した場合は、SQLコードをコピーしてBIツールで作業を継続してください。
:::


## Mitzuサポート {#mitzu-support}

ご不明な点がございましたら、[support@mitzu.io](email://support@mitzu.io)までお気軽にお問い合わせください。

または、[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)からSlackコミュニティにご参加いただけます。


## 詳細情報 {#learn-more}

Mitzuの詳細については、[mitzu.io](https://mitzu.io)をご覧ください。

ドキュメントページは[docs.mitzu.io](https://docs.mitzu.io)でご確認いただけます。
