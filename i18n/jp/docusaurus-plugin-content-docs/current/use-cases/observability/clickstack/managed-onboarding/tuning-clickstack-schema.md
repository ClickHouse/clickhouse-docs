---
slug: /use-cases/observability/clickstack/tuning-clickstack-schema
title: 'Managed ClickStack のチューニング: スキーマの最適化'
description: 'Managed ClickStack でクエリパフォーマンスとストレージ効率を向上させるために ClickStack のスキーマを最適化します'
doc_type: 'guide'
keywords: ['clickstack', 'チューニング', 'スキーマ', 'managed', 'オブザーバビリティ', 'performance', '最適化', 'storage']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

ClickStack をしばらく運用しているなら、デフォルトのスキーマがほとんどのオブザーバビリティ ワークロードを変更なしで処理できることに、すでに気付いているでしょう。このページは、それでは足りなくなったときのためのものです。クエリレイテンシが悪化し始めたり、アクセスパターンがデフォルトからずれてきたりした場合に役立ちます。

実際に効果のある改善の大半は、4 つの最適化でカバーできます。おおむね作業量の少ない順に並べています。最初の 2 つは、段階的に適用できるローカルな `ALTER TABLE` の変更です。3 つ目は、同じ集計がダッシュボード上で何度も実行される場合に効果を発揮します。4 つ目はテーブル移行が必要なため、最も手間がかかります。

以下の要約は、意図的に簡潔にしています。各変更の背景、ベンチマーク、既存データへ適用するための手順については、[パフォーマンスチューニング](/use-cases/observability/clickstack/performance_tuning) を参照してください。

<VerticalStepper headerLevel="h2">
  ## よくクエリする属性をマテリアライズする \{#materialize-attributes\}

  `LogAttributes['service.version']` でフィルタすると、ClickHouse は調べる各行について `LogAttributes` Map 全体を読み込んでデコードする必要があります。この属性を `MATERIALIZED` カラムに昇格させると、同じフィルタはカラムの読み取りになり、通常は桁違いに高速になります。カラムが作成されると、ClickStack がフィルタを自動的に書き換えるため、保存済み検索やダッシュボードは変更なしでそのまま動作します。

  実際によくクエリする属性だけを選んでください。materialized column にはそれぞれストレージと insert time のコストがかかるため、「すべてを昇格させる」のではなく「使うものだけを昇格させる」べきです。

  ```sql
  ALTER TABLE otel_logs
    ADD COLUMN ServiceVersion LowCardinality(String)
    MATERIALIZED LogAttributes['service.version'];
  ```

  既存の行では、`ALTER TABLE otel_logs MATERIALIZE COLUMN ServiceVersion` も実行するまで、新しいカラムは空のままです。

  詳しくは: [よくクエリする属性をマテリアライズする](/use-cases/observability/clickstack/performance_tuning#materialize-frequently-queried-attributes)。

  ## スキップ索引を追加する \{#add-skip-indexes\}

  スキップ索引を使うと、ClickHouse はフィルタに一致しないデータ granule を除外できるため、スキャンを小さく対象を絞った読み取りに変えられます。押さえておきたい型は 3 つあります。

  * **テキスト索引** (`text(tokenizer = ...)`) は、文字列カラムと `mapKeys`/`*AttributeItems` 配列に使います。デフォルトのログスキーマには、すでにこれらが含まれています。
  * **Min-max 索引** は、範囲条件でフィルタする数値カラムに使います。代表的なのはトレースの `Duration` です。
  * **ブルームフィルタ** は、まだテキスト索引をサポートしていない ClickHouse バージョンで、高カーディナリティの等価ルックアップに使います。

  ```sql
  ALTER TABLE otel_traces ADD INDEX idx_duration Duration TYPE minmax GRANULARITY 1;
  ALTER TABLE otel_traces MATERIALIZE INDEX idx_duration;
  ```

  スキップ索引は、実際に granule を間引ける場合にだけ、評価コストに見合います。効果があったと決めつける前に、代表的なクエリに対して `EXPLAIN indexes = 1` で確認してください。

  詳しくは: [スキップ索引の追加](/use-cases/observability/clickstack/performance_tuning#adding-skip-indexes)。

  ## 繰り返し使う集計を事前計算する \{#materialized-views\}

  同じ集計がダッシュボードで何度も実行される場合 (エラー率別の上位サービス、エンドポイントごとの p99 レイテンシ、1 分ごとのリクエスト数など) 、materialized view は結果を insert time に計算し、小さなロールアップテーブルに書き込みます。するとダッシュボードは生のログやトレースではなくロールアップを参照するようになり、コストを大幅に抑えられます。

  これは、ダッシュボードの利用頻度が高く、基になるテーブルが大きい場合に効果を発揮します。代わりに、insert time の CPU コストと、維持する 2 つ目のテーブルが必要になります。

  詳しくは: [materialized view の活用](/use-cases/observability/clickstack/performance_tuning#exploiting-materialized-views)。

  ## アクセスパターンに合った主キーを選ぶ \{#choose-primary-key\}

  主キーは、行がディスク上でどのようにソートされるかを決めます。そのキーの先頭カラムに対するフィルタであれば、ClickHouse は関連する領域へ直接 seek できます。一方、それらのカラムが先頭に来ないフィルタでは、パーティション全体をスキャンします。

  デフォルトのログキー `(toStartOfFiveMinutes(Timestamp), ServiceName, Timestamp)` は、「サービス X について直近 N 分間に何が起きたか」というクエリに向いています。ほとんどのクエリが別のカラム (tenant id、customer id、region など) から始まるなら、主キーの先頭をそのカラムに変えることが、最も効果の大きい変更になります。

  ```sql
  CREATE TABLE otel_logs_v2
  (
    -- otel_logs と同じカラム
  )
  ENGINE = MergeTree
  ORDER BY (TenantId, ServiceName, Timestamp);
  ```

  ClickHouse では主キーをその場で編集できないため、これは単純な `ALTER` ではなくテーブル移行になります。パフォーマンスチューニングガイドでは、新しいテーブルの作成、インジェスト先の切り替え、そして既存のダッシュボードが旧データと新データの両方でそのまま動作し続けるよう `Merge` テーブルを使う方法を説明しています。

  詳しくは: [主キーの変更](/use-cases/observability/clickstack/performance_tuning#modifying-the-primary-key)。
</VerticalStepper>

## 参考資料 \{#further-reading\}

* [パフォーマンスチューニング](/use-cases/observability/clickstack/performance_tuning): プロジェクションと行ルックアップの高速化を含む完全ガイド。
* [ClickStack で使用されるテーブルとスキーマ](/use-cases/observability/clickstack/ingesting-data/schemas): これらの最適化の基盤となる標準的な DDL。
* [本番環境への移行](/use-cases/observability/clickstack/production): 本番運用に関する、より広範な推奨事項。