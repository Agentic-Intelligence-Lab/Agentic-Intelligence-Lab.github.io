---
title: ROMBRL — Policy-Driven World Model Adaptation for Robust Offline Model-based RL (ICML 2026)
image: images/logo.png
author: Le Xu
tags: publication offline-rl robustness model-based-rl
---

Our paper, **"Policy-Driven World Model Adaptation for Robust Offline Model-based Reinforcement Learning"**, was presented as a **poster at ICML 2026** in Seoul, South Korea. This is joint work between the Agentic Intelligence Lab, Tsinghua University, and the Robotics Institute at Carnegie Mellon University.

- **Paper (arXiv):** [arxiv.org/abs/2505.13709](https://arxiv.org/abs/2505.13709)
- **OpenReview:** [openreview.net/forum?id=eB5i7caric](https://openreview.net/forum?id=eB5i7caric)
- **Project page (full results, method details, poster):** [agentic-intelligence-lab.github.io/ROMBRL](https://agentic-intelligence-lab.github.io/ROMBRL/)
- **Code:** [github.com/Agentic-Intelligence-Lab/ROMBRL](https://github.com/Agentic-Intelligence-Lab/ROMBRL)

<a href="/files/rombrl-poster.pdf" target="_blank">
  <img src="images/rombrl-poster.png" alt="ROMBRL ICML 2026 poster" style="width:100%; max-width:100%; height:auto; border:1px solid #ddd;">
</a>
<p style="text-align:center; font-size:0.9em; margin-top:-0.5em;"><em>Our ICML 2026 poster — click for the full-resolution PDF.</em></p>

## TL;DR

Offline model-based RL (MBRL) usually learns a world model and a policy in two separate stages — first fit the model to maximize data likelihood, then optimize the policy against the fixed model. This mismatch leaves policies brittle: even small amounts of deployment-time noise can wreck performance. We propose **ROMBRL**, which jointly adapts the world model *with* the policy under a single **constrained maximin objective**, solved via **Stackelberg learning dynamics** with the policy as the leader and the world model as an adversarial follower. ROMBRL comes with a formal suboptimality bound and achieves state-of-the-art robustness on D4RL MuJoCo and stochastic Tokamak Control benchmarks — with almost no cost to clean-environment performance.

## Why Do Offline RL Policies Fall Apart Under a Little Noise?

Offline MBRL is appealing because it lets us train a policy from a static dataset by rolling it out inside a *learned* simulator, rather than the real environment — no risky exploration, no expensive interaction. But nearly all existing methods follow the same two-stage recipe: first fit a world model $P_\phi$ to maximize the likelihood of observed transitions, then freeze it (or only mildly adapt it) and optimize the policy $\pi_\theta$ against it.

That split has a quiet cost. The model is trained to *explain the data*, not to *support good policy learning* — an objective mismatch that's easy to miss when you only evaluate in a clean, deterministic simulator. So we asked a more adversarial question: what happens to these policies once the environment doesn't behave exactly like the simulator? We took a stable of strong offline RL baselines — CQL, EDAC, COMBO, MOBILE, and even RAMBO, which is specifically designed with an adversarial world model — and added just 5% Gaussian noise to state transitions at deployment time. Every one of them lost a substantial chunk of performance. Robustness, it turns out, is not something these methods get for free from good average returns.

## The Trick: Turn Model Adaptation Into an Adversary's Move

If the world model is going to be wrong somewhere, we'd rather it be wrong in a way our policy has already prepared for. That's the intuition behind **ROMBRL**: instead of treating the world model as a fixed, passive stand-in for the environment, we make it move *against* the policy during training, so that whatever the policy learns has already survived a worst-case opponent.

Formally, we cast offline MBRL as a constrained maximin problem:

$$\max_\theta J(\theta, \phi') \quad \text{s.t.} \quad \phi' \in \arg\min_{\phi \in \Phi} J(\theta, \phi)$$

where $\Phi$ is an uncertainty set of world models anchored to the maximum-likelihood estimate (a KL trust region around what the offline data actually supports — conservatism still matters offline, we're not letting the model run wild). The policy maximizes its return against the *worst* model in that set; the model adversarially minimizes it.

We solve this as a **Stackelberg game**: the policy is the *leader*, the world model is the *follower* that best-responds to the policy — the mirror image of online MBRL, where the model is usually adapted to help the leader rather than oppose it. Using implicit differentiation through the follower's best response, we derive primal-dual Stackelberg update rules for $(\theta, \phi, \lambda)$, and make them practical at scale with a few tricks: the **Fisher Information Matrix** stands in for expensive second-order terms, the **Woodbury matrix identity** inverts the resulting low-rank matrix in time linear (not cubic) in the parameter count, and a **gradient-mask mechanism** keeps off-policy replay data from going stale as the model shifts under the policy — a subtlety that RAMBO's simpler alternating-update scheme overlooks.

This isn't just an engineering trick, either: Theorem 3.1 gives a formal bound on the resulting policy's suboptimality gap that shrinks as the offline dataset grows, so the robustness we see empirically has theoretical backing rather than being a happy accident. (We instantiate the bound concretely for both tabular MDPs and continuous MDPs with Gaussian world models — see the [project page](https://agentic-intelligence-lab.github.io/ROMBRL/) or Section 3 of the paper for the full statements.)

## From MuJoCo to a Real Fusion Reactor

Gaussian noise on MuJoCo is a convenient stress test, but it's still synthetic. To find out whether any of this matters outside a benchmark, we went looking for a control problem where the "noise" isn't something we inject — it's baked into the physics. Tokamak plasma control was a natural fit: confining and shaping a superheated plasma is a genuinely stochastic process, and we evaluated on tracking tasks (ion rotation, electron density, and $\beta_N$, a key economic indicator for fusion efficiency) built on an ensemble of recurrent dynamics models calibrated to real operational data from DIII-D, a working tokamak in San Diego.

This benchmark is considerably less forgiving than D4RL MuJoCo — several strong model-based baselines (RAMBO, MOBILE, and a Bayes-adaptive MCTS baseline) that look competitive on MuJoCo degrade sharply once the dynamics get genuinely messy. ROMBRL held up: it ranked first on 2 of the 3 tracking targets, second on the third, and had by far the lowest variance across seeds of any method we tested. That gap is the clearest evidence we have that adversarial world-model adaptation isn't just a MuJoCo party trick — it transfers to the kind of high-stakes, physically-grounded control problem where robustness actually matters.

## Headline Result

Across the full D4RL MuJoCo suite (OfflineRL-Kit protocol), ROMBRL matches the best clean-environment performance in the field while losing almost nothing once noise is introduced — where every other baseline gives up 11–27% of its performance:

| Metric | ROMBRL (ours) | CQL | EDAC | COMBO | RAMBO | MOBILE | RORL |
|---|---|---|---|---|---|---|---|
| Standard env. | 92.8 | 80.4 | 93.0 | 89.3 | 82.7 | **95.9** | 89.5 |
| Noisy env. | **93.4** | 77.5 | 68.3 | 72.2 | 66.0 | 85.3 | 78.7 |
| Performance drop ↓ | **-0.6%** | 3.6% | 26.6% | 19.1% | 20.2% | 11.1% | 12.1% |

That's the pattern across every benchmark we tried: full D4RL MuJoCo results (12 tasks, ranks first on 7 and second on 4), RWRL-style deployment perturbations (dropped/stuck sensors, mass/friction/damping shifts), the complete Tokamak Control breakdown, and an ablation isolating exactly which piece of the Stackelberg update buys the robustness — all with statistical significance testing (Cohen's *d*) — are laid out in full on the **[project page](https://agentic-intelligence-lab.github.io/ROMBRL/)** and in the paper itself.

## Citation

The official PMLR proceedings for ICML 2026 (volume 306) have not been posted yet, so please cite the arXiv version for now — we'll update this with the final proceedings entry once it's available:

```bibtex
@article{chen2025rombrl,
  title   = {Policy-Driven World Model Adaptation for Robust Offline Model-based Reinforcement Learning},
  author  = {Chen, Jiayu and Xu, Le and Venugopal, Aravind and Schneider, Jeff},
  journal = {arXiv preprint arXiv:2505.13709},
  year    = {2025}
}
```

## Acknowledgements

This work was funded in part by the Department of Energy Fusion Energy Sciences under grant DE-SC0024544.
