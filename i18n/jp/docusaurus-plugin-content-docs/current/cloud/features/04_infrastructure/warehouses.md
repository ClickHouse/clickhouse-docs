---
'title': '倉庫'
'slug': '/cloud/reference/warehouses'
'keywords':
- 'compute separation'
- 'cloud'
- 'architecture'
- 'compute-compute'
- 'warehouse'
- 'warehouses'
- 'hydra'
'description': 'ClickHouse Cloud におけるコンピュート・コンピュート分離'
'doc_type': 'reference'
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';


# Warehouses

## What is compute-compute separation? {#what-is-compute-compute-separation}

Compute-compute separationは、ScaleおよびEnterpriseティアで利用可能です。

各ClickHouse Cloudサービスには以下が含まれます:
- 2つ以上のClickHouseノード（またはレプリカ）のグループが必要ですが、子サービスは単一のレプリカで構いません。
- サービスに接続するために使用するエンドポイント（またはClickHouse Cloud UIコンソールを介して作成された複数のエンドポイント）。例えば、`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`のようなURLです。
- サービスがすべてのデータと部分的なメタデータを保存するオブジェクトストレージフォルダー：

:::note
子の単一サービスは、単一の親サービスと異なり、縦にスケールできます。
:::

<Image img={compute_1} size="md" alt="Current service in ClickHouse Cloud" />

<br />

_Fig. 1 - ClickHouse Cloudの現在のサービス_

Compute-compute separationは、ユーザーが同じオブジェクトストレージフォルダーを使用している複数の計算ノードグループを作成することを可能にします。また、同じテーブル、ビューなどを使用します。

各計算ノードグループは独自のエンドポイントを持つため、ワークロードに使用するレプリカのセットを選択できます。ワークロードの一部は小さなレプリカ1つで満たされるかもしれませんが、他のワークロードは完全な高可用性（HA）と数百ギガバイトのメモリを必要とする場合があります。Compute-compute separationは、読み取り操作と書き込み操作を分離することも可能にし、互いに干渉しないようにします：

<Image img={compute_2} size="md" alt="Compute separation in ClickHouse Cloud" />

<br />

_Fig. 2 - ClickHouse Cloudの計算分離_

同じデータを共有する既存のサービスと共有する追加のサービスを作成したり、同じデータを共有する複数のサービスを持つ新しいセットアップを作成することが可能です。

## What is a warehouse? {#what-is-a-warehouse}

ClickHouse Cloudにおける _warehouse_ は、同じデータを共有するサービスのセットです。
各warehouseには、プライマリーサービス（最初に作成されたサービス）とセカンダリーサービスが存在します。例えば、以下のスクリーンショットでは、「DWH Prod」というwarehouseに2つのサービスが表示されています：

