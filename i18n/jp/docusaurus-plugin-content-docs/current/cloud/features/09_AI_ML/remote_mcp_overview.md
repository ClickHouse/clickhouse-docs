---
sidebar_label: 'リモート MCP サーバー'
slug: /cloud/features/ai-ml/remote-mcp
title: 'Cloud におけるリモート MCP'
description: 'ClickHouse Cloud におけるリモート MCP 機能の説明'
doc_type: 'reference'
---

# Cloud でのリモート MCP サーバー \{#remote-mcp-server-in-cloud\}

すべてのユーザーが ClickHouse Cloud コンソール経由で ClickHouse を操作しているわけではありません。
たとえば、多くの開発者は自分の好みのコードエディタや CLI エージェントから直接作業したり、カスタムセットアップ経由でデータベースに接続したりする一方で、別のユーザーは Anthropic Claude のような汎用 AI アシスタントに大半の探索作業を委ねています。
これらのユーザーと、その代理として動作するエージェント型ワークロードは、複雑なセットアップや独自インフラなしに、ClickHouse Cloud へ安全にアクセスしクエリを実行する手段を必要としています。

ClickHouse Cloud のリモート MCP サーバー機能は、外部エージェントが分析コンテキストを取得するために利用できる標準インターフェースを公開することで、これに対応します。
MCP（Model Context Protocol）は、LLM を利用する AI アプリケーションによる構造化データアクセスのための標準仕様です。
この連携により、外部エージェントはデータベースおよびテーブルの一覧取得、スキーマの確認、スコープの限定された読み取り専用の SELECT クエリの実行が可能になります。
認証は OAuth によって処理され、サーバーは ClickHouse Cloud 上で完全マネージドとして提供されるため、セットアップや運用管理は不要です。

これにより、エージェント型ツールは ClickHouse に容易に接続し、分析、要約、コード生成、探索などの目的で必要なデータを取得できるようになります。

詳細については、[ガイド](/use-cases/AI/MCP/remote_mcp) セクションを参照してください。