---
slug: /use-cases/observability/clickstack/integrations/aws-lambda
title: '使用 ClickStack 与 Rotel 监控 AWS Lambda 日志'
sidebar_label: 'AWS Lambda 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 与 Rotel 监控 AWS Lambda 日志'
doc_type: 'guide'
keywords: ['AWS', 'Lambda', 'OTEL', 'ClickStack', 'logs', 'CloudWatch']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/lambda/lambda-log-view.png';
import log from '@site/static/images/clickstack/lambda/lambda-log.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 使用 Rotel 在 ClickStack 中监控 AWS Lambda 日志 \{#lambda-clickstack\}

<CommunityMaintainedBadge/>

:::note[TL;DR]
本指南演示如何使用 Rotel Lambda Extension，直接采集并转发函数日志、扩展日志以及 OpenTelemetry 数据到 ClickHouse，从而在 ClickStack 中监控 AWS Lambda 函数。你将学习如何：

- 将 Rotel Lambda Extension 层部署到你的 Lambda 函数
- 配置该扩展将日志和 traces 导出到 ClickStack
- 可选地禁用 CloudWatch Logs 以降低成本

通过完全绕过 CloudWatch Logs，此方案可以显著降低你的 Lambda 可观测性相关成本。

所需时间：5–10 分钟
:::

## 与现有 Lambda 函数集成 \{#existing-lambda\}

本节介绍如何配置您现有的 AWS Lambda 函数，通过 Rotel Lambda Extension 将日志和追踪数据发送到 ClickStack。

### 前提条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 需要监控的 AWS Lambda 函数
- 已配置且具备相应权限的 AWS CLI
- 具有添加层权限的 Lambda 执行角色

