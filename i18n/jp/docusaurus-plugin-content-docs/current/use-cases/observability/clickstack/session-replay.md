---
slug: /use-cases/observability/clickstack/session-replay
title: 'セッションリプレイ'
sidebar_label: 'セッションリプレイ'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'ClickStack でユーザーセッションを取得して再生することで、フロントエンドの問題をデバッグし、ユーザー行動を理解し、ブラウザーのアクティビティをバックエンドのログやトレースと相関付けることができます。'
doc_type: 'guide'
keywords: ['clickstack', 'session replay', 'browser sdk', 'frontend observability', 'user sessions', 'debugging']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';
import trace_to_replay from '@site/static/images/clickstack/session-replay/trace-to-replay.png';
import clickpy_trace from '@site/static/images/clickstack/session-replay/clickpy-trace.gif';

ClickStack のセッションリプレイは、Web アプリケーション内でのユーザー操作をキャプチャして再構成し、セッション中にユーザーが見て、行ったことをそのまま視覚的に再生できるようにします。ビデオ録画ではなく、SDK が DOM の変更、マウスの動き、クリック、スクロール、キーボード入力、コンソールログ、ネットワークリクエスト（XHR、Fetch、WebSocket）、および JavaScript 例外を記録し、その情報からブラウザ内で体験を再構成します。

セッションリプレイは、ログ、トレース、メトリクスと並んで ClickHouse に保存されるため、ユーザー体験の再生から、それを支えているバックエンドのトレースやデータベースクエリの調査までを、数回のクリックで行うことができます。これにより、セッションリプレイは本番環境の問題のデバッグ、ユーザー行動の理解、UX の摩擦ポイントの特定、サポートに報告された問題の視覚的な確認に有用です。


## アプリケーションのインスツルメンテーション \{#instrumentation\}

ClickStack は OpenTelemetry と完全に互換性があるため、標準的な OpenTelemetry JavaScript SDK または任意の [ClickStack 言語別 SDK](/use-cases/observability/clickstack/sdks) を使用してブラウザー テレメトリ（トレースや例外）を送信できます。ただし、**セッションリプレイには ClickStack Browser SDK**（`@hyperdx/browser`）が必要です。これは OpenTelemetry SDK を拡張し、セッション録画、コンソールキャプチャ、ネットワークリクエストキャプチャを提供します。セッションリプレイが不要でトレースのみが必要な場合は、任意の OTel 互換ブラウザー SDK を ClickStack と併用できます。

以下の例では ClickStack Browser SDK を使用します。アプリケーションにセッションリプレイを追加するには、パッケージのインストール、SDK の初期化、その後のユーザー操作の自動キャプチャという 3 つの手順だけです。追加のコード変更は不要です。

:::tip
SDK はアプリの起動時に必ず読み込まれる場所で初期化してください。たとえば Next.js アプリケーションでは、ルートの `layout.js` などが該当します。これによりセッション録画が即時に開始され、ユーザー体験全体を捕捉できます。
:::

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell
npm install @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack の場合は省略
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```shell
yarn add @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack の場合は省略
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="script_tag" label="スクリプトタグ">

バンドラーを使用しないアプリケーションでは、script タグ経由で直接 SDK を読み込みます。これにより `HyperDX` グローバル変数が公開され、NPM パッケージと同様の方法で使用できます。

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack の場合は省略
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
</script>
```

</TabItem>
</Tabs>

:::note
`tracePropagationTargets` オプションは、セッションリプレイとバックエンドトレースを接続するうえで重要です。フロントエンドからバックエンドまでのエンドツーエンドな分散トレースを有効にするために、自分の API ドメインを設定してください。プライバシー制御、カスタムアクション、React エラーバウンダリ、ソースマップなどを含む SDK オプションの完全な一覧については、[Browser SDK リファレンス](/use-cases/observability/clickstack/sdks/browser) を参照してください。
:::

