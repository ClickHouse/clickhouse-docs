---
'slug': '/guides/sizing-and-hardware-recommendations'
'sidebar_label': 'サイズとハードウェアの推奨事項'
'sidebar_position': 4
'title': 'サイズとハードウェアの推奨事項'
'description': 'このガイドでは、オープンソースユーザーのためのハードウェア、コンピュート、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。'
'doc_type': 'guide'
---


# サイズとハードウェアの推奨事項

このガイドでは、オープンソースユーザー向けのハードウェア、コンピューティング、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。設定を簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud) の使用をお勧めします。これにより、自動的にスケーリングし、ワークロードに適応しながらインフラ管理に関するコストを最小限に抑えます。

ClickHouse クラスターの構成は、アプリケーションのユースケースやワークロードパターンに大きく依存します。アーキテクチャを計画する際は、以下の要素を考慮する必要があります：

- 同時実行性（リクエスト/秒）
- スループット（処理される行/秒）
- データ量
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト

## ディスク {#disk}

ClickHouse で使用するディスクのタイプは、データ量、レイテンシ、またはスループット要件によって異なります。

### パフォーマンス最適化 {#optimizing-for-performance}

パフォーマンスを最大化するために、AWS の [プロビジョニング IOPS SSD ボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) への直接接続をお勧めします。これにより、IOが最適化されます。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるためには、[汎用 SSD EBS ボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html) を使用できます。

