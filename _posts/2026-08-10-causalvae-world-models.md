---
title: "CausalVAE as a Plug-in for World Models: Towards Reliable Counterfactual Dynamics (ECCV 2026)"
image: images/CausalVAE/method-overview.png
tags: publication world-models causal-learning counterfactuals
---

### Predicting Is Not Yet Understanding

*ECCV 2026 · Causal World Models*

Ziyi Ding, Xianxin Lai, Weiyu Chen, Xiao-Ping Zhang, Jiayu Chen

Tsinghua Shenzhen International Graduate School · The University of Hong Kong · INFIFORCE Intelligent Technology

[Paper](https://arxiv.org/pdf/2604.07712)

![The forward pipeline and CausalVAE module from the paper](/images/CausalVAE/method-overview.png)

*The forward pipeline inserts CausalVAE between the encoder and action-conditioned transition. The module maps the backbone latent through an encoder, a learned directed acyclic graph (DAG), and a decoder.*

A world model should not only say what happens next. It should also know what would happen if something changed.

Latent world models compress images into compact states and roll them forward under actions. That recipe works well for factual prediction: given what actually happened, retrieve or generate the most likely future. But the same latent can be unreliable under an intervention, because features that are useful for prediction are not necessarily separated into causes and effects.

A counterfactual query is more demanding. If we move one object, change its velocity, or alter a mechanism, the model must update the variables downstream of that change while leaving unrelated factors alone. In an entangled latent space, the intervention often becomes a diffuse perturbation: too much changes, too little changes, or the effect travels along the wrong path.

Our question is simple: **can we add explicit causal structure to an existing world model without redesigning the predictive backbone?**

## Attach causal structure where the world model already reasons

We introduce a CausalVAE-inspired structural branch directly in latent space. The original encoder still maps an observation to a latent state, and the original action-conditioned transition still predicts the next latent. Between them, our plug-in organizes latent factors through a learned DAG:

`observation o_t → encoder E → latent z_t → CausalVAE → transition F → future ẑ_{t+1}`

The key is modularity. The same structural branch can sit on AE, VAE, modular, or graph-network dynamics backbones. A differentiable acyclicity penalty keeps the learned adjacency close to a DAG, while a lightweight alignment head anchors latent coordinates to simulator state during training. Neither simulator state nor the alignment head is needed at inference.

## A three-stage training strategy

![Three-stage training strategy from the paper](/images/CausalVAE/training-strategy.png)

*Stage 1 trains the predictive backbone. Stage 2 freezes the encoder and transition while fitting the structural branch. Stage 3 freezes the encoder and CausalVAE while tuning the transition on multi-step objectives.*

**Stage 1 — Predict first.** Train the encoder and transition backbone on standard world-model objectives.

**Stage 2 — Structure second.** Freeze the backbone and learn the causal branch with reconstruction, KL, alignment, and DAG constraints.

**Stage 3 — Refine the transition.** Freeze the encoder and CausalVAE, then tune the transition with an α-gated mixture and multi-step supervision.

This staged design lets the backbone first acquire predictive competence, gives the structural branch a stable representation to organize, and finally adapts the transition to the causally structured latent without retraining the entire system from scratch.

## Intervene, re-simulate, then retrieve the right future

We evaluate four domains—Physics 3-body, Chemistry, 2D Shapes, and 3D Cubes—using state-, object-, and mechanism-level interventions. Each factual transition is paired with a re-simulated counterfactual target.

![Counterfactual task construction and evaluation pipeline from the paper](/images/CausalVAE/counterfactual-task-construction.png)

*Counterfactual examples are created by applying a controlled do-intervention and re-simulating the next state. CF-H@1 and CF-MRR measure whether the model retrieves the correct alternative future.*

The evaluation asks a direct question: among candidate futures, does the model retrieve the one produced by the intervention? Factual H@1 and MRR track ordinary prediction, while CF-H@1 and CF-MRR isolate counterfactual retrieval.

## The largest gains appear where ordinary dynamics are intervention-fragile

Across four benchmarks and eight paired backbones, the plug-in generally keeps factual retrieval competitive and improves CF-H@1 on **21 of 32 backbone–benchmark pairs**. Physics shows the clearest effect: GNN–NLL rises from **11.0 to 41.0 CF-H@1**, a gain of 30.0 points, while AE–NLL rises from **10.5 to 41.0**, a gain of 30.5 points.

| Physics 3-body backbone | Baseline CF-H@1 | + CausalVAE |
|---|---:|---:|
| AE · Contrastive | 10.0 | 24.0 |
| AE · NLL | 10.5 | **41.0** |
| VAE · Contrastive | 8.5 | 8.5 |
| VAE · NLL | 10.5 | 13.0 |
| Modular · Contrastive | 22.5 | 25.0 |
| Modular · NLL | 14.5 | 22.0 |
| GNN · Contrastive | 11.5 | 15.0 |
| GNN · NLL | 11.0 | **41.0** |

In the matched Physics comparison, the plug-in adds approximately 1M parameters.

The learned structure is also interpretable at the mechanism-trend level. On Physics, its strongest edges align with a first-order template derived from the locally linearized dynamics. This is evidence of meaningful physical interaction trends—not a claim that a local DAG exactly recovers the full nonlinear law.

![Ground-truth first-order physical structure and learned causal structure from the paper](/images/CausalVAE/gt-vs-learned.png)

*The learned adjacency recovers the main first-order interaction pattern of the Physics system. The comparison is local and approximate by design.*

## Where the plug-in breaks: the host latent still matters

The gains are not universal. Chemistry exposes a capacity bottleneck: some backbones compress `5^5 = 3,125` global color configurations into a five-dimensional code. Passing that code through another structured encode–decode path can erase class-discriminative directions. In this setting, causal regularization has too little representational room to help.

For AE–Contrastive on Chemistry, increasing the latent dimension changes the CF-H@1 gain monotonically:

| Latent dimension | 5 | 16 | 32 | 128 |
|---|---:|---:|---:|---:|
| CF-H@1 change | −16.7 | −9.2 | −1.5 | +3.5 |

The practical lesson is specific: use the plug-in when the backbone latent can still carry the relevant causal factors, and validate it per domain. Long-horizon drift and strongly nonlinear regimes remain open problems.

## The takeaway

**Structure can be added without starting over.** CausalVAE offers a modular path from predictive world models toward intervention-aware ones: keep the backbone, organize its latent variables, and train the bridge carefully. The result is not uniformly better everywhere—but where ordinary dynamics confuse correlation with mechanism, explicit causal structure can make the alternative future much easier to find.

[Read the ECCV 2026 paper](https://arxiv.org/pdf/2604.07712)
