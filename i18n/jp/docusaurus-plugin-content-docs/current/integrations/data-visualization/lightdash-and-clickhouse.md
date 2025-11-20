---
sidebar_label: 'Lightdash'
sidebar_position: 131
slug: /integrations/lightdash
keywords: ['clickhouse', 'lightdash', 'data visualization', 'BI', 'semantic layer', 'dbt', 'self-serve analytics', 'connect']
description: 'Lightdash は dbt の上に構築されたモダンなオープンソース BI ツールであり、セマンティックレイヤーを通じて ClickHouse のデータを探索および可視化できます。ここでは、dbt を活用した高速かつガバナンスの効いたアナリティクスを実現するために、Lightdash を ClickHouse に接続する方法を説明します。'
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

Lightdash は、dbt のオープン性と ClickHouse のパフォーマンスを組み合わせた、モダンなデータチーム向けの **AI ファーストな BI プラットフォーム** です。ClickHouse を Lightdash に接続することで、dbt のセマンティックレイヤーに基づいた **AI 搭載のセルフサービス型アナリティクス体験** を実現でき、あらゆる問いに対してガバナンスされた一貫性のあるメトリクスで回答できます。

Lightdash は、そのオープンなアーキテクチャ、バージョン管理された YAML モデル、そして GitHub から IDE まで開発者のワークフローに直接組み込める各種連携機能により、開発者から高く支持されています。

このパートナーシップにより、**ClickHouse の高速性** と **Lightdash の優れた開発者体験** が組み合わさり、AI を活用した探索・可視化・インサイトの自動化がこれまでになく容易になります。



## LightdashとClickHouseでインタラクティブなダッシュボードを構築する {#build-an-interactive-dashboard}

このガイドでは、**Lightdash**が**ClickHouse**に接続してdbtモデルを探索し、インタラクティブなダッシュボードを構築する方法を説明します。  
以下の例は、ClickHouseのデータを活用した完成したダッシュボードを示しています。

<Image size='md' img={lightdash_02} alt='Lightdashダッシュボードの例' border />

<VerticalStepper headerLevel="h3">

### 接続データの収集 {#connection-data-required}

LightdashとClickHouse間の接続を設定する際には、以下の情報が必要です：

- **Host:** ClickHouseデータベースが稼働しているアドレス
- **User:** ClickHouseデータベースのユーザー名
- **Password:** ClickHouseデータベースのパスワード
- **DB name:** ClickHouseデータベースの名前
- **Schema:** dbtがプロジェクトのコンパイルと実行に使用するデフォルトスキーマ（`profiles.yml`に記載）
- **Port:** ClickHouse HTTPSインターフェースのポート（デフォルト：`8443`）
- **Secure:** HTTPS/SSLを使用した安全な接続を有効にする場合は、このオプションを有効にします
- **Retries:** Lightdashが失敗したClickHouseクエリを再試行する回数（デフォルト：`3`）
- **Start of week:** レポート週の開始曜日を選択します。デフォルトではウェアハウスの設定に従います

<ConnectionDetails />

---

### ClickHouse用のdbtプロファイルの設定 {#configuring-your-dbt-profile-for-clickhouse}

Lightdashでは、接続は既存の**dbtプロジェクト**に基づいています。  
ClickHouseに接続するには、ローカルの`~/.dbt/profiles.yml`ファイルに有効なClickHouseターゲット設定が含まれていることを確認してください。

例：

<Image
  size='md'
  img={lightdash_01}
  alt='lightdash-clickhouseプロジェクトのprofiles.yml設定例'
  border
/>
<br />

### ClickHouseに接続されたLightdashプロジェクトの作成 {#creating-a-lightdash-project-connected-to-clickhouse}

dbtプロファイルがClickHouse用に設定されたら、**dbtプロジェクト**をLightdashに接続する必要があります。

このプロセスはすべてのデータウェアハウスで共通であるため、ここでは詳細には触れません。dbtプロジェクトのインポートについては、Lightdashの公式ガイドを参照してください：

