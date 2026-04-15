import { v4 as uuidv4 } from 'uuid';

const COLORS = [
  '#4fc3f7', '#ff8a65', '#ce93d8', '#a5d6a7', '#fff176',
  '#f48fb1', '#80cbc4', '#ffcc02', '#b39ddb', '#4db6ac',
  '#ef9a9a', '#90caf9', '#ffe082', '#c5e1a5', '#f0a500',
  '#80deea', '#bcaaa4', '#ff7043', '#7986cb', '#26c6da',
];

const LIKES_POOL = [
  'basketball', 'coffee', 'hiking', 'cooking', 'gaming',
  'photography', 'reading', 'music production', 'cycling', 'yoga',
  'anime', 'film', 'rock climbing', 'running', 'painting',
  'chess', 'podcasts', 'thrifting', 'concerts', 'camping',
  'baking', 'swimming', 'soccer', 'tennis', 'skateboarding',
  'gardening', 'volunteering', 'travel', 'dancing', 'weightlifting',
];

const DISLIKES_POOL = [
  'early mornings', 'cold weather', 'crowded buses', 'group projects',
  'parking on campus', 'dining hall food', 'slow wifi', 'small talk',
  'loud neighbors', 'homework', 'winter', 'public speaking',
  'exams', 'long lectures', 'laundry', 'mosquitoes',
  'waiting in line', 'spam emails',
];

const FEELINGS = ['stressed', 'lonely', 'curious', 'energized', 'bored', 'overwhelmed'];

const SKILLS_POOL = [
  'stats tutoring', 'resume review', 'mock interviews', 'essay editing',
  'Python coding', 'Spanish practice', 'meal prep tips', 'guitar lessons',
  'math tutoring', 'design feedback', 'public speaking coaching', 'workout buddy',
  'photography tips', 'study group host', 'moving help', 'bike repair',
  'calculus tutoring', 'writing feedback', 'career advice',
  'language exchange Mandarin', 'language exchange Korean',
  'web development', 'data analysis', 'presentation coaching', 'music theory',
];

const NAMES = [
  // Asian
  'Wei Chen', 'Yuki Tanaka', 'Jin-ho Park', 'Priya Patel', 'Ananya Sharma',
  'Raj Krishnan', 'Mei Lin', 'Haruto Sato', 'Soo-Jin Kim', 'Arjun Mehta',
  'Sakura Yamamoto', 'Ravi Kumar', 'Aiko Nakamura', 'Sung-min Lee', 'Divya Nair',
  'Takeshi Ito', 'Jisoo Yoon', 'Shreya Gupta', 'Kenji Watanabe', 'Aisha Khan',
  'Ren Zhang', 'Mina Choi', 'Vikram Singh', 'Hana Suzuki', 'Rohan Sharma',
  // African / African-American
  'Marcus Johnson', 'Amara Okafor', 'Kwame Asante', 'Zara Williams',
  'Jabari Thompson', 'Aaliyah Davis', 'Kofi Mensah', 'Naomi Washington',
  'Darius Carter', 'Imani Robinson', 'Tobias Eze', 'Nia Freeman',
  'Elijah Brown', 'Chloe Adeyemi', 'Isaiah Osei', 'Fatou Diallo',
  'Caleb Nwosu', 'Ayana Stewart', 'Malik Gibson', 'Sade Okonkwo',
  // Hispanic / Latino
  'Sofia Rodriguez', 'Carlos Mendez', 'Isabella Flores', 'Miguel Torres',
  'Valentina Cruz', 'Diego Ramirez', 'Luna Morales', 'Andrés García',
  'Camila Vega', 'Mateo Reyes', 'Lucia Hernandez', 'Pablo Jiménez',
  'Elena Castillo', 'Sebastián Vargas', 'Daniela Romero', 'Felipe Ortega',
  'Mariana Delgado', 'Emilio Ruiz', 'Adriana Fuentes', 'Gabriel Navarro',
  // White / European
  'Emma Sullivan', 'Jake Morrison', 'Olivia Reed', 'Liam O\'Brien',
  'Ava Kowalski', 'Noah Fischer', 'Chloe Bennett', 'Ethan Schwarzenberg',
  'Grace Anderson', 'Tyler Walsh', 'Hannah Berg', 'Ryan Callahan',
  'Megan Hartley', 'Connor Fitzgerald', 'Abigail Larson', 'Austin Winters',
  'Brooke Halverson', 'Garrett Novak', 'Samantha Pierce', 'Derek Holmberg',
  'Paige Sorenson', 'Brandon Eckhart', 'Kayla Whitmore', 'Trevor Magnusson',
  'Lauren Kessler', 'Maxwell Dorn', 'Tiffany Burgess', 'Spencer Lindqvist',
  // Middle Eastern
  'Layla Hassan', 'Omar Khalil', 'Fatima Al-Rashid', 'Karim Nasser',
  'Yasmin Farouk', 'Tariq Mansour', 'Nadia Saleh', 'Hassan Qureshi',
  'Rania Hamdan', 'Bilal Rahimi',
  // Additional diverse names
  'Chiara Russo', 'Dmitri Volkov', 'Ingrid Lindström', 'Kwabena Adjei',
  'Miriam Oduya', 'Sven Eriksson', 'Zainab Idris', 'Aleksei Petrov',
  'Nkechi Adaeze', 'Hiroshi Kimura', 'Aditi Bose', 'Javier Espinoza',
  'Blessing Chukwu', 'Pilar Montoya', 'Tomasz Wiśniewski', 'Nneka Obiora',
  'Seun Adeyinka', 'Katarzyna Nowak', 'Femi Adebayo', 'Simone Bianchi',
];

function randomSpherePoint(radius) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius * Math.cbrt(Math.random());
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSeedUsers() {
  const users = [];

  for (let i = 0; i < 25; i++) {
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : '');
    const pos = randomSpherePoint(400);
    const likesCount = pickRandomInt(2, 5);
    const dislikesCount = pickRandomInt(2, 5);
    const offersCount = pickRandomInt(1, 3);
    const needsCount = pickRandomInt(1, 3);

    users.push({
      id: uuidv4(),
      name,
      avatar_color: COLORS[i % COLORS.length],
      likes: pickRandom(LIKES_POOL, likesCount),
      dislikes: pickRandom(DISLIKES_POOL, dislikesCount),
      current_feeling: FEELINGS[Math.floor(Math.random() * FEELINGS.length)],
      skills_offer: pickRandom(SKILLS_POOL, offersCount),
      skills_need: pickRandom(SKILLS_POOL, needsCount),
      star_brightness: Math.random() * 0.8 + 0.4,
      position_x: pos.x,
      position_y: pos.y,
      position_z: pos.z,
      created_at: new Date().toISOString(),
      is_demo: true,
    });
  }

  return users;
}

export async function seedDatabase(dbModule, matching) {
  console.log('Seeding database...');

  // Clear existing demo data
  if (typeof dbModule.deleteAllDemoData === 'function') {
    dbModule.deleteAllDemoData();
    console.log('Cleared existing demo data.');
  }

  const users = generateSeedUsers();

  // Insert all users
  for (const user of users) {
    dbModule.createUser(user);
  }
  console.log(`Inserted ${users.length} demo users.`);

  // Compute and insert all connections
  const connections = matching.computeAllConnections(users);
  for (const conn of connections) {
    dbModule.createConnection(conn);
  }
  console.log(`Inserted ${connections.length} connections.`);

  return { users: users.length, connections: connections.length };
}
