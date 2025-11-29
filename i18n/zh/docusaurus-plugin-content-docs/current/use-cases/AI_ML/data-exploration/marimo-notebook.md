---
slug: /use-cases/AI/marimo-notebook
sidebar_label: '使用 Marimo 笔记本和 chDB 探索数据'
title: '使用 Marimo 笔记本和 chDB 探索数据'
description: '本指南介绍如何在 Marimo 笔记本中配置和使用 chDB，以从 ClickHouse Cloud 或本地文件中探索数据'
keywords: ['ML', 'Marimo', 'chDB', 'pandas']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import image_1 from '@site/static/images/use-cases/AI_ML/jupyter/1.png';
import image_2 from '@site/static/images/use-cases/AI_ML/jupyter/2.png';
import image_3 from '@site/static/images/use-cases/AI_ML/jupyter/3.png';
import image_4 from '@site/static/images/use-cases/AI_ML/Marimo/4.png';
import image_5 from '@site/static/images/use-cases/AI_ML/Marimo/5.png';
import image_6 from '@site/static/images/use-cases/AI_ML/Marimo/6.png';
import image_7 from '@site/static/images/use-cases/AI_ML/Marimo/7.gif';
import image_8 from '@site/static/images/use-cases/AI_ML/Marimo/8.gif';

在本指南中，您将学习如何借助 [chDB](/docs/chdb) —— 一个由 ClickHouse 驱动的高速进程内 SQL OLAP 引擎 —— 在 Marimo 笔记本中探索 ClickHouse Cloud 上的数据集。

**前置条件：**

* Python 3.8 或更高版本
* 一个虚拟环境
* 一项可用的 ClickHouse Cloud 服务以及您的[连接信息](/docs/cloud/guides/sql-console/gather-connection-details)

