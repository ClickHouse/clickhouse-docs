---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Deploying ClickStack with Helm - The ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['ClickStack Helm chart', 'Helm ClickHouse deployment', 'HyperDX Helm installation', 'Kubernetes observability stack', 'ClickStack Kubernetes deployment']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::note Chart Migration
If you are currently using the `hdx-oss-v2` chart, please migrate to the `clickstack` chart. The `hdx-oss-v2` chart is in maintenance mode and will no longer receive new features. All new development is focused on the `clickstack` chart, which provides the same functionality with improved naming and better organization.
:::

The helm chart for HyperDX can be found [here](https://github.com/hyperdxio/helm-charts) and is the **recommended** method for production deployments.

By default, the Helm chart provisions all core components, including:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB** (for persistent application state)

However, it can be easily customized to integrate with an existing ClickHouse deployment - for example, one hosted in **ClickHouse Cloud**.

The chart supports standard Kubernetes best practices, including:

- Environment-specific configuration via `values.yaml`
- Resource limits and pod-level scaling
- TLS and ingress configuration
- Secrets management and authentication setup

### Suitable for {#suitable-for}

* Proof of concepts
* Production

## Deployment steps {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Prerequisites {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes cluster (v1.20+ recommended)
- `kubectl` configured to interact with your cluster

### Add the ClickStack Helm repository {#add-the-clickstack-helm-repository}

Add the ClickStack Helm repository:
```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### Installing ClickStack {#installing-clickstack}

To install the ClickStack chart with default values:
```shell
helm install my-clickstack clickstack/clickstack
```

### Verify the installation {#verify-the-installation}

Verify the installation:
```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

When all pods are ready, proceed.

### Forward ports {#forward-ports}

Port forwarding allows us to access and set up HyperDX. Users deploying to production should instead expose the service via an ingress or load balancer to ensure proper network access, TLS termination, and scalability. Port forwarding is best suited for local development or one-off administrative tasks, not long-term or high-availability environments.
```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::tip Production Ingress Setup
For production deployments, configure ingress with TLS instead of port forwarding. See the [Ingress Configuration guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) for detailed setup instructions.
:::

### Navigate to the UI {#navigate-to-the-ui}

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user, providing a username and password which meets the requirements. 

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

On clicking `Create`, data sources will be created for the ClickHouse instance deployed with the Helm chart.

:::note Overriding default connection
You can override the default connection to the integrated ClickHouse instance. For details, see ["Using ClickHouse Cloud"](#using-clickhouse-cloud).
:::

For an example of using an alternative ClickHouse instance, see ["Create a ClickHouse Cloud connection"](/docs/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### Customizing values (optional) {#customizing-values}

You can customize settings by using `--set` flags. For example:
```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Alternatively, edit the `values.yaml`. To retrieve the default values:
```shell
helm show values clickstack/clickstack > values.yaml
```

Example config:
```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
```
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

### Using secrets (optional) {#using-secrets}

For handling sensitive data such as API keys or database credentials, use Kubernetes secrets. The HyperDX Helm charts provide default secret files that you can modify and apply to your cluster.

#### Using pre-configured secrets {#using-pre-configured-secrets}

The Helm chart includes a default secret template located at [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). This file provides a base structure for managing secrets.

If you need to manually apply a secret, modify and apply the provided `secrets.yaml` template:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

Apply the secret to your cluster:
```shell
kubectl apply -f secrets.yaml
```

#### Creating a custom secret {#creating-a-custom-secret}

If you prefer, you can create a custom Kubernetes secret manually:
```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### Referencing a secret {#referencing-a-secret}

To reference a secret in `values.yaml`:
```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

:::tip API Key Management
For detailed API key setup instructions including multiple configuration methods and pod restart procedures, see the [API Key Setup guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration#api-key-setup).
:::

</VerticalStepper>

## Using ClickHouse Cloud {#using-clickhouse-cloud}

If using ClickHouse Cloud users disable the ClickHouse instance deployed by the Helm chart and specify the Cloud credentials:
```shell
# specify ClickHouse Cloud credentials
export CLICKHOUSE_URL=<CLICKHOUSE_CLOUD_URL> # full https url
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

# how to overwrite default connection
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.clickhouseEndpoint=${CLICKHOUSE_URL} \
  --set clickhouse.config.users.otelUser=${CLICKHOUSE_USER} \
  --set clickhouse.config.users.otelUserPassword=${CLICKHOUSE_PASSWORD}
```

Alternatively, use a `values.yaml` file:
```yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false
  config:
    users:
      otelUser: ${CLICKHOUSE_USER}
      otelUserPassword: ${CLICKHOUSE_PASSWORD}

otel:
  clickhouseEndpoint: ${CLICKHOUSE_URL}

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
# or if installed...
# helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

:::tip Advanced External Configurations
For production deployments with secret-based configuration, external OTEL collectors, or minimal setups, see the [Deployment Options guide](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options).
:::

## Production notes {#production-notes}

By default, this chart also installs ClickHouse and the OTel collector. However, for production, it is recommended that you manage ClickHouse and the OTel collector separately.

To disable ClickHouse and the OTel collector, set the following values:
```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

:::tip Production Best Practices
For production deployments including high availability configuration, resource management, ingress/TLS setup, and cloud-specific configurations (GKE, EKS, AKS), see:
- [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - Ingress, TLS, and secrets management
- [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - Cloud-specific settings and production checklist
:::

## Task configuration {#task-configuration}

By default, there is one task in the chart setup as a cronjob, responsible for checking whether alerts should fire. Here are its configuration options:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | Enable/Disable cron tasks in the cluster. By default, the HyperDX image will run cron tasks in the process. Change to true if you'd rather use a separate cron task in the cluster. | `false` |
| `tasks.checkAlerts.schedule` | Cron schedule for the check-alerts task | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Resource requests and limits for the check-alerts task | See `values.yaml` |

## Upgrading the chart {#upgrading-the-chart}

To upgrade to a newer version:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

To check available chart versions:
```shell
helm search repo clickstack
```

## Uninstalling ClickStack {#uninstalling-clickstack}

To remove the deployment:
```shell
helm uninstall my-clickstack
```

This will remove all resources associated with the release, but persistent data (if any) may remain.

## Troubleshooting {#troubleshooting}

### Checking logs {#checking-logs}
```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

### Debugging a failed install {#debugging-a-failed-install}
```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Verifying deployment {#verifying-deployment}
```shell
kubectl get pods -l app.kubernetes.io/name=clickstack
```

:::tip Additional Troubleshooting Resources
For ingress-specific issues, TLS problems, or cloud deployment troubleshooting, see:
- [Ingress Troubleshooting](/docs/use-cases/observability/clickstack/deployment/helm-configuration#troubleshooting-ingress) - Asset serving, path rewrites, browser issues
- [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud#loadbalancer-dns-resolution-issue) - GKE OpAMP issues and cloud-specific problems
:::

<JSONSupport/>

Users can set these environment variables via either parameters or the `values.yaml` e.g.

*values.yaml*
```yaml
hyperdx:
  ...
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  ...
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

or via `--set`:
```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## Related Documentation {#related-documentation}

### Deployment Guides {#deployment-guides}
- [Deployment Options](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - External ClickHouse, OTEL collector, and minimal deployments
- [Configuration Guide](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API keys, secrets, and ingress setup
- [Cloud Deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS configurations and production best practices

### Additional Resources {#additional-resources}
- [ClickStack Getting Started Guide](/docs/use-cases/observability/clickstack/getting-started) - Introduction to ClickStack
- [ClickStack Helm Charts Repository](https://github.com/hyperdxio/helm-charts) - Chart source code and values reference
- [Kubernetes Documentation](https://kubernetes.io/docs/) - Kubernetes reference
- [Helm Documentation](https://helm.sh/docs/) - Helm reference
