addLayer("b", {
  name: "Beta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: D(0),
      best: D(0),
      total: D(0),
      softcap2: D(1e6),
    };
  },
  requires: D(Infinity), // Can be a function that takes requirement increases into account
  resource: "beta points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
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
    return D(1);
  },
  softcap() {
    let value = D(1000);
    if (player[this.layer].points.gte(50000) && challengeCompletions("b", 11) === 0) {
      (player[this.layer].points = D(50000)), (player[this.layer].best = D(50000)), (player[this.layer].total = D(50000)), (value = D(0));
    }
    return value;
  },
  softcapPower() {
    let power = D(0.1);
    if (getLayerSoftcapAble(this.layer, 2)) power = power.pow(1.2);
    return power;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for Beta points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  infoboxes: {
    lore: {
      title: "Softcaps",
      unlocked() {
        return getLayerSoftcapAble(this.layer);
      },
      body() {
        let softcapText = getLayerSoftcapAble(this.layer) || hasUpgrade("b", 21) ? `(Softcapped^1 gain at: ${format(getLayerSoftcap(this.layer))})<br>` : "";
        let softcapText2 = getLayerSoftcapAble(this.layer, 2) ? `(Softcapped^2 gain at: ${format(getLayerSoftcap(this.layer, 2))})<br>` : "";
        let stext = softcapText + softcapText2;
        return `${stext}`;
      },
    },
  },
  prestigeButtonText() {
    let nextGain = !player.b.points.gte(50000) || challengeCompletions("b", 11) != 0 ? D(tmp[this.layer].nextAt) : D(Infinity);
    let points = D(player[this.layer].points);
    let capText =
      challengeCompletions("b", 11) < 1 && points.gte(50000)
        ? "<br><br>If Beta Challenge 1 isnt completed at least 1 time, Beta points, best and total will be capped at 50000.<br>Also, the softcap is a hardcap and becomes 0."
        : "";
    return `
    Reset for + ${format(tmp[this.layer].resetGain, 0)} ${tmp[this.layer].name} points.<br>
    Next at: ${format(nextGain)} alpha points.
    ${capText}<br>
    `;
  },
  //Code by escapee from The Modding Tree discord https://discord.com/channels/762036407719428096/762071767346839573/1163891655410200689
  doReset(resettingLayer) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[resettingLayer].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
    let keptUpgrades = [];
    // if (hasUpgrade(this.layer, 33)) keptUpgrades.push(33);
    // if (hasUpgrade(this.layer, 41)) keptUpgrades.push("Buyable", 12, 41);

    // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
    let keep = [];
    // if (hasUpgrade(this.layer, 41)) keep.push("milestones", 1, 2);

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  componentStyles: {
    "prestige-button"() {
      let currHeight = 150;
      if (challengeCompletions("b", 11) < 1 && player.b.points.gte(50000)) return { height: "250px" };
      return { height: `${currHeight}px` };
    },
    challenge() {
      return { height: "600px", width: "350px", "border-radius": "25px" };
    },
  },
  layerShown() {
    return hasUpgrade("a", 33);
  },
  color: "orange",
  milestones: {
    0: {
      requirementDescription: "15 Beta points.",
      done() {
        return player[this.layer].points.gte(15);
      },
      effectDescription() {
        let text = "Multiply Alpha point gain by best Beta points.";
        if (inChallenge("b", 11)) text = "Disabled by Knucle Punch.";
        return text;
      },
    },
    1: {
      requirementDescription: "20 Beta points.",
      done() {
        return player[this.layer].points.gte(20);
      },
      effectDescription: "Unlock 2nd row of Beta upgrades.",
      unlocked() {
        return hasUpgrade("b", 13);
      },
    },
    2: {
      requirementDescription: "2000 Beta points.",
      done() {
        return player[this.layer].points.gte(2000);
      },
      effectDescription: "Auto buy Alpha layer upgrades.",
      unlocked() {
        return hasUpgrade("b", 23);
      },
      toggles: [["a", "autoBuy"]],
    },
  },
  challenges: {
    11: {
      name: `B: Challenge I<br>A: Knucle Punch`,
      fullDisplay() {
        let chalGoal = D(challengeCompletions("b", 11)).add(1);
        let goalText = D(2000).mul(chalGoal);
        let chalEffect = challengeEffect("b", 11);
        let debuff = D(1);
        let BChal1Comps = D(challengeCompletions("b", 11)).mul(0.1);
        debuff = debuff.add(BChal1Comps);
        let soft = D(1).add(D(challengeCompletions("b", 11)));
        return (
          `
        -On entering: Most of Alpha/Beta upgrades/milestones are Disabled by Knucle Punch.<br>
        Disabled by Knucle Punch upgrades cannot be bought.<br>
        Alpha softcap cannot go beyond 30000 (Anything before this challenge cant affect it).<br>
        Alpha passive generation is Disabled by Knucle Punch.<br>
        Alpha point requirement is exponentiated by 0.1 per completion.<br>
        1st reward effect while in challenge is x1<br><br>
        -Reward: Each completion multiplies Additive I softcap start by (10^completions)*itself.<br>
        -Unlock 3rd row of Beta upgrades at 1st completion.<br>
        -Alpha point gain softcap is multiplied by completions+1<br><br>
        -Goal is multiplied by completions+1.<br>
        Goal: ` +
          format(goalText) +
          `<br>
        Completions: ${challengeCompletions("b", 11)}/10<br>
        Effects:<br>
        x${format(chalEffect)} to Additive I softcap start.<br>
        x${format(soft)} to Alpha point gain softcap.<br>
        Debuff in challenge: ^${format(debuff)} to Alpha point requirement.
        `
        );
      },
      canComplete: function () {
        let chalGoal = D(challengeCompletions("b", 11)).add(1);
        let value = player.a.points;
        let goal = D(2000).mul(chalGoal);
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
        let value = D(10);
        let eff = D(challengeCompletions("b", 11)).max(1);
        value = value.pow(eff);
        value = value.mul(value);
        if (inChallenge("b", 11)) value = D(1);
        return value;
      },
      unlocked() {
        return hasUpgrade("b", 23);
      },
    },
  },
  upgrades: {
    11: {
      title: "A: Additive II",
      description() {
        let text = "Each total Beta point multiplies Alpha point gain by 1";
        if (inChallenge("b", 11)) text = "Disabled by Knucle Punch.";
        return text;
      },
      cost: D(1),
      effect() {
        let value = D(1);
        let cap = D(10);
        let power = D(0.1);
        value = value.add(player[this.layer].total);
        value = softcap(value, cap, power);
        if (inChallenge("b", 11)) return D(1);
        return value;
      },
      effectDisplay() {
        let text = `
        x${format(upgradeEffect(this.layer, this.id))}<br>
        ${upgradeEffect(this.layer, this.id).gte(10) ? `(Softcapped)<br>` + `(Softcap Power: +` + format(D(0.1).mul(1000)) + `%)<br>(Softcap starts at: x` + format(D(10)) + `)` : ""}
        `;
        return text;
      },
    },
    12: {
      title: "A: Auto Alpha I",
      description: "Generate passively 1% of Alpha points on reset.",
      cost: D(5),
      unlocked() {
        return hasUpgrade("b", 11);
      },
      effect() {
        let value = D(0.01);
        if (hasUpgrade("b", 13)) {
          let number = D(10);
          if (inChallenge("b", 11)) number = D(1);
          value = value.mul(number);
        }
        return value.max(0);
      },
    },
    13: {
      title: "A: Auto alpha II",
      description() {
        let text = "Multiply the passive generation of Alpha points by 1% of best beta points & Auto Alpha I is now 10%.";
        if (inChallenge("b", 11)) text = "Disabled by Knucle Punch.";
        return text;
      },
      cost: D(10),
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
      unlocked() {
        return hasUpgrade("b", 12);
      },
    },
    21: {
      title: "A: Alphacap I",
      description() {
        let text = "Total Beta points increases Alpha points gain softcap exponentially.";
        if (inChallenge("b", 11)) text = "Disabled by Knucle Punch.";
        return text;
      },
      cost: D(20),
      effect() {
        let value = D(1);
        let layerValue = D(player.b.total);
        value = value.add(layerValue.log(1e5));
        if (inChallenge("b", 11)) return D(1);
        return value;
      },
      effectDisplay() {
        let text = `^${format(upgradeEffect(this.layer, this.id))}`;
        return text;
      },
      unlocked() {
        return hasMilestone("b", 1);
      },
    },
    22: {
      title: "B: Sloggin I",
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
        return hasUpgrade("b", 21);
      },
    },
    23: {
      title: "B: Challenger I",
      description: "Unlock the 1st Beta challenge.",
      cost: D(1000),
      unlocked() {
        return hasUpgrade("b", 22);
      },
    },
    31: {
      title: "A: Alphacap II",
      description() {
        let text = "Multiply Alphacap I by Beta Challenge 1 completions + 1.";
        if (inChallenge("b", 11)) text = "Disabled by Knucle Punch.";
        return text;
      },
      cost() {
        let value = D(1e5);
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
        return challengeCompletions("b", 11) >= 1;
      },
    },
    32: {
      title: "B: Betacap I",
      description: "Beta challenge 1 completions + 1 multiply Beta point gain softcap.",
      cost: D(1.5e5),
      effect() {
        let value = D(challengeCompletions("b", 11)).add(1);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect("b", 32))}`;
      },
      unlocked() {
        return hasUpgrade("b", 31);
      },
    },
    33: {
      title: "B: Vitamin B I",
      description: "Each total Beta point multiplies Beta point gain by 2.",
      cost: D(2e5),
      effect() {
        let value = D(1);
        let cap = D(10);
        let power = D(0.1);
        value = value.add(player[this.layer].total).mul(2);
        if (getBuyableAmount("c", 11).gt(0)) power = power.div(buyableEffect("c", 11));
        if (getBuyableAmount("c", 12).gt(0)) cap = cap.mul(buyableEffect("c", 12));
        value = softcap(value, cap, power);
        return value;
      },
      effectDisplay() {
        let softcapPower = D(100);
        let softcapCap = D(10);
        if (getBuyableAmount("c", 11).gt(0)) softcapPower = softcapPower.div(buyableEffect("c", 11));
        if (getBuyableAmount("c", 12).gt(0)) softcapCap = softcapCap.mul(buyableEffect("c", 12));
        let text = `
        x${format(upgradeEffect(this.layer, this.id))}<br>
        ${upgradeEffect(this.layer, this.id).gte(10) ? `(Softcapped)<br>` + `(Softcap Power: +` + format(softcapPower) + `%)<br>(Softcap starts at: x` + format(softcapCap) + `)` : ""}
        `;
        return text;
      },
      unlocked() {
        return hasUpgrade("b", 32);
      },
    },
    41: {
      title: "C: Charliex",
      description: "Unlock Charlie layer.",
      unlocked() {
        return hasUpgrade("b", 33);
      },
    },
  },
});
