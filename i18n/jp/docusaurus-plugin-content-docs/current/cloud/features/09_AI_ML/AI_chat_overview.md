---
sidebar_label: 'Ask AI エージェントに質問'
slug: /cloud/features/ai-ml/ask-ai
title: 'Cloud で Ask AI エージェントに質問する'
description: 'ClickHouse Cloud における Ask AI チャット機能の説明'
doc_type: 'reference'
---

# Cloud で Ask AI エージェントを利用する \{#ask-ai-agent-in-cloud\}

「Ask AI」エージェントは、ClickHouse Cloud サービス上にホストされているデータに対して複雑な分析タスクを実行できる、すぐに利用可能なターンキー型の機能です。
ユーザーは SQL を書いたりダッシュボードを操作したりする代わりに、求めている内容を自然言語で記述できます。
アシスタントはクエリや可視化、サマリを生成して返し、アクティブなタブ、保存済みクエリ、スキーマの詳細、ダッシュボードといったコンテキストを考慮して精度を高めます。
質問からインサイトへ、プロンプトから稼働中のダッシュボードや API へと素早く到達できるように設計された、埋め込み型アシスタントです。

この機能には、コンソールから直接 ClickHouse ドキュメントに関する個別の質問を行うための「Docs AI」サブエージェントも組み込まれています。
何百ページものドキュメントを検索する代わりに、「How do I configure materialized views?」や「What&#39;s the difference between ReplacingMergeTree and AggregatingMergeTree?」のような直接的な質問を行い、関連するコード例やソースドキュメントへのリンク付きで、正確な回答を受け取ることができます。

詳細については [guides](/use-cases/AI_ML/AIChat) セクションを参照してください。