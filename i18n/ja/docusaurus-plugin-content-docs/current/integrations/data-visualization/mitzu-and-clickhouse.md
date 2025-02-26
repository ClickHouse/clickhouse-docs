---
sidebar_label: Mitzu
slug: /integrations/mitzu
keywords: [clickhouse, Mitzu, connect, integrate, ui]
description: Mitzuはノーコードのデータウェアハウスネイティブなプロダクト分析アプリケーションです。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# MitzuをClickHouseに接続する

Mitzuはノーコードのデータウェアハウスネイティブなプロダクト分析アプリケーションです。Amplitude、Mixpanel、およびPostHogなどのツールと同様に、MitzuはユーザーがSQLやPythonの専門知識を必要とせずにプロダクト利用データを分析できるようにします。

しかし、これらのプラットフォームとは異なり、Mitzuは会社のプロダクト利用データを複製しません。代わりに、既存のデータウェアハウスやデータレイク上でネイティブSQLクエリを生成します。

## 目標 {#goal}

このガイドでは、以下のことについて説明します：

- データウェアハウスネイティブなプロダクト分析
- MitzuをClickHouseに統合する方法

:::tip サンプルデータセット
Mitzu用のデータセットがない場合、NYCタクシーデータを使用できます。
このデータセットはClickHouse Cloudで利用可能で、[これらの手順でロードできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドはMitzuの使用方法の簡単な概要です。より詳細な情報は[Mitzuのドキュメント](https://docs.mitzu.io/)をご覧ください。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)にアクセスしてサインアップします。

<img src={require('./images/mitzu_01.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="サインイン" />

## 3. 作業スペースを設定する {#3-configure-your-workspace}

組織を作成した後、左側のサイドバーの`作業スペースを設定する`オンボーディングガイドに従います。次に、`Mitzuをデータウェアハウスに接続する`リンクをクリックします。

<img src={require('./images/mitzu_02.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="作業スペースの作成" ></img>

## 4. MitzuをClickHouseに接続する {#4-connect-mitzu-to-clickhouse}

まず、接続タイプとしてClickHouseを選択し、接続情報を設定します。その後、`接続をテストして保存`ボタンをクリックして設定を保存します。

<img src={require('./images/mitzu_03.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}}alt="接続情報の設定" ></img>

## 5. イベントテーブルを設定する {#5-configure-event-tables}

接続が保存されると、`イベントテーブル`タブを選択し、`テーブルを追加`ボタンをクリックします。モーダル内で、データベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`テーブルを設定`ボタンをクリックします。これにより、各テーブルのキーとなるカラムを設定するためのモーダルウィンドウが開きます。

<img src={require('./images/mitzu_04.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="テーブル接続の設定"></img>
<br/>

> ClickHouseの設定でプロダクト分析を実行するには、テーブルからいくつかのキーとなるカラムを指定する必要があります。
>
> これらは以下の通りです：
>
> - **ユーザーID** - ユーザーのユニーク識別子を格納するカラム。
> - **イベント時間** - イベントのタイムスタンプカラム。
> - オプション[**イベント名**] - このカラムは、テーブルに複数のイベントタイプが含まれている場合にイベントをセグメント化します。

<img src={require('./images/mitzu_05.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="イベントカタログの作成" ></img>
<br/>
すべてのテーブルが設定されると、`保存してイベントカタログを更新`ボタンをクリックします。これにより、Mitzuは上述のテーブルからすべてのイベントとそのプロパティを見つけます。このステップは、データセットのサイズによって数分かかる場合があります。

## 6. セグメンテーションクエリを実行する {#4-run-segmentation-queries}

Mitzuでのユーザーセグメンテーションは、Amplitude、Mixpanel、またはPostHogと同様に簡単です。

Exploreページには、左側にイベントの選択エリアがあり、上部セクションでは時間の範囲を設定できます。

<img src={require('./images/mitzu_06.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="セグメンテーション" ></img>

<br/>

:::tip フィルターと内訳
フィルタリングは、期待されるように行われます：プロパティ（ClickHouseカラム）を選択し、フィルタリングしたい値をドロップダウンから選択します。
イベントまたはユーザープロパティのいずれかを選択して内訳を取得できます（ユーザープロパティの統合方法については次を参照）。
:::

## 7. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルには最大9ステップを選択します。ユーザーがファネルを完了できる時間のウィンドウを選択します。
1行のSQLコードを書くことなく、即座にコンバージョン率の洞察を得ることができます。

<img src={require('./images/mitzu_07.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="ファネル" ></img>

<br/>

:::tip トレンドを可視化する
`ファネルトレンド`を選択して、時間の経過に伴うファネルトレンドを可視化します。
:::

## 8. 維持率クエリを実行する {#6-run-retention-queries}

維持率計算のために最大2ステップを選択します。再発するウィンドウの維持率を選択します。
1行のSQLコードを書くことなく、即座にコンバージョン率の洞察を得ることができます。

<img src={require('./images/mitzu_08.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="維持率" ></img>

<br/>

:::tip コホート維持
`週次コホート維持`を選択して、時間の経過に伴う維持率の変化を可視化します。
:::


## 9. ジャーニークエリを実行する {#7-run-journey-queries}
ファネルには最大9ステップを選択します。ユーザーがジャーニーを完了できる時間のウィンドウを選択します。Mitzuのジャーニーチャートは、ユーザーが選択したイベントを通じて辿るすべてのパスのビジュアルマップを提供します。

<img src={require('./images/mitzu_09.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="ジャーニー" ></img>
<br/>

:::tip ステップの内訳
セグメント`内訳`のプロパティを選択して、同じステップ内のユーザーを区別できます。
:::

<br/>

## 10. 収益クエリを実行する {#8-run-revenue-queries}
収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRとサブスクリプション数を計算できます。

<img src={require('./images/mitzu_10.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="収益" ></img>

## 11. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、Exploreページで選択された設定からネイティブSQLコードを生成します。

<img src={require('./images/mitzu_11.png').default} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="SQLネイティブ" ></img>

<br/>

:::tip BIツールで作業を続ける
Mitzu UIに制限がある場合は、SQLコードをコピーしてBIツールで作業を続けることができます。
:::

## Mitzuサポート {#mitzu-support}

もし迷った場合は、[support@mitzu.io](email://support@mitzu.io)までお気軽にお問い合わせください。

または、私たちのSlackコミュニティに[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)から参加できます。

## さらなる情報 {#learn-more}

Mitzuに関する詳細情報は[mitzu.io](https://mitzu.io)をご覧ください。

私たちのドキュメントページは[docs.mitzu.io](https://docs.mitzu.io)にあります。
