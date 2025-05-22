import Image from '@theme/IdealImage';
import airbyte01 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_01.png';
import airbyte02 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_02.png';
import airbyte03 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_03.png';
import airbyte04 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_04.png';
import airbyte05 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_05.png';
import airbyte06 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_06.png';
import airbyte07 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_07.png';
import airbyte08 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_08.png';
import airbyte09 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_09.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 Airbyte 连接到 ClickHouse

<CommunityMaintainedBadge/>

:::note
请注意，Airbyte 的 ClickHouse 源和目标目前处于 Alpha 状态，不适合移动大型数据集（> 1000 万行）。
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a> 是一个开源数据集成平台。它允许创建 <a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a> 数据管道，并提供 140 多个开箱即用的连接器。本逐步教程显示如何将 Airbyte 连接到 ClickHouse 作为目标并加载示例数据集。

## 1. 下载并运行 Airbyte {#1-download-and-run-airbyte}

1. Airbyte 运行在 Docker 上并使用 `docker-compose`。请确保下载并安装最新版本的 Docker。

2. 通过克隆官方 Github 存储库并在您喜欢的终端中运行 `docker-compose up` 来部署 Airbyte：

```bash
git clone https://github.com/airbytehq/airbyte.git --depth=1
cd airbyte
./run-ab-platform.sh
```

4. 当您在终端中看到 Airbyte 横幅时，可以连接到 <a href="http://localhost:8000" target="_blank">localhost:8000</a>。

    <Image img={airbyte01} size="lg" border alt="Airbyte banner" />

        :::note
        或者，您可以注册并使用 <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>。
        :::

## 2. 添加 ClickHouse 作为目标 {#2-add-clickhouse-as-a-destination}

在本节中，我们将展示如何将 ClickHouse 实例添加为目标。

1. 启动您的 ClickHouse 服务器（Airbyte 与 ClickHouse 版本 `21.8.10.19` 或更高版本兼容）或登录到您的 ClickHouse 云帐户：

```bash
clickhouse-server start
```

2. 在 Airbyte 中，选择“目标”页面并添加一个新目标：

    <Image img={airbyte02} size="lg" border alt="Add a destination in Airbyte" />

3. 从“目标类型”下拉列表中选择 ClickHouse，并填写“设置目标”表单，提供您的 ClickHouse 主机名和端口、数据库名称、用户名和密码，并选择是否使用 SSL 连接（相当于 `clickhouse-client` 中的 `--secure` 标志）：

    <Image img={airbyte03} size="lg" border alt="ClickHouse destination creation in Airbyte" />

4. 恭喜您！您现在已在 Airbyte 中添加 ClickHouse 作为目标。

:::note
为了将 ClickHouse 用作目标，您将使用的用户需要拥有创建数据库、表和插入行的权限。我们建议为 Airbyte 创建一个专用用户（例如 `my_airbyte_user`），并授予以下权限：

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::


## 3. 添加数据集作为源 {#3-add-a-dataset-as-a-source}

我们将使用的示例数据集是 <a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">纽约市出租车数据</a>（在 <a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a> 上）。在本教程中，我们将使用该数据集的一个子集，该子集对应于 2022 年 1 月。

1. 在 Airbyte 中，选择“源”页面并添加一个新源，类型为文件。

    <Image img={airbyte04} size="lg" border alt="Add a source in Airbyte" />

2. 填写“设置源”表单，为源命名并提供 NYC 出租车 2022 年 1 月文件的 URL（请见下文）。确保选择 `parquet` 作为文件格式，`HTTPS Public Web` 作为存储提供者，`nyc_taxi_2022` 作为数据集名称。

```text
https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
```

    <Image img={airbyte05} size="lg" border alt="ClickHouse source creation in Airbyte" />

3. 恭喜您！您现在已在 Airbyte 中添加了源文件。


## 4. 创建连接并将数据集加载到 ClickHouse {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. 在 Airbyte 中，选择“连接”页面并添加一个新连接。

<Image img={airbyte06} size="lg" border alt="Add a connection in Airbyte" />

2. 选择“使用现有源”，然后选择纽约市出租车数据，再选择“使用现有目标”并选择您的 ClickHouse 实例。

3. 填写“设置连接”表单，选择复制频率（在本教程中我们将使用 `manual`），并选择 `nyc_taxi_2022` 作为您要同步的流。确保选择 `Normalized Tabular Data` 作为标准化。

<Image img={airbyte07} size="lg" border alt="Connection creation in Airbyte" />

4. 连接创建后，单击“立即同步”以触发数据加载（因为我们选择了 `Manual` 作为复制频率）。

<Image img={airbyte08} size="lg" border alt="Sync now in Airbyte" />

5. 您的数据将开始加载，您可以展开视图以查看 Airbyte 日志和进度。操作完成后，您将在日志中看到“成功完成”消息：

<Image img={airbyte09} size="lg" border alt="Completed successfully" />

6. 使用您首选的 SQL 客户端连接到您的 ClickHouse 实例，并检查结果表：

```sql
SELECT *
FROM nyc_taxi_2022
LIMIT 10
```

        响应应如下所示：
```response
Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
│     0 │     0.5 │        2 │          1 │          0 │           0 │        11.5 │           68 │          170 │            2 │            0 │         14.8 │           2.2 │               1 │ N                  │                  2.5 │ 2022-01-25T13:19:26  │                   0.3 │ 2022-01-25T13:36:19   │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │    2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
│   2.5 │     0.5 │        1 │          1 │       0.88 │           0 │         5.5 │           79 │          137 │            1 │            0 │         9.68 │           1.1 │               1 │ N                  │                  2.5 │ 2022-01-22T15:45:09  │                   0.3 │ 2022-01-22T15:50:16   │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │    2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
│  1.75 │     0.5 │        1 │          1 │        7.5 │        1.25 │        27.5 │           17 │          138 │            1 │            0 │        37.55 │             9 │               1 │ N                  │                    0 │ 2022-01-30T21:58:19  │                   0.3 │ 2022-01-30T22:19:30   │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │    2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
│   0.5 │     0.5 │        2 │          1 │          0 │           0 │          13 │           79 │          140 │            2 │            0 │         16.8 │          3.19 │               1 │ N                  │                  2.5 │ 2022-01-26T20:43:14  │                   0.3 │ 2022-01-26T20:58:08   │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │    2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
```

```sql
SELECT count(*)
FROM nyc_taxi_2022
```

        响应为：
```response
Query id: a9172d39-50f7-421e-8330-296de0baa67e

┌─count()─┐
│ 2392428 │
└─────────┘
```



7. 请注意，Airbyte 自动推断了数据类型，并在目标表中添加了 4 列。这些列用于 Airbyte 管理复制逻辑和记录操作。更多详细信息，请参见 <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">Airbyte 官方文档</a>。

```sql
`_airbyte_ab_id` String,
`_airbyte_emitted_at` DateTime64(3, 'GMT'),
`_airbyte_normalized_at` DateTime,
`_airbyte_nyc_taxi_072021_hashid` String
```

        现在数据集已经加载到您的 ClickHouse 实例中，您可以创建一个新表并使用更合适的 ClickHouse 数据类型（<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">更多详细信息</a>）。


8. 恭喜您 - 使用 Airbyte 成功将纽约出租车数据加载到 ClickHouse 中！
