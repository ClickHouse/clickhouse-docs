---
sidebar_label: 'リモート MCP サーバー'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud におけるリモート MCP'
description: 'ClickHouse Cloud におけるリモート MCP 機能の説明'
keywords: ['AI', 'ClickHouse Cloud', 'MCP', 'Model Context Protocol', 'リモート MCP']
doc_type: 'reference'
---

# Cloud におけるリモート MCP サーバー \{#remote-mcp-server-in-cloud\}

すべてのユーザーが ClickHouse Cloud コンソールを介して ClickHouse を利用しているわけではありません。
たとえば、多くの開発者は好みのコードエディタや CLI エージェントから直接作業したり、カスタム構成を通じてデータベースに接続したりする一方で、Anthropic Claude のような汎用 AI アシスタントを探索の大部分で利用するユーザーもいます。
これらのユーザーと、その代理として動作するエージェント型ワークロードには、複雑なセットアップや独自のインフラなしで ClickHouse Cloud に安全にアクセスし、クエリを実行する手段が必要です。

ClickHouse Cloud のリモート MCP サーバー機能は、外部エージェントが分析コンテキストを取得するために利用できる標準インターフェースを公開することで、これに対応します。
MCP、つまり Model Context Protocol は、LLM を活用した AI アプリケーションによる構造化データアクセスの標準です。
この統合により、外部エージェントはデータベースとテーブルを一覧表示し、スキーマを確認し、スコープが限定された読み取り専用の SELECT クエリを実行できます。
認証は OAuth を介して処理されます。サーバーは ClickHouse Cloud 上でフルマネージドであるため、セットアップやメンテナンスは不要です。

これにより、エージェント型ツールは ClickHouse により簡単に接続し、分析、要約、コード生成、探索のために必要なデータを取得できます。

## リモートMCPサーバーとオープンソースMCPサーバーの比較 \{#remote-vs-oss\}

ClickHouseは 2 つのMCPサーバーを提供しています。