:::tip
如果您还没有 ClickHouse Cloud 账户，可以[注册](https://console.clickhouse.cloud/signUp?loc=docs-marimo-chdb)
试用，并获得 300 美元的免费额度开始使用。
:::

**您将学到：**

* 使用 chDB 从 Marimo 笔记本连接到 ClickHouse Cloud
* 查询远程数据集并将结果转换为 Pandas DataFrame
* 在 Marimo 中使用 Plotly 对数据进行可视化
* 利用 Marimo 的响应式执行模型进行交互式数据探索

我们将使用 UK Property Price 数据集，它是 ClickHouse Cloud 提供的入门数据集之一。
其中包含 1995 年到 2024 年间英国房屋成交价格相关的数据。


## 设置 {#setup}

### 加载数据集 {#loading-the-dataset}

要将此数据集添加到现有的 ClickHouse Cloud 服务中，请使用您的账户信息登录 [console.clickhouse.cloud](https://console.clickhouse.cloud/)。

在左侧菜单中，点击 `Data sources`，然后点击 `Predefined sample data`：

<Image size="md" img={image_1} alt="添加示例数据集" />

在 UK property price paid data (4GB) 卡片中选择 `Get started`：

<Image size="md" img={image_2} alt="选择英国房价支付数据集" />

然后点击 `Import dataset`：

<Image size="md" img={image_3} alt="导入英国房价支付数据集" />

ClickHouse 将自动在 `default` 数据库中创建名为 `pp_complete` 的表，并向该表填充 2892 万行价格数据。

为降低暴露凭证的可能性，建议您在本地机器上将 Cloud 用户名和密码配置为环境变量。
在终端中运行以下命令，将您的用户名和密码添加为环境变量：

### 配置凭证 {#setting-up-credentials}

```bash
export CLICKHOUSE_CLOUD_HOSTNAME=<主机名>
export CLICKHOUSE_CLOUD_USER=default
export CLICKHOUSE_CLOUD_PASSWORD=您的实际密码
```

:::note
上面的环境变量只在当前终端会话期间有效。
要使其永久生效，请将它们添加到你的 shell 配置文件中。
:::

### 安装 Marimo {#installing-marimo}

现在激活你的虚拟环境。
在虚拟环境中，安装本指南将要使用的以下软件包：

```python
pip install chdb pandas plotly marimo
```

使用以下命令创建一个新的 Marimo 笔记本：

```bash
marimo edit clickhouse_exploration.py
```

应该会打开一个新的浏览器窗口，显示运行在 localhost:2718 上的 Marimo 界面：

<Image size="md" img={image_4} alt="Marimo 界面" />

Marimo 笔记本以纯 Python 文件的形式存储，便于进行版本控制并与他人共享。


## 安装依赖 {#installing-dependencies}

在新的单元格中导入所需的库：

```python
import marimo as mo
import chdb
import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
```

当你将鼠标悬停在该单元格上时，会出现两个带有“+”号的圆圈。
你可以点击这些按钮来添加新的单元格。

添加一个新单元格，并运行一个简单查询，以检查一切是否已正确配置：

```python
result = chdb.query("SELECT '来自 Marimo 的 ClickHouse 问候！'", "DataFrame")
result
```

你应该会在刚刚运行的单元格下方看到如下结果：

<Image size="md" img={image_5} alt="Marimo hello world" />


## 探索数据 {#exploring-the-data}

在已经准备好英国房价支付数据集，并在 Marimo 笔记本中成功运行 chDB 之后，我们现在可以开始探索这些数据。
假设我们想要了解在英国某个特定地区（例如首都伦敦）中，房价随时间是如何变化的。
ClickHouse 的 [`remoteSecure`](/docs/sql-reference/table-functions/remote) 函数允许你轻松地从 ClickHouse Cloud 中获取数据。
你可以让 chDB 在进程内将这些数据返回为 Pandas 数据帧——这是一种既方便又熟悉的数据处理方式。

### 查询 ClickHouse Cloud 数据 {#querying-clickhouse-cloud-data}

创建一个新的单元格，使用以下查询从你的 ClickHouse Cloud 服务中获取英国房价支付数据，并将其转换为 `pandas.DataFrame`：

```python
query = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price,
    bar(price, 0, 1000000, 80)
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
"""

df = chdb.query(query, "DataFrame")
df.head()
```

在上面的代码片段中，`chdb.query(query, "DataFrame")` 会运行指定的查询，并将结果输出为一个 Pandas DataFrame。

在查询中，我们使用 [`remoteSecure`](/sql-reference/table-functions/remote) 函数来连接到 ClickHouse Cloud。

`remoteSecure` 函数接受以下参数：

* 连接字符串
* 要使用的数据库和表名
* 你的用户名
* 你的密码

作为安全方面的最佳实践，你应当优先通过环境变量来提供用户名和密码参数，而不是直接在函数中明文指定，尽管如果你愿意，这样做也是可行的。

`remoteSecure` 函数会连接到远程的 ClickHouse Cloud 服务，执行查询并返回结果。
根据你的数据规模，这可能需要几秒钟。

在本例中，我们返回的是每年的平均价格，并按 `town='LONDON'` 进行过滤。
然后将结果以 DataFrame 的形式存储在名为 `df` 的变量中。

### 可视化数据 {#visualizing-the-data}

现在我们已经以熟悉的形式获取了数据，接下来来看一下伦敦房产价格是如何随时间变化的。

Marimo 与 Plotly 等交互式绘图库配合使用效果尤其好。
在一个新的单元格中，创建一个交互式图表：

```python
fig = px.line(
    df, 
    x='year', 
    y='price',
    title='伦敦房产平均价格时间序列',
    labels={'price': '平均价格（£）', 'year': '年份'}
)

fig.update_traces(mode='lines+markers')
fig.update_layout(hovermode='x unified')
fig
```

或许不足为奇，伦敦的房价随着时间大幅上涨。

<Image size="md" img={image_6} alt="Marimo 数据可视化" />

Marimo 的一大优势是其响应式执行模型。我们来创建一个交互式控件，以动态选择不同的城镇。

### 交互式城镇选择 {#interactive-town-selection}

在一个新单元格中，创建一个下拉菜单来选择不同的城镇：

```python
town_selector = mo.ui.dropdown(
    options=['LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL'],
    value='LONDON',
    label='选择城市：'
)
town_selector
```

在另一个单元格中，创建一个会根据城镇选择作出响应的查询。当你更改下拉菜单时，该单元格会自动重新运行：

```python
query_reactive = f"""
SELECT
    toYear(date) AS year,
    round(avg(price)) AS price
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = '{town_selector.value}'
GROUP BY year
ORDER BY year
"""

df_reactive = chdb.query(query_reactive, "DataFrame")
df_reactive
```

现在创建一个图表，当你更改 town 时它会自动更新。
你可以将图表移动到动态 dataframe 的上方，使其显示在包含下拉菜单的单元格下方。


```python
fig_reactive = px.line(
    df_reactive,
    x='year',
    y='price',
    title=f'{town_selector.value}房产平均价格趋势',
    labels={'price': '平均价格（£）', 'year': '年份'}
)

fig_reactive.update_traces(mode='lines+markers')
fig_reactive.update_layout(hovermode='x unified')
fig_reactive
```

现在，当你从下拉菜单中选择一个城镇时，图表会动态更新：

<Image size="md" img={image_7} alt="Marimo 动态图表" />

### 使用交互式箱线图探索价格分布 {#exploring-price-distributions}

让我们通过检查伦敦不同年份的房价分布，更深入地探索这些数据。
箱线图可以展示中位数、四分位数和离群值，比仅看平均价格能带来更深入的理解。
首先，让我们创建一个年份滑块，以便交互式地探索不同年份：

在一个新单元格中，添加以下内容：

```python
year_slider = mo.ui.slider(
    start=1995,
    stop=2024,
    value=2020,
    step=1,
    label='选择年份：',
    show_value=True
)
year_slider
```

现在，让我们查询所选年份中每笔房产交易的价格。
请注意，这里我们不做聚合——我们需要所有单笔交易来构建我们的分布：

```python
query_distribution = f"""
SELECT
    price,
    toYear(date) AS year
FROM remoteSecure(
    '{os.environ.get("CLICKHOUSE_CLOUD_HOSTNAME")}',
    'default.pp_complete',
    '{os.environ.get("CLICKHOUSE_CLOUD_USER")}',
    '{os.environ.get("CLICKHOUSE_CLOUD_PASSWORD")}'
)
WHERE town = 'LONDON'
  AND toYear(date) = {year_slider.value}
  AND price > 0
  AND price < 5000000
"""

df_distribution = chdb.query(query_distribution, "DataFrame")

# 创建交互式箱线图
fig_box = go.Figure()

fig_box.add_trace(
    go.Box(
        y=df_distribution['price'],
        name=f'London {year_slider.value}',
        boxmean='sd',  # 显示均值和标准差
        marker_color='lightblue',
        boxpoints='outliers'  # 显示离群值点
    )
)

fig_box.update_layout(
    title=f'伦敦房产价格分布 ({year_slider.value})',
    yaxis=dict(
        title='价格 (£)',
        tickformat=',.0f'
    ),
    showlegend=False,
    height=600
)

fig_box
```

如果您选择单元格右上角的选项按钮,即可隐藏代码。
移动滑块时,图表会自动更新,这得益于 Marimo 的响应式执行机制:

<Image size="md" img={image_8} alt="Marimo 动态图表"/>


## 总结 {#summary}

本指南演示了如何使用 chDB 结合 Marimo 笔记本，在 ClickHouse Cloud 中探索数据。
基于英国房产价格数据集，我们展示了如何使用 `remoteSecure()` 函数查询远程 ClickHouse Cloud 数据，并将结果直接转换为 Pandas DataFrame，用于分析和可视化。
借助 chDB 和 Marimo 的响应式执行模型，数据科学家可以在熟悉的 Python 工具（如 Pandas 和 Plotly）配合使用的同时，充分利用 ClickHouse 强大的 SQL 能力，并结合交互式小部件和自动依赖跟踪，从而让探索性分析更加高效且易于复现。
