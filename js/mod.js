let modInfo = {
  name: "The ABC Tree",
  id: "abctree-unstable",
  author: "Zygorg",
  pointsName: "points",
  modFiles: ["layers/a.js", "layers/b.js", "layers/c.js", "tree.js"],

  discordName: "Zygorg",
  discordLink: "",
  initialStartPoints: new Decimal(10), // Used for hard resets and new players
  offlineLimit: 0, // In hours
};

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`;

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"];

function getStartPoints() {
  return new Decimal(modInfo.initialStartPoints);
}

// Determines if it should show points/sec
function canGenPoints() {
  return true;
}

// Calculate points/sec!
function getPointGen() {
  if (!canGenPoints()) return new Decimal(0);

  let gain = new Decimal(1);

  //Alpha
  gain = gain.mul(getLayerEffect("a"));
  if (hasUpgrade("a", 11)) gain = gain.mul(upgradeEffect("a", 11));
  if (hasUpgrade("a", 12)) gain = gain.mul(upgradeEffect("a", 12));
  if (hasUpgrade("a", 13)) gain = gain.mul(upgradeEffect("a", 13));
  if (hasUpgrade("a", 22)) gain = gain.mul(upgradeEffect("a", 22));
  if (hasUpgrade("a", 31)) gain = gain.mul(upgradeEffect("a", 31));
  //Beta
  gain = gain.mul(getLayerEffect("b"));
  return gain;
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() {
  return {};
}

// Display extra things at the top of the page
var displayThings = [];

// Determines when the game "ends"
function isEndgame() {
  return player.points.gte(new Decimal("ee308"));
}

// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {};

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
  return 3600; // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion) {}

// Set your version in num and name
let VERSION = {
  num: "0.51-unstable",
  name: "Alpha Phase",
};

let changelog = `
<h1>Changelog:</h1><br>
<h3>v0.51-unstable</h3><br>
- Prettified Layer B.<br>
- Balanced Layer B.<br>
- Added tooltips to some upgrades.<br>
- Modified some milestones/upgrades from layer B.<br>
- Added more functions.<br>
- Modified how you unlock upgrades & layers.<br>
- Modified BCh11 effects.<br>
- Removed some now useless upgrades (the ones that unlocked the layers).<br>
- Balanced the cost of B layer upgrades.<br>
- Fixed? issue with A layer autobuyer while in BCh11.<br><br>
<h3>v0.5-unstable</h3><br>
- Prettified Layer A.<br>
- Balanced layer A.<br>
- Added tooltips to some upgrades.<br>
- Changed upgrade names.<br>
- Milestones now stay permanently unlocked when unlocked.<br><br>
<h3>v0.4bf</h3><br>
- Fixed changelog layout.<br>
- Fixed reset for alpha points in B & C layers.<br>
- B: Depowerer 2 limit increased to 99 instead of 10.<br>
- Nerfed heavily A: Empowerer I power.<br>
- Instead of stuff in B CH1 saying disabled, say Disabled by ChallengeName.<br>
- Fixed disabled upgrades saying just currently:<br>
- Lowered A: Uncapped I cost.<br>
- Fixed layer C name from chalie to charlie.<br>
- Capped A: Emporerer I to ^1.5<br><br>
<h3>v0.4</h3><br>
- Added more C layer upgrades.
- Added more softcaps for the layers.
- Moved softcap boxes.
- Added functions to make softcap stuff easier & other functions (new functions are in easyAccess.js)<br><br>
<h3>v0.3b</h3><br>
- Adjusted upgrades names for easier understanding.<br>
- Modified B Challenge 1 description.<br>
- Modified C upgrades cost formulas soo the more you have, the more it costs.<br>
- Fixed some upgrades.<br><br>
<h3>v0.3</h3><br>
- Added more upgrades to Beta layer & balanced Beta challenge 1 debuff.<br>
- Added C (Charlie) layer.<br>
- Balanced some B layer upgrade costs.<br>
- Removed the math formulas from upgrade descriptions.
- Added some C layer upgrades.<br><br>
<h3>v0.2b</h3><br>
- Made a toggle for the 3rd Beta milestone.<br>
- Beta challenge reward doesnt affect Additive I while in challenge.<br><br>
<h3>v0.2</h3><br>
- Added Beta challenge & balanced Beta gain requirements.<br>
- Balanced some Beta upgrades.<br>
- Putted the math formulas into the upgrades descriptions.<br><br>
<h3>v0.1f</h3><br>
- Fixed beta milestone not working.<br>
- Balanced alpha & beta layer.<br>
- Added more milestones to beta layer, added more upgrades to beta layer.<br>
- Added simulateTime(time) function (copied the function name and idea from Incremental Mass Rewritten).<br>
- Added workflows.<br>
- Disabled alpha milestones popups if you have beta unlocked.<br>
- Balanced alpha & beta layer again.<br>
- Modified beta layer milestones & upgrades.
- Prettify upgrades descriptions.<br><br>
<h3>v0.1</h3><br>
- Project start 17/10/2023.<br>
- Added alpha layer.<br>
- Pretified javascripts.<br>
- Added beta layer, added layer reset (thanks escapee), initial push for people to test this.<br><br>
`;
