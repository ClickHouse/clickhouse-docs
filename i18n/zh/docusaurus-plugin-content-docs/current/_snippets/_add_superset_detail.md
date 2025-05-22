<details>
    <summary>在Docker中启动Apache Superset</summary>

Superset 提供了 [使用Docker Compose本地安装Superset](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/) 的说明。在从GitHub检出Apache Superset仓库后，您可以运行最新的开发代码或特定的标签。我们建议使用版本2.0.0，因为这是最新的未标记为 `pre-release` 的版本。

在运行 `docker compose` 之前需要完成一些任务：

1. 添加官方的 ClickHouse Connect 驱动程序
2. 获取Mapbox API密钥并将其添加为环境变量（可选）
3. 指定要运行的Superset版本

:::tip
下面的命令需要在GitHub仓库的顶层 `superset` 中运行。
:::

## 官方 ClickHouse Connect 驱动程序 {#official-clickhouse-connect-driver}

要在Superset部署中使用ClickHouse Connect驱动程序，请将其添加到本地需求文件中：

```bash
echo "clickhouse-connect" >> ./docker/requirements-local.txt
```

## Mapbox {#mapbox}

这是可选的，您可以在Superset中绘制位置数据而不需要Mapbox API密钥，但您会看到一条消息提示您应添加密钥，并且地图的背景图像将缺失（您只会看到数据点，而不是地图背景）。如果您想使用它，Mapbox提供了一个免费套餐。

一些示例可视化图表使用了位置数据，例如经度和纬度。Superset 支持 Mapbox 地图。要使用 Mapbox 可视化，您需要一个 Mapbox API 密钥。请注册 [Mapbox 免费套餐](https://account.mapbox.com/auth/signup/)，并生成 API 密钥。

使 API 密钥对 Superset 可用：

```bash
echo "MAPBOX_API_KEY=pk.SAMPLE-Use-your-key-instead" >> docker/.env-non-dev
```

## 部署 Superset 版本 2.0.0 {#deploy-superset-version-200}

要部署版本2.0.0，请运行：

```bash
git checkout 2.0.0
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml pull
TAG=2.0.0 docker-compose -f docker-compose-non-dev.yml up
```

</details>
