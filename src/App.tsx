import React, { useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_CHALLENGES, 
  INITIAL_BADGES, 
  INITIAL_LOGS,
  INITIAL_FEED_POSTS,
  INITIAL_DIRECT_MESSAGES
} from './data/mockData';
import { Student, Challenge, ActivityLog, FeedPost, FeedCategory, DirectMessage } from './types';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { SimpleLogin } from './components/SimpleLogin';
import { CampusDashboard } from './components/HouseLeaderboard';
import { LogActivityModal } from './components/LogActivityModal';
import { PersonalDashboard } from './components/PersonalDashboard';
import { CommunityFeed } from './components/CommunityFeed';
import { CertificateModal } from './components/CertificateModal';
import { RewardsStore } from './components/RewardsStore';
import { SupportView } from './components/SupportView';
import { ReportIssueView } from './components/ReportIssueView';
import { RequestCredentialsModal } from './components/RequestCredentialsModal';
import { AboutUsView } from './components/AboutUsView';

import { WelcomeBanner } from './components/WelcomeBanner';
import { RedeemGiftCardsModal } from './components/RedeemGiftCardsModal';
import { BadgeProgressTracker } from './components/BadgeProgressTracker';
import { AdminBinDiagnosticModal } from './components/AdminBinDiagnosticModal';
import { TrueAdminPortalModal } from './components/TrueAdminPortalModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NetworkViewModal } from './components/NetworkViewModal';
import { DirectMessagesModal } from './components/DirectMessagesModal';

