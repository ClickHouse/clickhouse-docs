---
sidebar_label: 'リモート MCP サーバー'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud におけるリモート MCP'
description: 'ClickHouse Cloud におけるリモート MCP 機能の説明'
doc_type: 'reference'
---

# ClickHouse Cloud 上のリモート MCP サーバー {#remote-mcp-server-in-cloud}

すべてのユーザーが ClickHouse Cloud コンソール経由で ClickHouse を操作するわけではありません。
たとえば、多くの開発者は好みのコードエディタや CLI エージェントから直接作業したり、カスタムセットアップを通じてデータベースに接続したりします。また、Anthropic Claude のような汎用 AI アシスタントに、探索や試行の多くを任せているユーザーもいます。
これらのユーザーと、その代理として動作するエージェント指向のワークロードには、複雑なセットアップやカスタムインフラなしに、ClickHouse Cloud に安全にアクセスしクエリを実行する手段が必要です。

ClickHouse Cloud のリモート MCP サーバー機能は、外部エージェントが分析コンテキストを取得するために利用できる標準インターフェースを公開することで、このニーズに対応します。
MCP（Model Context Protocol）は、LLM を活用する AI アプリケーションによる構造化データアクセスのための標準です。
この連携により、外部エージェントはデータベースやテーブルの一覧取得、スキーマの確認、範囲が限定された読み取り専用の SELECT クエリの実行が可能になります。
認証は OAuth を通じて処理され、サーバーは ClickHouse Cloud 上でフルマネージドで提供されるため、セットアップや保守は一切不要です。

これにより、エージェント型ツールは ClickHouse に容易に連携し、必要なデータを取得できるようになり、分析、要約、コード生成、探索などの用途に活用できます。

詳細については、[guides](/use-cases/AI/MCP/remote_mcp) セクションを参照してください。