Browser SDK は、プライバシーに敏感なアプリケーション向けの [入力やテキストのマスキング](/use-cases/observability/clickstack/sdks/browser#options) や、ClickStack UI でユーザー単位にセッションを検索・フィルタリングできるようにするための [ユーザー情報の付与](/use-cases/observability/clickstack/sdks/browser#attach-user-information-or-metadata) にも対応しています。

## セッションリプレイの閲覧 \{#viewing-replays\}

ClickStack UI（HyperDX）の左サイドバーから **Client Sessions** に移動します。このビューには、キャプチャされたすべてのブラウザーセッションが、その継続時間とイベント数とともに一覧表示されます。

<Image img={replay_search} alt="セッションリプレイの検索ビュー" size="lg"/>

任意のセッションの再生ボタンをクリックすると、そのセッションのリプレイが開始されます。リプレイビューでは、右側に再構成されたユーザーエクスペリエンスが表示され、左側にはブラウザーイベント（ネットワークリクエスト、コンソールログ、エラー）のタイムラインが表示されます。

<Image img={session_replay} alt="セッションリプレイの再生" size="lg"/>

**Highlighted** モードと **All Events** モードを切り替えて、タイムラインに表示する詳細レベルを調整します。エラーは赤でマークされ、任意のイベントをクリックすると、リプレイの再生位置がそのセッション内の該当箇所に移動します。

### セッションからトレースへ \{#session-to-trace\}

セッションタイムライン上でネットワークリクエストまたはエラーを選択すると、**Trace** タブに遷移して、そのリクエストがバックエンドサービス間でどのように処理されるかを追跡できます。これにより、そのユーザー操作によってトリガーされた関連するログ、span、データベースクエリを確認できます。

これは、`tracePropagationTargets` 設定が `traceparent` ヘッダーを介してブラウザ側の span とサーバー側の span を結び付けることで機能します。その結果、ユーザーのクリックからデータベースまでを結ぶ、ひと続きの分散トレースが生成されます。フロントエンドとバックエンドの両方の計装を含む、これが実際にどのように動作するかの詳細な手順については、[OpenTelemetry と ClickStack を用いた NextJS アプリケーションの計装](https://clickhouse.com/blog/instrumenting-nextjs-opentelemetry-clickstack) を参照してください。

<img src={clickpy_trace} alt="ClickStack でセッションリプレイからバックエンドトレースへドリルダウンする例" />

### トレースからセッションへ \{#trace-to-session\}

相関付けは逆方向にも行えます。**Search** ビューでトレースを表示しているときに、そのトレースをクリックしてトレース詳細を開き、**Session Replay** タブを選択すると、そのトレースが記録された時点でユーザーが実際にどのような体験をしていたかを正確に確認できます。これは、エラーや遅いリクエストを調査する際に特に有用で、バックエンド側の問題から調査を開始し、その場ですぐにユーザー視点を確認できます。

<Image img={trace_to_replay} alt="セッションリプレイのトレースビュー" size="lg"/>

## セッションデータの保存方法 \{#data-storage\}

セッションリプレイデータは、ログやトレースとは分離された、ClickHouse 内の専用テーブル [`hyperdx_sessions`](/use-cases/observability/clickstack/ingesting-data/schemas#sessions) に保存されます。各セッションイベントは 1 行として保存され、イベントのペイロードを含む `Body` フィールドと、イベントメタデータを保持する `LogAttributes` マップを持ちます。`Body` カラムと `LogAttributes` カラムを合わせて、リプレイの再構築に使用される実際のセッションイベントの詳細が格納されます。

テーブルスキーマの詳細については、[ClickStack で使用されるテーブルとスキーマ](/use-cases/observability/clickstack/ingesting-data/schemas) を参照してください。

## 試してみる \{#try-it-out\}

セッションリプレイを実際に確認する方法は 2 つあります。

- **ライブデモ** — [clickpy.clickhouse.com](https://clickpy.clickhouse.com) にアクセスしてアプリを操作し、その後 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) の **ClickPy Sessions** ソースから自分のセッションリプレイを確認します。ClickPy がどのようにインストルメントされているかの詳細については、ブログ記事 [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-your-app-with-otel-clickstack) を参照してください。
- **ローカルデモ** — [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo) では、デモアプリケーションに対するインストルメンテーション手順をステップバイステップで解説しており、ローカル環境での ClickStack の実行と、リプレイの確認方法も含まれています。

## 詳細情報 \{#learn-more\}

- [Session Replay デモ](/use-cases/observability/clickstack/example-datasets/session-replay-demo) — 手順付きのインタラクティブなローカルデモアプリケーション
- [Browser SDK リファレンス](/use-cases/observability/clickstack/sdks/browser) — すべての SDK オプション、ソースマップ、カスタムアクション、および高度な設定方法
- [Search](/use-cases/observability/clickstack/search) — セッションやイベントをフィルタリングするための検索構文
- [Dashboards](/use-cases/observability/clickstack/dashboards) — セッションおよびトレースデータから可視化やダッシュボードを構築する方法
- [Alerts](/use-cases/observability/clickstack/alerts) — エラー、レイテンシー、その他のシグナルに対するアラートを設定する方法
- [ClickStack のアーキテクチャ](/use-cases/observability/clickstack/architecture) — ClickHouse、HyperDX、OTel collector がどのように連携するか