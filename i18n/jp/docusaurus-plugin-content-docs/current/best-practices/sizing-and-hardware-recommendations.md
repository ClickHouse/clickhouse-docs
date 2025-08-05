---
slug: '/guides/sizing-and-hardware-recommendations'
sidebar_label: 'サイジングおよびハードウェアの推奨事項'
sidebar_position: 4
title: 'サイジングおよびハードウェアの推奨事項'
description: 'このガイドでは、オープンソースユーザー向けのハードウェア、コンピュート、メモリおよびディスク構成に関する一般的な推奨事項について説明しています。'
---




# ハードウェアのサイズ指定と推奨事項

このガイドでは、オープンソースユーザー向けのハードウェア、計算、メモリ、ディスク構成に関する一般的な推奨事項を説明します。セットアップを簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud)を使用することをお勧めします。これにより、ワークロードに応じて自動的にスケールし、インフラ管理に関するコストを最小限に抑えることができます。

ClickHouseクラスターの構成は、アプリケーションの使用ケースやワークロードパターンに大きく依存します。アーキテクチャを計画する際には、以下の要因を考慮する必要があります。

- 同時実行性（リクエスト数/秒）
- スループット（処理された行数/秒）
- データ量
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト

## ディスク {#disk}

ClickHouseで使用するディスクの種類は、データ量、レイテンシ、またはスループットの要件に依存します。

### パフォーマンスの最適化 {#optimizing-for-performance}

パフォーマンスを最大化するために、[AWSのプロビジョニングIOPS SSDボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)またはクラウドプロバイダーの同等の提供物を直接接続することをお勧めします。これにより、IOが最適化されます。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるために、[一般目的のSSD EBSボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)を使用できます。

