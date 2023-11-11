addLayer("b", {
  startData() {
    return {
      unlocked: false,
      points: D(0),
      best: D(0),
      total: D(0),
      softcap2: D(1e6),
    };
  },
  layerShown() {
    return hasMilestone("a", 2);
  },
  componentStyles: {
    "prestige-button"() {
      let currHeight = 150;
      if (challengeCompletions("b", 11) < 1 && player.b.points.gte(2000)) return { height: "250px" };
      return { height: `${currHeight}px` };
    },
    challenge() {
      return { height: "600px", width: "350px", "border-radius": "25px" };
    },
    upgrade() {
      return { width: "130px", "border-radius": "5px" };
    },
  },
  color: "orange",
  branches: ["c"],
  name: "Beta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  row: 1, // Row the layer is in on the tree (0 is the first row)
  resource: "beta points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
  requires: D(2e5), // Can be a function that takes requirement increases into account
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.8, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = D(1);
    if (hasUpgrade("b", 22)) mult = mult.add(upgradeEffect("b", 22));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    let value = D(1);
    if (player[this.layer].points.gte(2000) && challengeCompletions("b", 11) === 0) return D(0);
    return value;
  },
  softcap() {
    let value = D(1000);
    if (player[this.layer].points.gte(2000) && challengeCompletions("b", 11) === 0) {
      (player[this.layer].points = D(2000)), (player[this.layer].best = D(2000)), (player[this.layer].total = D(2000));
    }
    if (hasUpgrade(this.layer, 32)) value = value.mul(upgradeEffect(this.layer, 32));
    return value;
  },
  softcapPower() {
    let power = D(0.1);
    if (getLayerSoftcapAble(this.layer, 2)) power = power.pow(1.2);
    return power;
  },
  infoboxes: {
    lore: {
      title: "Softcaps",
      unlocked() {
        return getLayerSoftcapAble(this.layer);
      },
      body() {
        let softcapText = getLayerSoftcapAble(this.layer) ? `(Softcapped^1 gain at: ${format(getLayerSoftcap(this.layer))})<br>` : "";
        let softcapText2 = getLayerSoftcapAble(this.layer, 2) ? `(Softcapped^2 gain at: ${format(getLayerSoftcap(this.layer, 2))})<br>` : "";
        let stext = softcapText + softcapText2;
        return `${stext}`;
      },
    },
  },
  effect() {
    let value = player[this.layer].points.add(1).tetrate(0.11);
    return value;
  },
  effectDescription() {
    let text = `they multiply points by x${format(getLayerEffect(this.layer))}`;
    return text;
  },
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for Beta points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  prestigeButtonText() {
    let nextGain = !player.b.points.gte(50000) || challengeCompletions("b", 11) != 0 ? D(tmp[this.layer].nextAt) : D(Infinity);
    let points = D(player[this.layer].points);
    let capText = challengeCompletions("b", 11) < 1 && points.gte(2000) ? "<br><br>If Beta Challenge 1 isnt completed at least 1 time, Beta points, best and total will be capped at 2000." : "";
    return `
    Reset for + ${format(getLayerResetGain(this.layer), 0)} ${tmp[this.layer].name} points.<br>
    Next at: ${format(nextGain)} alpha points.
    ${capText}<br>
    `;
  },
  passiveGeneration() {
    let value = D(0);
    if (!hasBuyable("c", 22)) return false;
    if (hasBuyable("c", 22)) value = value.add(buyableEffect("c", 22).div(100));
    return value;
  },
  //Code by escapee from The Modding Tree discord https://discord.com/channels/762036407719428096/762071767346839573/1163891655410200689
  doReset(resettingLayer) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[resettingLayer].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
    let keptUpgrades = [];
    if (hasUpgrade(this.layer, 41)) keptUpgrades.push(41);
    // if (hasUpgrade(this.layer, 41)) keptUpgrades.push("Buyable", 12, 41);

    // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
    let keep = [];
    keep.push("milestones");

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  milestones: {
    0: {
      requirementDescription: "15 Beta points.",
      done() {
        return player[this.layer].points.gte(15);
      },
      effectDescription() {
        let text = `Multiply Alpha point gain by best Beta points + 1.<br>`;
        if (hasMilestone(this.layer, this.id)) text = text + `Effect: x${format(getLayerBest(this.layer).add(1))}`;
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
    },
    1: {
      requirementDescription: "100 Beta points.",
      done() {
        return player[this.layer].points.gte(100);
      },
      effectDescription: "Unlock 2nd row of Beta upgrades.",
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
    2: {
      requirementDescription: "Beta Challenge Completions 1+",
      done() {
        return challengeCompletions(this.layer, 11) >= 1;
      },
      effectDescription: "Unlock 3rd row of Beta upgrades.",
      unlocked() {
        return hasMilestone(this.layer, 1);
      },
    },
    3: {
      requirementDescription: "1e16 Alpha Points",
      done() {
        return getLayerPoints("a").gte(1e16);
      },
      effectDescription: "Unlock Carbon (C) Layer.",
      unlocked() {
        return hasMilestone(this.layer, 2);
      },
    },
  },
  challenges: {
    11: {
      name() {
        let text = `${getLayerName(this.layer)} Challenge ${this.id}`;
        return text;
      }, //`B: Challenge I<br>A: Knucle Punch`,
      fullDisplay() {
        let chalGoal = D(challengeCompletions("b", 11)).add(1);
        let goalText = D(2000)
          .mul(chalGoal)
          .mul(challengeCompletions(this.layer, this.id) >= 5 ? 10 : 1);
        let chalEffect = challengeEffect("b", 11);
        let debuff = D(1);
        let BChal1Comps = D(challengeCompletions("b", 11)).mul(challengeCompletions(this.layer, this.id) < 5 ? 0.1 : 0.15);
        debuff = debuff.add(BChal1Comps);
        let soft = D(1).add(D(challengeCompletions("b", 11)));
        return `
        -On entering: Most of Alpha/Beta upgrades/milestones are Disabled by ${getChallengeName(this.layer, this.id)}.<br>
        Upgrades that are disabled cannot be bought.<br>
        Alpha softcap cannot go beyond 30000 (Anything before this challenge cant affect it).<br>
        Alpha passive generation is Disabled by ${getChallengeName(this.layer, this.id)}.<br>
        Alpha point requirement is exponentiated by ^0.1 per completion (By ^0.15 at 5 completions).<br>
        1st reward effect while in challenge is 50% less effective.<br><br>
        -Reward: Each completion multiplies ${getUpgradeName("a", 13)} softcap start by completions+1.<br>
        Unlock 3rd row of Beta upgrades at 1st completion.<br>
        Alpha point gain softcap is multiplied by completions+1<br><br>
        -Goal is multiplied by completions+1 (Also by *10 at 5 completions).<br>
        Goal: ${format(goalText)} Alpha Points.<br>
        Completions: ${challengeCompletions("b", 11)}/9<br>
        Effects:<br>
        x${format(chalEffect)} to ${getUpgradeName("a", 13)} Softcap^1 start.<br>
        x${format(soft)} to Alpha point gain Softcap^1.<br>
        Debuff in challenge: ^${format(debuff)} to Alpha point requirement.
        `;
      },
      canComplete: function () {
        let chalGoal = D(challengeCompletions("b", 11)).add(1);
        let value = player.a.points;
        let goal = D(2000)
          .mul(chalGoal)
          .mul(challengeCompletions(this.layer, this.id) >= 5 ? 10 : 1);
        return value.gte(goal);
      },
      // goal() {
      //   let chalGoal = D(challengeCompletions("b", 11)).max(1);
      //   return D(5e5).mul(chalGoal);
      // },
      completionLimit() {
        return D(10);
      },
      layer() {
        return player.a.points;
      },
      rewardEffect() {
        let value = D(1);
        value = value.add(challengeCompletions(this.layer, this.id));
        if (inChallenge("b", 11)) value = value.pow(0.5);
        return value;
      },
      unlocked() {
        return hasUpgrade("b", 23);
      },
    },
  },
  upgrades: {
    11: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Additive II",
      description() {
        let text = "Each total Beta point multiplies Alpha point gain by + x1";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost: D(1),
      softcaps() {
        softcapsObj = {
          softcap1: D(10),
          power1: D(0.1),
          softcap2: D(100),
          power2: D(0.1),
          softcap3: D(1e4),
          power3: D(0.1),
          softcap4: D(1e8),
          power4: D(0.1),
          softcap5: D(1e16),
          power5: D(0.1),
        };
        return softcapsObj;
      },
      effect() {
        let value = D(1);
        value = value.add(player[this.layer].total);
        value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 1), getUpgradeSoftcapPower(this.layer, this.id, 1));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 2))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 2), getUpgradeSoftcapPower(this.layer, this.id, 2));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 3))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 3), getUpgradeSoftcapPower(this.layer, this.id, 3));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 4))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 4), getUpgradeSoftcapPower(this.layer, this.id, 4));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 5))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 5), getUpgradeSoftcapPower(this.layer, this.id, 5));
        if (inChallenge(this.layer, 11)) value = D(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 1))) text = text + ` (Softcapped^1)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 2))) text = text + ` (Softcapped^2)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 3))) text = text + ` (Softcapped^3)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 4))) text = text + ` (Softcapped^4)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 5))) text = text + ` (Softcapped^5)`;
        return text;
      },
      tooltip() {
        let softcap1Pow = D(0.1).mul(1000);
        let softcap2Pow = D(0.1).mul(1000);
        let softcap3Pow = D(0.1).mul(1000);
        let softcap4Pow = D(0.1).mul(1000);
        let softcap5Pow = D(0.1).mul(1000);
        let softcapText = upgradeEffect(this.layer, this.id).gte(10) ? `P=Power, S=Start<br>(Power=1% = No Power)<br>` : "";
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 1)))
          softcapText = softcapText + `Softcap^1 P:${format(softcap1Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 1))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 2)))
          softcapText = softcapText + ` <br>Softcap^2 P:${format(softcap2Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 2))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 3)))
          softcapText = softcapText + ` <br>Softcap^3 P:${format(softcap3Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 3))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 4)))
          softcapText = softcapText + ` <br>Softcap^4 P:${format(softcap4Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 4))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 5)))
          softcapText = softcapText + ` <br>Softcap^5 P:${format(softcap5Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 5))}`;
        let formula = `Formula: TotalBP+1`;
        let text = `${formula}<br>${softcapText}`;
        return text;
      },
    },
    12: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Auto Alpha I",
      description() {
        let text = "Generate passively 100% of Alpha points on reset.";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost: D(5),
      effect() {
        let value = D(1);
        if (inChallenge("b", 11)) value = D(0);
        return value.max(0);
      },
    },
    13: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Auto alpha II",
      description() {
        let text = "Multiply the passive generation of Alpha points by 1% of best beta points.";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost: D(100),
      effect() {
        let value = D(1);
        let layerValue = D(player.b.best);
        value = value.add(layerValue.mul(0.01));
        if (inChallenge("b", 11)) return D(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}`;
        return text;
      },
    },
    14: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Challenger I",
      description() {
        let text = `${getUpgradeName("a", 11)} is exponentiated by ^2 & while in ${getChallengeName(this.layer, 11)} you can buy it with its effect is exponentiated by ^0.5.`;
        return text;
      },
      cost: D(5e5),
      unlocked() {
        return hasMilestone("c", 0);
      },
    },
    21: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Alphacap I",
      description() {
        let text = "Total Beta points multiply Alpha points gain Softcap^1.";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost: D(200),
      effect() {
        let value = D(1);
        let layerValue = D(player.b.total);
        value = value.add(layerValue.log(20));
        if (inChallenge("b", 11)) return D(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}`;
        return text;
      },
      unlocked() {
        return hasMilestone("b", 1);
      },
      tooltip() {
        let text = `Formula: (BetaTP+1)log(20)`;
        return text;
      },
    },
    22: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Sloggin I",
      description: "Points multiply Beta points gain.",
      cost: D(500),
      effect() {
        let value = player.points.slog(500);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id).max(1))}`;
      },
      unlocked() {
        return hasMilestone("b", 1);
      },
      tooltip() {
        let text = `Formula: (Points)slog(500)`;
        return text;
      },
    },
    23: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Challenger I",
      description: "Unlock the 1st Beta challenge.",
      cost: D(1000),
      unlocked() {
        return hasMilestone("b", 1);
      },
    },
    24: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Challenger I",
      description() {
        let text = `${getUpgradeName("a", 12)} is exponentiated by ^2 & while in ${getChallengeName(this.layer, 11)} you can buy it with its effect is exponentiated by ^0.5.`;
        return text;
      },
      cost: D(7.5e5),
      unlocked() {
        return hasMilestone("c", 0);
      },
    },
    31: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Alphacap II",
      description() {
        let text = "Multiply Beta Upgrade 21 by Beta Challenge 1 completions + 1.";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(2e4);
        if (inChallenge("b", 11)) value = D(Infinity);
        return value;
      },
      effect() {
        let value = D(challengeCompletions("b", 11)).max(1).add(1);
        if (inChallenge("b", 11)) value = D(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}`;
        return text;
      },
      unlocked() {
        return hasMilestone("b", 2);
      },
    },
    32: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Betacap I",
      description() {
        let text = `Multiply Beta point gain Softcap^1 by ${getChallengeName(this.layer, 11)} completions + 1.`;
        return text;
      },
      cost: D(5e4),
      effect() {
        let value = D(challengeCompletions("b", 11)).add(1);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect("b", 32))}`;
      },
      unlocked() {
        return hasMilestone("b", 2);
      },
    },
    33: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Vitamin B I",
      description: "Each total Beta point multiplies Beta point gain by 2.",
      cost: D(1e5),
      softcaps() {
        softcapsObj = {
          softcap1: D(10),
          power1: D(0.1),
          softcap2: D(100),
          power2: D(0.1),
          softcap3: D(1e4),
          power3: D(0.1),
          softcap4: D(1e8),
          power4: D(0.1),
          softcap5: D(1e16),
          power5: D(0.1),
        };
        return softcapsObj;
      },
      effect() {
        let value = D(1);
        if (hasBuyable("c", 11)) setUpgradeSoftcapPower(this.layer, this.id, 1, getUpgradeSoftcapPower(this.layer, this.id, 1).mul(buyableEffect("c", 11)));
        if (hasBuyable("c", 12)) setUpgradeSoftcap(this.layer, this.id, 1, getUpgradeSoftcap(this.layer, this.id, 1).add(buyableEffect("c", 12)));
        value = value.add(player[this.layer].total);
        value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 1), getUpgradeSoftcapPower(this.layer, this.id, 1));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 2))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 2), getUpgradeSoftcapPower(this.layer, this.id, 2));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 3))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 3), getUpgradeSoftcapPower(this.layer, this.id, 3));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 4))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 4), getUpgradeSoftcapPower(this.layer, this.id, 4));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 5))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 5), getUpgradeSoftcapPower(this.layer, this.id, 5));
        if (inChallenge(this.layer, 11)) value = D(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 1))) text = text + ` (Softcapped^1)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 2))) text = text + ` (Softcapped^2)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 3))) text = text + ` (Softcapped^3)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 4))) text = text + ` (Softcapped^4)`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 5))) text = text + ` (Softcapped^5)`;
        return text;
      },
      tooltip() {
        let softcap1Pow = D(0.1).mul(1000).div(buyableEffect("c", 11));
        let softcap2Pow = D(0.1).mul(1000);
        let softcap3Pow = D(0.1).mul(1000);
        let softcap4Pow = D(0.1).mul(1000);
        let softcap5Pow = D(0.1).mul(1000);
        let softcapText = upgradeEffect(this.layer, this.id).gte(10) ? `P=Power, S=Start<br>(Power=1% = No Power)<br>` : "";
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 1)))
          softcapText = softcapText + `Softcap^1 P:${format(softcap1Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 1))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 2)))
          softcapText = softcapText + ` <br>Softcap^2 P:${format(softcap2Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 2))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 3)))
          softcapText = softcapText + ` <br>Softcap^3 P:${format(softcap3Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 3))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 4)))
          softcapText = softcapText + ` <br>Softcap^4 P:${format(softcap4Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 4))}`;
        if (upgradeEffect(this.layer, this.id).gte(getUpgradeSoftcap(this.layer, this.id, 5)))
          softcapText = softcapText + ` <br>Softcap^5 P:${format(softcap5Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 5))}`;
        let formula = `Formula: TotalBP*2`;
        let text = `${formula}<br>${softcapText}`;
        return text;
      },
      unlocked() {
        return hasMilestone("b", 2);
      },
    },
    34: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"B: Challenger I",
      description() {
        let text = `${getUpgradeName("a", 22)} is exponentiated by ^2 & while in ${getChallengeName(this.layer, 11)} you can buy it with its effect is exponentiated by ^0.5.`;
        return text;
      },
      cost: D(1e6),
      unlocked() {
        return hasMilestone("c", 0);
      },
    },
  },
});
