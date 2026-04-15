import { v4 as uuidv4 } from 'uuid';

function intersection(arrA, arrB) {
  const setB = new Set(arrB.map(s => s.toLowerCase()));
  return arrA.filter(item => setB.has(item.toLowerCase()));
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

  // Skill match: A offers something B needs AND B offers something A needs
  const aOffersWhatBNeeds = intersection(offersA, needsB);
  const bOffersWhatANeeds = intersection(offersB, needsA);
  const skill_match = aOffersWhatBNeeds.length > 0 && bOffersWhatANeeds.length > 0;

  const skill_match_details = skill_match
    ? {
        a_gives_b: aOffersWhatBNeeds,
        b_gives_a: bOffersWhatANeeds,
      }
    : {};

  const feeling_match =
    userA.current_feeling &&
    userB.current_feeling &&
    userA.current_feeling === userB.current_feeling;

  const score =
    shared_likes.length * 1 +
    shared_dislikes.length * 2 +
    (skill_match ? 5 : 0) +
    (feeling_match ? 1 : 0);

  if (score < 2) return null;

  // Spark: first item in (A.likes ∩ B.dislikes) OR (A.dislikes ∩ B.likes)
  let spark = {};
  const aLikesBDislikes = intersection(likesA, dislikesB);
  const aDislikesB_likes = intersection(dislikesA, likesB);

  if (aLikesBDislikes.length > 0) {
    spark = {
      block: aLikesBDislikes[0],
      userA_stance: 'likes',
      userB_stance: 'dislikes',
    };
  } else if (aDislikesB_likes.length > 0) {
    spark = {
      block: aDislikesB_likes[0],
      userA_stance: 'dislikes',
      userB_stance: 'likes',
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
    spark,
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
