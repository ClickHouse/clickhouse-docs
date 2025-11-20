---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: 'サイジングとハードウェアの推奨事項'
sidebar_position: 4
title: 'サイジングとハードウェアの推奨事項'
description: 'このガイドでは、オープンソース版ユーザー向けに、ハードウェア、コンピュート、メモリ、ディスク構成に関する一般的な推奨事項について説明します。'
doc_type: 'guide'
keywords: ['sizing', 'hardware', 'capacity planning', 'best practices', 'performance']
---



# サイジングとハードウェアの推奨事項

本ガイドでは、オープンソース版ユーザー向けのハードウェア、コンピュート、メモリ、ディスク構成に関する一般的な推奨事項について説明します。セットアップを簡素化したい場合は、[ClickHouse Cloud](https://clickhouse.com/cloud)の利用を推奨します。ClickHouse Cloudは、インフラストラクチャ管理に関するコストを最小限に抑えながら、ワークロードに応じて自動的にスケーリングし適応します。

ClickHouseクラスタの構成は、アプリケーションのユースケースとワークロードパターンに大きく依存します。アーキテクチャを計画する際には、以下の要素を考慮する必要があります:

- 同時実行数(1秒あたりのリクエスト数)
- スループット(1秒あたりに処理される行数)
- データ量
- データ保持ポリシー
- ハードウェアコスト
- メンテナンスコスト



## ディスク {#disk}

ClickHouseで使用するディスクの種類は、データ量、レイテンシ、またはスループットの要件によって決まります。

### パフォーマンスの最適化 {#optimizing-for-performance}

パフォーマンスを最大化するには、IOに最適化された[AWSのプロビジョンドIOPS SSDボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)、またはご利用のクラウドプロバイダーの同等のサービスを直接アタッチすることを推奨します。

### ストレージコストの最適化 {#optimizing-for-storage-costs}

コストを抑えるには、[汎用SSD EBSボリューム](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)を使用できます。

また、[ホット/ウォーム/コールドアーキテクチャ](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)でSSDとHDDを使用した階層型ストレージを実装することもできます。あるいは、コンピュートとストレージを分離するために[AWS S3](https://aws.amazon.com/s3/)をストレージとして使用することも可能です。オープンソース版ClickHouseでコンピュートとストレージを分離して使用する方法については、[こちら](/guides/separation-storage-compute)のガイドをご参照ください。ClickHouse Cloudでは、コンピュートとストレージの分離がデフォルトで利用可能です。


## CPU {#cpu}

### どのCPUを使用すべきか？ {#which-cpu-should-i-use}

使用すべきCPUの種類は、使用パターンによって異なります。ただし一般的に、頻繁に多数の同時クエリを実行し、より多くのデータを処理する、または計算集約的なUDFを使用するアプリケーションでは、より多くのCPUコアが必要になります。

**低レイテンシまたは顧客向けアプリケーション**

顧客向けワークロードなど、数十ミリ秒のレイテンシ要件がある場合は、AWSのEC2 [i3シリーズ](https://aws.amazon.com/ec2/instance-types/i3/)または[i4iシリーズ](https://aws.amazon.com/ec2/instance-types/i4i/)、あるいはクラウドプロバイダーの同等のIO最適化インスタンスを推奨します。

**高並行性アプリケーション**

並行性の最適化が必要なワークロード(毎秒100以上のクエリ)には、AWSの[コンピューティング最適化Cシリーズ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)、またはクラウドプロバイダーの同等のインスタンスを推奨します。

**データウェアハウスのユースケース**

データウェアハウスのワークロードやアドホック分析クエリには、メモリ最適化されたAWSの[Rタイプシリーズ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)、またはクラウドプロバイダーの同等のインスタンスを推奨します。

---

### CPU使用率はどの程度であるべきか？ {#what-should-cpu-utilization-be}

ClickHouseには標準的なCPU使用率の目標値はありません。[iostat](https://linux.die.net/man/1/iostat)などのツールを使用して平均CPU使用率を測定し、予期しないトラフィックの急増に対応できるようサーバーのサイズを適宜調整してください。ただし、アドホッククエリを伴う分析またはデータウェアハウスのユースケースでは、CPU使用率を10〜20%に目標設定することを推奨します。

### いくつのCPUコアを使用すべきか？ {#how-many-cpu-cores-should-i-use}

使用すべきCPU数はワークロードによって異なります。ただし、CPUタイプに基づいて、一般的に以下のメモリ対CPUコア比を推奨します:

- **[Mタイプ](https://aws.amazon.com/ec2/instance-types/)(汎用ユースケース):** メモリ対CPUコア比 4 GB:1
- **[Rタイプ](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)(データウェアハウスのユースケース):** メモリ対CPUコア比 8 GB:1
- **[Cタイプ](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)(コンピューティング最適化のユースケース):** メモリ対CPUコア比 2 GB:1

例えば、MタイプのCPUを使用する場合、25個のCPUコアあたり100GBのメモリをプロビジョニングすることを推奨します。アプリケーションに適したメモリ量を決定するには、メモリ使用量のプロファイリングが必要です。[メモリ問題のデバッグに関するガイド](/guides/developer/debugging-memory-issues)を参照するか、[組み込みの可観測性ダッシュボード](/operations/monitoring)を使用してClickHouseを監視できます。


## メモリ {#memory}

CPUの選択と同様に、メモリ対ストレージ比率およびメモリ対CPU比率の選択は、ユースケースによって異なります。

必要なRAM容量は、一般的に以下の要因に依存します:

- クエリの複雑さ
- クエリで処理されるデータ量

ただし、一般的には、メモリが多いほどクエリの実行速度は速くなります。
コストを重視するユースケースの場合、設定([`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)および[`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort))を有効にしてデータをディスクにスピルすることで、少ないメモリ量でも動作しますが、これによりクエリパフォーマンスが大幅に低下する可能性があることに注意してください。

### メモリ対ストレージ比率はどのくらいにすべきか? {#what-should-the-memory-to-storage-ratio-be}

データ量が少ない場合、1:1のメモリ対ストレージ比率で問題ありませんが、総メモリ容量は8GB以上にする必要があります。

データの保持期間が長い場合やデータ量が多い場合のユースケースでは、1:100から1:130のメモリ対ストレージ比率を推奨します。例えば、10TBのデータを保存する場合、レプリカあたり100GBのRAMが必要です。

顧客向けワークロードなど、アクセス頻度が高いユースケースでは、1:30から1:50のメモリ対ストレージ比率で、より多くのメモリを使用することを推奨します。


## レプリカ {#replicas}

シャードごとに最低3つのレプリカを用意することを推奨します（[Amazon EBS](https://aws.amazon.com/ebs/)を使用する場合は2つ）。また、レプリカを追加する（水平スケーリング）前に、既存のすべてのレプリカを垂直スケーリングすることを推奨します。

ClickHouseは自動的にシャーディングを行わないため、データセットの再シャーディングには多大な計算リソースが必要となります。そのため、将来的にデータの再シャーディングが必要にならないよう、利用可能な最大規模のサーバーを使用することを推奨します。

自動スケーリング機能を備え、ユースケースに応じてレプリカ数を簡単に制御できる[ClickHouse Cloud](https://clickhouse.com/cloud)の使用もご検討ください。


## 大規模ワークロードの構成例 {#example-configurations-for-large-workloads}

ClickHouseの構成は、お客様のアプリケーション固有の要件に大きく依存します。コストとパフォーマンスの最適化についてサポートが必要な場合は、[営業チームにお問い合わせ](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)ください。

参考情報として(推奨ではありません)、以下は本番環境で稼働しているClickHouseユーザーの構成例です:

### Fortune 500 B2B SaaS企業 {#fortune-500-b2b-saas}

<table>
  <tr>
    <td col='2'>
      <strong>
        <em>ストレージ</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>月間新規データ量</strong>
    </td>
    <td>30TB</td>
  </tr>
  <tr>
    <td>
      <strong>総ストレージ容量(圧縮後)</strong>
    </td>
    <td>540TB</td>
  </tr>
  <tr>
    <td>
      <strong>データ保持期間</strong>
    </td>
    <td>18ヶ月</td>
  </tr>
  <tr>
    <td>
      <strong>ノードあたりのディスク容量</strong>
    </td>
    <td>25TB</td>
  </tr>
  <tr>
    <td col='2'>
      <strong>
        <em>CPU</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>同時実行数</strong>
    </td>
    <td>200以上の同時クエリ</td>
  </tr>
  <tr>
    <td>
      <strong>レプリカ数(HAペアを含む)</strong>
    </td>
    <td>44</td>
  </tr>
  <tr>
    <td>
      <strong>ノードあたりのvCPU数</strong>
    </td>
    <td>62</td>
  </tr>
  <tr>
    <td>
      <strong>総vCPU数</strong>
    </td>
    <td>2700</td>
  </tr>
  <tr>
    <td col='2'>
      <strong>
        <em>メモリ</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>総RAM容量</strong>
    </td>
    <td>11TB</td>
  </tr>
  <tr>
    <td>
      <strong>レプリカあたりのRAM容量</strong>
    </td>
    <td>256GB</td>
  </tr>
  <tr>
    <td>
      <strong>RAMとvCPUの比率</strong>
    </td>
    <td>4 GB:1</td>
  </tr>
  <tr>
    <td>
      <strong>RAMとディスクの比率</strong>
    </td>
    <td>1:50</td>
  </tr>
</table>

### Fortune 500通信事業者のログユースケース {#fortune-500-telecom-operator-for-a-logging-use-case}


<table>
    <tr>
        <td col="2"><strong><em>ストレージ</em></strong></td>
    </tr>
    <tr>
        <td><strong>月間ログデータ量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>総ストレージ容量(圧縮後)</strong></td>
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
        <td><strong>レプリカ数(HAペアを含む)</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>ノードあたりのvCPU数</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>総vCPU数</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>メモリ</em></strong></td>
    </tr>
    <tr>
        <td><strong>総RAM容量</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>レプリカあたりのRAM容量</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM対vCPU比</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM対ディスク比</strong></td>
        <td>1:60</td>
    </tr>
</table>



## 参考資料 {#further-reading}

以下は、オープンソース版ClickHouseを使用している企業のアーキテクチャに関する公開ブログ記事です：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