import { 
  syncStudents, 
  saveStudentToFirestore, 
  syncLogs, 
  saveLogToFirestore, 
  syncFeedPosts, 
  saveFeedPostToFirestore,
  deleteFeedPostFromFirestore,
  fetchLatestFeedPostsFromFirestore,
  seedFirestoreIfEmpty,
  syncDirectMessages,
  saveDirectMessageToFirestore,
  updateMessageReactionInFirestore,
  markDirectMessageAsReadInFirestore
} from './lib/firebaseSync';
import { Shield, MessageSquare, Send, Sparkles } from 'lucide-react';
import { GateScreen } from './components/GateScreen';
import { StaiWorldsSection } from './components/StaiWorldsSection';
import { FutureLabSimulator } from './components/FutureLabSimulator';
import { BuildTheFutureVote } from './components/BuildTheFutureVote';
import { StaiCountdown } from './components/StaiCountdown';
import { StudentLeaderboard } from './components/StudentLeaderboard';
import { isSoundEnabled, setSoundEnabled, playSound } from './utils/soundFx';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('verdetech_students') || localStorage.getItem('ecopoints_students');
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed: Student[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const allowedGrNos = new Set(['83502', 'ECO-835902', '835902', '266136', 'ECO-266136', '174404', 'ECO-174404']);
        const cleaned = parsed.map((s) => {
          if (s.grNo === 'ECO-835902' || s.grNo === '835902') {
            return { ...s, grNo: '83502', avatarUrl: s.avatarUrl || '/laxman_sree_ram.jpg' };
          }
          if (s.grNo === 'ECO-266136') {
            return { ...s, grNo: '266136' };
          }
          return s;
        }).filter((s) => allowedGrNos.has(s.grNo));

        // Ensure 83502 and 266136 are present
        const has83502 = cleaned.some((s) => s.grNo === '83502');
        const has266 = cleaned.some((s) => s.grNo === '266136');
        if (!has83502) cleaned.unshift(INITIAL_STUDENTS[0]);
        if (!has266) cleaned.push(INITIAL_STUDENTS[1]);
        return cleaned;
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('verdetech_logs') || localStorage.getItem('ecopoints_logs');
    if (!saved) return INITIAL_LOGS;
    try {
      const parsed: ActivityLog[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem('verdetech_feed_posts') || localStorage.getItem('ecopoints_feed_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_FEED_POSTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showGate, setShowGate] = useState<boolean>(true);
  const [soundEnabled, setSoundState] = useState<boolean>(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundState(next);
    setSoundEnabled(next);
  };

  const handleEnterGate = () => {
    setShowGate(false);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('verdetech_gate_entered', 'true');
    }
  };
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isRequestCredentialsModalOpen, setIsRequestCredentialsModalOpen] = useState<boolean>(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isTrueAdminOpen, setIsTrueAdminOpen] = useState<boolean>(false);
  const [certificateFocusStudent, setCertificateFocusStudent] = useState<Student | null>(null);
  const [selectedChallengePreFill, setSelectedChallengePreFill] = useState<Challenge | null>(null);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState<boolean>(false);
  const [networkModalInitialTab, setNetworkModalInitialTab] = useState<'suggestions' | 'following' | 'followers'>('suggestions');

  // Instagram-style Direct Messages State
  const [isDirectMessagesModalOpen, setIsDirectMessagesModalOpen] = useState<boolean>(false);
  const [directMessagesInitialRecipientId, setDirectMessagesInitialRecipientId] = useState<string | null>(null);


  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem('verdetech_direct_messages');
    if (!saved) return INITIAL_DIRECT_MESSAGES;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DIRECT_MESSAGES;
    } catch {
      return INITIAL_DIRECT_MESSAGES;
    }
  });

  // Calculate unread direct messages count
  const unreadDirectMessagesCount = useMemo(() => {
    if (!currentStudent) return 0;
    return directMessages.filter((m) => m.receiverId === currentStudent.grNo && !m.read).length;
  }, [directMessages, currentStudent]);

  // Sync direct messages in real time with Firestore
  useEffect(() => {
    if (!currentStudent) return;
    const unsub = syncDirectMessages(currentStudent.grNo, (remoteMsgs) => {
      setDirectMessages((prev) => {
        const map = new Map<string, DirectMessage>();
        prev.forEach((m) => map.set(m.id, m));
        remoteMsgs.forEach((m) => map.set(m.id, m));
        return Array.from(map.values()).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    });
    return () => unsub();
  }, [currentStudent?.grNo]);

  // Save to localStorage for resilient offline persistence
  useEffect(() => {
    localStorage.setItem('verdetech_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  const handleSendDirectMessage = (receiverStudent: Student, text: string) => {
    if (!currentStudent) return;
    const sortedIds = [currentStudent.grNo, receiverStudent.grNo].sort();
    const convId = `${sortedIds[0]}_${sortedIds[1]}`;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId: convId,
      senderId: currentStudent.grNo,
      senderName: currentStudent.name,
      senderUsername: currentStudent.username || currentStudent.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      senderAvatar: currentStudent.avatarUrl,
      receiverId: receiverStudent.grNo,
      receiverName: receiverStudent.name,
      receiverUsername: receiverStudent.username || receiverStudent.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      receiverAvatar: receiverStudent.avatarUrl,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setDirectMessages((prev) => [...prev, newMsg]);
    saveDirectMessageToFirestore(newMsg);
  };

  const handleReactToDirectMessage = (messageId: string, reaction: string | null) => {
    setDirectMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reaction: reaction || undefined } : m))
    );
    updateMessageReactionInFirestore(messageId, reaction);
  };

  const handleMarkDirectMessageAsRead = (messageId: string) => {
    setDirectMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
    markDirectMessageAsReadInFirestore(messageId);
  };

  const handleOpenDirectMessages = (recipient?: Student | string | null) => {
    if (recipient) {
      const recipientId = typeof recipient === 'string' ? recipient : recipient.grNo;
      setDirectMessagesInitialRecipientId(recipientId);
    } else {
      setDirectMessagesInitialRecipientId(null);
    }
    setIsDirectMessagesModalOpen(true);
  };

  const handleToggleFollow = (targetGrNo: string) => {
    if (!currentStudent) {
      alert('Please sign in to follow and connect with peers.');
      return;
    }
    if (currentStudent.grNo === targetGrNo) return;

    const targetStudent = students.find((s) => s.grNo === targetGrNo);
    if (!targetStudent) return;

    const myFollowing = [...(currentStudent.following || [])];
    const isCurrentlyFollowing = myFollowing.includes(targetGrNo);
    const targetFollowRequests = [...(targetStudent.followRequests || [])];
    const isCurrentlyRequested = targetFollowRequests.includes(currentStudent.grNo);

    if (isCurrentlyFollowing) {
      // Unfollow
      const updatedMyFollowing = myFollowing.filter((g) => g !== targetGrNo);
      const updatedCurrentStudent = {
        ...currentStudent,
        following: updatedMyFollowing,
      };

      setCurrentStudent(updatedCurrentStudent);
      saveStudentToFirestore(updatedCurrentStudent);

      setStudents((prev) =>
        prev.map((s) => {
          if (s.grNo === targetGrNo) {
            const targetFollowers = (s.followers || []).filter((g) => g !== currentStudent.grNo);
            const updatedTarget = { ...s, followers: targetFollowers };
            saveStudentToFirestore(updatedTarget);
            return updatedTarget;
          }
          if (s.grNo === currentStudent.grNo) {
            return updatedCurrentStudent;
          }
          return s;
        })
      );
    } else if (isCurrentlyRequested) {
      // Cancel pending follow request
      setStudents((prev) =>
        prev.map((s) => {
          if (s.grNo === targetGrNo) {
            const updatedRequests = (s.followRequests || []).filter((g) => g !== currentStudent.grNo);
            const updatedTarget = { ...s, followRequests: updatedRequests };
            saveStudentToFirestore(updatedTarget);
            return updatedTarget;
          }
          return s;
        })
      );
    } else {
      // Check target privacy setting ('direct' | 'request' | 'private')
      const targetPrivacy = targetStudent.followPrivacy || 'direct';

      if (targetPrivacy === 'request' || targetPrivacy === 'private') {
        // Send follow request
        setStudents((prev) =>
          prev.map((s) => {
            if (s.grNo === targetGrNo) {
              const updatedRequests = Array.from(new Set([...(s.followRequests || []), currentStudent.grNo]));
              const updatedTarget = { ...s, followRequests: updatedRequests };
              saveStudentToFirestore(updatedTarget);
              return updatedTarget;
            }
            return s;
          })
        );
      } else {
        // Direct follow
        const updatedMyFollowing = [...myFollowing, targetGrNo];
        const updatedCurrentStudent = {
          ...currentStudent,
          following: updatedMyFollowing,
        };

        setCurrentStudent(updatedCurrentStudent);
        saveStudentToFirestore(updatedCurrentStudent);

        setStudents((prev) =>
          prev.map((s) => {
            if (s.grNo === targetGrNo) {
              const targetFollowers = Array.from(new Set([...(s.followers || []), currentStudent.grNo]));
              const updatedTarget = { ...s, followers: targetFollowers };
              saveStudentToFirestore(updatedTarget);
              return updatedTarget;
            }
            if (s.grNo === currentStudent.grNo) {
              return updatedCurrentStudent;
            }
            return s;
          })
        );
      }
    }
  };

  const handleAcceptFollowRequest = (requesterGrNo: string) => {
    if (!currentStudent) return;
    const updatedRequests = (currentStudent.followRequests || []).filter((id) => id !== requesterGrNo);
    const updatedFollowers = Array.from(new Set([...(currentStudent.followers || []), requesterGrNo]));
    const updatedCurrentStudent = {
      ...currentStudent,
      followRequests: updatedRequests,
      followers: updatedFollowers,
    };

    setCurrentStudent(updatedCurrentStudent);
    saveStudentToFirestore(updatedCurrentStudent);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.grNo === currentStudent.grNo) return updatedCurrentStudent;
        if (s.grNo === requesterGrNo) {
          const updatedRequester = {
            ...s,
            following: Array.from(new Set([...(s.following || []), currentStudent.grNo])),
          };
          saveStudentToFirestore(updatedRequester);
          return updatedRequester;
        }
        return s;
      })
    );
  };

  const handleDeclineFollowRequest = (requesterGrNo: string) => {
    if (!currentStudent) return;
    const updatedRequests = (currentStudent.followRequests || []).filter((id) => id !== requesterGrNo);
    const updatedCurrentStudent = {
      ...currentStudent,
      followRequests: updatedRequests,
    };

    setCurrentStudent(updatedCurrentStudent);
    saveStudentToFirestore(updatedCurrentStudent);

    setStudents((prev) =>
      prev.map((s) => (s.grNo === currentStudent.grNo ? updatedCurrentStudent : s))
    );
  };

  const handleOpenCertificateModal = (student?: Student) => {
    setCertificateFocusStudent(student || currentStudent);
    setIsCertificateModalOpen(true);
  };

  // Sync state to localStorage for offline cache
  useEffect(() => {
    localStorage.setItem('verdetech_students', JSON.stringify(students));
    localStorage.setItem('ecopoints_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('verdetech_logs', JSON.stringify(logs));
    localStorage.setItem('ecopoints_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('verdetech_feed_posts', JSON.stringify(feedPosts));
    localStorage.setItem('ecopoints_feed_posts', JSON.stringify(feedPosts));
  }, [feedPosts]);

  useEffect(() => {
    // Ensure website load always starts fresh without auto-logging into an account
    localStorage.removeItem('verdetech_current_student');
    localStorage.removeItem('ecopoints_current_student');
  }, []);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('verdetech_current_student', JSON.stringify(currentStudent));
      localStorage.setItem('ecopoints_current_student', JSON.stringify(currentStudent));
    } else {
      localStorage.removeItem('verdetech_current_student');
      localStorage.removeItem('ecopoints_current_student');
    }
  }, [currentStudent]);

  // Real-time Firestore synchronization
  useEffect(() => {
    // Ensure initial documents exist in Firestore if database was empty
    seedFirestoreIfEmpty(INITIAL_STUDENTS, INITIAL_LOGS, INITIAL_FEED_POSTS);

    const unsubStudents = syncStudents((remoteStudents) => {
      setStudents((prev) => {
        const map = new Map<string, Student>();
        prev.forEach((s) => map.set(s.grNo, s));
        remoteStudents.forEach((s) => map.set(s.grNo, { ...map.get(s.grNo), ...s }));
        return Array.from(map.values());
      });
    });

    const unsubLogs = syncLogs((remoteLogs) => {
      setLogs((prev) => {
        const map = new Map<string, ActivityLog>();
        prev.forEach((l) => map.set(l.id, l));
        remoteLogs.forEach((l) => map.set(l.id, { ...map.get(l.id), ...l }));
        return Array.from(map.values());
      });
    });

    const unsubFeed = syncFeedPosts((remotePosts) => {
      if (remotePosts && remotePosts.length > 0) {
        setFeedPosts(remotePosts);
      }
    });

    return () => {
      unsubStudents();
      unsubLogs();
      unsubFeed();
    };
  }, []);

  // Pure derived ranks and points using useMemo - completely avoids re-render loops and setState in useEffect
  const rankedStudents = useMemo(() => {
    const listWithMetrics = students.map((s) => {
      const approvedLogs = logs.filter(
        (l) => (l.grNo === s.grNo || (s.grNo === '83502' && (l.grNo === 'ECO-835902' || l.grNo === '835902'))) && l.status === 'Approved'
      );
      const approvedPoints = approvedLogs.reduce((acc, l) => acc + (l.pointsEarned || 0), 0);
      const co2 = Number(approvedLogs.reduce((acc, l) => acc + (l.co2SavedKg || 0), 0).toFixed(1));
      const water = Number(approvedLogs.reduce((acc, l) => acc + (l.waterSavedLiters || 0), 0).toFixed(1));
      const waste = Number(approvedLogs.reduce((acc, l) => acc + (l.wasteDivertedKg || 0), 0).toFixed(1));
      const energy = Number(approvedLogs.reduce((acc, l) => acc + (l.energySavedKwh || 0), 0).toFixed(1));

      const minExpected = (s.grNo === '83502' || s.grNo === 'ECO-835902' || s.grNo === '835902') ? 13000 : (s.grNo === '266136' || s.grNo === 'ECO-266136') ? 10000 : 0;
      const points = Math.max(s.points || 0, approvedPoints, minExpected);
      const weeklyPoints = Math.max(s.weeklyPoints || 0, approvedPoints, minExpected);

      const updatedBadges = [...(s.badges || [])];
      if (points >= 1000 && !updatedBadges.includes('badge-century')) {
        updatedBadges.push('badge-century');
      }

      return {
        ...s,
        points,
        weeklyPoints,
        co2SavedKg: Math.max(s.co2SavedKg || 0, co2),
        waterSavedLiters: Math.max(s.waterSavedLiters || 0, water),
        wasteDivertedKg: Math.max(s.wasteDivertedKg || 0, waste),
        energySavedKwh: Math.max(s.energySavedKwh || 0, energy),
        badges: updatedBadges,
      };
    });

    const sorted = listWithMetrics.sort((a, b) => (b.points || 0) - (a.points || 0));
    return sorted.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [students, logs]);

  // Derived current student with accurate live rank and live metrics
  const activeStudent = useMemo(() => {
    if (!currentStudent) return null;
    const found = rankedStudents.find((s) => s.grNo === currentStudent.grNo);
    return found ? { ...currentStudent, ...found } : currentStudent;
  }, [currentStudent, rankedStudents]);

  // Handler for adding a new log activity (starts as Pending Verification)
  const handleSubmitNewActivity = (newLog: ActivityLog) => {
    setLogs((prev) => [newLog, ...prev]);
    saveLogToFirestore(newLog);

    // Automatically post eco achievements to ECOFEED so the feed is updated regularly
    const categoryMap: Record<string, FeedCategory> = {
      Recycling: '♻️ Recycling & Upcycling',
      Waste: '♻️ Recycling & Upcycling',
      Energy: '💡 Energy Saving',
      Transport: '🚴 Clean Commute',
      Nature: '🌱 Nature & Planting',
      Water: '🌍 Everyday Green Doing',
      Digital: '💡 Energy Saving',
    };

    const feedCat: FeedCategory = categoryMap[newLog.category] || '🌍 Everyday Green Doing';
    const autoFeedPost: FeedPost = {
      id: `post-act-${newLog.id}-${Date.now()}`,
      grNo: newLog.grNo,
      authorName: newLog.studentName,
      authorRole: currentStudent?.role || 'Student',
      authorAvatar: currentStudent?.avatarUrl,
      title: newLog.challengeTitle,
      content: newLog.proofNote
        ? `${newLog.challengeTitle}: ${newLog.proofNote} (+${newLog.pointsEarned} eco pts)`
        : `Completed ${newLog.challengeTitle} (${newLog.quantity} ${newLog.unitLabel}) for +${newLog.pointsEarned} Verde Points!`,
      category: feedCat,
      doingTag: newLog.challengeTitle,
      photoUrl: newLog.proofImageUrl,
      location: 'Campus Green Station',
      timestamp: new Date().toISOString(),
      reactions: { cheer: 1, fire: 0, leaf: 1, lightbulb: 0 },
      comments: [],
    };

    setFeedPosts((prev) => [autoFeedPost, ...prev]);
    saveFeedPostToFirestore(autoFeedPost);
  };

  // Handler for reacting to log posts (Cheer, Fire, Leaf)
  const handleReactToLog = (logId: string, reactionType: 'cheer' | 'fire' | 'leaf') => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const currentCount = log.reactions?.[reactionType] || 0;
          const isAlreadyReacted = log.userReacted?.[reactionType];
          
          const updatedReactions = {
            ...log.reactions,
            [reactionType]: isAlreadyReacted ? Math.max(0, currentCount - 1) : currentCount + 1,
          };

          return {
            ...log,
            reactions: updatedReactions,
            userReacted: {
              ...log.userReacted,
              [reactionType]: !isAlreadyReacted,
            },
          };
        }
        return log;
      })
    );
  };

  // Handler for approving logs in Admin view - THIS credits points to student
  const handleApproveLog = (logId: string, bonusPts: number) => {
    const log = logs.find((l) => l.id === logId);
    if (!log) return;

    const finalPoints = log.pointsEarned + bonusPts;
    const verifiedByStr = bonusPts > 0 ? `Teacher / Admin (+${bonusPts} Bonus Approved)` : 'Teacher / Admin Approved';

    setLogs((prev) =>
      prev.map((l) => {
        if (l.id === logId) {
          const updated = {
            ...l,
            pointsEarned: finalPoints,
            status: 'Approved' as const,
            verifiedBy: verifiedByStr,
          };
          saveLogToFirestore(updated);
          return updated;
        }
        return l;
      })
    );
  };

  const handleRejectLog = (logId: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'Rejected', verifiedBy: 'Revision Requested' } : l))
    );
  };

  const handleDeleteLog = (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setCurrentStudent(updatedStudent);
    localStorage.setItem('verdetech_current_student', JSON.stringify(updatedStudent));
    localStorage.setItem('ecopoints_current_student', JSON.stringify(updatedStudent));
    saveStudentToFirestore(updatedStudent);
    setStudents((prev) =>
      prev.map((s) => (s.grNo === updatedStudent.grNo ? updatedStudent : s))
    );
  };

  const handleClearAllLogs = () => {
    setLogs([]);
    localStorage.removeItem('verdetech_logs');
    localStorage.removeItem('ecopoints_logs');
  };

  // Handlers for Community Eco Feed (Peer social doings & interactions)
  const handleAddFeedPost = (
    postData: Omit<FeedPost, 'id' | 'timestamp' | 'reactions' | 'comments'>
  ) => {
    const newPost: FeedPost = {
      ...postData,
      id: `post-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reactions: { cheer: 0, fire: 0, leaf: 0, lightbulb: 0 },
      comments: [],
    };

    setFeedPosts((prev) => [newPost, ...prev]);
    saveFeedPostToFirestore(newPost);
  };

  const handleReactToFeedPost = (
    postId: string,
    reactionType: 'cheer' | 'fire' | 'leaf' | 'lightbulb'
  ) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentCount = post.reactions?.[reactionType] || 0;
          const isAlreadyReacted = post.userReacted?.[reactionType];
          const newCount = isAlreadyReacted ? Math.max(0, currentCount - 1) : currentCount + 1;

          const updatedPost: FeedPost = {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: newCount,
            },
            userReacted: {
              ...post.userReacted,
              [reactionType]: !isAlreadyReacted,
            },
          };
          saveFeedPostToFirestore(updatedPost);
          return updatedPost;
        }
        return post;
      })
    );
  };

  const handleAddFeedComment = (postId: string, commentText: string) => {
    if (!activeStudent) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      grNo: activeStudent.grNo,
      authorName: activeStudent.name,
      authorRole: activeStudent.role || 'Student',
      authorAvatar: activeStudent.avatarUrl,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const updatedPost: FeedPost = {
            ...post,
            comments: [...(post.comments || []), newComment],
          };
          saveFeedPostToFirestore(updatedPost);
          return updatedPost;
        }
        return post;
      })
    );
  };

  const handleDeleteFeedPost = (postId: string) => {
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId));
    deleteFeedPostFromFirestore(postId);
  };

  const handleClearAllFeedPosts = () => {
    setFeedPosts([]);
  };

  const handleRefreshFeed = async () => {
    const latest = await fetchLatestFeedPostsFromFirestore();
    if (latest.length > 0) {
      setFeedPosts(latest);
    }
  };

  const handleOpenLogModalForChallenge = (challenge: Challenge) => {
    setSelectedChallengePreFill(challenge);
    setIsLogModalOpen(true);
  };

  const pendingCount = logs.filter((l) => l.status === 'Pending Verification').length;

  const [welcomeAnimation, setWelcomeAnimation] = useState<{
    type: 'login' | 'register';
    studentName: string;
    username?: string;
  } | null>(null);

  const handleStudentLogin = (student: Student, eventType: 'login' | 'register' = 'login') => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.grNo === student.grNo);
      if (exists) {
        return prev.map((s) =>
          s.grNo === student.grNo
            ? { ...s, ...student }
            : s
        );
      }
      return [...prev, student];
    });

    saveStudentToFirestore(student);
    setCurrentStudent(student);
    localStorage.setItem('verdetech_current_student', JSON.stringify(student));
    localStorage.setItem('ecopoints_current_student', JSON.stringify(student));
    setIsLoginModalOpen(false);

    // Trigger celebratory animation
    setWelcomeAnimation({
      type: eventType,
      studentName: student.name,
      username: student.username || student.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    });
  };

  if (showGate) {
    return (
      <GateScreen
        onEnter={handleEnterGate}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
    );
  }

  if (!currentStudent || !activeStudent) {
    return (
      <>
        {welcomeAnimation && (
          <WelcomeBanner
            type={welcomeAnimation.type}
            studentName={welcomeAnimation.studentName}
            username={welcomeAnimation.username}
            onDismiss={() => setWelcomeAnimation(null)}
          />
        )}
        <SimpleLogin
          students={rankedStudents}
          onLogin={(student) => handleStudentLogin(student, 'login')}
          onRegisterClick={() => setIsLoginModalOpen(true)}
          onRequestCredentialsClick={() => setIsRequestCredentialsModalOpen(true)}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          students={rankedStudents}
          onLogin={(student) => handleStudentLogin(student, 'register')}
        />
        <RequestCredentialsModal
          isOpen={isRequestCredentialsModalOpen}
          onClose={() => setIsRequestCredentialsModalOpen(false)}
          students={rankedStudents}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 relative selection:bg-cyan-500 selection:text-black font-body overflow-x-hidden">
      {/* Global STAI Cosmic Atmosphere Layer */}
      <div className="atmos-bg" aria-hidden="true">
        <div className="atmos-grid"></div>
        <div className="atmos-lines"></div>
      </div>

      {/* STAI Opening Screen / Gate */}
      {showGate && (
        <GateScreen
          onEnter={handleEnterGate}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Animated Welcome Banner on Login or Registration */}
      {welcomeAnimation && (
        <WelcomeBanner
          type={welcomeAnimation.type}
          studentName={welcomeAnimation.studentName}
          username={welcomeAnimation.username}
          onDismiss={() => setWelcomeAnimation(null)}
        />
      )}
      
      {/* Top Navbar */}
      <Navbar
        currentStudent={activeStudent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenLogModal={() => {
          setSelectedChallengePreFill(null);
          setIsLogModalOpen(true);
        }}
        onOpenCertificateModal={() => handleOpenCertificateModal()}
        onOpenReportIssue={() => setActiveTab('report-issue')}
        onOpenRequestCredentials={() => setIsRequestCredentialsModalOpen(true)}
        onOpenRedeemGiftCards={() => setIsRedeemModalOpen(true)}
        onOpenDirectMessages={() => handleOpenDirectMessages()}
        unreadMessagesCount={unreadDirectMessagesCount}
        onLogout={() => {
          localStorage.removeItem('verdetech_current_student');
          localStorage.removeItem('ecopoints_current_student');
          setCurrentStudent(null);
          setIsLoginModalOpen(false);
        }}
        pendingVerificationCount={pendingCount}
        onOpenGate={() => setShowGate(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <CampusDashboard
              students={rankedStudents}
              currentStudent={activeStudent}
              logs={logs}
              onUpdateStudent={handleUpdateStudent}
              onOpenCertificateModal={(student) => handleOpenCertificateModal(student)}
            />
          </div>
        )}



        {/* 07 · ECO FEED */}
        {activeTab === 'feed' && (
          <CommunityFeed
            posts={feedPosts}
            currentStudent={activeStudent}
            students={rankedStudents}
            onAddPost={handleAddFeedPost}
            onReactToPost={handleReactToFeedPost}
            onAddComment={handleAddFeedComment}
            onDeletePost={handleDeleteFeedPost}
            onClearAllPosts={handleClearAllFeedPosts}
            onRefreshFeed={handleRefreshFeed}
            onSelectStudent={(st) => setSelectedProfileStudent(st)}
            onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
          />
        )}

        {/* 08 · REWARDS STORE */}
        {activeTab === 'rewards' && (
          <RewardsStore
            currentStudent={activeStudent}
            onUpdateStudent={handleUpdateStudent}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'badges' && (
          <BadgeProgressTracker
            currentStudent={activeStudent}
            logs={logs}
            badges={INITIAL_BADGES}
            onOpenLogModal={() => setIsLogModalOpen(true)}
          />
        )}

        {/* 09 · ABOUT US */}
        {activeTab === 'about' && (
          <AboutUsView
            currentStudent={activeStudent}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {(activeTab === 'support' || activeTab === 'report-issue') && (
          <SupportView 
            currentStudent={activeStudent}
            onOpenCredentials={() => setIsRequestCredentialsModalOpen(true)}
          />
        )}

        {activeTab === 'my-profile' && activeStudent && (
          <PersonalDashboard
            currentStudent={activeStudent}
            students={rankedStudents}
            logs={logs}
            badges={INITIAL_BADGES}
            onOpenLogModal={() => setIsLogModalOpen(true)}
            onOpenCertificateModal={() => handleOpenCertificateModal()}
            onUpdateStudent={handleUpdateStudent}
            onAcceptFollowRequest={handleAcceptFollowRequest}
            onDeclineFollowRequest={handleDeclineFollowRequest}
            onOpenDirectMessages={() => handleOpenDirectMessages()}
            unreadMessagesCount={unreadDirectMessagesCount}
            onOpenNetworkModal={(tab) => {
              setNetworkModalInitialTab(tab || 'suggestions');
              setIsNetworkModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        currentStudent={certificateFocusStudent || activeStudent}
        allStudents={rankedStudents}
      />

      {/* Login & GR Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        students={rankedStudents}
        onLogin={(student) => handleStudentLogin(student, 'register')}
      />

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        challenges={INITIAL_CHALLENGES}
        currentStudent={currentStudent}
        selectedChallengePreFill={selectedChallengePreFill}
        onSubmitActivity={handleSubmitNewActivity}
        onOpenRedeemGiftCards={() => setIsRedeemModalOpen(true)}
      />

      {/* Redeem Gift Cards Modal */}
      <RedeemGiftCardsModal
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        currentStudent={activeStudent}
        onRedeemPoints={(points, description) => {
          if (activeStudent) {
            const updated: Student = {
              ...activeStudent,
              points: (activeStudent.points || 0) + points,
              weeklyPoints: (activeStudent.weeklyPoints || 0) + points,
            };
            handleUpdateStudent(updated);
          }
        }}
        onRedeemRewardItem={(newReward) => {
          // Handled and persisted to localStorage for store access
        }}
        onSubmitActivity={handleSubmitNewActivity}
      />

      {/* Request Credentials Modal */}
      <RequestCredentialsModal
        isOpen={isRequestCredentialsModalOpen}
        onClose={() => setIsRequestCredentialsModalOpen(false)}
        students={students}
      />

      {/* STAI Future World Telemetry Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/10 bg-[#040714] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#5ef2ff] animate-pulse" />
              <span className="text-white font-bold font-display text-base tracking-wider uppercase">
                VERDE TECH · ECO PORTAL 2026
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-400">TELEMETRY GRID // ACTIVE</span>
              <span className="text-slate-600">•</span>
              <a 
                href="https://whatsapp.com/channel/0029Vb8TDOm7DAWxqSu3yq0O" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <i className="bi bi-whatsapp"></i>
                <span>Official WhatsApp Channel</span>
              </a>
              <span className="text-slate-600">•</span>
              <button 
                onClick={() => {
                  playSound('click');
                  setShowGate(true);
                }}
                className="text-cyan-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Replay Gate</span>
              </button>
            </div>
          </div>

          {/* Maintenance & Authorized Admin Hardware Consoles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/40 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold uppercase">
                    HARDWARE TELEMETRY
                  </span>
                  <span className="text-white font-semibold text-xs">Smart Bin Diagnostic Center</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Inspect sensor arrays, ultrasonic fill telemetry, and battery calibration.
                </p>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setIsAdminModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 font-mono text-xs font-bold transition-all shrink-0"
              >
                Launch Console
              </button>
            </div>

            <div className="rounded-2xl bg-black/40 border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px] font-bold uppercase">
                    RESTRICTED SECURE
                  </span>
                  <span className="text-white font-semibold text-xs">True Admin Portal</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Authorized personnel authentication, point reconciliation & audit ledger.
                </p>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setIsTrueAdminOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 font-mono text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 pt-4 gap-2">
            <p>© 2026 Verde Tech Systems · Science · Technology · Innovation.</p>
            <p>Verde Tech Sustainability Platform · Environmental Action & Waste Telemetry.</p>
          </div>

        </div>
      </footer>

      {/* Admin Bin Diagnostic Modal */}
      <AdminBinDiagnosticModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* True Admin Portal Modal */}
      <TrueAdminPortalModal
        isOpen={isTrueAdminOpen}
        onClose={() => setIsTrueAdminOpen(false)}
        logs={logs}
        students={students}
      />

      {/* User Profile Modal */}
      {selectedProfileStudent && (
        <UserProfileModal
          student={selectedProfileStudent}
          currentStudent={activeStudent}
          posts={feedPosts}
          onClose={() => setSelectedProfileStudent(null)}
          onToggleFollow={handleToggleFollow}
          onOpenCertificateModal={(st) => handleOpenCertificateModal(st)}
          onOpenDirectMessage={(st) => handleOpenDirectMessages(st)}
        />
      )}

      {/* Network & Connections Modal */}
      <NetworkViewModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        students={rankedStudents}
        currentStudent={activeStudent}
        initialTab={networkModalInitialTab}
        onToggleFollow={handleToggleFollow}
        onSelectStudent={(st) => setSelectedProfileStudent(st)}
        onOpenDirectMessage={(st) => handleOpenDirectMessages(st)}
      />

      {/* Instagram-style Direct Messages Modal */}
      {activeStudent && (
        <DirectMessagesModal
          isOpen={isDirectMessagesModalOpen}
          onClose={() => setIsDirectMessagesModalOpen(false)}
          currentStudent={activeStudent}
          students={rankedStudents}
          messages={directMessages}
          onSendMessage={handleSendDirectMessage}
          onReactToMessage={handleReactToDirectMessage}
          onMarkAsRead={handleMarkDirectMessageAsRead}
          initialRecipientId={directMessagesInitialRecipientId}
          onOpenProfile={(st) => setSelectedProfileStudent(st)}
        />
      )}

    </div>
  );
}
