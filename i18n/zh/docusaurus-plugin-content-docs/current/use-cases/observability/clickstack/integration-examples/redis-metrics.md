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
本指南介绍如何通过配置 OpenTelemetry 收集器的 Redis 接收器,使用 ClickStack 监控 Redis 性能指标。您将学习如何:

- 配置 OTel 收集器以收集 Redis 指标
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 Redis 性能(命令数/秒、内存使用量、已连接客户端、缓存性能)

如果您想在配置生产环境 Redis 之前测试集成,可以使用包含示例指标的演示数据集。

所需时间:5-10 分钟
:::


## 与现有 Redis 集成 {#existing-redis}

本节介绍如何通过配置 ClickStack OTel 收集器的 Redis 接收器,将现有 Redis 安装的指标发送到 ClickStack。

如果您希望在配置现有环境之前测试 Redis 指标集成,可以使用我们在[下一节](#demo-dataset)中预配置的演示数据集进行测试。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 现有 Redis 安装(版本 3.0 或更高)
- 从 ClickStack 到 Redis 的网络访问权限(默认端口 6379)
- 如果启用了身份验证,则需要 Redis 密码

<VerticalStepper headerLevel="h4">

#### 验证 Redis 连接 {#verify-redis}


首先，确认你能够连接到 Redis，并且 `INFO` 命令可以正常执行：

```bash
# 测试连接
redis-cli ping
# 预期输出：PONG
```


# 测试 INFO 命令(由指标收集器使用)

redis-cli INFO server

# 应显示 Redis 服务器信息

````

如果 Redis 需要身份验证:
```bash
redis-cli -a <your-password> ping
````

**常见 Redis 端点:**

- **本地安装**: `localhost:6379`
- **Docker**: 使用容器名称或服务名称(例如 `redis:6379`)
- **远程**: `<redis-host>:6379`

#### 创建自定义 OTel 收集器配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry 收集器配置。自定义配置将与 HyperDX 通过 OpAMP 管理的基础配置合并。

创建名为 `redis-metrics.yaml` 的文件,包含以下配置:

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

此配置:

- 连接到 `localhost:6379` 上的 Redis(根据您的设置调整端点)
- 每 10 秒收集一次指标
- 收集关键性能指标(命令、客户端、内存、键空间统计)
- **根据 [OpenTelemetry 语义约定](https://opentelemetry.io/docs/specs/semconv/resource/#service)设置必需的 `service.name` 资源属性**
- 通过专用管道将指标路由到 ClickHouse 导出器

**收集的关键指标:**

- `redis.commands.processed` - 每秒处理的命令数
- `redis.clients.connected` - 已连接的客户端数量
- `redis.clients.blocked` - 在阻塞调用上被阻塞的客户端数
- `redis.memory.used` - Redis 使用的内存(字节)
- `redis.memory.peak` - 峰值内存使用量
- `redis.keyspace.hits` - 成功的键查找次数
- `redis.keyspace.misses` - 失败的键查找次数(用于缓存命中率计算)
- `redis.keys.expired` - 已过期的键数
- `redis.keys.evicted` - 因内存压力而被驱逐的键数
- `redis.connections.received` - 接收的总连接数
- `redis.connections.rejected` - 被拒绝的连接数

:::note

- 您只需在自定义配置中定义新的接收器、处理器和管道
- `memory_limiter` 和 `batch` 处理器以及 `clickhouse` 导出器已在基础 ClickStack 配置中定义 - 您只需按名称引用它们
- `resource` 处理器根据 OpenTelemetry 语义约定设置必需的 `service.name` 属性
- 对于需要身份验证的生产环境,请将密码存储在环境变量中: `${env:REDIS_PASSWORD}`
- 根据您的需求调整 `collection_interval`(默认为 10 秒;较低的值会增加数据量)
- 对于多个 Redis 实例,请自定义 `service.name` 以区分它们(例如 `"redis-cache"`、`"redis-sessions"`)
  :::

#### 配置 ClickStack 以加载自定义配置 {#load-custom}

要在现有 ClickStack 部署中启用自定义收集器配置,您必须:

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 确保 ClickStack 和 Redis 之间的网络连接

##### 选项 1: Docker Compose {#docker-compose}

更新您的 ClickStack 部署配置:

```yaml
services:
  clickstack:
    # ... 现有配置 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # 可选: 如果 Redis 需要身份验证
      # - REDIS_PASSWORD=your-redis-password
      # ... 其他环境变量 ...
    volumes:
      - ./redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      # ... 其他卷 ...
    # 如果 Redis 在同一个 compose 文件中:
    depends_on:
      - redis
```


redis:
image: redis:7-alpine
ports:

* &quot;6379:6379&quot;

# 可选：启用身份验证

# 命令：redis-server --requirepass your-redis-password

````

##### 选项 2：Docker run（一体化镜像） {#all-in-one}

如果使用 `docker run` 运行一体化镜像：
```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````


**重要提示：** 如果 Redis 在另一个容器中运行，请使用 Docker 网络：

```bash
# 创建网络
docker network create monitoring
```


# 在指定网络中运行 Redis
docker run -d --name redis --network monitoring redis:7-alpine



# 在同一网络上运行 ClickStack（在配置中将端点更新为 &quot;redis:6379&quot;）

docker run --name clickstack \
--network monitoring \
-p 8080:8080 -p 4317:4317 -p 4318:4318 \
-e CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE=/etc/otelcol-contrib/custom.config.yaml \
-v &quot;$(pwd)/redis-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro&quot; \
docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest

```

#### 在 HyperDX 中验证指标 {#verifying-metrics}

配置完成后,登录 HyperDX 并验证指标数据是否正常流入:

1. 导航到指标浏览器(Metrics explorer)
2. 搜索以 `redis.` 开头的指标(例如 `redis.commands.processed`、`redis.memory.used`)
3. 您应该能看到指标数据点按配置的采集间隔显示

<!-- <Image img={metrics_view} alt="Redis Metrics view"/> -->

</VerticalStepper>
```


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 Redis Metrics 集成的用户,我们提供了一个预生成的数据集,其中包含真实的 Redis Metrics 模式。

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 {#download-sample}


下载预生成的指标文件（包含 24 小时的 Redis 指标数据，具有逼真的访问/使用模式）：

```bash
# 下载指标数据（内存、碎片率）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-gauge.csv
```


# 下载汇总指标(命令、连接、键空间统计)

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-metrics-sum.csv

````

该数据集包含真实场景模式:
- **缓存预热事件 (06:00)** - 命中率从 30% 攀升至 80%
- **流量峰值 (14:30-14:45)** - 5 倍流量激增,连接压力增大
- **内存压力 (20:00)** - 键驱逐和缓存性能下降
- **日常流量模式** - 工作时段峰值、晚间回落、随机微峰值

#### 启动 ClickStack {#start-clickstack}

启动 ClickStack 实例:
```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

等待约 30 秒,直到 ClickStack 完全启动。

#### 将指标加载到 ClickStack {#load-metrics}


将这些指标直接导入 ClickHouse：

```bash
# 加载仪表指标（内存、碎片）
cat redis-metrics-gauge.csv | docker exec -i clickstack-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 加载汇总指标（commands、connections、keyspace）

cat redis-metrics-sum.csv | docker exec -i clickstack-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### 在 HyperDX 中验证指标 {#verify-metrics}

加载完成后,查看指标最快的方式是使用预构建的仪表板。

前往[仪表板和可视化](#dashboards)部分导入仪表板,即可一次性查看所有 Redis 指标。

:::note
演示数据集的时间范围为 2025-10-20 00:00:00 至 2025-10-21 05:00:00。请确保您在 HyperDX 中设置的时间范围与此时间窗口一致。

留意以下值得关注的模式:
- **06:00** - 缓存预热(命中率从低位开始攀升)
- **14:30-14:45** - 流量峰值(客户端连接数激增,部分连接被拒绝)
- **20:00** - 内存压力(开始驱逐键)
:::

</VerticalStepper>
```


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 Redis,我们提供了 Redis 指标的基本可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-metrics-dashboard.json')} download="redis-metrics-dashboard.json" eventName="docs.redis_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分
2. 点击右上角省略号下的**导入仪表板**

<Image img={import_dashboard} alt='导入仪表板按钮' />

3. 上传 `redis-metrics-dashboard.json` 文件并点击**完成导入**

<Image img={finish_import} alt='完成导入对话框' />

#### 查看仪表板 {#created-dashboard}

仪表板将创建完成,所有可视化均已预配置:

<Image img={example_dashboard} alt='Redis 指标仪表板' />

:::note
对于演示数据集,请将时间范围设置为 **2025-10-20 05:00:00 - 2025-10-21 05:00:00 (UTC)**(根据您的本地时区进行调整)。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>


## 故障排查 {#troubleshooting}

### 自定义配置未加载 {#troubleshooting-not-loading}

验证环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 是否设置正确：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载至 `/etc/otelcol-contrib/custom.config.yaml`：

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

查看自定义配置内容以验证其是否可读：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX 中未显示指标 {#no-metrics}


验证采集器是否能够访问 Redis：

```bash
# 从 ClickStack 容器执行
docker exec <clickstack-container> redis-cli -h <redis-host> ping
# 预期输出：PONG
```


检查 `Redis INFO` 命令是否正常工作：

```bash
docker exec <clickstack-container> redis-cli -h <redis-host> INFO stats
# 应显示 Redis 统计信息
```

确认生效的配置中包含 Redis 接收端：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "redis:"
```


检查收集器日志中的错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i redis
# 查找连接错误或认证失败
```

### 认证错误 {#auth-errors}


如果您在日志中看到认证错误：

```bash
# 验证 Redis 是否需要身份验证
redis-cli CONFIG GET requirepass
```


# 测试身份验证

redis-cli -a <password> ping


# 确保在 ClickStack 环境中已设置密码

docker exec <clickstack-container> printenv REDIS_PASSWORD

````

更新配置以使用该密码:
```yaml
receivers:
  redis:
    endpoint: "redis:6379"
    password: ${env:REDIS_PASSWORD}
````

### 网络连接问题 {#network-issues}


如果 ClickStack 无法连接 Redis：

```bash
# 检查两个容器是否在同一网络上
docker network inspect <network-name>
```


# 测试连接

docker exec <clickstack-container> ping redis
docker exec <clickstack-container> telnet redis 6379

```

确保您的 Docker Compose 文件或 `docker run` 命令将两个容器置于同一网络中。

```


## 后续步骤 {#next-steps}

如果您想进一步探索，以下是一些可用于监控实验的后续步骤：

- 为关键指标设置[告警](/use-cases/observability/clickstack/alerts)（内存使用阈值、连接数限制、缓存命中率下降）
- 针对特定用例创建额外的仪表板（复制延迟、持久化性能）
- 通过复制接收器配置并使用不同的端点和服务名称来监控多个 Redis 实例
