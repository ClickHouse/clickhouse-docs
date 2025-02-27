---
slug: /integrations/postgresql/inserting-data
title: PostgreSQL からデータを挿入する方法
keywords: [postgres, postgresql, inserts]
---

We recommend reading [このガイド](/guides/inserting-data) to learn best practices on inserting data to ClickHouse to optimize for insert performance.

For bulk loading data from PostgreSQL, users can use:

- [ClickPipes](/integrations/clickpipes/postgres)を利用することができます。これは ClickHouse Cloud のためのセルフマネージドインテグレーションサービスで、現在プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)。
- `PeerDB by ClickHouse`、PostgreSQL データベースのレプリケーションのために特別に設計された ETL ツールで、セルフホスティングの ClickHouse と ClickHouse Cloud の両方に対応しています。
    - PeerDB は現在 ClickHouse Cloud でネイティブに利用可能です - 新しい ClickPipe コネクタを使用した迅速な Postgres から ClickHouse への CDC がプライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)。
- [Postgres テーブル関数](/sql-reference/table-functions/postgresql)を使用して、データを直接読み取ることができます。これは、既知のウォーターマーク（例：タイムスタンプ）に基づくバッチレプリケーションが十分であるか、一次的な移行である場合に一般的に適切です。このアプローチは、1,000 万行規模にもスケールします。より大きなデータセットを移行しようとしているユーザーは、各リクエストがデータのチャンクを処理する複数のリクエストを考慮すべきです。最終テーブルにパーティションを移動する前に、各チャンクのためのステージングテーブルを使用できます。これにより、失敗したリクエストを再試行することができます。このバルクローディング戦略の詳細については、こちらをご覧ください。
- データは Postgres から CSV 形式でエクスポートできます。これをクリックハウスに挿入することができ、ローカルファイルまたはオブジェクトストレージを介してテーブル関数を使用して行うことができます。
