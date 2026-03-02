---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu は、データウェアハウスネイティブなノーコードのプロダクト分析アプリケーションです。'
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

Mitzu は、ノーコードで利用できる、データウェアハウス・ネイティブなプロダクト分析アプリケーションです。Amplitude、Mixpanel、PostHog といったツールと同様に、Mitzu により、ユーザーは SQL や Python の専門知識がなくてもプロダクト利用データを分析できます。

しかし、これらのプラットフォームとは異なり、Mitzu は企業のプロダクト利用データをコピーしません。その代わりに、企業がすでに運用しているデータウェアハウスやデータレイク上のデータに対して、ネイティブな SQL クエリを直接生成します。

## 目標 \{#goal\}

このガイドでは、次の内容を扱います。

- ウェアハウスネイティブなプロダクト分析
- Mitzu を ClickHouse に統合する方法

:::tip サンプルデータセット
Mitzu で使用するデータセットをまだ用意していない場合は、NYC Taxi Data を利用できます。
このデータセットは ClickHouse Cloud で利用できるほか、[こちらの手順で読み込むこともできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドは Mitzu の使い方についての概要のみを説明しています。より詳細な情報は [Mitzu ドキュメント](https://docs.mitzu.io/)を参照してください。

## 1. 接続情報を準備する \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Mitzu にサインインまたは新規登録する \{#2-sign-in-or-sign-up-to-mitzu\}

まずは [https://app.mitzu.io](https://app.mitzu.io) にアクセスして新規登録します。

<Image size="lg" img={mitzu_01} alt="メールアドレスとパスワードの入力フィールドがある Mitzu のサインインページ" border />

## 3. ワークスペースを設定する \{#3-configure-your-workspace\}

Organization を作成したら、左サイドバーの `Set up your workspace` オンボーディングガイドに従ってください。続いて、`Connect Mitzu with your data warehouse` リンクをクリックします。

<Image size="lg" img={mitzu_02} alt="オンボーディング手順が表示された Mitzu のワークスペース設定ページ" border />

## 4. Mitzu を ClickHouse に接続する \{#4-connect-mitzu-to-clickhouse\}

まず、接続タイプとして ClickHouse を選択し、接続情報を設定します。続いて、`Test connection & Save` ボタンをクリックして設定を保存します。

<Image size="lg" img={mitzu_03} alt="設定フォーム付きの ClickHouse 向け Mitzu 接続設定ページ" border />

## 5. イベントテーブルを設定する \{#5-configure-event-tables\}

接続を保存したら、`Event tables` タブを選択し、`Add table` ボタンをクリックします。モーダルでデータベースと、Mitzu に追加したいテーブルを選択します。

チェックボックスを使って少なくとも 1 つのテーブルを選択し、`Configure table` ボタンをクリックします。各テーブルのキーとなるカラムを設定できるモーダルウィンドウが開きます。

<Image size="lg" img={mitzu_04} alt="Mitzu のテーブル選択インターフェースでデータベーステーブルを表示している画面" border />

<br/>

> ClickHouse 環境でプロダクト分析を実行するには、テーブルからいくつかのキーとなるカラムを指定する必要があります。
>
> 指定するカラムは次のとおりです:
>
> - **User id** - ユーザーを一意に識別する ID を保持するカラム。
> - **Event time** - イベントのタイムスタンプを保持するカラム。
> - 任意［**Event name**］- テーブルに複数種類のイベントが含まれる場合に、イベントを区別するためのカラム。

<Image size="lg" img={mitzu_05} alt="Mitzu のイベントカタログ設定画面でカラムマッピングオプションを表示している画面" border />

<br/>

すべてのテーブルの設定が完了したら、`Save & update event catalog` ボタンをクリックします。Mitzu は、上記で定義したテーブルからすべてのイベントとそのプロパティを検出します。データセットのサイズによっては、この処理には数分かかる場合があります。

## 4. セグメンテーション クエリを実行する \{#4-run-segmentation-queries\}

Mitzu でのユーザーセグメンテーションは、Amplitude、Mixpanel、PostHog と同じくらい簡単です。

Explore ページには、左側にイベントを選択するエリアがあり、上部セクションで時間範囲を設定できます。

<Image size="lg" img={mitzu_06} alt="イベント選択と時間範囲の設定を行う Mitzu のセグメンテーション クエリインターフェイス" border />

<br/>

:::tip フィルターとブレイクダウン
フィルタリングは、想定どおりの方法で行えます。プロパティ（ClickHouse カラム）を選択し、ドロップダウンから絞り込みたい値を選択します。
任意のイベントプロパティまたはユーザープロパティをブレイクダウンに使用できます（ユーザープロパティを統合する方法については、以下を参照してください）。
:::

## 5. ファネルクエリを実行する \{#5-run-funnel-queries\}

ファネルのステップを最大 9 個まで選択します。ユーザーがそのファネルを完了できる時間枠を指定します。
SQL を 1 行も書かずに、すぐにコンバージョン率に関するインサイトを得られます。

<Image size="lg" img={mitzu_07} alt="ステップ間のコンバージョン率を表示する Mitzu のファネル分析ビュー" border />

<br/>

:::tip トレンドを可視化する
`Funnel trends` を選択すると、時間の経過に伴うファネルのトレンドを可視化できます。
:::

## 6. リテンションクエリを実行する \{#6-run-retention-queries\}

リテンション率を計算するには、最大 2 つのステップを選択します。リテンションの集計期間（リカーリングウィンドウ）を指定すると、
SQL を 1 行も書かずにコンバージョン率に関するインサイトを即座に得ることができます。

<Image size="lg" img={mitzu_08} alt="Mitzu のリテンション分析でコホート別リテンション率を表示している画面" border />

<br/>

:::tip コホートリテンション
`Weekly cohort retention` を選択して、リテンション率が時間の経過とともにどのように変化するかを可視化します。
:::

## 7. ジャーニークエリを実行する \{#7-run-journey-queries\}

ファネル用に最大 9 個のステップを選択します。ユーザーがジャーニーを完了できる時間範囲を選択します。Mitzu のジャーニーチャートは、選択したイベント間をユーザーがたどるすべてのパスを視覚的なマップとして表示します。

<Image size="lg" img={mitzu_09} alt="Mitzu journey visualization showing user path flow between events" border />

<br/>

:::tip ステップを分解
同じステップ内のユーザーを区別するために、セグメントの `Break down` プロパティを選択できます。
:::

<br/>

## 8. 収益クエリを実行する \{#8-run-revenue-queries\}

収益設定が完了していれば、Mitzu は支払いイベントに基づいて合計 MRR とサブスクリプション数を算出できます。

<Image size="lg" img={mitzu_10} alt="MRR メトリクスを表示する Mitzu の収益分析ダッシュボード" border />

## 9. SQL ネイティブ \{#9-sql-native\}

Mitzu は SQL ネイティブで、Explore ページで指定した構成に基づいてネイティブな SQL コードを生成します。

<Image size="lg" img={mitzu_11} alt="ネイティブな ClickHouse クエリを表示する Mitzu の SQL コード生成ビュー" border />

<br/>

:::tip BI ツールで作業を続ける
Mitzu の UI で制約にぶつかった場合は、SQL コードをコピーして BI ツール側で作業を続けてください。
:::

## Mitzu サポート \{#mitzu-support\}

お困りの際は、[support@mitzu.io](email://support@mitzu.io) までお気軽にお問い合わせください。

または、[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg) から Slack コミュニティにご参加ください。

## 詳細情報 \{#learn-more\}

Mitzu の詳細については [mitzu.io](https://mitzu.io) をご覧ください。

ドキュメントについては [docs.mitzu.io](https://docs.mitzu.io) を参照してください。