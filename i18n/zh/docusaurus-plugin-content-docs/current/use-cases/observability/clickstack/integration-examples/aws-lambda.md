---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: '使用 ClickStack 和 Rotel 监控 AWS Lambda 日志'
sidebar_label: 'AWS Lambda 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 和 Rotel 监控 AWS Lambda 日志'
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', '日志', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 使用 Rotel 在 ClickStack 中监控 AWS Lambda 日志 {#lambda-clickstack}

<CommunityMaintainedBadge/>

:::note[摘要]
本指南演示如何使用 Rotel Lambda Extension，将函数日志、扩展日志以及 OpenTelemetry 数据直接收集并转发到 ClickHouse，从而利用 ClickStack 监控 AWS Lambda 函数。您将学习如何：

- 为 Lambda 函数部署 Rotel Lambda Extension 层
- 配置扩展，将日志和追踪数据导出到 ClickStack
- （可选）禁用 CloudWatch Logs 以降低成本

通过完全绕过 CloudWatch Logs，此方案可以显著降低 Lambda 的可观测性成本。

所需时间：5–10 分钟
:::

## 与现有 Lambda 函数集成 {#existing-lambda}

本节说明如何配置现有的 AWS Lambda 函数，使其通过 Rotel Lambda Extension 将日志和追踪发送到 ClickStack。

### 前置条件 {#prerequisites}

- 已在运行的 ClickStack 实例
- 一个或多个需要监控的 AWS Lambda 函数
- 已配置且具有相应权限的 AWS CLI
- 具有添加 Layer 权限的 Lambda 执行角色

<VerticalStepper headerLevel="h4">
  #### 选择合适的 Rotel Lambda Extension 层

  [Rotel Lambda 扩展](https://github.com/streamfold/rotel-lambda-extension)以预构建的 AWS Lambda 层形式提供。请选择与您的 Lambda 函数架构相匹配的层 ARN:

  | 架构           | ARN 格式                                                                             | 最新版本                                                                                                                                                                   |
  | ------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64-alpha:{version}` | ![版本](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600) |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64-alpha:{version}` | ![版本](https://img.shields.io/github/v/release/streamfold/rotel-lambda-extension?filter=*alpha\&label=version\&labelColor=%2338BDF8\&color=%23312E81\&cacheSeconds=600) |

  **可用区域：**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### 将 Rotel 层添加到 Lambda 函数

  *在这些示例中,将 `{arch}`、`{region}` 和 `{version}` 替换为上述相应的值。*

  ##### 选项 1：AWS 控制台

  1. 打开 AWS Lambda 控制台
  2. 前往你的 Lambda 函数
  3. 向下滚动至 **Layers** 部分，然后单击 **Add a layer**。
  4. 选择 **指定 ARN**
  5. 请输入 Rotel 层的 ARN：
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
     ```
  6. 点击 **Add**

  ##### 选项 2：AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  ##### 选项 3：AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{version}:418653438961:layer:rotel-extension-{arch}-alpha:{version}
  ```

  #### 配置扩展以导出至 ClickStack

  Rotel Lambda 扩展通过环境变量进行配置。您需要将 OTLP 导出器端点配置为指向您的 ClickStack 实例。以下示例假定您的 AWS Lambda 函数能够访问 ClickStack 实例。

  ##### 基本配置（环境变量）

  将以下环境变量添加到您的 Lambda 函数:

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### 高级配置（使用 .env 文件）

  对于更复杂的配置，请在 Lambda 函数包中创建 `rotel.env` 文件：

  **rotel.env:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,deployment.environment=production"
  ```

  然后设置环境变量指向该文件：

  ```bash
  ROTEL_ENV_FILE=/var/task/rotel.env
  ```

  ##### 使用 AWS Secrets Manager 或 Parameter Store

  对于生产环境部署，请将 API 密钥等敏感值存储在 AWS Secrets Manager 或 Parameter Store 中：

  **AWS Secrets Manager 示例：**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-abc123}"
  ```

  **AWS Parameter Store 示例：**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=${arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key}"
  ```

  **所需 IAM 权限：**

  将这些权限添加到您的 Lambda 执行角色中：

  对于 Secrets Manager：

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue",
          "secretsmanager:BatchGetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:clickstack-api-key-*"
      }
    ]
  }
  ```

  对于 Parameter Store：

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ssm:GetParameters"
        ],
        "Resource": "arn:aws:ssm:us-east-1:123456789012:parameter/clickstack-api-key"
      }
    ]
  }
  ```

  :::note
  AWS API 调用检索密钥会增加 100-150 毫秒的冷启动延迟。密钥以批量方式检索（最多 10 个），且仅在初始化时检索，因此后续调用不受影响。
  :::

  #### 测试集成

  调用您的 Lambda 函数以验证日志是否已发送到 ClickStack:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  检查 Lambda 日志是否存在错误：

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX(ClickStack 的 UI)并验证日志是否正常流入:

  <Image img={log_view} alt="Lambda 日志视图" />

  <Image img={log} alt="Lambda 日志详情" />

  在日志中查找这些关键属性：

  * `service.name`: Lambda 函数的名称
  * `faas.name`: AWS Lambda 函数名
  * `faas.invocation_id`: 唯一的调用 ID
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## 禁用 CloudWatch Logs（成本优化） {#disable-cloudwatch}

默认情况下，AWS Lambda 会将所有日志发送到 CloudWatch Logs，在大规模使用时成本可能会非常高。一旦你确认日志已经成功导入 ClickStack，便可以禁用 CloudWatch 日志记录以降低成本。

<VerticalStepper headerLevel="h4">

#### 从执行角色中移除 CloudWatch 权限 {#remove-permissions}

1. 打开 AWS 控制台并导航到 **AWS Lambda**
2. 进入你的 Lambda 函数
3. 选择 **Configuration** → **Permissions**
4. 点击执行角色名称以打开 IAM 控制台
5. 编辑该角色并移除所有 `logs:*` 操作：
   - 如果使用自定义策略，编辑以移除 `logs:CreateLogGroup`、`logs:CreateLogStream` 和 `logs:PutLogEvents`
   - 如果使用 AWS 管理的策略 `AWSLambdaBasicExecutionRole`，将其从该角色中移除
6. 保存角色

#### 验证 CloudWatch 日志记录已禁用 {#verify-disabled}

再次调用你的函数并验证：
1. 没有创建新的 CloudWatch 日志流
2. 日志仍然会出现在 ClickStack/HyperDX 中

```bash
# 在策略变更后，这里不应显示新的日志流
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## 添加 OpenTelemetry 自动插桩 {#auto-instrumentation}