[dbtプロジェクトのインポート → Lightdashドキュメント](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#2-import-a-dbt-project?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

dbtプロジェクトを接続すると、Lightdashは`profiles.yml`ファイルからClickHouse設定を自動的に検出します。接続テストが成功すると、dbtモデルの探索とClickHouseを活用したダッシュボードの構築を開始できます。

---

### LightdashでClickHouseデータを探索する {#exploring-your-clickhouse-data-in-lightdash}

接続されると、Lightdashは自動的にdbtモデルを同期し、以下を公開します：

- YAMLで定義された**ディメンション**と**メジャー**
- メトリクス、結合、探索などの**セマンティックレイヤーロジック**
- リアルタイムClickHouseクエリを活用した**ダッシュボード**

これで、ダッシュボードの構築、インサイトの共有、さらには**Ask AI**を使用してClickHouse上で直接ビジュアライゼーションを生成できます。手動でSQLを記述する必要はありません。

---

### Lightdashでメトリクスとディメンションを定義する {#defining-metrics-and-dimensions-in-lightdash}

Lightdashでは、すべての**メトリクス**と**ディメンション**はdbtモデルの`.yml`ファイルに直接定義されます。これにより、ビジネスロジックがバージョン管理され、一貫性があり、完全に透明になります。

<Image
  size='md'
  img={lightdash_03}
  alt='.ymlファイルでメトリクスを定義する例'
  border
/>
<br />

YAMLでこれらを定義することで、チームがダッシュボードと分析全体で同じ定義を使用することが保証されます。例えば、`total_order_count`、`total_revenue`、`avg_order_value`などの再利用可能なメトリクスをdbtモデルのすぐ隣に作成できます。UIでの重複は不要です。

これらの定義方法の詳細については、以下のLightdashガイドを参照してください：

- [メトリクスの作成方法](https://docs.lightdash.com/guides/how-to-create-metrics?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
- [ディメンションの作成方法](https://docs.lightdash.com/guides/how-to-create-dimensions?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### テーブルからデータをクエリする {#querying-your-data-from-tables}

dbtプロジェクトがLightdashに接続され同期されると、**テーブル**（または「探索」）から直接データの探索を開始できます。  
各テーブルはdbtモデルを表し、YAMLで定義したメトリクスとディメンションが含まれています。

**探索**ページは5つの主要なエリアで構成されています：


1. **ディメンションとメトリクス** — 選択したテーブルで利用可能なすべてのフィールド
2. **フィルター** — クエリで返されるデータを制限
3. **チャート** — クエリ結果を可視化
4. **結果** — ClickHouseデータベースから返される生データを表示
5. **SQL** — 結果の背後にある生成されたSQLクエリを確認

<Image
  size='lg'
  img={lightdash_04}
  alt='ディメンション、フィルター、チャート、結果、SQLを表示するLightdash Exploreビュー'
  border
/>

ここから、フィールドのドラッグアンドドロップ、フィルターの追加、テーブル、棒グラフ、時系列などの可視化タイプの切り替えを行いながら、インタラクティブにクエリを構築・調整できます。

Exploreとテーブルからのクエリ方法の詳細については、以下を参照してください:  
[テーブルとExploreページの紹介 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/using-explores#an-intro-to-tables-and-the-explore-page?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### ダッシュボードの構築 {#building-dashboards}

データを探索し可視化を保存したら、それらを**ダッシュボード**にまとめてチームと共有できます。

Lightdashのダッシュボードは完全にインタラクティブです — フィルターの適用、タブの追加、リアルタイムのClickHouseクエリで動作するチャートの表示が可能です。

また、**ダッシュボード内から直接**新しいチャートを作成することもでき、プロジェクトを整理された状態に保つことができます。この方法で作成されたチャートは**そのダッシュボード専用**であり、プロジェクト内の他の場所で再利用することはできません。

ダッシュボード専用チャートを作成するには:

1. **タイルを追加**をクリック
2. **新しいチャート**を選択
3. チャートビルダーで可視化を構築
4. 保存 — ダッシュボードの下部に表示されます

<Image
  size='lg'
  img={lightdash_05}
  alt='Lightdashダッシュボード内でのチャートの作成と整理'
  border
/>

ダッシュボードの作成と整理方法の詳細については、こちらを参照してください:  
[ダッシュボードの構築 → Lightdash Docs](https://docs.lightdash.com/get-started/exploring-data/dashboards?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)

---

### Ask AI: dbtを活用したセルフサービス分析 {#ask-ai}

Lightdashの**AI Agents**は、データ探索を真にセルフサービス化します。  
クエリを記述する代わりに、ユーザーは_「月次収益成長率はどうでしたか?」_のような平易な言葉で質問するだけで、AI Agentが自動的に適切な可視化を生成し、dbtで定義されたメトリクスとモデルを参照して正確性と一貫性を確保します。

これはdbtで使用しているのと同じセマンティックレイヤーで動作しており、すべての回答がガバナンスされ、説明可能で、高速であることを意味します — すべてClickHouseによって支えられています。

<Image
  size='lg'
  img={lightdash_06}
  alt='dbtメトリクスを活用した自然言語クエリを表示するLightdash Ask AIインターフェース'
  border
/>

:::tip
AI Agentsの詳細については、こちらを参照してください: [AI Agents → Lightdash Docs](https://docs.lightdash.com/guides/ai-agents?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)
:::

</VerticalStepper>


## 詳細情報 {#learn-more}

dbtプロジェクトをLightdashに接続する詳細については、[Lightdash Docs → ClickHouseセットアップ](https://docs.lightdash.com/get-started/setup-lightdash/connect-project#clickhouse?utm_source=clickhouse&utm_medium=partner&utm_campaign=integration_docs)を参照してください。
