---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm configuration'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Configuring API keys, secrets, and ingress for ClickStack Helm deployments'
doc_type: 'guide'
keywords: ['ClickStack configuration', 'Helm secrets', 'API key setup', 'ingress configuration', 'TLS setup']
---

:::warning Chart version 2.x
This page documents the **v2.x** subchart-based Helm chart. If you are still using the v1.x inline-template chart, see [Helm configuration (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1). For migration steps, see the [Upgrade guide](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

This guide covers configuration options for ClickStack Helm deployments. For basic installation, see the [main Helm deployment guide](/docs/use-cases/observability/clickstack/deployment/helm).

## Values organization {#values-organization}

The v2.x chart organizes values by Kubernetes resource type under the `hyperdx:` block:

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"

  config:         # → clickstack-config ConfigMap (non-sensitive env vars)
    APP_PORT: "3000"
    HYPERDX_LOG_LEVEL: "info"

  secrets:        # → clickstack-secret Secret (sensitive env vars)
    HYPERDX_API_KEY: "..."
    CLICKHOUSE_PASSWORD: "otelcollectorpass"
    CLICKHOUSE_APP_PASSWORD: "hyperdx"
    MONGODB_PASSWORD: "hyperdx"

  deployment:     # K8s Deployment spec (image, replicas, probes, etc.)
  service:        # K8s Service spec (type, annotations, apiPort)
  ingress:        # K8s Ingress (passthrough annotations + spec)
  autoscaling:    # K8s HorizontalPodAutoscaler (passthrough spec)
  networkPolicy:  # K8s NetworkPolicy (passthrough spec)
  serviceAccount: # K8s ServiceAccount (annotations)
  podDisruptionBudget:  # K8s PDB spec
  tasks:          # K8s CronJob specs
```

All environment variables flow through two static-named resources shared by the HyperDX Deployment **and** the OTEL Collector via `envFrom`:

- **`clickstack-config`** ConfigMap — populated from `hyperdx.config`
- **`clickstack-secret`** Secret — populated from `hyperdx.secrets`

There is no longer a separate OTEL-specific ConfigMap. Both workloads read from the same sources.

## API key setup {#api-key-setup}

After successfully deploying ClickStack, configure the API key to enable telemetry data collection:

1. **Access your HyperDX instance** via the configured ingress or service endpoint
2. **Log into the HyperDX dashboard** and navigate to Team settings to generate or retrieve your API key
3. **Update your deployment** with the API key using one of the following methods:

### Method 1: Update via Helm upgrade with values file {#api-key-values-file}

Add the API key to your `values.yaml`:
```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key-here"
```

Then upgrade your deployment:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Method 2: Update via Helm upgrade with --set flag {#api-key-set-flag}
```shell
helm upgrade my-clickstack clickstack/clickstack \
  --set hyperdx.secrets.HYPERDX_API_KEY="your-api-key-here"
```

### Restart pods to apply changes {#restart-pods}

After updating the API key, restart the pods to pick up the new configuration:
```shell
kubectl rollout restart deployment my-clickstack-clickstack-app
```

:::note
The chart automatically creates a Kubernetes secret (`clickstack-secret`) with your configuration values. No additional secret configuration is needed unless you want to use an external secret.
:::

## Secret management {#secret-management}

For handling sensitive data such as API keys or database credentials, the v2.x chart provides a unified `clickstack-secret` resource populated from `hyperdx.secrets`.

### Default secret values {#default-secret-values}

The chart ships with default values for all secrets. Override them in your `values.yaml`:
```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key"
    CLICKHOUSE_PASSWORD: "your-clickhouse-otel-password"
    CLICKHOUSE_APP_PASSWORD: "your-clickhouse-app-password"
    MONGODB_PASSWORD: "your-mongodb-password"
```

### Disabling the chart-managed secret {#disabling-chart-secret}

For advanced deployments where secrets are managed externally (e.g., via an external secrets operator or pre-created Kubernetes secrets), set `secrets` to `null` to skip creation of the `clickstack-secret` entirely:

```yaml
hyperdx:
  secrets: null

  config:
    # Override defaults that use tpl expressions referencing secrets
    MONGO_URI: ""
    CLICKHOUSE_ENDPOINT: ""
    CLICKHOUSE_SERVER_ENDPOINT: ""
    CLICKHOUSE_PROMETHEUS_METRICS_ENDPOINT: ""
    OPAMP_SERVER_URL: ""

  deployment:
    defaultConnections: ""
    defaultSources: ""
    env:
      - name: HYPERDX_API_KEY
        valueFrom:
          secretKeyRef:
            name: my-external-secret
            key: api-key
      - name: MONGO_URI
        valueFrom:
          secretKeyRef:
            name: my-db-secret
            key: connection-string
```

When `secrets` is `null`:
- You must provide all required environment variables through `deployment.env` with `valueFrom` entries
- Override config values that reference secrets via template expressions (`MONGO_URI`, `CLICKHOUSE_ENDPOINT`, etc.) with empty strings or your own values
- Set `deployment.defaultConnections` and `deployment.defaultSources` to empty strings (the defaults reference secret values)
- The chart will fail to render if any subchart (MongoDB, ClickHouse, OTEL collector) is enabled

See the [API-only deployment example](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/api-only) for a complete configuration using this pattern.

### Using an external secret {#using-external-secret}

For production deployments where you want to keep credentials separate from Helm values, use an external Kubernetes secret:

```bash
# Create your secret
kubectl create secret generic my-clickstack-secrets \
  --from-literal=HYPERDX_API_KEY=my-secret-api-key \
  --from-literal=CLICKHOUSE_PASSWORD=my-ch-password \
  --from-literal=CLICKHOUSE_APP_PASSWORD=my-ch-app-password \
  --from-literal=MONGODB_PASSWORD=my-mongo-password
```

Then reference it in your values:
```yaml
hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "my-clickstack-secrets"
```

## Ingress setup {#ingress-setup}

The chart uses a passthrough ingress pattern: `annotations` and `spec` are rendered verbatim so any ingress controller (nginx, ALB, Traefik, etc.) can be configured through values alone.

### Nginx ingress example {#nginx-ingress-example}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

  ingress:
    enabled: true
    annotations:
      nginx.ingress.kubernetes.io/rewrite-target: /$1
      nginx.ingress.kubernetes.io/use-regex: "true"
      nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    spec:
      ingressClassName: nginx
      rules:
        - host: hyperdx.yourdomain.com
          http:
            paths:
              - path: /(.*)
                pathType: ImplementationSpecific
                backend:
                  service:
                    name: my-clickstack-app
                    port:
                      number: 3000
      tls:
        - hosts:
            - hyperdx.yourdomain.com
          secretName: hyperdx-tls
```

:::note Important configuration note
`hyperdx.frontendUrl` should match the ingress host and include the protocol (e.g., `https://hyperdx.yourdomain.com`). This ensures that all generated links, cookies, and redirects work correctly.
:::

### AWS ALB ingress example {#alb-ingress-example}

```yaml
hyperdx:
  ingress:
    enabled: true
    annotations:
      alb.ingress.kubernetes.io/scheme: internet-facing
      alb.ingress.kubernetes.io/target-type: ip
      alb.ingress.kubernetes.io/certificate-arn: "arn:aws:acm:us-east-1:123456789:certificate/your-cert-id"
      alb.ingress.kubernetes.io/healthcheck-path: /api/health
    spec:
      ingressClassName: alb
      rules:
        - host: clickstack.example.com
          http:
            paths:
              - path: /
                pathType: Prefix
                backend:
                  service:
                    name: my-clickstack-app
                    port:
                      name: app
```

See the [ALB ingress example](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress) for a complete configuration.

### Common ingress pitfalls {#common-ingress-pitfalls}

**Path and rewrite configuration:**
- For Next.js and other SPAs with nginx, always use a regex path and rewrite annotation
- Don't use just `path: /` without a rewrite when using nginx, as this will break static asset serving

**Mismatched `frontendUrl` and ingress host:**
- If these don't match, you may experience issues with cookies, redirects, and asset loading

**TLS misconfiguration:**
- Ensure your TLS secret is valid and referenced correctly in the ingress spec
- Browsers may block insecure content if you access the app over HTTP when TLS is enabled

## OTEL collector ingress {#otel-collector-ingress}

If you need to expose your OTEL collector endpoints (for traces, metrics, logs) through a separate ingress, use the `additionalIngresses` feature. This creates additional ingress resources alongside the primary one:

```yaml
hyperdx:
  ingress:
    enabled: true
    # ... primary ingress config ...
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

:::note
`additionalIngresses` is gated by `ingress.enabled` and uses its own structured format (not the passthrough pattern). It is a power feature for multi-ingress setups where different endpoints need different controllers or TLS configurations.
:::

## Autoscaling {#autoscaling}

Enable a HorizontalPodAutoscaler for the HyperDX deployment. The chart auto-wires `scaleTargetRef` to the HyperDX deployment; the remaining HPA spec is passed through:

```yaml
hyperdx:
  autoscaling:
    enabled: true
    spec:
      minReplicas: 2
      maxReplicas: 10
      metrics:
        - type: Resource
          resource:
            name: cpu
            target:
              type: Utilization
              averageUtilization: 75
        - type: Resource
          resource:
            name: memory
            target:
              type: Utilization
              averageUtilization: 80
```

When `autoscaling.enabled` is `true`, the deployment's `replicas` field is omitted so the HPA controls scaling. Any valid `autoscaling/v2` HPA spec fields (`minReplicas`, `maxReplicas`, `metrics`, `behavior`) can be provided.

:::warning
Do not include `scaleTargetRef` in `autoscaling.spec`. The chart automatically sets `scaleTargetRef` to the HyperDX deployment. If `scaleTargetRef` is present in the spec, the template will fail with an error asking you to remove it.
:::

:::note
If you later disable autoscaling, the deployment will revert to `deployment.replicas` (default `1`), not the replica count the HPA had scaled to. Before disabling autoscaling, set `deployment.replicas` to your desired baseline, or use `minReplicas` in the HPA spec as your effective minimum.
:::

## Network policy {#network-policy}

Enable a NetworkPolicy for the HyperDX deployment. The full `spec` is passed through so any policy shape can be expressed:

```yaml
hyperdx:
  networkPolicy:
    enabled: true
    spec:
      podSelector: {}
      policyTypes:
        - Egress
      egress:
        - to:
            - ipBlock:
                cidr: 0.0.0.0/0
                except:
                  - 169.254.169.254/32
```

This example blocks access to the cloud provider instance metadata endpoint. Provide any valid NetworkPolicy spec fields (`podSelector`, `policyTypes`, `ingress`, `egress`).

## Service account {#service-account}

Create a ServiceAccount for the HyperDX deployment, or reference an existing one:

```yaml
# Create a new ServiceAccount (chart-managed)
hyperdx:
  serviceAccount:
    create: true
    annotations:
      eks.amazonaws.com/role-arn: "arn:aws:iam::123456789:role/my-api-role"
```

```yaml
# Use a pre-existing ServiceAccount (not chart-managed)
hyperdx:
  serviceAccount:
    create: false
    name: "my-existing-service-account"
```

When `create` is `true` and `name` is empty, the ServiceAccount name defaults to the chart's fullname. When `create` is `false` but `name` is set, the deployment references the existing ServiceAccount without creating one. Use annotations for provider-specific bindings (e.g., `eks.amazonaws.com/role-arn` for AWS IAM Roles for Service Accounts).

## Service API port {#service-api-port}

By default, the HyperDX service exposes the app port (3000) and OpAMP port (4320). When the service ports are exposed directly (e.g., via NodePort or LoadBalancer) and clients need to reach the API on port 8000, enable the API port on the service:

```yaml
hyperdx:
  service:
    apiPort:
      enabled: true
```

This adds port 8000 (or the value of `hyperdx.ports.api`) to the service.

## OTEL collector configuration {#otel-collector-configuration}

The OTEL Collector is deployed via the official OpenTelemetry Collector Helm chart as the `otel-collector:` subchart. Configure it directly under `otel-collector:` in your values:

```yaml
otel-collector:
  enabled: true
  mode: deployment
  replicaCount: 3
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

Environment variables (ClickHouse endpoint, OpAMP URL, etc.) are shared via the unified `clickstack-config` ConfigMap and `clickstack-secret` Secret. The subchart's `extraEnvsFrom` is pre-wired to read from both.

See the [OpenTelemetry Collector Helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector) for all available subchart values.

## MongoDB configuration {#mongodb-configuration}

MongoDB is managed by the MCK operator via a `MongoDBCommunity` custom resource. The CR spec is rendered verbatim from `mongodb.spec`:

```yaml
mongodb:
  enabled: true
  spec:
    members: 1
    type: ReplicaSet
    version: "5.0.32"
    security:
      authentication:
        modes: ["SCRAM"]
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              accessModes: ["ReadWriteOnce"]
              storageClassName: "your-storage-class"
              resources:
                requests:
                  storage: 10Gi
```

The MongoDB password is set in `hyperdx.secrets.MONGODB_PASSWORD`. See the [MCK documentation](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity) for all available CRD fields.

## ClickHouse configuration {#clickhouse-configuration}

ClickHouse is managed by the ClickHouse Operator via `ClickHouseCluster` and `KeeperCluster` custom resources. Both CR specs are rendered verbatim from values:

```yaml
clickhouse:
  enabled: true
  port: 8123
  nativePort: 9000
  prometheus:
    enabled: true
    port: 9363
  keeper:
    spec:
      replicas: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      replicas: 1
      shards: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

ClickHouse user credentials are sourced from `hyperdx.secrets` (not `clickhouse.config.users` as in v1.x). See the [ClickHouse Operator configuration guide](https://clickhouse.com/docs/clickhouse-operator/guides/configuration) for all available CRD fields.

## Troubleshooting ingress {#troubleshooting-ingress}

**Check ingress resource:**
```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Check ingress controller logs:**
```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Test asset URLs:**

Use `curl` to verify static assets are served as JS, not HTML:
```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Browser DevTools:**
- Check the Network tab for 404s or assets returning HTML instead of JS
- Look for errors like `Unexpected token <` in the console (indicates HTML returned for JS)

**Check for path rewrites:**
- Ensure the ingress isn't stripping or incorrectly rewriting asset paths

**Clear browser and CDN cache:**
- After changes, clear your browser cache and any CDN/proxy cache to avoid stale assets

## Customizing values {#customizing-values}

You can customize settings by using `--set` flags:
```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Alternatively, create a custom `values.yaml`. To retrieve the default values:
```shell
helm show values clickstack/clickstack > values.yaml
```

Apply your custom values:
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## Next steps {#next-steps}

- [Deployment options](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - External systems and minimal deployments
- [Cloud deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, and AKS configurations
- [Upgrade guide](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - Migrating from v1.x to v2.x
- [Additional manifests](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - Custom Kubernetes objects
- [Main Helm guide](/docs/use-cases/observability/clickstack/deployment/helm) - Basic installation
- [Configuration (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x configuration guide
