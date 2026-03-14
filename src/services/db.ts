import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  async getDocument<T>(path: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, path, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
      return null;
    }
  },

  async getCollection<T>(path: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const colRef = collection(db, path);
      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeCollection<T>(path: string, constraints: QueryConstraint[], callback: (data: T[]) => void) {
    const colRef = collection(db, path);
    const q = query(colRef, ...constraints);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async setDocument(path: string, id: string, data: any) {
    try {
      await setDoc(doc(db, path, id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${id}`);
    }
  },

  async updateDocument(path: string, id: string, data: any) {
    try {
      await updateDoc(doc(db, path, id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  },

  async deleteDocument(path: string, id: string) {
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  },

  async seedData() {
    const tracks = [
      { id: 'beginner', name: 'Beginner Track', description: 'Master the basics of programming and simple algorithms.', order: 1 },
      { id: 'intermediate', name: 'Intermediate Track', description: 'Dive deeper into data structures and complex algorithms.', order: 2 },
      { id: '30days', name: '30 Days Coding Challenge', description: 'One problem a day to build consistency.', order: 3 },
      { id: 'intermediate-30days', name: '30 Days Intermediate Track', description: 'A rigorous 30-day challenge for intermediate competitive programmers.', order: 4 }
    ];

    const problems = [
      { id: 'p1', title: 'Watermelon', platform: 'Codeforces', problem_link: 'https://codeforces.com/problemset/problem/4/A', difficulty: '800', track_id: 'beginner', day_number: 1, is_locked: false, tags: ['implementation'] },
      { id: 'p2', title: 'Way Too Long Words', platform: 'Codeforces', problem_link: 'https://codeforces.com/problemset/problem/71/A', difficulty: '800', track_id: 'beginner', day_number: 2, is_locked: false, tags: ['strings'] },
      { id: 'p3', title: 'Next Round', platform: 'Codeforces', problem_link: 'https://codeforces.com/problemset/problem/158/A', difficulty: '800', track_id: 'beginner', day_number: 3, is_locked: false, tags: ['implementation'] },
      { id: 'p4', title: 'Two Sum', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/TWOSUM', difficulty: 'Easy', track_id: '30days', day_number: 1, is_locked: false, tags: ['array'] },
      
      // Day 1 - Intermediate 30 Days
      { id: 'i30-d1-1', title: 'Hello World', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1000', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['basics'] },
      { id: 'i30-d1-2', title: 'Extremely Basic', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1001', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['basics'] },
      { id: 'i30-d1-3', title: 'Area of a Circle', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1002', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['math'] },
      { id: 'i30-d1-4', title: 'HJJ', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/HJJ', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['logic'] },
      { id: 'i30-d1-5', title: 'Even, Odd, Positive and Negative', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/C', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['math'] },
      { id: 'i30-d1-6', title: 'Multiplication Table', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/F', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['math'] },
      { id: 'i30-d1-7', title: 'Factorial', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/G', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['math'] },
      { id: 'i30-d1-8', title: 'BAKECAKE1', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/BAKECAKE1', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['logic'] },
      { id: 'i30-d1-9', title: 'T-shirt', platform: 'AtCoder', problem_link: 'https://atcoder.jp/contests/abc242/tasks/abc242_a', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['math'] },
      { id: 'i30-d1-10', title: 'Palindrome', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/I', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 1, is_locked: false, tags: ['strings'] },

      // Day 2
      { id: 'i30-d2-1', title: 'Sphere', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1011', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-2', title: 'Banknotes', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1018', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-3', title: 'Banknotes and Coins', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1021', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-4', title: 'Find Remainder', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/FLOW002', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-5', title: 'The Cheaper Cab', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/CABS', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['logic'] },
      { id: 'i30-d2-6', title: 'First and Last Digit', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/FLOW004', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-7', title: 'Id and Ship', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/CHOPRT', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['logic'] },
      { id: 'i30-d2-8', title: 'Coordinates of a Point', platform: 'Beecrowd', problem_link: 'https://judge.beecrowd.com/en/problems/view/1041', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['math'] },
      { id: 'i30-d2-9', title: 'Capital or Small or Digit', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/M', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 2, is_locked: false, tags: ['logic'] },

      // Day 3
      { id: 'i30-d3-1', title: 'Char', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/N', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['logic'] },
      { id: 'i30-d3-2', title: 'Janmansh and Assignments', platform: 'CodeChef', problem_link: 'https://www.codechef.com/problems/JASSIGNMENTS', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['logic'] },
      { id: 'i30-d3-3', title: 'Way Too Long Words', platform: 'Codeforces', problem_link: 'https://codeforces.com/problemset/problem/71/A', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['strings'] },
      { id: 'i30-d3-4', title: 'Shout Everyday', platform: 'AtCoder', problem_link: 'https://atcoder.jp/contests/abc367/tasks/abc367_a', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['logic'] },
      { id: 'i30-d3-5', title: 'New Generation ABC', platform: 'AtCoder', problem_link: 'https://atcoder.jp/contests/abc318/tasks/abc318_a?lang=en', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['logic'] },
      { id: 'i30-d3-6', title: 'Fair Distribution', platform: 'Toph', problem_link: 'https://toph.co/p/fair-distribution', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['math'] },
      { id: 'i30-d3-7', title: 'First digit !', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/P', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['math'] },
      { id: 'i30-d3-8', title: 'Interval', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/S', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 3, is_locked: false, tags: ['math'] },

      // Day 4
      { id: 'i30-d4-1', title: 'The last 2 digits', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/Y', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['math'] },
      { id: 'i30-d4-2', title: 'Hard Compare', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/Z', difficulty: 'Medium', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['math'] },
      { id: 'i30-d4-3', title: '1 to N', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/A', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['loops'] },
      { id: 'i30-d4-4', title: 'Even Numbers', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/C', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['loops'] },
      { id: 'i30-d4-5', title: 'Max', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/E', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['loops'] },
      { id: 'i30-d4-6', title: 'Factorial', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/G', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['loops'] },
      { id: 'i30-d4-7', title: 'Bear and Big Brother', platform: 'Codeforces', problem_link: 'https://codeforces.com/problemset/problem/791/A', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['loops'] },
      { id: 'i30-d4-8', title: 'One Prime', platform: 'Codeforces', problem_link: 'https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/H', difficulty: 'Easy', track_id: 'intermediate-30days', day_number: 4, is_locked: false, tags: ['math'] }
    ];

    for (const track of tracks) {
      await this.setDocument('tracks', track.id, { name: track.name, description: track.description, order: track.order });
    }
    for (const problem of problems) {
      await this.setDocument('problems', problem.id, problem);
    }
  }
};
