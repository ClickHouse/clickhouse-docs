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
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Lightdash

<PartnerBadge/>

Lightdash は、dbt のオープン性と ClickHouse のパフォーマンスを兼ね備えた、モダンなデータチーム向けの **AI ファーストの BI プラットフォーム** です。ClickHouse を Lightdash に接続すると、dbt のセマンティックレイヤーに基づいた **AI を活用したセルフサービス型の分析エクスペリエンス** を実現でき、すべての質問に対してガバナンスされた一貫性のあるメトリクスで回答できます。

開発者は、オープンなアーキテクチャ、バージョン管理された YAML モデル、GitHub から IDE までワークフローに直接組み込める各種インテグレーションにより、Lightdash を高く評価しています。

このパートナーシップにより、**ClickHouse の高速性** と **Lightdash の開発者エクスペリエンス** が組み合わさり、AI を活用してインサイトを探索・可視化・自動化することがこれまでになく容易になります。



## Lightdash と ClickHouse でインタラクティブなダッシュボードを構築する {#build-an-interactive-dashboard}

このガイドでは、**Lightdash** を **ClickHouse** に接続して dbt モデルを探索し、インタラクティブなダッシュボードを構築する方法を説明します。  
以下の例は、ClickHouse のデータを基盤として構築された完成済みダッシュボードを示しています。

<Image size='md' img={lightdash_02} alt='Lightdash ダッシュボードの例' border />

<VerticalStepper headerLevel="h3">

### 接続情報を収集する {#connection-data-required}

Lightdash と ClickHouse 間の接続を設定する際には、次の情報が必要です。

- **Host:** ClickHouse データベースが稼働しているアドレス
- **User:** ClickHouse データベースのユーザー名
- **Password:** ClickHouse データベースのパスワード
- **DB name:** ClickHouse データベース名
- **Schema:** dbt がプロジェクトをコンパイル・実行する際に使用するデフォルトスキーマ（`profiles.yml` に記載）
- **Port:** ClickHouse の HTTPS インターフェイスのポート（デフォルト: `8443`）
- **Secure:** HTTPS/SSL を使用して安全な接続を行うために有効化するオプション
- **Retries:** Lightdash が失敗した ClickHouse クエリを再試行する回数（デフォルト: `3`）
- **Start of week:** レポーティング上の週の開始曜日。デフォルトではウェアハウスの設定が使用されます

<ConnectionDetails />

---

### ClickHouse 用に dbt プロファイルを設定する {#configuring-your-dbt-profile-for-clickhouse}

Lightdash では、接続は既存の **dbt プロジェクト** を基盤として構成されます。  
ClickHouse に接続するには、ローカルの `~/.dbt/profiles.yml` に有効な ClickHouse ターゲット設定が含まれていることを確認してください。

例:

<Image
  size='md'
  img={lightdash_01}
  alt='lightdash-clickhouse プロジェクト向け profiles.yml 設定例'
  border
/>
<br />

### ClickHouse に接続された Lightdash プロジェクトを作成する {#creating-a-lightdash-project-connected-to-clickhouse}

dbt プロファイルを ClickHouse 用に設定したら、**dbt プロジェクト** を Lightdash に接続する必要があります。

この手順はすべてのデータウェアハウスで共通なため、ここでは詳細は説明しません。dbt プロジェクトのインポートについては、公式の Lightdash ガイドを参照してください。

