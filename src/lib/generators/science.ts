// Science content generators for Home²
// Supports Biology, Chemistry, Physics, and Earth Science

export type ScienceSubject = "biology" | "chemistry" | "physics" | "earth-science";

export type GradeLevel = "K" | "1-2" | "3-4" | "5-6" | "7-8" | "9-12";

export interface BiologyProblem {
  type: "classification" | "life-cycle" | "ecosystem" | "anatomy" | "genetics";
  question: string;
  answer: string;
  explanation?: string;
}

export interface ChemistryProblem {
  type: "elements" | "compounds" | "reactions" | "periodic-table" | "molecules";
  question: string;
  answer: string;
  explanation?: string;
}

export interface PhysicsProblem {
  type: "motion" | "forces" | "energy" | "waves" | "electricity";
  question: string;
  answer: string;
  explanation?: string;
}

export interface EarthScienceProblem {
  type: "weather" | "geology" | "astronomy" | "oceans" | "climate";
  question: string;
  answer: string;
  explanation?: string;
}

export type ScienceProblem =
  | BiologyProblem
  | ChemistryProblem
  | PhysicsProblem
  | EarthScienceProblem;

// Biology content by grade level
const BIOLOGY_CONTENT = {
  K: {
    classification: [
      {
        question: "Which of these is a living thing?",
        answer: "Tree",
        options: ["Tree", "Rock", "Car", "Book"],
      },
      {
        question: "What do plants need to grow?",
        answer: "Sunlight and water",
        options: ["Sunlight and water", "Only water", "Only sunlight", "Nothing"],
      },
      {
        question: "Which animal lives in water?",
        answer: "Fish",
        options: ["Fish", "Dog", "Bird", "Cat"],
      },
    ],
    "life-cycle": [
      {
        question: "What comes from a seed?",
        answer: "Plant",
        options: ["Plant", "Rock", "Water", "Air"],
      },
      {
        question: "What does a caterpillar become?",
        answer: "Butterfly",
        options: ["Butterfly", "Bird", "Fish", "Tree"],
      },
    ],
    ecosystem: [
      {
        question: "Where do birds live?",
        answer: "Nest",
        options: ["Nest", "Water", "Underground", "Car"],
      },
      {
        question: "What do bees collect from flowers?",
        answer: "Nectar",
        options: ["Nectar", "Water", "Dirt", "Rocks"],
      },
    ],
  },
  "1-2": {
    classification: [
      {
        question: "Which group do humans belong to?",
        answer: "Mammals",
        options: ["Mammals", "Birds", "Fish", "Reptiles"],
      },
      {
        question: "What makes birds different from other animals?",
        answer: "They have feathers",
        options: ["They have feathers", "They have fur", "They have scales", "They have skin"],
      },
      {
        question: "Which animal is cold-blooded?",
        answer: "Snake",
        options: ["Snake", "Dog", "Bird", "Whale"],
      },
    ],
    "life-cycle": [
      {
        question: "What is the first stage of a butterfly's life?",
        answer: "Egg",
        options: ["Egg", "Caterpillar", "Chrysalis", "Butterfly"],
      },
      {
        question: "How do most plants reproduce?",
        answer: "Seeds",
        options: ["Seeds", "Eggs", "Babies", "Spores"],
      },
    ],
    ecosystem: [
      {
        question: "What is a producer in a food chain?",
        answer: "Plant",
        options: ["Plant", "Rabbit", "Fox", "Eagle"],
      },
      {
        question: "What happens when there are too many predators?",
        answer: "Prey population decreases",
        options: [
          "Prey population decreases",
          "Prey population increases",
          "Nothing changes",
          "Predators disappear",
        ],
      },
    ],
  },
  "3-4": {
    classification: [
      {
        question: "Which kingdom do mushrooms belong to?",
        answer: "Fungi",
        options: ["Fungi", "Plants", "Animals", "Bacteria"],
      },
      {
        question: "What is the scientific name for humans?",
        answer: "Homo sapiens",
        options: ["Homo sapiens", "Canis lupus", "Felis catus", "Equus caballus"],
      },
      {
        question: "Which phylum do insects belong to?",
        answer: "Arthropoda",
        options: ["Arthropoda", "Chordata", "Mollusca", "Annelida"],
      },
    ],
    "life-cycle": [
      {
        question: "What is metamorphosis?",
        answer: "Complete change in body form",
        options: [
          "Complete change in body form",
          "Growing bigger",
          "Changing color",
          "Moving faster",
        ],
      },
      {
        question: "How do flowering plants reproduce?",
        answer: "Through pollination",
        options: ["Through pollination", "Through division", "Through budding", "Through spores"],
      },
    ],
    ecosystem: [
      {
        question: "What is the role of decomposers?",
        answer: "Break down dead organisms",
        options: ["Break down dead organisms", "Make food", "Hunt prey", "Produce oxygen"],
      },
      {
        question: "What is biodiversity?",
        answer: "Variety of life in an ecosystem",
        options: [
          "Variety of life in an ecosystem",
          "Number of trees",
          "Amount of water",
          "Size of area",
        ],
      },
    ],
  },
  "5-6": {
    classification: [
      {
        question: "What is the difference between vertebrates and invertebrates?",
        answer: "Vertebrates have backbones",
        options: [
          "Vertebrates have backbones",
          "Vertebrates are bigger",
          "Vertebrates live longer",
          "Vertebrates are smarter",
        ],
      },
      {
        question: "Which group includes whales and dolphins?",
        answer: "Mammals",
        options: ["Mammals", "Fish", "Reptiles", "Amphibians"],
      },
      {
        question: "What makes amphibians unique?",
        answer: "They live both in water and on land",
        options: [
          "They live both in water and on land",
          "They have scales",
          "They lay eggs",
          "They are cold-blooded",
        ],
      },
    ],
    "life-cycle": [
      {
        question: "What is the difference between complete and incomplete metamorphosis?",
        answer: "Complete has 4 stages, incomplete has 3",
        options: [
          "Complete has 4 stages, incomplete has 3",
          "Complete is faster",
          "Incomplete is more common",
          "Complete only happens in water",
        ],
      },
      {
        question: "How do ferns reproduce?",
        answer: "Through spores",
        options: ["Through spores", "Through seeds", "Through flowers", "Through roots"],
      },
    ],
    ecosystem: [
      {
        question: "What is a keystone species?",
        answer: "Species that has a large impact on ecosystem",
        options: [
          "Species that has a large impact on ecosystem",
          "Largest species",
          "Most common species",
          "Most dangerous species",
        ],
      },
      {
        question: "What is the greenhouse effect?",
        answer: "Trapping of heat by atmospheric gases",
        options: [
          "Trapping of heat by atmospheric gases",
          "Cooling of Earth",
          "Increase in oxygen",
          "Decrease in carbon dioxide",
        ],
      },
    ],
  },
  "7-8": {
    classification: [
      {
        question: "What is the difference between prokaryotic and eukaryotic cells?",
        answer: "Eukaryotic cells have a nucleus",
        options: [
          "Eukaryotic cells have a nucleus",
          "Prokaryotic cells are bigger",
          "Eukaryotic cells are older",
          "Prokaryotic cells are more complex",
        ],
      },
      {
        question: "Which domain includes bacteria?",
        answer: "Bacteria",
        options: ["Bacteria", "Archaea", "Eukarya", "All of the above"],
      },
      {
        question: "What is taxonomy?",
        answer: "Science of classifying organisms",
        options: [
          "Science of classifying organisms",
          "Study of cells",
          "Study of evolution",
          "Study of genetics",
        ],
      },
    ],
    "life-cycle": [
      {
        question: "What is the difference between mitosis and meiosis?",
        answer: "Mitosis produces identical cells, meiosis produces gametes",
        options: [
          "Mitosis produces identical cells, meiosis produces gametes",
          "Mitosis is faster",
          "Meiosis only happens in plants",
          "Mitosis only happens in animals",
        ],
      },
      {
        question: "What is alternation of generations?",
        answer: "Life cycle with both haploid and diploid phases",
        options: [
          "Life cycle with both haploid and diploid phases",
          "Changing between species",
          "Growing bigger over time",
          "Moving to different habitats",
        ],
      },
    ],
    ecosystem: [
      {
        question: "What is carrying capacity?",
        answer: "Maximum population size an environment can support",
        options: [
          "Maximum population size an environment can support",
          "Speed of population growth",
          "Number of species",
          "Size of ecosystem",
        ],
      },
      {
        question: "What is the difference between primary and secondary succession?",
        answer: "Primary starts on bare rock, secondary after disturbance",
        options: [
          "Primary starts on bare rock, secondary after disturbance",
          "Primary is faster",
          "Secondary has more species",
          "Primary only happens in water",
        ],
      },
    ],
  },
  "9-12": {
    classification: [
      {
        question: "What is cladistics?",
        answer: "Method of classifying organisms based on shared characteristics",
        options: [
          "Method of classifying organisms based on shared characteristics",
          "Study of fossils",
          "Study of behavior",
          "Study of anatomy",
        ],
      },
      {
        question: "What is the difference between homologous and analogous structures?",
        answer: "Homologous share ancestry, analogous share function",
        options: [
          "Homologous share ancestry, analogous share function",
          "Homologous are bigger",
          "Analogous are more complex",
          "Homologous are older",
        ],
      },
      {
        question: "What is a phylogenetic tree?",
        answer: "Diagram showing evolutionary relationships",
        options: [
          "Diagram showing evolutionary relationships",
          "Family tree of one species",
          "Map of habitats",
          "List of characteristics",
        ],
      },
    ],
    "life-cycle": [
      {
        question: "What is the difference between haploid and diploid cells?",
        answer: "Haploid has one set of chromosomes, diploid has two",
        options: [
          "Haploid has one set of chromosomes, diploid has two",
          "Haploid is smaller",
          "Diploid is more complex",
          "Haploid is faster",
        ],
      },
      {
        question: "What is genetic recombination?",
        answer: "Exchange of genetic material between chromosomes",
        options: [
          "Exchange of genetic material between chromosomes",
          "Creation of new genes",
          "Loss of genetic material",
          "Duplication of chromosomes",
        ],
      },
    ],
    ecosystem: [
      {
        question: "What is the difference between r-selected and K-selected species?",
        answer: "r-selected have many offspring, K-selected have few",
        options: [
          "r-selected have many offspring, K-selected have few",
          "r-selected are bigger",
          "K-selected live longer",
          "r-selected are smarter",
        ],
      },
      {
        question: "What is ecological succession?",
        answer: "Process of change in ecosystem over time",
        options: [
          "Process of change in ecosystem over time",
          "Movement of organisms",
          "Growth of individual plants",
          "Change in weather",
        ],
      },
    ],
  },
};

