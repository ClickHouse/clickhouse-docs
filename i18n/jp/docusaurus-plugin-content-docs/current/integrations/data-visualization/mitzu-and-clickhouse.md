---
'sidebar_label': 'Mitzu'
'slug': '/integrations/mitzu'
'keywords':
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Mitzuはノーコードのウェアハウスネイティブ製品分析アプリケーションです。'
'title': 'MitzuをClickHouseに接続する'
'doc_type': 'guide'
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


# ClickHouseへのMitzuの接続

<CommunityMaintainedBadge/>

Mitzuは、ノーコードで、倉庫ネイティブの製品分析アプリケーションです。Amplitude、Mixpanel、PostHogのようなツールと同様に、MitzuはユーザーがSQLやPythonの専門知識を必要とせずに製品使用データを分析することを可能にします。

しかし、これらのプラットフォームとは異なり、Mitzuは企業の製品使用データを複製しません。代わりに、企業の既存のデータウェアハウスまたはデータレイク上で直接ネイティブSQLクエリを生成します。

## 目標 {#goal}

このガイドでは、以下の内容について説明します：

- 倉庫ネイティブの製品分析
- MitzuをClickHouseに統合する方法

:::tip 使用例データセット
Mitzuで使用するデータセットをお持ちでない場合、NYC Taxi Dataを使用できます。このデータセットはClickHouse Cloudで利用可能で、[これらの手順で読み込むことができます](/getting-started/example-datasets/nyc-taxi)。
:::