また、SSD と HDD を使用した [ホット/ウォーム/コールド アーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) の tiered ストレージを実装することも可能です。あるいは、コンピュートとストレージを分離するために [AWS S3](https://aws.amazon.com/s3/) を使用することもできます。オープンソースの ClickHouse を使用してコンピュートとストレージを分離するガイドについては [こちら](/guides/separation-storage-compute) を参照してください。コンピュートとストレージの分離は、ClickHouse Cloud ではデフォルトで利用可能です。

## CPU {#cpu}

### どの CPU を使用すべきですか？ {#which-cpu-should-i-use}

使用する CPU のタイプは、使用パターンによって異なります。ただし、一般的に、多くの頻繁な同時クエリを処理するアプリケーションや、データ量が多いアプリケーション、または計算集約型の UDF を使用するアプリケーションは、より多くの CPU コアを必要とします。

**低レイテンシまたは顧客向けアプリケーション**

数十ミリ秒のレイテンシ要件（顧客向けワークロード向け）の場合、AWS の EC2 [i3 ライン](https://aws.amazon.com/ec2/instance-types/i3/) や [i4i ライン](https://aws.amazon.com/ec2/instance-types/i4i/) またはクラウドプロバイダーの同等のオファリングをお勧めします。これらは IO 最適化されています。

**高同時実行アプリケーション**

同時実行最適化が必要なワークロード（100 回以上のクエリ/秒）の場合、AWS の [コンピュート最適化 C シリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) またはクラウドプロバイダーの同等のオファリングをお勧めします。

**データウェアハウジングユースケース**

データウェアハウジングワークロードやアドホック分析クエリの場合、AWS の [R 型シリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) またはクラウドプロバイダーの同等のオファリングをお勧めします。これらはメモリ最適化されています。

---

### CPU 使用率はどのくらいにすべきですか？ {#what-should-cpu-utilization-be}

ClickHouse に標準の CPU 使用率の目標はありません。平均 CPU 使用率を測定するために [iostat](https://linux.die.net/man/1/iostat) などのツールを使用し、予期しないトラフィックの急増に対処できるようサーバーのサイズを調整してください。ただし、アナリティクスやデータウェアハウジングユースケースでアドホッククエリを使用する場合、CPU 使用率 10-20% を目指すべきです。

### どのくらいの CPU コアを使用すべきですか？ {#how-many-cpu-cores-should-i-use}

使用する CPU 数はワークロードによって異なります。しかし、一般的には、CPU タイプに基づいて以下のメモリと CPU コアの比率を推奨します：

- **[M 種](https://aws.amazon.com/ec2/instance-types/)（汎用ユースケース）：** メモリと CPU コアの比率 4:1
- **[R 種](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウジングユースケース）：** メモリと CPU コアの比率 8:1
- **[C 種](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（コンピュート最適化ユースケース）：** メモリと CPU コアの比率 2:1

例として、M 種の CPU を使用する場合、25 CPU コアあたり 100GB のメモリをプロビジョニングすることをお勧めします。アプリケーションに適したメモリ量を決定するには、メモリ使用量をプロファイリングする必要があります。メモリの問題をデバッグするための [このガイド](/guides/developer/debugging-memory-issues) を読むか、ClickHouse を監視するために [組み込みの可視性ダッシュボード](/operations/monitoring) を使用してください。

## メモリ {#memory}

CPU の選択と同様に、ストレージ比率と CPU 比率に関するメモリの選択はユースケースに依存します。

必要な RAM のボリュームは通常、以下に依存します：
- クエリの複雑さ。
- クエリで処理されるデータの量。

一般に、メモリが多いほど、クエリの実行速度が速くなります。価格に敏感なユースケースの場合は、メモリ量を少なくすることが可能です。設定（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) および [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）を有効にすると、データをディスクにスピルすることが可能ですが、これによりクエリ性能に大きな影響を与える可能性があることにご注意ください。

### メモリとストレージの比率はどのくらいにすべきですか？ {#what-should-the-memory-to-storage-ratio-be}

データ量が少ない場合、1:1 のメモリとストレージの比率は許容されますが、合計メモリは 8GB を下回らないでください。

データの保持期間が長い場合やデータ量が多いユースケースについては、1:100 から 1:130 のメモリとストレージの比率を推奨します。たとえば、10TB のデータを保存している場合、レプリカあたり 100GB の RAM を用意します。

顧客向けワークロードのように頻繁にアクセスされるユースケースについては、1:30 から 1:50 のメモリとストレージの比率でより多くのメモリを使用することをお勧めします。

## レプリカ {#replicas}

シャードあたり少なくとも 3 つのレプリカ（または [Amazon EBS](https://aws.amazon.com/ebs/) を使用する場合は 2 つのレプリカ）を持つことを推奨します。また、追加のレプリカを追加する前にすべてのレプリカを垂直スケーリングすることをお勧めします（水平スケーリング）。

ClickHouse は自動的にシャーディングを行わず、データセットの再シャーディングには大きなコンピューティングリソースが必要になります。したがって、将来的にデータを再シャーディングする必要がないように、通常は最も大きなサーバーを使用することを推奨しています。

[ClickHouse Cloud](https://clickhouse.com/cloud) を使用すると、自動でスケーリングし、ユースケースに応じたレプリカの数を簡単に制御できます。

## 大規模ワークロードの例としての構成 {#example-configurations-for-large-workloads}

ClickHouse の構成は、特定のアプリケーションの要件に大きく依存します。コストとパフォーマンスのためにアーキテクチャを最適化するお手伝いを希望される場合は、[営業に連絡](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)してください。

ガイダンス（推奨ではありません）を提供するために、以下はプロダクション環境での ClickHouse ユーザーの例示的な構成です。

### Fortune 500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>毎月の新しいデータ量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ（圧縮）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>データ保持期間</strong></td>
        <td>18ヶ月</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのディスク</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>同時実行性</strong></td>
        <td>200+ の同時クエリ</td>
    </tr>
    <tr>
        <td><strong>レプリカ数（HAペアを含む）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>ノードあたりの vCPU</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>合計 vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>合計 RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりの RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM と vCPU の比率</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAM とディスクの比率</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 テレコムオペレーターのログユースケース用 {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>毎月のログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ（圧縮）</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>データ保持期間</strong></td>
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
        <td><strong>ノードあたりの vCPU</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>合計 vCPU</strong></td>
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
        <td><strong>RAM と vCPU の比率</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAM とディスクの比率</strong></td>
        <td>1:60</td>
    </tr>
</table>

## さらに読む {#further-reading}

以下は、オープンソースの ClickHouse を使用している企業のアーキテクチャに関する公開されたブログ記事です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
