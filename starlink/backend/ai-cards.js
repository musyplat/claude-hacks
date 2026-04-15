// Campus-specific meeting spots with personality
const MEET_SPOTS = [
  'Memorial Union Terrace — grab a coffee, watch the lake, low pressure.',
  'College Library quiet floor — side-by-side work, minimal small talk required.',
  'Grainger Hall atrium — good for a 30-min structured session.',
  'Union South — food, tables, easy to extend if it goes well.',
  'Engineering Hall lobby — neutral ground, lots of space.',
  'Terrace at sunset — if you want it to feel less like a transaction.',
];

// Skill-complement bridge templates — used when both users can teach each other
const SKILL_BRIDGE_TEMPLATES = [
  (aGives, bGives) =>
    `You can help them with ${aGives} — they can return the favor with ${bGives}. Clean trade.`,
  (aGives, bGives) =>
    `${aGives} for ${bGives}. You both walk away better than you came.`,
  (aGives, bGives) =>
    `They need exactly what you know (${aGives}), and you need exactly what they know (${bGives}).`,
  (aGives, bGives) =>
    `A real skill swap: you bring ${aGives}, they bring ${bGives}. This is the kind of exchange that actually moves the needle.`,
  (aGives, bGives) =>
    `You're not just compatible — you're useful to each other. ${aGives} meets ${bGives}. Make it happen.`,
];

// Richer interest bridge templates — used when users share likes/dislikes
const BRIDGE_TEMPLATES = [
  (shared) =>
    `You're both into ${shared[0]}${shared.length > 1 ? ` and ${shared[1]}` : ''} — that's a rare overlap worth exploring.`,
  (shared) =>
    `${shared[0]} is your common ground. Not a coincidence — a signal.`,
  (shared) =>
    `Both of you came up when we searched for "${shared[0]}${shared.length > 1 ? `, ${shared[1]}` : ''}". That's not random.`,
  (shared) =>
    `You share a genuine interest in ${shared[0]}. That's the kind of thing that makes conversations go longer than planned.`,
  (shared) =>
    `You're both building on ${shared[0]}. That shared context makes it easier to skip the small talk.`,
];

const SHARED_DISLIKE_TEMPLATES = [
  (shared) =>
    `You've both opted out of ${shared[0]}. A shared "no" is underrated — it means you're thinking the same way about what matters.`,
  (shared) =>
    `Neither of you can stand ${shared[0]}. That kind of alignment runs deeper than it looks.`,
  (shared) =>
    `"${shared[0]}" — you both said no. That's a filter, and you both passed each other's.`,
  (shared) =>
    `A mutual dislike of ${shared[0]} isn't a small thing. It tells you something about what you're each optimizing for.`,
  (shared) =>
    `Bonding over a shared "nope" on ${shared[0]}? Underrated start. That solidarity holds.`,
];

// One-directional help templates
const ONE_WAY_HELP_TEMPLATES = [
  (helper, learner, skill) =>
    `${helper} can share ${skill} — and ${learner} is exactly the kind of person who'd put it to use.`,
  (helper, learner, skill) =>
    `${learner} needs ${skill}. ${helper} has it. That's a straightforward reason to meet.`,
  (helper, learner, skill) =>
    `One of you has something the other needs: ${skill}. That's enough of a reason to sit down together.`,
];

// Learn-together templates (shared needs)
const LEARN_TOGETHER_TEMPLATES = [
  (topic) =>
    `You're both trying to figure out ${topic}. Struggling through the same thing together is underrated.`,
  (topic) =>
    `Neither of you has cracked ${topic} yet. Study partners who are equally lost make the best progress.`,
  (topic) =>
    `You both listed ${topic} as something you need. That's a study group of two waiting to happen.`,
];

// Exchange templates for mutual skill match
const EXCHANGE_TEMPLATES = [
  (a, b, aGives, bGives) =>
    `${a} can share ${aGives[0]} while ${b} brings ${bGives[0]} to the table. A true skills swap.`,
  (a, b, aGives, bGives) =>
    `${a} offers ${aGives[0]} and ${b} offers ${bGives[0]} — this exchange could actually change both your semesters.`,
  (a, b, aGives, bGives) =>
    `You've got what each other needs: ${a} brings ${aGives[0]}, ${b} brings ${bGives[0]}. Set a time. Make it happen.`,
  (a, b, aGives, bGives) =>
    `${aGives[0]} meets ${bGives[0]}. ${a} and ${b} — the campus skill trade of the week.`,
  (a, b, aGives, bGives) =>
    `Real exchange energy: ${a} teaches ${aGives[0]}, ${b} teaches ${bGives[0]}. Win-win.`,
];

