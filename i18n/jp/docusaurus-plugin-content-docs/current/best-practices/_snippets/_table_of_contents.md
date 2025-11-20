| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)                     | クエリ性能を最大化し、ストレージのオーバーヘッドを最小化できる主キーの選び方。                         |
| [Select Data Types](/best-practices/select-data-types)                               | メモリ使用量を抑え、圧縮を向上し、クエリを高速化する最適なデータ型の選び方。                           |
| [Use Materialized Views](/best-practices/use-materialized-views)                     | マテリアライズドビューを活用してデータを事前集計し、分析クエリを大幅に高速化する方法。                  |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)               | ClickHouse の `JOIN` 機能を効率的に利用するためのベストプラクティス。                                   |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key)           | 効率的なデータプルーニングと高速なクエリ実行を可能にするパーティションキー／戦略の選び方。             |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy)         | 適切な INSERT パターンによりデータ投入スループットを最適化し、リソース消費を抑える方法。              |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | セカンダリインデックスを戦略的に活用し、不要なデータブロックをスキップしてフィルタ付きクエリを高速化。 |
| [Avoid Mutations](/best-practices/avoid-mutations)                                   | 高コストな `UPDATE`／`DELETE` 操作を不要にするスキーマ設計とワークフローにより、性能を向上させる方法。 |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | `OPTIMIZE FINAL` が効果より悪影響のほうが大きくなるケースを理解し、性能ボトルネックを回避する方法。   |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate)             | ClickHouse で半構造化 JSON データを扱う際に、柔軟性と性能のバランスを取る方法。                         |