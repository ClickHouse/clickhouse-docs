---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: サイズとハードウェアの推奨事項
sidebar_position: 4
---


# サイズとハードウェアの推奨事項

このガイドでは、オープンソースユーザー向けのハードウェア、コンピュート、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。セットアップを簡素化したい場合は、インフラ管理に関連するコストを最小限に抑えながらワークロードに自動的にスケールし適応する [ClickHouse Cloud](https://clickhouse.com/cloud) の使用をお勧めします。

ClickHouseクラスタの構成は、アプリケーションのユースケースやワークロードパターンに大きく依存します。アーキテクチャを計画する際は、次の要因を考慮する必要があります：

- 同時処理数（リクエスト数/秒）
- スループット（処理される行数/秒）
- データ量
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト

## ディスク {#disk}

ClickHouseで使用すべきディスクの種類は、データ量、レイテンシー、またはスループットの要件によって異なります。

### パフォーマンスの最適化 {#optimizing-for-performance}

パフォーマンスを最大化するために、AWSの [プロビジョニングIOPS SSDボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) もしくはクラウドプロバイダーからの同等のオファリングを直接接続することをお勧めします。これによりIOが最適化されます。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるためには、[一般目的SSD EBSボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html) を使用することができます。

また、SSDとHDDを使用した[ホット/ウォーム/コールドアーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)を実装することも可能です。別の選択肢として、計算とストレージを分離するために [AWS S3](https://aws.amazon.com/s3/) を使用することも可能です。計算とストレージの分離は、ClickHouse Cloudではデフォルトで利用可能です。

## CPU {#cpu}

### どのCPUを使用すべきか？ {#which-cpu-should-i-use}

使用すべきCPUの種類は、利用パターンに依存します。ただし、一般的には、多くの頻繁な同時クエリを処理するアプリケーションや、より多くのデータを処理するアプリケーション、計算集約的なUDFを使用するアプリケーションは、より多くのCPUコアを必要とするでしょう。

**低レイテンシーまたは顧客向けアプリケーション**

ミリ秒単位の低レイテンシーが要求される顧客向けワークロードには、AWSのEC2 [i3ライン](https://aws.amazon.com/ec2/instance-types/i3/) または [i4iライン](https://aws.amazon.com/ec2/instance-types/i4i/) もしくはクラウドプロバイダーからの同等のオファリングをお勧めします。これらはIO最適化されています。

**高同時処理アプリケーション**

同時処理を最適化する必要があるワークロード（100以上のクエリ/秒）には、AWSの[コンピュート最適化Cシリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) もしくはクラウドプロバイダーからの同等のオファリングをお勧めします。

**データウェアハウジングユースケース**

データウェアハウジングのワークロードやアドホック解析クエリには、AWSの[Rタイプシリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) もしくはクラウドプロバイダーからの同等のオファリングをお勧めします。これらはメモリ最適化されています。

---

### CPU使用率はどのくらいが良いか？ {#what-should-cpu-utilization-be}

ClickHouseにおける標準のCPU使用率目標はありません。[iostat](https://linux.die.net/man/1/iostat)などのツールを利用して平均CPU使用率を測定し、予期しないトラフィックの急増に対応できるようサーバーのサイズを調整してください。ただし、アナリティクスやデータウェアハウジングのユースケースにおいてアドホッククエリを実行する場合、CPU使用率は10-20%を目指してください。

### いくつのCPUコアを使用すべきか？ {#how-many-cpu-cores-should-i-use}

使用すべきCPUの数は、ワークロードに依存します。ただし、CPUタイプに基づいて、一般的には以下のメモリとCPUコアの比率を推奨します：

- **[Mタイプ](https://aws.amazon.com/ec2/instance-types/)（一般目的のユースケース）**: メモリとCPUコアの比率 4:1
- **[Rタイプ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウジングのユースケース）**: メモリとCPUコアの比率 8:1
- **[Cタイプ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（コンピュート最適化のユースケース）**: メモリとCPUコアの比率 2:1

例えば、MタイプのCPUを使用する場合、25 CPUコアあたり100GBのメモリをプロビジョニングすることをお勧めします。アプリケーションに適したメモリの量を決定するには、メモリ使用量のプロファイリングが必要です。メモリの問題をデバッグするための[こちらのガイド](/guides/developer/debugging-memory-issues)を読むか、[組み込み監視ダッシュボード](/operations/monitoring)を使用してClickHouseを監視できます。

## メモリ {#memory}

CPUの選択と同様に、メモリとストレージの比率およびメモリとCPUの比率は、ユースケースに依存します。ただし、一般的には、メモリが多いほどクエリが速く実行されます。コストに敏感なユースケースの場合、メモリ量を低く設定することが可能ですが、[max_bytes_before_external_group_by](/operations/settings/query-complexity#settings-max_bytes_before_external_group_by) および[max_bytes_before_external_sort](/operations/settings/query-complexity#settings-max_bytes_before_external_sort)のような設定を有効にすると、ディスクへのデータのスピルを許可できるため、クエリパフォーマンスに大きく影響する可能性があることに注意してください。

### メモリとストレージの比率はどのくらいか？ {#what-should-the-memory-to-storage-ratio-be}

データ量が少ない場合、1:1のメモリとストレージの比率は許容されますが、総メモリは8GB未満であってはいけません。

データ保持期間が長いユースケースやデータ量が多い場合、1:100から1:130のメモリとストレージの比率を推奨します。例えば、10TBのデータを保存する場合、レプリカあたり100GBのRAMが必要です。

顧客向けワークロードのように頻繁にアクセスされるユースケースでは、1:30から1:50のメモリとストレージの比率でさらに多くのメモリを使用することをお勧めします。

## レプリカ {#replicas}

シャードあたり少なくとも3つのレプリカ（または[AWS EBS](https://aws.amazon.com/ebs/)を使用する場合は2つのレプリカ）を持つことをお勧めします。さらに、追加のレプリカを追加する前にすべてのレプリカを垂直にスケールすることを推奨します（水平スケーリング）。

ClickHouseは自動的にシャーディングせず、データセットの再シャーディングには相当な計算リソースが必要です。したがって、将来データを再シャーディングする必要がないように、一般的には利用可能な最大のサーバーを使用することをお勧めします。

自動的にスケールし、ユースケースに合わせてレプリカ数を簡単に制御できる[ClickHouse Cloud](https://clickhouse.com/cloud)の利用を検討してください。

## 大規模ワークロードの例設定 {#example-configurations-for-large-workloads}

ClickHouseの設定は、特定のアプリケーションの要件に大きく依存します。コストとパフォーマンスの最適化についてのサポートが必要な場合は、[営業に連絡](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)してください。

指針を提供するために（推奨ではなく）、以下は生産環境でのClickHouseユーザーの例設定です：

### フォーチュン500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間新データ量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ（圧縮済み）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>データ保持</strong></td>
        <td>18か月</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのディスク</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>同時処理数</strong></td>
        <td>200+ 同時クエリ</td>
    </tr>
    <tr>
        <td><strong>レプリカ数（HAペアを含む）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのvCPU</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>総vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>総RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりのRAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM対vCPU比率</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAM対ディスク比率</strong></td>
        <td>1:50</td>
    </tr>
</table>

### フォーチュン500 テレコムオペレーターのログ使用ケース {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ（圧縮済み）</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>データ保持</strong></td>
        <td>30日</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのディスク</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>レプリカ数（HAペアを含む）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのvCPU</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>総vCPU</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>総RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりのRAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM対vCPU比率</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAM対ディスク比率</strong></td>
        <td>1:60</td>
    </tr>
</table>

## さらなる読み物 {#further-reading}

以下は、オープンソースのClickHouseを使用している企業のアーキテクチャに関する公開されたブログ記事です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
