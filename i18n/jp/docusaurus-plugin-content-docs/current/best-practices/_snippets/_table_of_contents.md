| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [主キーの選択](/best-practices/choosing-a-primary-key)                               | クエリ性能を最大化し、ストレージのオーバーヘッドを最小化する主キーの選択方法。                           |
| [データ型の選択](/best-practices/select-data-types)                                  | メモリ使用量を削減し、圧縮率を高め、クエリを高速化する最適なデータ型の選択。                             |
| [マテリアライズドビューの活用](/best-practices/use-materialized-views)              | マテリアライズドビューを利用してデータを事前集計し、分析クエリを大幅に高速化する方法。                   |
| [JOIN の最小化と最適化](/best-practices/minimize-optimize-joins)                    | ClickHouse の `JOIN` 機能を効率的に利用するためのベストプラクティス。                                   |
| [パーティションキーの選択](/best-practices/choosing-a-partitioning-key)             | 効率的なデータプルーニングと高速なクエリ実行を可能にするパーティション戦略の選択。                       |
| [挿入戦略の選定](/best-practices/selecting-an-insert-strategy)                      | 適切な挿入パターンによりデータ取り込みスループットを最適化し、リソース消費を削減する方法。               |
| [データスキッピングインデックス](/best-practices/use-data-skipping-indices-where-appropriate) | セカンダリインデックスを戦略的に適用し、不要なデータブロックをスキップしてフィルタ付きクエリを高速化。   |
| [ミューテーションの回避](/best-practices/avoid-mutations)                          | コストの高い `UPDATE`/`DELETE` 操作を排除し、性能を向上させるスキーマとワークフローの設計。              |
| [OPTIMIZE FINAL の回避](/best-practices/avoid-optimize-final)                       | `OPTIMIZE FINAL` が有益以上に悪影響を与えるケースを理解し、性能ボトルネックを防止。                      |
| [JSON を適切に利用する](/best-practices/use-json-where-appropriate)                 | ClickHouse で半構造化 JSON データを扱う際に、柔軟性と性能のバランスを取る方法。                          |