|             | リモートMCPサーバー (Cloud)                                    | オープンソースMCPサーバー                                                           |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| **ソース**     | ClickHouse Cloud によるフルマネージド                            | GitHub 上の [mcp-clickhouse](https://github.com/ClickHouse/mcp-clickhouse) |
| **トランスポート** | Streamable HTTP (`https://mcp.clickhouse.cloud/mcp`)   | ローカル stdio                                                               |
| **対応対象**    | ClickHouse Cloud のサービス                                 | あらゆる ClickHouse インスタンス (セルフホストまたは Cloud)                                 |
| **認証**      | Cloud の認証情報による OAuth 2.0                               | 環境変数                                                                     |
| **ツール**     | クエリ、スキーマの探索、サービス管理、バックアップ、ClickPipes、請求をカバーする 13 個のツール | 3 個のツール: `run_select_query`, `list_databases`, `list_tables`             |
| **セットアップ**  | インストールは不要です。MCPクライアントでエンドポイントを指定し、認証します。               | サーバーをローカルにインストールして実行                                                     |

リモートMCPサーバーは、ClickHouse Cloud との最も充実した統合を提供します。インフラを管理することなく、サービス管理、バックアップのモニタリング、ClickPipe の可視性、請求データを利用できます。
セルフホストの ClickHouse インスタンスについては、[オープンソースMCPサーバーのガイド](/use-cases/AI/MCP)を参照してください。

## リモートMCPサーバーの有効化 \{#enabling\}

リモートMCPサーバーが接続を受け付けられるようにするには、事前にサービスごとに有効化する必要があります。
ClickHouse Cloud コンソールで対象のサービスを開き、**Connect** ボタンをクリックして **MCP** を選択し、有効化します。
スクリーンショット付きの詳しい手順については、[セットアップガイド](/use-cases/AI/MCP/remote_mcp#enable-remote-mcp-server)を参照してください。

## エンドポイント \{#endpoint\}

有効化すると、リモートMCPサーバーは次のURLで利用できます。

```text
https://mcp.clickhouse.cloud/mcp
```

## 認証 \{#authentication\}

リモートMCPサーバーへのすべてのアクセスは、OAuth 2.0 によって認証されます。
MCPクライアントが初めて接続すると、OAuthフローが開始され、ユーザーが ClickHouse Cloud の認証情報でサインインするためのブラウザーウィンドウが開きます。
アクセスできる範囲は、認証されたユーザーにアクセス権限がある組織とサービスに限定されます。追加の API key の設定は不要です。

## 安全性 \{#safety\}

リモートMCPサーバーで公開されるすべてのツールは**読み取り専用**です。各ツールのMCPメタデータには `readOnlyHint: true` が付与されています。データの変更、サービス設定の変更、破壊的な操作を実行できるツールはありません。

## 利用可能なツール \{#available-tools\}

リモートMCPサーバーは、次のカテゴリに分類された 13 個のツールを提供しています。

### クエリとスキーマの探索 \{#query-and-schema\}

これらのツールを使うと、エージェントは利用可能なデータを把握し、分析用のクエリを実行できます。

| Tool               | 説明                                  | パラメータ                                                                             |
| ------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `run_select_query` | ClickHouseサービスに対して、読み取り専用の SELECT クエリを実行します。 | `query` (有効な ClickHouse SQL SELECT クエリ) 、`serviceId`                                   |
| `list_databases`   | ClickHouseサービスで利用可能なすべてのデータベースを一覧表示します。      | `serviceId`                                                                            |
| `list_tables`      | データベース内のすべてのテーブルを、カラム定義を含めて一覧表示します。          | `serviceId`、`database`、必要に応じて `like` または `notLike` (テーブル名をフィルタリングするための SQL LIKE パターン)  |

### 組織 \{#organizations\}

| Tool                       | 説明                                              | パラメータ            |
| -------------------------- | ----------------------------------------------- | ---------------- |
| `get_organizations`        | 認証済みユーザーがアクセスできるすべての ClickHouse Cloud 組織を取得します。 | なし               |
| `get_organization_details` | 1 つの組織の詳細を返します。                                 | `organizationId` |

### サービス \{#services\}

| ツール                   | 説明                                      | パラメータ                         |
| --------------------- | --------------------------------------- | ----------------------------- |
| `get_services_list`   | ClickHouse Cloud 組織内のすべてのサービスの一覧を取得します。 | `organizationId`              |
| `get_service_details` | 特定のサービスの詳細を取得します。                       | `organizationId`; `serviceId` |

### バックアップ \{#backups\}

| Tool                               | 説明                                    | パラメータ                                     |
| ---------------------------------- | ------------------------------------- | ----------------------------------------- |
| `list_service_backups`             | サービスのすべてのバックアップを、最新のものから順に一覧表示します。    | `organizationId`; `serviceId`             |
| `get_service_backup_details`       | 1 つのバックアップの詳細を返します。                   | `organizationId`; `serviceId`; `backupId` |
| `get_service_backup_configuration` | サービスのバックアップ設定 (スケジュールと保持期間の設定) を返します。 | `organizationId`; `serviceId`             |

### ClickPipes \{#clickpipes\}

| Tool              | 説明                                    | パラメータ                                        |
| ----------------- | ------------------------------------- | -------------------------------------------- |
| `list_clickpipes` | サービスに設定されているすべての ClickPipes を一覧表示します。 | `organizationId`; `serviceId`                |
| `get_clickpipe`   | 特定の ClickPipe の詳細を取得します。              | `organizationId`; `serviceId`; `clickPipeId` |

### 請求 \{#billing\}

| Tool                    | 説明                                                   | パラメータ                                                                 |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| `get_organization_cost` | 組織の請求および利用コストのデータを取得します。総額と、エンティティごとの日次コストレコードを返します。 | `organizationId`; 任意で `from_date` と `to_date` (YYYY-MM-DD、最大31日間の範囲)  |

## 利用開始 \{#getting-started\}

リモートMCPサーバーを有効化し、MCPクライアントに接続するための手順については、[セットアップガイド](/use-cases/AI/MCP/remote_mcp)を参照してください。