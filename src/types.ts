export type FollowPrivacy = 'direct' | 'request' | 'private';

export interface Student {
  grNo: string; // Internal account ID
  username?: string; // e.g. "alex_green"
  name: string;
  grade: string;
  points: number;
  weeklyPoints: number;
  avatarUrl?: string;
  rank: number;
  badges: string[]; // badge IDs
  co2SavedKg: number;
  waterSavedLiters: number;
  wasteDivertedKg: number;
  energySavedKwh: number;
  joinedDate: string;
  profession?: string;
  role?: 'Student' | 'Eco Officer' | 'Admin';
  schoolPosition?: string;
  email?: string;
  phone?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
  followers?: string[]; // IDs of users following this student
  following?: string[]; // IDs of users this student follows
  followRequests?: string[]; // IDs of users requesting to follow this student
  followPrivacy?: FollowPrivacy; // 'direct' | 'request' | 'private'
  connections?: string[]; // IDs of connected users
  location?: string; // Campus location / Wing / City
  binPointsAdjustmentApplied?: boolean;
  credit2000Applied?: boolean;
  credit10kApplied?: boolean;
  credit10k_ECO266136Applied?: boolean;
  credit10k_ECO835902Applied?: boolean;
}

export type ActionCategory = 'Recycling' | 'Energy' | 'Transport' | 'Waste' | 'Water' | 'Nature' | 'Digital';

export interface Challenge {
  id: string;
  title: string;
  category: ActionCategory;
  points: number;
  description: string;
  co2Multiplier: number; // kg CO2 saved per unit
  waterMultiplier: number; // liters saved per unit
  wasteMultiplier: number; // kg waste saved per unit
  energyMultiplier: number; // kWh saved per unit
  unitLabel: string; // e.g., "meals", "km", "items", "trees"
  defaultQuantity: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: 'Daily' | 'Weekly' | 'Special Drive';
  badgeRewardId?: string;
  icon: string;
  featured?: boolean;
}

export interface ActivityLog {
  id: string;
  grNo: string;
  studentName: string;
  challengeId: string;
  challengeTitle: string;
  category: ActionCategory;
  quantity: number;
  unitLabel: string;
  pointsEarned: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  wasteDivertedKg: number;
  energySavedKwh: number;
  proofNote: string;
  proofImageUrl?: string;
  timestamp: string;
  status: 'Approved' | 'Pending Verification' | 'Rejected';
  verifiedBy?: string;
  cheersCount: number;
  reactions: {
    cheer: number;
    fire: number;
    leaf: number;
  };
  userReacted?: {
    cheer?: boolean;
    fire?: boolean;
    leaf?: boolean;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requiredPoints?: number;
  requiredActionsCount?: number;
  color: string;
}

export type RewardCategory = 'Eco Perk' | 'Campus Perk' | 'Eco Merchandise' | 'School Supplies' | 'Green Essentials' | 'Recognition' | 'Voucher';

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: RewardCategory;
  stock: number;
  iconName: string;
  codePrefix: string;
  createdBy?: string;
  createdAt?: string;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  redeemedAt: string;
  redemptionCode: string;
  studentGrNo: string;
  studentName: string;
  status: 'Active' | 'Used';
}

export interface GiftCard {
  id?: string;
  code: string;
  redeemCode: string;
  pointsGiven: number;
  points?: number;
  isRedeemed: boolean;
  status: 'active' | 'redeemed';
  createdAt: string;
  createdBy?: string;
  binId?: string;
  source?: string;
  redeemedBy?: string | null;
  redeemedByName?: string | null;
  redeemedAt?: string | null;
}

export interface IssueReport {
  id: string;
  name: string;
  email: string;
  description: string;
  fileName?: string;
  fileData?: string;
  submittedAt: string;
  grNo?: string;
  status: 'Pending' | 'In Review' | 'Resolved';
}

export type FeedCategory = 
  | '🌱 Nature & Planting'
  | '♻️ Recycling & Upcycling'
  | '💡 Energy Saving'
  | '🚴 Clean Commute'
  | '🥗 Zero Waste & Food'
  | '🌍 Everyday Green Doing';

export interface FeedComment {
  id: string;
  grNo: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface FeedPost {
  id: string;
  grNo: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  title?: string;
  content: string; // Description of their everyday green doing
  category: FeedCategory;
  doingTag?: string; // e.g. "Planted herbs", "Bicycled to school", "Switched off empty lab lights"
  photoUrl?: string;
  location?: string; // e.g. "Science Wing", "Campus Garden", "Cafeteria", "Home"
  timestamp: string;
  reactions: {
    cheer: number;   // ❤️
    fire: number;    // 🔥
    leaf: number;    // 🌿
    lightbulb: number; // 💡
  };
  userReacted?: {
    cheer?: boolean;
    fire?: boolean;
    leaf?: boolean;
    lightbulb?: boolean;
  };
  comments: FeedComment[];
}

export interface TeamMemberBio {
  id: string;
  name: string;
  role: string;
  aboutMe: string;
  bio: string;
  whyVerdeTechSpecial: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  isLead?: boolean;
  updatedAt?: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverUsername?: string;
  receiverAvatar?: string;
  text: string;
  timestamp: string;
  read: boolean;
  reaction?: string;
}


