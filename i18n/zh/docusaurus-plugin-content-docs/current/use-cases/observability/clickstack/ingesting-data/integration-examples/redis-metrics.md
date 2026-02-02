---
slug: /use-cases/observability/clickstack/integrations/redis-metrics
title: '使用 ClickStack 监控 Redis 指标'
sidebar_label: 'Redis 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Redis 指标'
doc_type: 'guide'
keywords: ['Redis', '指标', 'OTel', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/import-redis-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Redis 指标 \{#redis-metrics-clickstack\}

:::note[摘要]
本指南介绍如何通过配置 OpenTelemetry collector 的 Redis receiver，在 ClickStack 中监控 Redis 性能指标。你将学习如何：

- 配置 OTel collector 来采集 Redis 指标
- 使用自定义配置部署 ClickStack
- 使用预先构建的仪表板可视化 Redis 性能（commands/sec、内存使用量、已连接客户端、缓存性能）

如果你希望在为生产环境中的 Redis 配置集成之前先进行测试，可以使用提供的包含示例指标的演示数据集。

所需时间：5-10 分钟
:::

## 集成现有 Redis \{#existing-redis\}

本节介绍如何通过使用 Redis 接收器配置 ClickStack OTel collector，将你现有的 Redis 部署配置为向 ClickStack 发送指标。

如果你希望在为自己的现有环境进行配置之前先测试 Redis 指标集成，可以使用我们预先配置的演示数据集进行测试，详见[下一节](#demo-dataset)。

##### 前提条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 已存在的 Redis 安装（版本 3.0 或更高）
- 从 ClickStack 到 Redis 的网络连通性（默认端口 6379）
- 如果启用了认证，则需要 Redis 密码

<VerticalStepper headerLevel="h4">
  #### 验证 Redis 连接

  首先,验证您可以连接到 Redis 且 INFO 命令可正常运行:

  ```bash
  # Test connection
  redis-cli ping
  # Expected output: PONG

  # Test INFO command (used by metrics collector)
  redis-cli INFO server
  # Should display Redis server information
  ```

  如果 Redis 需要身份验证:

  ```bash
  redis-cli -a <your-password> ping
  ```

  **常见 Redis 端点:**

  * **本地实例**：`localhost:6379`
  * **Docker**：使用容器名或服务名（例如 `redis:6379`）
  * **远程地址**: `<redis-host>:6379`

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry 采集器的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建一个名为 `redis-metrics.yaml` 的文件,使用以下配置:

  ```yaml title="redis-metrics.yaml"
  receivers:
    redis:
      endpoint: "localhost:6379"
      collection_interval: 10s
      # Uncomment if Redis requires authentication
      # password: ${env:REDIS_PASSWORD}
      
      # Configure which metrics to collect
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

  该配置：

  * 连接到运行在 `localhost:6379` 上的 Redis（根据你的环境调整该端点）
  * 每 10 秒采集一次指标
  * 收集关键性能指标（命令、客户端、内存、键空间统计信息）
  * **根据 [OpenTelemetry 语义约定](https://opentelemetry.io/docs/specs/semconv/resource/#service) 设置必需的 `service.name` 资源属性**
  * 通过专用管道将指标转发到 ClickHouse exporter

  **收集的关键指标：**

  * `redis.commands.processed` - 每秒处理的命令数量
  * `redis.clients.connected` - 已连接的客户端数量
  * `redis.clients.blocked` - 因阻塞式调用而被阻塞的客户端数量
  * `redis.memory.used` - Redis 已使用的内存（字节）
  * `redis.memory.peak` - 峰值内存使用量
  * `redis.keyspace.hits` - 成功的键空间命中次数
  * `redis.keyspace.misses` - 键查找失败次数（用于计算缓存命中率）
  * `redis.keys.expired` - 已过期的键数量
  * `redis.keys.evicted` - 由于内存压力而被逐出的键
  * `redis.connections.received` - 已接收的连接总数
  * `redis.connections.rejected` - 被拒绝的连接次数

  :::note

  * 你只需要在自定义配置中定义新的 receiver、processor 和 pipeline 即可
  * `memory_limiter` 和 `batch` 处理器以及 `clickhouse` 导出器已经在基础 ClickStack 配置中定义好——只需按名称引用它们即可
  * `resource` 处理器会按照 OpenTelemetry 语义约定设置必需的 `service.name` 属性
  * 在生产环境中启用身份验证时，将密码存储在环境变量中：`${env:REDIS_PASSWORD}`
  * 根据需要调整 `collection_interval`（默认 10 秒；值越小，数据量越大）
  * 对于多个 Redis 实例，为每个实例自定义 `service.name` 以进行区分（例如 `"redis-cache"`、`"redis-sessions"`）
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有 ClickStack 部署中启用自定义采集器配置,您必须:

  1. 将自定义配置文件挂载为 `/etc/otelcol-contrib/custom.config.yaml`
  2. 将环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 设置为 `/etc/otelcol-contrib/custom.config.yaml`
  3. 确保 ClickStack 能与 Redis 正常通信

  ##### 选项 1:Docker Compose

  更新您的 ClickStack 部署配置:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # Optional: If Redis requires authentication
        # - REDIS_PASSWORD=your-redis-password
        # ... other environment variables ...
      volumes:
        - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        # ... other volumes ...
      # If Redis is in the same compose file:
      depends_on:
        - redis

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      # Optional: Enable authentication
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

  **重要提示:** 如果 Redis 运行在其他容器中,请使用 Docker 网络:

  ```bash
  # Create a network
  docker network create monitoring

  # Run Redis on the network
  docker run -d --name redis --network monitoring redis:7-alpine

  # Run ClickStack on the same network (update endpoint to "redis:6379" in config)
  docker run --name clickstack \
    --network monitoring \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### 在 HyperDX 中验证指标

  配置完成后,登录 HyperDX 并验证指标是否正常流入:

  1. 进入 Metrics Explorer
  2. 搜索以 `redis.` 开头的指标（例如：`redis.commands.processed`、`redis.memory.used`）
  3. 你应该会按你配置的采集间隔看到指标数据点陆续出现

  {/* <Image img={metrics_view} alt="Redis 指标界面"/> */ }
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 Redis Metrics 集成的用户，我们提供了一个预生成的数据集，其中包含具有真实模式特征的 Redis Metrics。

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 \{#download-sample\}

下载预生成的指标文件（包含 24 小时、具备真实模式的 Redis Metrics）：
```bash
# 下载 gauge 指标（内存、碎片率）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv

# 下载 sum 指标（命令、连接、键空间统计）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv
```

该数据集包含逼真的模式：
- **缓存预热事件（06:00）** - 命中率从 30% 上升到 80%
- **流量峰值（14:30-14:45）** - 流量激增至 5 倍，并伴随连接压力
- **内存压力（20:00）** - 键淘汰以及缓存性能下降
- **日常流量模式** - 工作时间高峰、晚间回落、随机微小峰值

#### 启动 ClickStack \{#start-clickstack\}

启动一个 ClickStack 实例：
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待大约 30 秒，以便 ClickStack 完全启动。

#### 将指标加载到 ClickStack 中 {#load-metrics}

将指标直接加载到 ClickHouse 中：
```bash
# 加载 gauge 指标（内存、碎片）
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 加载 sum 指标（命令、连接、键空间）
cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### 在 HyperDX 中验证指标 {#verify-metrics}

加载完成后，查看指标的最快方式是使用预构建的仪表盘。

前往 [Dashboards and visualization](#dashboards) 部分，导入该仪表盘并一次性查看所有 Redis Metrics。

:::note
演示数据集的时间范围为 2025-10-20 00:00:00 到 2025-10-21 05:00:00。请确保在 HyperDX 中选择的时间范围覆盖该时间窗口。

留意以下有代表性的模式：
- **06:00** - 缓存预热（较低命中率逐步上升）
- **14:30-14:45** - 流量峰值（客户端连接数较高，部分请求被拒绝）
- **20:00** - 内存压力（开始发生键淘汰）
:::

</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为了便于使用 ClickStack 监控 Redis，我们提供了 Redis Metrics 的核心可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX，并进入 Dashboards 页面
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `redis-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入对话框"/>

#### 查看仪表板 \{#created-dashboard\}

系统将创建仪表板，并预先配置好所有可视化图表：

<Image img={example_dashboard} alt="Redis Metrics 仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未加载

确认环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 已正确设置：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载在 `/etc/otelcol-contrib/custom.config.yaml`：

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

查看自定义配置内容，确认其可正常读取：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX 中未显示任何指标

确认可以从 collector 访问 Redis：

```bash
# From the ClickStack container
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# Expected output: PONG
```

检查 `Redis INFO` 命令是否能正常执行：

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# Should display Redis statistics
```

验证当前生效的配置中包含 Redis receiver：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```

检查收集器日志中是否存在错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# Look for connection errors or authentication failures
```


### 身份验证错误

如果在日志中看到身份验证错误：

```bash
# Verify Redis requires authentication
redis-cli CONFIG GET requirepass

# Test authentication
redis-cli -a <password> ping

# Ensure password is set in ClickStack environment
docker exec <clickstack-container> printenv REDIS_PASSWORD
```

将配置更新为使用该密码：

```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
```


### 网络连通性问题

如果 ClickStack 无法连接到 Redis：

```bash
# Check if both containers are on the same network
docker network inspect <network-name>

# Test connectivity
docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379
```

确保您的 Docker Compose 文件或 `docker run` 命令将这两个容器加入同一网络。


## 后续步骤 {#next-steps}

如果希望进一步探索，可以从以下几方面尝试强化监控：

- 为关键指标（内存使用阈值、连接数上限、缓存命中率下降）设置[告警](/use-cases/observability/clickstack/alerts)
- 为特定用例（复制延迟、持久化性能）创建更多仪表板
- 通过复制接收器配置并使用不同的端点和服务名来监控多个 Redis 实例