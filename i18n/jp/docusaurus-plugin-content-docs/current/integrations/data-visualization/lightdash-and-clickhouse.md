---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'データ可視化', 'BI', 'セマンティックレイヤー', 'dbt', 'セルフサービス分析', '接続']
description: 'Lightdash は dbt 上に構築されたモダンなオープンソース BI ツールであり、セマンティックレイヤーを通じてチームが ClickHouse 上のデータを探索および可視化できるようにします。このガイドでは、dbt を活用した高速でガバナンスの効いたアナリティクスを実現するために、Lightdash を ClickHouse に接続する方法を説明します。'
title: 'Lightdash を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import lightdash_01 from '@site/static/images/integrations/data-visualization/lightdash_01.png';
import lightdash_02 from '@site/static/images/integrations/data-visualization/lightdash_02.png';
import lightdash_03 from '@site/static/images/integrations/data-visualization/lightdash_03.png';
import lightdash_04 from '@site/static/images/integrations/data-visualization/lightdash_04.png';
import lightdash_05 from '@site/static/images/integrations/data-visualization/lightdash_05.png';
import lightdash_06 from '@site/static/images/integrations/data-visualization/lightdash_06.png';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash {#lightdash}

<PartnerBadge/>

Lightdash は、dbt のオープン性と ClickHouse のパフォーマンスを兼ね備えた、モダンなデータチーム向けの **AI ファーストの BI プラットフォーム** です。ClickHouse を Lightdash に接続すると、dbt のセマンティックレイヤーに基づいた **AI を活用したセルフサービス型の分析エクスペリエンス** を実現でき、すべての質問に対してガバナンスされた一貫性のあるメトリクスで回答できます。

開発者は、オープンなアーキテクチャ、バージョン管理された YAML モデル、GitHub から IDE までワークフローに直接組み込める各種インテグレーションにより、Lightdash を高く評価しています。

このパートナーシップにより、**ClickHouse の高速性** と **Lightdash の開発者エクスペリエンス** が組み合わさり、AI を活用してインサイトを探索・可視化・自動化することがこれまでになく容易になります。

## Lightdash と ClickHouse でインタラクティブなダッシュボードを構築する {#build-an-interactive-dashboard}

このガイドでは、**Lightdash** を **ClickHouse** に接続して dbt モデルを探索し、インタラクティブなダッシュボードを構築する方法を説明します。  
以下の例は、ClickHouse のデータを基盤として構築された完成済みダッシュボードを示しています。

<Image size='md' img={lightdash_02} alt='Lightdash ダッシュボードの例' border />

<VerticalStepper headerLevel="h3">
  ### 接続情報を収集する

  Lightdash と ClickHouse 間の接続を設定する際には、次の情報が必要です。

  * **Host:** ClickHouse データベースが稼働しているホスト名またはアドレス
  * **User:** ClickHouse データベースのユーザー名
  * **Password:** ClickHouse データベースのパスワード
  * **DB name:** ClickHouse データベース名
  * **Schema:** dbt がプロジェクトをコンパイル・実行する際に使用するデフォルトのスキーマ（`profiles.yml` に記載）
  * **Port:** ClickHouse の HTTPS インターフェイスのポート（デフォルト: `8443`）
  * **Secure:** HTTPS/SSL を使用した安全な接続を有効にするオプション
  * **Retries:** Lightdash が失敗した ClickHouse クエリを再試行する回数（デフォルト: `3`）
  * **Start of week:** レポート上の週の開始曜日を選択します。デフォルトではウェアハウスの設定が使用されます

  <ConnectionDetails />

  ***

  ### ClickHouse 用に dbt プロファイルを設定する

  Lightdash では、接続は既存の **dbt プロジェクト** を基盤として構成されます。
  ClickHouse に接続するには、ローカルの `~/.dbt/profiles.yml` に有効な ClickHouse ターゲット設定が含まれていることを確認してください。

  例:

  <Image size="md" img={lightdash_01} alt="lightdash-clickhouse プロジェクト用 profiles.yml の設定例" border />

  <br />

  ### ClickHouse に接続された Lightdash プロジェクトを作成する

  dbt プロファイルを ClickHouse 用に設定したら、**dbt プロジェクト** を Lightdash に接続する必要があります。

  この手順はすべてのデータウェアハウスで共通なため、ここでは詳細は説明しません。dbt プロジェクトのインポートについては、公式の Lightdash ガイドを参照してください。

  [dbt プロジェクトをインポートする → Lightdash ドキュメント](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  dbt プロジェクトを接続すると、Lightdash は `profiles.yml` から ClickHouse の設定を自動的に検出します。接続テストが成功すれば、dbt モデルの探索や、ClickHouse を基盤としたダッシュボードの構築を開始できます。

  ***

  ### Lightdash で ClickHouse のデータを探索する

  接続が完了すると、Lightdash は dbt モデルを自動的に同期し、次の内容を利用できるようにします。

  * YAML で定義された **ディメンション** と **メジャー**
  * **セマンティックレイヤー上のロジック**（メトリクス、結合、エクスプロアなど）
  * リアルタイムの ClickHouse クエリで動作する **ダッシュボード**

  これでダッシュボードの作成やインサイトの共有に加え、**Ask AI** を使用して ClickHouse 上に直接可視化を生成することもできます。手動で SQL を記述する必要はありません。

  ***

  ### Lightdash でメトリクスとディメンションを定義する

  Lightdash では、すべての **メトリクス** と **ディメンション** は dbt モデルの `.yml` ファイル内で直接定義します。これにより、ビジネスロジックがバージョン管理され、一貫性が保たれ、完全に透明になります。

  <Image size="md" img={lightdash_03} alt=".yml ファイル内でメトリクスが定義されている例" border />

  <br />

  これらを YAML で定義することで、チーム全体がダッシュボードや分析において同じ定義を使用できるようになります。たとえば、`total_order_count`、`total_revenue`、`avg_order_value` のような再利用可能なメトリクスを dbt モデルのすぐそばに定義でき、UI 上で重複定義する必要がありません。

  これらの定義方法について詳しくは、次の Lightdash ガイドを参照してください。

  * [メトリクスの作成方法](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  * [ディメンションの作成方法](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### テーブルからデータをクエリする

  dbt プロジェクトが Lightdash に接続されて同期されると、**テーブル**（「エクスプロア」）から直接データを探索できるようになります。
  各テーブルは 1 つの dbt モデルに対応しており、YAML で定義したメトリクスとディメンションを含みます。

  **Explore** ページは、5 つの主要な領域で構成されています。

  1. **ディメンションとメトリクス** — 選択したテーブルで利用可能なすべてのフィールド
  2. **Filters** — クエリ結果のデータを絞り込みます
  3. **チャート** — クエリ結果を可視化する
  4. **Results** — ClickHouse データベースから返された生データを表示します
  5. **SQL** — 結果を生成している SQL クエリを確認します

  <Image size="lg" img={lightdash_04} alt="ディメンション、フィルター、チャート、結果、SQL が表示された Lightdash の Explore ビュー" border />

  ここから、フィールドのドラッグ&amp;ドロップ、フィルタの追加、テーブル・棒グラフ・時系列などの可視化タイプの切り替えを行いながら、インタラクティブにクエリを構築・調整できます。

  エクスプロアとテーブルからのクエリ方法について詳しくは、次を参照してください。
  [テーブルと Explore ページの概要 → Lightdash ドキュメント](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### ダッシュボードを構築する

  データを探索して可視化を保存したら、それらを **ダッシュボード** にまとめてチームと共有できます。

  Lightdash のダッシュボードは完全にインタラクティブです。フィルターの適用、タブの追加、リアルタイムの ClickHouse クエリによって駆動されるチャートの表示が可能です。

  **ダッシュボード内から直接**新しいチャートを作成することもでき、プロジェクトを整理された状態に保つことができます。この方法で作成されたチャートは**そのダッシュボード専用**となり、プロジェクト内の他の場所では再利用できません。

  ダッシュボード専用チャートを作成するには:

  1. **Add tile** をクリックします
  2. **New chart** を選択します。
  3. Chart Builder で可視化を作成する
  4. 保存すると、ダッシュボードの一番下に表示されます

  <Image size="lg" img={lightdash_05} alt="Lightdash ダッシュボード内のチャートの作成と整理" border />

  ダッシュボードの作成と整理方法について詳しくは、次を参照してください。
  [ダッシュボードの構築 → Lightdash ドキュメント](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)

  ***

  ### Ask AI: dbt を基盤としたセルフサービス分析

  Lightdash の **AI エージェント** は、データ探索を真にセルフサービス化します。
  クエリを記述する代わりに、*「月次の収益成長率は?」* のように平易な言葉で質問するだけで、AI エージェントが自動的に適切な可視化を生成し、dbt で定義されたメトリクスとモデルを参照して正確性と一貫性を確保します。

  dbt で使用しているのと同じセマンティックレイヤーによって駆動されるため、すべての回答がガバナンスされ、説明可能で、高速に保たれます。すべて ClickHouse によって支えられています。

  <Image size="lg" img={lightdash_06} alt="dbt メトリクスを基盤にした自然言語クエリを表示している Lightdash Ask AI インターフェイス" border />

  :::tip
  AI エージェントについて詳しくは、次を参照してください: [AI エージェント → Lightdash ドキュメント](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse\&utm_medium=partner\&utm_campaign=integration_docs)
  :::
</VerticalStepper>

## 詳細はこちら {#learn-more}

dbt プロジェクトを Lightdash に接続する方法の詳細については、[Lightdash ドキュメント「ClickHouse セットアップ」](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)を参照してください。