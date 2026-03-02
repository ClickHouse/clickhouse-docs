---
slug: /cloud/managed-postgres/benchmarks
sidebar_label: 'ベンチマーク'
title: 'パフォーマンスベンチマーク'
description: 'ClickHouse によるマネージド Postgres と AWS Aurora、RDS、その他のマネージド PostgreSQL サービスを比較したパフォーマンスベンチマーク'
keywords: ['Postgres ベンチマーク', 'パフォーマンス', 'pgbench', 'aurora', 'rds', 'tps', 'レイテンシ', 'NVMe パフォーマンス']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import computeIntensive from '@site/static/images/managed-postgres/benchmarks/compute-intensive.png';
import ioReadOnly from '@site/static/images/managed-postgres/benchmarks/io-intensive-readonly.png';
import ioReadWrite from '@site/static/images/managed-postgres/benchmarks/io-intensive-readwrite.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="benchmarks" />

:::info 要約

* ClickHouse が提供するマネージド Postgres と AWS RDS（16k プロビジョンド IOPS）、Aurora IO Optimized を、標準的な [`pgbench`](https://www.postgresql.org/docs/current/pgbench.html) テストで比較ベンチマーク
* **パフォーマンス**: NVMe ストレージをバックエンドとする ClickHouse の Postgres は、IO 負荷の高いワークロードで **4.3〜9 倍高速**、CPU がボトルネックとなるシナリオで **12% 高速**
* 高トランザクションレート、低レイテンシなデータアクセス、IO ボトルネックのない予測可能なパフォーマンスを要求する、**急成長する AI 駆動型ワークロードに最適**
  :::


## ベンチマークの概要 \{#overview\}

中程度および高い同時実行性の両方のシナリオにおけるワークロードのパフォーマンスを評価するため、標準的な PostgreSQL ベンチマークツールである `pgbench` を用いて包括的なパフォーマンステストを実施しました。

## ベンチマーク \{#benchmarks\}

すべてのパフォーマンステストは、同じ計算リソースを持つクライアント VM を使用し、公平な比較ができるよう PostgreSQL データベースと同一リージョンかつ同一アベイラビリティゾーン内に配置して実行しました。

### Test 1: IO 集約型 - Read+Write (500 GB データセット) \{#test1\}

<Image img={ioReadWrite} alt="IO Intensive Read+Write benchmark results" size="md" border/>

**RDS（16k IOPS）に対するパフォーマンス向上:**

- **TPS が 326% 向上**（4.3 倍高速）

**Aurora IO Optimized に対するパフォーマンス向上:**

- **TPS が 345% 向上**（4.5 倍高速）

**分析**: 読み取りと書き込みが混在するワークロードにおいては、NVMe ストレージの最も顕著なパフォーマンス優位性が発揮されると同時に、高スループットなデータインジェストと低レイテンシー読み取りの両方を必要とする、**急速に成長する AI 駆動型ワークロードにとって最も現実的なシナリオ**を表しています。**ClickHouse によってマネージドされる Postgres は、高い同時実行性のもとで 19.8K TPS を達成**し、NVMe ストレージが負荷下で効果的にスケールすることを示しました。これは **RDS および Aurora と比べて 4.3〜4.5 倍高速**です。ネットワーク接続型ストレージソリューションは書き込み負荷の高い処理で苦戦し、RDS と Aurora はプロビジョニングされたキャパシティや Aurora の IO Optimized 構成を用いても、TPS は 4.4K〜4.6K で頭打ちとなりました。

#### セットアップ \{#test1-setup\}

このテストでは、500 GB の大規模データセットを用いてリード/ライト混在のパフォーマンスを評価し、ストレージサブシステムの読み取りおよび書き込みパスの両方に負荷を与えます。

**インスタンス構成:**

| 構成             | Postgres managed by ClickHouse | RDS with 16k IOPS       | Aurora IO Optimized      |
| -------------- | ------------------------------ | ----------------------- | ------------------------ |
| **PG Version** | 17                             | 17                      | 17                       |
| **vCPUs**      | 16                             | 16                      | 16                       |
| **RAM**        | 64 GB                          | 64 GB                   | 128 GB                   |
| **Disk Size**  | 1 TB                           | 1 TB                    | 1 TB                     |
| **Disk Type**  | NVMe (unlimited IOPS)          | ネットワーク接続型 (16,000 IOPS) | ネットワーク接続型 (IO Optimized) |

**テスト構成:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read+Write benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30
```


### Test 2: IO Intensive - Read-Only (500 GB dataset) \{#test2\}

<Image img={ioReadOnly} alt="IO Intensive Read-Only ベンチマーク結果" size="md" border/>

**RDS (16k IOPS) 比でのパフォーマンス向上:**

- **TPS が 802% 向上**（9.0倍高速）

**分析**: IO ボトルネックとなる読み取り中心ワークロードでは、パフォーマンス差が劇的に広がります。**ClickHouse によって管理された Postgres は 84.8K TPS を達成**した一方で、同等のコンピュートリソースにもかかわらず、16,000 IOPS をプロビジョニングした RDS はわずか 9.4K TPS にとどまりました。決定的な違いは、ClickHouse の NVMe ストレージは高い同時実行性に応じてスケールする一方で、ネットワーク接続型ストレージはプロビジョニングした IOPS の上限によって制約される点です。プロビジョンド IOPS を設定していても、RDS は依然として ClickHouse より 9 倍遅く、IO 集約型ワークロードにおけるストレージアーキテクチャの重要性を如実に示しています。

#### セットアップ \{#test2-setup\}

このテストでは、メモリに収まりきらない 500 GB の大規模データセットに対する読み取り性能を評価し、ディスク I/O 性能を負荷テストします。

**インスタンス構成:**

| 構成             | ClickHouse が管理する Postgres | 16k IOPS の RDS          |
| -------------- | ------------------------- | ----------------------- |
| **PG Version** | 17                        | 17                      |
| **vCPUs**      | 16                        | 16                      |
| **RAM**        | 64 GB                     | 64 GB                   |
| **Disk Size**  | 1 TB                      | 1 TB                    |
| **Disk Type**  | NVMe (IOPS 無制限)           | ネットワーク接続型 (16,000 IOPS) |

**テスト構成:**

```bash
# Initialize database (500 GB dataset)
pgbench -i -s 34247

# Read-only benchmark
pgbench -c 256 -j 16 -T 600 -M prepared -P 30 -S
```


### Test 3: CPU 集約型（データはメモリに収まる） \{#test3\}

<Image img={computeIntensive} alt="CPU 集約型ベンチマーク結果" size="md" border/>

**パフォーマンス向上:**

- RDS PostgreSQL よりも **TPS が 12.3% 高い**

**分析**: ディスク I/O が最小限の CPU ボトルネックとなるシナリオでも、**ClickHouse が管理する Postgres が 36.5K TPS でトップとなりました**。両サービスとも CPU 使用率が 100% に達していたにもかかわらず、ClickHouse の NVMe ストレージは、より高いキャッシュヒット率により優れたパフォーマンスを発揮しました。RDS を 12% 上回ったことは、ワークロードが主に CPU ボトルネックである場合でも、基盤となるインフラストラクチャの効率性を示しています。

#### セットアップ \{#test3-setup\}

このテストでは、作業セット全体がメモリに収まる条件で CPU パフォーマンスを評価し、ディスク I/O の影響を最小限に抑えています。

**インスタンス構成:**

| 構成             | Postgres managed by ClickHouse | RDS PostgreSQL         |
| -------------- | ------------------------------ | ---------------------- |
| **PG Version** | 17                             | 17                     |
| **vCPUs**      | 2                              | 2                      |
| **RAM**        | 8 GB                           | 8 GB                   |
| **Disk Type**  | NVMe                           | Network-attached (gp3) |

**テスト構成:**

```bash
# Initialize database (2 GB dataset)
pgbench -i -s 136

# Warm-up run to load dataset into memory
pgbench -c 1 -T 60 -S -M prepared

# Run benchmark (read-only, prepared statements)
pgbench -c 32 -j 16 -T 300 -S -M prepared -P 30
```


## パフォーマンス概要 \{#summary\}

### 主要な結果 \{#key-findings\}

3 つのベンチマークシナリオすべてにおいて、ClickHouse が管理する Postgres は、一貫して優れたパフォーマンスを発揮しました。

1. **IO 集約型の読み書きワークロード**: 16k IOPS の RDS および Aurora IO Optimized と比較して TPS が 4.3〜4.5 倍
2. **IO 集約型の読み取り専用ワークロード**: 16k IOPS の RDS と比較して TPS が 9 倍
3. **CPU ボトルネックとなるワークロード**: RDS と比較して TPS が 12% 高い

### Postgres by ClickHouse が優れているケース \{#when-it-excels\}

Postgres by ClickHouse は、次のようなアプリケーションに最適です。

- 高スループットでのデータ取り込み、高頻度の upsert、リアルタイムな特徴量更新に加え、ClickHouse とのシームレスな連携による OLAP ワークロード向け分析機能を標準で必要とする、**急成長する AI 駆動型ワークロードを支える**もの
- 高頻度の書き込み、更新、または読み取り/書き込み混在の処理を行うもの
- 予測可能で高性能なストレージを必要とするもの
- 従来型のマネージド Postgres サービスにおける IOPS 制限によって現在ボトルネックになっているもの

**将来的に分析ニーズが見込まれ**、トランザクションデータがリアルタイムダッシュボード、特徴量ストア、ML パイプラインへと供給される、現代的な AI ワークロードで一般的なように、より深い ClickHouse との連携を想定している場合、**Postgres by ClickHouse をデフォルトの第一候補とすべきです**。ネイティブ統合により複雑な ETL パイプラインが不要になり、運用データベースと分析クエリ間でシームレスなデータフローが実現します。

### NVMe アーキテクチャの利点 \{#nvme-advantage\}

このパフォーマンス上の優位性は、根本的なアーキテクチャの違いに由来します。

| Aspect                  | NVMe ストレージ（Managed Postgres） | ネットワーク接続ストレージ（プロビジョンド IOPS） |
|-------------------------|-------------------------------------|----------------------------------------------------|
| **IOPS**                | 100k から事実上無制限               | 16,000 IOPS をプロビジョニング                     |
| **Network hops**        | ゼロ（ローカルデバイス）            | すべてのディスク操作でネットワーク往復が必要       |
| **Performance scaling** | 並行実行数に応じて線形にスケール     | プロビジョニングされた IOPS によって制限される     |

NVMe ストレージによるパフォーマンス上の利点の詳細は、[NVMe を活用したパフォーマンス](/cloud/managed-postgres/overview#nvme-performance)を参照してください。

## コスト効率 \{#cost-effectiveness\}

純粋な性能面だけでなく、ClickHouse が管理する Postgres は優れた価格性能比を提供します。

- **1ドルあたりのスループット向上**: 16k provisioned IOPS と Aurora IO Optimized を利用した RDS と比べて、TPS が 4〜9倍
- **コストの予測しやすさ**: 追加の IOPS 容量をプロビジョニングする必要がなく、無制限のローカル IOPS が含まれる
- **コンピュート要件の削減**: 効率的な I/O により、より小さなインスタンスサイズで目標パフォーマンスを達成可能
- **読み取りレプリカの必要性の低減**: 単一インスタンスあたりのスループットが高いため、水平方向スケーリングの必要性が低減

現在 IOPS 制限によってボトルネックとなっているワークロードでは、Managed Postgres に切り替えることで、高価な provisioned IOPS や IO-optimized 構成を不要にしつつ、はるかに高いパフォーマンスを得ることができます。

## 参考資料 \{#references\}

完全なベンチマークデータ、設定内容、および詳細なメトリクスは、[ベンチマーク結果スプレッドシート](https://docs.google.com/spreadsheets/d/17TLWmwNKZb3Ie1vSQqvjtqByHskvoX6CF2eQ_FRx1cA/edit?gid=845104392#gid=845104392)で確認できます。

## 参考リソース \{#resources\}

- [PeerDB: マネージド Postgres サービスの比較](https://blog.peerdb.io/comparing-postgres-managed-services-aws-azure-gcp-and-supabase)
- [pgbench のドキュメント](https://www.postgresql.org/docs/current/pgbench.html)
- [マネージド Postgres の概要](/cloud/managed-postgres/overview)
- [Postgres インスタンスのスケーリング](/cloud/managed-postgres/scaling)