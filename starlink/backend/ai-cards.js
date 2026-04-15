const MEETING_SPOTS = [
  'Memorial Union Terrace',
  'College Library (1st floor)',
  'Engineering Hall Atrium',
  'Union South Eating Area',
  'State Street (grab a coffee)',
];

const BRIDGE_TEMPLATES = [
  (shared) => `You both can't get enough of ${shared[0]}${shared.length > 1 ? ` and ${shared[1]}` : ''}. That's a rare find.`,
  (shared) => `${shared[0]} is your common ground — and honestly, that says a lot.`,
  (shared) => `Whether it's ${shared[0]} or just vibing in general, you two are clearly on the same wavelength.`,
  (shared) => `You share a love of ${shared[0]}${shared.length > 1 ? ` (and ${shared[1]})` : ''}. That's the universe winking at you.`,
  (shared) => `Both of you are into ${shared[0]}. Small world. Big connection.`,
];

const SHARED_DISLIKE_TEMPLATES = [
  (shared) => `You've both got strong opinions about ${shared[0]} — sometimes a shared frustration is the best icebreaker.`,
  (shared) => `Bonding over a mutual dislike of ${shared[0]}? Classic. And honestly valid.`,
  (shared) => `Neither of you can stand ${shared[0]}. Solidarity runs deep.`,
  (shared) => `"${shared[0]}" — you both said no. Instantly compatible.`,
  (shared) => `You're united in your feelings about ${shared[0]}. That's a bond that holds.`,
];

const EXCHANGE_TEMPLATES = [
  (a, b, aGives, bGives) => `${a} can share ${aGives[0]} while ${b} brings ${bGives[0]} to the table. A true skills swap.`,
  (a, b, aGives, bGives) => `${a} offers ${aGives[0]} and ${b} offers ${bGives[0]} — this exchange could actually change both your semesters.`,
  (a, b, aGives, bGives) => `You've got what each other needs: ${a} brings ${aGives[0]}, ${b} brings ${bGives[0]}. Set a time. Make it happen.`,
  (a, b, aGives, bGives) => `${aGives[0]} meets ${bGives[0]}. ${a} and ${b} — the campus skill trade of the week.`,
  (a, b, aGives, bGives) => `Real exchange energy: ${a} teaches ${aGives[0]}, ${b} teaches ${bGives[0]}. Win-win.`,
];

