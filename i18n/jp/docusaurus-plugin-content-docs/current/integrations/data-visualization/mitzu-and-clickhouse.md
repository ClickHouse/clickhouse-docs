---
sidebar_label: Mitzu
slug: /integrations/mitzu
keywords: [clickhouse, Mitzu, connect, integrate, ui]
description: Mitzuはノーコードのウェアハウスネイティブプロダクト分析アプリケーションです。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# MitzuとClickHouseの接続

Mitzuはノーコードのウェアハウスネイティブプロダクト分析アプリケーションです。Amplitude、Mixpanel、PostHogのようなツールと同様に、MitzuはユーザーがSQLやPythonの専門知識なしでプロダクト使用データを分析できるようにします。

しかし、これらのプラットフォームとは異なり、Mitzuは企業のプロダクト使用データを複製することはありません。代わりに、企業が既に持っているデータウェアハウスやデータレイク上でネイティブなSQLクエリを生成します。

## 目標 {#goal}

このガイドでは以下の内容を取り扱います：

- ウェアハウスネイティブプロダクト分析
- MitzuをClickHouseに統合する方法

:::tip 例のデータセット
Mitzuに使用するデータセットがない場合は、NYC Taxi Dataを利用できます。このデータセットはClickHouse Cloudで利用可能であり、[これらの手順でロードすることもできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドはMitzuを使用する際の簡単な概要です。詳細な情報は[Mitzuのドキュメント](https://docs.mitzu.io/)をご覧ください。

## 1. 接続情報を集める {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)にアクセスしてサインアップします。

<img src={mitzu_01} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="サインイン" />

## 3. ワークスペースを設定する {#3-configure-your-workspace}

組織を作成したら、左側のサイドバーにある`ワークスペースをセットアップする`オンボーディングガイドに従います。次に、`データウェアハウスとMitzuを接続`リンクをクリックします。

<img src={mitzu_02} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="ワークスペース作成" ></img>

## 4. MitzuとClickHouseを接続する {#4-connect-mitzu-to-clickhouse}

まず、接続タイプとしてClickHouseを選択し、接続情報を設定します。次に、`接続をテストして保存`ボタンをクリックして設定を保存します。

<img src={mitzu_03} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="接続情報設定" ></img>

## 5. イベントテーブルを設定する {#5-configure-event-tables}

接続が保存されたら、`イベントテーブル`タブを選択し、`テーブルを追加`ボタンをクリックします。モーダルで、使用するデータベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`テーブルを設定`ボタンをクリックします。これにより、各テーブルのキーとなるカラムを設定するモーダルウィンドウが開きます。

<img src={mitzu_04} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="テーブル接続設定"></img>
<br/>

> ClickHouseの設定でプロダクト分析を行うには、テーブルからいくつかのキーとなるカラムを指定する必要があります。
>
> これらは以下の通りです：
>
> - **ユーザーID** - ユーザーの一意の識別子となるカラム。
> - **イベント時刻** - イベントのタイムスタンプカラム。
> - オプション[**イベント名**] - テーブルに複数のイベントタイプが含まれている場合、イベントをセグメント化するカラムです。

<img src={mitzu_05} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="イベントカタログ作成" ></img>
<br/>
すべてのテーブルが設定されたら、`保存してイベントカタログを更新`ボタンをクリックします。これにより、Mitzuが上記で定義されたテーブルからすべてのイベントとそのプロパティを見つけます。このステップは、データセットのサイズによって数分かかることがあります。

## 6. セグメンテーションクエリを実行する {#4-run-segmentation-queries}

Mitzuでのユーザーセグメンテーションは、Amplitude、Mixpanel、PostHogと同様に簡単です。

Exploreページには、左側にイベントを選択するエリアがあり、上部のセクションでは時間の範囲を設定できます。

<img src={mitzu_06} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="セグメンテーション"></img>

<br/>

:::tip フィルターとブレイクダウン
フィルタリングは予想通りに行われます：プロパティ（ClickHouseカラム）を選択し、フィルタリングしたい値をドロップダウンから選択します。ブレイクダウンとして任意のイベントまたはユーザーのプロパティを選択できます（ユーザーのプロパティを統合する方法については下記を参照してください）。
:::

## 7. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルのステップを最大9つまで選択します。ユーザーがファネルを完了するための時間ウィンドウを選択します。単一のSQLコードを書くことなく、即座にコンバージョン率のインサイトを得ることができます。

<img src={mitzu_07} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="ファネル"></img>

<br/>

:::tip トレンドを可視化する
`ファネルトレンド`を選択して、時間の経過によるファネルトレンドを可視化します。
:::

## 8. リテンションクエリを実行する {#6-run-retention-queries}

リテンション率計算のために2つまでのステップを選択します。リテンションウィンドウを選択して、リカーリングウィンドウを設定します。単一のSQLコードを書くことなく、即座にコンバージョン率のインサイトを得ることができます。

<img src={mitzu_08} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="リテンション"></img>

<br/>

:::tip コホートリテンション
`週間コホートリテンション`を選択して、リテンション率が時間の経過でどのように変化するかを可視化します。
:::


## 9. ジャーニークエリを実行する {#7-run-journey-queries}
ファネルのために最大9つのステップを選択します。ユーザーがジャーニーを完了するための時間ウィンドウを選択します。Mitzuのジャーニーチャートは、選択されたイベントを通じてユーザーがたどるすべてのパスの視覚的な地図を提供します。

<img src={mitzu_09} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="ジャーニー"></img>
<br/>

:::tip ステップを分解する
セグメント`ブレイクダウン`のプロパティを選択して、同じステップの中でユーザーを区別することができます。
:::

<br/>

## 10. 収益クエリを実行する {#8-run-revenue-queries}
収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRとサブスクリプション数を計算できます。

<img src={mitzu_10} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="収益"></img>

## 11. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、Exploreページで選択した構成からネイティブSQLコードを生成します。

<img src={mitzu_11} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="SQLネイティブ"></img>

<br/>

:::tip BIツールで作業を続ける
Mitzu UIに制限がある場合は、SQLコードをコピーしてBIツールで作業を続けてください。
:::

## Mitzuサポート {#mitzu-support}

迷った場合は、[support@mitzu.io](email://support@mitzu.io)までお気軽にお問い合わせください。

または、私たちのSlackコミュニティに[こちらから](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)参加できます。

## もっと学ぶ {#learn-more}

Mitzuに関する詳細情報は[mitzu.io](https://mitzu.io)をご覧ください。

文書ページは[docs.mitzu.io](https://docs.mitzu.io)で確認できます。
