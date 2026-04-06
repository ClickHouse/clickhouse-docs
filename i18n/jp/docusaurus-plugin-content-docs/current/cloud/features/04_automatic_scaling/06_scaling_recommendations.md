---
sidebar_position: 6
sidebar_label: 'スケーリングの推奨事項'
slug: /cloud/features/autoscaling/scaling-recommendations
description: 'ClickHouse Cloud のスケーリングの推奨事項を理解する'
keywords: ['scaling recommendations', 'recommender', '2-window', 'autoscaling', 'optimization']
title: 'スケーリングの推奨事項'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import two_window_recommender from '@site/static/images/cloud/features/autoscaling/two-window-recommender.png';

## はじめに \{#introduction\}

データベースリソースのオートスケーリングでは、慎重なバランスが求められます。スケールアップが遅すぎるとパフォーマンス低下のリスクがあり、逆にスケールダウンを急激に行いすぎると、スケーリングの揺り戻しが絶えず発生するおそれがあります。

ClickHouse Cloud では、2 つのウィンドウに基づく推奨フレームワークと、ターゲット追跡型の CPU 推奨システムを組み合わせることで、変動するワークロードに対して、プロダクションデータベースに必要な安定性を維持しながら、より迅速なスケールダウン、スケーリングの揺り戻しの最小化、インフラストラクチャコストの大幅な削減を実現します。

## CPU ベースのスケーリング \{#cpu-based-scaling\}

CPU スケーリングはターゲットトラッキングに基づいており、使用率を目標レベルに維持するために必要な CPU 割り当て量を正確に算出します。スケーリング アクションがトリガーされるのは、現在の CPU 使用率が設定された範囲を外れた場合のみです。

| Parameter | Value | Meaning                      |
| --------- | ----- | ---------------------------- |
| 目標使用率     | 53%   | ClickHouse が維持を目指す使用率レベル     |
| 上限しきい値    | 75%   | CPU がこのしきい値を超えるとスケールアップをトリガー |
| 下限しきい値    | 37.5% | CPU がこのしきい値を下回るとスケールダウンをトリガー |

レコメンダーは過去の使用実績に基づいて CPU 使用率を評価し、次の式を使用して推奨 CPU サイズを決定します。

```text
recommended_cpu = max_cpu_usage / target_utilization
```

CPU 使用率が割り当て容量の 37.5%～75% の範囲内であれば、スケーリングは行われません。この範囲を外れると、レコメンダーは使用率が 53% に戻るように必要な正確なサイズを算出し、それに応じてサービスがスケーリングされます.

### 例 \{#cpu-scaling-example\}

4 vCPU が割り当てられたサービスで、使用量が 3.8 vCPU (使用率約 95%) まで急増し、75% の高水位を超えたとします。
レコメンダーは次のように計算します: `3.8 / 0.53 ≈ 7.2 vCPU`。そして、次に利用可能なサイズ (8 vCPU) に切り上げます。負荷が落ち着いて使用量が 37.5% (1.5 vCPU) を下回ると、レコメンダーはそれに応じて比例的に再びスケールダウンします。

## メモリベースの推奨事項 \{#memory-based-recommendations\}

ClickHouse Cloud は、サービスの実際の使用パターンに基づいて、適切なメモリサイズを自動的に推奨します。
このレコメンダーは、ルックバックウィンドウの使用状況を分析し、急増時にも対応してメモリ不足 (OOM) エラーを防げるよう、余裕分を加味します。

このレコメンダーでは、次の 3 つのシグナルを参照します。

* **クエリメモリ**: クエリ実行中に使用されたピークメモリ
* **常駐メモリ**: プロセス全体で保持されたピークメモリ
* **OOM イベント**: クエリまたはレプリカで最近メモリ不足が発生したかどうか

### 余裕分の計算方法 \{#how-headroom-is-calculated\}

クエリメモリと常駐メモリでは、追加する余裕分の大きさは、使用量の予測しやすさによって異なります。

* **安定した使用量 (変動が小さい)&#x20;**: 1.25 倍 — 使用量が安定しており、予期しないスパイクが発生しにくいため、余裕分を多めに取ります
* **増減の大きい使用量 (変動が大きい)&#x20;**: 1.1 倍 — もともと変動幅の大きいワークロードに対する過剰なプロビジョニングを避けるため、余裕分を少なめに取ります

OOM イベントが検出された場合、サービスが復旧に十分なメモリを確保できるよう、レコメンダーはより積極的な **1.5 倍** を適用します。

### 最終的な推奨 \{#final-recommendation\}

システムは、すべてのシグナルの中で最も高い値を採用します。

```text
desired_memory = max(
  query_memory × skew_multiplier,
  resident_memory × skew_multiplier,
  resident_memory × 1.5,   // if query OOMs detected
  rss_at_crash × 1.5       // if pod OOMs detected
)
```

## 2 ウィンドウ レコメンダー \{#two-window-recommender\}

ClickHouse Cloud では、単一のウィンドウではなく、異なるタイムレンジを持つ 2 つのルックバックウィンドウを使用します。

* **Small Window (3 hours)**: 直近の使用パターンを捉え、より迅速なスケールダウンを可能にします
* **Large Window (30 hours)**: 複数回に分けて段階的にスケールアップするのではなく、より長いルックバックウィンドウ内で観測された最大使用量まで 1 回でスケールアップできるようにします。これは、スケーリングに時間がかかるうえ、ローカルキャッシュが無効化されるため重要です。そのため、1 回でスケールアップするほうが安全です。

各ウィンドウは、メモリと CPU の両方を分析し、それぞれ独立して推奨値を生成します。
その後、システムは以下の図に示すように、各ウィンドウが示すスケーリング方向に基づいて、これらの推奨値を統合します。

<Image img={two_window_recommender} size="lg" alt="2 ウィンドウ レコメンダーの統合ロジック" />

レコメンダーの設計上の判断について詳しくは、[「ClickHouse のより賢いオートスケーリング: 2 ウィンドウ アプローチ」
](https://clickhouse.com/blog/smarter-auto-scaling#the-two-window-solution)を参照してください