const SPARK_TEMPLATES = [
  (spark, nameA, nameB) =>
    `Here's a debate starter: ${nameA} ${spark.userA_stance} ${spark.block}, but ${nameB} ${spark.userB_stance} it. Settle it over coffee.`,
  (spark, nameA, nameB) =>
    `${spark.block} — ${nameA} is a fan, ${nameB}… not so much. That difference might actually spark the best conversation you've had all week.`,
  (spark, nameA, nameB) =>
    `Opposites attract: ${nameA} ${spark.userA_stance} ${spark.block} while ${nameB} ${spark.userB_stance} it. Ask them why. You might be surprised.`,
  (spark, nameA, nameB) =>
    `${nameA} and ${nameB} don't agree on ${spark.block}. That's not a problem — that's a conversation waiting to happen.`,
  (spark, nameA, nameB) =>
    `Imagine the discussion: ${nameA} who ${spark.userA_stance} ${spark.block} vs ${nameB} who ${spark.userB_stance} it. Get a table. Order drinks. Go.`,
  (spark, nameA, nameB) =>
    `One of you loves ${spark.block}, the other doesn't. This could be the most interesting thing you talk about this semester.`,
  (spark, nameA, nameB) =>
    `${spark.block} is where you diverge — and that's exactly what makes this connection interesting.`,
  (spark, nameA, nameB) =>
    `${nameA} ${spark.userA_stance} ${spark.block}. ${nameB} ${spark.userB_stance} it. Debate incoming — who's right?`,
  (spark, nameA, nameB) =>
    `A classic "agree to disagree" moment: ${spark.block}. Start there.`,
  (spark, nameA, nameB) =>
    `${nameA} and ${nameB} split on ${spark.block}. That gap? It's a bridge, not a wall.`,
  (spark, nameA, nameB) =>
    `You don't have to agree on ${spark.block} to get along. In fact, that's often more fun.`,
  (spark, nameA, nameB) =>
    `${spark.block} — a topic where you land on opposite sides. Perfect for a lively first conversation.`,
  (spark, nameA, nameB) =>
    `If ${nameA} ${spark.userA_stance} ${spark.block} and ${nameB} ${spark.userB_stance} it, someone's going to change their mind tonight.`,
  (spark, nameA, nameB) =>
    `${spark.block}: one of you is a fan, one isn't. Let the debate begin.`,
  (spark, nameA, nameB) =>
    `The ${spark.block} disagreement between ${nameA} and ${nameB} is honestly the best possible icebreaker.`,
  (spark, nameA, nameB) =>
    `When ${nameA} says "${spark.block} is great" and ${nameB} says "hard pass" — that's content. Meet up and hash it out.`,
  (spark, nameA, nameB) =>
    `A shared world with one spicy difference: ${spark.block}. ${nameA} ${spark.userA_stance} it. ${nameB} ${spark.userB_stance} it.`,
  (spark, nameA, nameB) =>
    `${spark.block} is where your paths diverge — and that divergence is what makes this worth exploring.`,
  (spark, nameA, nameB) =>
    `Two people. One topic (${spark.block}). Two very different opinions. Time to talk.`,
  (spark, nameA, nameB) =>
    `Start with ${spark.block}. One of you loves it, one of you doesn't. There's your opener.`,
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateConnectionCard(userA, userB, connection) {
  const sharedLikes = Array.isArray(connection.shared_likes) ? connection.shared_likes : [];
  const sharedDislikes = Array.isArray(connection.shared_dislikes) ? connection.shared_dislikes : [];
  const skillDetails = connection.skill_match_details || {};
  const spark = connection.spark || {};

  // Bridge text
  let bridge_text = '';
  if (sharedLikes.length > 0 && sharedDislikes.length > 0) {
    const likesPart = pickRandom(BRIDGE_TEMPLATES)(sharedLikes);
    const dislikesPart = pickRandom(SHARED_DISLIKE_TEMPLATES)(sharedDislikes);
    bridge_text = `${likesPart} ${dislikesPart}`;
  } else if (sharedLikes.length > 0) {
    bridge_text = pickRandom(BRIDGE_TEMPLATES)(sharedLikes);
  } else if (sharedDislikes.length > 0) {
    bridge_text = pickRandom(SHARED_DISLIKE_TEMPLATES)(sharedDislikes);
  } else {
    bridge_text = `${userA.name} and ${userB.name} share a wavelength that's hard to put into words. Sometimes a vibe is enough.`;
  }

  // Exchange text
  let exchange_text = '';
  if (connection.skill_match && skillDetails.a_gives_b && skillDetails.b_gives_a) {
    exchange_text = pickRandom(EXCHANGE_TEMPLATES)(
      userA.name,
      userB.name,
      skillDetails.a_gives_b,
      skillDetails.b_gives_a
    );
  } else {
    exchange_text = `No skill swap detected yet — but there's always something to teach and something to learn.`;
  }

  // Spark text
  let spark_text = '';
  if (spark && spark.block) {
    spark_text = pickRandom(SPARK_TEMPLATES)(spark, userA.name, userB.name);
  } else {
    spark_text = `You two share more than you might think. The conversation will find its own spark.`;
  }

  // Meeting suggestion
  const meet_suggestion = `Meet at ${pickRandom(MEETING_SPOTS)} — it's the kind of place where good conversations happen naturally.`;

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
    spark,
  };
}
