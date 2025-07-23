---
slug: /cloud/get-started/cloud/use-cases/observability
title: 'Observability'
keywords: ['use cases', 'observability']
sidebar_label: 'Observability'
---

Modern software systems are complex. Microservices, cloud infrastructure, and 
distributed systems have made it increasingly difficult to understand what's 
happening inside our applications. When something goes wrong, teams need to know
where and why quickly.

This is where observability comes in. It's evolved from simple system monitoring
into a comprehensive approach to understanding system behavior. However, 
implementing effective observability isn't straightforward - it requires 
understanding technical concepts and organizational challenges.

## What is Observability?

Observability is understanding a system's internal state by examining its outputs.
In software systems, this means understanding what's happening inside your 
applications and infrastructure through the data they generate.

This field has evolved significantly and can be understood through two distinct 
generations of observability approaches.

The first generation, often called Observability 1.0, was built around the 
traditional "three pillars" approach of metrics, logs, and traces. This approach 
required multiple tools and data stores for different types of telemetry. It 
often forced engineers to pre-define what they wanted to measure, making it 
costly and complex to maintain multiple systems.

Modern observability, or Observability 2.0, takes a fundamentally different 
approach. It's based on collecting wide, structured events for each unit of work
(e.g., an HTTP request and response) in our system. This approach captures 
high-cardinality data, such as user IDs, request IDs, Git commit hashes, 
instance IDs, Kubernetes pod names, specific route parameters, and vendor 
transaction IDs. A rule of thumb is adding a piece of metadata if it could help 
us understand how the system behaves.

This rich data collection enables dynamic slicing and dicing of data without 
pre-defining metrics. Teams can derive metrics, traces, and other visualizations
from this base data, allowing them to answer complex questions about system 
behavior that weren't anticipated when the instrumentation was first added.

However, implementing modern observability capabilities presents its challenges.
Organizations need reliable ways to collect, process, and export this rich 
telemetry data across diverse systems and technologies. While modern approaches 
have evolved beyond traditional boundaries, understanding the fundamental 
building blocks of observability remains crucial.

## The three pillars of observability {#three-pillars-of-observability}

To better understand how observability has evolved and works in practice, let's 
examine the three pillars of observability - logs, metrics, and traces.

While modern observability has moved beyond treating these as separate concerns, 
they remain fundamental concepts for understanding different aspects of system 
behavior.


## Observability use cases {#observability-use-cases}

LangChain is a popular software framework that helps users build applications 
that use large language models. They have built a commercial product called 
LangSmith, a unified developer platform for LLM application observability and 
evaluation that uses ClickHouse under the hood. LangSmith lets users understand 
what’s going on in their LLM applications and allows them to debug agentic 
workflows. It also helps developers detect excessive token use, a costly problem
they want to detect as soon as possible. When working with LLM applications, 
there are invariably many moving pieces with chained API calls and decision 
flows. This makes it challenging to understand what's going on under the hood, 
with users needing to debug infinite agent loops or cases with excessive token 
use. Seeing an obvious need here, LangSmith started as an observability tool to 
help developers diagnose and resolve these issues by giving clear visibility and
debugging information at each step of an LLM sequence.

> We wanted something that was architecturally simple to deploy and didn’t make 
> our infrastructure more complicated. We looked at Druid and Pinot, but these 
> required dedicated services for ingestion, connected to queuing services such 
> as Kafka, rather than simply accepting `INSERT` statements. We were keen to avoid
> this architectural complexity,

