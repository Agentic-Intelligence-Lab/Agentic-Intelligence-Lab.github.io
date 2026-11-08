---
layout: post
title: GPT-6-Astra Edits a VLA Policy Directly
author: Xiaoquan Sun
image: images/gpt-6-astra-vla-weight-editing/workflow.png
tags:
- VLA
- GPT-6-Astra
excerpt: GPT-6-Astra edits a VLA checkpoint, increasing success on a LIBERO-PLUS task
  from 6% to 36%, with performance trade-offs on other lighting tasks.
---

<link rel="stylesheet" href="{{ '/files/gpt-6-astra-vla-weight-editing/post.css' | relative_url }}">

*The University of Hong Kong*

We downloaded a VLA [checkpoint](https://huggingface.co/StarVLA/Qwen3-VL-OFT-LIBERO-4in1) trained on the LIBERO benchmark and selected the task **“Put both moka pots on the stove”** under a lighting perturbation from the **Light Conditions** category of LIBERO-PLUS. The original checkpoint achieved a **S**uccess **R**ate (**SR**) of 3/50 (6%). We then gave GPT-6-Astra access to **all parameters of the checkpoint** and provided it with the results of each experiment, including both successful and failed trials. GPT-6-Astra iteratively edited the weights without gradient-based training. After **25 rounds**, the edited policy achieved an **SR of 18/50 (36%)**—an improvement of **30 percentage points**.

<div class="video-pair" id="pair-0-agentview"><div class="video-columns"><div class="video-panel"><div class="video-label"><span>VLA checkpoint</span><span class="outcome failure">Failure</span></div>
<div class="video-views"><div class="video-view"><video autoplay muted playsinline preload="auto" poster="{{ '/images/gpt-6-astra-vla-weight-editing/baseline_init00_agentview_poster.png' | relative_url }}" aria-label="Baseline VLA, third-person view, Failure"><source src="{{ '/files/gpt-6-astra-vla-weight-editing/baseline_init00_agentview.mp4' | relative_url }}" type="video/mp4"/><a href="{{ '/files/gpt-6-astra-vla-weight-editing/baseline_init00_agentview.mp4' | relative_url }}">Download video</a></video><div class="camera-label">Third-person view</div></div><div class="video-view"><video autoplay muted playsinline preload="auto" poster="{{ '/images/gpt-6-astra-vla-weight-editing/baseline_init00_wrist_poster.png' | relative_url }}" aria-label="Baseline VLA, wrist view, Failure"><source src="{{ '/files/gpt-6-astra-vla-weight-editing/baseline_init00_wrist.mp4' | relative_url }}" type="video/mp4"/><a href="{{ '/files/gpt-6-astra-vla-weight-editing/baseline_init00_wrist.mp4' | relative_url }}">Download video</a></video><div class="camera-label">Wrist view</div></div></div></div>
<div class="video-panel"><div class="video-label"><span>VLA checkpoint (<strong>edited by GPT-6-Astra</strong>)</span><span class="outcome success">Success</span></div>
<div class="video-views"><div class="video-view"><video autoplay muted playsinline preload="auto" poster="{{ '/images/gpt-6-astra-vla-weight-editing/edited_init00_agentview_poster.png' | relative_url }}" aria-label="Edited VLA, third-person view, Success"><source src="{{ '/files/gpt-6-astra-vla-weight-editing/edited_init00_agentview.mp4' | relative_url }}" type="video/mp4"/><a href="{{ '/files/gpt-6-astra-vla-weight-editing/edited_init00_agentview.mp4' | relative_url }}">Download video</a></video><div class="camera-label">Third-person view</div></div><div class="video-view"><video autoplay muted playsinline preload="auto" poster="{{ '/images/gpt-6-astra-vla-weight-editing/edited_init00_wrist_poster.png' | relative_url }}" aria-label="Edited VLA, wrist view, Success"><source src="{{ '/files/gpt-6-astra-vla-weight-editing/edited_init00_wrist.mp4' | relative_url }}" type="video/mp4"/><a href="{{ '/files/gpt-6-astra-vla-weight-editing/edited_init00_wrist.mp4' | relative_url }}">Download video</a></video><div class="camera-label">Wrist view</div></div></div></div></div></div>

We give GPT-6-Astra access to all model parameters and a simulator evaluation interface. It can inspect weights and analyze successful and failed trials after each round, along with execution trajectories and robot state records, to decide which parameters to edit next and by how much. The experiment follows a cycle of proposing edits, running evaluations, and analyzing feedback. After completing the editing rounds, we evaluate the edited VLA checkpoint over 50 trials. The process uses no gradient-based training, but it remains an optimization procedure driven by experimental feedback. The weights remain fixed throughout evaluation.

<figure class="figure" id="weight-editing-workflow"><a class="figure-image" href="{{ '/images/gpt-6-astra-vla-weight-editing/workflow.png' | relative_url }}"><img src="{{ '/images/gpt-6-astra-vla-weight-editing/workflow.png' | relative_url }}" style="width:100%;aspect-ratio:1600/680;object-fit:cover;object-position:top;max-height:unset" alt="Offline weight editing loop: GPT-6-Astra edits a VLA checkpoint, evaluates it in LIBERO-PLUS, and receives rollout feedback including successes, failures and trajectories."/></a><figcaption class="figure-caption"><strong>Figure 1. Workflow for editing VLA checkpoint weights with GPT-6-Astra</strong>. GPT-6-Astra uses simulator feedback to guide iterative weight updates.</figcaption></figure>

## Weight edits and transfer performance

Compared with the original VLA checkpoint, the edited version contains 76,858,078 modified parameter values, representing **1.71%** of the model's parameters, across 27 tensors. The modifications mainly affect the MLPs in language layers 34–35 and visual blocks 18–23.

The language edits attenuate a selected MLP output direction with coefficients of 0.50 and 0.55. In the final round, GPT-6-Astra scales the first-layer weights and biases of six visual MLPs by 0.5 and their second-layer weights by 2.0, leaving the second-layer biases unchanged. These factors apply to the checkpoint entering that round. Because GELU is nonlinear, the two scalings do not simply cancel. The improvement in **SR** reflects the accumulated edits and cannot be attributed solely to the final visual adjustment.

We then evaluated the fixed edited checkpoint on nine additional LIBERO-PLUS lighting tasks whose results had not been used to guide editing or checkpoint selection, with 50 trials per task. Compared with the original VLA checkpoint, **SR** decreased from 96.67% (435/450) to 88.22% (397/450). Performance declined on five tasks, remained unchanged on three, and improved on one.

These results suggest that the edits adapt the policy to the task supplying feedback, without producing a broad improvement across tasks. A plausible explanation is that changes to shared representations favor behaviors useful for the target task while disrupting behaviors required elsewhere. In robot control, even a small action change can alter subsequent observations and the rest of the trajectory. The current evidence therefore supports task-specific improvement accompanied by performance losses on other tasks, rather than a general increase in robustness. Separate tests of the visual and language modifications are needed to understand their contributions.

<table id="editing-round-results">
<caption><strong>Table 1. Edited Parameters and Success Rate Across Editing Rounds</strong></caption>
<thead><tr><th scope="col">Round</th><th scope="col">0</th><th scope="col">5</th><th scope="col">10</th><th scope="col">15</th><th scope="col">20</th><th scope="col">25</th></tr></thead>
<tbody>
<tr><th scope="row">Edited Parameters (%)</th><td>0%</td><td>0.3280%</td><td>0.5794%</td><td>0.5883%</td><td>1.1473%</td><td>1.7067%</td></tr>
<tr><th scope="row"><strong>SR</strong></th><td>3/50 (6%)</td><td>6/50 (12%)</td><td>14/50 (28%)</td><td>14/50 (28%)</td><td>16/50 (32%)</td><td>18/50 (36%)</td></tr>
</tbody>
</table>

## Acknowledgments

We thank the teams behind [Sparks of Weight-Space Programming](https://rikiyat.github.io/blog/weight-space-programming/), [StarVLA](https://github.com/starVLA/starVLA), and [LIBERO-Plus](https://github.com/sylvestf/LIBERO-plus) for these excellent projects.

<script src="{{ '/files/gpt-6-astra-vla-weight-editing/video-autoplay.js' | relative_url }}" defer></script>
