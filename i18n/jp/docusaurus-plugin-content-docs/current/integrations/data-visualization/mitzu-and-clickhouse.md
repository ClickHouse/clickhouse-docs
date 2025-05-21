sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzuはノーコードのウェアハウスネイティブ製品分析アプリケーションです。'
title: 'MitzuをClickHouseに接続する'
```

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

Mitzuはノーコードのウェアハウスネイティブ製品分析アプリケーションです。Amplitude、Mixpanel、PostHogのようなツールと同様に、MitzuはユーザーがSQLやPythonの専門知識なしで製品使用データを分析できるようにします。

しかし、これらのプラットフォームとは異なり、Mitzuは会社の製品使用データを複製することはありません。代わりに、会社の既存のデータウェアハウスまたはデータレイク上でネイティブSQLクエリを生成します。

## 目標 {#goal}

このガイドでは、以下の内容をカバーします。

- ウェアハウスネイティブ製品分析
- MitzuをClickHouseに統合する方法

:::tip サンプルデータセット
Mitzuで使用するデータセットがない場合は、NYC Taxi Dataを使用できます。このデータセットはClickHouse Cloudで利用可能で、[こちらの手順でロードできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドはMitzuの使用法の概要に過ぎません。詳細な情報は[Mitzuのドキュメント](https://docs.mitzu.io/)で見つけることができます。

## 1. 接続詳細を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)にアクセスしてサインアップしてください。

<Image size="lg" img={mitzu_01} alt="Mitzuのサインインページ、メールアドレスとパスワードのフィールド" border />

## 3. ワークスペースを構成する {#3-configure-your-workspace}

組織を作成した後、左のサイドバーの`ワークスペースを設定する`オンボーディングガイドに従ってください。そして、`Mitzuをあなたのデータウェアハウスと接続する`リンクをクリックします。

<Image size="lg" img={mitzu_02} alt="Mitzuのワークスペース設定ページ、オンボーディングステップを表示" border />

## 4. MitzuをClickHouseに接続する {#4-connect-mitzu-to-clickhouse}

まず、接続タイプとしてClickHouseを選択し、接続詳細を設定します。次に、`接続テスト & 保存`ボタンをクリックして設定を保存します。

<Image size="lg" img={mitzu_03} alt="ClickHouse用のMitzu接続設定ページ、構成フォームを表示" border />

## 5. イベントテーブルを構成する {#5-configure-event-tables}

接続が保存されたら、`イベントテーブル`タブを選択し、`テーブルを追加`ボタンをクリックします。モーダルウィンドウで、あなたのデータベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`テーブルを構成する`ボタンをクリックします。これにより、各テーブルのキーとなるカラムを設定できるモーダルウィンドウが開きます。

<Image size="lg" img={mitzu_04} alt="Mitzuのテーブル選択インターフェース、データベーステーブルを表示" border />
<br/>

> ClickHouseのセットアップで製品分析を行うには、テーブルからいくつかの重要なカラムを指定する必要があります。
>
> これらは次の通りです：
>
> - **ユーザーID** - ユーザーのユニークな識別子用のカラム。
> - **イベント時刻** - イベントのタイムスタンプカラム。
> - オプション[**イベント名**] - このカラムは、テーブルに複数のイベントタイプが含まれている場合にイベントをセグメント化します。

<Image size="lg" img={mitzu_05} alt="Mitzuのイベントカタログ構成、カラムマッピングオプションを表示" border />
<br/>
すべてのテーブルが構成されたら、`保存 & イベントカタログを更新する`ボタンをクリックしてください。Mitzuは上記で定義されたテーブルからすべてのイベントとそのプロパティを取得します。このステップは、データセットのサイズに応じて数分かかる場合があります。

## 6. セグメンテーションクエリを実行する {#4-run-segmentation-queries}

Mitzuでのユーザーセグメンテーションは、Amplitude、Mixpanel、またはPostHogと同じくらい簡単です。

Exploreページには、イベントの選択エリアが左側にあり、上部のセクションでは時間の範囲を設定できます。

<Image size="lg" img={mitzu_06} alt="Mitzuのセグメンテーションクエリインターフェース、イベント選択と時間設定を表示" border />

<br/>

:::tip フィルターとブレークダウン
フィルタリングは予想通りに行われます：プロパティ（ClickHouseのカラム）を選択し、フィルタリングしたい値をドロップダウンから選択してください。ブレークダウンには任意のイベントまたはユーザープロパティを選択できます（ユーザープロパティを統合する方法については以下を参照してください）。
:::

## 7. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルのために最大9ステップを選択します。ユーザーがファネルを完了できる時間窓を選択します。1行のSQLコードも書かずに、即座に転換率の洞察を得ることができます。

<Image size="lg" img={mitzu_07} alt="Mitzuファネル分析ビュー、ステップ間の転換率を表示" border />

<br/>

:::tip トレンドを視覚化する
`ファネルトレンド`を選択して、時間の経過に伴うファネルトレンドを視覚化します。
:::

## 8. リテンションクエリを実行する {#6-run-retention-queries}

リテンション率を計算するために最大2ステップを選択します。繰り返しのウィンドウのためのリテンションウィンドウを選択します。1行のSQLコードも書かずに、即座に転換率の洞察を得ることができます。

<Image size="lg" img={mitzu_08} alt="Mitzuのリテンション分析、コホートリテンション率を表示" border />

<br/>

:::tip コホートリテンション
`週間コホートリテンション`を選択して、時間の経過に伴うリテンション率の変化を視覚化します。
:::


## 9. ジャーニークエリを実行する {#7-run-journey-queries}
ファネルのために最大9ステップを選択します。ユーザーがジャーニーを完了できる時間窓を選択します。Mitzuのジャーニーチャートは、選択されたイベントを通過するユーザーのすべてのパスの視覚マップを提供します。

<Image size="lg" img={mitzu_09} alt="Mitzuのジャーニー視覚化、イベント間のユーザーパスフローを表示" border />
<br/>

:::tip ステップを区別する
ユーザーを同じステップ内で区別するために`ブレークダウン`用のプロパティを選択できます。
:::


<br/>

## 10. 収益クエリを実行する {#8-run-revenue-queries}
収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRおよびサブスクリプション数を計算できます。

<Image size="lg" img={mitzu_10} alt="Mitzuの収益分析ダッシュボード、MRRメトリクスを表示" border />

## 11. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、これはExploreページで選択した設定からネイティブSQLコードを生成することを意味します。

<Image size="lg" img={mitzu_11} alt="MitzuのSQLコード生成ビュー、ネイティブClickHouseクエリを表示" border />

<br/>

:::tip BIツールで作業を続ける
Mitzu UIに制限がある場合は、SQLコードをコピーしてBIツールで作業を続けてください。
:::

## Mitzuサポート {#mitzu-support}

もし迷った場合は、[support@mitzu.io](email://support@mitzu.io)までお気軽にお問い合わせください。

また、私たちのSlackコミュニティに[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)から参加できます。

## 詳細を学ぶ {#learn-more}

Mitzuに関する詳細情報は[mitzu.io](https://mitzu.io)をご覧ください。

私たちのドキュメントページは[docs.mitzu.io](https://docs.mitzu.io)でご覧いただけます。
