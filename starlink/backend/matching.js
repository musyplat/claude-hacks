import { v4 as uuidv4 } from 'uuid';

function intersection(arrA, arrB) {
  const setB = new Set((arrB || []).map(s => s.toLowerCase()));
  return (arrA || []).filter(item => setB.has(item.toLowerCase()));
}

// Context buckets for inferring online/offline/peer context from skill tags
const ONLINE_SKILLS = [
  'essay editing',
  'writing feedback',
  'career advice',
  'design feedback',
  'web development',
  'data analysis',
];

const OFFLINE_SKILLS = [
  'mock interviews',
  'workout buddy',
  'moving help',
  'guitar lessons',
  'bike repair',
];

const PEER_SKILLS = [
  'study group host',
  'language exchange mandarin',
  'language exchange korean',
  'spanish practice',
];

function getContextBucket(skills) {
  const normalized = (skills || []).map(s => s.toLowerCase());
  const buckets = new Set();
  for (const skill of normalized) {
    if (ONLINE_SKILLS.some(o => skill.includes(o))) buckets.add('online');
    if (OFFLINE_SKILLS.some(o => skill.includes(o))) buckets.add('offline');
    if (PEER_SKILLS.some(o => skill.includes(o))) buckets.add('peer');
  }
  return buckets;
}

// Goal alignment: compatible and matching goal pairs
const COMPLEMENTARY_GOALS = new Set(['help_me+help_others', 'help_others+help_me']);
const SAME_GOAL_SCORES = { buddy: 2, meet: 1 };

/**
 * Detect the strongest "spark" between two users.
 * Priority:
 *   1. Skill complement (mutual teach/learn)
 *   2. Like/dislike divergence (conversation starter)
 *   3. Context mismatch (one online, one offline — bridge potential)
 */
function detectSpark(userA, userB, aOffersWhatBNeeds, bOffersWhatANeeds) {
  // 1. Mutual skill complement
  if (aOffersWhatBNeeds.length > 0 && bOffersWhatANeeds.length > 0) {
    return {
      type: 'skill_complement',
      aGives: aOffersWhatBNeeds[0],
      bGives: bOffersWhatANeeds[0],
    };
  }

  // 2. Like/dislike divergence
  const likesA = Array.isArray(userA.likes) ? userA.likes : [];
  const likesB = Array.isArray(userB.likes) ? userB.likes : [];
  const dislikesA = Array.isArray(userA.dislikes) ? userA.dislikes : [];
  const dislikesB = Array.isArray(userB.dislikes) ? userB.dislikes : [];

  const aLikesBDislikes = intersection(likesA, dislikesB);
  if (aLikesBDislikes.length > 0) {
    return {
      type: 'interest_divergence',
      block: aLikesBDislikes[0],
      aStance: 'likes',
      bStance: 'dislikes',
    };
  }

  const aDislikesBLikes = intersection(dislikesA, likesB);
  if (aDislikesBLikes.length > 0) {
    return {
      type: 'interest_divergence',
      block: aDislikesBLikes[0],
      aStance: 'dislikes',
      bStance: 'likes',
    };
  }

  // 3. Context mismatch (one is online-oriented, other is offline-oriented)
  const allSkillsA = [...(userA.skills_offer || []), ...(userA.skills_need || [])];
  const allSkillsB = [...(userB.skills_offer || []), ...(userB.skills_need || [])];
  const bucketsA = getContextBucket(allSkillsA);
  const bucketsB = getContextBucket(allSkillsB);

  const hasOnlineA = bucketsA.has('online');
  const hasOfflineA = bucketsA.has('offline');
  const hasOnlineB = bucketsB.has('online');
  const hasOfflineB = bucketsB.has('offline');

  if ((hasOnlineA && hasOfflineB) || (hasOfflineA && hasOnlineB)) {
    return { type: 'context_bridge' };
  }

  return null;
}

/**
 * Compute a connection between two users.
 * Returns a connection object or null if score < 2.
 */