// Chemistry content by grade level
const CHEMISTRY_CONTENT = {
  K: {
    elements: [
      {
        question: "What is the symbol for water?",
        answer: "H2O",
        options: ["H2O", "CO2", "NaCl", "O2"],
      },
      {
        question: "What gas do we breathe in?",
        answer: "Oxygen",
        options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"],
      },
      {
        question: "What makes things burn?",
        answer: "Oxygen",
        options: ["Oxygen", "Water", "Salt", "Sugar"],
      },
    ],
    compounds: [
      {
        question: "What is table salt made of?",
        answer: "Sodium and chlorine",
        options: [
          "Sodium and chlorine",
          "Sugar and water",
          "Iron and oxygen",
          "Carbon and hydrogen",
        ],
      },
      {
        question: "What is sugar made of?",
        answer: "Carbon, hydrogen, and oxygen",
        options: [
          "Carbon, hydrogen, and oxygen",
          "Sodium and chlorine",
          "Iron and oxygen",
          "Nitrogen and oxygen",
        ],
      },
    ],
  },
  "1-2": {
    elements: [
      {
        question: "What is the most common element in the universe?",
        answer: "Hydrogen",
        options: ["Hydrogen", "Oxygen", "Carbon", "Iron"],
      },
      {
        question: "What element makes up most of the air we breathe?",
        answer: "Nitrogen",
        options: ["Nitrogen", "Oxygen", "Carbon dioxide", "Hydrogen"],
      },
      { question: "What is the symbol for gold?", answer: "Au", options: ["Au", "Go", "Gd", "Ag"] },
    ],
    compounds: [
      {
        question: "What is the chemical formula for carbon dioxide?",
        answer: "CO2",
        options: ["CO2", "C2O", "CO", "C2O2"],
      },
      {
        question: "What happens when you mix vinegar and baking soda?",
        answer: "It fizzes",
        options: ["It fizzes", "It turns blue", "It gets hot", "It disappears"],
      },
    ],
  },
  "3-4": {
    elements: [
      {
        question: "How many elements are on the periodic table?",
        answer: "118",
        options: ["118", "92", "50", "200"],
      },
      {
        question: "What is the lightest element?",
        answer: "Hydrogen",
        options: ["Hydrogen", "Helium", "Lithium", "Carbon"],
      },
      {
        question: "What element is essential for life?",
        answer: "Carbon",
        options: ["Carbon", "Gold", "Silver", "Iron"],
      },
    ],
    compounds: [
      {
        question: "What is the difference between an element and a compound?",
        answer: "Element is pure, compound is mixed",
        options: [
          "Element is pure, compound is mixed",
          "Element is bigger",
          "Compound is older",
          "Element is more common",
        ],
      },
      {
        question: "What is the chemical formula for methane?",
        answer: "CH4",
        options: ["CH4", "C2H4", "CH2", "C2H6"],
      },
    ],
  },
  "5-6": {
    elements: [
      {
        question: "What are the three main types of elements?",
        answer: "Metals, nonmetals, metalloids",
        options: [
          "Metals, nonmetals, metalloids",
          "Solid, liquid, gas",
          "Big, medium, small",
          "Old, new, ancient",
        ],
      },
      {
        question: "What is the atomic number?",
        answer: "Number of protons",
        options: [
          "Number of protons",
          "Number of electrons",
          "Number of neutrons",
          "Weight of atom",
        ],
      },
      { question: "What is the symbol for iron?", answer: "Fe", options: ["Fe", "Ir", "In", "I"] },
    ],
    compounds: [
      {
        question: "What is a molecule?",
        answer: "Two or more atoms bonded together",
        options: [
          "Two or more atoms bonded together",
          "Single atom",
          "Type of element",
          "Kind of metal",
        ],
      },
      {
        question: "What is the difference between ionic and covalent bonds?",
        answer: "Ionic transfers electrons, covalent shares",
        options: [
          "Ionic transfers electrons, covalent shares",
          "Ionic is stronger",
          "Covalent is faster",
          "Ionic is bigger",
        ],
      },
    ],
  },
  "7-8": {
    elements: [
      {
        question: "What is the difference between atomic number and atomic mass?",
        answer: "Atomic number is protons, mass is protons + neutrons",
        options: [
          "Atomic number is protons, mass is protons + neutrons",
          "Atomic number is bigger",
          "Atomic mass is protons only",
          "They are the same",
        ],
      },
      {
        question: "What are isotopes?",
        answer: "Atoms with same protons but different neutrons",
        options: [
          "Atoms with same protons but different neutrons",
          "Different elements",
          "Same as ions",
          "Type of compound",
        ],
      },
      {
        question: "What is the most reactive group of elements?",
        answer: "Alkali metals",
        options: ["Alkali metals", "Noble gases", "Halogens", "Transition metals"],
      },
    ],
    compounds: [
      {
        question: "What is the difference between acids and bases?",
        answer: "Acids release H+ ions, bases release OH- ions",
        options: [
          "Acids release H+ ions, bases release OH- ions",
          "Acids are stronger",
          "Bases are more common",
          "Acids are bigger",
        ],
      },
      {
        question: "What is pH?",
        answer: "Measure of acidity or basicity",
        options: [
          "Measure of acidity or basicity",
          "Type of element",
          "Kind of bond",
          "Size of molecule",
        ],
      },
    ],
  },
  "9-12": {
    elements: [
      {
        question: "What is electron configuration?",
        answer: "Arrangement of electrons in energy levels",
        options: [
          "Arrangement of electrons in energy levels",
          "Number of protons",
          "Type of bond",
          "Size of atom",
        ],
      },
      {
        question: "What is the difference between metals and nonmetals?",
        answer: "Metals conduct electricity, nonmetals don't",
        options: [
          "Metals conduct electricity, nonmetals don't",
          "Metals are bigger",
          "Nonmetals are older",
          "Metals are more common",
        ],
      },
      {
        question: "What is electronegativity?",
        answer: "Ability to attract electrons",
        options: [
          "Ability to attract electrons",
          "Number of electrons",
          "Size of atom",
          "Type of bond",
        ],
      },
    ],
    compounds: [
      {
        question: "What is the difference between organic and inorganic compounds?",
        answer: "Organic contains carbon, inorganic doesn't",
        options: [
          "Organic contains carbon, inorganic doesn't",
          "Organic is bigger",
          "Inorganic is more complex",
          "Organic is older",
        ],
      },
      {
        question: "What is a polymer?",
        answer: "Large molecule made of repeating units",
        options: [
          "Large molecule made of repeating units",
          "Single atom",
          "Type of element",
          "Kind of bond",
        ],
      },
    ],
  },
};

