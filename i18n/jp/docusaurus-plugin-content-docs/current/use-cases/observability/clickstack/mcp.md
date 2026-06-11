---
slug: /use-cases/observability/clickstack/mcp
title: 'ClickStack MCPサーバー'
sidebar_label: 'MCPサーバー'
pagination_prev: null
pagination_next: null
description: 'Model Context Protocol（MCP）サーバーを使用してAIアシスタントをClickStackに接続します'
doc_type: 'guide'
keywords: ['ClickStack', 'MCP', 'Model Context Protocol', 'AI', 'オブザーバビリティ', 'HyperDX', 'Claude', 'Cursor']
---

import Image from '@theme/IdealImage';
import api_key from '@site/static/images/clickstack/api-key-personal.png';

ClickStack には、AI アシスタントがオブザーバビリティデータを操作できる組み込みの [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) サーバーが含まれています。接続すると、AI アシスタントは自然言語を通じて、ログ、トレース、メトリクスのクエリ、ダッシュボードやアラートの管理、データソースの探索、保存済み検索の利用を行えます。

これにより、[Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://www.cursor.com/)、または任意の MCP 対応クライアントを使用して、開発環境を離れることなく、インシデントの調査、ダッシュボードの作成、オブザーバビリティ設定の管理を行えます。

## 提供状況 \{#availability\}

MCPサーバーは、以下の ClickStack のデプロイメントタイプで利用できます。

| デプロイメント                                           | ステータス   |
| ------------------------------------------------- | ------- |
| **Open Source ClickStack**                        | 利用可能    |
| **BYOC (Bring Your Own Cloud)**                   | 利用可能    |
| **Managed ClickStack**                            | 近日対応予定  |
| **HyperDX v1** ([hyperdx.io](https://hyperdx.io)) | サポート対象外 |

:::note[Managed ClickStack]
Managed ClickStack 向けの MCPサーバーサポートは現在開発中で、近日中に利用可能になる予定です。このページの手順は、Open Source および BYOC のデプロイメントに適用されます。
:::

## 前提条件 \{#prerequisites\}

MCP クライアントを接続する前に、以下を用意してください。

* 稼働中の ClickStack インスタンス (セットアップ方法については、[デプロイメント](/use-cases/observability/clickstack/deployment)を参照してください)
* **Personal API Access Key** — HyperDX の **Team Settings → API Keys → Personal API Access Key** で確認できます

<Image img={api_key} alt="Team Settings 内の Personal API Access Key" size="md" border />

:::note
Personal API Access Key は、Team Settings にある **インジェスト API key** とは異なります。インジェスト API key は、OpenTelemetry collector に送信されるテレメトリー データを認証するために使用されます。
:::

## エンドポイント \{#endpoint\}

MCPサーバーは、ClickStack のフロントエンド URL の `/api/mcp` パスで利用できます。

たとえば、デフォルトのローカルデプロイメントでは次のとおりです。

デフォルト設定を変更している場合は、`localhost:8080` をご利用のインスタンスのホスト名とポートに置き換えてください。

:::note
このページの例では、フロントエンドアプリの URL (デフォルトではポート `8080`) を使用します。`<BACKEND_URL>/mcp` を使ってバックエンド経由で MCPサーバーに直接アクセスすることもできますが、すべてのデプロイメントでバックエンドが公開されているわけではないため、このドキュメントではフロントエンドのパスを使用しています。
:::

MCPサーバーは、**Streamable HTTP** トランスポートと **Bearer token** 認証を使用します。

## MCPクライアントに接続する \{#connecting-a-client\}

以下の例では、代表的なMCPクライアントの設定方法を示します。`<YOUR_CLICKSTACK_URL>` はご利用のインスタンスのURL (例: `http://localhost:8080`) に、`<YOUR_API_KEY>` はPersonal API Access Keyに置き換えてください。

### Claude Code \{#claude-code\}

```shell
claude mcp add --transport http hyperdx <YOUR_CLICKSTACK_URL>/api/mcp \
  --header "Authorization: Bearer <YOUR_API_KEY>"
```

### Cursor \{#cursor\}

プロジェクトの `.cursor/mcp.json` または Cursor のグローバル設定に、以下を追加します。

```json
{
  "mcpServers": {
    "hyperdx": {
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### OpenCode \{#opencode\}

次の内容を `opencode.json` の設定に追加してください:

```json
{
  "mcp": {
    "hyperdx": {
      "type": "http",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

### その他のクライアント \{#other-clients\}

**Streamable HTTP** トランスポートをサポートする MCP クライアントであれば接続できます。以下のように設定します。

* **URL:** `<YOUR_CLICKSTACK_URL>/api/mcp`
* **ヘッダー:** `Authorization: Bearer <YOUR_API_KEY>`

## MCP で何ができますか？ \{#capabilities\}

接続すると、AI アシスタントは ClickStack の中核領域にまたがるさまざまなツールを利用できます。これには次が含まれます。

* **データのクエリ** — ClickStack のクエリビルダー、検索構文、または生の SQL を使用して、ログ、トレース、メトリクスを検索および集計します。
* **データソース** — 利用可能なデータソース、データベース接続、カラムスキーマ、属性キーを一覧表示します。
* **ダッシュボード** — ダッシュボードとそのタイルを作成、更新、削除、確認します。
* **アラート** — アラートを作成、更新、確認し、その評価履歴も確認します。
* **保存済み検索** — 再利用可能な保存済み検索定義を作成、更新、確認します。
* **Webhook** — アラート通知に使用できる webhook 宛先を一覧表示します。
* **チーム** — 現在のユーザーが所属しているチームを一覧表示し、アクティブなチームを特定します。

利用可能なツールの具体的な構成は、今後拡張される可能性があります。MCP クライアントは、接続時に利用可能なツールを自動的に検出します。

## 複数チームでの利用 \{#multi-team\}

デフォルトでは、MCP リクエストはプライマリチームのコンテキストで処理されます。複数のチームに所属している場合は、`Authorization` ヘッダーに加えて、チーム ID を設定した `x-hdx-team` ヘッダーを渡すことで、対象のチームを指定できます。ヘッダーを省略した場合は、プライマリチームが使用されます。所属していないチームを指定すると、リクエストは `401` エラーで拒否されます。

アクセス可能なチームと現在アクティブなチームを確認するには、MCP クライアントのチーム一覧表示ツールを使用してください。

## トラブルシューティング \{#troubleshooting\}

<details>
  <summary>403 認証エラーが発生します</summary>

  * **Personal API Access Key** を使用していることを確認してください (**インジェスト API key** ではありません) 。
  * `Authorization` ヘッダーに `Bearer` トークンとしてキーが含まれていることを確認してください。
  * ClickStack インスタンスが実行中で、設定した URL でアクセス可能であることを確認してください。
</details>

<details>
  <summary>レート制限がかかっています</summary>

  MCPサーバーでは、ユーザーごとに**1 分あたり 600 リクエスト**のレート制限を設けています。この制限を超えると、リクエストは一時的に拒否されます。リクエストの頻度を下げるか、しばらく待ってから再試行してください。
</details>

<details>
  <summary>`x-hdx-team` ヘッダーで 401 エラーが発生します</summary>

  チーム ID が正しいこと、およびご利用のユーザーアカウントがそのチームのメンバーであることを確認してください。
</details>

<details>
  <summary>MCPサーバーに接続できません</summary>

  * 使用している MCP クライアントが **Streamable HTTP** トランスポートに対応していることを確認してください。stdio トランスポートのみに対応している古いクライアントは動作しません。
  * ClickStack をローカルで実行している場合は、設定した URL でアプリにアクセスできることを確認してください (デフォルトは `http://localhost:8080` です) 。
  * ロードバランサーまたはリバースプロキシの背後で BYOC デプロイメントを実行している場合は、`/api/mcp` パスがブロックまたは書き換えされていないことを確認してください。
</details>