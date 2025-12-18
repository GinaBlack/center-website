import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

export const uploadUserAvatar = async (file, uid) => {
  const storage = getStorage();
  const db = getFirestore();

  const avatarRef = ref(storage, `avatars/${uid}.jpg`);

  await uploadBytes(avatarRef, file);
  const downloadURL = await getDownloadURL(avatarRef);

  await updateDoc(doc(db, 'users', uid), {
    photoURL: downloadURL,
  });

  return downloadURL;
};
