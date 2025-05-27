---
null
...
---

<details>
    <summary>在 Docker 中启动 Apache Superset</summary>

Superset 提供了 [使用 Docker Compose 本地安装 Superset](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 的说明。在从 GitHub 上检出 Apache Superset 仓库后，您可以运行最新的开发代码或特定标签。我们推荐使用 2.0.0 版本，因为它是最新的未标记为 `pre-release` 的版本。

在运行 `docker compose` 之前，有几个任务需要完成：

1. 添加官方 ClickHouse Connect 驱动程序
2. 获取一个 Mapbox API 密钥并将其添加为环境变量（可选）
3. 指定要运行的 Superset 版本

:::tip
以下命令需从 GitHub 仓库的顶层目录 `superset` 中运行。
:::

## 官方 ClickHouse Connect 驱动程序 {#official-clickhouse-connect-driver}

要使 ClickHouse Connect 驱动程序在 Superset 部署中可用，请将其添加到本地需求文件中：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

这是可选的，您可以在 Superset 中绘制位置数据，而无需 Mapbox API 密钥，但您会看到一条消息，提示您应添加密钥，并且地图的背景图像将缺失（您只会看到数据点，而没有地图背景）。如果您想使用它，Mapbox 提供免费层。

一些示例可视化指南要求您创建使用位置（例如经度和纬度）数据的可视化。Superset 包含对 Mapbox 地图的支持。要使用 Mapbox 可视化，您需要一个 Mapbox API 密钥。注册 [Mapbox 免费层](https://account.mapbox.com/auth/signup/)，并生成一个 API 密钥。

将 API 密钥提供给 Superset：

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## 部署 Superset 版本 2.0.0 {#deploy-superset-version-200}

要部署 2.0.0 版本，请运行：

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