SDDとHDDを使用した[ホット/ウォーム/コールドアーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)を利用した段階的ストレージを実装することもできます。あるいは、[AWS S3](https://aws.amazon.com/s3/)をストレージとして使用し、計算とストレージを分離することも可能です。計算とストレージの分離に関するガイドは[こちら](/guides/separation-storage-compute)をご覧ください。計算とストレージの分離は、ClickHouse Cloudでデフォルトで利用可能です。

## CPU {#cpu}

### どのCPUを使用すべきか？ {#which-cpu-should-i-use}

使用するCPUの種類は、使用パターンに依存します。ただし、一般に、同時実行クエリが多く、より多くのデータを処理するアプリケーションや、計算集約型のユーザー定義関数（UDF）を使用する場合は、より多くのCPUコアが必要になります。

**低レイテンシまたは顧客向けアプリケーション**

顧客向けワークロードのために、レイテンシ要件が数ミリ秒の場合は、AWSのEC2 [i3ライント](https://aws.amazon.com/ec2/instance-types/i3/)または[i4iライント](https://aws.amazon.com/ec2/instance-types/i4i/)を推奨します。または、クラウドプロバイダーの同等の提供物を選択してください。

**高同時実行アプリケーション**

同時実行性を最適化する必要があるワークロード（100クエリ/秒以上）の場合は、AWSの[計算最適化Cシリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)を推奨します。あるいは、クラウドプロバイダーの同等の提供物もご利用いただけます。

**データウェアハウジングのユースケース**

データウェアハウジングのワークロードやアドホック分析クエリには、AWSの[Rタイプシリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)を推奨します。または、クラウドプロバイダーの同等の提供物を使用してください。これらはメモリ最適化されています。

---

### CPU使用率はどのくらいにすべきか？ {#what-should-cpu-utilization-be}

ClickHouseに対する標準的なCPU使用率の目標はありません。[iostat](https://linux.die.net/man/1/iostat)などのツールを使用して平均CPU使用率を測定し、予期しないトラフィックスパイクを管理するためにサーバーのサイズを調整してください。ただし、アナリティクスやデータウェアハウジングのユースケースでアドホッククエリを行っている場合、CPU使用率は10〜20％を目指すべきです。

### どれくらいのCPUコアを使用すべきか？ {#how-many-cpu-cores-should-i-use}

使用するCPUの数は、ワークロードによって異なります。ただし、以下のCPUタイプに基づくメモリとCPUコアの比率を推奨します。

- **[Mタイプ](https://aws.amazon.com/ec2/instance-types/)（一般目的のユースケース）：** メモリとCPUコアの比率は4:1
- **[Rタイプ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウジングのユースケース）：** メモリとCPUコアの比率は8:1
- **[Cタイプ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（計算最適化のユースケース）：** メモリとCPUコアの比率は2:1

例えば、MタイプのCPUを使用する場合、25CPUコアごとに100GBのメモリをプロビジョニングすることを推奨します。アプリケーションに適したメモリ量を特定するには、メモリの使用状況をプロファイリングする必要があります。メモリに関する問題のデバッグに関する[このガイド](/guides/developer/debugging-memory-issues)を読むか、ClickHouseを監視するために[組み込みの可観測性ダッシュボード](/operations/monitoring)を使用してください。

## メモリ {#memory}

CPUの選択と同様に、ストレージ比率に対するメモリ、CPUに対するメモリの比率は使用ケースに依存します。

必要なRAMの容量は通常、以下の要因に依存します。
- クエリの複雑さ。
- クエリで処理されるデータの量。

一般に、メモリが多いほど、クエリの実行は速くなります。 
コストに敏感な使用ケースの場合、メモリの少ない構成でも動作します（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)および[`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)を有効にする設定が可能で、ディスクにデータをスピルさせることができます）が、これによりクエリのパフォーマンスに大きな影響を与える可能性があることに注意してください。

### メモリとストレージの比率はどのくらいにすべきか？ {#what-should-the-memory-to-storage-ratio-be}

データ量が少ない場合、1:1のメモリストレージ比率は受け入れられますが、合計メモリは8GB以上であるべきです。

データの保持期間が長いまたはデータ量が多いユースケースの場合、1:100から1:130のメモリストレージ比率を推奨します。たとえば、10TBのデータを保存する場合は、レプリカごとに100GBのRAMを推奨します。

顧客向けのワークロードのように頻繁にアクセスされるユースケースの場合、1:30から1:50のメモリストレージ比率でより多くのメモリを使用することを推奨します。

## レプリカ {#replicas}

シャードごとに少なくとも3つのレプリカ（または[Amazon EBS](https://aws.amazon.com/ebs/)を含む2つのレプリカ）を持つことを推奨します。さらに、追加のレプリカを追加する前にすべてのレプリカを縦にスケールアップすることをお勧めします（水平スケーリング）。

ClickHouseは自動的にシャーディングを行わず、データセットの再シャーディングにはかなりの計算リソースが必要です。したがって、将来データを再シャーディングする必要がないように、通常は利用可能な最大のサーバーを使用することを推奨します。

[ClickHouse Cloud](https://clickhouse.com/cloud)を使用すると自動的にスケールし、使用ケースに応じてレプリカの数を簡単に制御できます。

## 大規模ワークロードの例示的な構成 {#example-configurations-for-large-workloads}

ClickHouseの構成は、特定のアプリケーションの要件によって大きく異なります。コストとパフォーマンスの最適化についてのサポートが必要な場合は、[Salesに問い合わせ](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)てください。

ガイダンスを提供するために（推奨事項ではありません）、以下はプロダクションでのClickHouseユーザーの例示的な構成です。

### Fortune 500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間新データ量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ（圧縮後）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>データ保持</strong></td>
        <td>18ヶ月</td>
    </tr>
    <tr>
        <td><strong>ノードごとのディスク</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>同時実行性</strong></td>
        <td>200+同時クエリ</td>
    </tr>
    <tr>
        <td><strong>レプリカの数（HAペアを含む）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>ノードごとのvCPU</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>合計vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>合計RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>レプリカごとのRAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAMとvCPUの比率</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAMとディスクの比率</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 Telecom Operatorのログユースケース {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ（圧縮後）</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>データ保持</strong></td>
        <td>30日</td>
    </tr>
    <tr>
        <td><strong>ノードごとのディスク</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>レプリカの数（HAペアを含む）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>ノードごとのvCPU</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>合計vCPU</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>合計RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>レプリカごとのRAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAMとvCPUの比率</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAMとディスクの比率</strong></td>
        <td>1:60</td>
    </tr>
</table>

## さらなる読書 {#further-reading}

以下は、オープンソースのClickHouseを使用している企業によるアーキテクチャに関する公開されたブログ投稿です。

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