- プライマリーサービス `DWH Prod`
- セカンダリーサービス `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="Warehouse example with primary and secondary services" background='white' />

<br />

_Fig. 3 - Warehouseの例_

warehouse内のすべてのサービスは以下を共有します：

- リージョン（例：us-east1）
- クラウドサービスプロバイダー（AWS、GCP、またはAzure）
- ClickHouseデータベースのバージョン

サービスは、それが属するwarehouseによってソートすることができます。

## Access controls {#access-controls}

### Database credentials {#database-credentials}

warehouse内のすべてが同じテーブルセットを共有するため、他のサービスへのアクセス制御も共有します。つまり、サービス1で作成されたすべてのデータベースユーザーは、同じ権限（テーブル、ビューなどの権限）でサービス2を利用できるようになります。そしてその逆も同様です。ユーザーは各サービスごとに別のエンドポイントを使用しますが、同じユーザー名とパスワードを使用します。言い換えれば、_ユーザーは同じストレージで動作するサービス間で共有されます：_

<Image img={compute_3} size="md" alt="User access across services sharing same data" />

<br />

_Fig. 4 - ユーザーAliceはサービス1で作成されましたが、同じデータを共有する全てのサービスにアクセスするために同じ資格情報を使用できます_

### Network access control {#network-access-control}

特定のサービスが他のアプリケーションやアドホックユーザーによって使用されるのを制限することが役立つことがよくあります。これは、一般的なサービスの設定と同様に、ネットワーク制限を使用することで行うことができます（ClickHouse Cloudコンソールの特定のサービスのサービスタブにある**設定**に移動）。

各サービスにIPフィルタリング設定を個別に適用でき、どのアプリケーションがどのサービスにアクセスできるかを制御できます。これにより、特定のサービスの使用を制限することができます：

<Image img={compute_4} size="md" alt="Network access control settings"/>

<br />

_Fig. 5 - Aliceはネットワーク設定のためサービス2にアクセスすることが制限されています_

### Read vs read-write {#read-vs-read-write}

特定のサービスへの書き込みアクセスを制限し、warehouse内のサブセットのサービスのみに書き込みを許可することが時には有用です。これは、2番目およびそれ以降のサービスを作成する際に行うことができます（最初のサービスは常に読み書き可能である必要があります）：

<Image img={compute_5} size="lg" alt="Read-write and Read-only services in a warehouse"/>

<br />

_Fig. 6 - Warehouseの読み書きと読み取り専用サービス_

:::note
1. 読み取り専用サービスは現在、ユーザー管理操作（作成、削除など）を許可します。この挙動は将来的に変更される可能性があります。
2. 現在、更新可能なマテリアライズドビューは、読み取り専用サービスを含むwarehouse内のすべてのサービスで実行されます。ただし、この挙動は将来的に変更され、RWサービスのみに対して実行されるようになります。
:::

## Scaling {#scaling}

warehouse内の各サービスは、以下の観点でワークロードに合わせて調整できます：
- ノード数（レプリカ）。プライマリーサービス（warehouse内で最初に作成されたサービス）は2つ以上のノードを持つ必要があります。各セカンダリーサービスには1つ以上のノードを持たせることができます。
- ノード（レプリカ）のサイズ
- サービスが自動的にスケールするかどうか
- サービスが非アクティブ時にアイドル状態になるかどうか（グループ内の最初のサービスには適用できません - **制限**セクションを参照してください）

## Changes in behavior {#changes-in-behavior}

サービスのcompute-computeが有効になると（少なくとも1つのセカンダリーサービスが作成されている）、`clusterAllReplicas()`関数呼び出しは、呼び出されたサービスからのレプリカのみを利用します。つまり、同じデータセットに接続されている2つのサービスがあり、サービス1から`clusterAllReplicas(default, system, processes)`が呼び出されると、サービス1で実行中のプロセスのみが表示されます。必要に応じて、例えば`clusterAllReplicas('all_groups.default', system, processes)`を呼び出してすべてのレプリカにアクセスすることも可能です。

## Limitations {#limitations}

1. **プライマリーサービスは常に稼働していなければならず、アイドル状態にしてはいけません（制限はGA後しばらくの間解除されます）。** プライベートプレビューおよびGA後しばらくの間、プライマリーサービス（通常は他のサービスを追加することで拡張したい既存のサービス）は常に稼働しており、アイドル設定は無効になります。少なくとも1つのセカンダリーサービスがある場合、プライマリーサービスを停止またはアイドルにすることはできません。すべてのセカンダリーサービスが削除された後、元のサービスを再び停止またはアイドルにすることができます。

2. **ワークロードを分離できない場合があります。** データベースのワークロードを互いに分離するオプションを提供することが目標ですが、特定のワークロードが同じデータを共有する別のサービスに影響を及ぼす可能性のある特殊なケースが存在します。これらはOLTPのようなワークロードに主に関連するかなり稀な状況です。

3. **すべての読み書きサービスはバックグラウンドのマージ操作を行っています。** ClickHouseにデータを挿入すると、データベースは最初にいくつかのステージングパーティションにデータを挿入し、その後バックグラウンドでマージを実行します。これらのマージはメモリとCPUリソースを消費する可能性があります。同じストレージを共有する2つの読み書きサービスはどちらもバックグラウンドオペレーションを実行しています。つまり、サービス1で`INSERT`クエリがありながら、マージ操作はサービス2によって完了する場合があります。なお、読み取り専用サービスはバックグラウンドでのマージを実行しないため、この操作にはリソースを消費しません。

4. **すべての読み書きサービスはS3Queueテーブルエンジンの挿入操作を実行しています。** RWサービスでS3Queueテーブルを作成すると、WH内の他のすべてのRWサービスがS3からデータを読み取り、データベースに書き込む操作を実行する可能性があります。

5. **1つの読み書きサービスでの挿入が、別の読み書きサービスがアイドル状態になるのを妨げる場合があります（アイドルが有効な場合）。** 結果として、2つ目のサービスは最初のサービスのためにバックグラウンドマージ操作を実行します。これらのバックグラウンドオペレーションは、アイドル時に2つ目のサービスをスリープ状態にするのを妨げることがあります。バックグラウンドオペレーションが終了すると、サービスはアイドル状態になります。読み取り専用サービスは影響を受けず、遅延なくアイドル状態になります。

6. **CREATE/RENAME/DROP DATABASEクエリは、デフォルトでアイドルまたは停止したサービスによってブロックされる可能性があります。** これらのクエリはハングする可能性があります。これを回避するには、セッションまたはクエリごとに`settings distributed_ddl_task_timeout=0`でデータベース管理クエリを実行できます。例えば：

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

7. **非常に稀な場合、長期間（数日間）アイドルまたは停止されたセカンダリーサービスが同じwarehouse内の他のサービスのパフォーマンスを低下させる可能性があります。** この問題は間もなく解決され、バックグラウンドで実行されている変異に関連しています。この問題が発生していると思われる場合は、ClickHouse [Support](https://clickhouse.com/support/program)にお問い合わせください。

8. **現在、warehouseあたりのサービスのソフトリミットは5です。** 1つのwarehouseに5つ以上のサービスが必要な場合は、サポートチームに連絡してください。

## Pricing {#pricing}

Computeの価格は、warehouse内のすべてのサービス（プライマリーとセカンダリー）で同じです。ストレージは1回のみ請求されます - 最初（元）のサービスに含まれています。

ワークロードのサイズとティアの選択に基づいてコストを見積もるのに役立つ[pricing](https://clickhouse.com/pricing)ページの価格計算機を参照してください。

## Backups {#backups}

- 単一のwarehouse内のすべてのサービスが同じストレージを共有しているため、バックアップはプライマリー（初期）サービスに対してのみ作成されます。これにより、warehouse内のすべてのサービスのデータがバックアップされます。
- warehouseのプライマリーサービスからバックアップを復元すると、新しいサービスに復元され、既存のwarehouseとは接続されません。復元が完了したら、新しいサービスに追加のサービスをすぐに追加できます。

## Using warehouses {#using-warehouses}

### Creating a warehouse {#creating-a-warehouse}

warehouseを作成するには、既存のサービスとデータを共有する2番目のサービスを作成する必要があります。これは、任意の既存のサービスの横にあるプラス記号をクリックすることで行えます：

<Image img={compute_7} size="md" alt="Creating a new service in a warehouse" border background='white' />

<br />

_Fig. 7 - warehouseに新しいサービスを作成するためにプラス記号をクリック_

サービス作成画面では、元のサービスが新しいサービスのデータソースとしてドロップダウンに選択されます。作成されると、これら2つのサービスはwarehouseを形成します。

### Renaming a warehouse {#renaming-a-warehouse}

warehouseの名前を変更するには2つの方法があります：

- サービスページの右上隅で「Sort by warehouse」を選択し、次にwarehouse名の近くにある鉛筆アイコンをクリックする。
- 任意のサービスのwarehouse名をクリックし、そこでwarehouseの名前を変更する。

### Deleting a warehouse {#deleting-a-warehouse}

warehouseを削除することは、すべての計算サービスとデータ（テーブル、ビュー、ユーザーなど）を削除することを意味します。このアクションは元に戻せません。
最初に作成されたサービスを削除することによってのみ、warehouseを削除できます。これを行うには：

1. 最初に作成されたサービスに追加して作成されたすべてのサービスを削除する;
2. 最初のサービスを削除する（注意：このステップでwarehouseのすべてのデータが削除されます）。
