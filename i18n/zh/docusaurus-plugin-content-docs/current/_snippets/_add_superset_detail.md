<details>
    <summary>在 Docker 中启动 Apache Superset</summary>

Superset 提供了[使用 Docker Compose 在本地安装 Superset](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 的说明文档。从 GitHub 克隆 Apache Superset 代码仓库后,您可以运行最新的开发代码或指定的标签版本。我们推荐使用 2.0.0 版本,因为它是最新的正式发布版本(未标记为 `pre-release`)。

运行 `docker compose` 之前需要完成以下几项任务:

1. 添加官方 ClickHouse Connect 驱动
2. 获取 Mapbox API 密钥并将其添加为环境变量(可选)
3. 指定要运行的 Superset 版本

:::tip
以下命令需要在 GitHub 代码仓库 `superset` 的根目录下运行。
:::

## 官方 ClickHouse Connect 驱动程序 \\{#official-clickhouse-connect-driver\\}

要在 Superset 部署中启用 ClickHouse Connect 驱动程序，请将其添加到本地 requirements 文件中：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox \\{#mapbox\\}

此步骤是可选的。你可以在不提供 Mapbox API 密钥的情况下在 Superset 中绘制地理位置信息，但你会看到一条提示信息，建议你添加密钥，而且地图的背景图像会缺失（你只能看到数据点，而看不到地图底图）。如果你想使用，Mapbox 提供了免费套餐。

部分示例可视化（指南中引导你创建的那些）会使用位置信息，例如经纬度数据。Superset 内置对 Mapbox 地图的支持。要使用 Mapbox 可视化，你需要一个 Mapbox API 密钥。注册 [Mapbox 免费套餐](https://account.mapbox.com/auth/signup/)，并生成一个 API 密钥。

将该 API 密钥提供给 Superset 使用：

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## 部署 Superset 2.0.0 版本 \\{#deploy-superset-version-200\\}

要部署 2.0.0 版本,请运行:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