<VerticalStepper headerLevel="h4">
  #### 选择合适的 Rotel Lambda Extension 层

  选择与您的 Lambda 运行时架构相匹配的 Lambda 层。`{version}` 字段取决于您部署的 AWS 区域。请查看 [releases](https://github.com/streamfold/rotel-lambda-extension/releases) 页面,获取与您所在区域对应的最新版本号。

  | 架构           | ARN                                                                          |
  | ------------ | ---------------------------------------------------------------------------- |
  | x86-64/amd64 | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-amd64:{version}` |
  | arm64        | `arn:aws:lambda:{region}:418653438961:layer:rotel-extension-arm64:{version}` |

  **可用区域：**

  * us-east-{1, 2}, us-west-{1, 2}
  * eu-central-1, eu-north-1, eu-west-{1, 2, 3}
  * ca-central-1
  * ap-southeast-{1, 2}, ap-northeast-{1, 2}
  * ap-south-1
  * sa-east-1

  #### 将 Rotel 层添加到 Lambda 函数

  *在这些示例中,将 `{arch}`、`{region}` 和 `{version}` 替换为上述相应的值。*

  ##### 选项 1:AWS 控制台

  1. 打开 AWS Lambda 控制台
  2. 转到您的 Lambda 函数
  3. 滚动到 **Layers** 部分，然后点击 **Add a layer**
  4. 选择 **指定 ARN**
  5. 输入 Rotel 层的 ARN：
     ```text
     arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
     ```
  6. 点击 **Add**

  ##### 选项 2：AWS CLI

  ```bash
  aws lambda update-function-configuration \
    --function-name my-function \
    --layers arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  ##### 选项 3：AWS SAM

  ```yaml
  Resources:
    MyFunction:
      Type: AWS::Serverless::Function
      Properties:
        # ... other configuration ...
        Layers:
          - arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version}
  ```

  #### 配置扩展以导出至 ClickStack

  Rotel Lambda 扩展通过环境变量进行配置。您需要将 OTLP 导出器端点配置为指向您的 ClickStack 实例。以下示例假定您的 AWS Lambda 函数能够访问 ClickStack 实例。

  ##### 基本配置(环境变量)

  将以下环境变量添加到您的 Lambda 函数:

  ```bash
  # Required: ClickStack OTLP endpoint
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317

  # Optional: Authentication headers
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"

  # Optional: Service name (defaults to Lambda function name)
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,service.version=1.0.0"
  ```

  ##### 高级配置(使用 .env 文件)

  对于更复杂的配置,请在 Lambda 函数包中创建 `rotel.env` 文件:

  **rotel.env:**

  ```bash
  ROTEL_OTLP_EXPORTER_ENDPOINT=https://clickstack.example.com:4317
  ROTEL_OTLP_EXPORTER_CUSTOM_HEADERS="Authorization=<YOUR_INGESTION_API_KEY>"
  ROTEL_OTEL_RESOURCE_ATTRIBUTES="service.name=my-lambda-api,deployment.environment=production"
  ```

  然后设置环境变量以指向此文件:

  ```bash
  ROTEL_ENV_FILE=/var/task/rotel.env
  ```

  ##### 使用 AWS Secrets Manager 或 Parameter Store

  对于生产环境部署,请将 API 密钥等敏感值存储在 AWS Secrets Manager 或 Parameter Store 中:

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

  将以下权限添加到您的 Lambda 执行角色中:

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
  AWS API 调用检索密钥会增加 100-150 毫秒的冷启动延迟。密钥以批量方式检索(最多 10 个),且仅在初始化时检索,因此后续调用不受影响。
  :::

  #### 测试集成

  调用您的 Lambda 函数以验证日志是否已发送到 ClickStack:

  ```bash
  aws lambda invoke \
    --function-name my-function \
    --payload '{"test": "data"}' \
    response.json
  ```

  检查 Lambda 日志是否有错误:

  ```bash
  aws logs tail /aws/lambda/my-function --follow
  ```

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX(ClickStack 的 UI)并验证日志是否正常流入:

  <Image img={log_view} alt="Lambda 日志视图" />

  <Image img={log} alt="Lambda 日志详细信息" />

  在日志中查找这些关键属性:

  * `service.name`：Lambda 函数的名称
  * `faas.name`: AWS Lambda 函数名称
  * `faas.invocation_id`: 唯一调用 ID
  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;lambda&quot;
</VerticalStepper>

## 禁用 CloudWatch Logs（成本优化） {#disable-cloudwatch}

默认情况下，AWS Lambda 会将所有日志发送到 CloudWatch Logs，这在大规模场景下可能非常昂贵。在确认日志已写入 ClickStack 后，可以禁用 CloudWatch 日志记录以降低成本。

<VerticalStepper headerLevel="h4">

#### 从执行角色中移除 CloudWatch 权限 \{#remove-permissions\}

1. 打开 AWS 控制台并导航到 **AWS Lambda**
2. 打开目标 Lambda 函数
3. 选择 **Configuration** → **Permissions**
4. 点击执行角色名称以打开 IAM 控制台
5. 编辑该角色并移除任何 `logs:*` 操作：
   - 如果使用自定义策略，编辑并移除 `logs:CreateLogGroup`、`logs:CreateLogStream` 和 `logs:PutLogEvents`
   - 如果使用 AWS 托管策略 `AWSLambdaBasicExecutionRole`，从该角色中移除该策略
6. 保存角色

#### 验证 CloudWatch 日志记录已被禁用 {#verify-disabled}

再次调用该函数并确认：
1. 未创建新的 CloudWatch 日志流
2. 日志仍会出现在 ClickStack/HyperDX 中

```bash
# 在策略变更后，这里不应显示新的日志流
aws logs describe-log-streams \
  --log-group-name /aws/lambda/my-function \
  --order-by LastEventTime \
  --descending \
  --max-items 5
```

</VerticalStepper>

## 添加 OpenTelemetry 自动埋点 {#auto-instrumentation}

Rotel Lambda Extension 可与 OpenTelemetry 的自动埋点层无缝配合，在收集日志的同时采集分布式 trace 和指标。

<VerticalStepper headerLevel="h4">

#### 选择适用于所用语言的自动埋点层 {#choose-instrumentation}

AWS 为多种语言提供了 OpenTelemetry 自动埋点层：

| Language | Layer ARN Pattern |
|----------|-------------------|
| Node.js  | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-{version}` |
| Python   | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-python-{arch}-ver-{version}` |
| Java     | `arn:aws:lambda:{region}:901920570463:layer:aws-otel-java-agent-{arch}-ver-{version}` |

在 [AWS OpenTelemetry Lambda repository](https://github.com/aws-observability/aws-otel-lambda) 中查找最新版本。

#### 将两个 layer 都添加到函数中 \{#add-both-layers\}

将 **Rotel 扩展 layer** 和 **自动埋点 layer** **同时** 添加到函数：

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers \
    arn:aws:lambda:{region}:418653438961:layer:rotel-extension-{arch}:{version} \
    arn:aws:lambda:{region}:901920570463:layer:aws-otel-nodejs-{arch}-ver-1-30-2:1
```

#### 配置自动埋点 {#configure-instrumentation}

设置 `AWS_LAMBDA_EXEC_WRAPPER` 环境变量以启用自动埋点：

**针对 Node.js：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

**针对 Python：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-instrument
```

**针对 Java：**
```bash
AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
```

#### 在 HyperDX 中验证 trace {#verify-traces}

在调用函数之后：

1. 进入 HyperDX 中的 **Traces** 视图
2. 你应该可以看到包含该 Lambda 函数 span 的 trace
3. 这些 trace 会通过 `trace_id` 和 `span_id` 属性与日志进行关联

</VerticalStepper>

## 示例应用 {#examples}

请查看演示 Rotel Lambda Extension 的 Python 示例应用：

- **[Python + ClickHouse](https://github.com/streamfold/python-aws-lambda-clickhouse-example)**：使用手动 OpenTelemetry 插桩的 Python 应用程序，将跟踪和日志直接发送到 ClickHouse

## 加入 Rotel 社区 {#join-rotel-community}

如果您对 Rotel 有任何疑问，请加入 [Rotel Discord 服务器](https://rotel.dev)，并在其中分享您的反馈或问题。查看 [Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)，为项目贡献改进。

## 其他资源 {#resources}

- **[Rotel Lambda Extension](https://github.com/streamfold/rotel-lambda-extension)**：源代码和详细文档
- **[Rotel Core](https://github.com/streamfold/rotel)**：驱动该扩展的轻量级 OTel 数据平面