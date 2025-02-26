---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: サイズとハードウェアの推奨事項
sidebar_position: 4
---

# サイズとハードウェアの推奨事項

このガイドでは、オープンソースユーザー向けのハードウェア、コンピューティング、メモリ、ディスク構成に関する一般的な推奨事項について説明します。設定を簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud)の使用をお勧めします。これは、自動的にスケーリングし、ワークロードに応じて適応し、インフラストラクチャ管理に関するコストを最小限に抑えます。

ClickHouseクラスターの構成は、アプリケーションの使用ケースやワークロードパターンに大きく依存します。アーキテクチャを計画する際には、以下の要素を考慮する必要があります：

- 同時実行性（秒あたりのリクエスト数）
- スループット（秒あたりに処理される行数）
- データボリューム
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト

## ディスク {#disk}

ClickHouseで使用すべきディスクのタイプは、データボリューム、レイテンシ、またはスループットの要件に依存します。

### パフォーマンスの最適化 {#optimizing-for-performance}

パフォーマンスを最大化するために、AWSの[プロビジョンドIOPS SSDボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)またはクラウドプロバイダーの同等の提供を直接接続することをお勧めします。これはIOに最適化されています。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるためには、[一般目的SSD EBSボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)を使用できます。

また、[ホット/ウォーム/コールドアーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)を使用して、SSDとHDDの階層ストレージを実装することも可能です。あるいは、計算とストレージを分離するために[AWS S3](https://aws.amazon.com/s3/)を使用することもできます。計算とストレージを分離してオープンソースのClickHouseを使用するためのガイドについては、こちらをご覧ください [/guides/separation-storage-compute](https://clickhouse.com/guides/separation-storage-compute)。計算とストレージの分離は、ClickHouse Cloudでデフォルトで利用可能です。

## CPU {#cpu}

### どのCPUを使用すべきか？ {#which-cpu-should-i-use}

使用するCPUのタイプは、使用パターンによって異なります。しかし、一般的には、多くの頻繁な同時クエリがあり、より多くのデータを処理するか、コンピューティング集約型のユーザー定義関数（UDF）を使用するアプリケーションは、より多くのCPUコアを必要とします。

**低レイテンシまたは顧客向けアプリケーション**

顧客向けのワークロードでは、レイテンシ要件が数十ミリ秒である場合は、AWSのEC2の[i3系列](https://aws.amazon.com/ec2/instance-types/i3/)または[i4i系列](https://aws.amazon.com/ec2/instance-types/i4i/)またはクラウドプロバイダーの同等の提供をお勧めします。これらはIO最適化されています。

**高い同時実行アプリケーション**

同時実行性を最適化する必要があるワークロード（秒あたり100以上のクエリ）には、AWSの[計算最適化されたCシリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)またはクラウドプロバイダーの同等の提供をお勧めします。

**データウェアハウジングの使用ケース**

データウェアハウジングワークロードやアドホック分析クエリには、AWSの[Rタイプシリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)またはクラウドプロバイダーの同等の提供をお勧めします。これらはメモリ最適化されています。

---

### CPU使用率はどのくらいにするべきか？ {#what-should-cpu-utilization-be}

ClickHouseには標準のCPU使用率ターゲットはありません。平均CPU使用率を測定するために、[iostat](https://linux.die.net/man/1/iostat)のようなツールを利用し、予期しないトラフィックの急増に対処するためにサーバーのサイズを調整してください。ただし、分析やデータウェアハウジングの使用ケースでアドホッククエリを実行する場合、10〜20%のCPU使用率を目標にしてください。

### どのくらいのCPUコアを使用すべきか？ {#how-many-cpu-cores-should-i-use}

使用すべきCPUの数は、ワークロードによって異なりますが、一般的には以下のCPUタイプに基づいて、メモリとCPUコアの比率を推奨します：

- **[Mタイプ](https://aws.amazon.com/ec2/instance-types/)（一般的な使用ケース）：** メモリとCPUコアの比率は4:1
- **[Rタイプ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウジングの使用ケース）：** メモリとCPUコアの比率は8:1
- **[Cタイプ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（計算最適化された使用ケース）：** メモリとCPUコアの比率は2:1

例えば、MタイプのCPUを使用する場合、25 CPUコアごとに100GBのメモリをプロビジョニングすることを推奨します。アプリケーションに適したメモリ量を決定するには、メモリ使用状況のプロファイリングが必要です。[メモリ問題のデバッグに関するガイド](/guides/developer/debugging-memory-issues)を読むか、[組み込みの可観測性ダッシュボード](/operations/monitoring)を使用してClickHouseを監視してください。

## メモリ {#memory}

CPUの選択と同様に、ストレージ比率とメモリ対CPU比率の選択は使用ケースに依存します。しかし、一般的には、メモリが多いほどクエリは速く実行されます。価格に敏感な使用ケースであれば、少量のメモリで機能します。設定を有効にすることが可能ですが、設定（[max_bytes_before_external_group_by](/operations/settings/query-complexity#settings-max_bytes_before_external_group_by)および[max_bytes_before_external_sort](/operations/settings/query-complexity#settings-max_bytes_before_external_sort)）により、ディスクにデータをスピルすることが可能ですが、これによりクエリパフォーマンスが大きく影響を受ける可能性があることに注意してください。

### メモリ対ストレージ比率はどのくらいにすべきか？ {#what-should-the-memory-to-storage-ratio-be}

データボリュームが少ない場合、1:1のメモリ対ストレージ比率は許容されますが、全体のメモリは8GB未満であってはなりません。

データの保持期間が長いか、高データボリュームの使用ケースでは、1:100から1:130のメモリ対ストレージ比率を推奨します。例えば、10TBのデータを保存する場合、レプリカごとに100GBのRAMを推奨します。

顧客向けのワークロードなど、頻繁にアクセスされる使用ケースには、1:30から1:50のメモリ対ストレージ比率でより多くのメモリを使用することを推奨します。

## レプリカ {#replicas}

シャードごとに少なくとも3つのレプリカを持つことを推奨します（または、[Amazon EBS](https://aws.amazon.com/ebs/)を使用して2つのレプリカ）。さらに、追加のレプリカ（横方向スケーリング）を追加する前に、すべてのレプリカを縦にスケーリングすることをお勧めします。

ClickHouseは自動的にシャードを作成しません。データセットの再シャーディングには重大な計算リソースが必要です。そのため、将来的にデータの再シャーディングを避けるため、利用可能な最大のサーバーを使用することを推奨しています。

[ClickHouse Cloud](https://clickhouse.com/cloud)を検討してください。これにより自動でスケーリングし、使用ケースに応じてレプリカの数を簡単に制御できます。

## 大規模ワークロードのための例配置 {#example-configurations-for-large-workloads}

ClickHouseの構成は、特定のアプリケーションの要件に大きく依存します。コストとパフォーマンスの最適化について支援が必要な場合は、[営業に連絡](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)してください。

指針を示すために（推奨ではありません）、以下は生産環境でのClickHouseユーザーの例配置です。

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
        <td><strong>合計ストレージ（圧縮）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>データ保持</strong></td>
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
        <td>200+ 同時クエリ</td>
    </tr>
    <tr>
        <td><strong>#のレプリカ（HAペアを含む）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのvCPU</strong></td>
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
        <td><strong>RAM対vCPU比</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAM対ディスク比</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 Telecom Operatorのログ使用ケース {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>合計ストレージ（圧縮）</strong></td>
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
        <td><strong>#のレプリカ（HAペアを含む）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのvCPU</strong></td>
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
        <td><strong>RAM対vCPU比</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAM対ディスク比</strong></td>
        <td>1:60</td>
    </tr>
</table>

## さらに読む {#further-reading}

以下は、オープンソースのClickHouseを使用している企業のアーキテクチャに関する公開されたブログ投稿です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