export function computeConnection(userA, userB) {
  const likesA = Array.isArray(userA.likes) ? userA.likes : [];
  const likesB = Array.isArray(userB.likes) ? userB.likes : [];
  const dislikesA = Array.isArray(userA.dislikes) ? userA.dislikes : [];
  const dislikesB = Array.isArray(userB.dislikes) ? userB.dislikes : [];
  const offersA = Array.isArray(userA.skills_offer) ? userA.skills_offer : [];
  const offersB = Array.isArray(userB.skills_offer) ? userB.skills_offer : [];
  const needsA = Array.isArray(userA.skills_need) ? userA.skills_need : [];
  const needsB = Array.isArray(userB.skills_need) ? userB.skills_need : [];

  const shared_likes = intersection(likesA, likesB);
  const shared_dislikes = intersection(dislikesA, dislikesB);

  // Skill match layers
  const aOffersWhatBNeeds = intersection(offersA, needsB);
  const bOffersWhatANeeds = intersection(offersB, needsA);

  // Mutual skill match (both directions) — strongest signal
  const skill_match = aOffersWhatBNeeds.length > 0 && bOffersWhatANeeds.length > 0;

  // One-directional help
  const aHelpsB = !skill_match && aOffersWhatBNeeds.length > 0;
  const bHelpsA = !skill_match && bOffersWhatANeeds.length > 0;

  // Study/learn together (both need the same thing)
  const shared_needs = intersection(needsA, needsB);
  const learn_together = shared_needs.length > 0;

  // Skill match details
  const skill_match_details = {
    a_gives_b: aOffersWhatBNeeds,
    b_gives_a: bOffersWhatANeeds,
    shared_needs,
  };

  const feeling_match =
    userA.current_feeling &&
    userB.current_feeling &&
    userA.current_feeling === userB.current_feeling;

  // Context matching — same context bucket → +1
  const allSkillsA = [...offersA, ...needsA];
  const allSkillsB = [...offersB, ...needsB];
  const bucketsA = getContextBucket(allSkillsA);
  const bucketsB = getContextBucket(allSkillsB);
  const sharedContextBuckets = [...bucketsA].filter(b => bucketsB.has(b));
  const context_match = sharedContextBuckets.length > 0;

  // Goal alignment scoring
  let goal_score = 0;
  const goalA = userA.goal_type || null;
  const goalB = userB.goal_type || null;
  if (goalA && goalB) {
    const pair = `${goalA}+${goalB}`;
    if (COMPLEMENTARY_GOALS.has(pair)) {
      goal_score = 3;
    } else if (goalA === goalB && SAME_GOAL_SCORES[goalA] !== undefined) {
      goal_score = SAME_GOAL_SCORES[goalA];
    }
  }

  const score =
    shared_likes.length * 1 +
    shared_dislikes.length * 2 +
    (skill_match ? 5 : 0) +
    (aHelpsB || bHelpsA ? 3 : 0) +
    (learn_together ? 1 : 0) +
    (feeling_match ? 1 : 0) +
    (context_match ? 1 : 0) +
    goal_score;

  if (score < 2) return null;

  const spark = detectSpark(userA, userB, aOffersWhatBNeeds, bOffersWhatANeeds);

  // Legacy spark shape for backward compatibility
  let legacySpark = {};
  if (spark && spark.type === 'interest_divergence') {
    legacySpark = {
      block: spark.block,
      userA_stance: spark.aStance,
      userB_stance: spark.bStance,
    };
  }

  return {
    id: uuidv4(),
    user_a_id: userA.id,
    user_b_id: userB.id,
    score,
    shared_likes,
    shared_dislikes,
    skill_match,
    skill_match_details,
    context_match,
    shared_context_buckets: sharedContextBuckets,
    goal_alignment: goal_score > 0 ? { goalA, goalB, goal_score } : null,
    spark: legacySpark,
    spark_v2: spark,
    created_at: new Date().toISOString(),
  };
}

/**
 * Compute all connections for a list of users.
 * Returns array of connection objects (score >= 2).
 */
export function computeAllConnections(users) {
  const connections = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const conn = computeConnection(users[i], users[j]);
      if (conn) connections.push(conn);
    }
  }

  return connections;
}

/**
 * Compute connections between a new user and existing users.
 * Returns array of connection objects (score >= 2).
 */
export function computeConnectionsForUser(newUser, existingUsers) {
  const connections = [];

  for (const existing of existingUsers) {
    if (existing.id === newUser.id) continue;
    const conn = computeConnection(newUser, existing);
    if (conn) connections.push(conn);
  }

  return connections;
}
