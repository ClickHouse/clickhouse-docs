---
slug: /integrations/postgresql/inserting-data
title: PostgreSQL からデータを挿入する方法
keywords: [postgres, postgresql, inserts]
---

ClickHouse にデータを挿入する際のベストプラクティスについては、[このガイド](/guides/inserting-data)を読むことをお勧めします。挿入性能を最適化するための情報が得られます。

PostgreSQL からのデータのバルクロードに関して、ユーザーは以下の方法を利用できます：

- 管理型の統合サービスである [ClickPipes](/integrations/clickpipes/postgres) を使用する - 現在プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)。
- `PeerDB by ClickHouse`、PostgreSQL データベースのレプリケーションのために特別に設計された ETL ツールであり、セルフホステッドの ClickHouse と ClickHouse Cloud の両方に対応しています。
    - PeerDB は現在 ClickHouse Cloud にネイティブで利用可能です - 私たちの [新しい ClickPipe コネクタ](/integrations/clickpipes/postgres) による、ブレイジングファーストの Postgres から ClickHouse への CDC - 現在プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)。
- データを直接読み込むための [Postgres テーブル関数](/sql-reference/table-functions/postgresql) を使用します。これは、タイムスタンプなどの既知のウォーターマークに基づくバッチレプリケーションが十分である場合や、一度限りの移行の場合に適しています。このアプローチは、数千万行規模にスケールすることができます。より大規模なデータセットを移行する場合は、それぞれのデータのチャンクを処理する複数のリクエストを考慮してください。各チャンクの前にステージングテーブルを使用し、最終テーブルにパーティションが移動されることを許可します。これにより、失敗したリクエストを再試行することができます。このバルクローディング戦略の詳細については、こちらを参照してください。
- データは CSV 形式で Postgres からエクスポートできます。その後、ローカルファイルまたはオブジェクトストレージを介してテーブル関数を使用して ClickHouse に挿入できます。
