---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: 'サイズおよびハードウェアの推奨事項'
sidebar_position: 4
title: 'サイズおよびハードウェアの推奨事項'
description: 'このガイドでは、オープンソースユーザー向けのハードウェア、計算、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。'
---


# サイズおよびハードウェアの推奨事項

このガイドでは、オープンソースユーザー向けのハードウェア、計算、メモリ、およびディスク構成に関する一般的な推奨事項について説明します。セットアップを簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud) の利用をお勧めします。これにより、自動的にスケールし、ワークロードに適応し、インフラ管理に関するコストを最小限に抑えることができます。

ClickHouseクラスタの構成は、アプリケーションのユースケースとワークロードパターンに大きく依存します。アーキテクチャを計画する際には、次の要素を考慮する必要があります。

- 同時処理（リクエスト数/秒）
- スループット（行処理数/秒）
- データボリューム
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト

## ディスク {#disk}

ClickHouseと一緒に使用すべきディスクのタイプは、データボリューム、レイテンシ、またはスループットの要件に依存します。

### パフォーマンスの最適化 {#optimizing-for-performance}

パフォーマンスを最大化するために、AWSの[プロビジョンドIOPS SSDボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)や、クラウドプロバイダーの同等の提供を直接接続することをお勧めします。これはIOの最適化に特化しています。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるために、[汎用SSD EBSボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)を使用できます。

また、SSDとHDDを使用した[ホット/ウォーム/コールドアーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)による階層型ストレージを実装することもできます。あるいは、データとストレージを分離するために[AWS S3](https://aws.amazon.com/s3/)を使用することもできます。計算とストレージの分離に関するガイドは[こちら](/guides/separation-storage-compute)をご覧ください。計算とストレージの分離は、ClickHouse Cloudでデフォルトで利用可能です。

## CPU {#cpu}

### どのCPUを使用すべきか？ {#which-cpu-should-i-use}

使用すべきCPUのタイプは、使用パターンに依存します。しかし一般的には、多数の頻繁な同時クエリを処理するアプリケーションや、多くのデータを処理するアプリケーション、または計算集約型のUDFを使用するアプリケーションは、より多くのCPUコアを必要とします。

**低レイテンシまたは顧客向けアプリケーション**

顧客向けのワークロード向けに10ミリ秒程度のレイテンシが要求される場合は、AWSのEC2[i3シリーズ](https://aws.amazon.com/ec2/instance-types/i3/)または[i4iシリーズ](https://aws.amazon.com/ec2/instance-types/i4i/)、およびクラウドプロバイダーの同等の提供をお勧めします。これらはIO最適化されています。

**高同時処理アプリケーション**

同時処理の最適化が必要なワークロード（1秒あたり100以上のクエリ）には、AWSの[計算最適化Cシリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)またはクラウドプロバイダーの同等の提供をお勧めします。

**データウェアハウスのユースケース**

データウェアハウスのワークロードやアドホック分析クエリには、AWSの[Rタイプシリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)やクラウドプロバイダーの同等の提供を推奨します。これらはメモリ最適化されています。

---

### CPU使用率はどのくらいにすべきか？ {#what-should-cpu-utilization-be}

ClickHouseにおけるCPU使用率の標準目標はありません。平均CPU使用率を測定するために[iostat](https://linux.die.net/man/1/iostat)などのツールを利用し、予期しないトラフィックのピークに対処するためにサーバーサイズを調整してください。ただし、アナリティクスまたはデータウェアハウスのユースケースでアドホッククエリがある場合は、CPU使用率を10-20%に設定することを目指してください。

### CPUコアはどのくらい使用すべきか？ {#how-many-cpu-cores-should-i-use}

使用すべきCPUの数はワークロードに依存します。しかし、一般的に、以下のCPUタイプに基づいたメモリ対CPUコアの比率を推奨します。

- **[Mタイプ](https://aws.amazon.com/ec2/instance-types/)（汎用ユースケース）：** メモリ対CPUコアの比率4:1
- **[Rタイプ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（データウェアハウスユースケース）：** メモリ対CPUコアの比率8:1
- **[Cタイプ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（計算最適化ユースケース）：** メモリ対CPUコアの比率2:1

例えば、MタイプのCPUを使用する場合、コア25個あたり100GBのメモリをプロビジョニングすることをお勧めします。アプリケーションに適切なメモリ量を決定するには、メモリ使用量をプロファイリングする必要があります。[メモリ問題のデバッグに関するガイド](/guides/developer/debugging-memory-issues)を読むか、[組み込みの可観測性ダッシュボード](/operations/monitoring)を利用してClickHouseを監視してください。

## メモリ {#memory}

CPUの選択と同様に、ストレージ比率やCPU比率に対するメモリの選択もユースケースに依存します。

必要なRAMの量は、一般的に以下の要因に依存します：
- クエリの複雑さ。
- クエリで処理されるデータ量。

一般的には、メモリが多いほど、クエリはより速く実行されます。
コスト感度のあるユースケースでは、メモリが少ないことでも対応可能であり、[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)や[`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)のような設定を有効にしてデータをディスクにスピルすることができますが、これはクエリパフォーマンスに大きな影響を与える可能性があることに注意してください。

### メモリ対ストレージの比率はどのくらいにすべきか？ {#what-should-the-memory-to-storage-ratio-be}

データボリュームが少ない場合、1:1のメモリ対ストレージ比率は受け入れ可能ですが、総メモリは最低でも8GBを下回ってはなりません。

データの保持期間が長い場合やデータボリュームが大きいユースケースには、1:100から1:130のメモリ対ストレージ比率をお勧めします。例えば、10TBのデータを保存する場合、各レプリカあたり100GBのRAMが必要です。

顧客向けワークロードのように頻繁にアクセスされるユースケースには、1:30から1:50のメモリ対ストレージ比率でより多くのメモリを使用することをお勧めします。

## レプリカ {#replicas}

各シャードに対して最低でも三つのレプリカを持つことをお勧めします（または、[Amazon EBS](https://aws.amazon.com/ebs/)の場合は二つ）。さらに、追加のレプリカ（水平スケーリング）を追加する前に、すべてのレプリカを垂直スケーリングすることをお勧めします。

ClickHouseは自動的にシャードを作成せず、データセットの再シャーディングにはかなりの計算リソースが必要です。したがって、将来的にデータを再シャーディングする必要がないよう、可能な限り大きなサーバーを使用することを推奨します。

[ClickHouse Cloud](https://clickhouse.com/cloud)の利用を検討してください。これにより、自動的にスケールし、ユースケースに応じてレプリカの数を簡単にコントロールできます。

## 大規模ワークロードのための例示的な構成 {#example-configurations-for-large-workloads}

ClickHouseの構成は、特定のアプリケーションの要件に強く依存します。コストとパフォーマンスの最適化を手伝ってほしい場合は、[営業に連絡](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)してください。

以下は、プロダクション環境で動作するClickHouseユーザーの例示的な構成（推奨ではなくガイダンスとして）です。

### フォーチュン500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間新規データボリューム</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ（圧縮後）</strong></td>
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
        <td><strong>同時処理</strong></td>
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

### フォーチュン500 テレコムオペレーター（ログ記録ユースケース用） {#fortune-500-telecom-operator-for-a-logging-use-case}

<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータボリューム</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ（圧縮後）</strong></td>
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

以下は、オープンソースのClickHouseを使用している企業によるアーキテクチャに関する公開されたブログ投稿です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
