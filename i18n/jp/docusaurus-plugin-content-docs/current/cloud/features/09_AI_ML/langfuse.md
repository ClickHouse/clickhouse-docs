---
sidebar_label: 'Langfuse'
slug: /cloud/features/ai-ml/langfuse
title: 'Langfuse'
description: 'Langfuse は、チームが LLM アプリケーションのデバッグ、分析、反復的な改善を共同で行えるようにする、オープンソースの LLM エンジニアリング プラットフォームです。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Langfuse \{#langfuse\}

## Langfuse とは何ですか？ \{#what-is-langfuse\}

[Langfuse](https://langfuse.com) は、チームが協力して LLM アプリケーションをデバッグ、分析、および反復的に改善できるようにする、オープンソースの LLM エンジニアリングプラットフォームです。ClickHouse エコシステムの一部であり、その中核として **ClickHouse** に依存することで、スケーラブルで高性能なオブザーバビリティ向けバックエンドを提供します。

ClickHouse の列指向ストレージと高速な分析機能を活用することで、Langfuse は数十億件規模のトレースやイベントを低レイテンシで処理でき、高スループットな本番ワークロードにも適しています。

## なぜ Langfuse なのか？ \{#why-langfuse\}

- **オープンソース:** カスタム連携用の公開 API を備えた完全にオープンソース
- **本番環境向けに最適化:** パフォーマンスのオーバーヘッドを最小限に抑えるように設計
- **最高クラスの SDKS:** Python と JavaScript 向けのネイティブな SDK
- **フレームワーク対応:** OpenAI SDK、LangChain、LlamaIndex などの主要フレームワークと統合
- **マルチモーダル:** テキストや画像など、さまざまなモダリティのトレースをサポート
- **フルプラットフォーム:** LLM アプリケーション開発ライフサイクル全体をカバーするツール群

## デプロイメントオプション \{#deployment-options\}

Langfuse は、さまざまなセキュリティおよびインフラストラクチャ要件に対応する柔軟なデプロイメントオプションを提供します。

**[Langfuse Cloud](https://cloud.langfuse.com)** は、最適なパフォーマンスのためにマネージドな ClickHouse クラスターによって動作するフルマネージドサービスです。SOC 2 Type II および ISO 27001 の認証を取得しており、GDPR に準拠し、米国 (AWS us-west-2) と EU (AWS eu-west-1) のデータリージョンで利用可能です。

**[セルフホスト](https://langfuse.com/self-hosting)** 版 Langfuse は完全なオープンソース (MIT ライセンス) であり、Docker または Kubernetes を使用して自前のインフラストラクチャ上に無料でデプロイできます。オブザーバビリティデータを保存するために、自分で ClickHouse インスタンスを運用する（または ClickHouse Cloud を使用する）ことで、データを完全に管理できます。 

## アーキテクチャ \{#architecture\}

Langfuse はオープンソースコンポーネントのみに依存しており、ローカル環境、クラウドインフラストラクチャ、オンプレミス環境のいずれにもデプロイできます。

* **ClickHouse**: 大量のオブザーバビリティデータ（トレース、スパン、ジェネレーション、スコア）を保存します。ダッシュボード向けの高速な集計と分析を可能にします。
* **Postgres**: ユーザーアカウント、プロジェクト設定、プロンプト定義などのトランザクションデータを保存します。
* **Redis**: イベントのキュー処理とキャッシュを担います。
* **S3/Blob Storage**: 大きなペイロードと生のイベントデータを保存します。

```mermaid
flowchart TB
    User["UI, API, SDKs"]
    subgraph vpc["VPC"]
        Web["Web Server<br/>(langfuse/langfuse)"]
        Worker["Async Worker<br/>(langfuse/worker)"]
        Postgres@{ img: "https://langfuse.com/images/logos/postgres_icon.svg", label: "Postgres - OLTP\n(Transactional Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        Cache@{ img: "https://langfuse.com/images/logos/redis_icon.png", label: "Redis\n(Cache, Queue)", pos: "b", w: 60, h: 60, constraint: "on" }
        Clickhouse@{ img: "https://langfuse.com/images/logos/clickhouse_icon.svg", label: "Clickhouse - OLAP\n(Observability Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        S3@{ img: "https://langfuse.com/images/logos/s3_icon.svg", label: "S3 / Blob Storage\n(Raw events, multi-modal attachments)", pos: "b", w: 60, h: 60, constraint: "on" }
    end
    LLM["LLM API/Gateway<br/>(optional; BYO; can be same VPC or VPC-peered)"]

    User --> Web
    Web --> S3
    Web --> Postgres
    Web --> Cache
    Web --> Clickhouse
    Web -..->|"optional for playground"| LLM

    Cache --> Worker
    Worker --> Clickhouse
    Worker --> Postgres
    Worker --> S3
    Worker -..->|"optional for evals"| LLM
```


## 機能 \{#features\}

### オブザーバビリティ \{#observability\}

[オブザーバビリティ](/docs/observability/overview) は、LLM アプリケーションを理解・デバッグするうえで不可欠です。従来のソフトウェアとは異なり、LLM アプリケーションは複雑で非決定的なやり取りを伴うため、監視やデバッグが難しい場合があります。Langfuse は包括的なトレース機能を提供し、アプリケーション内で何が起きているかを正確に把握できるようにします。

_📹 さらに詳しく知りたい場合は、Langfuse Observability とアプリケーションへの統合方法についての [**エンドツーエンドのウォークスルーを視聴**](https://langfuse.com/watch-demo?tab=observability) してください。_

<Tabs groupId="observability">
<TabItem value="trace-details" label="Trace Details">

トレースにより、アプリ内のすべての LLM 呼び出しおよび関連するロジックを追跡できます。

<video src="https://static.langfuse.com/docs-videos/trace-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="sessions" label="Sessions">

セッションにより、複数ステップの会話やエージェントベースのワークフローを追跡できます。

<video src="https://static.langfuse.com/docs-videos/sessions-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="timeline" label="Timeline">

タイムラインビューを確認してレイテンシの問題をデバッグします。

<video src="https://static.langfuse.com/docs-videos/timeline-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="users" label="Users">

各ユーザーのコストと使用状況を監視するために `userId` を追加します。必要に応じて、システム内からこのビューへのディープリンクを作成できます。

<video src="https://static.langfuse.com/docs-videos/users-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="agent-graphs" label="Agent Graphs">

LLM エージェントは、複雑なエージェントワークフローのフローを表すグラフとして可視化できます。

<video src="https://static.langfuse.com/docs-videos/langgraph-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="dashboard" label="Dashboard">

ダッシュボードで品質・コスト・レイテンシのメトリクスを確認し、LLM アプリケーションを監視します。

<video src="https://static.langfuse.com/docs-videos/dashboard.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### プロンプト管理 \{#prompt-management\}

[プロンプト管理](/docs/prompt-management/overview) は、効果的な LLM アプリケーションを構築するうえで極めて重要です。Langfuse は、開発ライフサイクル全体を通じてプロンプトを管理・バージョン管理・最適化するためのツールを提供します。

_📹 さらに詳しく知りたい場合は、Langfuse の Prompt Management とそれをアプリケーションに統合する方法について解説した [**エンドツーエンドのウォークスルー動画をご覧ください**](https://langfuse.com/watch-demo?tab=prompt)。_

<Tabs groupId="prompt-management">
<TabItem value="create" label="作成">

UI、SDKs、または API を使用して新しいプロンプトを作成します。

<video src="https://static.langfuse.com/docs-videos/create-update-prompts.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="version-control" label="バージョン管理">

UI、API、または SDKs を通じて、プロンプトを共同でバージョン管理および編集します。

<video src="https://static.langfuse.com/docs-videos/create-prompt-version.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="deploy" label="デプロイ">

コードを一切変更することなく、ラベルを使ってプロンプトを本番環境または任意の環境にデプロイします。

<video src="https://static.langfuse.com/docs-videos/deploy-prompt.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="metrics" label="メトリクス">

プロンプトの異なるバージョン間で、レイテンシ、コスト、および評価メトリクスを比較します。

<video src="https://static.langfuse.com/docs-videos/prompt-metrics.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="test-in-playground" label="Playground でテスト">

Playground ですぐにプロンプトをテストできます。

<video src="https://static.langfuse.com/docs-videos/prompt-to-playground.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="link-with-traces" label="トレースとリンク">

プロンプトをトレースと関連付け、LLM アプリケーションのコンテキストでどのように動作するかを把握します。

<video src="https://static.langfuse.com/docs-videos/linked-generations.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="track-changes" label="変更の追跡">

プロンプトへの変更を追跡し、時間の経過とともにどのように進化しているかを確認します。

<video src="https://static.langfuse.com/docs-videos/track-changes.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### 評価とデータセット \{#evaluation\}

[Evaluation](/docs/evaluation/overview) は、LLM アプリケーションの品質と信頼性を確保するうえで不可欠です。Langfuse は、開発環境でのテストでも本番環境でのパフォーマンス監視でも、ニーズに応じて柔軟に適応できる評価ツールを提供します。

_📹 さらに詳しく知りたい方は、Langfuse Evaluation の [**エンドツーエンドのウォークスルー動画**](https://langfuse.com/watch-demo?tab=evaluation) をご覧いただき、LLM アプリケーションの改善方法を学んでください。_

<Tabs groupId="evaluation">
<TabItem value="analytics" label="Analytics">

Langfuse Dashboard で評価結果を可視化できます。

<video src="https://static.langfuse.com/docs-videos/scores-dashboard.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="user-feedback" label="User Feedback">

ユーザーからのフィードバックを収集します。フロントエンドでは Browser SDK を、サーバーサイドでは SDKs または API を通じて取得できます。動画ではサンプルアプリケーションを用いた例を紹介します。

<video src="https://static.langfuse.com/docs-videos/scores-user-feedback.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="llm-as-a-judge" label="LLM-as-a-Judge">

本番または開発環境のトレースに対して、フルマネージドな LLM-as-a-judge 評価を実行します。アプリケーション内の任意のステップに適用でき、ステップ単位の評価が可能です。

<video src="https://static.langfuse.com/docs-videos/scores-llm-as-a-judge.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="experiments" label="Experiments">

データセット上でプロンプトとモデルを評価し、ユーザーインターフェースから直接操作できます。カスタムコードは不要です。

<video src="https://static.langfuse.com/docs-videos/prompt-experiments.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="annotation-queue" label="Annotation Queue">

Annotation Queues を使った人手アノテーションにより、評価ワークフローのベースラインを定義します。

<video src="https://static.langfuse.com/docs-videos/scores-annotation-queue.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="custom-evals" label="Custom Evals">

カスタム評価結果を追加できます。数値、真偽値、カテゴリ値をサポートします。

```bash
POST /api/public/scores
```

Python または JS SDK 経由でスコアを追加します。

```python title="Example (Python)"
langfuse.score(
  trace_id="123",
  name="my_custom_evaluator",
  value=0.5,
)
```

</TabItem>
</Tabs>

## クイックスタート \{#quickstarts\}

数分で Langfuse を使い始められます。現在のニーズに最も適した方法を選択してください：

- [LLM アプリケーション／エージェントのトレーシングを統合する](https://langfuse.com/docs/observability/get-started)
- [プロンプト管理を統合する](https://langfuse.com/docs/prompt-management/get-started)
- [評価を設定する](https://langfuse.com/docs/evaluation/overview)

## さらに詳しく \{#learn-more\}

- [Langfuse ドキュメント](https://langfuse.com/docs)
- [Langfuse GitHub リポジトリ](https://github.com/langfuse/langfuse)
- [デモ動画を見る](https://langfuse.com/watch-demo)