このガイドはMitzuの使用方法についての簡単な概要です。より詳細な情報は[Mitzuのドキュメント](https://docs.mitzu.io/)で確認できます。

## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzuにサインインまたはサインアップする {#2-sign-in-or-sign-up-to-mitzu}

最初のステップとして、[https://app.mitzu.io](https://app.mitzu.io)に移動してサインアップしてください。

<Image size="lg" img={mitzu_01} alt="メールとパスワードフィールドのあるMitzuのサインインページ" border />

## 3. ワークスペースを設定する {#3-configure-your-workspace}

組織を作成した後、左側のサイドバーにある`ワークスペースを設定する`オンボーディングガイドに従ってください。そして、`あなたのデータウェアハウスとMitzuを接続する`リンクをクリックします。

<Image size="lg" img={mitzu_02} alt="オンボーディングステップを表示するMitzuワークスペースセットアップページ" border />

## 4. MitzuをClickHouseに接続する {#4-connect-mitzu-to-clickhouse}

最初に、接続タイプとしてClickHouseを選択し、接続情報を設定します。その後、`接続をテストして保存`ボタンをクリックして設定を保存します。

<Image size="lg" img={mitzu_03} alt="ClickHouseのためのMitzu接続設定ページ" border />

## 5. イベントテーブルを設定する {#5-configure-event-tables}

接続が保存されたら、`イベントテーブル`タブを選択し、`テーブルを追加`ボタンをクリックします。モーダル内で、データベースとMitzuに追加したいテーブルを選択します。

チェックボックスを使用して少なくとも1つのテーブルを選択し、`テーブルを設定`ボタンをクリックします。これにより、各テーブルのキーとなるカラムを設定できるモーダルウィンドウが開きます。

<Image size="lg" img={mitzu_04} alt="データベーステーブルを表示するMitzuのテーブル選択インターフェース" border />
<br/>

> ClickHouse設定で製品分析を実行するには、テーブルからいくつかのキーとなるカラムを指定する必要があります。
>
> これらは以下の通りです：
>
> - **ユーザーID** - ユーザーの一意の識別子を示すカラム。
> - **イベント時間** - イベントのタイムスタンプカラム。
> - オプション[**イベント名**] - テーブルに複数のイベントタイプが含まれている場合、このカラムはイベントをセグメント化します。

<Image size="lg" img={mitzu_05} alt="カラムマッピングオプションを表示するMitzuのイベントカタログ設定" border />
<br/>
すべてのテーブルが設定されると、`イベントカタログを保存して更新`ボタンをクリックすると、Mitzuが上記で定義したテーブルからすべてのイベントとそのプロパティを取得します。このステップには、データセットのサイズに応じて数分かかることがあります。

## 4. セグメンテーションクエリを実行する {#4-run-segmentation-queries}

MitzuでのユーザーセグメンテーションはAmplitude、Mixpanel、PostHogと同様に簡単です。

Exploreページには、左側にイベントの選択エリアがあり、上部セクションは時間の範囲を設定するためのものです。

<Image size="lg" img={mitzu_06} alt="Mitzuのセグメンテーションクエリインターフェース" border />

<br/>

:::tip フィルターとブレイクダウン
フィルタリングは予想通りに実行されます：プロパティ（ClickHouseカラム）を選択し、フィルタリングしたい値をドロップダウンから選択します。
ブレイクダウンには任意のイベントまたはユーザープロパティを選択できます（ユーザープロパティの統合方法については以下を参照してください）。
:::

## 5. ファネルクエリを実行する {#5-run-funnel-queries}

ファネルには最大9つのステップを選択できます。ユーザーがファネルを完了できる時間ウィンドウを選択します。
SQLコードを1行も書かずに即座にコンバージョン率を洞察できます。

<Image size="lg" img={mitzu_07} alt="ステップ間のコンバージョン率を表示するMitzuのファネル分析ビュー" border />

<br/>

:::tip トレンドを可視化する
`ファネルトレンド`を選択すると、時間の経過に伴うファネルトレンドを可視化できます。
:::

## 6. リテンションクエリを実行する {#6-run-retention-queries}

リテンション率の計算には最大2つのステップを選択できます。繰り返しウィンドウのリテンションウィンドウを選択します。
SQLコードを1行も書かずに即座にコンバージョン率を洞察できます。

<Image size="lg" img={mitzu_08} alt="コホートリテンション率を表示するMitzuのリテンション分析" border />

<br/>

:::tip コホートリテンション
`週間コホートリテンション`を選択すると、時間の経過に伴うリテンション率の変化を可視化できます。
:::

## 7. ジャーニークエリを実行する {#7-run-journey-queries}
ファネルには最大9つのステップを選択できます。ユーザーがジャーニーを完了できる時間ウィンドウを選択します。Mitzuのジャーニーチャートでは、選択したイベントを通じてユーザーが取る全てのパスを視覚的に示します。

<Image size="lg" img={mitzu_09} alt="イベント間のユーザーパスフローを表示するMitzuのジャーニービジュアル" border />
<br/>

:::tip ステップを細分化する
同じステップ内のユーザーを区別するために、セグメント`ブレイクダウン`のプロパティを選択できます。
:::

<br/>

## 8. 収益クエリを実行する {#8-run-revenue-queries}
収益設定が構成されている場合、Mitzuは支払いイベントに基づいて総MRRとサブスクリプション数を計算できます。

<Image size="lg" img={mitzu_10} alt="MRRメトリックを表示するMitzuの収益分析ダッシュボード" border />

## 9. SQLネイティブ {#9-sql-native}

MitzuはSQLネイティブであり、Exploreページで選択した設定からネイティブSQLコードを生成します。

<Image size="lg" img={mitzu_11} alt="ネイティブClickHouseクエリを表示するMitzuのSQLコード生成ビュー" border />

<br/>

:::tip BIツールで作業を続ける
Mitzu UIで制限に直面した場合、SQLコードをコピーしてBIツールで作業を続けてください。
:::

## Mitzuサポート {#mitzu-support}

迷った場合は、[support@mitzu.io](email://support@mitzu.io)までお気軽にお問い合わせください。

または、[こちら](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)で私たちのSlackコミュニティに参加できます。

## さらに学ぶ {#learn-more}

Mitzuに関する詳細情報は[mitzu.io](https://mitzu.io)をご覧ください。

私たちのドキュメントページは[docs.mitzu.io](https://docs.mitzu.io)で確認できます。
