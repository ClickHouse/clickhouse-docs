---
slug: /use-cases/observability/clickstack/integrations/kafka-metrics
title: '使用 ClickStack 监控 Kafka 指标'
sidebar_label: 'Kafka 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Kafka 指标'
doc_type: 'guide'
keywords: ['Kafka', 'metrics', 'OTEL', 'ClickStack', 'JMX']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/kafka/import-kafka-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/kafka/kafka-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Kafka 指标 \{#kafka-metrics-clickstack\}

:::note[TL;DR]
本指南演示如何使用 OpenTelemetry JMX Metric Gatherer，在 ClickStack 中监控 Apache Kafka 性能指标。你将学习如何：

- 在 Kafka broker 上启用 JMX，并配置 JMX Metric Gatherer
- 通过 OTLP 将 Kafka 指标发送到 ClickStack
- 使用预构建的仪表板可视化 Kafka 性能（broker 吞吐量、consumer 滞后、分区健康状况、请求延迟）

如果你希望在为生产 Kafka 集群配置之前先测试集成，可以使用提供的包含示例指标的演示数据集。

预计耗时：10–15 分钟
:::

## 集成现有 Kafka 部署 \{#existing-kafka\}

通过运行 OpenTelemetry JMX Metric Gatherer 容器来收集指标，并通过 OTLP 将这些指标发送到 ClickStack，从而监控你现有的 Kafka 部署。

如果你想在不修改现有环境的情况下先测试此集成，请跳转到[演示数据集部分](#demo-dataset)。

##### 先决条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 已启用 JMX 的现有 Kafka 部署（2.0 或更高版本）
- ClickStack 与 Kafka 之间的网络连通（JMX 端口 9999，Kafka 端口 9092）
- OpenTelemetry JMX Metric Gatherer JAR（下载说明见下文）

<VerticalStepper headerLevel="h4">
  #### 获取 ClickStack API 密钥

  JMX Metric Gatherer 将数据发送到 ClickStack 的 OTLP 端点,该端点需要进行身份验证。

  1. 在你的 ClickStack URL 上打开 HyperDX（例如：http://localhost:8080）
  2. 如有需要，请先创建账户或登录
  3. 前往 **Team Settings → API Keys**
  4. 复制您的**摄取 API key**

  <Image img={api_key} alt="ClickStack API 密钥" />

  5. 将其设置为环境变量：

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### 下载 OpenTelemetry JMX 指标采集器

  下载 JMX Metric Gatherer JAR 文件:

  ```bash
  curl -L -o opentelemetry-jmx-metrics.jar \
    https://github.com/open-telemetry/opentelemetry-java-contrib/releases/download/v1.32.0/opentelemetry-jmx-metrics.jar
  ```

  #### 验证 Kafka JMX 是否已启用

  确保在 Kafka broker 上启用 JMX。对于 Docker 部署:

  ```yaml
  services:
    kafka:
      image: confluentinc/cp-kafka:latest
      environment:
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        # ... other Kafka configuration
      ports:
        - "9092:9092"
        - "9999:9999"
  ```

  对于非 Docker 部署,请在 Kafka 启动时设置以下参数:

  ```bash
  export JMX_PORT=9999
  ```

  验证 JMX 可访问性:

  ```bash
  netstat -an | grep 9999
  ```

  #### 使用 Docker Compose 部署 JMX 指标采集器

  此示例展示了包含 Kafka、JMX Metric Gatherer 和 ClickStack 的完整配置。请根据您现有的部署调整服务名称和端点:

  ```yaml
  services:
    clickstack:
      image: clickhouse/clickstack-all-in-one:latest
      ports:
        - "8080:8080"
        - "4317:4317"
        - "4318:4318"
      networks:
        - monitoring

    kafka:
      image: confluentinc/cp-kafka:latest
      hostname: kafka
      container_name: kafka
      environment:
        KAFKA_NODE_ID: 1
        KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT'
        KAFKA_ADVERTISED_LISTENERS: 'PLAINTEXT://kafka:9092'
        KAFKA_PROCESS_ROLES: 'broker,controller'
        KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka:29093'
        KAFKA_LISTENERS: 'PLAINTEXT://kafka:9092,CONTROLLER://kafka:29093'
        KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
        KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
        KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
        KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
        CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
        JMX_PORT: 9999
        KAFKA_JMX_HOSTNAME: kafka
        KAFKA_JMX_OPTS: '-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=kafka -Dcom.sun.management.jmxremote.rmi.port=9999'
      ports:
        - "9092:9092"
        - "9999:9999"
      networks:
        - monitoring

    kafka-jmx-exporter:
      image: eclipse-temurin:11-jre
      depends_on:
        - kafka
        - clickstack
      environment:
        - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
      volumes:
        - ./opentelemetry-jmx-metrics.jar:/app/opentelemetry-jmx-metrics.jar
      command: >
        sh -c "java
        -Dotel.jmx.service.url=service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi
        -Dotel.jmx.target.system=kafka
        -Dotel.metrics.exporter=otlp
        -Dotel.exporter.otlp.protocol=http/protobuf
        -Dotel.exporter.otlp.endpoint=http://clickstack:4318
        -Dotel.exporter.otlp.headers=authorization=\${CLICKSTACK_API_KEY}
        -Dotel.resource.attributes=service.name=kafka,kafka.broker.id=broker-0
        -Dotel.jmx.interval.milliseconds=10000
        -jar /app/opentelemetry-jmx-metrics.jar"
      networks:
        - monitoring

  networks:
    monitoring:
      driver: bridge
  ```

  **关键配置参数：**

  * `service:jmx:rmi:///jndi/rmi://kafka:9999/jmxrmi` - JMX 连接 URL（使用您的 Kafka 主机名）
  * `otel.jmx.target.system=kafka` - 启用 Kafka 专用指标
  * `http://clickstack:4318` - OTLP HTTP 端点（使用您的 ClickStack 主机名）
  * `authorization=\${CLICKSTACK_API_KEY}` - 用于身份验证的 API 密钥（必需）
  * `service.name=kafka,kafka.broker.id=broker-0` - 资源属性，用于过滤
  * `10000` - 采集间隔，单位为毫秒（10 秒）

  #### 在 HyperDX 中验证指标

  登录 HyperDX 并确认指标正在流入:

  1. 转到 Chart Explorer
  2. 搜索指标 `kafka.message.count` 或 `kafka.partition.count`
  3. 指标应每隔 10 秒出现一次

  **需验证的关键指标：**

  * `kafka.message.count` - 处理的消息总数
  * `kafka.partition.count` - 分区总数
  * `kafka.partition.under_replicated` - 在健康的集群中该指标应为 0
  * `kafka.network.io` - 网络吞吐量
  * `kafka.request.time.*` - 请求延迟百分位数

  为了生成活动并填充更多指标:

  ```bash
  # Create a test topic
  docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

  # Send test messages
  echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
  ```

  :::note
  在 Kafka 容器内运行 Kafka 客户端命令(kafka-topics、kafka-console-producer 等)时,需在命令前添加 `unset JMX_PORT &&` 以防止 JMX 端口冲突。
  :::
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 Kafka Metrics 集成的用户，我们提供了一个预先生成的数据集，其中包含逼真的 Kafka 指标模式。

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 \{#download-sample\}

下载预先生成的指标文件（包含 29 小时的 Kafka 指标数据，具有逼真的指标模式）：
```bash
# 下载 gauge 指标（分区数量、队列大小、延迟、consumer lag）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-gauge.csv

# 下载 sum 指标（消息速率、字节速率、请求数量）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/kafka/kafka-metrics-sum.csv
```

该数据集包含单 broker 架构电商 Kafka 集群的真实模式：
- **06:00-08:00：早高峰（Morning surge）** - 从夜间基线开始的陡峭流量爬升
- **10:00-10:15：限时抢购（Flash sale）** - 流量剧增至正常水平的 3.5 倍
- **11:30：部署事件（Deployment event）** - consumer lag 飙升 12 倍，并出现未完全复制的分区
- **14:00-15:30：购物高峰（Peak shopping）** - 持续高流量，约为基线的 2.8 倍
- **17:00-17:30：下班后高峰（After-work surge）** - 第二次流量高峰
- **18:45：Consumer rebalance** - 重平衡期间 lag 飙升 6 倍
- **20:00-22:00：夜间回落（Evening drop）** - 流量急剧下降回到夜间水平

#### 启动 ClickStack \{#start-clickstack\}

启动一个 ClickStack 实例：
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

#### 将指标加载到 ClickStack 中 \{#load-metrics\}

将指标直接加载到 ClickHouse 中：
```bash
# 加载 gauge 指标（分区数量、队列大小、延迟、consumer lag）
cat kafka-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 加载 sum 指标（消息速率、字节速率、请求数量）
cat kafka-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### 在 HyperDX 中验证指标 \{#verify-demo-metrics\}

加载完成后，最快查看指标的方式是使用预构建的仪表板。

前往 [Dashboards and visualization](#dashboards) 部分以导入该仪表板，并一次性查看所有 Kafka 指标。

:::note[时区显示]
HyperDX 会以浏览器本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**。请将时间范围设置为 **2025-11-04 16:00:00 - 2025-11-07 16:00:00**，以确保无论您身在何处，都能看到演示指标。确认可以看到指标后，可以将范围收窄到 24 小时，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 \{#dashboards\}

为帮助您开始使用 ClickStack 监控 Kafka，我们提供了 Kafka 指标的关键可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/kafka-metrics-dashboard.json')} download="kafka-metrics-dashboard.json" eventName="docs.kafka_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并进入 **Dashboards** 部分
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `kafka-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入对话框"/>

#### 查看仪表板 \{#created-dashboard\}

仪表板会被创建，并且所有可视化视图都会预先配置完成：

<Image img={example_dashboard} alt="Kafka 指标仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-05 16:00:00 - 2025-11-06 16:00:00 (UTC)**（根据您的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

#### 在 HyperDX 中未显示任何指标

**确认 API 密钥已设置并传递给容器：**

```bash
# Check environment variable
echo $CLICKSTACK_API_KEY

# Verify it's in the container
docker exec <jmx-exporter-container> env | grep CLICKSTACK_API_KEY
```

如果未设置，请进行设置并重启：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
docker compose up -d kafka-jmx-exporter
```

**检查指标是否已写入 ClickHouse：**

```bash
docker exec <clickstack-container> clickhouse-client --query "
SELECT DISTINCT MetricName 
FROM otel_metrics_sum 
WHERE ServiceName = 'kafka' 
LIMIT 10
"
```

如果未看到任何结果，请检查 JMX exporter 日志：

```bash
docker compose logs kafka-jmx-exporter | grep -i "error\|connection" | tail -10
```

**产生 Kafka 流量以生成指标数据：**

```bash
# Create a test topic
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --create --topic test-topic --bootstrap-server kafka:9092 --partitions 3 --replication-factor 1"

# Send test messages
echo -e "Message 1\nMessage 2\nMessage 3" | docker exec -i kafka bash -c "unset JMX_PORT && kafka-console-producer --topic test-topic --bootstrap-server kafka:9092"
```


#### 认证错误 \{#download\}

如果看到 `Authorization failed` 或 `401 Unauthorized`：

1. 在 HyperDX UI 中核对 API key（Settings → API Keys → 摄取 API key）
2. 重新导出并重启：

```bash
export CLICKSTACK_API_KEY=your-correct-api-key
docker compose down
docker compose up -d
```


#### Kafka 客户端命令的端口冲突问题 \{#import-dashboard\}

在 Kafka 容器内运行 Kafka 命令时，可能会看到类似如下内容：

```bash
Error: Port already in use: 9999
```

在命令前添加 `unset JMX_PORT &&` 前缀：

```bash
docker exec kafka bash -c "unset JMX_PORT && kafka-topics --list --bootstrap-server kafka:9092"
```


#### 网络连接问题 \{#created-dashboard\}

如果 JMX exporter 的日志显示 `Connection refused`：

检查所有容器是否位于同一个 Docker 网络中：

```bash
docker compose ps
docker network inspect <network-name>
```

测试连接：

```bash
# From JMX exporter to ClickStack
docker exec <jmx-exporter-container> sh -c "timeout 2 bash -c 'cat < /dev/null > /dev/tcp/clickstack/4318' && echo 'Connected' || echo 'Failed'"
```


## 进入生产环境 \{#going-to-production\}

本指南中是将指标直接从 JMX Metric Gatherer 发送到 ClickStack 的 OTLP 端点，这种方式适用于测试和小规模部署。 

在生产环境中，请部署自建的 OpenTelemetry Collector 作为代理，从 JMX Exporter 接收指标并将其转发到 ClickStack。这样可以提供批处理能力、弹性以及集中式配置管理。

有关生产部署模式和 Collector 配置示例，请参阅[使用 OpenTelemetry 进行摄取](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。