[dbt プロジェクトをインポートする → Lightdash ドキュメント](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

dbt プロジェクトを接続すると、Lightdash は `profiles.yml` から ClickHouse の設定を自動的に検出します。接続テストが成功すれば、dbt モデルの探索や、ClickHouse を基盤としたダッシュボードの構築を開始できます。

---

### Lightdash で ClickHouse のデータを探索する {#exploring-your-clickhouse-data-in-lightdash}

接続が完了すると、Lightdash は dbt モデルを自動的に同期し、次の内容を利用できるようにします。

- YAML で定義された **ディメンション** と **メジャー**
- メトリクス、結合、エクスプロアなどの **セマンティックレイヤーのロジック**
- リアルタイムの ClickHouse クエリによって駆動される **ダッシュボード**

これでダッシュボードの作成やインサイトの共有に加え、**Ask AI** を使用して ClickHouse 上に直接可視化を生成することもできます。手動で SQL を記述する必要はありません。

---

### Lightdash でメトリクスとディメンションを定義する {#defining-metrics-and-dimensions-in-lightdash}

Lightdash では、すべての **メトリクス** と **ディメンション** は dbt モデルの `.yml` ファイル内で直接定義します。これにより、ビジネスロジックがバージョン管理され、一貫性が保たれ、完全に透明になります。

<Image
  size='md'
  img={lightdash_03}
  alt='.yml ファイル内でメトリクスを定義している例'
  border
/>
<br />

これらを YAML で定義することで、チーム全体がダッシュボードや分析において同じ定義を使用できるようになります。たとえば、`total_order_count`、`total_revenue`、`avg_order_value` のような再利用可能なメトリクスを dbt モデルのすぐそばに定義でき、UI 上で重複定義する必要がありません。

これらの定義方法について詳しくは、次の Lightdash ガイドを参照してください。

- [メトリクスの作成方法](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
- [ディメンションの作成方法](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### テーブルからデータをクエリする {#querying-your-data-from-tables}

dbt プロジェクトが Lightdash に接続されて同期されると、**テーブル**（「エクスプロア」）から直接データを探索できるようになります。  
各テーブルは 1 つの dbt モデルに対応しており、YAML で定義したメトリクスとディメンションを含みます。

**Explore** ページは、5 つの主要な領域で構成されています。


1. **Dimensions and Metrics** — 選択したテーブルで利用可能なすべてのフィールドです
2. **Filters** — クエリで返されるデータを制限します
3. **Chart** — クエリ結果を可視化します
4. **Results** — ClickHouse データベースから返された生データを表示します
5. **SQL** — 結果の背後で生成された SQL クエリを確認します

<Image
  size='lg'
  img={lightdash_04}
  alt='ディメンション、フィルター、チャート、結果、および SQL が表示された Lightdash の Explore ビュー'
  border
/>

ここからは、フィールドのドラッグ＆ドロップ、フィルターの追加、テーブル・棒グラフ・時系列などの可視化タイプの切り替えによって、対話的にクエリを構築・調整できます。

Explore の詳細や、テーブルからどのようにクエリを実行するかについては、次を参照してください。  
[テーブルと Explore ページの概要 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### ダッシュボードを作成する {#building-dashboards}

データを探索して可視化を保存したら、それらを組み合わせてチームと共有するための **ダッシュボード** を作成できます。

Lightdash のダッシュボードは完全にインタラクティブで、フィルターを適用したり、タブを追加したり、リアルタイムの ClickHouse クエリに基づくチャートを表示したりできます。

また、**ダッシュボード内から直接** 新しいチャートを作成することもでき、プロジェクトを整理された状態に保ち、不要なチャートを増やさないのに役立ちます。この方法で作成されたチャートは **そのダッシュボード専用** であり、プロジェクト内の他の場所では再利用できません。

ダッシュボード専用チャートを作成するには、次の手順を実行します。

1. **Add tile** をクリックします
2. **New chart** を選択します
3. チャートビルダーで可視化を作成します
4. 保存します — ダッシュボードの一番下に表示されます

<Image
  size='lg'
  img={lightdash_05}
  alt='Lightdash ダッシュボード内でチャートを作成および整理している画面'
  border
/>

ダッシュボードの作成と整理方法の詳細については、次を参照してください。  
[ダッシュボードの構築 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: dbt を活用したセルフサービス分析 {#ask-ai}

Lightdash の **AI Agents** により、データ探索は真のセルフサービスになります。  
ユーザーはクエリを記述する代わりに、_「月次の売上成長率はどうでしたか？」_ のように自然な言葉で質問するだけでよく、AI Agent が dbt で定義したメトリクスやモデルを参照しながら、正確性と一貫性を保った適切な可視化を自動生成します。

これは、dbt で使用しているのと同じセマンティックレイヤーによって動作しているため、すべての回答はガバナンスが効いた形で、説明可能かつ高速に提供されます。そのすべてを ClickHouse が支えています。

<Image
  size='lg'
  img={lightdash_06}
  alt='dbt のメトリクスを利用した自然言語クエリを表示している Lightdash Ask AI インターフェース'
  border
/>

:::tip
AI Agents の詳細については、次を参照してください: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::

</VerticalStepper>


## 詳細はこちら {#learn-more}

dbt プロジェクトを Lightdash に接続する方法の詳細については、[Lightdash ドキュメント「ClickHouse セットアップ」](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)を参照してください。
