---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu はノーコードで利用できるデータウェアハウスネイティブなプロダクト分析アプリケーションです。'
title: 'Mitzu を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

# Mitzu を ClickHouse に接続する \{#connecting-mitzu-to-clickhouse\}

<CommunityMaintainedBadge/>

Mitzu は、ノーコードで利用できる、データウェアハウスネイティブなプロダクトアナリティクスアプリケーションです。Amplitude、Mixpanel、PostHog のようなツールと同様に、Mitzu により、ユーザーは SQL や Python の専門知識がなくてもプロダクト利用データを分析できます。

しかし、これらのプラットフォームとは異なり、Mitzu では企業のプロダクト利用データを複製しません。その代わりに、企業がすでに保有しているデータウェアハウスまたはデータレイク上のデータに対して、ネイティブな SQL クエリを直接生成します。

## 目的 \\{#goal\\}

このガイドでは、次の内容を取り上げます。

- データウェアハウスネイティブなプロダクト分析
- Mitzu を ClickHouse に統合する方法

:::tip サンプルデータセット
Mitzu で使用するデータセットをお持ちでない場合は、NYC Taxi Data を利用できます。
このデータセットは ClickHouse Cloud で利用できるほか、[こちらの手順で読み込むこともできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドは、Mitzu の使い方についての簡単な概要にとどまります。より詳細な情報は [Mitzu のドキュメント](https://docs.mitzu.io/)を参照してください。

## 1. 接続情報を取得する \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. Mitzu にサインインまたは新規登録する \\{#2-sign-in-or-sign-up-to-mitzu\\}

まずは [https://app.mitzu.io](https://app.mitzu.io) にアクセスして新規登録します。

<Image size="lg" img={mitzu_01} alt="メールアドレスとパスワード入力欄がある Mitzu のサインインページ" border />

## 3. ワークスペースを設定する \\{#3-configure-your-workspace\\}

組織を作成したら、左サイドバーにある `Set up your workspace` のオンボーディングガイドに従います。次に、`Connect Mitzu with your data warehouse` リンクをクリックします。

<Image size="lg" img={mitzu_02} alt="オンボーディング手順を表示している Mitzu ワークスペース設定ページ" border />

## 4. Mitzu を ClickHouse に接続する \\{#4-connect-mitzu-to-clickhouse\\}

まず、接続種別として ClickHouse を選択し、接続情報を設定します。次に、`Test connection & Save` ボタンをクリックして設定を保存します。

<Image size="lg" img={mitzu_03} alt="ClickHouse 用の設定フォームが表示された Mitzu の接続設定ページ" border />

## 5. Configure event tables \\{#5-configure-event-tables\\}

接続を保存したら、`Event tables` タブを選択し、`Add table` ボタンをクリックします。モーダルで、Mitzu に追加したいデータベースとテーブルを選択します。

チェックボックスを使用して少なくとも 1 つのテーブルを選択し、`Configure table` ボタンをクリックします。すると、各テーブルのキー列を設定できるモーダルウィンドウが開きます。

<Image size="lg" img={mitzu_04} alt="データベーステーブルを表示している Mitzu のテーブル選択インターフェース" border />
<br/>

> ClickHouse を用いたプロダクト分析を行うには、テーブルからいくつかのキー列を指定する必要があります。
>
> 指定する列は次のとおりです:
>
> - **User id** - ユーザーの一意な識別子を表す列です。
> - **Event time** - イベントのタイムスタンプを表す列です。
> - オプション [**Event name**] - テーブルに複数のイベント種別が含まれている場合に、イベントを区別・セグメント化するための列です。

<Image size="lg" img={mitzu_05} alt="列マッピングオプションを表示している Mitzu のイベントカタログ設定画面" border />
<br/>
すべてのテーブルの設定が完了したら、`Save & update event catalog` ボタンをクリックします。Mitzu が、上で設定したテーブルからすべてのイベントとそのプロパティを取得します。このステップには、データセットのサイズに応じて数分かかる場合があります。

## 4. セグメンテーションクエリを実行する \\{#4-run-segmentation-queries\\}

Mitzu でのユーザーセグメンテーションは、Amplitude、Mixpanel、PostHog と同じくらい簡単です。

Explore ページの左側にはイベント選択エリアがあり、上部セクションでは時間範囲を設定できます。

<Image size="lg" img={mitzu_06} alt="イベント選択と時間設定を備えた Mitzu のセグメンテーションクエリインターフェイス" border />

<br/>

:::tip フィルターとブレイクダウン
フィルタリングは一般的な要領で行えます。プロパティ（ClickHouse のカラム）を選択し、ドロップダウンからフィルタリングしたい値を選びます。
ブレイクダウンには任意のイベントプロパティまたはユーザープロパティを使用できます（ユーザープロパティを統合する方法については以下を参照してください）。
:::

## 5. ファネルクエリを実行する \\{#5-run-funnel-queries\\}

ファネルには最大 9 ステップまで指定できます。ユーザーがそのファネルを完了できる時間枠を設定します。
SQL を 1 行も書かずに、コンバージョン率に関するインサイトを即座に得られます。

<Image size="lg" img={mitzu_07} alt="ステップ間のコンバージョン率を表示している Mitzu のファネル分析ビュー" border />

<br/>

:::tip トレンドを可視化する
`Funnel trends` を選択して、時間の経過に伴うファネルのトレンドを可視化します。
:::

## 6. Run retention queries \\{#6-run-retention-queries\\}

リテンション率を計算するために、最大 2 つのステップを選択します。測定したい期間に合わせて、リテンションウィンドウ（繰り返しウィンドウ）を選択します。
1 行の SQL も書かずに、コンバージョン率に関するインサイトを即座に得ることができます。

<Image size="lg" img={mitzu_08} alt="コホートごとのリテンション率を示す Mitzu のリテンション分析" border />

<br/>

:::tip コホートリテンション
リテンション率が時間とともにどのように変化するかを可視化するには、`Weekly cohort retention` を選択します。
:::

## 7. ジャーニークエリを実行する \\{#7-run-journey-queries\\}

ファネルのステップを最大 9 個まで選択します。ユーザーがジャーニーを完了できる時間ウィンドウを選択します。Mitzu のジャーニーチャートは、選択したイベント間でユーザーがたどるすべてのパスを可視化してマッピングします。

<Image size="lg" img={mitzu_09} alt="イベント間のユーザーパスフローを示す Mitzu のジャーニー可視化" border />

<br/>

:::tip ステップを分解する
同じステップ内のユーザーを区別するために、セグメントの `Break down` に使用するプロパティを選択できます。
:::

<br/>

## 8. 収益クエリを実行する \\{#8-run-revenue-queries\\}

収益設定が構成されている場合、Mitzu は支払いイベントに基づいて合計MRRとサブスクリプション数を算出できます。

<Image size="lg" img={mitzu_10} alt="MRR 指標を表示している Mitzu の収益分析ダッシュボード" border />

## 9. SQL ネイティブ \\{#9-sql-native\\}

Mitzu は SQL ネイティブで、Explore ページで選択した設定に基づいてネイティブな SQL コードを生成します。

<Image size="lg" img={mitzu_11} alt="ネイティブな ClickHouse クエリを表示している Mitzu の SQL コード生成ビュー" border />

<br/>

:::tip BI ツールで作業を続ける
Mitzu の UI で制約にぶつかった場合は、SQL コードをコピーして BI ツールで作業を続けてください。
:::

## Mitzu サポート \\{#mitzu-support\\}

ご不明な点がありましたら、[support@mitzu.io](email://support@mitzu.io) までお気軽にお問い合わせください。

または、[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg) から Slack コミュニティにご参加ください。

## さらに詳しく \\{#learn-more\\}

Mitzu の詳細は [mitzu.io](https://mitzu.io) を参照してください。

ドキュメントは [docs.mitzu.io](https://docs.mitzu.io) を参照してください。