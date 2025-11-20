<details>
    <summary>在 Docker 中启动 Apache Superset</summary>

Superset 提供了[使用 Docker Compose 在本地安装 Superset](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 的说明文档。从 GitHub 克隆 Apache Superset 代码仓库后,您可以运行最新的开发代码或指定的标签版本。我们推荐使用 2.0.0 版本,这是最新的正式发布版本(未标记为 `pre-release`)。

在运行 `docker compose` 之前需要完成以下几项任务:

1. 添加官方 ClickHouse Connect 驱动
2. 获取 Mapbox API 密钥并将其添加为环境变量(可选)
3. 指定要运行的 Superset 版本

:::tip
以下命令需要在 GitHub 代码仓库 `superset` 的根目录下运行。
:::


## 官方 ClickHouse Connect 驱动 {#official-clickhouse-connect-driver}

要在 Superset 部署中启用 ClickHouse Connect 驱动,需将其添加到本地依赖文件中:

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```


## Mapbox {#mapbox}

这是可选配置,您可以在没有 Mapbox API 密钥的情况下在 Superset 中绘制位置数据,但会看到提示您添加密钥的消息,且地图背景图像将缺失(您只能看到数据点而无法看到地图背景)。如果您希望使用,Mapbox 提供免费套餐。

指南中的一些示例可视化会使用位置数据,例如经度和纬度。Superset 支持 Mapbox 地图。要使用 Mapbox 可视化功能,您需要一个 Mapbox API 密钥。请注册 [Mapbox 免费套餐](https://account.mapbox.com/auth/signup/) 并生成 API 密钥。

将 API 密钥配置到 Superset:

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```


## 部署 Superset 2.0.0 版本 {#deploy-superset-version-200}

要部署 2.0.0 版本,请运行以下命令:

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
