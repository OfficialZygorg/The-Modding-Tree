addLayer("a", {
  name: "alpha", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      autoBuy: false,
    };
  },
  requires() {
    let value = new Decimal(10);
    let nerf = new Decimal(1);
    let bChallenge1 = new Decimal(challengeCompletions("b", 11)).mul(0.1);
    nerf = nerf.add(bChallenge1);
    if (inChallenge("b", 11)) value = value.pow(nerf);
    return value;
  }, // Can be a function that takes requirement increases into account
  resource: "alpha points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.9, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    let mult = new Decimal(1);
    if (hasUpgrade("b", 11)) mult = mult.mul(upgradeEffect("b", 11));
    if (hasUpgrade("b", 13)) mult = mult.mul(upgradeEffect("b", 13));
    if (hasMilestone("b", 0)) {
      let value = player.b.best;
      if (inChallenge("b", 11)) value = new Decimal(1);
      mult = mult.mul(value);
    }
    if (hasUpgrade("b", 21)) mult = mult.pow(upgradeEffect("b", 21));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  softcap() {
    let value = new Decimal(30000);
    let bChallenge1 = new Decimal(challengeCompletions("b", 11)).add(1);
    if (hasUpgrade("b", 21)) value = value.pow(upgradeEffect("b", 21));
    if (challengeCompletions("b", 11) > 0) value = value.mul(bChallenge1);
    if (inChallenge("b", 11)) return new Decimal(30000).mul(bChallenge1);
    return value;
  },
  softcapPower: new Decimal(0.1),
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "a",
      description: "A: Reset for Alpha points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  prestigeButtonText() {
    let nextGain = new Decimal(tmp[this.layer].nextAt);
    let softcapNumber = new Decimal(tmp[this.layer].softcap);
    let softcapText = new Decimal(tmp[this.layer].resetGain).gte(tmp[this.layer].softcap) || hasUpgrade("b", 21) ? "(Softcapped gain at: " + format(softcapNumber) + ")" : "";
    return "Reset for +" + format(tmp[this.layer].resetGain, 0) + " alpha points.<br>" + softcapText + "<br> Next at: " + format(nextGain) + " points";
  },
  componentStyles: {
    upgrade() {
      return { width: "130px" };
    },
  },
  passiveGeneration() {
    let value = new Decimal(0);
    if (hasUpgrade("b", 12)) value = value.add(upgradeEffect("b", 12));
    if (hasUpgrade("b", 13)) value = value.mul(upgradeEffect("b", 13));
    if (!hasUpgrade("b", 12)) value = false;
    if (inChallenge("b", 11)) return false;
    return value;
  },
  //Code by escapee from The Modding Tree discord https://discord.com/channels/762036407719428096/762071767346839573/1163891655410200689
  doReset(resettingLayer) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[resettingLayer].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
    let keptUpgrades = [];
    if (hasUpgrade(this.layer, 33)) keptUpgrades.push("Buyable", 33);

    // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
    let keep = [];
    if (hasUpgrade("a", 33)) keep.push("milestones");
    if (hasMilestone("b", 2)) keep.push("autoBuy");

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  layerShown() {
    return true;
  },
  color: "yellow",
  branches: ["b", "c"],
  milestonePopups() {
    let popup = true;
    if (hasUpgrade("a", 33)) popup = false;
    return popup;
  },
  autoUpgrade() {
    if (hasMilestone("b", 2)) return player[this.layer].autoBuy;
  },
  milestones: {
    0: {
      requirementDescription: "100 Alpha points.",
      done() {
        return player[this.layer].points.gte(100);
      },
      effectDescription: "Unlock 2nd row of Alpha upgrades.",
      unlocked() {
        return hasUpgrade("a", 13) || hasUpgrade("a", 33);
      },
    },
    1: {
      requirementDescription: "5000 Alpha points.",
      done() {
        return player[this.layer].points.gte(5000);
      },
      effectDescription: "Unlock 3rd row of Alpha upgrades.",
      unlocked() {
        return hasUpgrade("a", 23) || hasUpgrade("a", 33);
      },
    },
  },
  upgrades: {
    11: {
      title: "Point: Doubler",
      description() {
        let text = "Double your point gain.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(5);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      effect() {
        let value = new Decimal(2);
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
    },
    12: {
      title: "Point: Tripler",
      description() {
        let text = "Triples your point gain.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(10);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      unlocked() {
        return hasUpgrade("a", 11) || hasUpgrade("a", 33);
      },
      effect() {
        let value = new Decimal(3);
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
    },
    13: {
      title: "A: Additive I",
      description: "Each total Alpha point multiplies point gain by 0.1",
      cost: new Decimal(20),
      effect() {
        let value = new Decimal(1);
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        if (hasUpgrade("a", 21)) power = power.mul(upgradeEffect("a", 21)).min(0.9);
        if (hasUpgrade("a", 23)) cap = cap.add(upgradeEffect("a", 23));
        if (challengeCompletions("b", 11) > 0) cap = cap.mul(challengeEffect("b", 11));
        value = value.add(player[this.layer].total.mul(0.1));
        value = softcap(value, cap, power);
        return value;
      },
      effectDisplay() {
        let bChal1Effect = challengeCompletions("b", 11) > 0 ? new Decimal(challengeEffect("b", 11)) : new Decimal(1);
        return (
          format(upgradeEffect(this.layer, this.id)) +
          "x" +
          (upgradeEffect(this.layer, this.id).gte(10)
            ? " (Softcapped)<br>" +
              "(Softcap Power: " +
              format(new Decimal(0.1).mul(1000).div(hasUpgrade("a", 21) ? upgradeEffect("a", 21) : 1)) +
              "%)<br>" +
              "(Softcap starts at: x" +
              format(new Decimal(10).add(hasUpgrade("a", 23) ? upgradeEffect("a", 23) : 0).mul(bChal1Effect)) +
              ")"
            : "")
        );
      },
      unlocked() {
        return hasUpgrade("a", 12) || hasUpgrade("a", 33);
      },
    },
    21: {
      title: "A: Depowerer I",
      description() {
        let text = "Your total Alpha points divides the softcap power of Additive I upgrade by some amount.";
        // if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(1000);
        // if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.max(1).div(1000).log(2)).max(1).min(100);
        // if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
      effectDisplay() {
        let capped = upgradeEffect(this.layer, this.id).gte(100) ? "(Capped)" : "";
        let text = `/${format(upgradeEffect(this.layer, this.id))} ${capped}`;
        // if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
    },
    22: {
      title: "Point: Quadrupler",
      description() {
        let text = "Quadruples your point gain";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(5e3);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      unlocked() {
        return hasUpgrade("a", 21) || hasUpgrade("a", 33);
      },
      effect() {
        let value = new Decimal(4);
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
    },
    23: {
      title: "A: Uncapper I",
      description: "Your total Alpha points increments the start of Additive I softcap.",
      cost: new Decimal(1e5),
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.max(1).div(1e5).log(5));
        if (hasUpgrade("a", 32)) value = value.pow(upgradeEffect("a", 32));
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        value = softcap(value, cap, power).max(0);
        return value;
      },
      effectDisplay() {
        return `+${format(upgradeEffect(this.layer, this.id))}`;
      },
      unlocked() {
        return hasUpgrade("a", 22) || hasUpgrade("a", 33);
      },
    },
    31: {
      title: "Point: Quintupler",
      description() {
        let text = "Quintuples your point gain";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(2e5);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      unlocked() {
        return hasMilestone("a", 1) || hasUpgrade("a", 33);
      },
      effect() {
        let value = new Decimal(5);
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
    },
    32: {
      title: "A: Uncapper II",
      description() {
        let text = "Increments exponentially Uncapper I by some ammount based on the total Alpha points.";
        if (inChallenge("b", 11)) text = "Disabled.";
        return text;
      },
      cost() {
        let value = new Decimal(5e5);
        if (inChallenge("b", 11)) value = new Decimal(Infinity);
        return value;
      },
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.max(1).div(5e5).log(50).max(0));
        if (inChallenge("b", 11)) value = new Decimal(1);
        return value;
      },
      effectDisplay() {
        let text = "^" + format(upgradeEffect(this.layer, this.id));
        if (inChallenge("b", 11)) text = "";
        return text;
      },
      unlocked() {
        return hasUpgrade("a", 31) || hasUpgrade("a", 33);
      },
    },
    33: {
      title: "B: Betax",
      description: "Unlocks the Beta layer & keep Alpha Milestones.",
      // cost: new Decimal(1e6),
      unlocked() {
        return hasUpgrade("a", 32) || hasUpgrade("a", 33);
      },
    },
  },
});
