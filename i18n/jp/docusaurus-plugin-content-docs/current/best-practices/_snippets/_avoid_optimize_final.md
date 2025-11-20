import Image from '@theme/IdealImage';
import simple_merges from '@site/static/images/bestpractices/simple_merges.png';

**MergeTree エンジン** を使用する ClickHouse テーブルは、データをディスク上に **不変なパーツ** として保存しており、これはデータが挿入されるたびに作成されます。

各挿入処理では、ソートおよび圧縮されたカラムファイルと、インデックスやチェックサムなどのメタデータを含む新しいパーツが作成されます。パーツ構造の詳細およびその形成方法については、この[ガイド](/parts)を参照することを推奨します。

時間の経過とともに、バックグラウンド処理によって小さなパーツがより大きなパーツへとマージされ、断片化が軽減されるとともにクエリ性能が向上します。

<Image img={simple_merges} size="md" alt="Simple merges" />

次のようにしてこのマージを手動でトリガーしたくなるかもしれませんが、

```sql
OPTIMIZE TABLE <table> FINAL;
```

**ほとんどの場合、`OPTIMIZE FINAL` 操作は実行を避けるべきです**。この操作はリソースを多く消費する処理を開始し、クラスタのパフォーマンスに影響を与える可能性があります。

:::note OPTIMIZE FINAL vs FINAL
`OPTIMIZE FINAL` は `FINAL` とは異なります。`ReplacingMergeTree` のように、重複のない結果を得るために `FINAL` の使用が必要になるケースもあります。一般的には、クエリがプライマリキーと同じ列でフィルタしている場合、`FINAL` を使用しても問題ありません。
:::


## なぜ避けるべきか？ {#why-avoid}

### コストが高い {#its-expensive}

`OPTIMIZE FINAL`を実行すると、大規模なマージがすでに発生している場合でも、ClickHouseは**すべて**のアクティブなパートを**単一のパート**に強制的にマージします。これには以下の処理が含まれます：

1. すべてのパートの**解凍**
2. データの**マージ**
3. 再度の**圧縮**
4. 最終パートのディスクまたはオブジェクトストレージへの**書き込み**

これらの処理は**CPUとI/Oを大量に消費**し、特に大規模なデータセットが関与する場合、システムに大きな負荷をかける可能性があります。

### 安全制限を無視する {#it-ignores-safety-limits}

通常、ClickHouseは約150GBを超えるパートのマージを回避します（[max_bytes_to_merge_at_max_space_in_pool](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)で設定可能）。しかし、`OPTIMIZE FINAL`は**この安全機構を無視**するため、以下のような問題が発生します：

- **複数の150GBパート**を1つの巨大なパートにマージしようとする可能性がある
- これにより**長時間のマージ**、**メモリ圧迫**、さらには**メモリ不足エラー**が発生する可能性がある
- これらの大きなパートはマージが困難になる可能性があり、上記の理由によりさらなるマージの試みが失敗します。正しいクエリ実行時の動作にマージが必要な場合、[ReplacingMergeTreeで重複が蓄積する](/guides/developer/deduplication#using-replacingmergetree-for-upserts)などの望ましくない結果を招き、クエリ実行時のパフォーマンスを低下させる可能性があります。


## バックグラウンドマージに任せる {#let-background-merges-do-the-work}

ClickHouseは、ストレージとクエリ効率を最適化するために、スマートなバックグラウンドマージを自動的に実行します。これらは段階的に行われ、リソース使用量を考慮し、設定された閾値を遵守します。非常に特定のニーズ(例: テーブルの凍結やエクスポート前のデータ確定)がない限り、**ClickHouseにマージを自動管理させる方が適切です**。
