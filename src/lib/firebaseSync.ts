import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Student, ActivityLog, FeedPost, TeamMemberBio, GiftCard, DirectMessage } from '../types';

export function syncStudents(
  onUpdate: (students: Student[]) => void
) {
  const collectionRef = collection(db, 'students');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteStudents: Student[] = [];
        snapshot.forEach((docSnap) => {
          remoteStudents.push(docSnap.data() as Student);
        });
        if (remoteStudents.length > 0) {
          onUpdate(remoteStudents);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    }
  );

  return unsubscribe;
}

export async function saveStudentToFirestore(student: Student) {
  try {
    const docId = student.grNo.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'students', docId);
    await setDoc(docRef, student, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.grNo}`);
  }
}

export function syncLogs(
  onUpdate: (logs: ActivityLog[]) => void
) {
  const collectionRef = collection(db, 'logs');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteLogs: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          remoteLogs.push(docSnap.data() as ActivityLog);
        });
        if (remoteLogs.length > 0) {
          onUpdate(remoteLogs);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'logs');
    }
  );

  return unsubscribe;
}

export async function saveLogToFirestore(log: ActivityLog) {
  try {
    const docId = log.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'logs', docId);
    await setDoc(docRef, log, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `logs/${log.id}`);
  }
}

export function syncFeedPosts(
  onUpdate: (posts: FeedPost[]) => void
) {
  const collectionRef = collection(db, 'feedPosts');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      const remotePosts: FeedPost[] = [];
      snapshot.forEach((docSnap) => {
        remotePosts.push(docSnap.data() as FeedPost);
      });
      // Always sort newest first so the feed is chronologically updated
      remotePosts.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });
      onUpdate(remotePosts);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'feedPosts');
    }
  );

  return unsubscribe;
}

export async function saveFeedPostToFirestore(post: FeedPost) {
  try {
    const docId = post.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'feedPosts', docId);
    await setDoc(docRef, post, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `feedPosts/${post.id}`);
  }
}

export async function deleteFeedPostFromFirestore(postId: string) {
  try {
    const docId = postId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'feedPosts', docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `feedPosts/${postId}`);
  }
}

export async function fetchLatestFeedPostsFromFirestore(): Promise<FeedPost[]> {
  try {
    const snap = await getDocs(collection(db, 'feedPosts'));
    const remotePosts: FeedPost[] = [];
    snap.forEach((docSnap) => {
      remotePosts.push(docSnap.data() as FeedPost);
    });
    remotePosts.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });
    return remotePosts;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'feedPosts');
    return [];
  }
}

export async function saveIssueToFirestore(issue: {
  id: string;
  name: string;
  email: string;
  category?: string;
  description: string;
  grNo?: string;
  status: string;
  timestamp: string;
}) {
  try {
    const docId = issue.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'issues', docId);
    await setDoc(docRef, issue, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `issues/${issue.id}`);
  }
}

export async function seedFirestoreIfEmpty(
  initialStudents: Student[],
  initialLogs: ActivityLog[],
  initialFeed: FeedPost[]
) {
  try {
    const studentSnap = await getDocs(collection(db, 'students'));
    if (studentSnap.empty && initialStudents.length > 0) {
      console.log('[Firebase] Initializing students collection...');
      for (const s of initialStudents) {
        await saveStudentToFirestore(s);
      }
    }

    const logSnap = await getDocs(collection(db, 'logs'));
    if (logSnap.empty && initialLogs.length > 0) {
      console.log('[Firebase] Initializing logs collection...');
      for (const l of initialLogs) {
        await saveLogToFirestore(l);
      }
    }

    const feedSnap = await getDocs(collection(db, 'feedPosts'));
    if (feedSnap.empty && initialFeed.length > 0) {
      console.log('[Firebase] Initializing feedPosts collection...');
      for (const f of initialFeed) {
        await saveFeedPostToFirestore(f);
      }
    }
  } catch (err) {
    console.warn('[Firebase] Notice during seed check:', err);
  }
}

export function syncTeamBios(onUpdate: (bios: TeamMemberBio[]) => void) {
  const collectionRef = collection(db, 'teamBios');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const remoteBios: TeamMemberBio[] = [];
        snapshot.forEach((docSnap) => {
          remoteBios.push(docSnap.data() as TeamMemberBio);
        });
        if (remoteBios.length > 0) {
          onUpdate(remoteBios);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'teamBios');
    }
  );

  return unsubscribe;
}

export async function saveTeamBioToFirestore(bio: TeamMemberBio) {
  try {
    const docId = bio.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'teamBios', docId);
    await setDoc(docRef, bio, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `teamBios/${bio.id}`);
  }
}

export function syncGiftCards(onUpdate: (cards: GiftCard[]) => void) {
  const collectionRef = collection(db, 'giftCards');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      const cards: GiftCard[] = [];
      snapshot.forEach((docSnap) => {
        cards.push(docSnap.data() as GiftCard);
      });
      onUpdate(cards);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'giftCards');
    }
  );

  return unsubscribe;
}

export async function saveGiftCardToFirestore(card: GiftCard) {
  try {
    const cleanCode = (card.redeemCode || card.code).trim().toUpperCase();
    const docId = cleanCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'giftCards', docId);
    await setDoc(docRef, card, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `giftCards/${card.code}`);
  }
}

export function syncDirectMessages(
  userId: string,
  onUpdate: (messages: DirectMessage[]) => void
) {
  const collectionRef = collection(db, 'direct_messages');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      const msgs: DirectMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DirectMessage;
        if (data && (data.senderId === userId || data.receiverId === userId)) {
          msgs.push(data);
        }
      });
      msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onUpdate(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'direct_messages');
    }
  );

  return unsubscribe;
}

export async function saveDirectMessageToFirestore(message: DirectMessage) {
  try {
    const docId = message.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'direct_messages', docId);
    await setDoc(docRef, message, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `direct_messages/${message.id}`);
  }
}

export async function updateMessageReactionInFirestore(messageId: string, reaction: string | null) {
  try {
    const docId = messageId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'direct_messages', docId);
    await setDoc(docRef, { reaction: reaction || '' }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `direct_messages/${messageId}`);
  }
}

export async function markDirectMessageAsReadInFirestore(messageId: string) {
  try {
    const docId = messageId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const docRef = doc(db, 'direct_messages', docId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `direct_messages/${messageId}`);
  }
}