// Physics content by grade level
const PHYSICS_CONTENT = {
  K: {
    motion: [
      {
        question: "What makes things move?",
        answer: "Force",
        options: ["Force", "Color", "Size", "Sound"],
      },
      {
        question: "What happens when you push a ball?",
        answer: "It moves",
        options: ["It moves", "It stops", "It disappears", "It changes color"],
      },
      {
        question: "What is speed?",
        answer: "How fast something moves",
        options: [
          "How fast something moves",
          "How big something is",
          "What color something is",
          "How loud something is",
        ],
      },
    ],
    forces: [
      {
        question: "What pulls things down?",
        answer: "Gravity",
        options: ["Gravity", "Wind", "Sound", "Light"],
      },
      {
        question: "What happens when you drop something?",
        answer: "It falls down",
        options: ["It falls down", "It goes up", "It disappears", "It changes color"],
      },
    ],
  },
  "1-2": {
    motion: [
      {
        question: "What is the difference between speed and velocity?",
        answer: "Velocity includes direction",
        options: [
          "Velocity includes direction",
          "Speed is faster",
          "Velocity is bigger",
          "Speed is more common",
        ],
      },
      {
        question: "What is acceleration?",
        answer: "Change in speed or direction",
        options: [
          "Change in speed or direction",
          "How fast something moves",
          "How big something is",
          "What color something is",
        ],
      },
      {
        question: "What is momentum?",
        answer: "Mass times velocity",
        options: [
          "Mass times velocity",
          "Speed times time",
          "Force times distance",
          "Energy times time",
        ],
      },
    ],
    forces: [
      {
        question: "What is friction?",
        answer: "Force that opposes motion",
        options: [
          "Force that opposes motion",
          "Force that helps motion",
          "Type of energy",
          "Kind of speed",
        ],
      },
      {
        question: "What happens when forces are balanced?",
        answer: "Object doesn't move",
        options: [
          "Object doesn't move",
          "Object moves faster",
          "Object changes direction",
          "Object disappears",
        ],
      },
    ],
  },
  "3-4": {
    motion: [
      {
        question: "What is Newton's first law?",
        answer: "Objects at rest stay at rest",
        options: [
          "Objects at rest stay at rest",
          "Force equals mass times acceleration",
          "For every action there's an equal reaction",
          "Energy cannot be created or destroyed",
        ],
      },
      {
        question: "What is the difference between distance and displacement?",
        answer: "Displacement includes direction",
        options: [
          "Displacement includes direction",
          "Distance is longer",
          "Displacement is faster",
          "Distance is more common",
        ],
      },
      {
        question: "What is uniform motion?",
        answer: "Constant speed in straight line",
        options: [
          "Constant speed in straight line",
          "Changing speed",
          "Circular motion",
          "Stopped motion",
        ],
      },
    ],
    forces: [
      {
        question: "What is Newton's second law?",
        answer: "Force equals mass times acceleration",
        options: [
          "Force equals mass times acceleration",
          "Objects at rest stay at rest",
          "For every action there's an equal reaction",
          "Energy cannot be created or destroyed",
        ],
      },
      {
        question: "What is Newton's third law?",
        answer: "For every action there's an equal reaction",
        options: [
          "For every action there's an equal reaction",
          "Objects at rest stay at rest",
          "Force equals mass times acceleration",
          "Energy cannot be created or destroyed",
        ],
      },
    ],
  },
  "5-6": {
    motion: [
      {
        question: "What is the difference between scalar and vector quantities?",
        answer: "Scalar has magnitude, vector has magnitude and direction",
        options: [
          "Scalar has magnitude, vector has magnitude and direction",
          "Scalar is bigger",
          "Vector is faster",
          "Scalar is more common",
        ],
      },
      {
        question: "What is projectile motion?",
        answer: "Motion under influence of gravity",
        options: [
          "Motion under influence of gravity",
          "Motion in straight line",
          "Motion in circle",
          "Motion at constant speed",
        ],
      },
      {
        question: "What is centripetal force?",
        answer: "Force toward center of circular motion",
        options: [
          "Force toward center of circular motion",
          "Force away from center",
          "Force in straight line",
          "Force that stops motion",
        ],
      },
    ],
    forces: [
      {
        question: "What is the difference between mass and weight?",
        answer: "Mass is amount of matter, weight is force of gravity",
        options: [
          "Mass is amount of matter, weight is force of gravity",
          "Mass is bigger",
          "Weight is more common",
          "Mass is faster",
        ],
      },
      {
        question: "What is the difference between static and kinetic friction?",
        answer: "Static prevents motion, kinetic opposes motion",
        options: [
          "Static prevents motion, kinetic opposes motion",
          "Static is stronger",
          "Kinetic is faster",
          "Static is more common",
        ],
      },
    ],
  },
  "7-8": {
    motion: [
      {
        question: "What is the difference between linear and angular motion?",
        answer: "Linear is straight line, angular is rotation",
        options: [
          "Linear is straight line, angular is rotation",
          "Linear is faster",
          "Angular is bigger",
          "Linear is more common",
        ],
      },
      {
        question: "What is the difference between uniform and non-uniform motion?",
        answer: "Uniform has constant speed, non-uniform changes",
        options: [
          "Uniform has constant speed, non-uniform changes",
          "Uniform is faster",
          "Non-uniform is bigger",
          "Uniform is more common",
        ],
      },
      {
        question: "What is the difference between speed and velocity?",
        answer: "Velocity includes direction",
        options: [
          "Velocity includes direction",
          "Speed is faster",
          "Velocity is bigger",
          "Speed is more common",
        ],
      },
    ],
    forces: [
      {
        question: "What is the difference between contact and non-contact forces?",
        answer: "Contact requires touching, non-contact doesn't",
        options: [
          "Contact requires touching, non-contact doesn't",
          "Contact is stronger",
          "Non-contact is faster",
          "Contact is more common",
        ],
      },
      {
        question: "What is the difference between balanced and unbalanced forces?",
        answer: "Balanced cancel out, unbalanced cause motion",
        options: [
          "Balanced cancel out, unbalanced cause motion",
          "Balanced is stronger",
          "Unbalanced is faster",
          "Balanced is more common",
        ],
      },
    ],
  },
  "9-12": {
    motion: [
      {
        question: "What is the difference between kinematics and dynamics?",
        answer: "Kinematics describes motion, dynamics explains causes",
        options: [
          "Kinematics describes motion, dynamics explains causes",
          "Kinematics is faster",
          "Dynamics is bigger",
          "Kinematics is more common",
        ],
      },
      {
        question: "What is the difference between linear and angular momentum?",
        answer:
          "Linear is mass times velocity, angular is moment of inertia times angular velocity",
        options: [
          "Linear is mass times velocity, angular is moment of inertia times angular velocity",
          "Linear is faster",
          "Angular is bigger",
          "Linear is more common",
        ],
      },
      {
        question: "What is the difference between uniform and non-uniform motion?",
        answer: "Uniform has constant speed, non-uniform changes",
        options: [
          "Uniform has constant speed, non-uniform changes",
          "Uniform is faster",
          "Non-uniform is bigger",
          "Uniform is more common",
        ],
      },
    ],
    forces: [
      {
        question: "What is the difference between conservative and non-conservative forces?",
        answer: "Conservative work is path-independent, non-conservative isn't",
        options: [
          "Conservative work is path-independent, non-conservative isn't",
          "Conservative is stronger",
          "Non-conservative is faster",
          "Conservative is more common",
        ],
      },
      {
        question: "What is the difference between elastic and inelastic collisions?",
        answer: "Elastic conserves kinetic energy, inelastic doesn't",
        options: [
          "Elastic conserves kinetic energy, inelastic doesn't",
          "Elastic is faster",
          "Inelastic is bigger",
          "Elastic is more common",
        ],
      },
    ],
  },
};

