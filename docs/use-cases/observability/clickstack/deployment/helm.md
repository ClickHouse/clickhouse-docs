---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Deploying ClickStack with Helm - The ClickHouse Observability Stack'
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';

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

### Add the HyperDX Helm Repository {#add-the-hyperdx-helm-repository}

Add the HyperDX Helm repository:

```sh
helm repo add hyperdx https://hyperdxio.github.io/helm-charts
helm repo update
```

### Installing HyperDX {#installing-hyperdx}

To install the HyperDX chart with default values:

```sh
helm install my-hyperdx hyperdx/hdx-oss-v2
```

### Verify the installation {#verify-the-installation}

Verify the installation:

```bash
kubectl get pods -l "app.kubernetes.io/name=hdx-oss-v2"
```

When all pods are ready proceed.

### Forward ports {#forward-ports}

Port forwarding allows us to access and set up HyperDX. Users deploying to production should instead expose the service via an ingress or load balancer to ensure proper network access, TLS termination, and scalability. Port forwarding is best suited for local development or one-off administrative tasks, not long-term or high-availability environments.

```bash
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=hdx-oss-v2 -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

### Navigate to the UI {#navigate-to-the-ui}

Navigate to [http://localhost:8080](http://localhost:8080) and create a user.

To connect to the deployed ClickHouse instance, use the Host `http://my-hyperdx-hdx-oss-v2-clickhouse:8123`, retaining the default `Username` and `Password`:

<Image img={hyperdx_24} alt="HyperDX Create connection" size="md"/>


Alternatively use your credentials for an externally hosted cluster e.g. ClickHouse Cloud.

### Customizing values (Optional) {#customizing-values}

You can customize settings by using `--set` flags e.g.

```bash
```sh
helm install my-hyperdx hyperdx/hdx-oss-v2 --set key=value
```

Alternatively edit the `values.yaml`. To retrieve the default values:

```sh
helm show values hyperdx/hdx-oss-v2 > values.yaml
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

```bash
helm install my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

### Using Secrets (Optional) {#using-secrets}

For handling sensitive data such as API keys or database credentials, use Kubernetes secrets. The HyperDX Helm charts provide default secret files that you can modify and apply to your cluster.

#### Using Pre-Configured Secrets {#using-pre-configured-secrets}

The Helm chart includes a default secret template located at [`charts/hdx-oss-v2/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/hdx-oss-v2/templates/secrets.yaml). This file provides a base structure for managing secrets.


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

```sh
kubectl apply -f secrets.yaml
```

#### Creating a Custom Secret {#creating-a-custom-secret}

If you prefer, you can create a custom Kubernetes secret manually:

```sh
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### Referencing a Secret {#referencing-a-secret}

To reference a secret in `values.yaml`  

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

</VerticalStepper>

## Using ClickHouse Cloud {#using-clickhouse-cloud}

If using ClickHouse Cloud users disable the ClickHouse instance deployed by the Helm chart:

```bash
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false 
```


## Production notes {#production-notes}

By default, this chart also installs clickhouse and the OTel collector. However, for production, it is recommended that you manage the clickhouse and OTel collector separately.

To disable clickhouse and OTel collector, set the following values:

```bash
helm install myrelease hyperdx-helm --set clickhouse.enabled=false --set clickhouse.persistence.enabled=false --set otel.enabled=false
```

## Task Configuration {#task-configuration}

By default, there is one task in the chart setup as a cronjob, responsible for checking whether alerts should fire. Here are its configuration options:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | Enable/Disable cron tasks in the cluster. By default, the HyperDX image will run cron tasks in the process. Change to true if you'd rather use a separate cron task in the cluster. | `false` |
| `tasks.checkAlerts.schedule` | Cron schedule for the check-alerts task | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Resource requests and limits for the check-alerts task | See `values.yaml` |

## Upgrading the Chart {#upgrading-the-chart}

To upgrade to a newer version:

```sh
helm upgrade my-hyperdx hyperdx/hdx-oss-v2 -f values.yaml
```

To check available chart versions:

```sh
helm search repo hyperdx
```

## Uninstalling HyperDX {#uninstalling-hyperdx}

To remove the deployment:

```sh
helm uninstall my-hyperdx
```

This will remove all resources associated with the release, but persistent data (if any) may remain.

## Troubleshooting {#troubleshooting}

### Checking Logs {#checking-logs}

```sh
kubectl logs -l app.kubernetes.io/name=hdx-oss-v2
```

### Debugging a Failed Install {#debugging-a-failed-instance}

```sh
helm install my-hyperdx hyperdx/hdx-oss-v2 --debug --dry-run
```

### Verifying Deployment {#verifying-deployment}

```sh
kubectl get pods -l app.kubernetes.io/name=hdx-oss-v2
```
