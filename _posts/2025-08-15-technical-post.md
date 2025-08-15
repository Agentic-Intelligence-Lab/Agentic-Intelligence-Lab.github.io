---
title: Verlog - A Multi-turn RL framework for LLM agents
image: images/babaisai.gif
author: Wentse Chen
tags: technique
---

<div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 24px; width: 100%;">
  <a href="https://github.com/WentseChen/Verlog" target="_blank" style="text-decoration: none; display: flex; align-items: center;">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg" alt="GitHub" width="30" height="30" style="vertical-align: middle;">
    <span style="vertical-align: middle; font-size: 16px; margin-left: 6px;">Source Code</span>
  </a>

  <a href="https://wandb.ai/cwz19/verlog?nw=nwusercwz19" target="_blank" style="text-decoration: none; display: flex; align-items: center;">
    <img src="https://raw.githubusercontent.com/wandb/assets/main/wandb-dots-logo.svg" alt="W&B" width="30" height="30" style="vertical-align: middle;">
    <span style="vertical-align: middle; font-size: 16px; margin-left: 6px;">Experiment Logs</span>
  </a>
</div>

Verlog is a multi-turn reinforcement learning framework built for **long-horizon LLM-agentic tasks with highly variable episode lengths**. Extending [VeRL](https://github.com/volcengine/verl) and [BALROG](https://github.com/balrog-ai/BALROG) while following the proven design principles of [pytorch-a2c-ppo-acktr-gail](https://github.com/ikostrikov/pytorch-a2c-ppo-acktr-gail), it introduces specialized optimizations for stable and efficient training when episodes span from short interactions to hundreds of turns. Whereas prior frameworks like [VeRL](https://github.com/volcengine/verl) and [RAGEN](https://ragen-ai.github.io) effectively handle tasks with ~10 turns, and [verl-agent](https://github.com/langfengQ/verl-agent) scales up to 50 turns, Verlog is designed to operate in environments with **over 400 turns**, making it uniquely suited for complex, long-term decision-making. This capability has been validated across challenging domains such as BabyAI, BabaIsAI, and Crafter, where it consistently achieves strong performance out of the box. In Crafter, for instance, episode lengths range from 70 to 400 steps with an average of about 190.


Please kinldly check https://wentsechen.github.io/Verlog_blogpost/ for details.
