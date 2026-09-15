# Cheap math model benchmark evidence

Checked 14 September 2026. This note covers benchmark evidence; current OpenRouter prices and Pi compatibility are checked separately.

## Most useful comparable evidence

| Exact model | OTIS Mock AIME 2024–2025 | FrontierMath Tiers 1–3 (v2) | Source |
| --- | ---: | ---: | --- |
| Qwen3.7 Flash | 86.7% | 19.3% | [Epoch model results](https://epoch.ai/models/qwen3-7-flash) |
| DeepSeek V4 Flash 0731 | 94.4% | 57.5% | [Epoch model results](https://epoch.ai/models/deepseek-v4-flash-0731) |

These are the pages' **best scores across settings**, not guaranteed results at a particular low reasoning budget. Qwen offers thinking and no-thinking settings; DeepSeek lists none, low, high, max and unknown settings. The underlying tasks and reporting organization match, making this a more meaningful comparison than mixing unrelated vendor AIME numbers. [Qwen results](https://epoch.ai/models/qwen3-7-flash), [DeepSeek results](https://epoch.ai/models/deepseek-v4-flash-0731).

OTIS Mock AIME contains 45 competition-style questions from three 2024/2025 unofficial mock exams. It is **not the actual AIME 2025 benchmark**. Epoch extracts the final answer then compares it exactly with the answer key. This evaluates solving rather than patient teaching, misconception diagnosis, or tool-call reliability. [Benchmark methodology](https://epoch.ai/benchmarks/otis-mock-aime-2024-2025).

Interpretation: Qwen3.7 Flash has credible independent math evidence for a very cheap tutoring candidate; DeepSeek 0731 has substantially stronger difficult-math scores. For this Class 10 tutor, the deciding check should be successful generation, verification, feedback and journal updates inside our actual harness, measured at the intended reasoning budget and with actual token costs. Benchmark accuracy alone does not establish teaching quality.

## Variant and source caveats

- Alibaba documents `qwen3.7-flash` and snapshot `qwen3.7-flash-2026-07-15`, with function calling and structured output supported. Keep the OpenRouter model identifier separate from the Alibaba snapshot naming. [Official Alibaba documentation](https://www.alibabacloud.com/help/en/model-studio/qwen3-7-flash).
- DeepSeek explicitly calls **0731 the official release superseding Flash Preview**. Its official release card primarily reports agent benchmarks, not fresh math scores; do not attach Preview's math scores to 0731. The card supports low, high and max reasoning, and recommends large output budgets for high/max. Epoch provides directly named 0731 math results above. A mutable `latest` alias must be resolved before attaching these exact scores to it. [Official DeepSeek card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731).
- InclusionAI's official **Ling-3.0-flash** card states thinking is enabled by default and recommends temperature 0.6, top-p 0.95, top-k 20. Its numerical benchmark table is embedded in an inaccessible `intranetproxy.alipay.com` image; this research did not independently verify the commonly repeated AIME/HMMT numbers from that image. Therefore omit those numbers from a primary-source comparison. [Official Ling card](https://huggingface.co/inclusionAI/Ling-3.0-flash).
- Do not substitute **Ling-3.0-flash-base-30T** scores for the deployed instruction/reasoning model: it is a distinct base checkpoint. [Official base model card](https://huggingface.co/inclusionAI/Ling-3.0-flash-base-30T).

No application configuration or code was changed by this research.

## Live catalog and harness validation

Checked OpenRouter's public model catalog on 14 September 2026. Among paid, tool-capable, synchronous candidates with independently verified math results, Qwen3.7 Flash is the cheapest candidate identified for this tutor. This is not a claim that it is the cheapest model of any quality: Mistral Nemo and Ling-3.0-flash had lower listed prices, but comparable verified math evidence was not established here. Free and batch endpoints were excluded as the default for interactive tutoring.

| Candidate | Input $/million | Output $/million |
|---|---:|---:|
| Qwen3.7 Flash | 0.03 | 0.13 |
| DeepSeek V4 Flash 0731 | 0.06 | 0.12 |
| Qwen3.5 Flash | 0.065 | 0.26 |

Sources: [OpenRouter catalog API](https://openrouter.ai/api/v1/models), [Qwen3.7 Flash](https://openrouter.ai/qwen/qwen3.7-flash). Input/output mixture matters: DeepSeek has slightly cheaper output but double the input price. This tutor sends substantial course/history/tool context, making Qwen the cheaper choice under the tested workload structure. Reasoning tokens, retries and multiple tool rounds affect actual cost.

The actual Pi harness passed five live Qwen turns with the existing 1,536-output-token cap, covering feedback, interactive tool scenes, generated questions, observations, and restart memory. Observed latency was 4.9–6.6 seconds per turn. A later browser run hit an upstream HTTP 429 rate limit, so availability remains a practical limitation despite that successful smoke test.
