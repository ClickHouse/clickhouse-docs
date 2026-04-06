---
sidebar_position: 6
sidebar_label: '扩缩容建议'
slug: /cloud/features/autoscaling/scaling-recommendations
description: '了解 ClickHouse Cloud 中的扩缩容建议'
keywords: ['扩缩容建议', '推荐器', '2-window', '自动扩缩容', '优化']
title: '扩缩容建议'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import two_window_recommender from '@site/static/images/cloud/features/autoscaling/two-window-recommender.png';

## 引言 \{#introduction\}

数据库资源的自动扩缩容需要谨慎权衡：扩容过慢可能导致性能下降，而缩容过于激进则可能引发持续震荡。

ClickHouse Cloud 通过将双时间窗口推荐框架与目标跟踪 CPU 推荐系统结合，在保持生产环境数据库所需稳定性的同时，实现更快的缩容、减少扩缩容震荡，并显著降低负载波动场景下的基础设施成本。

## 基于 CPU 的扩缩容 \{#cpu-based-scaling\}

CPU 扩缩容采用目标跟踪机制，根据目标利用率计算所需的精确 CPU 分配。只有当当前 CPU 利用率超出预设区间时，才会触发扩缩容操作：

| 参数    | 值     | 含义                    |
| ----- | ----- | --------------------- |
| 目标利用率 | 53%   | ClickHouse 试图维持的利用率水平 |
| 高水位线  | 75%   | 当 CPU 超过此阈值时触发扩容      |
| 低水位线  | 37.5% | 当 CPU 低于此阈值时触发缩容      |

推荐器会根据历史使用情况评估 CPU 利用率，并使用以下公式确定建议的 CPU 规格：

```text
recommended_cpu = max_cpu_usage / target_utilization
```

如果 CPU 利用率处于已分配容量的 37.5%–75% 之间，则不会执行扩缩容操作。超出该区间时，推荐器会精确计算出将利用率拉回 53% 所需的规模，并据此对服务进行扩缩容。

### 示例 \{#cpu-scaling-example\}

一个分配了 4 个 vCPU 的服务，其 vCPU 使用量峰值达到 3.8 (约 95% 的利用率) ，超过了 75% 的高水位线。
推荐器计算得出：`3.8 / 0.53 ≈ 7.2 vCPU`，并向上取整到下一个可用规格 (8 个 vCPU) 。当负载回落且使用量降至 37.5% (1.5 个 vCPU) 以下时，推荐器会按比例缩容。

## 基于内存的建议 \{#memory-based-recommendations\}

ClickHouse Cloud 会根据您的服务实际使用情况，自动推荐内存规格。
推荐器会分析回溯窗口内的使用情况，并预留一定余量，以应对峰值并防止出现内存不足 (OOM) 错误。

推荐器会参考以下三个信号：

* **查询内存**：查询执行期间的峰值内存占用
* **驻留内存**：进程整体的峰值驻留内存占用
* **OOM 事件**：查询或副本近期是否发生过内存不足

### 余量的计算方式 \{#how-headroom-is-calculated\}

对于查询内存和驻留内存，增加多少余量取决于你的使用情况有多可预测：

* **稳定使用 (低波动)&#x20;**：1.25x 倍数——余量更大，因为使用情况较为稳定，不太可能出现意外的峰值
* **波动明显的使用 (高波动)&#x20;**：1.1x 倍数——余量较少，以避免对本身波动就较大的工作负载过度配置

如果检测到 OOM 事件，推荐器会采用更激进的 **1.5x 倍数**，以确保服务有足够的内存完成恢复。

### 最终建议 \{#final-recommendation\}

系统会取所有信号中的最高值：

```text
desired_memory = max(
  query_memory × skew_multiplier,
  resident_memory × skew_multiplier,
  resident_memory × 1.5,   // if query OOMs detected
  rss_at_crash × 1.5       // if pod OOMs detected
)
```

## 双窗口推荐器 \{#two-window-recommender\}

ClickHouse Cloud 不使用单一窗口，而是采用两个时间范围不同的回溯窗口：

* **小窗口 (3 小时)&#x20;**：捕捉近期使用模式，支持更快缩容
* **大窗口 (30 小时)&#x20;**：确保系统根据较长回溯窗口内观测到的最大使用量，一步扩容到位，而不是经过多次逐步扩容。这一点至关重要，因为扩缩容需要时间，而且会导致本地缓存失效；因此，一次完成扩容更稳妥。

每个窗口都会基于内存和 CPU 分析独立生成建议。
然后，系统会根据每个窗口建议的扩缩容方向合并这些建议，如下图所示：

<Image img={two_window_recommender} size="lg" alt="双窗口推荐器合并逻辑" />

如需深入了解该推荐器的设计决策，请参阅 [“ClickHouse 的更智能自动扩缩容：双窗口方法
”](https://clickhouse.com/blog/smarter-auto-scaling#the-two-window-solution)