// Earth Science content by grade level
const EARTH_SCIENCE_CONTENT = {
  K: {
    weather: [
      {
        question: "What falls from clouds?",
        answer: "Rain",
        options: ["Rain", "Snow", "Hail", "All of the above"],
      },
      {
        question: "What makes the wind blow?",
        answer: "Air moving",
        options: ["Air moving", "Trees shaking", "Birds flying", "Cars driving"],
      },
      {
        question: "What is the sun?",
        answer: "A star",
        options: ["A star", "A planet", "A moon", "A cloud"],
      },
    ],
    geology: [
      {
        question: "What are rocks made of?",
        answer: "Minerals",
        options: ["Minerals", "Water", "Air", "Plants"],
      },
      {
        question: "What is the center of Earth called?",
        answer: "Core",
        options: ["Core", "Crust", "Mantle", "Surface"],
      },
    ],
  },
  "1-2": {
    weather: [
      {
        question: "What is the water cycle?",
        answer: "Water moving through Earth",
        options: [
          "Water moving through Earth",
          "Water in ocean",
          "Water in clouds",
          "Water in ground",
        ],
      },
      {
        question: "What causes seasons?",
        answer: "Earth's tilt",
        options: ["Earth's tilt", "Distance from sun", "Moon's position", "Wind direction"],
      },
      {
        question: "What is precipitation?",
        answer: "Water falling from sky",
        options: ["Water falling from sky", "Water in ground", "Water in ocean", "Water in air"],
      },
    ],
    geology: [
      {
        question: "What are the three types of rocks?",
        answer: "Igneous, sedimentary, metamorphic",
        options: [
          "Igneous, sedimentary, metamorphic",
          "Big, medium, small",
          "Red, blue, green",
          "Hard, soft, medium",
        ],
      },
      {
        question: "What causes earthquakes?",
        answer: "Movement of Earth's plates",
        options: ["Movement of Earth's plates", "Wind", "Rain", "Sun"],
      },
    ],
  },
  "3-4": {
    weather: [
      {
        question: "What is the difference between weather and climate?",
        answer: "Weather is short-term, climate is long-term",
        options: [
          "Weather is short-term, climate is long-term",
          "Weather is bigger",
          "Climate is faster",
          "Weather is more common",
        ],
      },
      {
        question: "What is the greenhouse effect?",
        answer: "Trapping of heat by gases",
        options: [
          "Trapping of heat by gases",
          "Cooling of Earth",
          "Increase in oxygen",
          "Decrease in carbon dioxide",
        ],
      },
      {
        question: "What is the difference between high and low pressure?",
        answer: "High pressure brings clear weather",
        options: [
          "High pressure brings clear weather",
          "Low pressure is stronger",
          "High pressure is faster",
          "Low pressure is more common",
        ],
      },
    ],
    geology: [
      {
        question: "What is the difference between weathering and erosion?",
        answer: "Weathering breaks down, erosion moves",
        options: [
          "Weathering breaks down, erosion moves",
          "Weathering is faster",
          "Erosion is bigger",
          "Weathering is more common",
        ],
      },
      {
        question: "What is the difference between magma and lava?",
        answer: "Magma is underground, lava is above ground",
        options: [
          "Magma is underground, lava is above ground",
          "Magma is hotter",
          "Lava is bigger",
          "Magma is more common",
        ],
      },
    ],
  },
  "5-6": {
    weather: [
      {
        question: "What is the difference between a hurricane and a tornado?",
        answer: "Hurricane is over ocean, tornado is over land",
        options: [
          "Hurricane is over ocean, tornado is over land",
          "Hurricane is bigger",
          "Tornado is faster",
          "Hurricane is more common",
        ],
      },
      {
        question: "What is the difference between a front and a storm?",
        answer: "Front is boundary, storm is weather system",
        options: [
          "Front is boundary, storm is weather system",
          "Front is bigger",
          "Storm is faster",
          "Front is more common",
        ],
      },
      {
        question: "What is the difference between a cyclone and an anticyclone?",
        answer: "Cyclone is low pressure, anticyclone is high pressure",
        options: [
          "Cyclone is low pressure, anticyclone is high pressure",
          "Cyclone is bigger",
          "Anticyclone is faster",
          "Cyclone is more common",
        ],
      },
    ],
    geology: [
      {
        question: "What is the difference between a mineral and a rock?",
        answer: "Mineral is pure, rock is mixture",
        options: [
          "Mineral is pure, rock is mixture",
          "Mineral is bigger",
          "Rock is faster",
          "Mineral is more common",
        ],
      },
      {
        question: "What is the difference between a fault and a fold?",
        answer: "Fault is break, fold is bend",
        options: [
          "Fault is break, fold is bend",
          "Fault is bigger",
          "Fold is faster",
          "Fault is more common",
        ],
      },
    ],
  },
  "7-8": {
    weather: [
      {
        question: "What is the difference between a warm front and a cold front?",
        answer: "Warm front brings warm air, cold front brings cold air",
        options: [
          "Warm front brings warm air, cold front brings cold air",
          "Warm front is bigger",
          "Cold front is faster",
          "Warm front is more common",
        ],
      },
      {
        question: "What is the difference between a hurricane and a typhoon?",
        answer: "Hurricane is in Atlantic, typhoon is in Pacific",
        options: [
          "Hurricane is in Atlantic, typhoon is in Pacific",
          "Hurricane is bigger",
          "Typhoon is faster",
          "Hurricane is more common",
        ],
      },
      {
        question: "What is the difference between a tornado and a waterspout?",
        answer: "Tornado is over land, waterspout is over water",
        options: [
          "Tornado is over land, waterspout is over water",
          "Tornado is bigger",
          "Waterspout is faster",
          "Tornado is more common",
        ],
      },
    ],
    geology: [
      {
        question: "What is the difference between a volcano and a mountain?",
        answer: "Volcano can erupt, mountain cannot",
        options: [
          "Volcano can erupt, mountain cannot",
          "Volcano is bigger",
          "Mountain is faster",
          "Volcano is more common",
        ],
      },
      {
        question: "What is the difference between a glacier and an iceberg?",
        answer: "Glacier is on land, iceberg is in water",
        options: [
          "Glacier is on land, iceberg is in water",
          "Glacier is bigger",
          "Iceberg is faster",
          "Glacier is more common",
        ],
      },
    ],
  },
  "9-12": {
    weather: [
      {
        question: "What is the difference between a hurricane and a cyclone?",
        answer: "Hurricane is in Atlantic, cyclone is in Indian Ocean",
        options: [
          "Hurricane is in Atlantic, cyclone is in Indian Ocean",
          "Hurricane is bigger",
          "Cyclone is faster",
          "Hurricane is more common",
        ],
      },
      {
        question: "What is the difference between a tornado and a waterspout?",
        answer: "Tornado is over land, waterspout is over water",
        options: [
          "Tornado is over land, waterspout is over water",
          "Tornado is bigger",
          "Waterspout is faster",
          "Tornado is more common",
        ],
      },
      {
        question: "What is the difference between a front and a storm?",
        answer: "Front is boundary, storm is weather system",
        options: [
          "Front is boundary, storm is weather system",
          "Front is bigger",
          "Storm is faster",
          "Front is more common",
        ],
      },
    ],
    geology: [
      {
        question: "What is the difference between a mineral and a rock?",
        answer: "Mineral is pure, rock is mixture",
        options: [
          "Mineral is pure, rock is mixture",
          "Mineral is bigger",
          "Rock is faster",
          "Mineral is more common",
        ],
      },
      {
        question: "What is the difference between a fault and a fold?",
        answer: "Fault is break, fold is bend",
        options: [
          "Fault is break, fold is bend",
          "Fault is bigger",
          "Fold is faster",
          "Fault is more common",
        ],
      },
    ],
  },
};

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Generate biology problems
export function generateBiologyProblems(
  count: number,
  grade: GradeLevel,
  types: BiologyProblem["type"][] = ["classification", "life-cycle", "ecosystem"],
  seed: number = Date.now()
): BiologyProblem[] {
  const random = new SeededRandom(seed);
  const problems: BiologyProblem[] = [];
  const gradeContent = BIOLOGY_CONTENT[grade];

  if (!gradeContent) {
    console.warn(`No biology content found for grade ${grade}, using K grade content`);
    const fallbackContent = BIOLOGY_CONTENT.K;
    for (let i = 0; i < count; i++) {
      const type = types[random.nextInt(0, types.length - 1)];
      const typeContent = fallbackContent[type as keyof typeof fallbackContent];

      if (typeContent && typeContent.length > 0) {
        const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
        problems.push({
          type,
          question: problem.question,
          answer: problem.answer,
          explanation: (problem as { explanation?: string }).explanation,
        });
      }
    }
    return problems;
  }

  const maxAttempts = count * 3;
  let attempts = 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts++;
    const type = types[random.nextInt(0, types.length - 1)];
    const typeContent = gradeContent[type as keyof typeof gradeContent];

    if (typeContent && typeContent.length > 0) {
      const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
      problems.push({
        type,
        question: problem.question,
        answer: problem.answer,
        explanation: (problem as { explanation?: string }).explanation,
      });
    }
  }

  // If we need more problems, fill with any available content
  while (problems.length < count) {
    const type = types[random.nextInt(0, types.length - 1)];
    const typeContent = gradeContent[type as keyof typeof gradeContent];

    if (typeContent && typeContent.length > 0) {
      const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
      problems.push({
        type,
        question: problem.question,
        answer: problem.answer,
        explanation: (problem as { explanation?: string }).explanation,
      });
    } else {
      break; // No more content available
    }
  }

  return problems;
}

