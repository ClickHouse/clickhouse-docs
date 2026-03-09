---
sidebar_label: 'Langfuse'
slug: /cloud/features/ai-ml/langfuse
title: 'Langfuse'
description: 'Langfuse — это платформа с открытым исходным кодом для разработки решений на базе LLM, которая помогает командам совместно отлаживать, анализировать и итеративно улучшать свои LLM‑приложения.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Langfuse \{#langfuse\}

## Что такое Langfuse? \{#what-is-langfuse\}

[Langfuse](https://langfuse.com) — это платформа для инженерии LLM с открытым исходным кодом, которая помогает командам совместно отлаживать, анализировать и итеративно улучшать LLM-приложения. Она является частью экосистемы ClickHouse и опирается в своей основе на **ClickHouse**, обеспечивая масштабируемый, высокопроизводительный бэкенд обсервабилити.

Благодаря столбцовой системе хранения и быстрым аналитическим возможностям ClickHouse Langfuse может обрабатывать миллиарды трейсов и событий с низкой задержкой, что делает её подходящей для production-нагрузок с высокой пропускной способностью.

## Почему Langfuse? \{#why-langfuse\}

- **Open source:** Полностью открытый исходный код с публичным API для пользовательских интеграций
- **Оптимизирован для продакшн-среды:** Спроектирован с минимальными накладными расходами на производительность
- **Лучшие в своём классе SDKs:** Нативные SDKs для Python и JavaScript
- **Поддержка фреймворков:** Интеграция с популярными фреймворками, такими как OpenAI SDK, LangChain и LlamaIndex
- **Мультимодальность:** Поддержка трассировки текста, изображений и других модальностей
- **Полноценная платформа:** Набор инструментов для полного жизненного цикла разработки LLM-приложений

## Варианты развертывания \{#deployment-options\}

Langfuse предлагает гибкие варианты развертывания для различных требований к безопасности и инфраструктуре.

**[Langfuse Cloud](https://cloud.langfuse.com)** — это полностью управляемый сервис на базе управляемого кластера ClickHouse для оптимальной производительности. Он сертифицирован по SOC 2 Type II и ISO 27001, соответствует требованиям GDPR и доступен в регионах обработки данных в США (AWS us-west-2) и ЕС (AWS eu-west-1).

**[Самостоятельное развертывание](https://langfuse.com/self-hosting)** Langfuse — полностью открытое ПО (лицензия MIT) и может бесплатно развертываться в вашей собственной инфраструктуре с использованием Docker или Kubernetes. Вы запускаете собственный экземпляр ClickHouse (или используете ClickHouse Cloud) для хранения данных обсервабилити, обеспечивая полный контроль над вашими данными. 

## Архитектура \{#architecture\}

Langfuse зависит только от компонентов с открытым исходным кодом и может быть развернут локально, в облачной инфраструктуре или в инфраструктуре заказчика (on-premises):

* **ClickHouse**: Хранит большие объёмы данных обсервабилити (трейсы, спаны, генерации, оценки). Обеспечивает быструю агрегацию и аналитику для дашбордов.
* **Postgres**: Хранит транзакционные данные, такие как учётные записи пользователей, конфигурации проектов и определения промптов.
* **Redis**: Отвечает за очереди событий и кэширование.
* **S3/Blob Storage**: Хранит крупные полезные данные (payloads) и сырые данные событий.

```mermaid
flowchart TB
    User["UI, API, SDKs"]
    subgraph vpc["VPC"]
        Web["Web Server<br/>(langfuse/langfuse)"]
        Worker["Async Worker<br/>(langfuse/worker)"]
        Postgres@{ img: "https://langfuse.com/images/logos/postgres_icon.svg", label: "Postgres - OLTP\n(Transactional Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        Cache@{ img: "https://langfuse.com/images/logos/redis_icon.png", label: "Redis\n(Cache, Queue)", pos: "b", w: 60, h: 60, constraint: "on" }
        Clickhouse@{ img: "https://langfuse.com/images/logos/clickhouse_icon.svg", label: "Clickhouse - OLAP\n(Observability Data)", pos: "b", w: 60, h: 60, constraint: "on" }
        S3@{ img: "https://langfuse.com/images/logos/s3_icon.svg", label: "S3 / Blob Storage\n(Raw events, multi-modal attachments)", pos: "b", w: 60, h: 60, constraint: "on" }
    end
    LLM["LLM API/Gateway<br/>(optional; BYO; can be same VPC or VPC-peered)"]

    User --> Web
    Web --> S3
    Web --> Postgres
    Web --> Cache
    Web --> Clickhouse
    Web -..->|"optional for playground"| LLM

    Cache --> Worker
    Worker --> Clickhouse
    Worker --> Postgres
    Worker --> S3
    Worker -..->|"optional for evals"| LLM
```


## Возможности \{#features\}

### Обсервабилити \{#observability\}

[Обсервабилити](/docs/observability/overview) имеет ключевое значение для понимания и отладки LLM-приложений. В отличие от традиционного ПО, LLM-приложения включают сложные и недетерминированные взаимодействия, которые трудно отслеживать и отлаживать. Langfuse предоставляет расширенные возможности трассировки, которые помогают точно понять, что происходит в вашем приложении.

*📹 Хотите узнать больше? [**Посмотрите сквозной обзор**](https://langfuse.com/watch-demo?tab=observability) Langfuse Observability и того, как интегрировать его с вашим приложением.*

<Tabs groupId="observability">
  <TabItem value="trace-details" label="Детали трассировки">
    Трейсы позволяют отслеживать каждый вызов LLM и другую связанную логику в вашем приложении.

    <video src="https://static.langfuse.com/docs-videos/trace-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>

  <TabItem value="sessions" label="Сессии">
    Сессии позволяют отслеживать многошаговые диалоги или агентные рабочие процессы.

    <video src="https://static.langfuse.com/docs-videos/sessions-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>

  <TabItem value="timeline" label="Хронология">
    Отлаживайте проблемы с задержками, анализируя представление временной шкалы.

    <video src="https://static.langfuse.com/docs-videos/timeline-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>

  <TabItem value="users" label="Пользователи">
    Добавьте собственный `userId`, чтобы отслеживать стоимость и использование для каждого пользователя. Дополнительно вы можете создать глубокую ссылку (deep link) на это представление в ваших системах.

    <video src="https://static.langfuse.com/docs-videos/users-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>

  <TabItem value="agent-graphs" label="Графы агентов">
    LLM-агенты могут быть визуализированы в виде графа, чтобы отобразить поток сложных агентных рабочих процессов.

    <video src="https://static.langfuse.com/docs-videos/langgraph-new-ui.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>

  <TabItem value="dashboard" label="Дашборд">
    Просматривайте метрики качества, стоимости и задержек в дашборде, чтобы отслеживать ваше LLM-приложение.

    <video src="https://static.langfuse.com/docs-videos/dashboard.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />
  </TabItem>
</Tabs>

### Управление промптами \{#prompt-management\}

[Управление промптами](/docs/prompt-management/overview) критически важно для создания эффективных LLM-приложений. Langfuse предоставляет инструменты, которые помогают управлять промптами, версионировать их и оптимизировать на протяжении всего жизненного цикла разработки.

_📹 Хотите узнать больше? [**Посмотрите сквозной обзор**](https://langfuse.com/watch-demo?tab=prompt) Langfuse Prompt Management и его интеграции с вашим приложением._

<Tabs groupId="prompt-management">
<TabItem value="create" label="Create">

Создавайте новые промпты через UI, SDKS или API.

<video src="https://static.langfuse.com/docs-videos/create-update-prompts.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="version-control" label="Version Control">

Совместно версионируйте и редактируйте промпты через UI, API или SDKS.

<video src="https://static.langfuse.com/docs-videos/create-prompt-version.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="deploy" label="Deploy">

Развёртывайте промпты в продакшн или любую другую среду с помощью меток — без изменений кода.

<video src="https://static.langfuse.com/docs-videos/deploy-prompt.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="metrics" label="Metrics">

Сравнивайте задержку, стоимость и метрики качества для разных версий ваших промптов.

<video src="https://static.langfuse.com/docs-videos/prompt-metrics.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="test-in-playground" label="Test in Playground">

Мгновенно тестируйте ваши промпты в песочнице (playground).

<video src="https://static.langfuse.com/docs-videos/prompt-to-playground.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="link-with-traces" label="Link with Traces">

Связывайте промпты с трейсами, чтобы понять, как они работают в контексте вашего LLM-приложения.

<video src="https://static.langfuse.com/docs-videos/linked-generations.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="track-changes" label="Track Changes">

Отслеживайте изменения в ваших промптах, чтобы понимать, как они меняются со временем.

<video src="https://static.langfuse.com/docs-videos/track-changes.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
</Tabs>

### Оценка и наборы данных \{#evaluation\}

[Оценка](/docs/evaluation/overview) имеет решающее значение для обеспечения качества и надежности ваших LLM-приложений. Langfuse предоставляет гибкие инструменты оценки, которые адаптируются к вашим конкретным потребностям, независимо от того, проводите ли вы тестирование в процессе разработки или отслеживаете производительность в продакшене.

_📹 Хотите узнать больше? [**Посмотрите сквозной обзор**](https://langfuse.com/watch-demo?tab=evaluation) Langfuse Evaluation и того, как использовать его для улучшения вашего LLM-приложения._

<Tabs groupId="evaluation">
<TabItem value="analytics" label="Analytics">

Стройте графики результатов оценки на дашборде Langfuse.

<video src="https://static.langfuse.com/docs-videos/scores-dashboard.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="user-feedback" label="User Feedback">

Собирайте обратную связь от ваших пользователей. Ее можно собирать на фронтенде через наш Browser SDK, на стороне сервера через SDKs или API. В видео также показан пример приложения.

<video src="https://static.langfuse.com/docs-videos/scores-user-feedback.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="llm-as-a-judge" label="LLM-as-a-Judge">

Запускайте полностью управляемые оценки LLM-as-a-Judge на продакшен- или dev-трейсах. Их можно применять к любому шагу внутри вашего приложения для пошаговой оценки.

<video src="https://static.langfuse.com/docs-videos/scores-llm-as-a-judge.mp4%20MOVED%20TO%20R2.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="experiments" label="Experiments">

Оценивайте промпты и модели на наборах данных напрямую в пользовательском интерфейсе. Пользовательский код не требуется.

<video src="https://static.langfuse.com/docs-videos/prompt-experiments.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="annotation-queue" label="Annotation Queue">

Задайте базовый уровень для вашего процесса оценки с помощью человеческих аннотаций через очереди аннотаций.

<video src="https://static.langfuse.com/docs-videos/scores-annotation-queue.mp4" autoPlay loop muted playsInline width="100%" style={{boxShadow: "0px 1px 8px -1px rgba(21, 21, 21, 0.20)", borderRadius: "4px"}} />

</TabItem>
<TabItem value="custom-evals" label="Custom Evals">

Добавляйте пользовательские результаты оценки; поддерживаются числовые, булевы и категориальные значения.

```bash
POST /api/public/scores
```

Добавляйте оценки через Python или JS SDK.

```python title="Example (Python)"
langfuse.score(
  trace_id="123",
  name="my_custom_evaluator",
  value=0.5,
)
```

</TabItem>
</Tabs>

## Быстрый старт \{#quickstarts\}

Начните работу с Langfuse за несколько минут. Выберите вариант, который лучше всего соответствует вашим текущим задачам:

- [Подключите трассировку LLM‑приложений и агентов](https://langfuse.com/docs/observability/get-started)
- [Подключите управление промптами](https://langfuse.com/docs/prompt-management/get-started)
- [Настройте оценки](https://langfuse.com/docs/evaluation/overview)

## Узнайте больше \{#learn-more\}

- [Документация Langfuse](https://langfuse.com/docs)
- [Репозиторий Langfuse на GitHub](https://github.com/langfuse/langfuse)
- [Посмотрите демо‑ролик](https://langfuse.com/watch-demo)