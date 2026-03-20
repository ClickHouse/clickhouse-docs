---
sidebar_label: 'リモート MCP サーバー'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud におけるリモート MCP'
description: 'ClickHouse Cloud におけるリモート MCP 機能の説明'
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

詳細については、[guides](/use-cases/AI/MCP/remote_mcp) セクションを参照してください。