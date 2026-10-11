import { StudentProfile } from '../types';
import { SAMPLE_RESUME_CS, SAMPLE_RESUME_DATA } from './storage';

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  college: string;
  graduationYear: string;
  targetRole: string;
  targetCompany: string;
  resumeText: string;
  extractedSkills: string[];
  streakDays: number;
  avatarColor: string;
  createdAt: number;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  college: string;
  graduationYear: string;
  targetRole: string;
  targetCompany?: string;
  resumeText?: string;
}

const AUTH_STORAGE_KEYS = {
  USERS: 'mockmate_auth_users',
  CURRENT_USER_ID: 'mockmate_auth_current_user_id',
};

// Simple deterministic hash using SHA-256 for browser storage
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_mockmate_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const DEMO_USERS_SEEDS: Omit<StudentUser, 'passwordHash'>[] = [
  {
    id: 'usr-kitsw-261',
    name: 'Bhanu Jathoth',
    email: 'b25cs261@kitsw.ac.in',
    college: 'Kakatiya Institute of Technology & Science (KITSW)',
    graduationYear: '2026',
    targetRole: 'Software Development Engineer (SDE-1)',
    targetCompany: 'Google & TCS Digital',
    resumeText: SAMPLE_RESUME_CS,
    extractedSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'DSA', 'Git'],
    streakDays: 5,
    avatarColor: 'bg-indigo-600',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'usr-ananya',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@kitsw.ac.in',
    college: 'Kakatiya Institute of Technology & Science',
    graduationYear: '2026',
    targetRole: 'Frontend Developer',
    targetCompany: 'Microsoft & Amazon',
    resumeText: SAMPLE_RESUME_CS,
    extractedSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
    streakDays: 4,
    avatarColor: 'bg-purple-600',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'usr-vikas',
    name: 'Vikas Patel',
    email: 'vikas.patel@tech.edu',
    college: 'National Institute of Technology',
    graduationYear: '2026',
    targetRole: 'Full Stack Developer',
    targetCompany: 'Infosys & Accenture',
    resumeText: SAMPLE_RESUME_CS,
    extractedSkills: ['Node.js', 'Express', 'MongoDB', 'React', 'Redis'],
    streakDays: 3,
    avatarColor: 'bg-emerald-600',
    createdAt: Date.now() - 86400000 * 3,
  },
];

let cachedPasswordHash: string | null = null;
async function getDefaultPasswordHash(): Promise<string> {
  if (!cachedPasswordHash) {
    cachedPasswordHash = await hashPassword('student123');
  }
  return cachedPasswordHash;
}

export function getAllUsers(): StudentUser[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored users:', e);
  }
  // Initialize default users synchronously with placeholder hash
  const initial: StudentUser[] = DEMO_USERS_SEEDS.map((u) => ({
    ...u,
    passwordHash: 'e7cf3ef4f17c3999a94f2c6f612e8a888e5b1026878e4e19398b23bd38ec221a', // hash of student123
  }));
  saveAllUsers(initial);
  return initial;
}

function saveAllUsers(users: StudentUser[]) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
}

export function getCurrentUser(): StudentUser | null {
  const users = getAllUsers();
  try {
    const currentId = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId && currentId !== 'logged_out' && currentId !== 'guest') {
      const found = users.find((u) => u.id === currentId);
      if (found) return found;
    }
    if (currentId === 'logged_out' || currentId === 'guest') {
      return null;
    }
  } catch (e) {
    console.warn('Error fetching current user ID:', e);
  }
  return null;
}

export function continueAsGuest(): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, 'guest');
    notifyAuthListeners(null);
  } catch (e) {
    console.error('Error setting guest mode:', e);
  }
}

export function isGuestMode(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID) === 'guest';
  } catch {
    return false;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: StudentUser; error?: string }> {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!targetUser) {
    return {
      success: false,
      error: 'No student account found with this email. Please sign up first.',
    };
  }

  const inputHash = await hashPassword(password);
  const defaultHash = await getDefaultPasswordHash();

  if (targetUser.passwordHash !== inputHash && targetUser.passwordHash !== defaultHash && password !== 'student123') {
    return {
      success: false,
      error: 'Incorrect password. (For demo accounts, use "student123")',
    };
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, targetUser.id);
  notifyAuthListeners(targetUser);

  return {
    success: true,
    user: targetUser,
  };
}

export async function signUpUser(
  payload: SignUpPayload
): Promise<{ success: boolean; user?: StudentUser; error?: string }> {
  const users = getAllUsers();
  const cleanEmail = payload.email.trim().toLowerCase();

  if (!payload.name.trim()) {
    return { success: false, error: 'Full Name is required.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please log in instead.',
    };
  }

  const colors = ['bg-indigo-600', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-teal-600', 'bg-rose-600'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  const pHash = await hashPassword(payload.password);

  const newUser: StudentUser = {
    id: 'usr-' + Date.now(),
    name: payload.name.trim(),
    email: cleanEmail,
    passwordHash: pHash,
    college: payload.college.trim() || 'Engineering Institute',
    graduationYear: payload.graduationYear || '2026',
    targetRole: payload.targetRole || 'Software Development Engineer (SDE-1)',
    targetCompany: payload.targetCompany || 'Top Tech Companies',
    resumeText: payload.resumeText || SAMPLE_RESUME_CS,
    extractedSkills: ['Data Structures & Algorithms', 'Problem Solving', 'Git'],
    streakDays: 1,
    avatarColor,
    createdAt: Date.now(),
  };

  const updatedUsers = [newUser, ...users];
  saveAllUsers(updatedUsers);
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
  notifyAuthListeners(newUser);

  return {
    success: true,
    user: newUser,
  };
}

export function logoutUser(): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER_ID, 'logged_out');
    notifyAuthListeners(null);
  } catch (e) {
    console.error('Error logging out:', e);
  }
}

export function updateUserProfile(updates: Partial<StudentUser>): StudentUser | null {
  const current = getCurrentUser();
  if (!current) return null;

  const users = getAllUsers();
  const updatedUser: StudentUser = {
    ...current,
    ...updates,
  };

  const updatedUsers = users.map((u) => (u.id === current.id ? updatedUser : u));
  saveAllUsers(updatedUsers);
  notifyAuthListeners(updatedUser);
  return updatedUser;
}

// Convert StudentUser to StudentProfile for App views
export function userToProfile(user: StudentUser): StudentProfile {
  return {
    name: user.name,
    college: user.college,
    graduationYear: user.graduationYear,
    targetRole: user.targetRole,
    targetCompany: user.targetCompany,
    resumeText: user.resumeText,
    extractedSkills: user.extractedSkills,
    streakDays: user.streakDays,
  };
}

// Simple pub-sub listener
type AuthListener = (user: StudentUser | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function onAuthChange(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthListeners(user: StudentUser | null) {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.warn('Error in auth listener:', e);
    }
  });
}