// Generate chemistry problems
export function generateChemistryProblems(
  count: number,
  grade: GradeLevel,
  types: ChemistryProblem["type"][] = ["elements", "compounds"],
  seed: number = Date.now()
): ChemistryProblem[] {
  const random = new SeededRandom(seed);
  const problems: ChemistryProblem[] = [];
  const gradeContent = CHEMISTRY_CONTENT[grade];

  for (let i = 0; i < count; i++) {
    const type = types[random.nextInt(0, types.length - 1)];
    const typeContent = gradeContent[type as keyof typeof gradeContent];

    if (typeContent && typeContent.length > 0) {
      const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
      problems.push({
        type,
        question: problem.question,
        answer: problem.answer,
        explanation: (problem as { explanation?: string }).explanation,
      });
    }
  }

  return problems;
}

// Generate physics problems
export function generatePhysicsProblems(
  count: number,
  grade: GradeLevel,
  types: PhysicsProblem["type"][] = ["motion", "forces"],
  seed: number = Date.now()
): PhysicsProblem[] {
  const random = new SeededRandom(seed);
  const problems: PhysicsProblem[] = [];
  const gradeContent = PHYSICS_CONTENT[grade];

  for (let i = 0; i < count; i++) {
    const type = types[random.nextInt(0, types.length - 1)];
    const typeContent = gradeContent[type as keyof typeof gradeContent];

    if (typeContent && typeContent.length > 0) {
      const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
      problems.push({
        type,
        question: problem.question,
        answer: problem.answer,
        explanation: (problem as { explanation?: string }).explanation,
      });
    }
  }

  return problems;
}

