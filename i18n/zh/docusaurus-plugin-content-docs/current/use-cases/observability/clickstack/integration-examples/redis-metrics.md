---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: '使用 ClickStack 监控 Redis 指标'
sidebar_label: 'Redis 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Redis 指标'
doc_type: 'guide'
keywords: ['Redis', 'metrics', 'OTEL', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# 使用 ClickStack 监控 Redis 指标 {#redis-metrics-clickstack}

:::note[TL;DR]
本指南演示如何通过配置 OpenTelemetry collector 的 Redis receiver，使用 ClickStack 监控 Redis 性能指标。你将学会如何：

- 配置 OTel collector 来采集 Redis 指标
- 使用自定义配置部署 ClickStack
- 使用预置仪表板可视化 Redis 性能（commands/sec、内存使用、已连接客户端、缓存性能）

如果你希望在为生产环境 Redis 配置集成之前进行测试，可以使用提供的包含示例指标的演示数据集。

预计耗时：5–10 分钟
:::

## 集成现有 Redis {#existing-redis}

本节介绍如何通过为 ClickStack OTel collector 配置 Redis receiver，将你现有的 Redis 实例配置为向 ClickStack 发送指标数据。

如果你希望在为自己的现有环境进行配置之前先测试 Redis 指标集成，可以使用我们预配置的演示数据集进行测试，详见[下一节](#demo-dataset)。

##### 前提条件 {#prerequisites}

- 正在运行的 ClickStack 实例
- 已部署的 Redis（版本 3.0 或更高）
- ClickStack 到 Redis 的网络连通性（默认端口 6379）
- 如果启用了身份验证，则需要 Redis 密码

<VerticalStepper headerLevel="h4">
  #### 验证 Redis 连接

  首先,验证您可以连接到 Redis 并且 INFO 命令能够正常运行:

  ```bash
  # 测试连接
  redis-cli ping
  # 预期输出：PONG

  # 测试 INFO 命令（由指标收集器使用）
  redis-cli INFO server
  # 应显示 Redis 服务器信息
  ```

  如果 Redis 需要身份验证：

  ```bash
  redis-cli -a <your-password> ping
  ```

  **常见 Redis 端点：**

  * **本地实例**: `localhost:6379`
  * **Docker**：使用容器名称或服务名称（例如 `redis:6379`）
  * **远程**: `<redis-host>:6379`

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry 收集器配置。自定义配置将与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建一个名为 `redis-metrics.yaml` 的文件,其中包含以下配置:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # 如果 Redis 需要身份验证,请取消注释
      # password: ${env:REDIS_PASSWORD}
      
      # 配置要收集的指标
      metrics:
        redis.commands.processed:
          enabled: true
        redis.clients.connected:
          enabled: true
        redis.memory.used:
          enabled: true
        redis.keyspace.hits:
          enabled: true
        redis.keyspace.misses:
          enabled: true
        redis.keys.evicted:
          enabled: true
        redis.keys.expired:
          enabled: true

  processors:
    resource:
      attributes:
        - key: service.name
          value: "redis"
          action: upsert

  service:
    pipelines:
      metrics/redis:
        receivers: [redis]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  此配置：

  * 连接到运行在 `localhost:6379` 的 Redis（请根据实际环境调整端点）
  * 每 10 秒采集一次指标
  * 收集关键性能指标（命令、客户端、内存、键空间统计信息）
  * **根据 [OpenTelemetry 语义约定](https://opentelemetry.io/docs/specs/semconv/resource/#service) 设置必需的 `service.name` 资源属性**
  * 通过专用管道将指标发送到 ClickHouse exporter

  **收集的关键指标：**

  * `redis.commands.processed` - 每秒处理的命令数量
  * `redis.clients.connected` - 连接的客户端数量
  * `redis.clients.blocked` - 因阻塞调用而被阻塞的客户端数量
  * `redis.memory.used` - Redis 已使用的内存（字节）
  * `redis.memory.peak` - 峰值内存使用量
  * `redis.keyspace.hits` - 键空间命中次数
  * `redis.keyspace.misses` - 键查找失败次数（用于计算缓存命中率）
  * `redis.keys.expired` - 已过期的键数量
  * `redis.keys.evicted` - 由于内存压力被逐出的键数量
  * `redis.connections.received` - 接收到的连接总数
  * `redis.connections.rejected` - 被拒绝的连接数

  :::note

  * 你只需要在自定义配置中定义新增的 `receivers`、`processors` 和 `pipelines`
  * 在 ClickStack 的基础配置中，`memory_limiter` 和 `batch` 处理器以及 `clickhouse` 导出器已经预先定义好——只需按名称引用它们即可
  * `resource` 处理器按照 OpenTelemetry 语义约定设置所需的 `service.name` 属性
  * 在生产环境中使用认证时，将密码存储在环境变量 `${env:REDIS_PASSWORD}` 中。
  * 根据您的需求调整 `collection_interval`（默认 10 秒；数值越小，数据量越大）
  * 对于多个 Redis 实例，自定义 `service.name` 以加以区分（例如 `"redis-cache"`、`"redis-sessions"`）
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有的 ClickStack 部署中启用自定义采集器配置，您必须：

  1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
  2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. 确保 ClickStack 与 Redis 之间的网络连通性

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置：

  ```yaml
  services:
    clickstack:
      # ... 现有配置 ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # 可选:如果 Redis 需要身份验证
        # - REDIS_PASSWORD=your-redis-password
        # ... 其他环境变量 ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... 其他卷 ...
      # 如果 Redis 在同一个 compose 文件中:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # 可选:启用身份验证
      # command: redis-server --requirepass your-redis-password
  ```

  ##### 选项 2:Docker run(一体化镜像)

  如果使用 `docker run` 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  **重要提示：** 如果 Redis 运行在另一个容器中，请使用 Docker 网络：

  ```bash
  # 创建网络
  docker network create monitoring

  # 在该网络上运行 Redis
  docker run -d --name redis --network monitoring redis:7-alpine

  # 在同一网络上运行 ClickStack（在配置中将端点更新为 "redis:6379"）
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### 在 HyperDX 中验证指标

  配置完成后,登录 HyperDX 并验证指标数据是否正常流入:

  1. 进入 Metrics Explorer
  2. 搜索以 `redis.` 开头的指标（例如 `redis.commands.processed`、`redis.memory.used`）
  3. 你应该会在配置的采集间隔内看到指标数据点开始出现

  {/* <Image img={metrics_view} alt="Redis 指标视图"/> */ }
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 Redis Metrics 集成的用户，我们提供了一个预先生成的数据集，其中包含具有真实模式特征的 Redis Metrics。

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 {#download-sample}

下载预先生成的指标文件（包含 24 小时的、具有真实模式特征的 Redis Metrics）：
```bash
# 下载 gauge 指标（内存、碎片率）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# 下载 sum 指标（命令、连接、键空间统计）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

该数据集包含逼真的模式：
- **缓存预热事件（06:00）** - 命中率从 30% 上升到 80%
- **流量峰值（14:30-14:45）** - 5 倍流量激增并伴随连接压力
- **内存压力（20:00）** - 键淘汰和缓存性能下降
- **日常流量模式** - 工作时间流量高峰、晚间回落、随机微小突发

#### 启动 ClickStack {#start-clickstack}

启动一个 ClickStack 实例：
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待大约 30 秒让 ClickStack 完全启动。

#### 将指标加载到 ClickStack 中 {#load-metrics}

将指标直接加载到 ClickHouse：
```bash
# 加载 gauge 指标（内存、碎片）
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 加载 sum 指标（命令、连接、键空间）
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### 在 HyperDX 中验证指标 {#verify-metrics}

加载完成后，查看指标的最快方式是使用预先构建的仪表盘。

前往 [Dashboards and visualization](#dashboards) 部分导入仪表盘，并集中查看所有 Redis Metrics。

:::note
演示数据集的时间范围为 2025-10-20 00:00:00 至 2025-10-21 05:00:00。请确保你在 HyperDX 中选择的时间范围与该窗口匹配。

请留意以下有代表性的模式：
- **06:00** - 缓存预热（命中率较低并逐步上升）
- **14:30-14:45** - 流量峰值（客户端连接数很高，出现部分拒绝）
- **20:00** - 内存压力（开始出现键淘汰）
:::

</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 Redis，我们提供了 Redis 指标的基础可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到 **Dashboards** 部分
2. 点击右上角省略号中的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `redis-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入对话框"/>

#### 查看仪表板 {#created-dashboard}

系统会创建一个仪表板，并预先配置好所有可视化组件：

<Image img={example_dashboard} alt="Redis 指标仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)**（可根据你的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 疑难排解 {#troubleshooting}

### 自定义配置未加载

请确认环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 是否已正确设置：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载在 `/etc/otelcol-contrib/custom.config.yaml`：

```bash
docker exec <容器名称> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

查看自定义配置内容，以确认其是否可读：

```bash
docker exec <容器名称> cat /etc/otelcol-contrib/custom.config.yaml
```

### 在 HyperDX 中没有显示指标

验证 collector 是否可以访问 Redis：

```bash
# 从 ClickStack 容器中执行 {#download-sum-metrics-commands-connections-keyspace-stats}
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# 预期输出：PONG
```

检查 `Redis INFO` 命令是否正常工作：

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# 应显示 Redis 统计信息
```

验证当前生效的配置中已包含你的 Redis receiver：

```bash
docker exec <容器> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

检查采集器日志是否有错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# 查找连接错误或认证失败 {#load-gauge-metrics-memory-fragmentation}
```

### 身份验证错误

如果您在日志中看到身份验证错误：

```bash
# 验证 Redis 是否要求身份验证
redis-cli CONFIG GET requirepass

# 测试身份验证
redis-cli -a <password> ping

# 确保在 ClickStack 环境中已设置密码
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

更新您的配置以使用此密码：

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```

### 网络连通性问题

如果 ClickStack 无法访问 Redis：

```bash
# 检查两个容器是否在同一网络上
docker network inspect <network-name>

# 测试连通性
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

确保在 Docker Compose 文件或 `docker run` 命令中，将这两个容器加入同一网络。

## 后续步骤 {#next-steps}

如果想进一步探索，可以通过以下方式继续改进和试验监控配置：

- 为关键指标（内存使用阈值、连接数上限、缓存命中率下降）设置[告警](/use-cases/observability/clickstack/alerts)
- 为特定用例（复制延迟、持久化性能）创建额外的仪表盘
- 通过复制 receiver 配置并使用不同的端点和服务名称，监控多个 Redis 实例