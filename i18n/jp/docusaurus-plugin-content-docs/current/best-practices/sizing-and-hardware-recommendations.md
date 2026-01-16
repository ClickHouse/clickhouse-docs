---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: 'サイジングとハードウェアの推奨事項'
sidebar_position: 4
title: 'サイジングとハードウェアの推奨事項'
description: 'このガイドでは、オープンソース版をご利用のユーザー向けに、ハードウェア、計算リソース、メモリ、およびディスク構成に関する一般的な推奨事項を説明します。'
doc_type: 'guide'
keywords: ['サイジング', 'ハードウェア', 'キャパシティプランニング', 'ベストプラクティス', 'パフォーマンス']
---

# サイジングとハードウェアの推奨事項 \\{#sizing-and-hardware-recommendations\\}

このガイドでは、オープンソースユーザー向けのハードウェア、コンピューティングリソース、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。セットアップを簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud) の利用を推奨します。ClickHouse Cloud は、インフラ管理にかかるコストを最小限に抑えつつ、ワークロードに応じて自動的にスケールおよび調整を行います。

ClickHouse クラスターの構成は、アプリケーションのユースケースおよびワークロード特性に大きく依存します。アーキテクチャを計画する際には、次の要素を考慮する必要があります。

- 同時実行数（1 秒あたりのリクエスト数）
- スループット（1 秒あたりに処理される行数）
- データ量
- データ保持ポリシー
- ハードウェアコスト
- 運用・保守コスト

## Disk \\{#disk\\}

ClickHouse で使用するディスクの種類は、データ量、レイテンシ、スループット要件によって異なります。

### パフォーマンスの最適化 \\{#optimizing-for-performance\\}

パフォーマンスを最大化するには、I/O に最適化された [AWS のプロビジョンド IOPS SSD ボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)、または利用中のクラウドプロバイダーにおける同等のサービスをインスタンスに直接アタッチすることを推奨します。

### ストレージコストの最適化 \\{#optimizing-for-storage-costs\\}

コストを抑えるには、[汎用 SSD EBS ボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html) を使用できます。