Rotel Lambda Extension 能与 OpenTelemetry 的自动插桩 layer 无缝协作，在采集日志的同时收集分布式追踪和指标。

<VerticalStepper headerLevel="h4">

#### 选择所用语言的插桩 layer {#choose-instrumentation}

AWS 为多种语言提供了 OpenTelemetry 自动插桩 layer：

| 语言 | Layer ARN 模板 |
|----------|-------------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

在 [AWS OpenTelemetry Lambda 仓库](https://github.com/aws-observability/aws-otel-lambda)中获取最新版本。

#### 将两个 layer 都添加到函数中 {#add-both-layers}

将 **Rotel 扩展 layer** 和 **自动插桩 layer** 一并添加：

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}-alpha:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### 配置自动插桩 {#configure-instrumentation}

设置 `AWS_LAMBDA_EXEC_WRAPPER` 环境变量以启用自动插桩：

**对于 Node.js：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**对于 Python：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**对于 Java：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### 在 HyperDX 中验证追踪数据 {#verify-traces}

在调用函数之后：

1. 打开 HyperDX 中的 **Traces** 视图
2. 你应当能看到包含来自 Lambda 函数 span 的追踪
3. 这些追踪会通过 `trace_id` 和 `span_id` 属性与日志进行关联

</VerticalStepper>

## 示例应用 {#examples}

查看演示 Rotel Lambda Extension 的 Python 示例应用：

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**：通过手动接入 OpenTelemetry 的 Python 应用程序，将 trace 和 log 直接发送到 ClickHouse

## 加入 Rotel 社区 {#join-rotel-community}

如果你对 Rotel 有任何疑问，请加入 [Rotel Discord 服务器](https://rotel.dev)，在其中分享你的反馈或问题。你也可以了解并使用 [Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)，为项目改进做出贡献。

## 更多资源 {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**：源代码及详细文档
- **[Rotel Core](https://github.com/streamfold/rotel)**：驱动该扩展的轻量级 OTel 数据平面