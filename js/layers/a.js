addLayer("a", {
  startData() {
    return {
      name: "Alpha",
      unlocked: true,
      points: D(0),
      best: D(0),
      total: D(0),
      autoBuy: false,
      softcap2: D(9e8),
      softcap3: D(9.1e17),
    };
  },
  layerShown() {
    return true;
  },
  componentStyles: {
    upgrade() {
      return { width: "130px", "border-radius": "5px" };
    },
  },
  color: "yellow",
  branches: ["b", "c"],
  name: "Alpha", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  row: 0, // Row the layer is in on the tree (0 is the first row)
  resource: "alpha points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  requires() {
    let value = D(10);
    let nerf = D(1);
    let bChallenge1 = D(challengeCompletions("b", 11)).mul(challengeCompletions("b", 11) < 5 ? 0.1 : 0.15);
    nerf = nerf.add(bChallenge1);
    if (inChallenge("b", 11)) value = value.pow(nerf);
    return value;
  }, // Can be a function that takes requirement increases into account
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent() {
    let value = D(0.9);
    return value;
  }, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    let mult = D(1);
    if (hasUpgrade("b", 11)) mult = mult.mul(upgradeEffect("b", 11));
    if (hasUpgrade("b", 13)) mult = mult.mul(upgradeEffect("b", 13));
    if (hasMilestone("b", 0)) {
      let value = player.b.best;
      if (inChallenge("b", 11)) value = D(1);
      mult = mult.mul(value);
    }
    if (hasUpgrade("b", 21)) mult = mult.pow(upgradeEffect("b", 21));
    if (inChallenge("c", 11)) mult = mult.pow(0.1).tetrate(0.01);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return D(1);
  },
  softcap() {
    let value = D(30000);
    let bChallenge1 = D(challengeCompletions("b", 11)).add(1);
    if (hasUpgrade("b", 21)) value = value.mul(upgradeEffect("b", 21));
    if (challengeCompletions("b", 11) > 0) value = value.mul(bChallenge1);
    if (inChallenge("b", 11)) return D(30000).mul(bChallenge1);
    if (hasUpgrade("b", 31)) value = value.mul(upgradeEffect("b", 31));
    if (inChallenge("c", 11)) value = value.pow(0.5);
    return value;
  },
  softcapPower() {
    let power = D(0.1);
    if (getLayerSoftcapAble(this.layer, 2)) power = power.pow(1.1);
    if (getLayerSoftcapAble(this.layer, 3)) power = power.pow(1.1);
    return power;
  },
  infoboxes: {
    lore: {
      title: "Softcaps",
      unlocked() {
        return getLayerSoftcapAble(this.layer) || inChallenge("c", 11);
      },
      body() {
        let softcapText = getLayerSoftcapAble(this.layer) ? `(Softcapped^1 gain at: ${format(getLayerSoftcap(this.layer))})<br>` : "";
        let softcapText2 = getLayerSoftcapAble(this.layer, 2) ? `(Softcapped^2 gain at: ${format(getLayerSoftcap(this.layer, 2))})<br>` : "";
        let softcapText3 = getLayerSoftcapAble(this.layer, 3) ? `(Softcapped^3 gain at: ${format(getLayerSoftcap(this.layer, 3))})<br>` : "";
        let stext = softcapText + softcapText2 + softcapText3;
        return `${stext}`;
      },
    },
  },
  effect() {
    let value = player[this.layer].points.add(1).tetrate(0.1);
    return value;
  },
  effectDescription() {
    let text = `they multiply points by x${format(getLayerEffect(this.layer))}`;
    return text;
  },
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
    let nextGain = D(tmp[this.layer].nextAt);
    return `
    Reset for +${format(tmp[this.layer].resetGain, 0)} ${getLayerName(this.layer)} points.<br>
    Next at: ${format(nextGain)} points.`;
  },
  passiveGeneration() {
    let value = D(0);
    if (hasUpgrade("b", 12)) value = value.add(upgradeEffect("b", 12));
    if (hasUpgrade("b", 13)) value = value.mul(upgradeEffect("b", 13));
    if (!hasUpgrade("b", 12)) value = false;
    if (inChallenge("b", 11) || (inChallenge("c", 11) && !hasUpgrade(this.layer, 33))) return false;
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
    keep.push("milestones");
    if (hasMilestone("a", 3)) keep.push("autoBuy");

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  milestonePopups() {
    let popup = true;
    if (hasUpgrade("a", 33)) popup = false;
    return popup;
  },
  autoUpgrade() {
    if (hasMilestone("a", 2)) return player[this.layer].autoBuy;
  },
  milestones: {
    0: {
      requirementDescription: "100 Alpha points.",
      done() {
        return getLayerPoints(this.layer).gte(100);
      },
      effectDescription: "Unlock 2nd row of Alpha upgrades.",
    },
    1: {
      requirementDescription: "5,000 Alpha points.",
      done() {
        return player[this.layer].points.gte(5000);
      },
      effectDescription: "Unlock 3rd row of Alpha upgrades.",
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
    2: {
      requirementDescription: "200,000 Alpha points.",
      done() {
        return player[this.layer].points.gte(2e5);
      },
      effectDescription: "Unlock Beta (B) Layer.",
      unlocked() {
        return hasMilestone(this.layer, 1);
      },
    },
    3: {
      requirementDescription: "2,000 Beta points.",
      done() {
        return player["b"].points.gte(2000);
      },
      effectDescription: "Auto buy Alpha layer upgrades.",
      unlocked() {
        return hasMilestone(this.layer, 2) && hasLayerUnlocked("b");
      },
      toggles: [["a", "autoBuy"]],
    },
  },
  upgrades: {
    11: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"Point: Doubler",
      description() {
        let text = "Doubles your point gain.";
        if (inChallenge("b", 11) && !hasUpgrade("b", 14)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(5);
        if (inChallenge("b", 11) && !hasUpgrade("b", 14)) value = D(Infinity);
        return value;
      },
      effect() {
        let value = D(2);
        if (hasUpgrade("b", 14)) value = value.pow(2);
        if (inChallenge("b", 11) && !hasUpgrade("b", 14)) value = D(1);
        if (inChallenge("b", 11) && hasUpgrade("b", 14)) value = value.pow(0.5);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id))}`;
      },
    },
    12: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"Point: Tripler",
      description() {
        let text = "Triples your point gain.";
        if (inChallenge("b", 11) && !hasUpgrade("b", 24)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(10);
        if (inChallenge("b", 11) && !hasUpgrade("b", 24)) value = D(Infinity);
        return value;
      },
      effect() {
        let value = D(3);
        if (hasUpgrade("b", 24)) value = value.pow(2);
        if (inChallenge("b", 11) && !hasUpgrade("b", 24)) value = D(1);
        if (inChallenge("b", 11) && hasUpgrade("b", 24)) value = value.pow(0.5);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id))}`;
      },
    },
    13: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Additive I",
      description: "Each total Alpha point multiplies point gain by +x0.1",
      cost: D(20),
      softcaps() {
        softcapsObj = {
          softcap1() {
            let start = D(10);
            if (hasUpgrade("a", 23)) start = start.add(upgradeEffect("a", 23));
            if (challengeCompletions("b", 11) > 0) start = start.mul(challengeEffect("b", 11));
            return start;
          },
          power1() {
            let power = D(0.1);
            if (hasUpgrade("a", 21)) power = power.mul(upgradeEffect("a", 21));
            return power;
          },
          softcap2() {
            let start = D(100);
            return start;
          },
          power2() {
            let power = D(0.1);
            return power;
          },
          softcap3() {
            let start = D(1e4);
            return start;
          },
          power3() {
            let power = D(0.1);
            return power;
          },
          softcap4() {
            let start = D(1e8);
            return start;
          },
          power4() {
            let power = D(0.1);
            return power;
          },
          softcap5() {
            let start = D(1e16);
            return start;
          },
          power5() {
            let power = D(0.1);
            return power;
          },
        };
        return softcapsObj;
      },
      boosts() {
        boostsObj = {
          layer: this.layer,
          id: this.id,
          boost1() {
            if (getUpgradeSoftcap("a", 13, 1).gte(getUpgradeSoftcap(this.layer, this.id, 2).mul(2)))
              boost = D(1.01)
                .pow(0.1)
                .pow(getUpgradeSoftcap(this.layer, this.id, 1).div(getUpgradeSoftcap(this.layer, this.id, 2)))
                .pow(0.1);
            else boost = D(1);
            return boost;
          },
          boost2() {
            if (getUpgradeSoftcap(this.layer, this.id, 2).gte(getUpgradeSoftcap(this.layer, this.id, 3).mul(2)))
              boost = D(1.01)
                .pow(0.1)
                .pow(getUpgradeSoftcap(this.layer, this.id, 2).div(getUpgradeSoftcap(this.layer, this.id, 3)))
                .pow(0.1);
            else boost = D(1);
            return boost;
          },
          boost3() {
            if (getUpgradeSoftcap(this.layer, this.id, 3).gte(getUpgradeSoftcap(this.layer, this.id, 4).mul(2)))
              boost = D(1.01)
                .pow(0.1)
                .pow(getUpgradeSoftcap(this.layer, this.id, 3).div(getUpgradeSoftcap(this.layer, this.id, 4)))
                .pow(0.1);
            else boost = D(1);
            return boost;
          },
          boost4() {
            if (getUpgradeSoftcap(this.layer, this.id, 4).gte(getUpgradeSoftcap(this.layer, this.id, 5).mul(2)))
              boost = D(1.01)
                .pow(0.1)
                .pow(getUpgradeSoftcap(this.layer, this.id, 4).div(getUpgradeSoftcap(this.layer, this.id, 5)))
                .pow(0.1);
            else boost = D(1);
            return boost;
          },
        };
        return boostsObj;
      },
      effect() {
        let value = D(player[this.layer].total).mul(0.1).max(1);
        if (getUpgradeBoosteable(this.layer, this.id, 1)) value = value.mul(getUpgradeBoost(this.layer, this.id, 1));
        if (getUpgradeBoosteable(this.layer, this.id, 2)) value = value.mul(getUpgradeBoost(this.layer, this.id, 2));
        if (getUpgradeBoosteable(this.layer, this.id, 3)) value = value.mul(getUpgradeBoost(this.layer, this.id, 3));
        if (getUpgradeBoosteable(this.layer, this.id, 4)) value = value.mul(getUpgradeBoost(this.layer, this.id, 4));
        if (getBuyableAmount("c", 13).gte(1)) value = value.pow(buyableEffect("c", 13));
        value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 1), getUpgradeSoftcapPower(this.layer, this.id, 1));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 2))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 2), getUpgradeSoftcapPower(this.layer, this.id, 2));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 3))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 3), getUpgradeSoftcapPower(this.layer, this.id, 3));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 4))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 4), getUpgradeSoftcapPower(this.layer, this.id, 4));
        if (value.gte(getUpgradeSoftcap(this.layer, this.id, 5))) value = softcap(value, getUpgradeSoftcap(this.layer, this.id, 5), getUpgradeSoftcapPower(this.layer, this.id, 5));
        return value;
      },
      effectDisplay() {
        let text = `x${format(upgradeEffect(this.layer, this.id))}<br>`;
        if (getUpgradeSoftcapable(this.layer, this.id, 1)) text = text + `(Softcapped^1)<br>`;
        if (getUpgradeSoftcapable(this.layer, this.id, 2)) text = text + `(Softcapped^2)<br>`;
        if (getUpgradeSoftcapable(this.layer, this.id, 3)) text = text + `(Softcapped^3)<br>`;
        if (getUpgradeSoftcapable(this.layer, this.id, 4)) text = text + `(Softcapped^4)<br>`;
        if (getUpgradeSoftcapable(this.layer, this.id, 5)) text = text + `(Softcapped^5)`;
        return text;
      },
      tooltip() {
        let softcap1Pow = D(100).sub(calcRangePercent(getUpgradeSoftcapPower(this.layer, this.id, 1), D(0.1), 1));
        let softcap2Pow = D(100).sub(calcRangePercent(getUpgradeSoftcapPower(this.layer, this.id, 2), D(0.1), 1));
        let softcap3Pow = D(100).sub(calcRangePercent(getUpgradeSoftcapPower(this.layer, this.id, 3), D(0.1), 1));
        let softcap4Pow = D(100).sub(calcRangePercent(getUpgradeSoftcapPower(this.layer, this.id, 4), D(0.1), 1));
        let softcap5Pow = D(100).sub(calcRangePercent(getUpgradeSoftcapPower(this.layer, this.id, 5), D(0.1), 1));
        let softcapText = upgradeEffect(this.layer, this.id).gte(10) ? `P=Power, S=Start, B=Boost<br>` : "";
        if (getUpgradeBoosteable(this.layer, this.id, 1)) softcapText = softcapText + `Boosted^1 B:x${format(getUpgradeBoost(this.layer, this.id, 1))}<br>`;
        if (getUpgradeBoosteable(this.layer, this.id, 2)) softcapText = softcapText + `Boosted^2 B:x${format(getUpgradeBoost(this.layer, this.id, 2))}<br>`;
        if (getUpgradeBoosteable(this.layer, this.id, 3)) softcapText = softcapText + `Boosted^3 B:x${format(getUpgradeBoost(this.layer, this.id, 3))}<br>`;
        if (getUpgradeBoosteable(this.layer, this.id, 4)) softcapText = softcapText + `Boosted^4 B:x${format(getUpgradeBoost(this.layer, this.id, 4))}<br>`;
        if (upgradeEffect(this.layer, this.id).gte(10)) softcapText = softcapText + `Softcap^1 P:${format(softcap1Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 1))}`;
        if (upgradeEffect(this.layer, this.id).gte(100)) softcapText = softcapText + `<br>Softcap^2 P:${format(softcap2Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 2))}`;
        if (upgradeEffect(this.layer, this.id).gte(1e4)) softcapText = softcapText + `<br>Softcap^3 P:${format(softcap3Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 3))}`;
        if (upgradeEffect(this.layer, this.id).gte(1e8)) softcapText = softcapText + `<br>Softcap^4 P:${format(softcap4Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 4))}`;
        if (upgradeEffect(this.layer, this.id).gte(1e16)) softcapText = softcapText + `<br>Softcap^5 P:${format(softcap5Pow)}% S:x${format(getUpgradeSoftcap(this.layer, this.id, 5))}`;
        let formula = `Formula: TotalAP*0.1`;
        let text = `${formula}<br>${softcapText}<br>If previous Softcap start => next Softcap start by x2 amount = Effect gets a boost.`;
        return text;
      },
    },
    21: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Depowerer I",
      description() {
        let text = `Your total Alpha points divides the Softcap^1 power of ${getUpgradeName(this.layer, 13)} by some amount.`;
        return text;
      },
      cost() {
        let value = D(1000);
        return value;
      },
      unlocked() {
        return hasMilestone("a", 0);
      },
      effect() {
        value = player[this.layer].total.max(1).div(this.cost()).log(1.1).tetrate(0.1).max(1).min(2);
        return value;
      },
      effectDisplay() {
        let cap = D(2);
        let capped = upgradeEffect(this.layer, this.id).gte(cap) ? "(Capped)" : "";
        let text = `/${format(upgradeEffect(this.layer, this.id))} ${capped}`;
        return text;
      },
      tooltip() {
        let text = `Formula: (TotalAP/${format(this.cost())})log(1.1)tetrate(0.1)`;
        return text;
      },
    },
    22: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"Point: Quadrupler",
      description() {
        let text = "Quadruples your point gain";
        if (inChallenge("b", 11) && !hasUpgrade("b", 34)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(2e3);
        if (inChallenge("b", 11) && !hasUpgrade("b", 34)) value = D(Infinity);
        return value;
      },
      unlocked() {
        return hasMilestone("a", 0);
      },
      effect() {
        let value = D(4);
        if (hasUpgrade("b", 34)) value = value.pow(2);
        if (inChallenge("b", 11) && !hasUpgrade("b", 34)) value = D(1);
        if (inChallenge("b", 11) && hasUpgrade("b", 34)) value = value.pow(0.5);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id))}`;
      },
    },
    23: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Uncapper I",
      description() {
        let text = `Your total Alpha points increments the start of ${getUpgradeName(this.layer, 13)} Softcap^1 by some amount.`;
        return text;
      },
      cost: D(5e3),
      effect() {
        let value = player[this.layer].total.max(1).div(this.cost).log(2).tetrate(0.1).max(0);
        if (hasUpgrade("a", 32)) value = value.pow(upgradeEffect("a", 32));
        return value;
      },
      effectDisplay() {
        return `+${format(upgradeEffect(this.layer, this.id))}`;
      },
      unlocked() {
        return hasMilestone("a", 0);
      },
      tooltip() {
        let text = `Formula: (TotalAP/${format(this.cost)})log(2)`;
        return text;
      },
    },
    31: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"Point: Quintupler",
      description() {
        let text = "Quintuples your point gain";
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(2e4);
        if (inChallenge("b", 11)) value = D(Infinity);
        return value;
      },
      unlocked() {
        return hasMilestone("a", 1);
      },
      effect() {
        let value = D(5);
        if (inChallenge("b", 11)) value = D(1);
        return value;
      },
      effectDisplay() {
        return `x${format(upgradeEffect(this.layer, this.id))}`;
      },
    },
    32: {
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //"A: Uncapper II",
      description() {
        let text = `Increments exponentially ${getUpgradeName(this.layer, 23)} by some ammount based on the total Alpha points.`;
        if (inChallenge("b", 11)) text = `${getDisabledByChallenge("b", 11)}`;
        return text;
      },
      cost() {
        let value = D(1e5);
        if (inChallenge("b", 11)) value = D(Infinity);
        return value;
      },
      unlocked() {
        return hasMilestone("a", 1);
      },
      effect() {
        let value = player[this.layer].total.max(1).div(this.cost()).tetrate(0.1).max(1);
        if (inChallenge("b", 11)) value = D(1);
        return value;
      },
      effectDisplay() {
        let text = "^" + format(upgradeEffect(this.layer, this.id));
        return text;
      },
      tooltip() {
        let text = `Formula: (TotalAP/${format(this.cost())})tetrate(0.1)`;
        return text;
      },
    },
    33: {
      title() {
        return getUpgradeName(this.layer, this.id);
      },
      description() {
        let text = `(Permanent Upgrade)<br>Passive Alpha Point generation is re-enabled on challenges.`;
        return text;
      },
      cost() {
        let value = D(1e20);
        return value;
      },
      unlocked() {
        return hasMilestone("c", 0);
      },
    },
  },
});