// Spark templates — skill_complement type (25+ total across all types)
const SPARK_SKILL_COMPLEMENT_TEMPLATES = [
  () =>
    `This is rare: you each have what the other needs. Most matches are accidental — this one is structural.`,
  () =>
    `You're not just compatible, you're complementary. That's a stronger foundation than just liking the same things.`,
  (aGives, bGives) =>
    `You teach ${aGives}. They teach ${bGives}. Neither of you has to give more than you get.`,
  (aGives, bGives) =>
    `${aGives} ↔ ${bGives}. That's a fair trade, and fair trades have legs.`,
  () =>
    `The algorithm found something structural here: you each fill in what the other is missing. That's not luck.`,
  (aGives, bGives) =>
    `You need ${bGives}. They need ${aGives}. This match has a reason to keep going.`,
  () =>
    `Most connections are vibes. This one has a mechanism — you're useful to each other in specific ways.`,
];

// Spark templates — interest_divergence type
const SPARK_DIVERGENCE_TEMPLATES = [
  (block, nameA, nameB, aStance, bStance) =>
    `You love ${block} — they can't stand it. Someone changed their mind about this at some point. Ask who.`,
  (block, nameA, nameB, aStance, bStance) =>
    `One of you is wrong about ${block}. Find out who over coffee.`,
  (block, nameA, nameB, aStance, bStance) =>
    `Hot take incoming: ${nameA} loves ${block} and ${nameB} would rather not. There's a story there.`,
  (block, nameA, nameB, aStance, bStance) =>
    `${nameA} and ${nameB} don't agree on ${block}. That's not a problem — that's a conversation waiting to happen.`,
  (block, nameA, nameB, aStance, bStance) =>
    `${block} — ${nameA} is a fan, ${nameB}… not so much. That difference might be the best conversation you've had all week.`,
  (block, nameA, nameB, aStance, bStance) =>
    `Imagine the discussion: ${nameA} who ${aStance} ${block} vs ${nameB} who ${bStance} it. Get a table. Order drinks. Go.`,
  (block, nameA, nameB, aStance, bStance) =>
    `${block} is where your paths diverge — and that divergence is what makes this worth exploring.`,
  (block, nameA, nameB, aStance, bStance) =>
    `${nameA} says "${block} is great." ${nameB} says "hard pass." That's your opener — use it.`,
  (block, nameA, nameB, aStance, bStance) =>
    `A classic "agree to disagree" moment waiting to happen: ${block}. Start there.`,
  (block, nameA, nameB, aStance, bStance) =>
    `Two people. One topic (${block}). Two very different opinions. Time to talk.`,
  (block, nameA, nameB, aStance, bStance) =>
    `${nameA} ${aStance} ${block}. ${nameB} ${bStance} it. Debate incoming — who's right?`,
  (block, nameA, nameB, aStance, bStance) =>
    `The ${block} disagreement is honestly the best possible icebreaker here.`,
];

