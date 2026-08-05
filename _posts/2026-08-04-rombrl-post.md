---
title: ROMBRL — Policy-Driven World Model Adaptation for Robust Offline Model-based RL (ICML 2026)
image: images/rombrl-poster.png
author: Le Xu
tags: publication offline-rl robustness model-based-rl
redirect_from:
  - /2026/08/04/rombrl-icml2026.html
---

Our paper, **"Policy-Driven World Model Adaptation for Robust Offline Model-based Reinforcement Learning"**, was presented as a **poster at ICML 2026** in Seoul, South Korea. This is joint work between the Agentic Intelligence Lab, Tsinghua University, and the Robotics Institute at Carnegie Mellon University.

- **Paper (arXiv):** [arxiv.org/abs/2505.13709](https://arxiv.org/abs/2505.13709)
- **OpenReview:** [openreview.net/forum?id=eB5i7caric](https://openreview.net/forum?id=eB5i7caric)
- **Project page:** [agentic-intelligence-lab.github.io/ROMBRL](https://agentic-intelligence-lab.github.io/ROMBRL/)
- **Code:** [github.com/Agentic-Intelligence-Lab/ROMBRL](https://github.com/Agentic-Intelligence-Lab/ROMBRL)

<a href="/files/rombrl-poster.pdf" target="_blank">
  <img src="/images/rombrl-poster.png" alt="ROMBRL ICML 2026 poster" style="width:100%; max-width:100%; height:auto; border:1px solid #ddd;">
</a>
<p style="text-align:center; font-size:0.9em; margin-top:-0.5em;"><em>Our ICML 2026 poster — click for the full-resolution PDF.</em></p>

## TL;DR

Offline model-based RL (MBRL) usually learns a world model and a policy in two separate stages — first fit the model to maximize data likelihood, then optimize the policy against the fixed model. This mismatch leaves policies brittle: even small amounts of deployment-time noise can wreck performance. We propose **ROMBRL**, which jointly adapts the world model *with* the policy under a single **constrained maximin objective**, solved via **Stackelberg learning dynamics** with the policy as the leader and the world model as an adversarial follower. ROMBRL comes with a formal suboptimality bound and achieves state-of-the-art robustness on D4RL MuJoCo and stochastic Tokamak Control benchmarks — with almost no cost to clean-environment performance.

## Why Do Offline RL Policies Fall Apart Under a Little Noise?

Offline MBRL is appealing because it lets us train a policy from a static dataset by rolling it out inside a *learned* simulator, rather than the real environment — no risky exploration, no expensive interaction. But nearly all existing methods follow the same two-stage recipe: first fit a world model $P_\phi$ to maximize the likelihood of observed transitions, then freeze it (or only mildly adapt it) and optimize the policy $\pi_\theta$ against it.

That split has a quiet cost. The model is trained to *explain the data*, not to *support good policy learning* — an objective mismatch that's easy to miss when you only evaluate in a clean, deterministic simulator. So we asked a more adversarial question: what happens to these policies once the environment doesn't behave exactly like the simulator? We took a stable of strong offline RL baselines — CQL, EDAC, COMBO, MOBILE, and even RAMBO, which is specifically designed with an adversarial world model — and added just 5% Gaussian noise to state transitions at deployment time.

<img src="/images/rombrl-fig1-motivation.png" alt="Average performance of offline RL algorithms before and after deployment noise" style="width:100%; max-width:600px; display:block; margin:1.5em auto;">
<p style="text-align:center; font-size:0.9em; margin-top:-1em;"><em>Average scores on nine D4RL MuJoCo tasks, before and after injecting 5% measurement noise at deployment. Every method — including the model-based robust baseline RAMBO — loses a substantial fraction of its performance.</em></p>

Robustness, it turns out, is not something these methods get for free from good average returns.

## The Trick: Turn Model Adaptation Into an Adversary's Move

If the world model is going to be wrong somewhere, we'd rather it be wrong in a way our policy has already prepared for. That's the intuition behind **ROMBRL**: instead of treating the world model as a fixed, passive stand-in for the environment, we make it move *against* the policy during training, so that whatever the policy learns has already survived a worst-case opponent.

Formally, we cast offline MBRL as a constrained maximin problem:

$$\max_\theta J(\theta, \phi') \quad \text{s.t.} \quad \phi' \in \arg\min_{\phi \in \Phi} J(\theta, \phi)$$

where $\Phi$ is an uncertainty set of world models $\phi \in \mathcal{M}$ anchored to the maximum-likelihood estimate $\hat\phi$ — a KL trust region around what the offline data actually supports:

$$\mathbb{E}_{(s,a)\sim\mathcal{D}}\left[ \mathrm{KL}\left(P_{\hat\phi}(\cdot|s,a) \,\|\, P_\phi(\cdot|s,a)\right) \right] \le \epsilon$$

(conservatism still matters offline, we're not letting the model run wild). The policy maximizes its return against the *worst* model in that set; the model adversarially minimizes it.

We solve this as a **Stackelberg game**: the policy is the *leader*, the world model is the *follower* that best-responds to the policy — the mirror image of online MBRL, where the model is usually adapted to help the leader rather than oppose it. Using implicit differentiation through the follower's best response, we derive primal-dual Stackelberg update rules for $(\theta, \phi, \lambda)$, and make them practical at scale with a few tricks:

- The **Fisher Information Matrix** stands in for expensive second-order terms, using $\mathbb{E}[\nabla^2 \log P_\phi] = -\mathbb{E}[\nabla \log P_\phi \nabla \log P_\phi^\top]$ to avoid an explicit Hessian.
- The **Woodbury matrix identity** inverts the resulting low-rank matrix in time linear (not cubic) in the parameter count.
- A **gradient-mask mechanism** keeps off-policy replay data from going stale as the model shifts under the policy — a subtlety that RAMBO's simpler alternating-update scheme overlooks.

The full algorithm, **ROMBRL**, is summarized in Appendix J of the paper.

### It's not just an engineering trick

Theorem 3.1 gives a formal bound on the resulting policy's suboptimality gap, assuming the true environment lies in the uncertainty set $\Phi$ with probability at least $1 - \delta/2$:

$$J(\theta^{\ast}, \phi^{\ast}) - J(\hat\theta, \phi^{\ast}) \;\le\; \frac{\sqrt{C}}{(1-\gamma)^2} \sqrt{4\epsilon + c\left(\sqrt{\frac{\log(2|\Phi|/\delta)}{N}} + \frac{\log(2|\Phi|/\delta)}{N}\right)}$$

where $N$ is the offline dataset size, $|\Phi|$ the covering number of the uncertainty set, $C$ a concentrability coefficient, and $\epsilon$ the uncertainty-set radius — so the gap shrinks as the dataset grows, giving a formal robustness guarantee rather than a purely heuristic one. Theorems 3.2 and 3.3 instantiate this bound for tabular MDPs and for continuous MDPs with Gaussian world models respectively, characterizing how $\epsilon$ should scale with dataset size and dimensionality.

## From MuJoCo to a Real Fusion Reactor

Gaussian noise on MuJoCo is a convenient stress test, but it's still synthetic. To find out whether any of this matters outside a benchmark, we went looking for a control problem where the "noise" isn't something we inject — it's baked into the physics.

<img src="/images/rombrl-tokamak.png" alt="ROMBRL applied to Tokamak plasma control" style="width:100%; max-width:650px; display:block; margin:1.5em auto;">
<p style="text-align:center; font-size:0.9em; margin-top:-1em;"><em>An RL controller trained on a surrogate dynamics model drives plasma profiles toward a target using actuators such as power, torque, and ECH.</em></p>

Tokamak plasma control was a natural fit: confining and shaping a superheated plasma is a genuinely stochastic process. We evaluated on tracking tasks (ion rotation, electron density, and $\beta_N$, a key economic indicator for fusion efficiency) built on an ensemble of recurrent dynamics models calibrated to real operational data from DIII-D, a working tokamak in San Diego.

This benchmark is considerably less forgiving than D4RL MuJoCo — several strong model-based baselines (RAMBO, MOBILE, and a Bayes-adaptive MCTS baseline, BAMCTS) that look competitive on MuJoCo degrade sharply once the dynamics get genuinely messy:

| Tracking Target | ROMBRL (ours) | CQL | EDAC | COMBO | RAMBO | MOBILE | BAMCTS |
|---|---|---|---|---|---|---|---|
| $\beta_N$ | **-70.9*** (0.9) | -78.4 (3.1) | -63.4 (1.7) | -84.3 (7.6) | -121.1 (19.9) | -133.9 (10.1) | -111.3 (24.3) |
| Density | **-60.0** (1.9) | -87.3 (12.5) | -112.5 (11.1) | -67.0* (3.1) | -81.3 (15.7) | -75.3 (4.3) | -79.6 (13.8) |
| Rotation | **-10.6** (3.7) | -39.2* (10.1) | -95.4 (64.3) | -69.6 (25.9) | -300.3 (260.5) | -257.6 (153.7) | -305.6 (242.6) |
| Average Return | **-47.1** (1.2) | -68.3* (6.8) | -90.4 (11.5) | -73.6 (5.8) | -167.6 (91.6) | -155.5 (47.7) | -165.5 (84.5) |
| Cohen's *d* vs. ROMBRL | – | 4.3 | 5.3 | 6.3 | 1.9 | 3.2 | 2.0 |

*(negative tracking error, higher/less-negative is better; \* marks the second-best result for each row)*

ROMBRL ranked first on 2 of the 3 tracking targets, second on the third, and had by far the lowest variance across seeds of any method we tested. That gap is the clearest evidence we have that adversarial world-model adaptation isn't just a MuJoCo party trick — it transfers to the kind of high-stakes, physically-grounded control problem where robustness actually matters.

## Full Results

**D4RL MuJoCo, under 5% measurement noise at deployment.** ROMBRL ranks first on 7/12 tasks and second on 4, with the best average score by a wide margin (Cohen's *d* ≥ 2 over every baseline indicates a large, statistically significant effect):

| Method | ROMBRL (ours) | CQL | EDAC | COMBO | RAMBO | MOBILE | RORL | TRACER | RFQI |
|---|---|---|---|---|---|---|---|---|---|
| Average Score | **77.7** (0.5) | 60.7 (1.2) | 53.7 (4.6) | 55.5 (3.6) | 55.8 (1.3) | 70.7 (2.4) | 62.3 (0.2) | 44.1 (4.8) | 30.9 (2.1) |
| Cohen's *d* vs. ROMBRL | – | 18.9 | 7.4 | 8.5 | 22.9 | 4.1 | 40.4 | 9.8 | 30.7 |

**Robustness vs. clean-environment trade-off** (OfflineRL-Kit protocol). ROMBRL matches the best clean-environment performance in the field while losing almost nothing once noise is introduced — where every other baseline gives up 11–27% of its performance:

| Metric | ROMBRL (ours) | CQL | EDAC | COMBO | RAMBO | MOBILE | RORL |
|---|---|---|---|---|---|---|---|
| Standard env. | 92.8 | 80.4 | 93.0 | 89.3 | 82.7 | **95.9** | 89.5 |
| Noisy env. | **93.4** | 77.5 | 68.3 | 72.2 | 66.0 | 85.3 | 78.7 |
| Performance drop ↓ | **-0.6%** | 3.6% | 26.6% | 19.1% | 20.2% | 11.1% | 12.1% |

**RWRL-style deployment perturbations** (dropped/stuck observations, body mass, friction, joint damping — applied only at evaluation, trained on clean `hc-med-rep` data). ROMBRL achieves the best score on every one of the 5 perturbation types and the smallest overall performance drop, beating dedicated robust baselines RORL and RFQI by a wide margin:

| Metric | ROMBRL (ours) | CQL | MOBILE | RAMBO | RORL | TRACER | RFQI |
|---|---|---|---|---|---|---|---|
| Average score under perturbation | **51.9** (1.0) | 31.2 (1.0) | 45.7 (1.9) | 46.2 (0.2) | 39.3 (1.8) | 23.4 (1.6) | 16.3 (1.6) |
| Performance drop ↓ | **25.4%** | 33.2% | 31.6% | 30.0% | 37.6% | 36.2% | 52.1% |

**Ablation.** Our full constrained Stackelberg update substantially outperforms both a naive alternating update (à la RAMBO) and an unconstrained Stackelberg update on `walker2d-medium`:

<img src="/images/rombrl-fig3-ablation.png" alt="Ablation of Stackelberg gradient update mechanisms" style="width:100%; max-width:480px; display:block; margin:1.5em auto;">
<p style="text-align:center; font-size:0.9em; margin-top:-1em;"><em>Robustness comes specifically from anticipating how the uncertainty-set boundary (via the dual variable λ) shifts with the policy — not just from anticipating the model itself.</em></p>

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
