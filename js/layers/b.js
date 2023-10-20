addLayer("b", {
  name: "beta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      keepUpgrades: [33],
    };
  },
  requires: new Decimal(5e5), // Can be a function that takes requirement increases into account
  resource: "beta points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.8, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("b", 22)) mult = mult.add(upgradeEffect("b", 22));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  softcap() {
    let value = new Decimal(1000);
    if (player[this.layer].points.gte(50000) && challengeCompletions("b", 11) === 0) {
      (player[this.layer].points = new Decimal(50000)), (player[this.layer].best = new Decimal(50000)), (player[this.layer].total = new Decimal(50000)), (value = new Decimal(0));
    }
    return value;
  },
  softcapPower: new Decimal(0.1),
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
  prestigeButtonText() {
    let nextGain = !player.b.points.gte(50000) ? new Decimal(tmp[this.layer].nextAt) : new Decimal(Infinity);
    let softcapNumber = new Decimal(tmp[this.layer].softcap);
    let points = new Decimal(player[this.layer].points);
    let capText =
      challengeCompletions("b", 11) < 1 && points.gte(50000)
        ? "<br><br>If Beta Challenge 1 isnt completed at least 1 time, Beta points, best and total will be capped at 50000.<br>Also, the softcap becomes 0."
        : "";
    let softcapText = new Decimal(tmp[this.layer].resetGain).gte(tmp[this.layer].softcap) || hasUpgrade("b", 21) ? "(Softcapped gain at: " + format(softcapNumber) + ")" : "";
    return "Reset for +" + format(tmp[this.layer].resetGain, 0) + " alpha points.<br>" + softcapText + "<br> Next at: " + format(nextGain) + " points" + capText;
  },
  componentStyles: {
    "prestige-button"() {
      if (challengeCompletions("b", 11) < 1 && player.b.points.gte(50000)) return { height: "200px" };
    },
    challenge() {
      return { height: "500px", width: "350px", "border-radius": "75px" };
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
        return player[this.layer].best.gte(15);
      },
      effectDescription() {
        let text = "Multiply Alpha point gain by best Beta points.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
    },
    1: {
      requirementDescription: "20 Beta points.",
      done() {
        return player[this.layer].best.gte(20);
      },
      effectDescription: "Unlock 2nd row of Beta upgrades.",
      unlocked() {
        return hasUpgrade("b", 13);
      },
    },
    2: {
      requirementDescription: "2000 Beta points.",
      done() {
        return player[this.layer].best.gte(2000);
      },
      effectDescription: "Auto buy Alpha layer upgrades.",
      unlocked() {
        return hasUpgrade("b", 23);
      },
    },
  },
  challenges: {
    11: {
      name: "Knucle Punch",
      fullDisplay() {
        let chalGoal = new Decimal(challengeCompletions("b", 11)).add(1);
        let goalText = new Decimal(2000).mul(chalGoal);
        let chalEffect = new Decimal(10).pow(new Decimal(challengeCompletions("b", 11)).max(1));
        chalEffect = chalEffect.mul(chalEffect);
        let debuff = new Decimal(challengeCompletions("b", 11)).add(1).pow(2);
        return (
          `
        -On entering: Most of Alpha/Beta upgrades/milestones are disabled.<br>Disabled upgrades cannot be bought.<br>Alpha softcap cannot go beyond 30000.<br>Alpha passive generation is disabled.<br>Alpha point requirement is multiplied by (completions+1)^2.<br><br>
        -Reward: Each completion multiplies Additive I softcap start by (10^completions)*itself , unlock 3rd row of Beta upgrades at 1st completion.<br><br>
        -Goal is multiplied by completions+1.<br>
        Goal: ` +
          format(goalText) +
          `<br>
        Completions: ${challengeCompletions("b", 11)}/10<br>
        Effect: x${format(chalEffect)} to Additive I softcap start.<br>
        Debuff in challenge: x${format(debuff)} to Alpha point requirement.
        `
        );
      },
      canComplete: function () {
        let chalGoal = new Decimal(challengeCompletions("b", 11)).add(1);
        let value = player.a.points;
        let goal = new Decimal(2000).mul(chalGoal);
        return value.gte(goal);
      },
      // goal() {
      //   let chalGoal = new Decimal(challengeCompletions("b", 11)).max(1);
      //   return new Decimal(5e5).mul(chalGoal);
      // },
      completionLimit() {
        return new Decimal(10);
      },
      layer() {
        return player.a.points;
      },
      rewardEffect() {
        let value = new Decimal(10);
        let eff = new Decimal(challengeCompletions("b", 11)).max(1);
        value = value.pow(eff);
        value = value.mul(value);
        return value;
      },
      unlocked() {
        return hasUpgrade("b", 23);
      },
    },
  },
  upgrades: {
    11: {
      title: "Additive II",
      description() {
        let text = "Each total Beta point multiplies Alpha point gain by 1";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost: new Decimal(1),
      effect() {
        let value = new Decimal(1);
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        value = value.add(player[this.layer].total);
        value = softcap(value, cap, power);
        if (inChallenge("b", 11)) return new Decimal(1);
        return value;
      },
      effectDisplay() {
        let text =
          format(upgradeEffect(this.layer, this.id)) +
          "x" +
          (upgradeEffect(this.layer, this.id).gte(10)
            ? " (Softcapped)<br>" + "(Softcap Power: " + format(new Decimal(0.1).mul(1000)) + "%)<br>" + "(Softcap starts at: x" + format(new Decimal(10)) + ")"
            : "");
        if (inChallenge("b", 11)) text = "";
        return text;
      },
    },
    12: {
      title: "Auto Alpha I",
      description: "Generate passively 1% of Alpha points on reset.",
      cost: new Decimal(5),
      unlocked() {
        return hasUpgrade("b", 11);
      },
      effect() {
        let value = new Decimal(0.01);
        if (hasUpgrade("b", 13)) {
          let number = new Decimal(10);
          if (inChallenge("b", 11)) number = new Decimal(1);
          value = value.mul(number);
        }
        return value.max(0);
      },
    },
    13: {
      title: "Auto alpha II",
      description() {
        let text = "Multiply the passive generation of Alpha points by 1% of best beta points & Auto Alpha I is now 10%.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost: new Decimal(10),
      effect() {
        let value = new Decimal(1);
        let layerValue = new Decimal(player.b.best);
        value = value.add(layerValue.mul(0.01));
        if (inChallenge("b", 11)) return new Decimal(1);
        return value;
      },
      effectDisplay() {
        let text = "x" + format(upgradeEffect(this.layer, this.id));
        if (inChallenge("b", 11)) text = "";
        return text;
      },
      unlocked() {
        return hasUpgrade("b", 12);
      },
    },
    21: {
      title: "Alphacap I",
      description() {
        let text = "Total Beta points increases Alpha points gain softcap exponentially.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost: new Decimal(20),
      effect() {
        let value = new Decimal(1);
        let layerValue = new Decimal(player.b.total);
        value = value.add(layerValue.log(1e5));
        if (inChallenge("b", 11)) return new Decimal(1);
        return value;
      },
      effectDisplay() {
        let text = `^${format(upgradeEffect(this.layer, this.id))}<br>(1+betaTotal)log(1e5)`;
        if (inChallenge("b", 11)) text = "";
        return text;
      },
      unlocked() {
        return hasMilestone("b", 1);
      },
    },
    22: {
      title: "Sloggin I",
      description: "Points multiply Beta points gain.",
      cost: new Decimal(500),
      effect() {
        let value = player.points.slog(500);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id).max(1))}<br>(points)slog(500)`;
      },
      unlocked() {
        return hasUpgrade("b", 21);
      },
    },
    23: {
      title: "Challenger",
      description: "Unlock the 1st Beta challenge.",
      cost: new Decimal(1000),
      unlocked() {
        return hasUpgrade("b", 22);
      },
    },
    31: {
      title: "Alphacap II",
      description() {
        let text = "Multiply Alphacap I by Beta Challenge 1 completions.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(1e5);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      effect() {
        let value = new Decimal(challengeCompletions("b", 11)).max(1).add(1);
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}<br>BCh1Comp+1`;
        if (inChallenge("b", 11)) text = "";
        return text;
      },
      unlocked() {
        return challengeCompletions("b", 11) >= 1;
      },
    },
  },
});