// Spark templates — context_bridge type
const SPARK_CONTEXT_BRIDGE_TEMPLATES = [
  () =>
    `One of you prefers showing up in person, the other works better remotely. That's not a mismatch — it's range. You can bridge both worlds.`,
  () =>
    `You operate in different contexts, which means you each have things the other hasn't been exposed to. That's a feature, not a bug.`,
  () =>
    `Different modes, same campus. One of you can bring the other into a world they haven't fully explored yet.`,
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateConnectionCard(userA, userB, connection) {
  const sharedLikes = Array.isArray(connection.shared_likes) ? connection.shared_likes : [];
  const sharedDislikes = Array.isArray(connection.shared_dislikes) ? connection.shared_dislikes : [];
  const skillDetails = connection.skill_match_details || {};
  const spark = connection.spark_v2 || null;

  const aGivesB = Array.isArray(skillDetails.a_gives_b) ? skillDetails.a_gives_b : [];
  const bGivesA = Array.isArray(skillDetails.b_gives_a) ? skillDetails.b_gives_a : [];
  const sharedNeeds = Array.isArray(skillDetails.shared_needs) ? skillDetails.shared_needs : [];

  // ── Bridge text ──────────────────────────────────────────────────────────
  let bridge_text = '';

  if (connection.skill_match && aGivesB.length > 0 && bGivesA.length > 0) {
    // Mutual skill complement is the richest signal — lead with it
    bridge_text = pickRandom(SKILL_BRIDGE_TEMPLATES)(aGivesB[0], bGivesA[0]);
    if (sharedLikes.length > 0) {
      bridge_text += ` On top of that, you're both into ${sharedLikes[0]} — so the conversation won't start cold.`;
    }
  } else if (sharedLikes.length > 0 && sharedDislikes.length > 0) {
    const likesPart = pickRandom(BRIDGE_TEMPLATES)(sharedLikes);
    const dislikesPart = pickRandom(SHARED_DISLIKE_TEMPLATES)(sharedDislikes);
    bridge_text = `${likesPart} ${dislikesPart}`;
  } else if (sharedLikes.length > 0) {
    bridge_text = pickRandom(BRIDGE_TEMPLATES)(sharedLikes);
  } else if (sharedDislikes.length > 0) {
    bridge_text = pickRandom(SHARED_DISLIKE_TEMPLATES)(sharedDislikes);
  } else if (sharedNeeds.length > 0) {
    bridge_text = pickRandom(LEARN_TOGETHER_TEMPLATES)(sharedNeeds[0]);
  } else {
    bridge_text = `${userA.name} and ${userB.name} share a wavelength that's hard to put into words. Sometimes a vibe is enough.`;
  }

  // ── Exchange text ────────────────────────────────────────────────────────
  let exchange_text = '';

  if (connection.skill_match && aGivesB.length > 0 && bGivesA.length > 0) {
    exchange_text = pickRandom(EXCHANGE_TEMPLATES)(
      userA.name,
      userB.name,
      aGivesB,
      bGivesA
    );
  } else if (aGivesB.length > 0) {
    exchange_text = pickRandom(ONE_WAY_HELP_TEMPLATES)(userA.name, userB.name, aGivesB[0]);
  } else if (bGivesA.length > 0) {
    exchange_text = pickRandom(ONE_WAY_HELP_TEMPLATES)(userB.name, userA.name, bGivesA[0]);
  } else if (sharedNeeds.length > 0) {
    exchange_text = pickRandom(LEARN_TOGETHER_TEMPLATES)(sharedNeeds[0]);
  } else {
    exchange_text = `No skill swap detected yet — but there's always something to teach and something to learn.`;
  }

  // ── Spark text ───────────────────────────────────────────────────────────
  let spark_text = '';

  if (spark) {
    if (spark.type === 'skill_complement') {
      spark_text = pickRandom(SPARK_SKILL_COMPLEMENT_TEMPLATES)(spark.aGives, spark.bGives);
    } else if (spark.type === 'interest_divergence') {
      spark_text = pickRandom(SPARK_DIVERGENCE_TEMPLATES)(
        spark.block,
        userA.name,
        userB.name,
        spark.aStance,
        spark.bStance
      );
    } else if (spark.type === 'context_bridge') {
      spark_text = pickRandom(SPARK_CONTEXT_BRIDGE_TEMPLATES)();
    }
  }

  // Fallback: legacy spark shape from connection.spark
  if (!spark_text) {
    const legacySpark = connection.spark || {};
    if (legacySpark.block) {
      spark_text = pickRandom(SPARK_DIVERGENCE_TEMPLATES)(
        legacySpark.block,
        userA.name,
        userB.name,
        legacySpark.userA_stance || 'likes',
        legacySpark.userB_stance || 'dislikes'
      );
    } else {
      spark_text = `You two share more than you might think. The conversation will find its own spark.`;
    }
  }

  // ── Meet suggestion ──────────────────────────────────────────────────────
  const meet_suggestion = pickRandom(MEET_SPOTS);

  return {
    bridge_text,
    exchange_text,
    spark_text,
    meet_suggestion,
    score: connection.score,
    shared_likes: sharedLikes,
    shared_dislikes: sharedDislikes,
    skill_match: connection.skill_match,
    skill_match_details: skillDetails,
    spark: connection.spark || {},
    spark_v2: spark,
  };
}