また、SSD と HDD を組み合わせて [hot/warm/cold アーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) による階層型ストレージを実装することもできます。あるいは、コンピュートとストレージを分離するために、ストレージとして [AWS S3](https://aws.amazon.com/s3/) を利用することも可能です。コンピュートとストレージを分離したオープンソース版 ClickHouse の利用方法については、[こちら](/guides/separation-storage-compute)のガイドを参照してください。ClickHouse Cloud では、コンピュートとストレージの分離がデフォルトで利用可能です。

## CPU \\{#cpu\\}

### どの CPU を使用すべきですか？ \\{#which-cpu-should-i-use\\}

使用すべき CPU のタイプは、ワークロードのパターンに依存します。一般的には、多数かつ頻繁な同時クエリがあり、より多くのデータを処理する場合や、計算量の多い UDF を使用するアプリケーションでは、より多くの CPU コアが必要になります。

**低レイテンシまたはエンドユーザー向けアプリケーション**

数十ミリ秒レベルのレイテンシ要件があるエンドユーザー向けワークロードには、I/O 最適化された AWS の EC2 [i3 系](https://aws.amazon.com/ec2/instance-types/i3/) または [i4i 系](https://aws.amazon.com/ec2/instance-types/i4i/)、もしくはクラウドプロバイダでこれに相当するインスタンスタイプを推奨します。

**高い同時実行性を要求するアプリケーション**

同時実行性（1 秒あたり 100 件以上のクエリ）の最適化が必要なワークロードには、AWS の [コンピューティング最適化 C 系](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) もしくはクラウドプロバイダでこれに相当するインスタンスタイプを推奨します。

**データウェアハウス用途**

データウェアハウスのワークロードやアドホックな分析クエリには、メモリ最適化された AWS の [R 系](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) もしくはクラウドプロバイダでこれに相当するインスタンスタイプを推奨します。

---

### CPU 使用率はどの程度にすべきですか？ \\{#what-should-cpu-utilization-be\\}

ClickHouse に対して標準的な CPU 使用率の目標値は存在しません。[iostat](https://linux.die.net/man/1/iostat) などのツールを使用して平均 CPU 使用率を計測し、予期しないトラフィックのスパイクに対応できるよう、それに応じてサーバーのサイズを調整してください。ただし、アドホッククエリを含む分析系やデータウェアハウス用途では、CPU 使用率の目標は 10〜20% とすることを推奨します。

### いくつの CPU コアを使用すべきですか？ \\{#how-many-cpu-cores-should-i-use\\}

使用すべき CPU のコア数は、ワークロードに依存します。ただし、一般的には CPU タイプごとに次のメモリ対 CPU コア比を推奨します。

- **[M 系](https://aws.amazon.com/ec2/instance-types/)（汎用ユースケース）：** メモリ対 CPU コア比 4 GB:1
- **[R 系](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウス用途）：** メモリ対 CPU コア比 8 GB:1
- **[C 系](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（コンピューティング最適化用途）：** メモリ対 CPU コア比 2 GB:1

例えば、M 系 CPU を使用する場合、25 CPU コアあたり 100 GB のメモリをプロビジョニングすることを推奨します。アプリケーションに適切なメモリ量を決定するには、メモリ使用状況のプロファイリングが必要です。[メモリ問題のデバッグに関するこのガイド](/guides/developer/debugging-memory-issues) を参照するか、[組み込みのオブザーバビリティダッシュボード](/operations/monitoring) を使用して ClickHouse を監視してください。

## メモリ \\{#memory\\}

CPU の選択と同様に、メモリとストレージの比率、およびメモリと CPU の比率は、ユースケースに依存します。

必要となる RAM 容量は、一般的に次の要素に依存します。
- クエリの複雑さ
- クエリで処理されるデータ量

一般的には、メモリが多いほどクエリの実行は高速になります。  
コストに敏感なユースケースの場合、メモリ量を少なめにしても、設定（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) および [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）を有効化してディスクへのスピルを許可することで運用することも可能です。ただし、その場合はクエリ性能に大きく影響する可能性がある点に注意してください。

### メモリとストレージの比率はどの程度にすべきか \\{#what-should-the-memory-to-storage-ratio-be\\}

データ量が少ない場合、メモリとストレージの比率が 1:1 でも問題ありませんが、総メモリは 8GB 未満にしないでください。

データ保持期間が長いユースケースや、データ量が多いユースケースでは、メモリとストレージの比率として 1:100〜1:130 を推奨します。たとえば、10TB のデータを保存する場合、レプリカあたり 100GB の RAM です。

顧客向けワークロードなど頻繁にアクセスされるユースケースでは、1:30〜1:50 のメモリとストレージの比率とし、より多くのメモリを使用することを推奨します。

## レプリカ \\{#replicas\\}

1シャードあたり少なくとも3つのレプリカ（または [Amazon EBS](https://aws.amazon.com/ebs/) を使用する場合は2つのレプリカ）を確保することを推奨します。さらに、レプリカを追加して水平方向にスケールする前に、まずはすべてのレプリカを垂直方向にスケールアップしておくことを推奨します。

ClickHouse は自動でシャーディングを行わず、データセットの再シャーディングには多くのコンピュートリソースが必要になります。そのため、将来的にデータを再シャードせずに済むよう、一般的には利用可能な範囲で最も大きなサーバーを使用することを推奨します。

自動スケーリングに対応し、ユースケースに応じてレプリカ数を容易に制御できる [ClickHouse Cloud](https://clickhouse.com/cloud) の利用も検討してください。

## 大規模ワークロード向けの構成例 \\{#example-configurations-for-large-workloads\\}

ClickHouse の構成は、利用するアプリケーション固有の要件に大きく依存します。コストとパフォーマンスの両面で最適なアーキテクチャ設計の支援をご希望の場合は、[営業チームまでお問い合わせ](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)ください。

推奨構成というわけではありませんが、参考情報として、以下に本番環境で ClickHouse を利用しているユーザーの構成例を示します。

### Fortune 500 B2B SaaS \\{#fortune-500-b2b-saas\\}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>1か月あたりの新規データ量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ容量（圧縮後）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>データ保持期間</strong></td>
        <td>18か月</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのディスク容量</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>同時実行数</strong></td>
        <td>200以上の同時クエリ</td>
    </tr>
    <tr>
        <td><strong>レプリカ数（HA ペアを含む）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>ノードあたりの vCPU 数</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>総 vCPU 数</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>総 RAM 容量</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりの RAM 容量</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM と vCPU の比率</strong></td>
        <td>4 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM とディスクの比率</strong></td>
        <td>1:50</td>
    </tr>
</table>

### ログ用途向け Fortune 500 通信事業者の例 \\{#fortune-500-telecom-operator-for-a-logging-use-case\\}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ容量（圧縮後）</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>データ保持期間</strong></td>
        <td>30日</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのディスク容量</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>レプリカ数（HA ペアを含む）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>ノードあたりの vCPU 数</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>合計 vCPU 数</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>合計 RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりの RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 対 vCPU 比</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM 対ディスク比</strong></td>
        <td>1:60</td>
    </tr>
</table>

## 参考資料 \\{#further-reading\\}

以下は、オープンソースの ClickHouse を利用している企業のアーキテクチャについて解説した公開ブログ記事です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
