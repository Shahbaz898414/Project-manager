import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhNY1ijIHiRGKIQJ8Hdxk3yy72YGY0o2M",
  authDomain: "project-fair-dcc65.firebaseapp.com",
  projectId: "project-fair-dcc65",
  storageBucket: "project-fair-dcc65.appspot.com",
  messagingSenderId: "857486269885",
  appId: "1:857486269885:web:3526454d67ea631c66c6d4",
  measurementId: "G-MYZ6QE3RMR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

const db=getFirestore(app);

const storage = getStorage(app);

const updateUserDatabase = async (user,uid)=> {
  if(typeof user !=="object") return;
  const docRef= doc(db,"user",uid);
  await setDoc(docRef,{ ...user, uid });
};

const getUserFromDatabase = async(uid) => {

  const docRef = doc(db,"user",uid);
  const res = await getDoc(docRef);
  if(!res.exists()) return null;

  return res.data();
  // return res;
};

const uploadImage =(file, progressCallback, urlCallback, errorCallback)=>{
  if (!file) {
    errorCallback("File not found");
    return;
  }

  const fileType = file.type;
  const fileSize = file.size / 1024 / 1024;

  if (!fileType.includes("image")) {
    errorCallback("File must an image");
    return;
  }
  if (fileSize > 2) {
    errorCallback("File must smaller than 2MB");
    return;
  }

  const storageRef = ref(storage, `images/${file.name}`);

  const task = uploadBytesResumable(storageRef, file);

  task.on('state_changed',(snapshot)=>{
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressCallback(progress);
  },error=>{
    errorCallback(error.message);
  },()=>{
    getDownloadURL(storageRef).then((url) => {
      urlCallback(url);
    });
  })
}

const addProjectInDatabase = async (project) => {
  if (typeof project !== "object") return;

  const collectionRef = collection(db, "projects");
  await addDoc(collectionRef, { ...project });
};

const updateProjectInDatabase = async (project, pid) => {
  if (typeof project !== "object") return;

  const docRef = doc(db, "projects", pid);
  await setDoc(docRef, { ...project });
};


const getAllProjects = async () => {
  return await getDocs(collection(db, "projects"));
};

const getAllProjectsForUser = async (uid) => {
  if (!uid) return;

  const collectionRef = collection(db, "projects");
  const condition = where("refUser", "==", uid);
  const dbQuery = query(collectionRef, condition);

  return await getDocs(dbQuery);
};

const deleteProject = async (pid) => {
  const docRef = doc(db, "projects", pid);
  await deleteDoc(docRef);
};


export {
  app as default,
  auth,
  db,
  updateUserDatabase,
  getUserFromDatabase,
  uploadImage,
  addProjectInDatabase,
  updateProjectInDatabase,
  getAllProjects,
  getAllProjectsForUser,
  deleteProject,
};