// Generate earth science problems
export function generateEarthScienceProblems(
  count: number,
  grade: GradeLevel,
  types: EarthScienceProblem["type"][] = ["weather", "geology"],
  seed: number = Date.now()
): EarthScienceProblem[] {
  const random = new SeededRandom(seed);
  const problems: EarthScienceProblem[] = [];
  const gradeContent = EARTH_SCIENCE_CONTENT[grade];

  for (let i = 0; i < count; i++) {
    const type = types[random.nextInt(0, types.length - 1)];
    const typeContent = gradeContent[type as keyof typeof gradeContent];

    if (typeContent && typeContent.length > 0) {
      const problem = typeContent[random.nextInt(0, typeContent.length - 1)];
      problems.push({
        type,
        question: problem.question,
        answer: problem.answer,
        explanation: (problem as { explanation?: string }).explanation,
      });
    }
  }

  return problems;
}

// Main science problem generator
export function generateScienceProblems(
  subject: ScienceSubject,
  count: number,
  grade: GradeLevel,
  seed: number = Date.now()
): ScienceProblem[] {
  switch (subject) {
    case "biology":
      return generateBiologyProblems(count, grade, undefined, seed);
    case "chemistry":
      return generateChemistryProblems(count, grade, undefined, seed);
    case "physics":
      return generatePhysicsProblems(count, grade, undefined, seed);
    case "earth-science":
      return generateEarthScienceProblems(count, grade, undefined, seed);
    default:
      return [];
  }
}
