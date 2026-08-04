---
title: "SAIL-RevKL: Stable and Provable Self-Improving Online LLM Alignment"
image: images/logo.png
author: Xudong Wu
tags: technique
---

[**Paper**](https://arxiv.org/abs/2606.31524) · [**MuJoCo Code**](https://github.com/xudongwu-0/SAIL_mujoco) · [**LLM Code**](https://github.com/xudongwu-0/SAIL_LLM)

We are excited to share **SAIL-RevKL**, our work on making self-improving online alignment more stable and theoretically grounded. The paper, *On the Convergence of Self-Improving Online LLM Alignment*, has been accepted at **UAI 2026**.

## Why Online Alignment?

Most language-model alignment methods learn from a fixed preference dataset. While this approach is simple and effective, the dataset may not fully represent the responses produced by the model as it continues to improve.

Online alignment creates a continuous feedback loop: the current model generates new responses, receives fresh preference feedback, and then learns from that feedback. [SAIL](https://arxiv.org/abs/2406.15567) is an efficient framework for this setting, but an important question remained open: **will its learning process converge reliably?**

## Our Approach: SAIL-RevKL

We find that the original SAIL objective can have an unfavorable optimization landscape, which may make training unstable outside a local region. To address this issue, we introduce **SAIL-RevKL**, a simple extension that adds a reverse KL regularization term.

Intuitively, the reverse KL term acts as a guardrail. It keeps the updated policy anchored to a stable reference policy while still allowing the model to learn from new preference feedback. This small change makes the learning problem easier to optimize and allows us to establish a global convergence guarantee within a bounded parameter space.

## Main Highlights

- We explain why vanilla SAIL only has favorable convergence properties locally.
- We introduce reverse KL regularization as a simple way to stabilize SAIL.
- We establish a global convergence guarantee with near-linear sample complexity under standard assumptions.
- We show improved training stability and performance on both continuous-control benchmarks and LLM alignment tasks.

We evaluate SAIL-RevKL on Door Open, Walker Walk, Walker Stand, and Cheetah Run, as well as LLM alignment experiments using PKU-SafeRLHF and UltraFeedback. Across these settings, SAIL-RevKL consistently improves upon vanilla SAIL, showing that the reverse KL term is useful both theoretically and in practice.

