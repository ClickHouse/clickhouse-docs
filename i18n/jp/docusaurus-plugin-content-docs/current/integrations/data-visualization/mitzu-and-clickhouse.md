---
sidebar_label: 'Mitzu'
slug: '/integrations/mitzu'
keywords:
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
description: 'Mitzu is a no-code warehouse-native product analytics application.'
title: 'Connecting Mitzu to ClickHouse'
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


# Connecting Mitzu to ClickHouse

<CommunityMaintainedBadge/>

Mitzuは、ノーコード、ウェアハウスネイティブなプロダクト分析アプリケーションです。Amplitude、Mixpanel、PostHogなどのツールに似て、MitzuはユーザーがSQLやPythonの専門知識なしでプロダクトの使用データを分析できるようにします。

しかし、これらのプラットフォームとは異なり、Mitzuは会社のプロダクト使用データを複製しません。代わりに、既存のデータウェアハウスまたはデータレイク上でネイティブSQLクエリを生成します。

## Goal {#goal}

本ガイドでは、以下の内容をカバーします：

- ウェアハウスネイティブプロダクト分析
- MitzuをClickHouseに統合する方法

:::tip 例のデータセット
Mitzu用のデータセットがない場合は、NYC Taxi Dataを使用できます。このデータセットはClickHouse Cloudに利用可能で、[これらの指示でロードできます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドはMitzuの使用方法の簡単な概要です。より詳細な情報は[Mitzuのドキュメント](https://docs.mitzu.io/)で確認できます。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)にアクセスしてサインアップしてください。

<Image size="lg" img={mitzu_01} alt="Mitzuのサインインページ、メールとパスワードフィールド" border />

## 3. ワークスペースを設定する {#3-configure-your-workspace}

組織を作成した後、左側のサイドバーにある`ワークスペースを設定する`オンボーディングガイドに従ってください。次に、`Mitzuをデータウェアハウスに接続する`リンクをクリックします。

<Image size="lg" img={mitzu_02} alt="Mitzuワークスペース設定ページ、オンボーディングステップの表示" border />

## 4. MitzuをClickHouseに接続する {#4-connect-mitzu-to-clickhouse}

最初に接続タイプとしてClickHouseを選択し、接続情報を設定します。次に、`接続をテストして保存`ボタンをクリックして設定を保存します。

<Image size="lg" img={mitzu_03} alt="ClickHouse用のMitzu接続設定ページ、構成フォーム" border />

## 5. イベントテーブルを設定する {#5-configure-event-tables}

接続が保存されたら、`イベントテーブル`タブを選択し、`テーブルを追加`ボタンをクリックします。モーダル内で、データベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`テーブルを設定`ボタンをクリックします。これにより、各テーブルのキーとなるカラムを設定できるモーダルウィンドウが開きます。

<Image size="lg" img={mitzu_04} alt="Mitzuテーブル選択インターフェース、データベーステーブルの表示" border />
<br/>

> ClickHouse設定でプロダクト分析を実行するには、テーブルからいくつかのキーとなるカラムを指定する必要があります。
>
> これらのカラムは以下の通りです：
>
> - **ユーザーID** - ユーザーの一意の識別子に関するカラム。
> - **イベント時刻** - イベントのタイムスタンプカラム。
> - オプション[**イベント名**] - このカラムは、テーブルが複数のイベントタイプを含む場合にイベントをセグメント化します。

<Image size="lg" img={mitzu_05} alt="Mitzuイベントカタログ設定、カラムマッピングオプションの表示" border />
<br/>

全てのテーブルが設定されたら、`イベントカタログを保存して更新`ボタンをクリックし、Mitzuは上記で定義されたテーブルから全てのイベントとそのプロパティを見つけます。このステップはデータセットのサイズに応じて数分かかる場合があります。

## 4. セグメンテーションクエリを実行する {#4-run-segmentation-queries}

Mitzuでのユーザーセグメンテーションは、Amplitude、Mixpanel、またはPostHogと同じくらい簡単です。

Exploreページにはイベントのための左側の選択エリアがあり、上部セクションではタイムホライズンを設定できます。

<Image size="lg" img={mitzu_06} alt="Mitzuセグメンテーションクエリインターフェース、イベント選択と時間設定" border />

<br/>

:::tip フィルターとブレイクダウン
フィルタリングは予想通りに行われます：プロパティ（ClickHouseカラム）を選択し、フィルタリングしたい値をドロップダウンから選択します。
ブレイクダウンには任意のイベントまたはユーザープロパティを選択できます（ユーザープロパティの統合方法については以下を参照）。
:::

## 5. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルには最大9ステップを選択できます。ユーザーがファネルを完了できる時間ウィンドウを選択します。
SQLコードを1行も書かずに即座にコンバージョン率を把握できます。

<Image size="lg" img={mitzu_07} alt="Mitzuファネル分析ビュー、ステップ間のコンバージョン率を表示" border />

<br/>

:::tip トレンドを視覚化
`ファネルトレンド`を選択して、時間を通じたファネルトレンドを視覚化します。
:::

## 6. リテンションクエリを実行する {#6-run-retention-queries}

リテンションレート計算には最大2ステップを選択できます。繰り返しウィンドウのリテンションウィンドウを選択します。
SQLコードを1行も書かずに即座にコンバージョン率を把握できます。

<Image size="lg" img={mitzu_08} alt="Mitzuリテンション分析、コホートリテンションレートを表示" border />

<br/>

:::tip コホートリテンション
`週間コホートリテンション`を選択して、リテンションレートが時間と共にどのように変化するかを視覚化します。
:::


## 7. ジャーニークエリを実行する {#7-run-journey-queries}
ファネルには最大9ステップを選択できます。ユーザーがジャーニーを完了できる時間ウィンドウを選択します。Mitzuのジャーニーチャートは、選択されたイベントを通じてユーザーがたどるすべての経路の視覚マップを提供します。

<Image size="lg" img={mitzu_09} alt="Mitzuジャーニー視覚化、イベント間のユーザーパスフローを表示" border />
<br/>

:::tip ステップを分解する
セグメント`Break down`のプロパティを選択して、同じステップ内のユーザーを区別できます。
:::

<br/>

## 8. 収益クエリを実行する {#8-run-revenue-queries}
収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRとサブスクリプション数を計算できます。

<Image size="lg" img={mitzu_10} alt="Mitzu収益分析ダッシュボード、MRRメトリクスを表示" border />

## 9. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、これはExploreページで選択した構成からネイティブSQLコードを生成することを意味します。

<Image size="lg" img={mitzu_11} alt="Mitzu SQLコード生成ビュー、ネイティブClickHouseクエリを表示" border />

<br/>

:::tip BIツールで作業を続ける
MitzuのUIで制限に直面した場合、SQLコードをコピーしてBIツールで作業を続けてください。
:::

## Mitzuサポート {#mitzu-support}

迷った場合は、[support@mitzu.io](email://support@mitzu.io)までお気軽にご連絡ください。

または、私たちのSlackコミュニティには[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)で参加できます。

## 詳細を学ぶ {#learn-more}

Mitzuの詳細情報は[mitzu.io](https://mitzu.io)で見つけられます。

私たちのドキュメントページには[docs.mitzu.io](https://docs.mitzu.io)を訪れてください。
